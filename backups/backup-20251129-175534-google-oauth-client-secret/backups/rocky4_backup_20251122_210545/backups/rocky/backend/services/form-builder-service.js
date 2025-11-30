import { createClient } from '@supabase/supabase-js';
import EmailService from './email-service.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class FormBuilderService {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Create a new form with specified questions and settings
   * @param {Object} formData - Form data including title, description, questions, settings
   * @returns {Object} Created form object
   */
  async createForm(formData) {
    try {
      const {
        title,
        description = '',
        questions = [],
        settings = {},
        userId // Assuming the user creating the form
      } = formData;

      // Validate form data
      if (!title || typeof title !== 'string') {
        throw new Error('Form title is required');
      }

      if (!Array.isArray(questions)) {
        throw new Error('Questions must be an array');
      }

      // Create form in database
      const { data: form, error } = await supabase
        .from('forms')
        .insert({
          title,
          description,
          questions: JSON.stringify(questions),
          settings: JSON.stringify(settings),
          created_by: userId,
          is_active: false,
          is_published: false,
          total_responses: 0,
          conversion_rate: 0,
          average_lead_score: 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating form: ${error.message}`);
      }

      return form;
    } catch (error) {
      console.error('Error in createForm:', error);
      throw error;
    }
  }

  /**
   * Update an existing form
   * @param {string} formId - ID of the form to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated form object
   */
  async updateForm(formId, updates) {
    try {
      const { data: form, error } = await supabase
        .from('forms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', formId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating form: ${error.message}`);
      }

      return form;
    } catch (error) {
      console.error('Error in updateForm:', error);
      throw error;
    }
  }

  /**
   * Process a form submission
   * @param {string} formId - ID of the form being submitted
   * @param {Object} formData - Submitted form data
   * @param {Object} metadata - Additional metadata about the submission
   * @returns {Object} Processed form response
   */
  async processFormSubmission(formId, formData, metadata = {}) {
    try {
      // Get the form to validate and calculate lead scoring
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError || !form) {
        throw new Error('Form not found');
      }

      if (!form.is_published) {
        throw new Error('Form is not published');
      }

      // Validate and process responses
      const { responses } = formData;
      const questions = typeof form.questions === 'string' 
        ? JSON.parse(form.questions) 
        : form.questions;

      // Calculate lead score based on responses
      const leadScore = this.calculateLeadScore(questions, responses);

      // Extract contact information
      const contactInfo = this.extractContactInfo(questions, responses);

      // Store the form response in the database
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: formId,
          responses: JSON.stringify(responses),
          lead_score: leadScore.total,
          lead_score_breakdown: JSON.stringify(leadScore.breakdown),
          is_qualified: leadScore.qualified,
          contact_email: contactInfo.email,
          contact_name: contactInfo.name,
          contact_phone: contactInfo.phone,
          ip_address: metadata.ip_address || null,
          user_agent: metadata.user_agent || null,
          referrer: metadata.referrer || null,
          utm_source: metadata.utm_source || null,
          utm_medium: metadata.utm_medium || null,
          utm_campaign: metadata.utm_campaign || null,
        })
        .select()
        .single();

      if (responseError) {
        throw new Error(`Error storing form response: ${responseError.message}`);
      }

      // Update form statistics
      await this.updateFormStats(formId);

      // Execute form actions (like sending follow-up emails)
      await this.executeFormActions(formId, form, responses, contactInfo);

      return {
        response,
        leadScore
      };
    } catch (error) {
      console.error('Error in processFormSubmission:', error);
      throw error;
    }
  }

  /**
   * Calculate lead score based on form responses
   * @param {Array} questions - Array of form questions
   * @param {Object} responses - User responses
   * @returns {Object} Lead score with breakdown
   */
  calculateLeadScore(questions, responses) {
    let total = 0;
    const breakdown = {};

    questions.forEach(question => {
      if (!question.lead_scoring_enabled || !question.lead_scoring) {
        return;
      }

      const response = responses[question.id];
      if (response === undefined || response === null) {
        return;
      }

      let questionScore = 0;

      if (Array.isArray(response)) {
        // Multiple selections (checkboxes)
        response.forEach(value => {
          const score = question.lead_scoring[value] || 0;
          questionScore += score;
        });
      } else {
        // Single selection
        const scoreKey = question.type === 'rating' ? `rating-${response}` : response;
        questionScore = question.lead_scoring[scoreKey] || 0;
      }

      if (questionScore !== 0) {
        breakdown[question.id] = {
          title: question.title,
          score: questionScore,
          response: response
        };
      }

      total += questionScore;
    });

    return {
      total,
      breakdown,
      qualified: total > 0 // Consider qualified if score > 0
    };
  }

  /**
   * Extract contact information from responses
   * @param {Array} questions - Array of form questions
   * @param {Object} responses - User responses
   * @returns {Object} Contact information
   */
  extractContactInfo(questions, responses) {
    const contact = {
      email: null,
      name: null,
      phone: null
    };

    questions.forEach(q => {
      const response = responses[q.id];
      if (!response) return;

      if (q.type === 'email') contact.email = response;
      else if (q.type === 'phone') contact.phone = response;
      else if (q.type === 'short-text' && (
        q.title?.toLowerCase().includes('name') || 
        q.title?.toLowerCase().includes('full name') ||
        q.title?.toLowerCase().includes('first name') ||
        q.title?.toLowerCase().includes('last name')
      )) {
        contact.name = response;
      }
    });

    return contact;
  }

  /**
   * Update form statistics after a response
   * @param {string} formId - ID of the form
   */
  async updateFormStats(formId) {
    try {
      // Get total responses count
      const { count: totalResponses, error: countError } = await supabase
        .from('form_responses')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId);

      if (countError) {
        console.error('Error getting response count:', countError);
        return;
      }

      // Calculate average lead score
      const { data: avgScoreResult, error: avgError } = await supabase
        .from('form_responses')
        .select('avg(lead_score)')
        .eq('form_id', formId);

      let avgScore = 0;
      if (!avgError && avgScoreResult && avgScoreResult.length > 0) {
        avgScore = parseFloat(avgScoreResult[0].avg) || 0;
      }

      // Update form statistics
      const { error: updateError } = await supabase
        .from('forms')
        .update({
          total_responses: totalResponses,
          average_lead_score: avgScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', formId);

      if (updateError) {
        console.error('Error updating form stats:', updateError);
      }
    } catch (error) {
      console.error('Error in updateFormStats:', error);
    }
  }

  /**
   * Execute form actions after submission (like sending follow-up emails)
   * @param {string} formId - ID of the form
   * @param {Object} form - Form object
   * @param {Object} responses - User responses
   * @param {Object} contactInfo - Contact information
   */
  async executeFormActions(formId, form, responses, contactInfo) {
    try {
      // Get form integrations
      const { data: integrations, error: intError } = await supabase
        .from('form_integrations')
        .select('*')
        .eq('form_id', formId)
        .eq('active', true);

      if (intError) {
        console.error('Error getting form integrations:', intError);
        return;
      }

      // Process each integration
      for (const integration of integrations) {
        switch (integration.integration_type) {
          case 'EMAIL_FOLLOWUP':
            await this.handleEmailFollowup(integration, responses, contactInfo);
            break;
          case 'WEBHOOK':
            await this.handleWebhook(integration, formId, responses, contactInfo);
            break;
          case 'CRM_SYNC':
            await this.handleCRMSync(integration, formId, responses, contactInfo);
            break;
          // Add more integration types as needed
        }
      }
    } catch (error) {
      console.error('Error in executeFormActions:', error);
    }
  }

  /**
   * Handle email followup integration
   * @param {Object} integration - Integration configuration
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async handleEmailFollowup(integration, responses, contactInfo) {
    try {
      if (!contactInfo.email) {
        console.log('No email address found for followup');
        return;
      }

      // Prepare email content with form data
      let subject = integration.email_template?.subject || 'Thank you for your submission';
      let htmlContent = integration.email_template?.html_content || 'Thank you for your submission!';

      // Replace placeholders with actual response values
      Object.entries(responses).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value || '');
        subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
      });

      // Send the email
      await this.emailService.sendEmail({
        to: contactInfo.email,
        subject: subject,
        html: htmlContent,
        from: process.env.DEFAULT_EMAIL_FROM || 'noreply@yourdomain.com'
      });

      console.log(`Followup email sent to ${contactInfo.email}`);
    } catch (error) {
      console.error('Error handling email followup:', error);
    }
  }

  /**
   * Handle webhook integration
   * @param {Object} integration - Integration configuration
   * @param {string} formId - Form ID
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async handleWebhook(integration, formId, responses, contactInfo) {
    try {
      const payload = {
        formId,
        responses,
        contactInfo,
        timestamp: new Date().toISOString()
      };

      const options = {
        method: integration.webhook_method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...integration.webhook_headers
        },
        body: JSON.stringify(payload)
      };

      const response = await fetch(integration.webhook_url, options);
      
      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      console.log('Webhook request sent successfully:', integration.webhook_url);
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }

  /**
   * Handle CRM sync integration
   * @param {Object} integration - Integration configuration
   * @param {string} formId - Form ID
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async handleCRMSync(integration, formId, responses, contactInfo) {
    try {
      // Create or update contact in CRM based on form submission
      let contactData = {
        email: contactInfo.email,
        name: contactInfo.name,
        phone: contactInfo.phone,
        source: `Form: ${formId}`,
        form_responses: responses
      };

      // Add additional fields from responses if they match contact properties
      Object.entries(responses).forEach(([key, value]) => {
        if (!contactData[key]) {
          contactData[key] = value;
        }
      });

      // Create or update contact in the contacts table
      let result;
      if (contactInfo.email) {
        // Try to update existing contact
        const { data: existingContact, error: updateError } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('email', contactInfo.email)
          .select()
          .single();

        if (updateError) {
          // Create new contact
          const { data: newContact, error: createError } = await supabase
            .from('contacts')
            .insert(contactData)
            .select()
            .single();

          if (createError) {
            console.error('Error creating contact:', createError);
            return;
          }
          
          result = newContact;
        } else {
          result = existingContact;
        }
      } else {
        // Create contact without email
        const { data: newContact, error: createError } = await supabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single();

        if (createError) {
          console.error('Error creating contact:', createError);
          return;
        }

        result = newContact;
      }

      console.log('Contact synced to CRM:', result.id);
    } catch (error) {
      console.error('Error handling CRM sync:', error);
    }
  }
}

export default FormBuilderService;