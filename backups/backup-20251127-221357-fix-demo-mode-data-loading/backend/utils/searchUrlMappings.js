/**
 * Backend Search URL Mappings
 * Maps search result types to correct application routes
 */

const SEARCH_URL_MAPPINGS = {
  // Core CRM
  leads: "/app/leads",
  contacts: "/app/contacts",
  opportunities: "/app/opportunities",
  activities: "/app/activities",
  pipeline: "/app/pipeline",

  // Communication
  email_campaigns: "/app/email-marketing",
  inbox: "/app/inbox",
  call_logs: "/app/calls",
  conversations: "/app/history",

  // Marketing & Forms
  forms: "/app/forms",
  form_submissions: "/app/forms",
  email_templates: "/app/email-marketing",

  // Workflows & Automation
  workflows: "/app/workflows",
  workflow_templates: "/app/workflows",
  workflow_executions: "/app/workflows",
  automation_triggers: "/app/workflows",

  // Second Brain
  second_brain_nodes: "/app/second-brain",
  second_brain_maps: "/app/second-brain",
  second_brain_notes: "/app/second-brain",
  second_brain_folders: "/app/second-brain",

  // Calendar
  calendar_events: "/app/calendar",
  important_dates: "/app/calendar",
  recurring_events: "/app/calendar",

  // Reports
  saved_reports: "/app/reports/explorer",
  activity_overview: "/app/reports/activity-overview",
  activity_comparison: "/app/reports/activity-comparison",
  opportunity_funnels: "/app/reports/opportunity-funnels",
  status_changes: "/app/reports/status-changes",

  // Settings
  custom_fields: "/app/settings/customization/fields",
  tags: "/app/settings/customization",
  user_preferences: "/app/settings/account",
  app_settings: "/app/settings/organization",
  feature_flags: "/app/settings/organization",
  team_members: "/app/settings/organization/team",
  products: "/app/settings/customization",

  // Support
  tickets: "/app/tickets",
  knowledge_base: "/app/knowledge-base",
  customer_portal: "/app/customer-portal",
  support_analytics: "/app/support-analytics",

  // Navigation & Pages
  navigation: "/app/home",
  help_articles: "/app/help",
  video_tutorials: "/app/help",

  // Extended Entities
  companies: "/app/contacts",
  deals: "/app/pipeline",
  tasks: "/app/activities",
  notes: "/app/activities",
  documents: "/app/activities",
  pipeline_stages: "/app/pipeline",
  quotes: "/app/opportunities",

  // System & Audit
  audit_logs: "/app/settings/organization",
  notifications: "/app/settings/account",
  system_status: "/app/settings",

  // Integrations
  api_integrations: "/app/settings/integrations",

  // Quick Actions & Commands
  quick_actions: "/app/home",
  command_history: "/app/settings/account",

  // User Activity
  user_activity: "/app/settings/account",
};

/**
 * Get the correct URL for a search result category
 * @param {string} category - The result category
 * @returns {string} - The correct URL
 */
function getSearchResultUrl(category) {
  return SEARCH_URL_MAPPINGS[category] || "/app/home";
}

/**
 * Category display configuration
 */
const CATEGORY_DISPLAY_CONFIG = {
  leads: {
    label: "Leads",
    icon: "UserPlus",
    color: "blue",
    description: "Potential customers",
  },
  contacts: {
    label: "Contacts",
    icon: "Users",
    color: "green",
    description: "Your contact database",
  },
  opportunities: {
    label: "Opportunities",
    icon: "TrendingUp",
    color: "purple",
    description: "Sales opportunities",
  },
  activities: {
    label: "Activities",
    icon: "Activity",
    color: "orange",
    description: "Tasks and activities",
  },
  email_campaigns: {
    label: "Email Campaigns",
    icon: "Mail",
    color: "indigo",
    description: "Email marketing campaigns",
  },
  forms: {
    label: "Forms",
    icon: "FileInput",
    color: "pink",
    description: "Lead capture forms",
  },
  workflows: {
    label: "Workflows",
    icon: "Workflow",
    color: "cyan",
    description: "Automation workflows",
  },
  second_brain: {
    label: "Second Brain",
    icon: "Brain",
    color: "violet",
    description: "Knowledge management",
  },
  calendar: {
    label: "Calendar",
    icon: "Calendar",
    color: "emerald",
    description: "Events and scheduling",
  },
  reports: {
    label: "Reports",
    icon: "BarChart3",
    color: "amber",
    description: "Analytics and reports",
  },
  settings: {
    label: "Settings",
    icon: "Settings",
    color: "gray",
    description: "System settings",
  },
  navigation: {
    label: "Pages",
    icon: "Navigation",
    color: "slate",
    description: "Application pages",
  },
};

/**
 * Get display configuration for a category
 * @param {string} category - The category
 * @returns {Object} - Display configuration
 */
function getCategoryDisplayConfig(category) {
  // Map various second brain subcategories to main category
  if (category.includes("second_brain")) {
    return CATEGORY_DISPLAY_CONFIG.second_brain;
  }

  // Map various report subcategories to main category
  if (
    category.includes("report") ||
    category.includes("activity") ||
    category.includes("opportunity") ||
    category.includes("status")
  ) {
    return CATEGORY_DISPLAY_CONFIG.reports;
  }

  // Map various communication subcategories
  if (
    category.includes("email") ||
    category.includes("inbox") ||
    category.includes("call") ||
    category.includes("conversation")
  ) {
    return CATEGORY_DISPLAY_CONFIG.email_campaigns;
  }

  return (
    CATEGORY_DISPLAY_CONFIG[category] || CATEGORY_DISPLAY_CONFIG.navigation
  );
}

/**
 * Enhanced search result with proper URL and display info
 * @param {Object} item - Raw search result
 * @param {string} category - Result category
 * @param {string} query - Search query
 * @returns {Object} - Enhanced search result
 */
function enhanceSearchResult(item, category, query = "") {
  const displayConfig = getCategoryDisplayConfig(category);

  return {
    ...item,
    category,
    url: getSearchResultUrl(category),
    type: displayConfig.label,
    icon: item.icon || displayConfig.icon,
    color: item.color || displayConfig.color,
    displayConfig,
    searchQuery: query,
    // Add metadata for frontend processing
    metadata: {
      ...item.metadata,
      displayType: displayConfig.label,
      categoryLabel: displayConfig.label,
      description: displayConfig.description,
    },
  };
}

export {
  SEARCH_URL_MAPPINGS,
  getSearchResultUrl,
  getCategoryDisplayConfig,
  enhanceSearchResult,
  CATEGORY_DISPLAY_CONFIG,
};
