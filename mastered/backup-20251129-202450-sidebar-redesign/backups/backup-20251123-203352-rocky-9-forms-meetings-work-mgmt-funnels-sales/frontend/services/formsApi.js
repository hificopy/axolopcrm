/**
 * Forms API Service
 * Handles all API calls related to forms
 */

import { createClient } from '@supabase/supabase-js';

// Use relative URL for development to go through Vite proxy, absolute URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'http://localhost:3002/api/v1');

// Initialize Supabase client for authentication
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

class FormsAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/forms`;
  }

  /**
   * Ensure the session is valid and refresh if needed
   * @returns {Promise<Object|null>} Valid session or null if invalid
   */
  async ensureValidSession() {
    if (!supabase) {
      return null;
    }

    // Get the current session
    let { data: { session }, error } = await supabase.auth.getSession();

    // Try to get user information which might refresh the session
    if (!session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('No valid user found:', userError?.message);
        return null;
      }
      // Get session again after getting user
      const sessionResult = await supabase.auth.getSession();
      session = sessionResult.data.session;
    }

    // If we still don't have a session, return null
    if (!session) {
      return null;
    }

    // Check if session is about to expire (within 1 minute) and refresh if needed
    const now = new Date();
    const expiresAt = new Date(session.expires_at * 1000);
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry < 60000) { // Refresh if less than 1 minute remaining
      try {
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('Failed to refresh session:', refreshError);
          // If refresh failed, the session might be invalid
          return null;
        } else {
          session = refreshedSession;
        }
      } catch (refreshError) {
        console.warn('Session refresh failed:', refreshError);
        return null;
      }
    }

    return session;
  }

  /**
   * Get authorization headers with Supabase token
   * @returns {Promise<Object>} Headers object with auth token
   */
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const session = await this.ensureValidSession();

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      throw new Error('Authentication token is invalid or expired');
    }

    return headers;
  }

  // Flag to prevent multiple simultaneous refresh attempts
  #isRefreshing = false;
  #failedQueue = [];

  /**
   * Process queued requests after token refresh
   */
  async #processQueue() {
    const queue = [...this.#failedQueue];
    this.#failedQueue = [];

    for (const { requestFn, resolve, reject } of queue) {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }

  /**
   * Add request to refresh queue
   */
  async #addToRefreshQueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.#failedQueue.push({ requestFn, resolve, reject });
    });
  }

  /**
   * Get all forms
   * @param {Object} params - Query parameters (status, search)
   * @returns {Promise<Array>} List of forms
   */
  async getForms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}${queryString ? `?${queryString}` : ''}`;

    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to fetch forms');
      }

      const data = await response.json();
      return data.forms;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Get a single form by ID (authenticated)
   * @param {string} formId - Form ID
   * @returns {Promise<Object>} Form data
   */
  async getForm(formId) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to fetch form');
      }

      const data = await response.json();
      return data.form;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Get a public form (no authentication required)
   * @param {string} formId - Form ID
   * @returns {Promise<Object>} Public form data
   */
  async getPublicForm(formId) {
    const response = await fetch(`${this.baseURL}/${formId}/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch form');
    }

    const data = await response.json();
    return data.form;
  }

  /**
   * Create a new form
   * @param {Object} formData - Form data
   * @returns {Promise<Object>} Created form
   */
  async createForm(formData) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to create form');
      }

      const data = await response.json();
      return data.form;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Update an existing form
   * @param {string} formId - Form ID
   * @param {Object} updates - Updated form data
   * @returns {Promise<Object>} Updated form
   */
  async updateForm(formId, updates) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to update form');
      }

      const data = await response.json();
      return data.form;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Delete a form (soft delete)
   * @param {string} formId - Form ID
   * @returns {Promise<Object>} Deleted form info
   */
  async deleteForm(formId) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to delete form');
      }

      const data = await response.json();
      return data.form;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Duplicate a form
   * @param {string} formId - Form ID to duplicate
   * @returns {Promise<Object>} New duplicated form
   */
  async duplicateForm(formId) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}/duplicate`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to duplicate form');
      }

      const data = await response.json();
      return data.form;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Submit a form response
   * @param {string} formId - Form ID
   * @param {Object} responseData - Response data including responses and metadata
   * @returns {Promise<Object>} Submission result with lead score
   */
  async submitForm(formId, responseData) {
    const response = await fetch(`${this.baseURL}/${formId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit form');
    }

    const data = await response.json();
    return {
      response: data.response,
      leadScore: data.leadScore,
    };
  }

  /**
   * Get all responses for a form
   * @param {string} formId - Form ID
   * @param {Object} params - Query parameters (limit, offset, qualified, disqualified)
   * @returns {Promise<Object>} Responses data with pagination
   */
  async getResponses(formId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/${formId}/responses${queryString ? `?${queryString}` : ''}`;

    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to fetch responses');
      }

      return await response.json();
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Get analytics for a form
   * @param {string} formId - Form ID
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(formId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/${formId}/analytics${queryString ? `?${queryString}` : ''}`;

    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to fetch analytics');
      }

      return await response.json();
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Export form responses
   * @param {string} formId - Form ID
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {Promise<Blob|Object>} Exported data
   */
  async exportResponses(formId, format = 'json') {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseURL}/${formId}/export?format=${format}`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to export responses');
      }

      if (format === 'csv') {
        return await response.blob();
      } else {
        return await response.json();
      }
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Get all integrations for a form
   * @param {string} formId - Form ID
   * @returns {Promise<Array>} List of integrations
   */
  async getIntegrations(formId) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}/integrations`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to fetch integrations');
      }

      const data = await response.json();
      return data.integrations;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Add an integration to a form
   * @param {string} formId - Form ID
   * @param {Object} integrationData - Integration configuration
   * @returns {Promise<Object>} Created integration
   */
  async addIntegration(formId, integrationData) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}/integrations`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(integrationData),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to add integration');
      }

      const data = await response.json();
      return data.integration;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Update an integration
   * @param {string} formId - Form ID
   * @param {string} integrationId - Integration ID
   * @param {Object} updates - Updated integration data
   * @returns {Promise<Object>} Updated integration
   */
  async updateIntegration(formId, integrationId, updates) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}/integrations/${integrationId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to update integration');
      }

      const data = await response.json();
      return data.integration;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Delete an integration
   * @param {string} formId - Form ID
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} Deleted integration info
   */
  async deleteIntegration(formId, integrationId) {
    // Create request function for potential queueing
    const makeRequest = async () => {
      const response = await fetch(`${this.baseURL}/${formId}/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || 'Failed to delete integration');
      }

      const data = await response.json();
      return data.integration;
    };

    try {
      return await makeRequest();
    } catch (error) {
      // If it's an auth error, handle token refresh
      if (error.message === 'Authentication token is invalid or expired') {
        // If already refreshing, add to queue to prevent multiple refresh attempts
        if (this.#isRefreshing) {
          return await this.#addToRefreshQueue(makeRequest);
        }

        this.#isRefreshing = true;

        try {
          // Try to refresh the session
          if (supabase) {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // Clear the refresh flag and reject all queued requests
              this.#isRefreshing = false;
              const authError = new Error('Authentication token is invalid or expired');

              // Reject all queued requests
              while (this.#failedQueue.length > 0) {
                const { reject } = this.#failedQueue.shift();
                reject(authError);
              }

              throw authError;
            }

            // Process the queue with the new token
            await this.#processQueue();
            this.#isRefreshing = false;

            // Retry the original request
            return await makeRequest();
          } else {
            this.#isRefreshing = false;
            throw error;
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          this.#isRefreshing = false;
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * Generate embed code for a form
   * @param {string} formId - Form ID
   * @param {Object} options - Embed options (width, height, theme)
   * @returns {Object} Embed codes
   */
  generateEmbedCode(formId, options = {}) {
    const {
      width = '100%',
      height = '600px',
      theme = 'default'
    } = options;

    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/forms/preview/${formId}`;

    return {
      iframe: `<iframe src="${formUrl}" width="${width}" height="${height}" frameborder="0" style="border: none;"></iframe>`,

      javascript: `<div id="axolop-form-${formId}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${formUrl}';
    iframe.width = '${width}';
    iframe.height = '${height}';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    document.getElementById('axolop-form-${formId}').appendChild(iframe);
  })();
</script>`,

      popupButton: `<button onclick="window.open('${formUrl}', 'Axolop Form', 'width=600,height=800')">Open Form</button>`,

      directLink: formUrl
    };
  }

  /**
   * Make a request with proper error handling
   * @param {string} url - Request URL
   * @param {Object} options - Request options including method, headers, body
   * @param {string} errorMessage - Error message to throw if request fails
   * @returns {Promise} Response data
   */
  async makeRequest(url, options, errorMessage = 'Request failed') {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json();
        // If it's an authentication error, throw a specific error for handling
        if (response.status === 401) {
          throw new Error('Authentication token is invalid or expired');
        }
        throw new Error(error.message || errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // If it's the specific auth error, re-throw it so the UI can handle it
      if (error.message === 'Authentication token is invalid or expired') {
        throw error;
      }
      throw error;
    }
  }
}

// Export a singleton instance
const formsApi = new FormsAPI();
export default formsApi;
