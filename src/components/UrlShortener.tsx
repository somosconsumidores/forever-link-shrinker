import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link, Copy, ExternalLink, Zap, Download, QrCode } from "lucide-react";
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
      // Check in localStorage for anonymous users
      const stored = localStorage.getItem("shortenedUrls");
      const urls = stored ? JSON.parse(stored) : {};
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
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const shortenUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Please enter a URL",
        description: "Enter a valid URL to shorten",
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
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Validate custom ID
    let finalId = customId.trim();
    if (finalId) {
      // Only allow alphanumeric characters and hyphens
      if (!/^[a-zA-Z0-9-]+$/.test(finalId)) {
        toast({
          title: "Invalid custom ending",
          description: "Only letters, numbers, and hyphens are allowed",
          variant: "destructive",
        });
        return;
      }

      if (await isIdTaken(finalId)) {
        toast({
          title: "Custom ending unavailable",
          description: "This custom ending is already taken. Please try another.",
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
      const shortened = `https://short.ly/${finalId}`;
      
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
          title: "URL shortened successfully!",
          description: "URL saved to your dashboard",
        });
      } else {
        // Store in localStorage for anonymous users
        const stored = localStorage.getItem("shortenedUrls");
        const urls = stored ? JSON.parse(stored) : {};
        urls[finalId] = shortenedUrl;
        localStorage.setItem("shortenedUrls", JSON.stringify(urls));

        toast({
          title: "URL shortened successfully!",
          description: "Sign in to save and manage your URLs",
        });
      }

      setResult(shortenedUrl);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to shorten URL",
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
        title: "Copied to clipboard!",
        description: "The shortened URL has been copied",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
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
      title: "QR Code downloaded!",
      description: "The QR code has been saved to your downloads",
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
                Lightning fast URL shortening
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Shorten Any URL
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Transform long, complex URLs into short, shareable links instantly. 
              No signup required, links never expire.
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
                    placeholder="Enter your long URL here..."
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
                    "Shorten"
                  )}
                </Button>
              </div>
              
              {/* Custom ending input */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Custom ending (optional):</span>
                </div>
                <div className="flex-1 relative max-w-md">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    short.ly/
                  </span>
                  <Input
                    type="text"
                    placeholder="custom-name"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className="pl-20 h-10 text-sm bg-background/50 border-border/50 focus:border-primary/50 transition-all"
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
                  <span className="font-semibold">Your shortened URL is ready!</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Original URL
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
                        Shortened URL
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
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  {result.qrCode && (
                    <div className="flex flex-col items-center space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        QR Code
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
                        Download
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
              <h3 className="font-semibold text-sm">Instant</h3>
              <p className="text-xs text-muted-foreground">Get your shortened URL in seconds</p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Link className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm">No Expiry</h3>
              <p className="text-xs text-muted-foreground">Your links work forever</p>
            </div>
            <div className="p-4 rounded-lg bg-card/30 border border-border/30">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Copy className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm">No Signup</h3>
              <p className="text-xs text-muted-foreground">Start shortening immediately</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};