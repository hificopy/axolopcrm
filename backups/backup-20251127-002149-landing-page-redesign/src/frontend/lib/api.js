import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and agency context from Supabase
api.interceptors.request.use(
  async (config) => {
    // Get Supabase client from context or create one
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }

    // Add current agency ID to request headers for permission checking
    // This is used by backend to validate edit permissions for seated users
    try {
      const currentAgencyStr = localStorage.getItem('currentAgency');
      if (currentAgencyStr) {
        const currentAgency = JSON.parse(currentAgencyStr);
        if (currentAgency?.id) {
          config.headers['X-Agency-ID'] = currentAgency.id;
        }
      }
    } catch (error) {
      // Ignore errors reading agency context - optional header
      console.debug('Could not read current agency context:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - redirect to sign in
        window.location.href = '/signin';
      }

      console.error('API Error:', data.error || data.message);
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      return Promise.reject({ error: 'Network error. Please check your connection.' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

// ============================================
// Leads API
// ============================================
export const leadsApi = {
  getAll: (filters = {}) => api.get('/api/leads', { params: filters }),
  getById: (id) => api.get(`/api/leads/${id}`),
  create: (data) => api.post('/api/leads', data),
  update: (id, data) => api.put(`/api/leads/${id}`, data),
  delete: (id) => api.delete(`/api/leads/${id}`),
  convert: (id, options = {}) => api.post(`/api/leads/${id}/convert`, options),
  // Alias for backward compatibility
  convertToContact: (id) => api.post(`/api/leads/${id}/convert`, { createOpportunity: true, createContact: true }),
};

// ============================================
// Contacts API
// ============================================
export const contactsApi = {
  getAll: (filters = {}) => api.get('/api/contacts', { params: filters }),
  getById: (id) => api.get(`/api/contacts/${id}`),
  create: (data) => api.post('/api/contacts', data),
  update: (id, data) => api.put(`/api/contacts/${id}`, data),
  delete: (id) => api.delete(`/api/contacts/${id}`),
};

// ============================================
// Deals/Opportunities API
// ============================================
export const dealsApi = {
  getAll: (filters = {}) => api.get('/api/opportunities', { params: filters }),
  getById: (id) => api.get(`/api/opportunities/${id}`),
  create: (data) => api.post('/api/opportunities', data),
  update: (id, data) => api.put(`/api/opportunities/${id}`, data),
  delete: (id) => api.delete(`/api/opportunities/${id}`),
  updateStage: (id, stage) => api.put(`/api/opportunities/${id}`, { stage }),
  updateAmount: (id, amount) => api.put(`/api/opportunities/${id}`, { amount }),
};

// ============================================
// Interactions API
// ============================================
export const interactionsApi = {
  getAll: (entityType, entityId) =>
    api.get('/api/interactions', { params: { entityType, entityId } }),
  create: (data) => api.post('/api/interactions', data),
  delete: (id) => api.delete(`/api/interactions/${id}`),
};

// ============================================
// Tasks API
// ============================================
export const tasksApi = {
  getAll: (filters = {}) => api.get('/api/tasks', { params: filters }),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
  complete: (id) => api.patch(`/api/tasks/${id}/complete`),
};

// ============================================
// Activities API
// ============================================
export const activitiesApi = {
  getAll: (filters = {}) => api.get('/api/activities', { params: filters }),
  getTimeline: (entityType, entityId) =>
    api.get(`/api/activities/timeline/${entityType}/${entityId}`),
};

// ============================================
// Email Marketing API (campaigns, templates, workflows, analytics)
// ============================================
export const emailCampaignsApi = {
  // Dashboard & Analytics
  getDashboard: () => api.get('/api/email-marketing/dashboard'),
  getAnalytics: (params = {}) => api.get('/api/email-marketing/analytics', { params }),
  getPerformance: (params = {}) => api.get('/api/email-marketing/analytics/performance', { params }),

  // Campaigns
  getAll: (filters = {}) => api.get('/api/email-marketing/campaigns', { params: filters }),
  getById: (id) => api.get(`/api/email-marketing/campaigns/${id}`),
  create: (data) => api.post('/api/email-marketing/campaigns', data),
  update: (id, data) => api.put(`/api/email-marketing/campaigns/${id}`, data),
  delete: (id) => api.delete(`/api/email-marketing/campaigns/${id}`),
  send: (id, data = {}) => api.post(`/api/email-marketing/campaigns/${id}/send`, data),
  sendTest: (id, data) => api.post(`/api/email-marketing/campaigns/${id}/test`, data),
  addRecipients: (id, recipients) => api.post(`/api/email-marketing/campaigns/${id}/recipients`, { recipients }),
  getStats: (id) => api.get(`/api/email-marketing/campaigns/${id}/stats`),

  // Templates
  getTemplates: (filters = {}) => api.get('/api/email-marketing/templates', { params: filters }),
  getTemplateById: (id) => api.get(`/api/email-marketing/templates/${id}`),
  createTemplate: (data) => api.post('/api/email-marketing/templates', data),
  updateTemplate: (id, data) => api.put(`/api/email-marketing/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/api/email-marketing/templates/${id}`),
};

// ============================================
// Meetings API
// ============================================
export const meetingsApi = {
  // Booking Links
  getBookingLinks: () => api.get('/api/meetings/booking-links'),
  getBookingLinkBySlug: (slug) => api.get(`/api/meetings/booking-links/${slug}`),
  createBookingLink: (data) => api.post('/api/meetings/booking-links', data),
  updateBookingLink: (id, data) => api.put(`/api/meetings/booking-links/${id}`, data),
  deleteBookingLink: (id) => api.delete(`/api/meetings/booking-links/${id}`),

  // Availability
  getAvailability: (slug, date, timezone) =>
    api.get(`/api/meetings/booking-links/${slug}/availability`, { params: { date, timezone } }),
  getAvailabilityCalendar: (slug, startDate, timezone) =>
    api.get(`/api/meetings/booking-links/${slug}/availability-calendar`, { params: { startDate, timezone } }),

  // Bookings
  bookSlot: (slug, data) => api.post(`/api/meetings/booking-links/${slug}/book`, data),
  cancelBooking: (id, data) => api.post(`/api/meetings/bookings/${id}/cancel`, data),
  rescheduleBooking: (id, data) => api.post(`/api/meetings/bookings/${id}/reschedule`, data),

  // Analytics
  getOverviewAnalytics: () => api.get('/api/meetings/analytics/overview'),
  getSalesAnalytics: () => api.get('/api/meetings/analytics/sales'),
  getSchedulingAnalytics: () => api.get('/api/meetings/analytics/scheduling'),
  getBookingLinkAnalytics: (id) => api.get(`/api/meetings/booking-links/${id}/analytics`),
};

// ============================================
// Forms API
// ============================================
export const formsApi = {
  getAll: () => api.get('/api/forms'),
  getById: (id) => api.get(`/api/forms/${id}`),
  create: (data) => api.post('/api/forms', data),
  update: (id, data) => api.put(`/api/forms/${id}`, data),
  delete: (id) => api.delete(`/api/forms/${id}`),
  getSubmissions: (id, filters = {}) =>
    api.get(`/api/forms/${id}/submissions`, { params: filters }),
};

// ============================================
// Workflows API
// ============================================
export const workflowsApi = {
  getAll: () => api.get('/api/workflows'),
  getById: (id) => api.get(`/api/workflows/${id}`),
  create: (data) => api.post('/api/workflows', data),
  update: (id, data) => api.put(`/api/workflows/${id}`, data),
  delete: (id) => api.delete(`/api/workflows/${id}`),
  activate: (id) => api.post(`/api/workflows/${id}/activate`),
  deactivate: (id) => api.post(`/api/workflows/${id}/deactivate`),
};

// ============================================
// Reports API
// ============================================
export const reportsApi = {
  getDashboard: () => api.get('/api/reports/dashboard'),
  getSalesFunnel: (filters = {}) => api.get('/api/reports/sales-funnel', { params: filters }),
  getLeadSources: (filters = {}) => api.get('/api/reports/lead-sources', { params: filters }),
  getRevenue: (filters = {}) => api.get('/api/reports/revenue', { params: filters }),
  getActivities: (filters = {}) => api.get('/api/reports/activities', { params: filters }),
};

// ============================================
// User/Auth API
// ============================================
export const authApi = {
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  getTeam: () => api.get('/api/auth/team'),
};

export default api;