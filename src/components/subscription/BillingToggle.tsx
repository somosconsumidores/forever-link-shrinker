import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (value: boolean) => void;
}

export const BillingToggle = ({ isAnnual, onToggle }: BillingToggleProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <Label htmlFor="billing-toggle" className="text-base">
        {t('billingCycle')}: {t('monthly')}
      </Label>
      <Switch
        id="billing-toggle"
        checked={isAnnual}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      <Label htmlFor="billing-toggle" className="text-base">
        {t('annual')}
      </Label>
    </div>
  );
};