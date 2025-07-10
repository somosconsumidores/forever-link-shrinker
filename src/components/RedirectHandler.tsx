import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

export const RedirectHandler = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  useEffect(() => {
    if (authLoading) {
      // Wait for authentication state to be determined
      return;
    }

    const handleRedirect = async () => {
      if (!id) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to redirect short URL:', id, 'User authenticated:', !!user);

        if (user) {
          // User is authenticated: DB first
          console.log('User authenticated. Calling track-click edge function for:', id);
          const { data, error: dbError } = await supabase.functions.invoke('track-click', {
            body: {
              shortCode: id,
              userAgent: navigator.userAgent,
              referrer: document.referrer,
              ipAddress: await getClientIP()
            }
          });

          console.log('track-click response:', { data, dbError });

          if (dbError) {
            // Error calling track-click, or URL not found in DB
            // For authenticated users, we typically wouldn't check localStorage as a fallback
            // unless it's a specific requirement. Here, we assume if it's not in DB, it's an error.
            console.error('Error tracking click or URL not found in DB for authenticated user:', dbError);
            setError('Short URL not found or an error occurred.');
            setLoading(false);
            return;
          }

          if (data?.originalUrl) {
            console.log('Found in database (authenticated user), redirecting to:', data.originalUrl);
            window.location.href = data.originalUrl;
            return; // Exit after successful redirect
          } else {
            // track-click succeeded but no originalUrl, means not found in DB
            console.log('Short URL not found in database for authenticated user:', id);
            setError('Short URL not found.');
            // Optionally, you could check localStorage here as a last resort if desired
            // but for now, we'll consider it not found.
          }

        } else {
          // User is anonymous: localStorage first, then DB (track-click)
          console.log('User is anonymous. Checking localStorage for:', id);
          const stored = localStorage.getItem("shortenedUrls");
          if (stored) {
            try {
              const urls = JSON.parse(stored);
              const localUrl = urls[id];

              if (localUrl && localUrl._secure) {
                if (localUrl.expires && Date.now() > localUrl.expires) {
                  console.log('Anonymous URL expired in localStorage:', id);
                  // Don't set error yet, proceed to check DB
                } else {
                  const originalUrl = atob(localUrl.original);
                  console.log('Found in localStorage (anonymous user), redirecting to:', originalUrl);
                  window.location.href = originalUrl;
                  return; // Exit after successful redirect
                }
              }
            } catch (e) {
              console.error("Error parsing localStorage or decoding base64 string", e);
              // Problem with localStorage, proceed to check DB
            }
          }

          // If not found in localStorage or expired/corrupted, try database via track-click for anonymous users
          console.log('Not found or expired in localStorage (anonymous user). Calling track-click for:', id);
          const { data, error: dbError } = await supabase.functions.invoke('track-click', {
            body: {
              shortCode: id,
              userAgent: navigator.userAgent,
              referrer: document.referrer,
              ipAddress: await getClientIP()
            }
          });

          console.log('track-click response (anonymous user):', { data, dbError });

          if (dbError) {
            console.error('Error tracking click for anonymous user:', dbError);
            setError('Short URL not found or an error occurred.');
            setLoading(false);
            return;
          }

          if (data?.originalUrl) {
            console.log('Found in database (anonymous user), redirecting to:', data.originalUrl);
            window.location.href = data.originalUrl;
            return; // Exit after successful redirect
          } else {
            console.log('Short URL not found in database or localStorage (anonymous user):', id);
            setError('Short URL not found.');
          }
        }

      } catch (error) {
        console.error('Error in redirect handler:', error);
        setError('An error occurred while redirecting.');
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [id, user, authLoading]); // Add user and authLoading to dependency array

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