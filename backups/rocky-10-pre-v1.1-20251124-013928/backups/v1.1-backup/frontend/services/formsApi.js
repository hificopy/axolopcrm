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
   * Get authorization headers with Supabase token
   * @returns {Promise<Object>} Headers object with auth token
   */
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    return headers;
  }

  /**
   * Get all forms
   * @param {Object} params - Query parameters (status, search)
   * @returns {Promise<Array>} List of forms
   */
  async getForms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch forms');
    }

    const data = await response.json();
    return data.forms;
  }

  /**
   * Get a single form by ID (authenticated)
   * @param {string} formId - Form ID
   * @returns {Promise<Object>} Form data
   */
  async getForm(formId) {
    const response = await fetch(`${this.baseURL}/${formId}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch form');
    }

    const data = await response.json();
    return data.form;
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
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create form');
    }

    const data = await response.json();
    return data.form;
  }

  /**
   * Update an existing form
   * @param {string} formId - Form ID
   * @param {Object} updates - Updated form data
   * @returns {Promise<Object>} Updated form
   */
  async updateForm(formId, updates) {
    const response = await fetch(`${this.baseURL}/${formId}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update form');
    }

    const data = await response.json();
    return data.form;
  }

  /**
   * Delete a form (soft delete)
   * @param {string} formId - Form ID
   * @returns {Promise<Object>} Deleted form info
   */
  async deleteForm(formId) {
    const response = await fetch(`${this.baseURL}/${formId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete form');
    }

    const data = await response.json();
    return data.form;
  }

  /**
   * Duplicate a form
   * @param {string} formId - Form ID to duplicate
   * @returns {Promise<Object>} New duplicated form
   */
  async duplicateForm(formId) {
    const response = await fetch(`${this.baseURL}/${formId}/duplicate`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to duplicate form');
    }

    const data = await response.json();
    return data.form;
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

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch responses');
    }

    return await response.json();
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

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    return await response.json();
  }

  /**
   * Export form responses
   * @param {string} formId - Form ID
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {Promise<Blob|Object>} Exported data
   */
  async exportResponses(formId, format = 'json') {
    const authHeaders = await this.getAuthHeaders();
    const headers = format === 'csv' ? authHeaders : authHeaders;

    const response = await fetch(`${this.baseURL}/${formId}/export?format=${format}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export responses');
    }

    if (format === 'csv') {
      return await response.blob();
    } else {
      return await response.json();
    }
  }

  /**
   * Get all integrations for a form
   * @param {string} formId - Form ID
   * @returns {Promise<Array>} List of integrations
   */
  async getIntegrations(formId) {
    const response = await fetch(`${this.baseURL}/${formId}/integrations`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch integrations');
    }

    const data = await response.json();
    return data.integrations;
  }

  /**
   * Add an integration to a form
   * @param {string} formId - Form ID
   * @param {Object} integrationData - Integration configuration
   * @returns {Promise<Object>} Created integration
   */
  async addIntegration(formId, integrationData) {
    const response = await fetch(`${this.baseURL}/${formId}/integrations`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(integrationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add integration');
    }

    const data = await response.json();
    return data.integration;
  }

  /**
   * Update an integration
   * @param {string} formId - Form ID
   * @param {string} integrationId - Integration ID
   * @param {Object} updates - Updated integration data
   * @returns {Promise<Object>} Updated integration
   */
  async updateIntegration(formId, integrationId, updates) {
    const response = await fetch(`${this.baseURL}/${formId}/integrations/${integrationId}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update integration');
    }

    const data = await response.json();
    return data.integration;
  }

  /**
   * Delete an integration
   * @param {string} formId - Form ID
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} Deleted integration info
   */
  async deleteIntegration(formId, integrationId) {
    const response = await fetch(`${this.baseURL}/${formId}/integrations/${integrationId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete integration');
    }

    const data = await response.json();
    return data.integration;
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
}

// Export a singleton instance
const formsApi = new FormsAPI();
export default formsApi;
