import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

const FREE_TIER_LIMITS = {
  MAX_URLS: 50,
};

export const useSubscriptionLimits = () => {
  const { subscribed, subscriptionTier } = useAuth();
  const { toast } = useToast();

  const checkUrlLimit = (currentUrlCount: number): boolean => {
    if (!subscribed && currentUrlCount >= FREE_TIER_LIMITS.MAX_URLS) {
      toast({
        title: "Limite Atingido",
        description: `Usuários gratuitos podem criar até ${FREE_TIER_LIMITS.MAX_URLS} links. Faça upgrade para Premium para links ilimitados.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const checkPremiumFeature = (featureName: string): boolean => {
    if (!subscribed) {
      toast({
        title: "Recurso Premium",
        description: `${featureName} está disponível apenas para usuários Premium.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const isFeatureAllowed = (feature: 'analytics' | 'bulk_download' | 'bulk_shorten' | 'qr_download'): boolean => {
    // QR download is allowed for free users
    if (feature === 'qr_download') {
      return true;
    }
    
    // Other features require subscription
    return subscribed;
  };

  const getRemainingUrls = (currentUrlCount: number): number => {
    if (subscribed) return Infinity;
    return Math.max(0, FREE_TIER_LIMITS.MAX_URLS - currentUrlCount);
  };

  return {
    subscribed,
    subscriptionTier,
    checkUrlLimit,
    checkPremiumFeature,
    isFeatureAllowed,
    getRemainingUrls,
    limits: {
      maxUrls: subscribed ? Infinity : FREE_TIER_LIMITS.MAX_URLS,
    }
  };
};
