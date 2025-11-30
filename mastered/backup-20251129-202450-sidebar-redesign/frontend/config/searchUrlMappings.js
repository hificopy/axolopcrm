/**
 * Search URL Mappings
 * Maps search result types to correct application routes
 * Ensures all search results lead to valid pages
 */

export const SEARCH_URL_MAPPINGS = {
  // Core CRM
  leads: {
    list: "/app/leads",
    detail: "/app/leads", // Use state management for details
    create: "/app/leads/new",
  },
  contacts: {
    list: "/app/contacts",
    detail: "/app/contacts",
    create: "/app/contacts/new",
  },
  opportunities: {
    list: "/app/opportunities",
    detail: "/app/opportunities",
    create: "/app/opportunities/new",
  },
  activities: {
    list: "/app/activities",
    detail: "/app/activities",
    create: "/app/activities/new",
  },
  pipeline: {
    list: "/app/pipeline",
    detail: "/app/pipeline",
    create: "/app/pipeline/new",
  },

  // Communication
  email_campaigns: {
    list: "/app/email-marketing",
    detail: "/app/email-marketing",
    create: "/app/email-marketing/create",
  },
  inbox: {
    list: "/app/inbox",
    detail: "/app/inbox",
    create: "/app/inbox/compose",
  },
  call_logs: {
    list: "/app/calls",
    detail: "/app/calls",
    create: "/app/calls",
  },
  conversations: {
    list: "/app/conversations",
    detail: "/app/conversations",
    create: "/app/conversations",
  },

  // Marketing & Forms
  forms: {
    list: "/app/forms",
    detail: "/app/forms",
    create: "/app/forms/builder",
  },
  form_submissions: {
    list: "/app/forms",
    detail: "/app/forms/analytics",
    create: "/app/forms",
  },
  email_templates: {
    list: "/app/email-marketing",
    detail: "/app/email-marketing",
    create: "/app/email-marketing/create",
  },

  // Workflows & Automation
  workflows: {
    list: "/app/workflows",
    detail: "/app/workflows",
    create: "/app/workflows/builder",
  },
  workflow_templates: {
    list: "/app/workflows",
    detail: "/app/workflows",
    create: "/app/workflows/builder",
  },
  workflow_executions: {
    list: "/app/workflows",
    detail: "/app/workflows",
    create: "/app/workflows",
  },
  automation_triggers: {
    list: "/app/workflows",
    detail: "/app/workflows",
    create: "/app/workflows/builder",
  },

  // Second Brain
  second_brain: {
    list: "/app/second-brain",
    detail: "/app/second-brain",
    create: "/app/second-brain",
  },
  second_brain_nodes: {
    list: "/app/second-brain",
    detail: "/app/second-brain",
    create: "/app/second-brain",
  },
  second_brain_maps: {
    list: "/app/second-brain",
    detail: "/app/second-brain",
    create: "/app/second-brain",
  },
  second_brain_notes: {
    list: "/app/second-brain",
    detail: "/app/second-brain",
    create: "/app/second-brain",
  },

  // Calendar
  calendar_events: {
    list: "/app/calendar",
    detail: "/app/calendar",
    create: "/app/calendar",
  },
  important_dates: {
    list: "/app/calendar",
    detail: "/app/calendar",
    create: "/app/calendar",
  },
  recurring_events: {
    list: "/app/calendar",
    detail: "/app/calendar",
    create: "/app/calendar",
  },

  // Reports
  saved_reports: {
    list: "/app/reports/explorer",
    detail: "/app/reports/explorer",
    create: "/app/reports/explorer",
  },
  activity_overview: {
    list: "/app/reports/activity-overview",
    detail: "/app/reports/activity-overview",
    create: "/app/reports/activity-overview",
  },
  activity_comparison: {
    list: "/app/reports/activity-comparison",
    detail: "/app/reports/activity-comparison",
    create: "/app/reports/activity-comparison",
  },
  opportunity_funnels: {
    list: "/app/reports/opportunity-funnels",
    detail: "/app/reports/opportunity-funnels",
    create: "/app/reports/opportunity-funnels",
  },
  status_changes: {
    list: "/app/reports/status-changes",
    detail: "/app/reports/status-changes",
    create: "/app/reports/status-changes",
  },

  // Settings
  custom_fields: {
    list: "/app/settings/customization/fields",
    detail: "/app/settings/customization/fields",
    create: "/app/settings/customization/fields",
  },
  tags: {
    list: "/app/settings/customization",
    detail: "/app/settings/customization",
    create: "/app/settings/customization",
  },
  user_preferences: {
    list: "/app/settings/account",
    detail: "/app/settings/account",
    create: "/app/settings/account",
  },
  app_settings: {
    list: "/app/settings/agency/general",
    detail: "/app/settings/agency/general",
    create: "/app/settings/agency/general",
  },
  feature_flags: {
    list: "/app/settings/agency/general",
    detail: "/app/settings/agency/general",
    create: "/app/settings/agency/general",
  },
  team_members: {
    list: "/app/settings/agency/team",
    detail: "/app/settings/agency/team",
    create: "/app/settings/agency/team",
  },
  products: {
    list: "/app/settings/customization",
    detail: "/app/settings/customization",
    create: "/app/settings/customization",
  },

  // Support
  tickets: {
    list: "/app/tickets",
    detail: "/app/tickets",
    create: "/app/tickets",
  },
  knowledge_base: {
    list: "/app/knowledge-base",
    detail: "/app/knowledge-base",
    create: "/app/knowledge-base",
  },
  customer_portal: {
    list: "/app/customer-portal",
    detail: "/app/customer-portal",
    create: "/app/customer-portal",
  },
  support_analytics: {
    list: "/app/support-analytics",
    detail: "/app/support-analytics",
    create: "/app/support-analytics",
  },

  // Navigation & Pages
  navigation: {
    list: "/app/home",
    detail: "/app/home",
    create: "/app/home",
  },
  help_articles: {
    list: "/app/help",
    detail: "/app/help",
    create: "/app/help",
  },
  video_tutorials: {
    list: "/app/help",
    detail: "/app/help",
    create: "/app/help",
  },

  // Extended Entities
  companies: {
    list: "/app/contacts",
    detail: "/app/contacts",
    create: "/app/contacts/new",
  },
  deals: {
    list: "/app/pipeline",
    detail: "/app/pipeline",
    create: "/app/pipeline/new",
  },
  tasks: {
    list: "/app/activities",
    detail: "/app/activities",
    create: "/app/activities/new",
  },
  notes: {
    list: "/app/activities",
    detail: "/app/activities",
    create: "/app/activities/new",
  },
  documents: {
    list: "/app/activities",
    detail: "/app/activities",
    create: "/app/activities",
  },
  pipeline_stages: {
    list: "/app/pipeline",
    detail: "/app/pipeline",
    create: "/app/pipeline",
  },
  quotes: {
    list: "/app/opportunities",
    detail: "/app/opportunities",
    create: "/app/opportunities/new",
  },

  // System & Audit
  audit_logs: {
    list: "/app/settings/organization",
    detail: "/app/settings/organization",
    create: "/app/settings/organization",
  },
  notifications: {
    list: "/app/settings/account",
    detail: "/app/settings/account",
    create: "/app/settings/account",
  },
  system_status: {
    list: "/app/settings",
    detail: "/app/settings",
    create: "/app/settings",
  },

  // Integrations
  api_integrations: {
    list: "/app/settings/integrations",
    detail: "/app/settings/integrations",
    create: "/app/settings/integrations",
  },

  // Quick Actions & Commands
  quick_actions: {
    list: "/app/home",
    detail: "/app/home",
    create: "/app/home",
  },
  command_history: {
    list: "/app/settings/account",
    detail: "/app/settings/account",
    create: "/app/settings/account",
  },

  // User Activity
  user_activity: {
    list: "/app/settings/account",
    detail: "/app/settings/account",
    create: "/app/settings/account",
  },
};

/**
 * Get the correct URL for a search result
 * @param {string} category - The result category
 * @param {string} type - The result type (optional)
 * @param {string} action - The action (list, detail, create)
 * @param {string|number} id - The entity ID (optional)
 * @returns {string} - The correct URL
 */
export function getSearchResultUrl(category, type = null, action = "list") {
  // Try to find mapping by category first, then by type
  let mapping = SEARCH_URL_MAPPINGS[category];

  if (!mapping && type) {
    // Try to find mapping by type
    const typeKey = Object.keys(SEARCH_URL_MAPPINGS).find(
      (key) =>
        key.includes(type.toLowerCase()) || type.toLowerCase().includes(key),
    );
    mapping = SEARCH_URL_MAPPINGS[typeKey];
  }

  if (!mapping) {
    // Fallback to home if no mapping found
    console.warn(
      `No URL mapping found for category: ${category}, type: ${type}`,
    );
    return "/app/home";
  }

  let url = mapping[action] || mapping.list || "/app/home";

  // For detail views, we'll use state management instead of URL parameters
  // The component will handle showing the specific entity based on the passed state
  return url;
}

/**
 * Check if a URL is valid for search results
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is valid
 */
export function isValidSearchResultUrl(url) {
  if (!url || typeof url !== "string") return false;

  // Remove query parameters and hash
  const cleanPath = url.split("?")[0].split("#")[0];

  // Check if it starts with /app/ and is in our mappings
  return Object.values(SEARCH_URL_MAPPINGS).some((mapping) =>
    Object.values(mapping).includes(cleanPath),
  );
}

/**
 * Get navigation state for search result
 * @param {Object} result - The search result
 * @returns {Object} - Navigation state to pass to the route
 */
export function getSearchResultState(result) {
  return {
    fromSearch: true,
    searchQuery: result.searchQuery,
    entityType: result.category || result.type,
    entityId: result.id,
    entityData: result,
  };
}

/**
 * Category display configuration
 */
export const CATEGORY_DISPLAY_CONFIG = {
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
export function getCategoryDisplayConfig(category) {
  return (
    CATEGORY_DISPLAY_CONFIG[category] || CATEGORY_DISPLAY_CONFIG.navigation
  );
}

export default {
  SEARCH_URL_MAPPINGS,
  getSearchResultUrl,
  isValidSearchResultUrl,
  getSearchResultState,
  CATEGORY_DISPLAY_CONFIG,
  getCategoryDisplayConfig,
};
