import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Plan } from '@/utils/planData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlanCardProps {
  plan: Plan;
  isAnnual: boolean;
  index: number;
}

export const PlanCard = ({ plan, isAnnual, index }: PlanCardProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (isLoading) {
      console.log('PlanCard: Already loading, ignoring click');
      return;
    }
    
    console.log('PlanCard: Starting subscription process for', plan.name);
    setIsLoading(true);
    
    // Early validation checks
    if (!user) {
      console.log('PlanCard: No user found');
      setIsLoading(false);
      toast.error('Você precisa estar logado para assinar um plano');
      return;
    }

    if (plan.name === 'Enterprise') {
      console.log('PlanCard: Enterprise plan, skipping checkout');
      setIsLoading(false);
      return;
    }

    // Get the correct price ID based on language and billing period
    const isBrazilian = language === 'pt';
    let priceId: string | undefined;

    if (isBrazilian && plan.stripePriceIds) {
      priceId = isAnnual ? plan.stripePriceIds.annual : plan.stripePriceIds.monthly;
    } else if (plan.stripePriceIds) {
      priceId = isAnnual ? plan.stripePriceIds.annual : plan.stripePriceIds.monthly;
    }

    console.log('PlanCard: Using priceId:', priceId, 'for', isAnnual ? 'annual' : 'monthly');

    if (!priceId) {
      console.log('PlanCard: No priceId found');
      setIsLoading(false);
      toast.error('Price ID não encontrado para este plano');
      return;
    }

    try {
      console.log('PlanCard: Calling create-checkout function');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      console.log('PlanCard: Checkout response:', { data, error });

      if (error) {
        console.error('PlanCard: Checkout error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('PlanCard: Checkout function error:', data.error);
        toast.error(`Erro no checkout: ${data.error}`);
        return;
      }

      if (data?.url) {
        console.log('PlanCard: Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
        console.log('PlanCard: Checkout URL opened successfully');
      } else {
        console.error('PlanCard: No URL returned from checkout');
        throw new Error('URL de checkout não foi retornada');
      }
    } catch (error) {
      console.error('PlanCard: Error in handleSubscribe:', error);
      toast.error('Erro ao processar pagamento. Verifique os logs para mais detalhes.');
    } finally {
      console.log('PlanCard: Setting loading to false');
      setIsLoading(false);
    }
  };

  const getPrice = (plan: PlanCardProps['plan']) => {
    if (plan.monthlyPrice === null) return t('custom');
    
    // Check if current language is Portuguese-BR using the hook
    const isBrazilian = language === 'pt';
    
    if (isBrazilian && plan.monthlyPriceBR && plan.annualPriceBR) {
      const price = isAnnual ? plan.annualPriceBR : plan.monthlyPriceBR;
      return `R$ ${price.toFixed(2).replace('.', ',')}`;
    }
    
    const price = isAnnual ? plan.annualPrice! : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const getYearlyPrice = (plan: PlanCardProps['plan']) => {
    if (plan.annualPrice === null) return '';
    
    // Check if current language is Portuguese-BR using the hook
    const isBrazilian = language === 'pt';
    
    if (isBrazilian && plan.annualPriceBR && isAnnual) {
      const monthlyPrice = plan.annualPriceBR / 12;
      return `(R$ ${monthlyPrice.toFixed(2).replace('.', ',')} ${t('perMonth')} )`;
    }
    
    if (isAnnual) {
      const monthlyPrice = plan.annualPrice / 12;
      return `($${monthlyPrice.toFixed(2)} ${t('perMonth')} )`;
    }
    
    if (isBrazilian && plan.annualPriceBR) {
      return `(R$ ${plan.annualPriceBR.toFixed(2).replace('.', ',')} ${t('perYear')} )`;
    }
    
    return `($${plan.annualPrice.toFixed(2)} ${t('perYear')} )`;
  };

  return (
    <Card 
      className={`relative ${plan.popular ? 'border-primary shadow-elegant' : 'border-border/50'} bg-card/50 backdrop-blur-sm`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {t('mostPopular')}
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{getPrice(plan)}</span>
            {plan.monthlyPrice && (
              <span className="text-muted-foreground">{isAnnual ? t('perYear') : t('perMonth')}</span>
            )}
          </div>
          {plan.annualPrice && isAnnual && (
            <p className="text-sm text-muted-foreground">{getYearlyPrice(plan)}</p>
          )}
        </div>
        
        <div className="text-center">
          <p className="font-medium">{plan.links} {t('links')} {plan.clicks && `with ${plan.clicks}`}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        
        {plan.features.length > 0 && (
          <ul className="space-y-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        {plan.additionalInfo && (
          <p className="text-sm text-muted-foreground mt-4">{plan.additionalInfo}</p>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-green-600 hover:bg-green-700'} text-white`}
          onClick={plan.name === 'Enterprise' ? undefined : handleSubscribe}
          asChild={plan.name === 'Enterprise'}
          disabled={isLoading}
        >
          {plan.name === 'Enterprise' ? (
            <span>{plan.buttonText}</span>
          ) : (
            isLoading ? 'Processando...' : plan.buttonText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};