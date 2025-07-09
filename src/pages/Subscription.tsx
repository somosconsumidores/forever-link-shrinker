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
      clicks: 'Unlimited Trackable Clicks',
      features: [
        'Link Analytics',
        'Advanced Link Management',
        'Shorten URLs Using Branded Domains',
        'Link Editing & Deletion',
        'Custom Link Expiration Dates'
      ],
      description: 'Get full access to our Pro features including:',
      additionalInfo: 'Enjoy 500 links with unlimited clicks and track up to 9.5K clicks on 9.5K additional links.',
      buttonText: 'Sign Up',
      popular: false
    },
    {
      name: 'Bulk 100K',
      monthlyPrice: 99.00,
      annualPrice: 1188.00,
      links: '100K',
      clicks: 'Track up to 100K Clicks',
      features: [],
      description: 'Our bulk plan for users who need to generate a ton of short-term, branded links to support their marketing or operations.',
      additionalInfo: 'Enjoy all Pro features, 90-day default link expiration, and track up to 100K clicks across 100K branded short links.',
      buttonText: 'Sign Up',
      popular: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      links: 'Custom',
      clicks: '',
      features: [],
      description: 'Need a larger limit, dedicated customer support, custom solutions, or specific compliance requirements?',
      additionalInfo: 'We offer tailor-made plans for enterprises that need more than what our regular plans can offer. Have a chat with our experts to get started on an enterprise plan.',
      buttonText: 'Contact Us',
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return 'Custom';
    const price = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const getYearlyPrice = (plan: typeof plans[0]) => {
    if (plan.annualPrice === null) return '';
    return `($${plan.annualPrice.toFixed(2)} / yr )`;
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
            <h1 className="text-2xl font-bold">Minify-URL.com Plans</h1>
            <p className="text-muted-foreground">Find a plan that meets your needs</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label htmlFor="billing-toggle" className="text-base">
              Billing cycle: Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className="text-base">
              Annual
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
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{getPrice(plan)}</span>
                      {plan.monthlyPrice && (
                        <span className="text-muted-foreground">/ mo *</span>
                      )}
                    </div>
                    {plan.annualPrice && isAnnual && (
                      <p className="text-sm text-muted-foreground">{getYearlyPrice(plan)}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 bg-gradient-primary h-2 rounded-full relative">
                      <div className="absolute right-2 top-0 transform translate-y-[-50%] bg-background px-2 py-1 rounded text-xs font-medium">
                        {index === 0 ? '50K+' : index === 1 ? '5M+' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-medium">{plan.links} Links {plan.clicks && `with ${plan.clicks}`}</p>
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
                <h3 className="text-lg font-semibold">Need help choosing a plan?</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Not sure which plan is right for you? Our team is here to help you find the perfect solution for your needs.
              </p>
              <Button variant="outline">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;