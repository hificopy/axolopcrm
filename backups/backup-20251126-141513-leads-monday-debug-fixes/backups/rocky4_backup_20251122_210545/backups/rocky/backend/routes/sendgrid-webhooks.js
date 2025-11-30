import express from 'express';
import EmailService from '../services/email-service.js';

const router = express.Router();
const emailService = new EmailService();

/**
 * SendGrid Webhook Routes
 *
 * These routes handle webhook events from SendGrid for:
 * - Email delivered
 * - Email opened
 * - Email clicked
 * - Email bounced
 * - Email dropped
 * - Spam reports
 * - Unsubscribes
 *
 * Configure in SendGrid:
 * Settings > Mail Settings > Event Webhook
 * POST URL: https://yourdomain.com/api/sendgrid/webhook
 */

/**
 * @route POST /api/sendgrid/webhook
 * @desc Process SendGrid webhook events
 * @access Public (SendGrid only)
 */
router.post('/webhook', async (req, res) => {
  try {
    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload'
      });
    }

    // Log incoming events for debugging
    console.log(`Received ${events.length} SendGrid webhook events`);

    // Process events asynchronously (don't block SendGrid response)
    emailService.processWebhookEvents(events).catch(error => {
      console.error('Error processing webhook events:', error);
    });

    // Respond immediately to SendGrid
    res.status(200).json({
      success: true,
      message: `Received ${events.length} events`
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/sendgrid/stats
 * @desc Get SendGrid email statistics
 * @access Private
 */
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate, aggregatedBy } = req.query;

    const stats = await emailService.getEmailAnalytics({
      startDate,
      endDate,
      aggregatedBy
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/sendgrid/suppressions
 * @desc Get suppression lists (bounces, unsubscribes, etc.)
 * @access Private
 */
router.get('/suppressions', async (req, res) => {
  try {
    const suppressions = await emailService.getSuppressionLists();
    res.json(suppressions);
  } catch (error) {
    console.error('Get suppressions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/sendgrid/suppressions/sync
 * @desc Sync suppression lists to Supabase
 * @access Private
 */
router.post('/suppressions/sync', async (req, res) => {
  try {
    const result = await emailService.syncSuppressionLists();
    res.json(result);
  } catch (error) {
    console.error('Sync suppressions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/sendgrid/contacts/sync
 * @desc Sync contact to SendGrid
 * @access Private
 */
router.post('/contacts/sync', async (req, res) => {
  try {
    const { contact } = req.body;

    if (!contact || !contact.email) {
      return res.status(400).json({
        success: false,
        error: 'Contact email is required'
      });
    }

    const result = await emailService.syncContactToSendGrid(contact);
    res.json(result);
  } catch (error) {
    console.error('Sync contact error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/sendgrid/contacts/bulk-sync
 * @desc Sync multiple contacts to SendGrid
 * @access Private
 */
router.post('/contacts/bulk-sync', async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contacts array is required'
      });
    }

    const result = await emailService.syncContactsToSendGrid(contacts);
    res.json(result);
  } catch (error) {
    console.error('Bulk sync contacts error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/sendgrid/templates
 * @desc Create email template in SendGrid
 * @access Private
 */
router.post('/templates', async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent } = req.body;

    if (!name || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Template name, subject, and htmlContent are required'
      });
    }

    const result = await emailService.createEmailTemplate({
      name,
      subject,
      htmlContent,
      textContent
    });

    res.json(result);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/sendgrid/health
 * @desc Check SendGrid integration health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const isConfigured = !!process.env.SENDGRID_API_KEY;

    res.json({
      success: true,
      provider: 'sendgrid',
      configured: isConfigured,
      apiKeyPresent: isConfigured,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not-configured',
      fromName: process.env.SENDGRID_FROM_NAME || 'not-configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
