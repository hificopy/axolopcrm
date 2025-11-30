/**
 * Email Marketing Service
 * Frontend service for all email marketing API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

class EmailMarketingService {
  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================

  async getDashboard(days = 30) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/dashboard?days=${days}`);
    return response.json();
  }

  async getAnalytics(params = {}) {
    const { days = 30, startDate, endDate } = params;
    const queryParams = new URLSearchParams({
      days,
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

    const response = await fetch(`${API_BASE_URL}/api/email-marketing/analytics?${queryParams}`);
    return response.json();
  }

  async getPerformanceAnalytics(days = 30) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/analytics/performance?days=${days}`);
    return response.json();
  }

  // ==========================================
  // CAMPAIGNS
  // ==========================================

  async getCampaigns(params = {}) {
    const { page = 1, limit = 10, status, type, search } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns?${queryParams}`);
    return response.json();
  }

  async getCampaign(id) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${id}`);
    return response.json();
  }

  async createCampaign(data) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateCampaign(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async deleteCampaign(id) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  async addRecipients(campaignId, recipients) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${campaignId}/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients })
    });
    return response.json();
  }

  async sendCampaign(campaignId, scheduleFor = null) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${campaignId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleFor })
    });
    return response.json();
  }

  async sendTestEmail(campaignId, testEmails) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${campaignId}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testEmails })
    });
    return response.json();
  }

  async getCampaignStats(campaignId) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/campaigns/${campaignId}/stats`);
    return response.json();
  }

  // ==========================================
  // TEMPLATES
  // ==========================================

  async getTemplates(params = {}) {
    const { page = 1, limit = 10, category, search } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/api/email-marketing/templates?${queryParams}`);
    return response.json();
  }

  async getTemplate(id) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/templates/${id}`);
    return response.json();
  }

  async createTemplate(data) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateTemplate(id, data) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async deleteTemplate(id) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/templates/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // ==========================================
  // WORKFLOWS
  // ==========================================

  async getWorkflows(params = {}) {
    const { page = 1, limit = 10, isActive } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(isActive !== undefined && { isActive })
    });

    const response = await fetch(`${API_BASE_URL}/api/email-marketing/workflows?${queryParams}`);
    return response.json();
  }

  async createWorkflow(data) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async toggleWorkflow(id) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/workflows/${id}/toggle`, {
      method: 'PUT'
    });
    return response.json();
  }

  // ==========================================
  // SENDGRID SPECIFIC
  // ==========================================

  async getSendGridHealth() {
    const response = await fetch(`${API_BASE_URL}/api/sendgrid/health`);
    return response.json();
  }

  async getSendGridStats(params = {}) {
    const { startDate, endDate, aggregatedBy } = params;
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(aggregatedBy && { aggregatedBy })
    });

    const response = await fetch(`${API_BASE_URL}/api/sendgrid/stats?${queryParams}`);
    return response.json();
  }

  async getSuppressionLists() {
    const response = await fetch(`${API_BASE_URL}/api/sendgrid/suppressions`);
    return response.json();
  }

  async syncSuppressionLists() {
    const response = await fetch(`${API_BASE_URL}/api/sendgrid/suppressions/sync`, {
      method: 'POST'
    });
    return response.json();
  }

  async syncContact(contact) {
    const response = await fetch(`${API_BASE_URL}/api/sendgrid/contacts/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact })
    });
    return response.json();
  }

  async syncContacts(contacts) {
    const response = await fetch(`${API_BASE_URL}/api/sendgrid/contacts/bulk-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts })
    });
    return response.json();
  }

  async syncAllContacts(limit = 100) {
    const response = await fetch(`${API_BASE_URL}/api/email-marketing/contacts/sync?limit=${limit}`, {
      method: 'POST'
    });
    return response.json();
  }
}

export default new EmailMarketingService();
