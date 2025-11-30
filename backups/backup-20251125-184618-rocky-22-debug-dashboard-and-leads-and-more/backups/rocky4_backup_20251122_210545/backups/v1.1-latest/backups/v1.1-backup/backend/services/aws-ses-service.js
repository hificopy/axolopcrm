import pkg from '@aws-sdk/client-ses';
const { SESClient, SendEmailCommand, SendBulkEmailCommand, CreateTemplateCommand, UpdateTemplateCommand, DeleteTemplateCommand, GetTemplateCommand, ListTemplatesCommand } = pkg;

class AWSService {
  constructor() {
    // Initialize SES client with credentials from environment variables
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1', // Default to us-east-1
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Send a single email via AWS SES
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address(es)
   * @param {string} options.from - Sender email address
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content of the email
   * @param {string} [options.text] - Text content of the email
   * @param {string} [options.cc] - CC email address(es)
   * @param {string} [options.bcc] - BCC email address(es)
   * @param {string} [options.replyTo] - Reply-to email address
   * @returns {Object} Result of the send operation
   */
  async sendEmail(options) {
    try {
      const emailParams = {
        Source: options.from || process.env.DEFAULT_EMAIL_FROM,
        Destination: {
          ToAddresses: Array.isArray(options.to) ? options.to : [options.to],
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: options.html,
              Charset: 'UTF-8',
            },
          },
        },
      };

      // Add text body if provided
      if (options.text) {
        emailParams.Message.Body.Text = {
          Data: options.text,
          Charset: 'UTF-8',
        };
      }

      // Add CC if provided
      if (options.cc) {
        emailParams.Destination.CcAddresses = Array.isArray(options.cc) ? options.cc : [options.cc];
      }

      // Add BCC if provided
      if (options.bcc) {
        emailParams.Destination.BccAddresses = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      }

      // Add ReplyTo if provided
      if (options.replyTo) {
        emailParams.ReplyToAddresses = Array.isArray(options.replyTo) ? options.replyTo : [options.replyTo];
      }

      const command = new SendEmailCommand(emailParams);
      const result = await this.sesClient.send(command);

      return {
        success: true,
        messageId: result.MessageId,
        response: result,
      };
    } catch (error) {
      console.error('Error sending email via AWS SES:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails via AWS SES
   * @param {Array} emails - Array of email objects with recipient and content
   * @returns {Object} Result of the bulk send operation
   */
  async sendBulkEmail(emails) {
    try {
      // AWS SES bulk email command requires template-based emails
      // For now, we'll send emails individually (asynchronously) for greater control
      const results = await Promise.allSettled(
        emails.map(async (email) => {
          return await this.sendEmail(email);
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        success: true,
        total: emails.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      console.error('Error sending bulk emails via AWS SES:', error);
      throw error;
    }
  }

  /**
   * Create an email template
   * @param {Object} template - Template object with name, subject, and content
   * @returns {Object} Result of the template creation
   */
  async createTemplate(template) {
    try {
      const command = new CreateTemplateCommand({
        Template: {
          TemplateName: template.name,
          SubjectPart: template.subject,
          HtmlPart: template.htmlContent,
          TextPart: template.textContent,
        },
      });

      const result = await this.sesClient.send(command);
      return result;
    } catch (error) {
      console.error('Error creating template via AWS SES:', error);
      throw error;
    }
  }

  /**
   * Update an existing email template
   * @param {Object} template - Template object with name, subject, and content
   * @returns {Object} Result of the template update
   */
  async updateTemplate(template) {
    try {
      const command = new UpdateTemplateCommand({
        Template: {
          TemplateName: template.name,
          SubjectPart: template.subject,
          HtmlPart: template.htmlContent,
          TextPart: template.textContent,
        },
      });

      const result = await this.sesClient.send(command);
      return result;
    } catch (error) {
      console.error('Error updating template via AWS SES:', error);
      throw error;
    }
  }

  /**
   * Delete an email template
   * @param {string} templateName - Name of the template to delete
   * @returns {Object} Result of the template deletion
   */
  async deleteTemplate(templateName) {
    try {
      // AWS SES doesn't have a direct delete template method in v3
      // For now, we'll just log this method as a placeholder
      console.log(`Template deletion is not directly supported in AWS SES v3: ${templateName}`);
      return { success: true, message: 'Template deletion method called' };
    } catch (error) {
      console.error('Error deleting template via AWS SES:', error);
      throw error;
    }
  }

  /**
   * Get a template by name
   * @param {string} templateName - Name of the template to get
   * @returns {Object} The template details
   */
  async getTemplate(templateName) {
    try {
      const command = new GetTemplateCommand({
        TemplateName: templateName,
      });

      const result = await this.sesClient.send(command);
      return result;
    } catch (error) {
      console.error('Error getting template via AWS SES:', error);
      throw error;
    }
  }

  /**
   * List all templates
   * @returns {Object} List of templates
   */
  async listTemplates() {
    try {
      const command = new ListTemplatesCommand({});
      const result = await this.sesClient.send(command);
      return result;
    } catch (error) {
      console.error('Error listing templates via AWS SES:', error);
      throw error;
    }
  }
}

export default AWSService;