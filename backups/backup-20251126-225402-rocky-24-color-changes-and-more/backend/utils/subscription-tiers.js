/**
 * Subscription Tier Utilities
 * Manages subscription tiers, pricing, and feature access
 */

export const SUBSCRIPTION_TIERS = {
  SALES: 'sales',
  BUILD: 'build',
  SCALE: 'scale',
  GOD_MODE: 'god_mode'
};

export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

// Pricing structure
export const PRICING = {
  [SUBSCRIPTION_TIERS.SALES]: {
    tier: 'sales',
    name: 'Sales Tier',
    description: 'Perfect for startup agencies focusing on sales',
    monthly: 67.00,
    yearly: 648.00, // $54/mo when billed yearly
    monthlyYearly: 54.00,
    discount: 19,
    features: [
      'Up to 3 team members',
      'Lead & contact management',
      'Opportunities pipeline',
      'Activities tracking',
      'Calendar integration',
      '500 leads/month',
      '1,000 emails/month',
      '5GB storage',
      'Email support'
    ],
    limits: {
      users: 3,
      agencies: 1,
      leads_per_month: 500,
      emails_per_month: 1000,
      forms: 3,
      workflows: 2,
      storage_gb: 5
    },
    sections: ['dashboard', 'leads', 'contacts', 'opportunities', 'activities', 'calendar']
  },
  [SUBSCRIPTION_TIERS.BUILD]: {
    tier: 'build',
    name: 'Build Tier',
    description: 'Everything you need to build and grow your agency',
    monthly: 187.00,
    yearly: 1788.00, // $149/mo when billed yearly
    monthlyYearly: 149.00,
    discount: 20,
    features: [
      'Up to 5 team members',
      'All Sales tier features',
      'Forms builder',
      'Email campaigns',
      'Workflow automation',
      'AI lead scoring',
      'AI call transcription',
      'Second Brain knowledge base',
      '2,000 leads/month',
      '5,000 emails/month',
      'Advanced reporting',
      '50GB storage',
      'Priority support'
    ],
    limits: {
      users: 5,
      agencies: 1,
      leads_per_month: 2000,
      emails_per_month: 5000,
      forms: 10,
      workflows: 10,
      storage_gb: 50
    },
    sections: ['dashboard', 'leads', 'contacts', 'opportunities', 'activities', 'meetings', 'forms', 'email_campaigns', 'workflows', 'calendar', 'second_brain']
  },
  [SUBSCRIPTION_TIERS.SCALE]: {
    tier: 'scale',
    name: 'Scale Tier',
    description: 'Full power with white labeling for agencies at scale',
    monthly: 349.00,
    yearly: 3348.00, // $279/mo when billed yearly
    monthlyYearly: 279.00,
    discount: 20,
    features: [
      'Unlimited team members',
      'Unlimited agencies',
      'All Build tier features',
      'White label branding',
      'Custom domain',
      'API access',
      'Custom integrations',
      'Mind maps',
      'Team chat',
      'Unlimited leads',
      'Unlimited emails',
      'Unlimited forms & workflows',
      '500GB storage',
      'Dedicated account manager',
      '24/7 priority support'
    ],
    limits: {
      users: 999999,
      agencies: 999999,
      leads_per_month: 999999,
      emails_per_month: 999999,
      forms: 999999,
      workflows: 999999,
      storage_gb: 500
    },
    sections: ['all']
  },
  [SUBSCRIPTION_TIERS.GOD_MODE]: {
    tier: 'god_mode',
    name: 'God Mode',
    description: 'Axolop internal use only - unlimited everything',
    monthly: 0,
    yearly: 0,
    monthlyYearly: 0,
    discount: 0,
    features: ['Unlimited everything', 'Axolop internal only'],
    limits: {
      users: 999999,
      agencies: 999999,
      leads_per_month: 999999,
      emails_per_month: 999999,
      forms: 999999,
      workflows: 999999,
      storage_gb: 999999
    },
    sections: ['all']
  }
};

// Feature access by tier
export const TIER_FEATURES = {
  [SUBSCRIPTION_TIERS.SALES]: {
    sections: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      activities: true,
      meetings: false,
      forms: false,
      email_campaigns: false,
      workflows: false,
      calendar: true,
      second_brain: false,
      mind_maps: false,
      team_chat: false
    },
    features: {
      ai_scoring: false,
      ai_transcription: false,
      email_integration: true,
      calendar_integration: true,
      advanced_reporting: false,
      api_access: false,
      white_label: false,
      custom_integrations: false
    }
  },
  [SUBSCRIPTION_TIERS.BUILD]: {
    sections: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      activities: true,
      meetings: true,
      forms: true,
      email_campaigns: true,
      workflows: true,
      calendar: true,
      second_brain: true,
      mind_maps: false,
      team_chat: false
    },
    features: {
      ai_scoring: true,
      ai_transcription: true,
      email_integration: true,
      calendar_integration: true,
      advanced_reporting: true,
      api_access: false,
      white_label: false,
      custom_integrations: false
    }
  },
  [SUBSCRIPTION_TIERS.SCALE]: {
    sections: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      activities: true,
      meetings: true,
      forms: true,
      email_campaigns: true,
      workflows: true,
      calendar: true,
      second_brain: true,
      mind_maps: true,
      team_chat: true
    },
    features: {
      ai_scoring: true,
      ai_transcription: true,
      email_integration: true,
      calendar_integration: true,
      advanced_reporting: true,
      api_access: true,
      white_label: true,
      custom_integrations: true,
      unlimited_everything: true
    }
  },
  [SUBSCRIPTION_TIERS.GOD_MODE]: {
    sections: 'all',
    features: 'all'
  }
};

// Helper functions
export function getTierPricing(tier, billingCycle = BILLING_CYCLES.MONTHLY) {
  const pricing = PRICING[tier];
  if (!pricing) return null;

  if (billingCycle === BILLING_CYCLES.YEARLY) {
    return {
      amount: pricing.yearly,
      perMonth: pricing.monthlyYearly,
      discount: pricing.discount,
      savings: (pricing.monthly * 12) - pricing.yearly
    };
  }

  return {
    amount: pricing.monthly,
    perMonth: pricing.monthly,
    discount: 0,
    savings: 0
  };
}

export function canAccessSection(tier, section) {
  const features = TIER_FEATURES[tier];
  if (!features) return false;

  if (features.sections === 'all') return true;
  return features.sections[section] === true;
}

export function canAccessFeature(tier, feature) {
  const features = TIER_FEATURES[tier];
  if (!features) return false;

  if (features.features === 'all') return true;
  return features.features[feature] === true;
}

export function getTierLimits(tier) {
  const pricing = PRICING[tier];
  return pricing?.limits || null;
}

export function isUnlimited(tier) {
  return tier === SUBSCRIPTION_TIERS.SCALE || tier === SUBSCRIPTION_TIERS.GOD_MODE;
}

export function canAddMoreUsers(currentCount, tier) {
  if (isUnlimited(tier)) return true;

  const limits = getTierLimits(tier);
  return currentCount < limits.users;
}

export function canCreateMoreAgencies(currentCount, tier) {
  if (isUnlimited(tier)) return true;

  const limits = getTierLimits(tier);
  return currentCount < limits.agencies;
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

export function calculateYearlySavings(tier) {
  const pricing = PRICING[tier];
  if (!pricing) return 0;

  const monthlyTotal = pricing.monthly * 12;
  const yearlyTotal = pricing.yearly;
  return monthlyTotal - yearlyTotal;
}

export default {
  SUBSCRIPTION_TIERS,
  BILLING_CYCLES,
  PRICING,
  TIER_FEATURES,
  getTierPricing,
  canAccessSection,
  canAccessFeature,
  getTierLimits,
  isUnlimited,
  canAddMoreUsers,
  canCreateMoreAgencies,
  formatPrice,
  calculateYearlySavings
};
