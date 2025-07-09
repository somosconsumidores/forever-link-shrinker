import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface PlanCardProps {
  plan: {
    name: string;
    monthlyPrice: number | null;
    annualPrice: number | null;
    links: string;
    clicks: string;
    features: string[];
    description: string;
    additionalInfo: string;
    buttonText: string;
    popular: boolean;
  };
  isAnnual: boolean;
  index: number;
}

export const PlanCard = ({ plan, isAnnual, index }: PlanCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const getPrice = (plan: PlanCardProps['plan']) => {
    if (plan.monthlyPrice === null) return t('custom');
    const price = isAnnual ? plan.annualPrice! / 12 : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const getYearlyPrice = (plan: PlanCardProps['plan']) => {
    if (plan.annualPrice === null) return '';
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
              <span className="text-muted-foreground">{t('perMonth')}</span>
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
          asChild={plan.name !== 'Enterprise'}
        >
          {plan.name === 'Enterprise' ? (
            <span>{plan.buttonText}</span>
          ) : (
            <Link to={user ? "/dashboard" : "/auth"}>
              {plan.buttonText}
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};