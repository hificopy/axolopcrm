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

// Request interceptor - add auth token from Supabase
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
        // Unauthorized - redirect to login
        window.location.href = '/';
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
  convertToContact: (id) => api.post(`/api/leads/${id}/convert`),
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
// Deals API
// ============================================
export const dealsApi = {
  getAll: (filters = {}) => api.get('/api/deals', { params: filters }),
  getById: (id) => api.get(`/api/deals/${id}`),
  create: (data) => api.post('/api/deals', data),
  update: (id, data) => api.put(`/api/deals/${id}`, data),
  delete: (id) => api.delete(`/api/deals/${id}`),
  updateStage: (id, stage) => api.patch(`/api/deals/${id}/stage`, { stage }),
  updateAmount: (id, amount) => api.patch(`/api/deals/${id}/amount`, { amount }),
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
// Email Campaigns API
// ============================================
export const emailCampaignsApi = {
  getAll: (filters = {}) => api.get('/api/email-campaigns', { params: filters }),
  getById: (id) => api.get(`/api/email-campaigns/${id}`),
  create: (data) => api.post('/api/email-campaigns', data),
  update: (id, data) => api.put(`/api/email-campaigns/${id}`, data),
  delete: (id) => api.delete(`/api/email-campaigns/${id}`),
  send: (id) => api.post(`/api/email-campaigns/${id}/send`),
  pause: (id) => api.post(`/api/email-campaigns/${id}/pause`),
  getStats: (id) => api.get(`/api/email-campaigns/${id}/stats`),
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