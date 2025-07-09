import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Check, 
  Zap, 
  BarChart3, 
  Link2, 
  QrCode, 
  Loader2,
  Settings 
} from 'lucide-react';

export default function Subscription() {
  const { user, subscribed, subscriptionTier, subscriptionEnd, subscriptionLoading, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !subscribed) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      // Open Stripe customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const premiumFeatures = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights with geographic data, device analytics, and custom time ranges"
    },
    {
      icon: Link2,
      title: "Branded Links",
      description: "Custom domains and branded short links for professional appearance"
    },
    {
      icon: Zap,
      title: "Higher Limits",
      description: "Create up to 1000 links per month (vs 50 for free users)"
    },
    {
      icon: QrCode,
      title: "Bulk QR Exports",
      description: "Generate and download QR codes in bulk for all your links"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <Crown className="w-8 h-8 text-primary" />
          Premium Subscription
        </h1>
        <p className="text-muted-foreground">
          Unlock advanced features and take your link management to the next level
        </p>
      </div>

      {/* Current Status */}
      {subscribed && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="default" className="bg-primary">
                    {subscriptionTier}
                  </Badge>
                  Active Subscription
                </CardTitle>
                <CardDescription>
                  {subscriptionEnd && `Next billing date: ${formatDate(subscriptionEnd)}`}
                </CardDescription>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Pricing Card */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Premium Plan</CardTitle>
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-bold">$9.90</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <CardDescription>
            Everything you need for professional link management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            {!subscribed ? (
              <Button
                onClick={handleSubscribe}
                disabled={loading || !user}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Subscribe to Premium
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Check className="w-5 h-5" />
                <span className="font-medium">You're subscribed!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Subscription Status */}
      <div className="text-center">
        <Button
          onClick={checkSubscription}
          disabled={subscriptionLoading || !user}
          variant="ghost"
          size="sm"
        >
          {subscriptionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Refresh Subscription Status
        </Button>
      </div>
    </div>
  );
}