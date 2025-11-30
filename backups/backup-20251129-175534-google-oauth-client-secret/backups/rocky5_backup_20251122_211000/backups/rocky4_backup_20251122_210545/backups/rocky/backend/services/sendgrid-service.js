import sgMail from '@sendgrid/mail';
import sgClient from '@sendgrid/client';
import { createClient } from '@supabase/supabase-js';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);
sgClient.setApiKey(SENDGRID_API_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * SendGrid Service - Complete Email Marketing Platform Integration
 *
 * Features:
 * - Single & bulk email sending
 * - Campaign management
 * - Contact list management
 * - Template management
 * - Segmentation
 * - Analytics & tracking
 * - Suppression list management
 * - Webhook event processing
 */
class SendGridService {
  constructor() {
    this.apiKey = SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@axolopcrm.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Axolop CRM';
  }

  // ==========================================
  // CORE EMAIL SENDING
  // ==========================================

  /**
   * Send a single email
   * @param {Object} options - Email options
   * @returns {Object} Send result with messageId
   */
  async sendEmail(options) {
    try {
      const msg = {
        to: options.to,
        from: {
          email: options.from || this.fromEmail,
          name: options.fromName || this.fromName
        },
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        replyTo: options.replyTo,
        customArgs: {
          campaignId: options.campaignId || 'transactional',
          leadId: options.leadId || '',
          contactId: options.contactId || '',
          userId: options.userId || ''
        },
        trackingSettings: {
          clickTracking: { enable: true, enableText: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true }
        }
      };

      // Add CC if provided
      if (options.cc) {
        msg.cc = Array.isArray(options.cc) ? options.cc : [options.cc];
      }

      // Add BCC if provided
      if (options.bcc) {
        msg.bcc = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      }

      // Add attachments if provided
      if (options.attachments) {
        msg.attachments = options.attachments;
      }

      // Add categories for filtering in SendGrid
      if (options.categories) {
        msg.categories = Array.isArray(options.categories) ? options.categories : [options.categories];
      }

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('SendGrid send error:', error);

      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }

      throw {
        message: error.message,
        code: error.code,
        statusCode: error.response?.statusCode,
        errors: error.response?.body?.errors
      };
    }
  }

  /**
   * Send bulk emails (personalized to each recipient)
   * @param {Array} emails - Array of email objects
   * @returns {Object} Bulk send result
   */
  async sendBulkEmail(emails) {
    try {
      const personalizations = emails.map(email => ({
        to: [{ email: email.to }],
        subject: email.subject,
        customArgs: {
          campaignId: email.campaignId || '',
          leadId: email.leadId || '',
          contactId: email.contactId || ''
        },
        substitutions: email.substitutions || {}
      }));

      const msg = {
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        personalizations,
        content: [
          {
            type: 'text/html',
            value: emails[0].html // Base template
          }
        ],
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true }
        }
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        totalSent: emails.length,
        response,
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('SendGrid bulk send error:', error);
      throw error;
    }
  }

  // ==========================================
  // CONTACT MANAGEMENT
  // ==========================================

  /**
   * Add or update contact in SendGrid
   * @param {Object} contact - Contact information
   * @returns {Object} Result
   */
  async addOrUpdateContact(contact) {
    try {
      const data = {
        contacts: [
          {
            email: contact.email,
            first_name: contact.firstName || contact.first_name || '',
            last_name: contact.lastName || contact.last_name || '',
            custom_fields: {
              company: contact.company || '',
              phone: contact.phone || '',
              industry: contact.industry || '',
              lead_score: contact.leadScore || 0,
              contact_id: contact.id || ''
            }
          }
        ]
      };

      const request = {
        url: `/v3/marketing/contacts`,
        method: 'PUT',
        body: data
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        jobId: response.body.job_id,
        response: response.body
      };
    } catch (error) {
      console.error('SendGrid add contact error:', error);
      throw error;
    }
  }

  /**
   * Add multiple contacts to SendGrid
   * @param {Array} contacts - Array of contacts
   * @returns {Object} Result
   */
  async addMultipleContacts(contacts) {
    try {
      const data = {
        contacts: contacts.map(contact => ({
          email: contact.email,
          first_name: contact.firstName || contact.first_name || '',
          last_name: contact.lastName || contact.last_name || '',
          custom_fields: {
            company: contact.company || '',
            phone: contact.phone || '',
            industry: contact.industry || '',
            lead_score: contact.leadScore || 0,
            contact_id: contact.id || ''
          }
        }))
      };

      const request = {
        url: `/v3/marketing/contacts`,
        method: 'PUT',
        body: data
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        jobId: response.body.job_id,
        contactsAdded: contacts.length,
        response: response.body
      };
    } catch (error) {
      console.error('SendGrid bulk add contacts error:', error);
      throw error;
    }
  }

  /**
   * Delete contact from SendGrid
   * @param {String} email - Contact email
   * @returns {Object} Result
   */
  async deleteContact(email) {
    try {
      const request = {
        url: `/v3/marketing/contacts`,
        method: 'DELETE',
        qs: {
          ids: email
        }
      };

      await sgClient.request(request);

      return {
        success: true,
        email
      };
    } catch (error) {
      console.error('SendGrid delete contact error:', error);
      throw error;
    }
  }

  /**
   * Search for contact in SendGrid
   * @param {String} email - Contact email
   * @returns {Object} Contact details
   */
  async searchContact(email) {
    try {
      const request = {
        url: `/v3/marketing/contacts/search`,
        method: 'POST',
        body: {
          query: `email LIKE '${email}%'`
        }
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        contact: response.body.result?.[0] || null
      };
    } catch (error) {
      console.error('SendGrid search contact error:', error);
      throw error;
    }
  }

  // ==========================================
  // LIST MANAGEMENT
  // ==========================================

  /**
   * Create a contact list in SendGrid
   * @param {String} name - List name
   * @returns {Object} List details
   */
  async createList(name) {
    try {
      const request = {
        url: `/v3/marketing/lists`,
        method: 'POST',
        body: {
          name
        }
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        listId: response.body.id,
        list: response.body
      };
    } catch (error) {
      console.error('SendGrid create list error:', error);
      throw error;
    }
  }

  /**
   * Get all contact lists
   * @returns {Array} Lists
   */
  async getLists() {
    try {
      const request = {
        url: `/v3/marketing/lists`,
        method: 'GET'
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        lists: response.body.result || []
      };
    } catch (error) {
      console.error('SendGrid get lists error:', error);
      throw error;
    }
  }

  /**
   * Add contacts to a list
   * @param {String} listId - List ID
   * @param {Array} contactIds - Array of contact IDs
   * @returns {Object} Result
   */
  async addContactsToList(listId, contactIds) {
    try {
      const request = {
        url: `/v3/marketing/lists/${listId}/contacts`,
        method: 'PUT',
        body: {
          contact_ids: contactIds
        }
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        response: response.body
      };
    } catch (error) {
      console.error('SendGrid add contacts to list error:', error);
      throw error;
    }
  }

  // ==========================================
  // TEMPLATE MANAGEMENT
  // ==========================================

  /**
   * Create email template in SendGrid
   * @param {Object} template - Template data
   * @returns {Object} Template details
   */
  async createTemplate(template) {
    try {
      const request = {
        url: `/v3/templates`,
        method: 'POST',
        body: {
          name: template.name,
          generation: 'dynamic'
        }
      };

      const [response] = await sgClient.request(request);
      const templateId = response.body.id;

      // Add version to template
      const versionRequest = {
        url: `/v3/templates/${templateId}/versions`,
        method: 'POST',
        body: {
          name: template.name + ' v1',
          subject: template.subject,
          html_content: template.htmlContent,
          plain_content: template.textContent || this.stripHtml(template.htmlContent),
          active: 1
        }
      };

      await sgClient.request(versionRequest);

      return {
        success: true,
        templateId,
        template: response.body
      };
    } catch (error) {
      console.error('SendGrid create template error:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   * @param {String} templateId - Template ID
   * @returns {Object} Template details
   */
  async getTemplate(templateId) {
    try {
      const request = {
        url: `/v3/templates/${templateId}`,
        method: 'GET'
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        template: response.body
      };
    } catch (error) {
      console.error('SendGrid get template error:', error);
      throw error;
    }
  }

  /**
   * List all templates
   * @returns {Array} Templates
   */
  async listTemplates() {
    try {
      const request = {
        url: `/v3/templates`,
        method: 'GET',
        qs: {
          generations: 'dynamic'
        }
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        templates: response.body.result || []
      };
    } catch (error) {
      console.error('SendGrid list templates error:', error);
      throw error;
    }
  }

  /**
   * Send email using template
   * @param {Object} options - Email options with template
   * @returns {Object} Send result
   */
  async sendTemplateEmail(options) {
    try {
      const msg = {
        to: options.to,
        from: {
          email: options.from || this.fromEmail,
          name: options.fromName || this.fromName
        },
        templateId: options.templateId,
        dynamicTemplateData: options.templateData || {},
        customArgs: {
          campaignId: options.campaignId || '',
          leadId: options.leadId || '',
          contactId: options.contactId || ''
        }
      };

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('SendGrid template send error:', error);
      throw error;
    }
  }

  // ==========================================
  // ANALYTICS & STATISTICS
  // ==========================================

  /**
   * Get email statistics
   * @param {Object} options - Query options (start_date, end_date, categories)
   * @returns {Object} Statistics
   */
  async getStats(options = {}) {
    try {
      const queryParams = {
        start_date: options.startDate || this.getDateDaysAgo(30),
        end_date: options.endDate || this.getDateToday()
      };

      if (options.categories) {
        queryParams.categories = options.categories;
      }

      const request = {
        url: `/v3/stats`,
        method: 'GET',
        qs: queryParams
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        stats: response.body
      };
    } catch (error) {
      console.error('SendGrid get stats error:', error);
      throw error;
    }
  }

  /**
   * Get global email statistics
   * @param {Object} options - Query options
   * @returns {Object} Global stats
   */
  async getGlobalStats(options = {}) {
    try {
      const request = {
        url: `/v3/stats`,
        method: 'GET',
        qs: {
          start_date: options.startDate || this.getDateDaysAgo(30),
          end_date: options.endDate || this.getDateToday(),
          aggregated_by: options.aggregatedBy || 'day'
        }
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        stats: this.calculateAggregatedStats(response.body)
      };
    } catch (error) {
      console.error('SendGrid get global stats error:', error);
      throw error;
    }
  }

  /**
   * Calculate aggregated statistics
   * @param {Array} stats - Raw stats from SendGrid
   * @returns {Object} Aggregated stats
   */
  calculateAggregatedStats(stats) {
    let totals = {
      requests: 0,
      delivered: 0,
      opens: 0,
      uniqueOpens: 0,
      clicks: 0,
      uniqueClicks: 0,
      bounces: 0,
      spamReports: 0,
      unsubscribes: 0
    };

    if (!stats || stats.length === 0) return totals;

    stats.forEach(stat => {
      if (stat.stats && stat.stats.length > 0) {
        stat.stats.forEach(s => {
          const metrics = s.metrics;
          totals.requests += metrics.requests || 0;
          totals.delivered += metrics.delivered || 0;
          totals.opens += metrics.opens || 0;
          totals.uniqueOpens += metrics.unique_opens || 0;
          totals.clicks += metrics.clicks || 0;
          totals.uniqueClicks += metrics.unique_clicks || 0;
          totals.bounces += (metrics.bounces || 0) + (metrics.blocks || 0);
          totals.spamReports += metrics.spam_reports || 0;
          totals.unsubscribes += metrics.unsubscribes || 0;
        });
      }
    });

    // Calculate rates
    totals.deliveryRate = totals.requests > 0 ? (totals.delivered / totals.requests * 100).toFixed(2) : 0;
    totals.openRate = totals.delivered > 0 ? (totals.uniqueOpens / totals.delivered * 100).toFixed(2) : 0;
    totals.clickRate = totals.delivered > 0 ? (totals.uniqueClicks / totals.delivered * 100).toFixed(2) : 0;
    totals.bounceRate = totals.requests > 0 ? (totals.bounces / totals.requests * 100).toFixed(2) : 0;

    return totals;
  }

  // ==========================================
  // SUPPRESSION MANAGEMENT
  // ==========================================

  /**
   * Get suppression list (bounces, blocks, spam reports, unsubscribes)
   * @param {String} type - Type of suppression (bounces, blocks, spam_reports, unsubscribes)
   * @returns {Array} Suppressed emails
   */
  async getSuppressionList(type = 'bounces') {
    try {
      const request = {
        url: `/v3/suppression/${type}`,
        method: 'GET'
      };

      const [response] = await sgClient.request(request);

      return {
        success: true,
        type,
        suppressions: response.body || []
      };
    } catch (error) {
      console.error('SendGrid get suppression list error:', error);
      throw error;
    }
  }

  /**
   * Add email to suppression list
   * @param {String} email - Email to suppress
   * @param {String} type - Suppression type
   * @returns {Object} Result
   */
  async addToSuppressionList(email, type = 'unsubscribes') {
    try {
      const request = {
        url: `/v3/suppression/${type}`,
        method: 'POST',
        body: {
          emails: [email]
        }
      };

      await sgClient.request(request);

      return {
        success: true,
        email,
        type
      };
    } catch (error) {
      console.error('SendGrid add to suppression error:', error);
      throw error;
    }
  }

  /**
   * Remove email from suppression list
   * @param {String} email - Email to remove
   * @param {String} type - Suppression type
   * @returns {Object} Result
   */
  async removeFromSuppressionList(email, type = 'unsubscribes') {
    try {
      const request = {
        url: `/v3/suppression/${type}/${email}`,
        method: 'DELETE'
      };

      await sgClient.request(request);

      return {
        success: true,
        email,
        type
      };
    } catch (error) {
      console.error('SendGrid remove from suppression error:', error);
      throw error;
    }
  }

  /**
   * Sync suppression list to Supabase
   * @returns {Object} Sync result
   */
  async syncSuppressionListToSupabase() {
    try {
      const suppressionTypes = ['bounces', 'blocks', 'spam_reports', 'unsubscribes'];
      let totalSynced = 0;

      for (const type of suppressionTypes) {
        const { suppressions } = await this.getSuppressionList(type);

        for (const suppression of suppressions) {
          // Add to Supabase suppression list
          await supabase.from('email_suppressions').upsert({
            email: suppression.email,
            type: type,
            reason: suppression.reason || '',
            created_at: suppression.created || new Date(),
            provider: 'sendgrid'
          }, {
            onConflict: 'email,type'
          });

          totalSynced++;
        }
      }

      return {
        success: true,
        totalSynced
      };
    } catch (error) {
      console.error('SendGrid suppression sync error:', error);
      throw error;
    }
  }

  // ==========================================
  // WEBHOOK EVENT PROCESSING
  // ==========================================

  /**
   * Process SendGrid webhook events
   * @param {Array} events - Array of webhook events
   * @returns {Object} Processing result
   */
  async processWebhookEvents(events) {
    try {
      let processed = 0;

      for (const event of events) {
        // Store event in database
        await supabase.from('email_events').insert({
          email: event.email,
          event_type: event.event,
          timestamp: new Date(event.timestamp * 1000),
          campaign_id: event.campaign_id || event.customArgs?.campaignId || null,
          message_id: event.sg_message_id,
          response: event.response || '',
          reason: event.reason || '',
          url: event.url || '',
          user_agent: event.useragent || '',
          ip: event.ip || '',
          provider: 'sendgrid',
          raw_data: event
        });

        // Update campaign email status based on event type
        if (event.customArgs?.campaignId) {
          await this.updateCampaignEmailStatus(event);
        }

        processed++;
      }

      return {
        success: true,
        eventsProcessed: processed
      };
    } catch (error) {
      console.error('SendGrid webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Update campaign email status based on webhook event
   * @param {Object} event - Webhook event
   */
  async updateCampaignEmailStatus(event) {
    try {
      const updateData = {
        updated_at: new Date()
      };

      switch (event.event) {
        case 'delivered':
          updateData.status = 'DELIVERED';
          updateData.delivered_at = new Date(event.timestamp * 1000);
          break;
        case 'open':
          updateData.opened_at = new Date(event.timestamp * 1000);
          updateData.open_count = supabase.raw('COALESCE(open_count, 0) + 1');
          break;
        case 'click':
          updateData.clicked_at = new Date(event.timestamp * 1000);
          updateData.click_count = supabase.raw('COALESCE(click_count, 0) + 1');
          updateData.last_clicked_url = event.url;
          break;
        case 'bounce':
        case 'dropped':
          updateData.status = 'BOUNCED';
          updateData.bounce_reason = event.reason;
          break;
        case 'spamreport':
          updateData.status = 'SPAM';
          break;
        case 'unsubscribe':
          updateData.unsubscribed_at = new Date(event.timestamp * 1000);
          break;
      }

      // Update campaign email record
      await supabase
        .from('campaign_emails')
        .update(updateData)
        .eq('campaign_id', event.customArgs.campaignId)
        .eq('recipient_email', event.email);

    } catch (error) {
      console.error('Update campaign email status error:', error);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Strip HTML tags from content
   * @param {String} html - HTML content
   * @returns {String} Plain text
   */
  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Get date N days ago in YYYY-MM-DD format
   * @param {Number} days - Number of days ago
   * @returns {String} Date string
   */
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {String} Date string
   */
  getDateToday() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Validate email address
   * @param {String} email - Email to validate
   * @returns {Boolean} Is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if email is in suppression list
   * @param {String} email - Email to check
   * @returns {Boolean} Is suppressed
   */
  async isEmailSuppressed(email) {
    try {
      const { data, error } = await supabase
        .from('email_suppressions')
        .select('*')
        .eq('email', email)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  }
}

export default SendGridService;
