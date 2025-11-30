import sgMail from '@sendgrid/mail';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';

class SendGridService {
  constructor() {
    this.enabled = config.sendgrid.enabled;
    
    if (this.enabled) {
      sgMail.setApiKey(config.sendgrid.apiKey);
      logger.info('✅ SendGrid service initialized');
    } else {
      logger.warn('⚠️ SendGrid is not configured or disabled');
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(to, subject, html, text = '', from = null) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Email not sent.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      const msg = {
        to,
        from: from || config.sendgrid.fromEmail || 'noreply@axolopcrm.com',
        subject,
        text: text || html.replace(/<[^>]*>/g, ''), // Fallback to HTML as text if no text provided
        html,
      };

      const response = await sgMail.send(msg);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: response[0]?.headers?.get('x-message-id')
      });

      return response;
    } catch (error) {
      logger.error('Error sending email with SendGrid:', error);
      
      // Handle specific SendGrid errors
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
          text: error.response.text,
        });
      }
      
      throw error;
    }
  }

  /**
   * Send email with template
   */
  async sendEmailWithTemplate(to, templateId, templateData, from = null) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Email not sent.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      const msg = {
        to,
        from: from || config.sendgrid.fromEmail || 'noreply@axolopcrm.com',
        templateId,
        dynamicTemplateData: templateData,
      };

      const response = await sgMail.send(msg);
      
      logger.info('Template email sent successfully', {
        to,
        templateId,
        messageId: response[0]?.headers?.get('x-message-id')
      });

      return response;
    } catch (error) {
      logger.error('Error sending template email with SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
          text: error.response.text,
        });
      }
      
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Bulk emails not sent.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      // Send multiple emails as a batch
      const response = await sgMail.send(messages);
      
      logger.info(`Bulk emails sent successfully. Count: ${messages.length}`);
      
      return response;
    } catch (error) {
      logger.error('Error sending bulk emails with SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
          text: error.response.text,
        });
      }
      
      throw error;
    }
  }

  /**
   * Send marketing email campaign
   */
  async sendMarketingEmail(to, campaignId, subject, htmlContent, from = null) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Marketing email not sent.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      const msg = {
        to,
        from: from || config.sendgrid.fromEmail || 'noreply@axolopcrm.com',
        subject,
        html: htmlContent,
        // Add custom headers for marketing campaign tracking
        headers: {
          'X-Campaign-ID': campaignId,
          'X-Message-Type': 'marketing',
        },
      };

      const response = await sgMail.send(msg);
      
      logger.info('Marketing email sent successfully', {
        to,
        campaignId,
        messageId: response[0]?.headers?.get('x-message-id')
      });

      return response;
    } catch (error) {
      logger.error('Error sending marketing email with SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
          text: error.response.text,
        });
      }
      
      throw error;
    }
  }

  /**
   * Send transactional email
   */
  async sendTransactionalEmail(to, subject, html, text = '', from = null) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Transactional email not sent.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      const msg = {
        to,
        from: from || config.sendgrid.fromEmail || 'noreply@axolopcrm.com',
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        // Add custom headers for transactional emails
        headers: {
          'X-Message-Type': 'transactional',
        },
      };

      const response = await sgMail.send(msg);
      
      logger.info('Transactional email sent successfully', {
        to,
        subject,
        messageId: response[0]?.headers?.get('x-message-id')
      });

      return response;
    } catch (error) {
      logger.error('Error sending transactional email with SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
          text: error.response.text,
        });
      }
      
      throw error;
    }
  }

  /**
   * Add contact to a list
   */
  async addContactToList(contactData, listId = null) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Contact not added.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      // Prepare contact data for SendGrid Marketing Campaigns
      const response = await sgMail.request({
        url: '/v3/marketing/contacts',
        method: 'PUT',
        body: {
          list_ids: listId ? [listId] : [],
          contacts: [contactData]
        }
      });

      logger.info('Contact added to SendGrid successfully', {
        email: contactData.email
      });

      return response;
    } catch (error) {
      logger.error('Error adding contact to SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
        });
      }
      
      throw error;
    }
  }

  /**
   * Create a contact
   */
  async createContact(email, firstName = '', lastName = '', customFields = {}) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Contact not created.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      const contact = {
        email,
        first_name: firstName,
        last_name: lastName,
        ...customFields
      };

      const response = await sgMail.request({
        url: '/v3/marketing/contacts',
        method: 'PUT',
        body: {
          contacts: [contact]
        }
      });

      logger.info('Contact created in SendGrid successfully', {
        email
      });

      return response;
    } catch (error) {
      logger.error('Error creating contact in SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
        });
      }
      
      throw error;
    }
  }

  /**
   * Get contact by email
   */
  async getContact(email) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Cannot get contact.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await sgMail.request({
        url: `/v3/marketing/contacts/search?query=email%20LIKE%20%22${encodedEmail}%22`,
        method: 'GET'
      });

      logger.info('Contact retrieved from SendGrid', {
        email,
        resultCount: response.body.result ? response.body.result.length : 0
      });

      const contacts = response.body.result || [];
      return contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      logger.error('Error getting contact from SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
        });
      }
      
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(startDate, endDate = null, email = null) {
    if (!this.enabled) {
      logger.error('SendGrid is disabled. Cannot get stats.');
      throw new Error('SendGrid is not configured or disabled');
    }

    try {
      // This would use SendGrid's email activity API
      // For now, we'll implement the basic functionality
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      if (endDate) {
        params.append('end_date', endDate);
      }
      if (email) {
        params.append('email', email);
      }

      const response = await sgMail.request({
        url: `/v3/messages?${params.toString()}`,
        method: 'GET'
      });

      return response.body;
    } catch (error) {
      logger.error('Error getting email stats from SendGrid:', error);
      
      if (error.response) {
        logger.error('SendGrid error details:', {
          status: error.response.status,
          body: error.response.body,
        });
      }
      
      throw error;
    }
  }

  /**
   * Check if SendGrid is properly configured
   */
  isConfigured() {
    return this.enabled;
  }
}

export default new SendGridService();