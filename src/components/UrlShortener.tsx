import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, Copy, ExternalLink, Zap } from "lucide-react";

interface ShortenedUrl {
  original: string;
  shortened: string;
  id: string;
  createdAt: Date;
}

export const UrlShortener = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const { toast } = useToast();

  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
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

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const id = generateShortId();
    const shortened = `${window.location.origin}/${id}`;
    
    const shortenedUrl: ShortenedUrl = {
      original: formattedUrl,
      shortened,
      id,
      createdAt: new Date(),
    };

    // Store in localStorage
    const stored = localStorage.getItem("shortenedUrls");
    const urls = stored ? JSON.parse(stored) : {};
    urls[id] = shortenedUrl;
    localStorage.setItem("shortenedUrls", JSON.stringify(urls));

    setResult(shortenedUrl);
    setIsLoading(false);

    toast({
      title: "URL shortened successfully!",
      description: "Your shortened URL is ready to use",
    });
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
                
                <div className="space-y-3">
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