import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Zap } from 'lucide-react';

export const HelpSection = () => {
  const { t } = useLanguage();

  return (
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
  );
};