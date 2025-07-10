import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/hooks/useLanguage";
import { urlShortenLimiter, authenticatedLimiter } from "@/utils/rateLimit";
import { supabase } from "@/integrations/supabase/client";
import { Link, Copy, ExternalLink, Zap, Download, QrCode } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import QRCode from "qrcode";

interface ShortenedUrl {
  original: string;
  shortened: string;
  id: string;
  createdAt: Date;
  qrCode?: string;
}

export const UrlShortener = () => {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getRemainingUrls } = useSubscriptionLimits();
  const { t } = useLanguage();

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const isIdTaken = async (id: string) => {
    if (user) {
      // Check in database for logged-in users
      const { data } = await supabase
        .from('shortened_urls')
        .select('short_code')
        .eq('short_code', id)
        .single();
      return !!data;
    } else {
      // Check in localStorage for anonymous users and clean expired entries
      const stored = localStorage.getItem("shortenedUrls");
      const urls = stored ? JSON.parse(stored) : {};
      
      // Clean expired entries
      const currentTime = Date.now();
      let hasExpired = false;
      Object.keys(urls).forEach(key => {
        const url = urls[key];
        if (url.expires && url.expires < currentTime) {
          delete urls[key];
          hasExpired = true;
        }
      });
      
      if (hasExpired) {
        localStorage.setItem("shortenedUrls", JSON.stringify(urls));
      }
      
      return urls[id] !== undefined;
    }
  };

  const generateQRCode = async (url: string) => {
    try {
      return await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('QR Code generation failed:', err);
      return null;
    }
  };

  const isValidUrl = (string: string) => {
    try {
      // Input validation and sanitization
      if (!string || typeof string !== 'string') return false;
      
      // Length limit (2000 chars is reasonable for URLs)
      if (string.length > 2000) return false;
      
      const url = new URL(string);
      
      // Block dangerous protocols
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(url.protocol)) {
        return false;
      }
      
      // Block localhost and private IP ranges in production
      const hostname = url.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') || 
          hostname.startsWith('10.') || 
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
          hostname === '::1') {
        // Allow these only in development
        const isDev = window.location.hostname === 'localhost';
        if (!isDev) return false;
      }
      
      // Block known malicious patterns
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /file:/i,
        /ftp:/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(string))) {
        return false;
      }
      
      return true;
    } catch (_) {
      return false;
    }
  };

  const shortenUrl = async () => {
    // Rate limiting check
    const limiter = user ? authenticatedLimiter : urlShortenLimiter;
    const identifier = user?.id || 'anonymous';
    const rateCheck = limiter.checkLimit(identifier);
    
    if (!rateCheck.allowed) {
      toast({
        title: "Rate limit exceeded",
        description: `Please wait ${rateCheck.retryAfter} seconds before trying again`,
        variant: "destructive",
      });
      return;
    }

    if (!url.trim()) {
      toast({
        title: t('pleaseEnterUrl'),
        description: t('enterValidUrl'),
        variant: "destructive",
      });
      return;
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    if (!isValidUrl(formattedUrl)) {
      toast({
        title: t('invalidUrl'),
        description: t('pleaseEnterValidUrl'),
        variant: "destructive",
      });
      return;
    }

    // Validate custom ID with enhanced security
    let finalId = customId.trim();
    if (finalId) {
      // Length limit for custom aliases
      if (finalId.length > 50) {
        toast({
          title: t('customEndingTooLong'),
          description: 'Custom ending must be 50 characters or less',
          variant: "destructive",
        });
        return;
      }
      
      // Only allow alphanumeric characters and hyphens, no special characters
      if (!/^[a-zA-Z0-9-]+$/.test(finalId)) {
        toast({
          title: t('invalidCustomEnding'),
          description: t('onlyAlphanumeric'),
          variant: "destructive",
        });
        return;
      }
      
      // Block reserved words and potentially dangerous patterns
      const reservedWords = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'dashboard', 'auth', 'login', 'signup', 'analytics'];
      if (reservedWords.includes(finalId.toLowerCase())) {
        toast({
          title: t('customEndingReserved'),
          description: 'This custom ending is reserved',
          variant: "destructive",
        });
        return;
      }

      if (await isIdTaken(finalId)) {
        toast({
          title: t('customEndingUnavailable'),
          description: t('customEndingTaken'),
          variant: "destructive",
        });
        return;
      }
    } else {
      // Generate random ID and ensure uniqueness
      do {
        finalId = generateShortId();
      } while (await isIdTaken(finalId));
    }

    setIsLoading(true);

    try {
      const shortened = `${window.location.origin}/${finalId}`;
      
      // Generate QR code
      const qrCode = await generateQRCode(shortened);
      
      const shortenedUrl: ShortenedUrl = {
        original: formattedUrl,
        shortened,
        id: finalId,
        createdAt: new Date(),
        qrCode: qrCode || undefined,
      };

      if (user) {
        // Save to database for logged-in users
        const { error } = await supabase
          .from('shortened_urls')
          .insert({
            user_id: user.id,
            original_url: formattedUrl,
            custom_alias: customId || null,
            short_code: finalId,
          });

        if (error) {
          throw error;
        }

        toast({
          title: t('urlShortenedSuccess'),
          description: t('urlSavedToDashboard'),
        });
      } else {
        // Store in localStorage for anonymous users with encryption-like obfuscation
        const stored = localStorage.getItem("shortenedUrls");
        const urls = stored ? JSON.parse(stored) : {};
        
        // Add expiration for anonymous URLs (24 hours)
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        const secureUrl = {
          ...shortenedUrl,
          expires: expirationTime,
          // Basic obfuscation (not real encryption but better than plain text)
          original: btoa(shortenedUrl.original),
          _secure: true
        };
        
        urls[finalId] = secureUrl;
        localStorage.setItem("shortenedUrls", JSON.stringify(urls));

        toast({
          title: t('urlShortenedSuccess'),
          description: t('signInToSave'),
        });
      }

      setResult(shortenedUrl);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failedToShortenUrl'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t('copiedToClipboard'),
        description: t('shortenedUrlCopied'),
      });
    } catch (err) {
      toast({
        title: t('failedToCopy'),
        description: t('copyManually'),
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!result?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = result.qrCode;
    link.download = `qr-code-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: t('qrDownloaded'),
      description: t('qrSavedToDownloads'),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      shortenUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glow border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('lightning')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t('shortenAnyUrl')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              {t('description')}
            </p>
          </div>

          {/* URL Shortener Form */}
          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="url"
                    placeholder={t('enterUrl')}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={shortenUrl}
                  disabled={isLoading}
                  variant="hero"
                  size="lg"
                  className="h-12 px-8 min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t('shorten')
                  )}
                </Button>
              </div>
              
              {/* Custom ending input */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('customEnding')}</span>
                </div>
                <div className="flex-1 relative max-w-md">
                  <Input
                    type="text"
                    placeholder={t('customName')}
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className="h-10 text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Result */}
          {result && (
            <Card className="p-6 bg-gradient-secondary border-primary/20 shadow-elegant animate-slide-up">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">{t('urlReady')}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('originalUrl')}
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-background/30 rounded-md border border-border/30">
                        <span className="text-sm text-foreground truncate flex-1">
                          {result.original}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => window.open(result.original, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('shortenedUrl')}
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                        <span className="text-sm font-mono text-primary flex-1">
                          {result.shortened}
                        </span>
                        <Button
                          variant="glass"
                          size="sm"
                          onClick={() => copyToClipboard(result.shortened)}
                          className="h-8 gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {t('copy')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {result.qrCode && (
                    <div className="flex flex-col items-center space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('qrCode')}
                      </label>
                      <div className="bg-white p-2 rounded-lg">
                        <img 
                          src={result.qrCode} 
                          alt="QR Code" 
                          className="w-24 h-24"
                        />
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={downloadQRCode}
                        className="h-8 gap-1"
                      >
                        <Download className="w-3 h-3" />
                        {t('download')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm">{t('instant')}</h3>
              <p className="text-xs text-muted-foreground">{t('instantDesc')}</p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Link className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm">{t('noExpiry')}</h3>
              <p className="text-xs text-muted-foreground">{t('noExpiryDesc')}</p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Copy className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm">{t('noSignup')}</h3>
              <p className="text-xs text-muted-foreground">{t('noSignupDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glow border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {t('wantMoreTitle')}
              </span>
            </div>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {t('wantMoreDescription')}
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  variant="hero" 
                  size="lg"
                  className="h-12 px-8"
                >
                  <RouterLink to="/subscription">
                    {t('viewPlans')}
                  </RouterLink>
                </Button>
                <Button 
                  asChild
                  variant="glass" 
                  size="lg"
                  className="h-12 px-8"
                >
                  <RouterLink to="/auth">
                    {t('createFreeAccount')}
                  </RouterLink>
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-lg font-semibold text-center text-foreground">
                  {t('plansInclude')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-foreground">{t('detailedAnalytics')}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-foreground">{t('bulkShortUrls')}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-foreground">{t('brandedDomains')}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 border border-border/30">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-foreground">{t('linkManagement')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};