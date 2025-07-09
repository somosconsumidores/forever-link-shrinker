import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ExternalLink, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export const RedirectHandler = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid short URL");
      setLoading(false);
      return;
    }

    // Simulate loading delay
    setTimeout(() => {
      const stored = localStorage.getItem("shortenedUrls");
      if (stored) {
        try {
          const urls = JSON.parse(stored);
          const shortenedUrl = urls[id];
          
          if (shortenedUrl) {
            setUrl(shortenedUrl.original);
            // Redirect after a brief moment
            setTimeout(() => {
              window.location.href = shortenedUrl.original;
            }, 1000);
          } else {
            setError("Short URL not found");
          }
        } catch {
          setError("Error retrieving URL");
        }
      } else {
        setError("Short URL not found");
      }
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center max-w-md w-full">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto flex items-center justify-center">
              <Loader className="w-6 h-6 text-primary-foreground animate-spin" />
            </div>
            <h2 className="text-xl font-semibold">Redirecting...</h2>
            <p className="text-muted-foreground">
              Please wait while we redirect you to your destination.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center max-w-md w-full">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-destructive/20 rounded-full mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Link Not Found</h2>
            <p className="text-muted-foreground">
              {error}. The shortened URL you're looking for doesn't exist or may have been removed.
            </p>
            <Button 
              variant="hero" 
              onClick={() => window.location.href = "/"}
              className="w-full"
            >
              Create New Short URL
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (url) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center max-w-md w-full">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto flex items-center justify-center animate-glow-pulse">
              <ExternalLink className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Redirecting to:</h2>
            <p className="text-sm text-muted-foreground break-all bg-background/50 p-3 rounded border">
              {url}
            </p>
            <p className="text-xs text-muted-foreground">
              You'll be redirected automatically in a moment...
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = url}
              className="w-full"
            >
              Go Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <Navigate to="/" replace />;
};