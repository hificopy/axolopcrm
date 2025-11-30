/**
 * Subscription Tiers Configuration
 *
 * Centralized configuration for all subscription tiers, features,
 * and limits. This replaces hardcoded values throughout the codebase.
 */

// Subscription tier definitions
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    displayName: 'Free Plan',
    description: 'Get started with basic features',
    price: 0,
    priceYearly: 0,
    limits: {
      maxSeats: 3,
      maxAgencies: 1,
      maxLeads: 100,
      maxContacts: 500,
      maxForms: 3,
      maxCampaigns: 1,
      maxWorkflows: 1,
      storageGb: 1,
      apiRequestsPerDay: 1000
    },
    features: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      calendar: true,
      meetings: true,
      forms: true,
      campaigns: false,
      workflows: false,
      reports: false,
      secondBrain: false,
      apiAccess: false,
      customRoles: false,
      auditLogs: false,
      prioritySupport: false,
      whiteLabeling: false,
      customDomain: false,
      ssoIntegration: false
    }
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    displayName: 'Starter Plan',
    description: 'Perfect for small agencies',
    price: 49,
    priceYearly: 470, // 2 months free
    limits: {
      maxSeats: 5,
      maxAgencies: 2,
      maxLeads: 1000,
      maxContacts: 5000,
      maxForms: 10,
      maxCampaigns: 5,
      maxWorkflows: 5,
      storageGb: 5,
      apiRequestsPerDay: 10000
    },
    features: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      calendar: true,
      meetings: true,
      forms: true,
      campaigns: true,
      workflows: true,
      reports: true,
      secondBrain: false,
      apiAccess: true,
      customRoles: true,
      auditLogs: false,
      prioritySupport: false,
      whiteLabeling: false,
      customDomain: false,
      ssoIntegration: false
    }
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Pro Plan',
    description: 'For growing agencies',
    price: 99,
    priceYearly: 950, // 2 months free
    limits: {
      maxSeats: 15,
      maxAgencies: 5,
      maxLeads: 10000,
      maxContacts: 50000,
      maxForms: 50,
      maxCampaigns: 25,
      maxWorkflows: 25,
      storageGb: 25,
      apiRequestsPerDay: 50000
    },
    features: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      calendar: true,
      meetings: true,
      forms: true,
      campaigns: true,
      workflows: true,
      reports: true,
      secondBrain: true,
      apiAccess: true,
      customRoles: true,
      auditLogs: true,
      prioritySupport: true,
      whiteLabeling: false,
      customDomain: false,
      ssoIntegration: false
    }
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise Plan',
    description: 'For large organizations',
    price: 299,
    priceYearly: 2870, // 2 months free
    limits: {
      maxSeats: 100,
      maxAgencies: 25,
      maxLeads: 100000,
      maxContacts: 500000,
      maxForms: 250,
      maxCampaigns: 100,
      maxWorkflows: 100,
      storageGb: 100,
      apiRequestsPerDay: 500000
    },
    features: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      calendar: true,
      meetings: true,
      forms: true,
      campaigns: true,
      workflows: true,
      reports: true,
      secondBrain: true,
      apiAccess: true,
      customRoles: true,
      auditLogs: true,
      prioritySupport: true,
      whiteLabeling: true,
      customDomain: true,
      ssoIntegration: false
    }
  },

  god_mode: {
    id: 'god_mode',
    name: 'God Mode',
    displayName: 'God Mode (Admin)',
    description: 'Unlimited access for administrators',
    price: 0,
    priceYearly: 0,
    limits: {
      maxSeats: -1, // unlimited
      maxAgencies: -1,
      maxLeads: -1,
      maxContacts: -1,
      maxForms: -1,
      maxCampaigns: -1,
      maxWorkflows: -1,
      storageGb: -1,
      apiRequestsPerDay: -1
    },
    features: {
      dashboard: true,
      leads: true,
      contacts: true,
      opportunities: true,
      calendar: true,
      meetings: true,
      forms: true,
      campaigns: true,
      workflows: true,
      reports: true,
      secondBrain: true,
      apiAccess: true,
      customRoles: true,
      auditLogs: true,
      prioritySupport: true,
      whiteLabeling: true,
      customDomain: true,
      ssoIntegration: true
    }
  }
};

// Tier hierarchy (for comparison)
export const TIER_HIERARCHY = ['free', 'starter', 'pro', 'enterprise', 'god_mode'];

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INACTIVE: 'inactive'
};

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 14,
  reminderDays: [7, 3, 1], // Days before expiry to send reminders
  gracePeriodDays: 3 // Days after trial expiry before downgrade
};

// Seat pricing
export const SEAT_PRICING = {
  freeSeats: 3,
  costPerSeat: 12, // Per month
  bulkDiscounts: {
    10: 0.1, // 10% off for 10+ seats
    25: 0.15, // 15% off for 25+ seats
    50: 0.2, // 20% off for 50+ seats
    100: 0.25 // 25% off for 100+ seats
  }
};

/**
 * Get tier by ID
 * @param {string} tierId - Tier ID
 * @returns {Object|null} Tier configuration
 */
export function getTier(tierId) {
  return SUBSCRIPTION_TIERS[tierId] || null;
}

/**
 * Get tier level (for comparison)
 * @param {string} tierId - Tier ID
 * @returns {number} Tier level (0-based)
 */
export function getTierLevel(tierId) {
  return TIER_HIERARCHY.indexOf(tierId);
}

/**
 * Check if tier A is higher than tier B
 * @param {string} tierA - First tier ID
 * @param {string} tierB - Second tier ID
 * @returns {boolean} Whether tierA >= tierB
 */
export function isTierHigherOrEqual(tierA, tierB) {
  return getTierLevel(tierA) >= getTierLevel(tierB);
}

/**
 * Check if a feature is available for a tier
 * @param {string} tierId - Tier ID
 * @param {string} featureKey - Feature key
 * @returns {boolean} Whether feature is available
 */
export function hasFeature(tierId, featureKey) {
  const tier = getTier(tierId);
  if (!tier) return false;
  return tier.features[featureKey] === true;
}

/**
 * Get limit value for a tier
 * @param {string} tierId - Tier ID
 * @param {string} limitKey - Limit key
 * @returns {number} Limit value (-1 for unlimited)
 */
export function getLimit(tierId, limitKey) {
  const tier = getTier(tierId);
  if (!tier) return 0;
  return tier.limits[limitKey] ?? 0;
}

/**
 * Check if within limit
 * @param {string} tierId - Tier ID
 * @param {string} limitKey - Limit key
 * @param {number} currentValue - Current usage
 * @returns {boolean} Whether within limit
 */
export function isWithinLimit(tierId, limitKey, currentValue) {
  const limit = getLimit(tierId, limitKey);
  if (limit === -1) return true; // Unlimited
  return currentValue < limit;
}

/**
 * Calculate seat pricing with discounts
 * @param {number} totalSeats - Total number of seats
 * @returns {Object} Pricing breakdown
 */
export function calculateSeatPricing(totalSeats) {
  const { freeSeats, costPerSeat, bulkDiscounts } = SEAT_PRICING;

  const paidSeats = Math.max(0, totalSeats - freeSeats);

  // Find applicable discount
  let discount = 0;
  for (const [threshold, discountRate] of Object.entries(bulkDiscounts).sort((a, b) => b[0] - a[0])) {
    if (paidSeats >= parseInt(threshold)) {
      discount = discountRate;
      break;
    }
  }

  const basePrice = paidSeats * costPerSeat;
  const discountAmount = basePrice * discount;
  const finalPrice = basePrice - discountAmount;

  return {
    totalSeats,
    freeSeats,
    paidSeats,
    costPerSeat,
    discountPercent: discount * 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    monthlyPrice: Math.round(finalPrice * 100) / 100,
    yearlyPrice: Math.round(finalPrice * 10 * 100) / 100 // 10 months (2 free)
  };
}

/**
 * Get all available tiers for display
 * @param {boolean} includeGodMode - Whether to include god_mode tier
 * @returns {Array} Array of tier objects
 */
export function getAvailableTiers(includeGodMode = false) {
  return Object.values(SUBSCRIPTION_TIERS)
    .filter(tier => includeGodMode || tier.id !== 'god_mode')
    .sort((a, b) => getTierLevel(a.id) - getTierLevel(b.id));
}

/**
 * Get upgrade path from current tier
 * @param {string} currentTierId - Current tier ID
 * @returns {Array} Array of available upgrade tiers
 */
export function getUpgradePath(currentTierId) {
  const currentLevel = getTierLevel(currentTierId);
  return TIER_HIERARCHY
    .slice(currentLevel + 1)
    .filter(tierId => tierId !== 'god_mode')
    .map(tierId => getTier(tierId));
}

/**
 * Validate tier ID
 * @param {string} tierId - Tier ID to validate
 * @returns {boolean} Whether tier ID is valid
 */
export function isValidTier(tierId) {
  return TIER_HIERARCHY.includes(tierId);
}

export default {
  SUBSCRIPTION_TIERS,
  TIER_HIERARCHY,
  SUBSCRIPTION_STATUS,
  TRIAL_CONFIG,
  SEAT_PRICING,
  getTier,
  getTierLevel,
  isTierHigherOrEqual,
  hasFeature,
  getLimit,
  isWithinLimit,
  calculateSeatPricing,
  getAvailableTiers,
  getUpgradePath,
  isValidTier
};
