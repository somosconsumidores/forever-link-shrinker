import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PlanCard } from '@/components/subscription/PlanCard';
import { BillingToggle } from '@/components/subscription/BillingToggle';
import { HelpSection } from '@/components/subscription/HelpSection';
import { createPlans } from '@/utils/planData';

const Subscription = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { t } = useLanguage();

  const plans = createPlans(t);

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
          <BillingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                isAnnual={isAnnual}
                index={index}
              />
            ))}
          </div>

          {/* Additional Info */}
          <HelpSection />
        </div>
      </div>
    </div>
  );
};

export default Subscription;