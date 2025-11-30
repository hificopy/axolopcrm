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
  currentVersion: 'V1.0',

  // Communication Features - Coming in V1.1
  communication: {
    phone: {
      id: 'communication.phone',
      name: 'Phone & Voicemail',
      description: 'Make and receive calls, voicemail management',
      locked: true,
      version: 'V1.1',
      releaseDate: null, // Set when ready: '2025-02-01'
      category: 'Communication'
    },
    dialer: {
      id: 'communication.dialer',
      name: 'Sales Dialer',
      description: 'Power dialer for high-volume calling',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Communication'
    },
    outcomes: {
      id: 'communication.outcomes',
      name: 'Call Outcomes',
      description: 'Track and categorize call results',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Communication'
    },
    notetaker: {
      id: 'communication.notetaker',
      name: 'Notetaker BETA',
      description: 'AI-powered call transcription and notes',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Communication'
    },
    email: {
      id: 'communication.email',
      name: 'Email Settings',
      description: 'Email configuration and preferences',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Communication'
    },
    templates: {
      id: 'communication.templates',
      name: 'Templates & Snippets',
      description: 'Reusable email and message templates',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Communication'
    },
    sendAs: {
      id: 'communication.sendAs',
      name: 'Send As',
      description: 'Send emails from different addresses',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Communication'
    }
  },

  // Customization Features
  customization: {
    aiKnowledge: {
      id: 'customization.aiKnowledge',
      name: 'AI Knowledge Sources',
      description: 'Upload documents to train AI assistant',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Customization'
    }
  },

  // Account Features
  account: {
    appearance: {
      id: 'account.appearance',
      name: 'Appearance Settings',
      description: 'Customize app theme and layout',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Account'
    },
    twoFactor: {
      id: 'account.twoFactor',
      name: 'Two-Factor Authentication',
      description: 'Enhanced security with 2FA',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Account'
    },
    calendarSync: {
      id: 'account.calendarSync',
      name: 'Calendar Sync',
      description: 'Sync with external calendars',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Account'
    }
  },

  // Billing Features
  billing: {
    usage: {
      id: 'billing.usage',
      name: 'Usage Analytics',
      description: 'Track API usage and costs',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Billing'
    }
  },

  // User Menu Features
  userMenu: {
    importData: {
      id: 'userMenu.importData',
      name: 'Import Data',
      description: 'Import leads, contacts, and data from other CRMs',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Data Management'
    },
    automations: {
      id: 'userMenu.automations',
      name: 'Automations',
      description: 'Create workflow automations and triggers',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Automation'
    },
    trash: {
      id: 'userMenu.trash',
      name: 'Trash',
      description: 'Recover deleted items',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Data Management'
    },
    archive: {
      id: 'userMenu.archive',
      name: 'Archive',
      description: 'View archived items',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'Data Management'
    },
    teams: {
      id: 'userMenu.teams',
      name: 'Teams',
      description: 'Team collaboration and management',
      locked: true,
      version: 'V1.2',
      releaseDate: null,
      category: 'Collaboration'
    }
  },

  // Second Brain Features
  secondBrain: {
    chat: {
      id: 'secondBrain.chat',
      name: 'AI Chat',
      description: 'Chat with your AI assistant',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'AI Features'
    },
    tasks: {
      id: 'secondBrain.tasks',
      name: 'AI Tasks',
      description: 'AI-assisted task management',
      locked: true,
      version: 'V1.1',
      releaseDate: null,
      category: 'AI Features'
    }
  }
};

/**
 * Check if a feature is locked
 * @param {string} category - Feature category (e.g., 'communication')
 * @param {string} feature - Feature key (e.g., 'phone')
 * @returns {boolean}
 */
export const isFeatureLocked = (category, feature) => {
  return FEATURES?.[category]?.[feature]?.locked ?? false;
};

/**
 * Get the version a feature will be released in
 * @param {string} category
 * @param {string} feature
 * @returns {string|null}
 */
export const getFeatureVersion = (category, feature) => {
  return FEATURES?.[category]?.[feature]?.version ?? null;
};

/**
 * Get feature details
 * @param {string} category
 * @param {string} feature
 * @returns {object|null}
 */
export const getFeatureDetails = (category, feature) => {
  return FEATURES?.[category]?.[feature] ?? null;
};

/**
 * Get all locked features as a flat array
 * @returns {Array}
 */
export const getAllLockedFeatures = () => {
  const locked = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (typeof category === 'object' && categoryKey !== 'currentVersion') {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.locked) {
          locked.push({
            ...feature,
            categoryKey,
            featureKey
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
    if (typeof category === 'object' && categoryKey !== 'currentVersion') {
      Object.entries(category).forEach(([featureKey, feature]) => {
        const version = feature.version || 'Unknown';
        if (!versions[version]) {
          versions[version] = [];
        }
        versions[version].push({
          ...feature,
          categoryKey,
          featureKey
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
    if (typeof category === 'object' && categoryKey !== 'currentVersion') {
      Object.entries(category).forEach(([featureKey, feature]) => {
        const cat = feature.category || 'Other';
        if (!categories[cat]) {
          categories[cat] = [];
        }
        categories[cat].push({
          ...feature,
          categoryKey,
          featureKey
        });
      });
    }
  });

  return categories;
};

export default FEATURES;
