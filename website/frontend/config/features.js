/**
 * Centralized Feature Flags & Roadmap Configuration
 *
 * Axolop CRM Product Roadmap
 * Current Version: V1.3 (November 30, 2025)
 *
 * Strategy: One main feature per month + weekly small features/bug fixes
 *
 * This file manages all features - both released and upcoming.
 * The /roadmap page auto-generates from this config.
 */

export const FEATURES = {
  // Version info
  currentVersion: "V1.3",
  launchDate: "2025-11-30",

  // Weekly rollout schedule
  weeklyRollout: {
    enabled: true,
    startDate: "2025-12-02", // Monday after V1.3 launch
    marketingFocus: "Monthly main features + weekly enhancements",
  },

  // ============================================
  // RELEASED FEATURES (V1.0 - V1.3)
  // These are the current capabilities
  // ============================================

  released: {
    // V1.0 - Foundation (Launched)
    leadManagement: {
      id: "released.leadManagement",
      name: "Lead Management",
      description: "Import, organize, and manage leads with custom fields and bulk actions",
      locked: false,
      version: "V1.0",
      releaseDate: "2025-09-01",
      category: "Sales",
      priority: "high",
      tagline: "Your leads, organized",
    },
    pipeline: {
      id: "released.pipeline",
      name: "Sales Pipeline",
      description: "Visual drag-and-drop pipeline with customizable stages and deal tracking",
      locked: false,
      version: "V1.0",
      releaseDate: "2025-09-01",
      category: "Sales",
      priority: "high",
      tagline: "Close deals faster",
    },
    contacts: {
      id: "released.contacts",
      name: "Contact Management",
      description: "Centralized contact database with activity history and relationship tracking",
      locked: false,
      version: "V1.0",
      releaseDate: "2025-09-01",
      category: "Sales",
      priority: "high",
      tagline: "Know your customers",
    },
    customFields: {
      id: "released.customFields",
      name: "Custom Fields",
      description: "Create unlimited custom fields for leads, contacts, and deals",
      locked: false,
      version: "V1.0",
      releaseDate: "2025-09-15",
      category: "Customization",
      priority: "high",
      tagline: "Your data, your way",
    },

    // V1.1 - Forms & Calendar (Launched)
    formBuilder: {
      id: "released.formBuilder",
      name: "Form Builder",
      description: "Create custom forms with drag-and-drop builder and conditional logic",
      locked: false,
      version: "V1.1",
      releaseDate: "2025-10-01",
      category: "Marketing",
      priority: "high",
      tagline: "Capture every lead",
    },
    calendar: {
      id: "released.calendar",
      name: "Calendar & Scheduling",
      description: "Built-in calendar with booking links and availability management",
      locked: false,
      version: "V1.1",
      releaseDate: "2025-10-15",
      category: "Productivity",
      priority: "high",
      tagline: "Never miss a meeting",
    },

    // V1.2 - Agency Features (Launched)
    agencySelector: {
      id: "released.agencySelector",
      name: "Multi-Agency Management",
      description: "Switch between multiple agencies with unified dashboard view",
      locked: false,
      version: "V1.2",
      releaseDate: "2025-11-01",
      category: "Agency",
      priority: "high",
      tagline: "Manage all agencies in one place",
    },
    dataImport: {
      id: "released.dataImport",
      name: "CSV Data Import",
      description: "Import leads and contacts from CSV with field mapping",
      locked: false,
      version: "V1.2",
      releaseDate: "2025-11-10",
      category: "Data",
      priority: "medium",
      tagline: "Migrate in minutes",
    },

    // V1.3 - Optimization (Launching Today!)
    systemCleanup: {
      id: "released.systemCleanup",
      name: "System Optimization",
      description: "Performance improvements, bug fixes, and stability enhancements",
      locked: false,
      version: "V1.3",
      releaseDate: "2025-11-30",
      category: "System",
      priority: "high",
      tagline: "Faster, smoother, better",
    },
  },

  // ============================================
  // V1.4 - COMMUNICATION & EMAIL (December 2025)
  // Main Feature: Email Integration
  // ============================================

  v14: {
    // MAIN FEATURE - Week 1
    emailIntegration: {
      id: "v14.emailIntegration",
      name: "Email Integration",
      description: "Connect Gmail and Outlook for two-way email sync, tracking, and sending directly from CRM",
      locked: true,
      version: "V1.4",
      releaseDate: "2025-12-02", // Week 1
      weekNumber: 1,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "All your emails, one inbox",
      isMainFeature: true,
    },
    // Week 2 - Enhancement
    emailTemplates: {
      id: "v14.emailTemplates",
      name: "Email Templates",
      description: "Create reusable email templates with merge fields and personalization tokens",
      locked: true,
      version: "V1.4",
      releaseDate: "2025-12-09", // Week 2
      weekNumber: 2,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "Write once, send always",
    },
    // Week 3 - Enhancement
    emailTracking: {
      id: "v14.emailTracking",
      name: "Email Open & Click Tracking",
      description: "Track when emails are opened and links are clicked with real-time notifications",
      locked: true,
      version: "V1.4",
      releaseDate: "2025-12-16", // Week 3
      weekNumber: 3,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "Know when they engage",
    },
    // Week 4 - Enhancement
    bulkEmail: {
      id: "v14.bulkEmail",
      name: "Bulk Email Sending",
      description: "Send personalized emails to multiple contacts with scheduling and deliverability tracking",
      locked: true,
      version: "V1.4",
      releaseDate: "2025-12-23", // Week 4
      weekNumber: 4,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "Reach everyone at once",
    },
  },

  // ============================================
  // V1.5 - AUTOMATION & WORKFLOWS (January 2026)
  // Main Feature: Visual Workflow Builder
  // ============================================

  v15: {
    // MAIN FEATURE - Week 5
    workflowBuilder: {
      id: "v15.workflowBuilder",
      name: "Visual Workflow Builder",
      description: "Create powerful automations with drag-and-drop visual builder, triggers, conditions, and actions",
      locked: true,
      version: "V1.5",
      releaseDate: "2026-01-06", // Week 5
      weekNumber: 5,
      marketingHighlight: true,
      category: "Automation",
      priority: "high",
      tagline: "Automate everything",
      isMainFeature: true,
    },
    // Week 6 - Enhancement
    emailSequences: {
      id: "v15.emailSequences",
      name: "Email Sequences",
      description: "Create automated email drip campaigns with smart timing and behavior-based triggers",
      locked: true,
      version: "V1.5",
      releaseDate: "2026-01-13", // Week 6
      weekNumber: 6,
      marketingHighlight: true,
      category: "Automation",
      priority: "high",
      tagline: "Nurture on autopilot",
    },
    // Week 7 - Enhancement
    taskAutomation: {
      id: "v15.taskAutomation",
      name: "Task Automation",
      description: "Auto-create tasks based on lead actions, deal stages, or custom triggers",
      locked: true,
      version: "V1.5",
      releaseDate: "2026-01-20", // Week 7
      weekNumber: 7,
      marketingHighlight: false,
      category: "Automation",
      priority: "medium",
      tagline: "Never forget a follow-up",
    },
    // Week 8 - Enhancement
    webhooks: {
      id: "v15.webhooks",
      name: "Webhooks & API Events",
      description: "Send and receive data to/from external apps with custom webhooks",
      locked: true,
      version: "V1.5",
      releaseDate: "2026-01-27", // Week 8
      weekNumber: 8,
      marketingHighlight: false,
      category: "Integrations",
      priority: "medium",
      tagline: "Connect to anything",
    },
  },

  // ============================================
  // V1.6 - ANALYTICS & REPORTING (February 2026)
  // Main Feature: Advanced Analytics Dashboard
  // ============================================

  v16: {
    // MAIN FEATURE - Week 9
    advancedAnalytics: {
      id: "v16.advancedAnalytics",
      name: "Advanced Analytics Dashboard",
      description: "Real-time sales analytics with custom KPIs, forecasting, and team performance metrics",
      locked: true,
      version: "V1.6",
      releaseDate: "2026-02-02", // Week 9
      weekNumber: 9,
      marketingHighlight: true,
      category: "Analytics",
      priority: "high",
      tagline: "Data-driven decisions",
      isMainFeature: true,
    },
    // Week 10 - Enhancement
    customReports: {
      id: "v16.customReports",
      name: "Custom Report Builder",
      description: "Build custom reports with drag-and-drop fields, filters, and visualizations",
      locked: true,
      version: "V1.6",
      releaseDate: "2026-02-09", // Week 10
      weekNumber: 10,
      marketingHighlight: false,
      category: "Analytics",
      priority: "medium",
      tagline: "Reports your way",
    },
    // Week 11 - Enhancement
    goalTracking: {
      id: "v16.goalTracking",
      name: "Sales Goals & Leaderboards",
      description: "Set team and individual goals with real-time progress tracking and gamification",
      locked: true,
      version: "V1.6",
      releaseDate: "2026-02-16", // Week 11
      weekNumber: 11,
      marketingHighlight: true,
      category: "Analytics",
      priority: "high",
      tagline: "Motivate your team",
    },
    // Week 12 - Enhancement
    exportReports: {
      id: "v16.exportReports",
      name: "Scheduled Report Exports",
      description: "Auto-export reports to PDF/CSV and email them on a schedule",
      locked: true,
      version: "V1.6",
      releaseDate: "2026-02-23", // Week 12
      weekNumber: 12,
      marketingHighlight: false,
      category: "Analytics",
      priority: "low",
      tagline: "Reports delivered",
    },
  },

  // ============================================
  // V1.7 - AI & INTELLIGENCE (March 2026)
  // Main Feature: AI Sales Assistant
  // ============================================

  v17: {
    // MAIN FEATURE - Week 13
    aiAssistant: {
      id: "v17.aiAssistant",
      name: "AI Sales Assistant",
      description: "AI-powered assistant that suggests next best actions, drafts emails, and provides deal insights",
      locked: true,
      version: "V1.7",
      releaseDate: "2026-03-02", // Week 13
      weekNumber: 13,
      marketingHighlight: true,
      category: "AI Features",
      priority: "high",
      tagline: "Your AI co-pilot",
      isMainFeature: true,
    },
    // Week 14 - Enhancement
    aiLeadScoring: {
      id: "v17.aiLeadScoring",
      name: "AI Lead Scoring",
      description: "Machine learning-powered lead scoring based on behavior, engagement, and historical data",
      locked: true,
      version: "V1.7",
      releaseDate: "2026-03-09", // Week 14
      weekNumber: 14,
      marketingHighlight: true,
      category: "AI Features",
      priority: "high",
      tagline: "Focus on hot leads",
    },
    // Week 15 - Enhancement
    aiEmailWriter: {
      id: "v17.aiEmailWriter",
      name: "AI Email Writer",
      description: "Generate personalized email drafts with AI based on contact context and conversation history",
      locked: true,
      version: "V1.7",
      releaseDate: "2026-03-16", // Week 15
      weekNumber: 15,
      marketingHighlight: false,
      category: "AI Features",
      priority: "medium",
      tagline: "Write emails in seconds",
    },
    // Week 16 - Enhancement
    aiInsights: {
      id: "v17.aiInsights",
      name: "AI Deal Insights",
      description: "Get AI-powered predictions on deal win probability and recommended actions",
      locked: true,
      version: "V1.7",
      releaseDate: "2026-03-23", // Week 16
      weekNumber: 16,
      marketingHighlight: false,
      category: "AI Features",
      priority: "medium",
      tagline: "Predict your wins",
    },
  },

  // ============================================
  // V1.8 - CALLING & COMMUNICATION (April 2026)
  // Main Feature: Built-in Phone System
  // ============================================

  v18: {
    // MAIN FEATURE - Week 17
    phoneSystem: {
      id: "v18.phoneSystem",
      name: "Built-in Phone System",
      description: "Make and receive calls directly from CRM with call recording, voicemail, and transcription",
      locked: true,
      version: "V1.8",
      releaseDate: "2026-04-06", // Week 17
      weekNumber: 17,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "Call from anywhere",
      isMainFeature: true,
    },
    // Week 18 - Enhancement
    powerDialer: {
      id: "v18.powerDialer",
      name: "Power Dialer",
      description: "Automated dialing for high-volume outreach with call queues and disposition tracking",
      locked: true,
      version: "V1.8",
      releaseDate: "2026-04-13", // Week 18
      weekNumber: 18,
      marketingHighlight: true,
      category: "Communication",
      priority: "high",
      tagline: "10x your calling",
    },
    // Week 19 - Enhancement
    smsMessaging: {
      id: "v18.smsMessaging",
      name: "SMS Messaging",
      description: "Send and receive SMS messages from CRM with templates and automation support",
      locked: true,
      version: "V1.8",
      releaseDate: "2026-04-20", // Week 19
      weekNumber: 19,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "Text your leads",
    },
    // Week 20 - Enhancement
    callAnalytics: {
      id: "v18.callAnalytics",
      name: "Call Analytics & Coaching",
      description: "Track call metrics, analyze talk time ratios, and get AI coaching suggestions",
      locked: true,
      version: "V1.8",
      releaseDate: "2026-04-27", // Week 20
      weekNumber: 20,
      marketingHighlight: false,
      category: "Communication",
      priority: "medium",
      tagline: "Master your calls",
    },
  },

  // ============================================
  // V2.0 - MAJOR RELEASE (May 2026)
  // Main Feature: Mobile App + Team Collaboration
  // ============================================

  v20: {
    // MAIN FEATURE - Week 21
    mobileApp: {
      id: "v20.mobileApp",
      name: "Mobile App (iOS & Android)",
      description: "Native mobile apps with offline support, push notifications, and full CRM access on the go",
      locked: true,
      version: "V2.0",
      releaseDate: "2026-05-04", // Week 21
      weekNumber: 21,
      marketingHighlight: true,
      category: "Mobile",
      priority: "high",
      tagline: "CRM in your pocket",
      isMainFeature: true,
    },
    // Week 22 - Enhancement
    teamCollaboration: {
      id: "v20.teamCollaboration",
      name: "Team Collaboration Hub",
      description: "Real-time team chat, @mentions, shared notes, and activity feeds for seamless collaboration",
      locked: true,
      version: "V2.0",
      releaseDate: "2026-05-11", // Week 22
      weekNumber: 22,
      marketingHighlight: true,
      category: "Collaboration",
      priority: "high",
      tagline: "Work better together",
    },
    // Week 23 - Enhancement
    advancedPermissions: {
      id: "v20.advancedPermissions",
      name: "Advanced Role Permissions",
      description: "Granular permission controls with custom roles, field-level access, and audit logging",
      locked: true,
      version: "V2.0",
      releaseDate: "2026-05-18", // Week 23
      weekNumber: 23,
      marketingHighlight: false,
      category: "Security",
      priority: "medium",
      tagline: "Control who sees what",
    },
    // Week 24 - Enhancement
    whiteLabel: {
      id: "v20.whiteLabel",
      name: "White-Label Branding",
      description: "Fully customize CRM branding with your logo, colors, and custom domain",
      locked: true,
      version: "V2.0",
      releaseDate: "2026-05-25", // Week 24
      weekNumber: 24,
      marketingHighlight: true,
      category: "Agency",
      priority: "high",
      tagline: "Make it yours",
    },
  },

  // ============================================
  // FUTURE VISION (Q3-Q4 2026)
  // Ideas being explored
  // ============================================

  future: {
    marketplace: {
      id: "future.marketplace",
      name: "Integration Marketplace",
      description: "One-click integrations with 100+ popular business tools",
      locked: true,
      version: "V2.1",
      releaseDate: "2026-06-01",
      weekNumber: 25,
      marketingHighlight: true,
      category: "Integrations",
      priority: "high",
      tagline: "Connect everything",
    },
    aiNotetaker: {
      id: "future.aiNotetaker",
      name: "AI Meeting Notetaker",
      description: "AI-powered meeting transcription with automatic CRM updates and action items",
      locked: true,
      version: "V2.1",
      releaseDate: "2026-06-15",
      weekNumber: 27,
      marketingHighlight: true,
      category: "AI Features",
      priority: "high",
      tagline: "Focus on the conversation",
    },
    proposals: {
      id: "future.proposals",
      name: "Proposal & Quote Builder",
      description: "Create beautiful proposals and quotes with e-signatures and payment integration",
      locked: true,
      version: "V2.2",
      releaseDate: "2026-07-01",
      weekNumber: 29,
      marketingHighlight: true,
      category: "Sales",
      priority: "high",
      tagline: "Close deals faster",
    },
    customerPortal: {
      id: "future.customerPortal",
      name: "Customer Self-Service Portal",
      description: "Branded portal for customers to view projects, submit tickets, and access documents",
      locked: true,
      version: "V2.2",
      releaseDate: "2026-08-01",
      weekNumber: 33,
      marketingHighlight: false,
      category: "Customer Success",
      priority: "medium",
      tagline: "Empower your customers",
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
      categoryKey !== "launchDate" &&
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
 * Get all released features as a flat array
 * @returns {Array}
 */
export const getReleasedFeatures = () => {
  const released = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "launchDate" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (!feature.locked) {
          released.push({
            ...feature,
            categoryKey,
            featureKey,
          });
        }
      });
    }
  });

  return released;
};

/**
 * Get features grouped by version
 * @returns {object}
 */
export const getFeaturesByVersion = () => {
  const versions = {};

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "launchDate" &&
      categoryKey !== "weeklyRollout"
    ) {
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

  // Sort versions properly
  const sortedVersions = {};
  const versionOrder = ["V1.0", "V1.1", "V1.2", "V1.3", "V1.4", "V1.5", "V1.6", "V1.7", "V1.8", "V2.0", "V2.1", "V2.2"];
  versionOrder.forEach(v => {
    if (versions[v]) {
      sortedVersions[v] = versions[v];
    }
  });

  return sortedVersions;
};

/**
 * Get features grouped by category
 * @returns {object}
 */
export const getFeaturesByCategory = () => {
  const categories = {};

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "launchDate" &&
      categoryKey !== "weeklyRollout"
    ) {
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
      categoryKey !== "launchDate" &&
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
    today.setDate(today.getDate() - today.getDay() + 1)
  ); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

  const thisWeek = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "launchDate" &&
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
    today.setDate(today.getDate() - today.getDay() + 8)
  ); // Next Monday
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6); // Next Sunday

  const nextWeek = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "launchDate" &&
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
      categoryKey !== "launchDate" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.marketingHighlight && feature.locked) {
          highlights.push({
            ...feature,
            categoryKey,
            featureKey,
          });
        }
      });
    }
  });

  return highlights.sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0));
};

/**
 * Get main features (one per month/version)
 * @returns {Array} - Main feature releases
 */
export const getMainFeatures = () => {
  const mainFeatures = [];

  Object.entries(FEATURES).forEach(([categoryKey, category]) => {
    if (
      typeof category === "object" &&
      categoryKey !== "currentVersion" &&
      categoryKey !== "launchDate" &&
      categoryKey !== "weeklyRollout"
    ) {
      Object.entries(category).forEach(([featureKey, feature]) => {
        if (feature.isMainFeature) {
          mainFeatures.push({
            ...feature,
            categoryKey,
            featureKey,
          });
        }
      });
    }
  });

  return mainFeatures.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
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
      categoryKey !== "launchDate" &&
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
  if (!category || typeof category !== "object") return true;

  const feature = category[featureKey];
  if (!feature || typeof feature !== "object") return true;

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
  if (!category || typeof category !== "object") return null;

  const feature = category[featureKey];
  if (!feature || typeof feature !== "object") return null;

  return feature.version || null;
};

export default FEATURES;
