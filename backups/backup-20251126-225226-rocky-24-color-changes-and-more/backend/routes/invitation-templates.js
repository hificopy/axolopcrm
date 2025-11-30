/**
 * Invitation Templates Routes
 * API endpoints for managing email invitation templates
 */

import express from 'express';
import { invitationTemplateService } from '../services/invitation-template-service.js';
import { authenticateUser as authenticate } from '../middleware/auth.js';
import { requireAgencyAccess, requireAgencyAdmin } from '../middleware/agency-access.js';

const router = express.Router();

/**
 * GET /api/v1/invitation-templates
 * Get all templates for current agency
 */
router.get('/',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const templates = await invitationTemplateService.getTemplates(agencyId);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates'
      });
    }
  }
);

/**
 * GET /api/v1/invitation-templates/default
 * Get the default template for current agency
 */
router.get('/default',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const template = await invitationTemplateService.getDefaultTemplate(agencyId);

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error fetching default template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch default template'
      });
    }
  }
);

/**
 * GET /api/v1/invitation-templates/:id
 * Get a specific template
 */
router.get('/:id',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const template = await invitationTemplateService.getTemplate(req.params.id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template'
      });
    }
  }
);

/**
 * POST /api/v1/invitation-templates
 * Create a new template
 */
router.post('/',
  authenticate,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const { name, subject, body_html, body_text, variables } = req.body;

      if (!name || !subject || !body_html) {
        return res.status(400).json({
          success: false,
          error: 'Name, subject, and body_html are required'
        });
      }

      const template = await invitationTemplateService.createTemplate(
        agencyId,
        req.user.id,
        { name, subject, body_html, body_text, variables }
      );

      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create template'
      });
    }
  }
);

/**
 * PUT /api/v1/invitation-templates/:id
 * Update a template
 */
router.put('/:id',
  authenticate,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const { name, subject, body_html, body_text, variables } = req.body;

      const template = await invitationTemplateService.updateTemplate(
        req.params.id,
        agencyId,
        { name, subject, body_html, body_text, variables }
      );

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found or access denied'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update template'
      });
    }
  }
);

/**
 * DELETE /api/v1/invitation-templates/:id
 * Delete a template
 */
router.delete('/:id',
  authenticate,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      await invitationTemplateService.deleteTemplate(req.params.id, agencyId);

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete template'
      });
    }
  }
);

/**
 * POST /api/v1/invitation-templates/:id/set-default
 * Set a template as the default
 */
router.post('/:id/set-default',
  authenticate,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const template = await invitationTemplateService.setDefaultTemplate(
        req.params.id,
        agencyId
      );

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error setting default template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set default template'
      });
    }
  }
);

/**
 * POST /api/v1/invitation-templates/preview
 * Preview a template with sample data
 */
router.post('/preview',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const { subject, body_html, body_text } = req.body;

      const preview = invitationTemplateService.previewTemplate({
        subject,
        body_html,
        body_text: body_text || ''
      });

      res.json({
        success: true,
        data: preview
      });
    } catch (error) {
      console.error('Error previewing template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to preview template'
      });
    }
  }
);

/**
 * POST /api/v1/invitation-templates/send-test
 * Send a test email with a template
 */
router.post('/send-test',
  authenticate,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { template_id, test_email } = req.body;
      const agencyId = req.agencyId || req.headers['x-agency-id'];

      if (!test_email) {
        return res.status(400).json({
          success: false,
          error: 'Test email address is required'
        });
      }

      // Get agency info
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: agency } = await supabase
        .from('agencies')
        .select('name, logo_url')
        .eq('id', agencyId)
        .single();

      await invitationTemplateService.sendInvitationEmail({
        templateId: template_id,
        agencyId,
        inviteeEmail: test_email,
        inviteeName: 'Test User',
        agencyName: agency?.name || 'Test Agency',
        agencyLogo: agency?.logo_url,
        inviterName: req.user.email?.split('@')[0] || 'Admin',
        inviterEmail: req.user.email,
        inviteLink: 'https://app.axolopcrm.com/invite/test-link',
        role: 'Member',
        expireDate: '7 days'
      });

      res.json({
        success: true,
        message: `Test email sent to ${test_email}`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      });
    }
  }
);

export default router;
