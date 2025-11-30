/**
 * Invitation Template Service
 * Handles email template management for member invitations
 */

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default template variables
const DEFAULT_VARIABLES = [
  '{{invitee_name}}',
  '{{invitee_email}}',
  '{{agency_name}}',
  '{{agency_logo}}',
  '{{inviter_name}}',
  '{{inviter_email}}',
  '{{invite_link}}',
  '{{role}}',
  '{{expire_date}}'
];

class InvitationTemplateService {
  /**
   * Get all templates for an agency (including global defaults)
   */
  async getTemplates(agencyId) {
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .or(`agency_id.eq.${agencyId},agency_id.is.null`)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error getting templates:', err);
      throw err;
    }
  }

  /**
   * Get a single template
   */
  async getTemplate(templateId) {
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error getting template:', err);
      throw err;
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(agencyId, userId, templateData) {
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .insert({
          agency_id: agencyId,
          created_by: userId,
          name: templateData.name,
          subject: templateData.subject,
          body_html: templateData.body_html,
          body_text: templateData.body_text || this.stripHtml(templateData.body_html),
          variables: templateData.variables || DEFAULT_VARIABLES,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error creating template:', err);
      throw err;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId, agencyId, templateData) {
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .update({
          name: templateData.name,
          subject: templateData.subject,
          body_html: templateData.body_html,
          body_text: templateData.body_text || this.stripHtml(templateData.body_html),
          variables: templateData.variables,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('agency_id', agencyId) // Ensure agency owns this template
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error updating template:', err);
      throw err;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId, agencyId) {
    try {
      const { error } = await supabase
        .from('invitation_templates')
        .update({ is_active: false })
        .eq('id', templateId)
        .eq('agency_id', agencyId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      throw err;
    }
  }

  /**
   * Set a template as default for the agency
   */
  async setDefaultTemplate(templateId, agencyId) {
    try {
      // First, unset all other defaults for this agency
      await supabase
        .from('invitation_templates')
        .update({ is_default: false })
        .eq('agency_id', agencyId);

      // Set the new default
      const { data, error } = await supabase
        .from('invitation_templates')
        .update({ is_default: true })
        .eq('id', templateId)
        .eq('agency_id', agencyId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error setting default template:', err);
      throw err;
    }
  }

  /**
   * Get the default template for an agency
   */
  async getDefaultTemplate(agencyId) {
    try {
      // Try agency-specific default first
      let { data } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (!data) {
        // Fall back to global default
        const result = await supabase
          .from('invitation_templates')
          .select('*')
          .is('agency_id', null)
          .eq('is_default', true)
          .eq('is_active', true)
          .single();

        data = result.data;
      }

      return data;
    } catch (err) {
      console.error('Error getting default template:', err);
      // Return a hardcoded fallback
      return this.getHardcodedTemplate();
    }
  }

  /**
   * Render a template with variables
   */
  renderTemplate(template, variables) {
    let html = template.body_html;
    let text = template.body_text;
    let subject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value || '');
      text = text.replace(regex, value || '');
      subject = subject.replace(regex, value || '');
    });

    return { subject, html, text };
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(inviteData) {
    try {
      const {
        templateId,
        agencyId,
        inviteeEmail,
        inviteeName,
        agencyName,
        agencyLogo,
        inviterName,
        inviterEmail,
        inviteLink,
        role,
        expireDate
      } = inviteData;

      // Get template
      let template;
      if (templateId) {
        template = await this.getTemplate(templateId);
      } else {
        template = await this.getDefaultTemplate(agencyId);
      }

      if (!template) {
        template = this.getHardcodedTemplate();
      }

      // Render template
      const { subject, html, text } = this.renderTemplate(template, {
        invitee_name: inviteeName || inviteeEmail.split('@')[0],
        invitee_email: inviteeEmail,
        agency_name: agencyName,
        agency_logo: agencyLogo || '',
        inviter_name: inviterName,
        inviter_email: inviterEmail,
        invite_link: inviteLink,
        role: role || 'Member',
        expire_date: expireDate || '7 days'
      });

      // Send email using SendGrid or nodemailer
      const sent = await this.sendEmail({
        to: inviteeEmail,
        subject,
        html,
        text
      });

      return sent;
    } catch (err) {
      console.error('Error sending invitation email:', err);
      throw err;
    }
  }

  /**
   * Send email via configured service
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      // Check if SendGrid is configured
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = await import('@sendgrid/mail');
        sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);

        await sgMail.default.send({
          to,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@axolopcrm.com',
          subject,
          html,
          text
        });

        return true;
      }

      // Fall back to nodemailer
      if (process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@axolopcrm.com',
          to,
          subject,
          html,
          text
        });

        return true;
      }

      console.warn('No email service configured, skipping email send');
      return false;
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  }

  /**
   * Strip HTML tags to create plain text
   */
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get hardcoded fallback template
   */
  getHardcodedTemplate() {
    return {
      name: 'Default',
      subject: "You've been invited to join {{agency_name}}",
      body_html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a;">You're Invited!</h2>
          <p>Hi {{invitee_name}},</p>
          <p>{{inviter_name}} has invited you to join <strong>{{agency_name}}</strong> as a <strong>{{role}}</strong>.</p>
          <p style="margin: 30px 0;">
            <a href="{{invite_link}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This invitation link will expire in {{expire_date}}.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Powered by Axolop CRM</p>
        </div>
      `,
      body_text: `Hi {{invitee_name}},

{{inviter_name}} has invited you to join {{agency_name}} as a {{role}}.

Click here to accept: {{invite_link}}

This invitation link will expire in {{expire_date}}.

Powered by Axolop CRM`
    };
  }

  /**
   * Preview a template with sample data
   */
  previewTemplate(template) {
    const sampleData = {
      invitee_name: 'John Doe',
      invitee_email: 'john@example.com',
      agency_name: 'Acme Agency',
      agency_logo: '',
      inviter_name: 'Jane Smith',
      inviter_email: 'jane@acme.com',
      invite_link: 'https://app.axolopcrm.com/invite/abc123',
      role: 'Sales Rep',
      expire_date: '7 days'
    };

    return this.renderTemplate(template, sampleData);
  }
}

export const invitationTemplateService = new InvitationTemplateService();
export default invitationTemplateService;
