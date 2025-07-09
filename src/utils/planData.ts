export interface Plan {
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
}

export const createPlans = (t: (key: string) => string): Plan[] => [
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