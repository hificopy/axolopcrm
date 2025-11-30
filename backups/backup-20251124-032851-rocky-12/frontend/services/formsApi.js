/**
 * Forms API Service
 * Handles all API calls related to forms
 * Simplified version - lets Supabase handle session management automatically
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
   * Get authorization headers with current Supabase token
   * Supabase automatically handles token refresh
   */
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    // Get current session - Supabase handles refresh automatically
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error('Authentication required');
    }

    headers['Authorization'] = `Bearer ${session.access_token}`;
    return headers;
  }

  /**
   * Make authenticated API request with automatic retry on auth failure
   */
  async makeAuthenticatedRequest(url, options = {}) {
    console.log('🔵 [FormsAPI] makeAuthenticatedRequest called');
    console.log('🔵 [FormsAPI] URL:', url);
    console.log('🔵 [FormsAPI] Method:', options.method || 'GET');

    try {
      console.log('🔵 [FormsAPI] Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('✅ [FormsAPI] Auth headers obtained');

      console.log('🔵 [FormsAPI] Making fetch request...');
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
      });
      console.log('✅ [FormsAPI] Fetch completed, status:', response.status);

      // If 401 and haven't retried yet, refresh session and try once more
      if (response.status === 401 && !options._retry) {
        console.log('⚠️ [FormsAPI] 401 Unauthorized, refreshing session...');
        // Force refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error('Session expired. Please sign in again.');
        }

        // Retry the request once with new token
        console.log('🔵 [FormsAPI] Retrying with new token...');
        return this.makeAuthenticatedRequest(url, { ...options, _retry: true });
      }

      if (!response.ok) {
        console.error('❌ [FormsAPI] Response not OK:', response.status);
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      console.log('🔵 [FormsAPI] Parsing JSON response...');
      const jsonData = await response.json();
      console.log('✅ [FormsAPI] JSON parsed:', jsonData);
      return jsonData;
    } catch (error) {
      console.error('❌ [FormsAPI] Request failed:', error);
      console.error('❌ [FormsAPI] Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Get all forms
   */
  async getForms(params = {}) {
    // Filter out undefined values to prevent "undefined" strings in URL
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const queryString = new URLSearchParams(filteredParams).toString();
    const url = `${this.baseURL}${queryString ? `?${queryString}` : ''}`;
    return this.makeAuthenticatedRequest(url);
  }

  /**
   * Get a single form by ID
   */
  async getForm(formId) {
    const url = `${this.baseURL}/${formId}`;
    return this.makeAuthenticatedRequest(url);
  }

  /**
   * Get a public form (no auth required)
   */
  async getPublicForm(formId) {
    const response = await fetch(`${this.baseURL}/${formId}/public`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch form');
    }
    return await response.json();
  }

  /**
   * Create a new form
   */
  async createForm(formData) {
    console.log('🔵 [FormsAPI] createForm called');
    console.log('🔵 [FormsAPI] baseURL:', this.baseURL);
    console.log('🔵 [FormsAPI] formData:', formData);

    const result = await this.makeAuthenticatedRequest(this.baseURL, {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    console.log('✅ [FormsAPI] createForm result:', result);
    return result;
  }

  /**
   * Update an existing form
   */
  async updateForm(formId, updates) {
    return this.makeAuthenticatedRequest(`${this.baseURL}/${formId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete a form
   */
  async deleteForm(formId) {
    return this.makeAuthenticatedRequest(`${this.baseURL}/${formId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Duplicate a form
   */
  async duplicateForm(formId) {
    return this.makeAuthenticatedRequest(`${this.baseURL}/${formId}/duplicate`, {
      method: 'POST'
    });
  }

  /**
   * Submit a form response (public endpoint)
   */
  async submitForm(formId, responseData) {
    const response = await fetch(`${this.baseURL}/${formId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit form');
    }

    return await response.json();
  }

  /**
   * Get all responses for a form
   */
  async getResponses(formId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/${formId}/responses${queryString ? `?${queryString}` : ''}`;
    return this.makeAuthenticatedRequest(url);
  }

  /**
   * Get analytics for a form
   */
  async getAnalytics(formId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/${formId}/analytics${queryString ? `?${queryString}` : ''}`;
    return this.makeAuthenticatedRequest(url);
  }

  /**
   * Export form responses
   */
  async exportResponses(formId, format = 'json') {
    const url = `${this.baseURL}/${formId}/export?format=${format}`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export responses');
    }

    return format === 'csv' ? await response.blob() : await response.json();
  }

  /**
   * Get all integrations for a form
   */
  async getIntegrations(formId) {
    return this.makeAuthenticatedRequest(`${this.baseURL}/${formId}/integrations`);
  }

  /**
   * Add an integration to a form
   */
  async addIntegration(formId, integrationData) {
    return this.makeAuthenticatedRequest(`${this.baseURL}/${formId}/integrations`, {
      method: 'POST',
      body: JSON.stringify(integrationData)
    });
  }

  /**
   * Update an integration
   */
  async updateIntegration(formId, integrationId, updates) {
    return this.makeAuthenticatedRequest(
      `${this.baseURL}/${formId}/integrations/${integrationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );
  }

  /**
   * Delete an integration
   */
  async deleteIntegration(formId, integrationId) {
    return this.makeAuthenticatedRequest(
      `${this.baseURL}/${formId}/integrations/${integrationId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Generate embed code for a form
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
}

// Export a singleton instance
const formsApi = new FormsAPI();
export default formsApi;
