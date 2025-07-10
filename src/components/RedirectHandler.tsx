import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

export const RedirectHandler = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!id) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to redirect short URL:', id);
        
        // First check localStorage for anonymous URLs
        const stored = localStorage.getItem("shortenedUrls");
        if (stored) {
          const urls = JSON.parse(stored);
          const localUrl = urls[id];
          
          if (localUrl && localUrl._secure) {
            // Check expiration
            if (localUrl.expires && Date.now() > localUrl.expires) {
              console.log('Anonymous URL expired:', id);
              setError('This short URL has expired');
              setLoading(false);
              return;
            }
            
            // Decode the obfuscated URL
            const originalUrl = atob(localUrl.original);
            console.log('Found in localStorage, redirecting to:', originalUrl);
            window.location.href = originalUrl;
            return;
          }
        }

        // Track the click using the edge function for database URLs
        const { data, error } = await supabase.functions.invoke('track-click', {
          body: {
            shortCode: id,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            ipAddress: await getClientIP()
          }
        });

        if (error) {
          console.error('Error tracking click:', error);
          setError('Short URL not found');
          setLoading(false);
          return;
        }

        if (data?.originalUrl) {
          console.log('Found in database, redirecting to:', data.originalUrl);
          // Redirect to the original URL
          window.location.href = data.originalUrl;
        } else {
          console.log('Short URL not found in database or localStorage:', id);
          setError('Short URL not found');
        }
      } catch (error) {
        console.error('Error in redirect handler:', error);
        setError('An error occurred while redirecting');
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [id]);

  // Get client IP address (best effort)
  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return 'unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
            <p className="text-muted-foreground">Please wait while we redirect you to your destination.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              The short URL you're looking for doesn't exist or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};