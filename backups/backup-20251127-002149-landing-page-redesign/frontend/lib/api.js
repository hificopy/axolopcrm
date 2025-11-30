import axios from "axios";
import supabaseSingleton, {
  getSupabaseSession,
  isSupabaseAuthenticated,
} from "../services/supabase-singleton.js";
import requestQueue from "../services/request-queue.js";
import { localStorageRemove } from "../utils/safeStorage.js";

// API base URL - include /api/v1 prefix for all routes
const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3002' : '');
const API_URL = `${API_BASE}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Override default request method to use queue
const originalRequest = api.request;
api.request = async function (config) {
  return requestQueue.enqueue({
    ...config,
    baseURL: API_URL,
  });
};

// Override other methods to use queue
api.get = (url, config) => api.request({ ...config, method: "GET", url });
api.post = (url, data, config) =>
  api.request({ ...config, method: "POST", url, data });
api.put = (url, data, config) =>
  api.request({ ...config, method: "PUT", url, data });
api.patch = (url, data, config) =>
  api.request({ ...config, method: "PATCH", url, data });
api.delete = (url, config) => api.request({ ...config, method: "DELETE", url });

// Helper: Get session with timeout to prevent hanging requests
const getSessionWithTimeout = async (timeoutMs = 5000) => {
  return Promise.race([
    getSupabaseSession(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Session retrieval timeout')), timeoutMs)
    ),
  ]);
};

// Request interceptor - add auth token and agency context from Supabase singleton
api.interceptors.request.use(
  async (config) => {
    // Use singleton Supabase client for session access
    try {
      if (isSupabaseAuthenticated()) {
        try {
          // Use timeout to prevent hanging if session retrieval takes too long
          const session = await getSessionWithTimeout(5000);
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;

            // Add session ID header for tracking
            try {
              const sessionHealth = supabaseSingleton.getSessionHealth();
              if (sessionHealth?.sessionId) {
                config.headers["X-Session-ID"] = sessionHealth.sessionId;
              }
            } catch (healthError) {
              // Non-critical - continue without session ID header
              console.debug("Could not get session health:", healthError);
            }
          }
        } catch (sessionError) {
          // Log timeout/error but continue without auth token
          // This allows the request to proceed and potentially get a 401
          // which will trigger proper auth refresh flow
          console.warn("Session retrieval failed:", sessionError.message);
        }
      }
    } catch (error) {
      console.warn("Auth check failed for API request:", error);
      // Don't throw - let request proceed without auth
    }

    // Add current agency ID to request headers for permission checking
    // This is used by backend to validate edit permissions for seated users
    // Key is synced from AgencyContext - Supabase is the source of truth
    try {
      const currentAgencyStr = localStorage.getItem("axolop_current_agency");
      if (currentAgencyStr) {
        const currentAgency = JSON.parse(currentAgencyStr);
        if (currentAgency?.id) {
          config.headers["X-Agency-ID"] = currentAgency.id;
        }
      }
    } catch (error) {
      // Ignore errors reading agency context - optional header
      console.debug("Could not read current agency context:", error);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Paths that should not trigger auth redirect
const AUTH_PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/update-password",
  "/onboarding",
];

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Check if this is a rate limit error disguised as 401
        const isRateLimit =
          data?.error?.includes("rate limit") ||
          data?.message?.includes("rate limit") ||
          error.response.headers["x-ratelimit-remaining"] === "0";

        if (isRateLimit) {
          console.warn("⚠️ Rate limit detected, not redirecting to auth");
          return Promise.reject({
            error: "Rate limit exceeded. Please try again later.",
            isRateLimit: true,
          });
        }

        // Only redirect if not already on an auth page (prevent infinite redirect)
        const currentPath = window.location.pathname;
        const isOnAuthPage = AUTH_PATHS.some((path) =>
          currentPath.startsWith(path),
        );

        if (!isOnAuthPage) {
          // Clear any stale auth state before redirecting
          localStorageRemove("supabase.auth.token");

          // Notify singleton about auth failure
          try {
            supabaseSingleton.emit("auth-failure", {
              path: currentPath,
              timestamp: Date.now(),
            });
          } catch (error) {
            console.warn("Failed to emit auth failure event:", error);
          }

          window.location.href = "/signin";
        }
      }

      console.error(
        "API Error:",
        data?.error || data?.message || "Unknown error",
      );
      return Promise.reject(data || { error: "Unknown error" });
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error:", error.message);
      return Promise.reject({
        error: "Network error. Please check your connection.",
      });
    } else {
      // Something else happened
      console.error("Error:", error.message);
      return Promise.reject({ error: error.message });
    }
  },
);

// ============================================
// Leads API
// ============================================
export const leadsApi = {
  getAll: (filters = {}) => api.get("/leads", { params: filters }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post("/leads", data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  convert: (id, options = {}) => api.post(`/leads/${id}/convert`, options),
  // Alias for backward compatibility
  convertToContact: (id) =>
    api.post(`/leads/${id}/convert`, {
      createOpportunity: true,
      createContact: true,
    }),
};

// ============================================
// Contacts API
// ============================================
export const contactsApi = {
  getAll: (filters = {}) => api.get("/contacts", { params: filters }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post("/contacts", data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// ============================================
// Deals/Opportunities API
// ============================================
export const dealsApi = {
  getAll: (filters = {}) => api.get("/opportunities", { params: filters }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post("/opportunities", data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  updateStage: (id, stage) => api.put(`/opportunities/${id}`, { stage }),
  updateAmount: (id, amount) => api.put(`/opportunities/${id}`, { amount }),
};

// ============================================
// Interactions API
// ============================================
export const interactionsApi = {
  getAll: (entityType, entityId) =>
    api.get("/interactions", { params: { entityType, entityId } }),
  create: (data) => api.post("/interactions", data),
  delete: (id) => api.delete(`/interactions/${id}`),
};

// ============================================
// Tasks API
// ============================================
export const tasksApi = {
  getAll: (filters = {}) => api.get("/tasks", { params: filters }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
};

// ============================================
// Activities API
// ============================================
export const activitiesApi = {
  getAll: (filters = {}) => api.get("/activities", { params: filters }),
  getTimeline: (entityType, entityId) =>
    api.get(`/activities/timeline/${entityType}/${entityId}`),
};

// ============================================
// Email Marketing API (campaigns, templates, workflows, analytics)
// ============================================
export const emailCampaignsApi = {
  // Dashboard & Analytics
  getDashboard: () => api.get("/email-marketing/dashboard"),
  getAnalytics: (params = {}) =>
    api.get("/email-marketing/analytics", { params }),
  getPerformance: (params = {}) =>
    api.get("/email-marketing/analytics/performance", { params }),

  // Campaigns
  getAll: (filters = {}) =>
    api.get("/email-marketing/campaigns", { params: filters }),
  getById: (id) => api.get(`/email-marketing/campaigns/${id}`),
  create: (data) => api.post("/email-marketing/campaigns", data),
  update: (id, data) => api.put(`/email-marketing/campaigns/${id}`, data),
  delete: (id) => api.delete(`/email-marketing/campaigns/${id}`),
  send: (id, data = {}) =>
    api.post(`/email-marketing/campaigns/${id}/send`, data),
  sendTest: (id, data) =>
    api.post(`/email-marketing/campaigns/${id}/test`, data),
  addRecipients: (id, recipients) =>
    api.post(`/email-marketing/campaigns/${id}/recipients`, { recipients }),
  getStats: (id) => api.get(`/email-marketing/campaigns/${id}/stats`),

  // Templates
  getTemplates: (filters = {}) =>
    api.get("/email-marketing/templates", { params: filters }),
  getTemplateById: (id) => api.get(`/email-marketing/templates/${id}`),
  createTemplate: (data) => api.post("/email-marketing/templates", data),
  updateTemplate: (id, data) =>
    api.put(`/email-marketing/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/email-marketing/templates/${id}`),
};

// ============================================
// Meetings API
// ============================================
export const meetingsApi = {
  // Booking Links
  getBookingLinks: () => api.get("/meetings/booking-links"),
  getBookingLinkBySlug: (slug) => api.get(`/meetings/booking-links/${slug}`),
  createBookingLink: (data) => api.post("/meetings/booking-links", data),
  updateBookingLink: (id, data) =>
    api.put(`/meetings/booking-links/${id}`, data),
  deleteBookingLink: (id) => api.delete(`/meetings/booking-links/${id}`),

  // Availability
  getAvailability: (slug, date, timezone) =>
    api.get(`/meetings/booking-links/${slug}/availability`, {
      params: { date, timezone },
    }),
  getAvailabilityCalendar: (slug, startDate, timezone) =>
    api.get(`/meetings/booking-links/${slug}/availability-calendar`, {
      params: { startDate, timezone },
    }),

  // Bookings
  bookSlot: (slug, data) =>
    api.post(`/meetings/booking-links/${slug}/book`, data),
  cancelBooking: (id, data) =>
    api.post(`/meetings/bookings/${id}/cancel`, data),
  rescheduleBooking: (id, data) =>
    api.post(`/meetings/bookings/${id}/reschedule`, data),

  // Analytics
  getOverviewAnalytics: () => api.get("/meetings/analytics/overview"),
  getSalesAnalytics: () => api.get("/meetings/analytics/sales"),
  getSchedulingAnalytics: () => api.get("/meetings/analytics/scheduling"),
  getBookingLinkAnalytics: (id) =>
    api.get(`/meetings/booking-links/${id}/analytics`),
};

// ============================================
// Forms API
// ============================================
export const formsApi = {
  getAll: () => api.get("/forms"),
  getById: (id) => api.get(`/forms/${id}`),
  create: (data) => api.post("/forms", data),
  update: (id, data) => api.put(`/forms/${id}`, data),
  delete: (id) => api.delete(`/forms/${id}`),
  getSubmissions: (id, filters = {}) =>
    api.get(`/forms/${id}/submissions`, { params: filters }),
};

// ============================================
// Workflows API
// ============================================
export const workflowsApi = {
  getAll: () => api.get("/workflows"),
  getById: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post("/workflows", data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
  activate: (id) => api.post(`/workflows/${id}/activate`),
  deactivate: (id) => api.post(`/workflows/${id}/deactivate`),
};

// ============================================
// Reports API
// ============================================
export const reportsApi = {
  getDashboard: () => api.get("/reports/dashboard"),
  getSalesFunnel: (filters = {}) =>
    api.get("/reports/sales-funnel", { params: filters }),
  getLeadSources: (filters = {}) =>
    api.get("/reports/lead-sources", { params: filters }),
  getRevenue: (filters = {}) =>
    api.get("/reports/revenue", { params: filters }),
  getActivities: (filters = {}) =>
    api.get("/reports/activities", { params: filters }),
};

// ============================================
// Search API
// ============================================
export const searchApi = {
  /**
   * Universal search across all CRM entities
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Results per category (default: 8)
   * @param {string} options.categories - Comma-separated list of categories (default: all)
   * @returns {Promise} Search results with categorized data
   */
  search: (query, options = {}) => {
    const params = { q: query, ...options };
    return api.get("/search", { params });
  },

  /**
   * Get search suggestions and recent searches
   * @returns {Promise} Search suggestions
   */
  getSuggestions: () => api.get("/search/suggestions"),

  /**
   * Search specific entity types
   * @param {string} query - Search query
   * @param {string} category - Entity category (leads, contacts, forms, etc.)
   * @param {Object} options - Additional search options
   */
  searchCategory: (query, category, options = {}) => {
    const params = { q: query, categories: category, ...options };
    return api.get("/search", { params });
  },

  /**
   * Quick search for navigation items (works without auth)
   * @param {string} query - Search query
   */
  searchNavigation: (query) => {
    return api.get("/search", {
      params: { q: query, categories: "navigation", limit: 20 },
    });
  },

  /**
   * Execute command from command palette
   * @param {string} command - Command to execute
   * @param {Object} options - Command options
   * @returns {Promise} Command execution result
   */
  executeCommand: (command, options = {}) => {
    return api.post("/search/command", {
      command,
      ...options,
    });
  },

  /**
   * Get all available quick actions
   * @returns {Promise} Quick actions list
   */
  getQuickActions: () => api.get("/search/quick-actions"),

  /**
   * Create entity from search
   * @param {string} entityType - Type of entity to create
   * @param {Object} data - Entity data
   * @returns {Promise} Creation result
   */
  createEntity: (entityType, data = {}) => {
    const entityEndpoints = {
      lead: "/api/leads",
      contact: "/api/contacts",
      form: "/api/forms",
      campaign: "/api/email-campaigns",
      meeting: "/api/calendar/events",
      deal: "/api/deals",
      task: "/api/tasks",
      note: "/api/second-brain/notes",
      workflow: "/api/workflows",
      opportunity: "/api/opportunities",
    };

    const endpoint = entityEndpoints[entityType.toLowerCase()];
    if (!endpoint) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    return api.post(endpoint, data);
  },

  /**
   * Get entity creation form schema
   * @param {string} entityType - Type of entity
   * @returns {Promise} Form schema
   */
  getEntitySchema: (entityType) => {
    return api.get(`/search/schema/${entityType}`);
  },

  /**
   * Log user activity for search analytics
   * @param {Object} activity - Activity data
   * @returns {Promise} Log result
   */
  logActivity: (activity) => {
    return api.post("/api/user-activity", activity);
  },
};

// ============================================
// User/Auth API
// ============================================
export const authApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getTeam: () => api.get("/users/team"),
};

export default api;
