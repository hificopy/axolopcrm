/**
 * Centralized Feature Flags Configuration
 *
 * This file manages all locked/coming soon features in the app.
 * When a feature is ready, simply change `locked: false` to enable it.
 *
 * The /roadmap page auto-generates from this config.
 */

export const FEATURES = {
  // Version info
  currentVersion: "V1.0",

  // Weekly rollout schedule - ONE FEATURE PER WEEK
  weeklyRollout: {
    enabled: true,
    startDate: "2025-01-27", // Monday start date
    marketingFocus: "Weekly feature drops with heavy promotion",
  },

  // Communication Features - Weekly Rollout V1.1
  communication: {
    phone: {
      id: "communication.phone",
      name: "Phone & Voicemail",
      description:
        "Make and receive calls, voicemail management with transcription",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-01-27", // Week 1
      weekNumber: 1,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "Never miss a call again",
    },
    dialer: {
      id: "communication.dialer",
      name: "Sales Dialer",
      description:
        "Power dialer for high-volume calling with automated workflows",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-02-03", // Week 2
      weekNumber: 2,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "10x your calling efficiency",
    },
    outcomes: {
      id: "communication.outcomes",
      name: "Call Outcomes",
      description: "Track and categorize call results with AI-powered insights",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-02-10", // Week 3
      weekNumber: 3,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "Know what works",
    },
    notetaker: {
      id: "communication.notetaker",
      name: "AI Notetaker BETA",
      description:
        "AI-powered call transcription and intelligent note extraction",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-02-17", // Week 4
      weekNumber: 4,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "Focus on the conversation, not the notes",
    },
    email: {
      id: "communication.email",
      name: "Email Integration",
      description: "Gmail/Outlook sync with smart email tracking",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-02-24", // Week 5
      weekNumber: 5,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "All your emails in one place",
    },
    templates: {
      id: "communication.templates",
      name: "Email Templates",
      description: "Reusable email templates with personalization tokens",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-03-03", // Week 6
      weekNumber: 6,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "Write once, use forever",
    },
    sendAs: {
      id: "communication.sendAs",
      name: "Send As Addresses",
      description: "Send emails from different team addresses",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-03-10", // Week 7
      weekNumber: 7,
      marketingHighlight: false,
      category: "Communication",
      priority: "low",
      tagline: "Flexible email sending",
    },
  },

  // Customization Features - V1.1 Weekly Rollout
  customization: {
    aiKnowledge: {
      id: "customization.aiKnowledge",
      name: "AI Knowledge Base",
      description: "Upload documents to train your AI assistant",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-03-17", // Week 8
      weekNumber: 8,
      marketingHighlight: true,
      category: "AI Features",
      priority: "high",
      tagline: "Make your AI smarter",
    },
  },

  // Account Features - V1.1 Weekly Rollout
  account: {
    appearance: {
      id: "account.appearance",
      name: "Dark Mode & Themes",
      description: "Customize app appearance with dark mode and themes",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-03-24", // Week 9
      weekNumber: 9,
      marketingHighlight: false,
      category: "Account",
      priority: "medium",
      tagline: "Make it yours",
    },
    twoFactor: {
      id: "account.twoFactor",
      name: "Two-Factor Auth",
      description: "Enhanced security with 2FA",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-03-31", // Week 10
      weekNumber: 10,
      marketingHighlight: false,
      category: "Account",
      priority: "medium",
      tagline: "Secure your account",
    },
    calendarSync: {
      id: "account.calendarSync",
      name: "Calendar Integration",
      description: "Sync with Google Calendar and Outlook",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-04-07", // Week 11
      weekNumber: 11,
      marketingHighlight: true,
      category: "Account",
      priority: "high",
      tagline: "Never miss a meeting",
    },
  },

  // Billing Features - V1.1 Weekly Rollout
  billing: {
    usage: {
      id: "billing.usage",
      name: "Usage Dashboard",
      description: "Track API usage and costs in real-time",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-04-14", // Week 12
      weekNumber: 12,
      marketingHighlight: false,
      category: "Billing",
      priority: "medium",
      tagline: "Know your usage",
    },
  },

  // User Menu Features - V1.1 Weekly Rollout
  userMenu: {
    importData: {
      id: "userMenu.importData",
      name: "Data Import Wizard",
      description: "Import leads and contacts from any CRM",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-04-21", // Week 13
      weekNumber: 13,
      marketingHighlight: true,
      category: "Data Management",
      priority: "high",
      tagline: "Switch in minutes",
    },
    automations: {
      id: "userMenu.automations",
      name: "Workflow Builder",
      description: "Create powerful automations with visual builder",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-04-28", // Week 14
      weekNumber: 14,
      marketingHighlight: true,
      category: "Automation",
      priority: "high",
      tagline: "Automate everything",
    },
    trash: {
      id: "userMenu.trash",
      name: "Recovery Bin",
      description: "Recover deleted items within 30 days",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-05-05", // Week 15
      weekNumber: 15,
      marketingHighlight: false,
      category: "Data Management",
      priority: "low",
      tagline: "Oops recovery",
    },
    archive: {
      id: "userMenu.archive",
      name: "Smart Archive",
      description: "Archive old data while keeping it searchable",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-05-12", // Week 16
      weekNumber: 16,
      marketingHighlight: false,
      category: "Data Management",
      priority: "low",
      tagline: "Clean but accessible",
    },
  },

  // Second Brain Features - V1.1 Weekly Rollout
  secondBrain: {
    chat: {
      id: "secondBrain.chat",
      name: "AI Assistant Chat",
      description: "Chat with your trained AI assistant",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-05-19", // Week 17
      weekNumber: 17,
      marketingHighlight: true,
      category: "AI Features",
      priority: "high",
      tagline: "Your AI co-pilot",
    },
    tasks: {
      id: "secondBrain.tasks",
      name: "AI Task Manager",
      description: "AI-assisted task management and prioritization",
      locked: true,
      version: "V1.1",
      releaseDate: "2025-05-26", // Week 18
      weekNumber: 18,
      marketingHighlight: false,
      category: "AI Features",
      priority: "medium",
      tagline: "Smart task management",
    },
  },

  // V1.2 Features - Next Quarter
  v12: {
    teams: {
      id: "v12.teams",
      name: "Team Collaboration",
      description: "Real-time team collaboration and management",
      locked: true,
      version: "V1.2",
      releaseDate: "2025-06-02", // Week 19
      weekNumber: 19,
      marketingHighlight: true,
      category: "Collaboration",
      priority: "high",
      tagline: "Better together",
    },
    mobile: {
      id: "v12.mobile",
      name: "Mobile App",
      description: "Native iOS and Android apps",
      locked: true,
      version: "V1.2",
      releaseDate: "2025-06-09", // Week 20
      weekNumber: 20,
      marketingHighlight: true,
      category: "Mobile",
      priority: "high",
      tagline: "CRM on the go",
    },
    analytics: {
      id: "v12.analytics",
      name: "Advanced Analytics",
      description: "Business intelligence and custom reports",
      locked: true,
      version: "V1.2",
      releaseDate: "2025-06-16", // Week 21
      weekNumber: 21,
      marketingHighlight: false,
      category: "Analytics",
      priority: "medium",
      tagline: "Data-driven decisions",
    },
  },
};

/**
 * Get all locked features as a flat array
 * @returns {Array}
 */
export const getAllLockedFeatures = () => {
  const locked = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.locked) {
          locked.push({
            ...feature,
            categoryKey,
            featureKey,
          });
        }
      });
    }
  });

  return locked;
};

/**
 * Get features grouped by version
 * @returns {object}
 */
export const getFeaturesByVersion = () => {
  const versions = {};

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (typeof category === "object" && categoryKey !== "currentVersion") {
      Object.entries(category).forEach(([featureKey, feature]) => {
        const version = feature.version || "Unknown";
        if (!versions[version]) {
          versions[version] = [];
        }
        versions[version].push({
          ...feature,
          categoryKey,
          featureKey,
        });
      });
    }
  });

  return versions;
};

/**
 * Get features grouped by category
 * @returns {object}
 */
export const getFeaturesByCategory = () => {
  const categories = {};

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (typeof category === "object" && categoryKey !== "currentVersion") {
      Object.entries(category).forEach(([featureKey, feature]) => {
        const cat = feature.category || "Other";
        if (!categories[cat]) {
          categories[cat] = [];
        }
        categories[cat].push({
          ...feature,
          categoryKey,
          featureKey,
        });
      });
    }
  });

  return categories;
};

/**
 * Get features by week number
 * @returns {object} - Features grouped by week
 */
export const getFeaturesByWeek = () => {
  const weeks = {};

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.weekNumber) {
          if (!weeks[feature.weekNumber]) {
            weeks[feature.weekNumber] = [];
          }
          weeks[feature.weekNumber].push({
            ...feature,
            categoryKey,
            featureKey,
          });
        }
      });
    }
  });

  return weeks;
};

/**
 * Get features scheduled for this week
 * @returns {Array} - Features releasing this week
 */
export const getThisWeekFeatures = () => {
  const today = new Date();
  const weekStart = new Date(
    today.setDate(today.getDate() - today.getDay() + 1),
  ); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

  const thisWeek = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.releaseDate) {
          const releaseDate = new Date(feature.releaseDate);
          if (releaseDate >= weekStart && releaseDate <= weekEnd) {
            thisWeek.push({
              ...feature,
              categoryKey,
              featureKey,
            });
          }
        }
      });
    }
  });

  return thisWeek;
};

/**
 * Get next week's features
 * @returns {Array} - Features releasing next week
 */
export const getNextWeekFeatures = () => {
  const today = new Date();
  const nextWeekStart = new Date(
    today.setDate(today.getDate() - today.getDay() + 8),
  ); // Next Monday
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6); // Next Sunday

  const nextWeek = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.releaseDate) {
          const releaseDate = new Date(feature.releaseDate);
          if (releaseDate >= nextWeekStart && releaseDate <= nextWeekEnd) {
            nextWeek.push({
              ...feature,
              categoryKey,
              featureKey,
            });
          }
        }
      });
    }
  });

  return nextWeek;
};

/**
 * Get marketing highlight features
 * @returns {Array} - Features marked for marketing highlights
 */
export const getMarketingHighlights = () => {
  const highlights = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.marketingHighlight) {
          highlights.push({
            ...feature,
            categoryKey,
            featureKey,
          });
        }
      });
    }
  });

  return highlights.sort((a, b) => a.weekNumber - b.weekNumber);
};

/**
 * Get countdown to next feature release
 * @returns {object} - Countdown info
 */
export const getNextFeatureCountdown = () => {
  const today = new Date();
  let nextFeature = null;
  let minDiff = Infinity;

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.releaseDate && feature.locked) {
          const releaseDate = new Date(feature.releaseDate);
          const diff = releaseDate - today;

          if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextFeature = {
              ...feature,
              categoryKey,
              featureKey,
              daysUntil: Math.ceil(diff / (1000 * 60 * 60 * 24)),
            };
          }
        }
      });
    }
  });

  return nextFeature;
};

/**
 * Check if a feature is locked
 * @param {string} categoryKey - Category key
 * @param {string} featureKey - Feature key
 * @returns {boolean} - Whether the feature is locked
 */
export const isFeatureLocked = (categoryKey, featureKey) => {
  const category = FEATURES[categoryKey];
  if (!category || typeof category !== 'object') return true;

  const feature = category[featureKey];
  if (!feature || typeof feature !== 'object') return true;

  return feature.locked === true;
};

/**
 * Get the version a feature will be released in
 * @param {string} categoryKey - Category key
 * @param {string} featureKey - Feature key
 * @returns {string|null} - Version string or null
 */
export const getFeatureVersion = (categoryKey, featureKey) => {
  const category = FEATURES[categoryKey];
  if (!category || typeof category !== 'object') return null;

  const feature = category[featureKey];
  if (!feature || typeof feature !== 'object') return null;

  return feature.version || null;
};

export default FEATURES;
