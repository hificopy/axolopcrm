/**
 * Subscription Tier Utilities (Frontend)
 * Manages subscription tiers, pricing display, and feature access
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

// Pricing structure - matches backend
export const PRICING = {
  sales: {
    tier: 'sales',
    name: 'Sales',
    tagline: 'For Startups',
    description: 'Perfect for agencies focusing on sales',
    monthly: 67,
    yearly: 648,
    monthlyYearly: 54,
    discount: 19,
    popular: false,
    cta: 'Start Free Trial',
    features: [
      { text: 'Up to 3 team members', included: true },
      { text: 'Lead & contact management', included: true },
      { text: 'Opportunities pipeline', included: true },
      { text: 'Activities & tasks', included: true },
      { text: 'Calendar integration', included: true },
      { text: '500 leads/month', included: true },
      { text: '1,000 emails/month', included: true },
      { text: '5GB storage', included: true },
      { text: 'Email support', included: true },
      { text: 'Forms builder', included: false },
      { text: 'Email campaigns', included: false },
      { text: 'AI features', included: false }
    ]
  },
  build: {
    tier: 'build',
    name: 'Build',
    tagline: 'Most Popular',
    description: 'Everything to build and grow',
    monthly: 187,
    yearly: 1788,
    monthlyYearly: 149,
    discount: 20,
    popular: true,
    cta: 'Start Free Trial',
    features: [
      { text: 'Up to 5 team members', included: true },
      { text: 'Everything in Sales', included: true },
      { text: 'Forms builder (10 forms)', included: true },
      { text: 'Email campaigns', included: true },
      { text: 'Workflow automation', included: true },
      { text: 'AI lead scoring', included: true },
      { text: 'AI call transcription', included: true },
      { text: 'Second Brain', included: true },
      { text: '2,000 leads/month', included: true },
      { text: '5,000 emails/month', included: true },
      { text: 'Advanced reporting', included: true },
      { text: '50GB storage', included: true },
      { text: 'Priority support', included: true }
    ]
  },
  scale: {
    tier: 'scale',
    name: 'Scale',
    tagline: 'For Agencies',
    description: 'Full power with white labeling',
    monthly: 349,
    yearly: 3348,
    monthlyYearly: 279,
    discount: 20,
    popular: false,
    cta: 'Contact Sales',
    features: [
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited agencies', included: true },
      { text: 'Everything in Build', included: true },
      { text: 'White label branding', included: true },
      { text: 'Custom domain', included: true },
      { text: 'API access', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Mind maps', included: true },
      { text: 'Team chat', included: true },
      { text: 'Unlimited everything', included: true },
      { text: '500GB storage', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '24/7 priority support', included: true }
    ]
  }
};

// Helper functions
export function getTierDisplayPrice(tier, billingCycle = BILLING_CYCLES.MONTHLY) {
  const pricing = PRICING[tier];
  if (!pricing) return { amount: 0, display: '$0' };

  const amount = billingCycle === BILLING_CYCLES.YEARLY
    ? pricing.monthlyYearly
    : pricing.monthly;

  return {
    amount,
    display: `$${amount}`,
    period: billingCycle === BILLING_CYCLES.YEARLY ? '/mo' : '/mo',
    billedAs: billingCycle === BILLING_CYCLES.YEARLY ? `Billed $${pricing.yearly}/year` : 'Billed monthly'
  };
}

export function calculateSavings(tier) {
  const pricing = PRICING[tier];
  if (!pricing) return 0;

  const monthlyTotal = pricing.monthly * 12;
  const yearlyTotal = pricing.yearly;
  return Math.round(monthlyTotal - yearlyTotal);
}

export function getTierBadge(tier) {
  const pricing = PRICING[tier];
  if (!pricing) return null;

  if (pricing.popular) {
    return {
      text: 'Most Popular',
      className: 'bg-yellow-500 text-black'
    };
  }

  if (tier === SUBSCRIPTION_TIERS.SCALE) {
    return {
      text: 'Best Value',
      className: 'bg-green-500 text-white'
    };
  }

  return null;
}

export function getTierColor(tier) {
  const colors = {
    sales: 'blue',
    build: 'yellow',
    scale: 'purple',
    god_mode: 'red'
  };

  return colors[tier] || 'gray';
}

export function getTierGradient(tier) {
  const gradients = {
    sales: 'from-blue-500 to-blue-600',
    build: 'from-yellow-500 to-yellow-600',
    scale: 'from-purple-500 to-purple-600',
    god_mode: 'from-red-500 to-red-600'
  };

  return gradients[tier] || 'from-gray-500 to-gray-600';
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getPricingComparison(fromTier, toTier, billingCycle = BILLING_CYCLES.YEARLY) {
  const from = PRICING[fromTier];
  const to = PRICING[toTier];

  if (!from || !to) return null;

  const fromPrice = billingCycle === BILLING_CYCLES.YEARLY ? from.yearly : from.monthly * 12;
  const toPrice = billingCycle === BILLING_CYCLES.YEARLY ? to.yearly : to.monthly * 12;

  const difference = toPrice - fromPrice;
  const percentIncrease = Math.round((difference / fromPrice) * 100);

  return {
    difference,
    percentIncrease,
    message: `${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'more' : 'less'} per year`
  };
}

export default {
  SUBSCRIPTION_TIERS,
  BILLING_CYCLES,
  PRICING,
  getTierDisplayPrice,
  calculateSavings,
  getTierBadge,
  getTierColor,
  getTierGradient,
  formatCurrency,
  getPricingComparison
};
