import { createClient } from '@supabase/supabase-js';
import EmailService from './email-service.js';
import FormBuilderService from './form-builder-service.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class FormCampaignIntegrationService {
  constructor() {
    this.emailService = new EmailService();
    this.formBuilderService = new FormBuilderService();
  }

  /**
   * Create an automated email campaign triggered by form submission
   * @param {Object} formData - Form data that triggers the campaign
   * @param {Object} campaignConfig - Configuration for the email campaign
   * @param {Object} contactInfo - Contact information from the form
   */
  async createFormTriggeredCampaign(formData, campaignConfig, contactInfo) {
    try {
      // Create a campaign entry in the database
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignConfig.name || `Form-${formData.id}-Auto-Campaign`,
          subject: campaignConfig.subject,
          preview_text: campaignConfig.preview_text || '',
          html_content: campaignConfig.html_content,
          text_content: campaignConfig.text_content || '',
          type: 'AUTOMATED', // This is an automated campaign
          status: 'ACTIVE',
          from_name: campaignConfig.from_name || process.env.DEFAULT_FROM_NAME,
          from_email: campaignConfig.from_email || process.env.DEFAULT_EMAIL_FROM,
          reply_to_email: campaignConfig.reply_to_email,
          target_segment: 'FORM_SUBMITTERS', // Segment for people who submitted this form
          form_id: formData.id,
          trigger_type: 'FORM_SUBMIT', // Trigger when form is submitted
          trigger_form_id: formData.id,
          automation_enabled: true,
          created_at: new Date().toISOString(),
          // Additional fields based on campaignConfig
        })
        .select()
        .single();

      if (campaignError) {
        throw new Error(`Error creating campaign: ${campaignError.message}`);
      }

      // Send the initial email to the contact if email is available
      if (contactInfo.email) {
        await this.sendFormTriggeredEmail(campaign.id, contactInfo, formData.responses || {});
      }

      return campaign;
    } catch (error) {
      console.error('Error in createFormTriggeredCampaign:', error);
      throw error;
    }
  }

  /**
   * Send a form-triggered email
   * @param {string} campaignId - ID of the campaign to send
   * @param {Object} contactInfo - Contact information
   * @param {Object} responses - Form responses
   */
  async sendFormTriggeredEmail(campaignId, contactInfo, responses) {
    try {
      // Get the campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        throw new Error(`Campaign ${campaignId} not found: ${campaignError.message}`);
      }

      // Prepare email content with form data
      let subject = campaign.subject || 'Thank you for your submission';
      let htmlContent = campaign.html_content || 'Thank you for your submission!';

      // Replace placeholders with form response values
      Object.entries(responses).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value || '');
        subject = subject.replace(new RegExp(placeholder, 'g'), value || '');
      });

      // Replace contact placeholders
      htmlContent = this.replaceContactPlaceholders(htmlContent, contactInfo);
      subject = this.replaceContactPlaceholders(subject, contactInfo);

      // Send the email
      const sendResult = await this.emailService.sendEmail({
        to: contactInfo.email,
        subject: subject,
        html: htmlContent,
        from: `${campaign.from_name} <${campaign.from_email}>`,
        replyTo: campaign.reply_to_email
      });

      // Create a campaign email record
      const { data: campaignEmail, error: emailError } = await supabase
        .from('campaign_emails')
        .insert({
          campaign_id: campaignId,
          recipient_email: contactInfo.email,
          recipient_name: contactInfo.name,
          status: 'SENT',
          sent_at: new Date().toISOString(),
          message_id: sendResult.messageId,
          lead_id: contactInfo.lead_id || null,
          contact_id: contactInfo.contact_id || null
        })
        .select()
        .single();

      if (emailError) {
        console.error('Error creating campaign email record:', emailError);
        // Continue even if the record creation failed
      }

      console.log(`Form-triggered email sent to ${contactInfo.email}`);
      return sendResult;
    } catch (error) {
      console.error('Error sending form-triggered email:', error);
      throw error;
    }
  }

  /**
   * Create a form submission that automatically adds the contact to a campaign
   * @param {string} formId - ID of the form being submitted
   * @param {string} campaignId - ID of the campaign to add the contact to
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async addFormSubmitterToCampaign(formId, campaignId, responses, contactInfo) {
    try {
      // First, check if the contact already exists in the campaign
      const { data: existingEmail, error: checkError } = await supabase
        .from('campaign_emails')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('recipient_email', contactInfo.email)
        .single();

      if (!checkError && existingEmail) {
        console.log(`Contact ${contactInfo.email} already exists in campaign ${campaignId}`);
        return existingEmail;
      }

      // Add the contact to the campaign
      const { data: campaignEmail, error: emailError } = await supabase
        .from('campaign_emails')
        .insert({
          campaign_id: campaignId,
          recipient_email: contactInfo.email,
          recipient_name: contactInfo.name,
          status: 'SUBSCRIBED',
          form_id: formId,
          form_responses: JSON.stringify(responses),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (emailError) {
        throw new Error(`Error adding contact to campaign: ${emailError.message}`);
      }

      console.log(`Contact ${contactInfo.email} added to campaign ${campaignId}`);
      return campaignEmail;
    } catch (error) {
      console.error('Error in addFormSubmitterToCampaign:', error);
      throw error;
    }
  }

  /**
   * Process form submission and execute related campaigns
   * @param {string} formId - ID of the form being submitted
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information from form
   */
  async processFormSubmissionWithCampaigns(formId, responses, contactInfo) {
    try {
      // Get form details
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select(`
          *,
          form_integrations(*)
        `)
        .eq('id', formId)
        .single();

      if (formError) {
        throw new Error(`Error fetching form: ${formError.message}`);
      }

      // Process form integrations that relate to campaigns
      if (form.form_integrations && form.form_integrations.length > 0) {
        for (const integration of form.form_integrations) {
          if (integration.integration_type === 'EMAIL_CAMPAIGN_TRIGGER') {
            await this.handleCampaignTriggerIntegration(integration, responses, contactInfo);
          } else if (integration.integration_type === 'ADD_TO_CAMPAIGN') {
            await this.addFormSubmitterToCampaign(
              formId,
              integration.config.campaign_id,
              responses,
              contactInfo
            );
          }
        }
      }

      // Check if the form has a specific campaign trigger configuration
      const { data: campaignTriggers, error: triggerError } = await supabase
        .from('form_campaign_triggers')
        .select('*')
        .eq('form_id', formId);

      if (triggerError) {
        console.error('Error fetching campaign triggers:', triggerError);
      } else if (campaignTriggers && campaignTriggers.length > 0) {
        for (const trigger of campaignTriggers) {
          if (this.checkTriggerConditions(trigger.conditions, responses)) {
            await this.executeCampaignTrigger(trigger, responses, contactInfo);
          }
        }
      }

      return { success: true, message: 'Form processed with campaign integrations' };
    } catch (error) {
      console.error('Error in processFormSubmissionWithCampaigns:', error);
      throw error;
    }
  }

  /**
   * Handle a campaign trigger integration
   * @param {Object} integration - Integration configuration
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async handleCampaignTriggerIntegration(integration, responses, contactInfo) {
    try {
      const config = integration.config;

      // Determine if the trigger conditions are met
      if (config.conditions && Object.keys(config.conditions).length > 0) {
        let conditionsMet = true;
        
        for (const [questionId, expectedValue] of Object.entries(config.conditions)) {
          const actualValue = responses[questionId];
          if (Array.isArray(expectedValue)) {
            // For checkbox questions where multiple values are possible
            conditionsMet = expectedValue.some(val => actualValue?.includes?.(val) || actualValue === val);
          } else {
            conditionsMet = actualValue === expectedValue;
          }
          
          if (!conditionsMet) break; // Stop checking if any condition fails
        }

        if (!conditionsMet) {
          console.log('Campaign trigger conditions not met');
          return;
        }
      }

      // Send the campaign email
      if (config.campaign_id) {
        await this.sendFormTriggeredEmail(config.campaign_id, contactInfo, responses);
      } else if (config.campaign_config) {
        await this.createFormTriggeredCampaign(
          { id: 'temp_form' }, // We don't have the form object here but just need it for the function
          config.campaign_config,
          contactInfo
        );
      }
    } catch (error) {
      console.error('Error handling campaign trigger integration:', error);
      throw error;
    }
  }

  /**
   * Check if trigger conditions are met based on form responses
   * @param {Object} conditions - Trigger conditions
   * @param {Object} responses - Form responses
   * @returns {boolean} Whether conditions are met
   */
  checkTriggerConditions(conditions, responses) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true; // No conditions means always trigger
    }

    for (const [questionId, expectedValue] of Object.entries(conditions)) {
      const actualValue = responses[questionId];
      
      if (Array.isArray(expectedValue)) {
        // For checkbox questions where multiple values are possible
        const conditionMet = expectedValue.some(val => actualValue?.includes?.(val) || actualValue === val);
        if (!conditionMet) return false;
      } else {
        if (actualValue !== expectedValue) return false;
      }
    }

    return true;
  }

  /**
   * Execute a campaign trigger based on form submission
   * @param {Object} trigger - Trigger configuration
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async executeCampaignTrigger(trigger, responses, contactInfo) {
    try {
      switch (trigger.trigger_type) {
        case 'SEND_CAMPAIGN_EMAIL':
          // Send specific email from a campaign
          await this.sendFormTriggeredEmail(trigger.campaign_id, contactInfo, responses);
          break;
          
        case 'ADD_TO_CAMPAIGN':
          // Add contact to a campaign for future emails
          await this.addFormSubmitterToCampaign(trigger.form_id, trigger.campaign_id, responses, contactInfo);
          break;
          
        case 'CREATE_CONTACT_AND_CAMPAIGN':
          // Create a contact and add to a campaign or workflow
          await this.handleContactAndCampaignCreation(trigger, responses, contactInfo);
          break;
          
        default:
          console.warn(`Unknown trigger type: ${trigger.trigger_type}`);
      }
    } catch (error) {
      console.error('Error executing campaign trigger:', error);
      throw error;
    }
  }

  /**
   * Handle creating a contact and adding to campaign/workflow
   * @param {Object} trigger - Trigger configuration
   * @param {Object} responses - Form responses
   * @param {Object} contactInfo - Contact information
   */
  async handleContactAndCampaignCreation(trigger, responses, contactInfo) {
    try {
      // First create or update the contact in the contacts table
      const contactPayload = {
        email: contactInfo.email,
        name: contactInfo.name || responses.name || responses.email,
        phone: contactInfo.phone,
        source: `Form-${trigger.form_id}`,
        form_responses: responses,
        lead_score: responses.lead_score || 0,
        status: 'new',
        custom_fields: this.extractCustomFields(responses)
      };

      let contact;
      if (contactInfo.email) {
        // Try to update existing contact first
        const { data: existingContact, error: updateError } = await supabase
          .from('contacts')
          .update(contactPayload)
          .eq('email', contactInfo.email)
          .select()
          .single();

        if (!updateError && existingContact) {
          contact = existingContact;
        } else {
          // Create new contact
          const { data: newContact, error: createError } = await supabase
            .from('contacts')
            .insert(contactPayload)
            .select()
            .single();

          if (createError) {
            console.error('Error creating contact:', createError);
            throw createError;
          }
          contact = newContact;
        }
      } else {
        // Create contact without email
        const { data: newContact, error: createError } = await supabase
          .from('contacts')
          .insert(contactPayload)
          .select()
          .single();

        if (createError) {
          console.error('Error creating contact:', createError);
          throw createError;
        }
        contact = newContact;
      }

      // Now add contact to the specified campaign or workflow
      if (trigger.target_type === 'CAMPAIGN' && trigger.target_id) {
        await this.addFormSubmitterToCampaign(trigger.form_id, trigger.target_id, responses, {
          ...contactInfo,
          contact_id: contact.id
        });
      } else if (trigger.target_type === 'WORKFLOW' && trigger.target_id) {
        await this.addContactToWorkflow(contact.id, trigger.target_id, responses);
      }

      return contact;
    } catch (error) {
      console.error('Error handling contact and campaign creation:', error);
      throw error;
    }
  }

  /**
   * Add a contact to an automation workflow
   * @param {string} contactId - ID of the contact
   * @param {string} workflowId - ID of the workflow
   * @param {Object} responses - Form responses
   */
  async addContactToWorkflow(contactId, workflowId, responses) {
    try {
      // Create a workflow execution record for this contact
      const { data: execution, error: execError } = await supabase
        .from('automation_executions')
        .insert({
          workflow_id: workflowId,
          trigger_entity_id: contactId,
          trigger_entity_type: 'CONTACT',
          status: 'PENDING',
          started_at: new Date().toISOString(),
          context: {
            source: 'form_submission',
            form_responses: responses
          }
        })
        .select()
        .single();

      if (execError) {
        throw new Error(`Error creating workflow execution: ${execError.message}`);
      }

      console.log(`Contact ${contactId} added to workflow ${workflowId}`);
      return execution;
    } catch (error) {
      console.error('Error adding contact to workflow:', error);
      throw error;
    }
  }

  /**
   * Replace contact-related placeholders in email content
   * @param {string} content - Email content with placeholders
   * @param {Object} contactInfo - Contact information
   * @returns {string} Content with placeholders replaced
   */
  replaceContactPlaceholders(content, contactInfo) {
    if (!content) return content;

    // Replace common contact placeholders
    content = content.replace(/{{contact\.name}}/g, contactInfo.name || '');
    content = content.replace(/{{contact\.email}}/g, contactInfo.email || '');
    content = content.replace(/{{contact\.first_name}}/g, contactInfo.name?.split(' ')[0] || '');
    content = content.replace(/{{contact\.last_name}}/g, contactInfo.name?.split(' ').slice(1).join(' ') || '');
    content = content.replace(/{{contact\.phone}}/g, contactInfo.phone || '');

    return content;
  }

  /**
   * Extract custom fields from form responses
   * @param {Object} responses - Form responses
   * @returns {Object} Custom fields
   */
  extractCustomFields(responses) {
    const customFields = {};
    
    // Map common form responses to custom fields
    Object.entries(responses).forEach(([key, value]) => {
      // Skip common fields that are already handled elsewhere
      if (['name', 'email', 'phone', 'lead_score'].includes(key)) {
        return;
      }
      
      // Add other responses as custom fields
      customFields[key] = Array.isArray(value) ? value.join(', ') : value;
    });

    return customFields;
  }
}

export default FormCampaignIntegrationService;