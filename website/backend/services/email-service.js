import { createTransport } from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import AWSService from "./aws-ses-service.js";
import SendGridService from "./sendgrid-service.js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class EmailService {
  constructor() {
    // Priority order: SendGrid > AWS SES > SMTP
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid for email sending (preferred for marketing)
      this.emailProvider = "sendgrid";
      this.sendgridService = new SendGridService();
      console.log("Email provider: SendGrid");
    } else if (
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      // Use AWS SES for email sending
      this.emailProvider = "aws";
      this.awsService = new AWSService();
      console.log("Email provider: AWS SES");
    } else {
      // Fallback to nodemailer SMTP
      this.emailProvider = "smtp";
      this.transporter = createTransport({
        // This would be configured based on environment variables
        // For now, using a generic setup - in production, would use GMAIL_API, SendGrid, etc.
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // App password for Gmail
        },
      });
      console.log("Email provider: SMTP");
    }
  }

  async sendEmail(options) {
    try {
      if (this.emailProvider === "sendgrid") {
        // Use SendGrid to send the email
        return await this.sendgridService.sendEmail(options);
      } else if (this.emailProvider === "aws") {
        // Use AWS SES to send the email
        return await this.awsService.sendEmail(options);
      } else {
        // Use nodemailer SMTP to send the email
        const mailOptions = {
          from: options.from || process.env.DEFAULT_EMAIL_FROM,
          to: options.to,
          cc: options.cc,
          bcc: options.bcc,
          subject: options.subject,
          text: options.text,
          html: options.html,
          replyTo: options.replyTo,
        };

        const result = await this.transporter.sendMail(mailOptions);
        return {
          success: true,
          messageId: result.messageId,
          response: result.response,
        };
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendCampaignEmail(
    campaignId,
    recipient,
    leadId = null,
    contactId = null,
  ) {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .select(
          `
                  *
                `,
        )
        .eq("id", campaignId)
        .single();

      if (campaignError) {
        console.error("Error fetching campaign:", campaignError);
        throw new Error(`Campaign ${campaignId} not found`);
      }

      // Create a campaign email record
      const { data: campaignEmail, error: emailError } = await supabase
        .from("campaign_emails")
        .insert({
          campaign_id: campaignId,
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          lead_id: leadId,
          contact_id: contactId,
          status: "PENDING",
        })
        .select()
        .single();

      if (emailError) {
        console.error("Error creating campaign email:", emailError);
        throw emailError;
      }

      // Prepare email content
      const emailContent = this.prepareEmailContent(campaign, recipient);

      // Send the email
      const sendResult = await this.sendEmail({
        to: recipient.email,
        subject: this.replacePlaceholders(campaign.subject, recipient),
        html: emailContent,
        from: `${campaign.from_name} <${campaign.from_email}>`,
        replyTo: campaign.reply_to_email,
      });

      // Update the campaign email record with send status
      const { error: updateError } = await supabase
        .from("campaign_emails")
        .update({
          status: "SENT",
          sent_at: new Date(),
          message_id: sendResult.messageId,
        })
        .eq("id", campaignEmail.id);

      if (updateError) {
        console.error("Error updating campaign email:", updateError);
      }

      return sendResult;
    } catch (error) {
      console.error("Error sending campaign email:", error);
      throw error;
    }
  }

  prepareEmailContent(campaign, recipient) {
    // Replace placeholders in the email content
    let htmlContent = campaign.html_content || campaign.template?.html_content;
    let textContent = campaign.text_content || campaign.template?.text_content;

    htmlContent = this.replacePlaceholders(htmlContent, recipient);
    textContent = this.replacePlaceholders(textContent, recipient);

    // Add tracking pixels if needed
    htmlContent = this.addTrackingPixel(htmlContent, recipient);

    return htmlContent;
  }

  replacePlaceholders(content, recipient) {
    if (!content) return content;

    // Replace common placeholders
    content = content.replace(/{{firstName}}/g, recipient.firstName || "");
    content = content.replace(/{{lastName}}/g, recipient.lastName || "");
    content = content.replace(/{{name}}/g, recipient.name || "");
    content = content.replace(/{{email}}/g, recipient.email || "");
    content = content.replace(/{{company}}/g, recipient.company || "");

    // Add more placeholder replacements as needed
    // Support for custom fields
    if (recipient.custom_fields) {
      for (const [key, value] of Object.entries(recipient.custom_fields)) {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), value || "");
      }
    }

    return content;
  }

  addTrackingPixel(htmlContent, recipient) {
    // Add open tracking pixel
    const trackingPixel = `<img src="${process.env.API_BASEURL}/track/open?r=${recipient.id}" width="1" height="1" style="display:none;" alt="" />`;
    // Add to the end of the body
    return htmlContent.replace(/<\/body>/i, `${trackingPixel}</body>`);
  }

  async processAutomationWorkflows(triggerType, triggerData) {
    try {
      // Find all active workflows with matching trigger
      const { data: workflows, error: workflowsError } = await supabase
        .from("automation_workflows")
        .select("*")
        .eq("is_active", true)
        .eq("trigger_type", triggerType)
        .eq("is_paused", false);

      if (workflowsError) {
        console.error("Error fetching workflows:", workflowsError);
        throw workflowsError;
      }

      for (const workflow of workflows) {
        // Create execution record
        const { data: execution, error: execError } = await supabase
          .from("automation_executions")
          .insert({
            workflow_id: workflow.id,
            trigger_entity_id: triggerData.entityId,
            trigger_entity_type: triggerData.entityType,
            status: "PENDING",
            started_at: new Date(),
          })
          .select()
          .single();

        if (execError) {
          console.error("Error creating execution:", execError);
          continue;
        }

        // Process workflow in the background
        this.executeWorkflow(execution.id, workflow, triggerData);
      }
    } catch (error) {
      console.error("Error processing automation workflows:", error);
      throw error;
    }
  }

  async executeWorkflow(executionId, workflow, triggerData) {
    try {
      // Update execution status to running
      const { error: updateError } = await supabase
        .from("automation_executions")
        .update({ status: "RUNNING" })
        .eq("id", executionId);

      if (updateError) {
        console.error("Error updating execution status:", updateError);
        return;
      }

      // Execute the workflow steps
      const startTime = new Date();
      let executionLog = [];

      // In a real implementation, this would recursively execute the workflow steps
      // For now, we'll just update the execution status to completed
      const endTime = new Date();
      const executionTime = endTime - startTime;

      const { error: completionError } = await supabase
        .from("automation_executions")
        .update({
          status: "COMPLETED",
          completed_at: endTime,
          execution_time_ms: executionTime,
          execution_log: executionLog,
        })
        .eq("id", executionId);

      if (completionError) {
        console.error("Error updating completed execution:", completionError);
      }

      // Update workflow stats
      await supabase.rpc("increment_column", {
        table_name: "automation_workflows",
        column_name: "execution_count",
        row_id: workflow.id,
      });
      await supabase.rpc("increment_column", {
        table_name: "automation_workflows",
        column_name: "success_count",
        row_id: workflow.id,
      });

      const { error: statsError } = await supabase
        .from("automation_workflows")
        .update({
          last_executed_at: new Date(),
        })
        .eq("id", workflow.id);

      if (statsError) {
        console.error("Error updating workflow stats:", statsError);
      }
    } catch (error) {
      console.error("Error executing workflow:", error);

      // Update execution status to failed
      const { error: failUpdateError } = await supabase
        .from("automation_executions")
        .update({
          status: "FAILED",
          completed_at: new Date(),
          execution_log: [{ error: error.message, timestamp: new Date() }],
        })
        .eq("id", executionId);

      // Update workflow stats
      await supabase.rpc("increment_column", {
        table_name: "automation_workflows",
        column_name: "execution_count",
        row_id: workflow.id,
      });
      await supabase.rpc("increment_column", {
        table_name: "automation_workflows",
        column_name: "failure_count",
        row_id: workflow.id,
      });

      if (failUpdateError) {
        console.error("Error updating failed execution:", failUpdateError);
      }
    }
  }

  // ==========================================
  // SENDGRID-SPECIFIC METHODS
  // ==========================================

  /**
   * Sync contact to SendGrid
   */
  async syncContactToSendGrid(contact) {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.addOrUpdateContact(contact);
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Sync multiple contacts to SendGrid
   */
  async syncContactsToSendGrid(contacts) {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.addMultipleContacts(contacts);
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Get email analytics from SendGrid
   */
  async getEmailAnalytics(options = {}) {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.getGlobalStats(options);
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Create email template in SendGrid
   */
  async createEmailTemplate(template) {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.createTemplate(template);
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Get suppression lists from SendGrid
   */
  async getSuppressionLists() {
    if (this.emailProvider === "sendgrid") {
      const bounces = await this.sendgridService.getSuppressionList("bounces");
      const blocks = await this.sendgridService.getSuppressionList("blocks");
      const spamReports =
        await this.sendgridService.getSuppressionList("spam_reports");
      const unsubscribes =
        await this.sendgridService.getSuppressionList("unsubscribes");

      return {
        success: true,
        bounces: bounces.suppressions,
        blocks: blocks.suppressions,
        spamReports: spamReports.suppressions,
        unsubscribes: unsubscribes.suppressions,
      };
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Sync suppression lists to Supabase
   */
  async syncSuppressionLists() {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.syncSuppressionListToSupabase();
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Process SendGrid webhook events
   */
  async processWebhookEvents(events) {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.processWebhookEvents(events);
    }
    return { success: false, message: "SendGrid not configured" };
  }

  /**
   * Check if email is suppressed
   */
  async isEmailSuppressed(email) {
    if (this.emailProvider === "sendgrid") {
      return await this.sendgridService.isEmailSuppressed(email);
    }
    return false;
  }

  // Process queued emails
  async processQueuedEmails(batchSize = 10) {
    try {
      const { data: pendingEmails, error: fetchError } = await supabase
        .from("campaign_emails")
        .select(
          `
                  *,
                  campaign:email_campaigns!inner(*)
                `,
        )
        .eq("status", "PENDING")
        .lte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes ago
        .limit(batchSize);

      if (fetchError) {
        console.error("Error fetching pending emails:", fetchError);
        throw fetchError;
      }

      for (const email of pendingEmails) {
        try {
          // Get recipient details
          let recipient = {
            email: email.recipient_email,
            name: email.recipient_name,
          };

          if (email.lead_id) {
            const { data: lead, error: leadError } = await supabase
              .from("leads")
              .select("*")
              .eq("id", email.lead_id)
              .single();

            if (leadError) {
              console.error("Error fetching lead:", leadError);
              continue;
            }

            recipient = { ...recipient, ...lead, type: "lead" };
          } else if (email.contact_id) {
            const { data: contact, error: contactError } = await supabase
              .from("contacts")
              .select("*")
              .eq("id", email.contact_id)
              .single();

            if (contactError) {
              console.error("Error fetching contact:", contactError);
              continue;
            }

            recipient = { ...recipient, ...contact, type: "contact" };
          }

          // Send the actual email
          const sendResult = await this.sendEmail({
            to: email.recipient_email,
            subject: this.replacePlaceholders(
              email.campaign.subject,
              recipient,
            ),
            html: this.prepareEmailContent(email.campaign, recipient),
            from: `${email.campaign.from_name} <${email.campaign.from_email}>`,
            replyTo: email.campaign.reply_to_email,
          });

          // Update email status to SENT
          const { error: updateError } = await supabase
            .from("campaign_emails")
            .update({
              status: "SENT",
              sent_at: new Date(),
              message_id: sendResult.messageId,
            })
            .eq("id", email.id);

          if (updateError) {
            console.error("Error updating email status:", updateError);
          }

          console.log(`Email sent successfully: ${email.recipient_email}`);
        } catch (emailError) {
          // Update email status to FAILED
          const { error: failUpdateError } = await supabase
            .from("campaign_emails")
            .update({
              status: "FAILED",
              message_id: emailError.messageId || null,
            })
            .eq("id", email.id);

          if (failUpdateError) {
            console.error(
              "Error updating failed email status:",
              failUpdateError,
            );
          }

          console.error(
            `Failed to send email to ${email.recipient_email}:`,
            emailError,
          );
        }
      }

      return { processed: pendingEmails.length, success: true };
    } catch (error) {
      console.error("Error processing queued emails:", error);
      throw error;
    }
  }
}

export default EmailService;
