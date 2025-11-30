/**
 * Feature Gating System
 * Controls access to features based on user's pricing tier
 */

export const PRICING_TIERS = {
  SALES: "sales",
  BUILD: "build",
  SCALE: "scale",
  GOD: "god",
};

export const FEATURES = {
  // Core CRM Features (Available in all tiers)
  LEADS: "leads",
  CONTACTS: "contacts",
  OPPORTUNITIES: "opportunities",
  CALENDAR: "calendar",

  // Marketing & Automation (Build + Scale)
  FORMS_UNLIMITED: "forms_unlimited",
  EMAIL_MARKETING: "email_marketing",
  WORKFLOWS_BASIC: "workflows_basic",
  AI_SCORING: "ai_scoring",

  // Advanced Features (Scale only)
  EMAIL_UNLIMITED: "email_unlimited",
  WORKFLOWS_FULL: "workflows_full",
  AI_FULL: "ai_full",
  AI_ASSISTANT: "ai_assistant",
  REPORTS_CUSTOM: "reports_custom",
  API_ACCESS: "api_access",
  WHITE_LABEL: "white_label",

  // Future Features (Not yet released)
  MOBILE_APP: "mobile_app",
  ADVANCED_ANALYTICS: "advanced_analytics",
};

export const FEATURE_ACCESS = {
  [FEATURES.LEADS]: {
    tiers: [
      PRICING_TIERS.SALES,
      PRICING_TIERS.BUILD,
      PRICING_TIERS.SCALE,
      PRICING_TIERS.GOD,
    ],
    name: "Lead Management",
    description: "Manage and track leads through your pipeline",
    released: true,
  },

  [FEATURES.CONTACTS]: {
    tiers: [
      PRICING_TIERS.SALES,
      PRICING_TIERS.BUILD,
      PRICING_TIERS.SCALE,
      PRICING_TIERS.GOD,
    ],
    name: "Contact Management",
    description: "Organize and manage all customer contacts",
    released: true,
  },

  [FEATURES.OPPORTUNITIES]: {
    tiers: [
      PRICING_TIERS.SALES,
      PRICING_TIERS.BUILD,
      PRICING_TIERS.SCALE,
      PRICING_TIERS.GOD,
    ],
    name: "Opportunities Pipeline",
    description: "Track deals through your sales pipeline",
    released: true,
  },

  [FEATURES.CALENDAR]: {
    tiers: [
      PRICING_TIERS.SALES,
      PRICING_TIERS.BUILD,
      PRICING_TIERS.SCALE,
      PRICING_TIERS.GOD,
    ],
    name: "Calendar & Scheduling",
    description: "Integrated calendar and meeting scheduling",
    released: true,
  },

  [FEATURES.FORMS_UNLIMITED]: {
    tiers: [PRICING_TIERS.BUILD, PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Unlimited Forms",
    description: "Create unlimited custom forms for lead capture",
    released: true,
  },

  [FEATURES.EMAIL_MARKETING]: {
    tiers: [PRICING_TIERS.BUILD, PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Email Marketing",
    description: "Send marketing emails and newsletters",
    released: true,
  },

  [FEATURES.WORKFLOWS_BASIC]: {
    tiers: [PRICING_TIERS.BUILD, PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Basic Workflows",
    description: "Automate repetitive tasks and processes",
    released: true,
  },

  [FEATURES.AI_SCORING]: {
    tiers: [PRICING_TIERS.BUILD, PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "AI Lead Scoring",
    description: "Automatically score and prioritize leads",
    released: true,
  },

  [FEATURES.EMAIL_UNLIMITED]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Unlimited Email Marketing",
    description: "Unlimited email campaigns and sends",
    released: true,
  },

  [FEATURES.WORKFLOWS_FULL]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Full Workflows",
    description: "Advanced workflow automation with complex logic",
    released: true,
  },

  [FEATURES.AI_FULL]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Full AI Features",
    description: "Complete AI-powered features and insights",
    released: true,
  },

  [FEATURES.AI_ASSISTANT]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "AI Assistant & Transcription",
    description: "AI assistant and call transcription services",
    released: true,
  },

  [FEATURES.REPORTS_CUSTOM]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Custom Reports",
    description: "Customizable reports and dashboards",
    released: true,
  },

  [FEATURES.API_ACCESS]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "API Access",
    description: "Full API access for custom integrations",
    released: true,
  },

  [FEATURES.WHITE_LABEL]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "White Label",
    description: "Custom branding and domain options",
    released: true,
  },

  [FEATURES.MOBILE_APP]: {
    tiers: [PRICING_TIERS.BUILD, PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Mobile App",
    description: "Native iOS and Android applications",
    released: false,
    roadmapETA: "Q2 2026",
  },

  [FEATURES.ADVANCED_ANALYTICS]: {
    tiers: [PRICING_TIERS.SCALE, PRICING_TIERS.GOD],
    name: "Advanced Analytics",
    description: "Predictive analytics and business insights",
    released: false,
    roadmapETA: "Q3 2026",
  },
};

/**
 * Check if user can access a feature
 */
export const canAccessFeature = (
  featureId,
  userTier,
  hasActiveTrial = false,
) => {
  const feature = FEATURE_ACCESS[featureId];

  if (!feature) return false;
  if (!feature.released) return false;

  // God mode has access to everything
  if (userTier === PRICING_TIERS.GOD) return true;

  // During active trial, user has access to their tier features
  if (hasActiveTrial) {
    return feature.tiers.includes(userTier);
  }

  return feature.tiers.includes(userTier);
};

/**
 * Get upgrade message for a feature
 */
export const getUpgradeMessage = (featureId, currentTier) => {
  const feature = FEATURE_ACCESS[featureId];

  if (!feature) return null;

  // Find the lowest tier that has this feature
  const tierHierarchy = [
    PRICING_TIERS.SALES,
    PRICING_TIERS.BUILD,
    PRICING_TIERS.SCALE,
  ];
  const requiredTier = tierHierarchy.find((tier) =>
    feature.tiers.includes(tier),
  );

  if (!requiredTier) return null;

  const tierNames = {
    [PRICING_TIERS.SALES]: "Sales",
    [PRICING_TIERS.BUILD]: "Build",
    [PRICING_TIERS.SCALE]: "Scale",
  };

  return {
    requiredTier,
    message: `Upgrade to ${tierNames[requiredTier]} to unlock ${feature.name}`,
    description: feature.description,
  };
};

/**
 * Get all features for a specific tier
 */
export const getFeaturesForTier = (tier) => {
  return Object.entries(FEATURE_ACCESS)
    .filter(([_, feature]) => feature.tiers.includes(tier) && feature.released)
    .map(([id, feature]) => ({
      id,
      name: feature.name,
      description: feature.description,
    }));
};

/**
 * Get plan details
 */
export const getPlanDetails = (tier) => {
  const plans = {
    [PRICING_TIERS.SALES]: {
      name: "Sales",
      price: "$67",
      yearlyPrice: "$54",
      icon: "🚀",
      features: getFeaturesForTier(PRICING_TIERS.SALES),
    },
    [PRICING_TIERS.BUILD]: {
      name: "Build",
      price: "$187",
      yearlyPrice: "$149",
      icon: "🏗️",
      features: getFeaturesForTier(PRICING_TIERS.BUILD),
    },
    [PRICING_TIERS.SCALE]: {
      name: "Scale",
      price: "$349",
      yearlyPrice: "$279",
      icon: "📈",
      features: getFeaturesForTier(PRICING_TIERS.SCALE),
    },
  };

  return plans[tier] || plans[PRICING_TIERS.SALES];
};
