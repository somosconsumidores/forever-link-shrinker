import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap } from 'lucide-react';

const Subscription = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const plans = [
    {
      name: 'Pro',
      monthlyPrice: 9.99,
      annualPrice: 119.88,
      links: '500',
      clicks: t('unlimitedClicksTrackable'),
      features: [
        t('linkAnalytics'),
        t('advancedLinkManagement'),
        t('shortenUrlsBrandedDomains'),
        t('linkEditingDeletion'),
        t('customLinkExpiration')
      ],
      description: t('proDescription'),
      additionalInfo: t('proAdditionalInfo'),
      buttonText: t('signUp'),
      popular: false
    },
    {
      name: 'Bulk 100K',
      monthlyPrice: 99.00,
      annualPrice: 1188.00,
      links: '100K',
      clicks: t('trackClicks').replace('{{count}}', '100K'),
      features: [],
      description: t('bulkDescription'),
      additionalInfo: t('bulkAdditionalInfo'),
      buttonText: t('signUp'),
      popular: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      links: t('custom'),
      clicks: '',
      features: [],
      description: t('enterpriseDescription'),
      additionalInfo: t('enterpriseAdditionalInfo'),
      buttonText: t('contactUs'),
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return t('custom');
    const price = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const getYearlyPrice = (plan: typeof plans[0]) => {
    if (plan.annualPrice === null) return '';
    return `($${plan.annualPrice.toFixed(2)} ${t('perYear')} )`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Minify-URL.com {t('plans')}</h1>
            <p className="text-muted-foreground">{t('findPlanTitle')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label htmlFor="billing-toggle" className="text-base">
              {t('billingCycle')}: {t('monthly')}
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className="text-base">
              {t('annual')}
            </Label>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
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
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <Card className="p-6 bg-gradient-secondary border-primary/20 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 justify-center mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{t('needHelpChoosing')}</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                {t('needHelpDescription')}
              </p>
              <Button variant="outline">
                {t('contactSupport')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;