export interface Plan {
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  monthlyPriceBR?: number | null;
  annualPriceBR?: number | null;
  stripePriceIds?: {
    monthly?: string;
    annual?: string;
    monthlyBR?: string;
    annualBR?: string;
  };
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
    monthlyPriceBR: 12.90,
    annualPriceBR: 9.90,
    stripePriceIds: {
      monthly: 'price_1RizImGO9Xgz4FfVSAOaPZZr', // BR monthly
      annual: 'price_1Rj1ycGO9Xgz4FfVl7Cm3PoN', // BR annual
    },
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
    monthlyPriceBR: 129.90,
    annualPriceBR: 99.90,
    stripePriceIds: {
      monthly: 'price_1Rj21tGO9Xgz4FfVaNmVp04z', // BR monthly
      annual: 'price_1Rj22cGO9Xgz4FfV5WOsu8fe', // BR annual
    },
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
    monthlyPriceBR: null,
    annualPriceBR: null,
    links: t('custom'),
    clicks: '',
    features: [],
    description: t('enterpriseDescription'),
    additionalInfo: t('enterpriseAdditionalInfo'),
    buttonText: t('contactUs'),
    popular: false
  }
];