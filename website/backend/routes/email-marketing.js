import express from 'express';
import { createClient } from '@supabase/supabase-js';
import EmailService from '../services/email-service.js';
import SendGridAnalyticsSync from '../services/sendgrid-analytics-sync.js';
import { extractAgencyContext } from '../middleware/agency-access.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication and agency context extraction to all routes
router.use(protect);
router.use(extractAgencyContext);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize services
const emailService = new EmailService();
const analyticsSync = new SendGridAnalyticsSync();

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

/**
 * @route GET /api/email-marketing/dashboard
 * @desc Get email marketing dashboard stats
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get campaigns count
    let totalCampaigns = 0;
    let emailsSent = 0;
    let avgOpenRate = 0;
    let recentCampaigns = [];

    try {
      const { data: campaigns, count } = await supabase
        .from('email_campaigns')
        .select('id, name, subject, status, total_sent, open_rate, created_at', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (campaigns) {
        totalCampaigns = count || campaigns.length;
        recentCampaigns = campaigns;

        // Calculate totals from campaigns
        campaigns.forEach(c => {
          emailsSent += c.total_sent || 0;
        });

        // Calculate average open rate
        const campaignsWithRate = campaigns.filter(c => c.open_rate && c.open_rate > 0);
        if (campaignsWithRate.length > 0) {
          avgOpenRate = (campaignsWithRate.reduce((sum, c) => sum + (c.open_rate || 0), 0) / campaignsWithRate.length).toFixed(1);
        }
      }
    } catch (e) {
      console.log('Email campaigns table may not exist yet:', e.message);
    }

    // Get active workflows count
    let activeWorkflows = 0;
    try {
      const { count } = await supabase
        .from('workflows')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

      activeWorkflows = count || 0;
    } catch (e) {
      console.log('Workflows table query failed:', e.message);
    }

    res.json({
      success: true,
      metrics: {
        totalCampaigns,
        activeWorkflows,
        emailsSent,
        avgOpenRate: parseFloat(avgOpenRate) || 0
      },
      topCampaigns: recentCampaigns.slice(0, 5),
      recentCampaigns
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/email-marketing/analytics
 * @desc Get detailed email analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { days = 30, startDate, endDate } = req.query;

    // Try to get analytics, but gracefully handle missing tables
    let analytics = {
      success: true,
      totals: {
        requests: 0,
        delivered: 0,
        opens: 0,
        uniqueOpens: 0,
        clicks: 0,
        uniqueClicks: 0,
        bounces: 0,
        spamReports: 0,
        unsubscribes: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0
      },
      dailyStats: []
    };

    try {
      analytics = await analyticsSync.getCachedAnalytics({
        days: parseInt(days),
        startDate,
        endDate
      });
    } catch (e) {
      console.log('Analytics cache not available:', e.message);
    }

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/email-marketing/analytics/performance
 * @desc Get performance summary
 */
router.get('/analytics/performance', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Default performance data
    let performance = {
      success: true,
      totalEmails: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
      bounces: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0
    };

    try {
      performance = await analyticsSync.getPerformanceSummary(parseInt(days));
    } catch (e) {
      console.log('Performance summary not available:', e.message);
    }

    res.json(performance);

  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// CAMPAIGNS
// ==========================================

/**
 * @route GET /api/email-marketing/campaigns
 * @desc Get all campaigns with stats
 */
router.get('/campaigns', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status, type, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Try email_campaigns table first, then fall back to campaign_performance
    let campaigns = [];
    let count = 0;

    try {
      let query = supabase
        .from('email_campaigns')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const result = await query
        .range(offset, offset + parseInt(limit) - 1)
        .order('created_at', { ascending: false });

      if (result.data) {
        campaigns = result.data;
        count = result.count || 0;
      }
    } catch (e) {
      console.log('Email campaigns table query failed:', e.message);
    }

    res.json({
      success: true,
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/email-marketing/campaigns
 * @desc Create a new email campaign
 */
router.post('/campaigns', async (req, res) => {
  try {
    const {
      name,
      subject,
      previewText,
      htmlContent,
      textContent,
      fromName,
      fromEmail,
      replyToEmail,
      type = 'ONE_TIME',
      targetSegment
    } = req.body;

    // Create campaign in database
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        name,
        subject,
        preview_text: previewText,
        html_content: htmlContent,
        text_content: textContent,
        from_name: fromName || process.env.SENDGRID_FROM_NAME,
        from_email: fromEmail || process.env.SENDGRID_FROM_EMAIL,
        reply_to_email: replyToEmail || fromEmail,
        type,
        target_segment: targetSegment,
        status: 'DRAFT'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/email-marketing/campaigns/:id
 * @desc Get campaign details with stats
 */
router.get('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: campaign, error } = await supabase
      .from('campaign_performance')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route PUT /api/email-marketing/campaigns/:id
 * @desc Update campaign
 */
router.put('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      subject,
      previewText,
      htmlContent,
      textContent,
      fromName,
      fromEmail,
      replyToEmail,
      status
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (previewText !== undefined) updateData.preview_text = previewText;
    if (htmlContent !== undefined) updateData.html_content = htmlContent;
    if (textContent !== undefined) updateData.text_content = textContent;
    if (fromName !== undefined) updateData.from_name = fromName;
    if (fromEmail !== undefined) updateData.from_email = fromEmail;
    if (replyToEmail !== undefined) updateData.reply_to_email = replyToEmail;
    if (status !== undefined) updateData.status = status;

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      campaign
    });

  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route DELETE /api/email-marketing/campaigns/:id
 * @desc Delete campaign
 */
router.delete('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/email-marketing/campaigns/:id/recipients
 * @desc Add recipients to campaign
 */
router.post('/campaigns/:id/recipients', async (req, res) => {
  try {
    const { id } = req.params;
    const { recipients } = req.body; // Array of { email, name, customFields }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'Recipients array is required' });
    }

    // Add recipients to campaign_emails table
    const campaignEmails = recipients.map(recipient => ({
      campaign_id: id,
      recipient_email: recipient.email,
      recipient_name: recipient.name || '',
      status: 'PENDING',
      custom_fields: recipient.customFields || {}
    }));

    const { data, error } = await supabase
      .from('campaign_emails')
      .insert(campaignEmails)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: `Added ${data.length} recipients to campaign`,
      recipients: data
    });

  } catch (error) {
    console.error('Add recipients error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/email-marketing/campaigns/:id/send
 * @desc Send campaign to all recipients
 */
router.post('/campaigns/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleFor } = req.body;

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campaignError) throw campaignError;

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (scheduleFor) {
      // Schedule campaign
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          scheduled_at: new Date(scheduleFor),
          status: 'SCHEDULED'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      return res.json({
        success: true,
        message: 'Campaign scheduled successfully',
        scheduledAt: scheduleFor
      });
    }

    // Send immediately
    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'SENDING',
        sent_at: new Date()
      })
      .eq('id', id);

    // Get recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('campaign_emails')
      .select('*')
      .eq('campaign_id', id)
      .eq('status', 'PENDING');

    if (recipientsError) throw recipientsError;

    // Send emails asynchronously
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        await emailService.sendCampaignEmail(
          id,
          {
            email: recipient.recipient_email,
            name: recipient.recipient_name,
            ...recipient.custom_fields
          },
          recipient.lead_id,
          recipient.contact_id
        );
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${recipient.recipient_email}:`, error);
        failedCount++;

        // Mark as failed
        await supabase
          .from('campaign_emails')
          .update({ status: 'FAILED' })
          .eq('id', recipient.id);
      }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'SENT',
        total_sent: sentCount
      })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Campaign sent successfully',
      sentCount,
      failedCount
    });

  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/email-marketing/campaigns/:id/test
 * @desc Send test email
 */
router.post('/campaigns/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { testEmails } = req.body;

    if (!Array.isArray(testEmails) || testEmails.length === 0) {
      return res.status(400).json({ success: false, error: 'testEmails array is required' });
    }

    // Get campaign
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Send test emails
    for (const email of testEmails) {
      await emailService.sendEmail({
        to: email,
        subject: `[TEST] ${campaign.subject}`,
        html: campaign.html_content,
        text: campaign.text_content,
        from: campaign.from_email,
        fromName: campaign.from_name,
        replyTo: campaign.reply_to_email,
        categories: ['test', 'campaign'],
        customArgs: {
          campaignId: id,
          isTest: 'true'
        }
      });
    }

    res.json({
      success: true,
      message: `Test emails sent to ${testEmails.length} recipients`
    });

  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/email-marketing/campaigns/:id/stats
 * @desc Get campaign statistics
 */
router.get('/campaigns/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const analytics = await analyticsSync.getCampaignAnalytics(id);

    res.json({
      success: true,
      ...analytics
    });

  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// TEMPLATES
// ==========================================

/**
 * @route GET /api/email-marketing/templates
 * @desc Get all email templates
 */
router.get('/templates', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let templates = [];
    let count = 0;

    try {
      let query = supabase
        .from('email_templates')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const result = await query
        .range(offset, offset + parseInt(limit) - 1)
        .order('created_at', { ascending: false });

      if (result.data) {
        templates = result.data;
        count = result.count || 0;
      }
    } catch (e) {
      console.log('Email templates table query failed:', e.message);
    }

    res.json({
      success: true,
      templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/email-marketing/templates
 * @desc Create email template
 */
router.post('/templates', async (req, res) => {
  try {
    const {
      name,
      subject,
      htmlContent,
      textContent,
      category,
      description
    } = req.body;

    // Create template in Supabase
    const { data: template, error: dbError } = await supabase
      .from('email_templates')
      .insert({
        name,
        subject,
        html_content: htmlContent,
        text_content: textContent,
        category,
        description
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Create template in SendGrid
    const sendgridResult = await emailService.createEmailTemplate({
      name,
      subject,
      htmlContent,
      textContent
    });

    // Update template with SendGrid template ID
    if (sendgridResult.success) {
      await supabase
        .from('sendgrid_template_sync')
        .insert({
          template_id: template.id,
          sendgrid_template_id: sendgridResult.templateId,
          sync_status: 'synced',
          last_synced_at: new Date()
        });
    }

    res.status(201).json({
      success: true,
      template,
      sendgridTemplateId: sendgridResult.templateId
    });

  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/email-marketing/templates/:id
 * @desc Get template by ID
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: template, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({
      success: true,
      template
    });

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route PUT /api/email-marketing/templates/:id
 * @desc Update template
 */
router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      subject,
      htmlContent,
      textContent,
      category,
      description
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (htmlContent !== undefined) updateData.html_content = htmlContent;
    if (textContent !== undefined) updateData.text_content = textContent;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;

    const { data: template, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      template
    });

  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route DELETE /api/email-marketing/templates/:id
 * @desc Delete template
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// WORKFLOWS
// ==========================================

/**
 * @route GET /api/email-marketing/workflows
 * @desc Get all automation workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('automation_workflows')
      .select('*', { count: 'exact' });

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: workflows, error, count } = await query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      workflows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/email-marketing/workflows
 * @desc Create automation workflow
 */
router.post('/workflows', async (req, res) => {
  try {
    const {
      name,
      description,
      nodes,
      edges,
      isActive
    } = req.body;

    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .insert({
        name,
        description,
        flow_data: { nodes, edges },
        is_active: isActive || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/email-marketing/workflows/:id
 * @desc Get workflow by ID
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    res.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route PUT /api/email-marketing/workflows/:id
 * @desc Update workflow
 */
router.put('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      nodes,
      edges,
      isActive
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (nodes !== undefined || edges !== undefined) {
      updateData.flow_data = { nodes, edges };
    }
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: workflow, error } = await supabase
      .from('automation_workflows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      workflow
    });

  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route DELETE /api/email-marketing/workflows/:id
 * @desc Delete workflow
 */
router.delete('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('automation_workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route PUT /api/email-marketing/workflows/:id/toggle
 * @desc Toggle workflow active status
 */
router.put('/workflows/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: workflow, error: getError } = await supabase
      .from('automation_workflows')
      .select('is_active')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Toggle status
    const { data: updated, error: updateError } = await supabase
      .from('automation_workflows')
      .update({ is_active: !workflow.is_active })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      workflow: updated
    });

  } catch (error) {
    console.error('Toggle workflow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// CONTACTS SYNC
// ==========================================

/**
 * @route POST /api/email-marketing/contacts/sync
 * @desc Sync contacts from Supabase to SendGrid
 */
router.post('/contacts/sync', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    // Get contacts that haven't been synced or need update
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .limit(parseInt(limit));

    if (error) throw error;

    // Sync to SendGrid
    const result = await emailService.syncContactsToSendGrid(contacts);

    res.json({
      success: true,
      message: `Synced ${contacts.length} contacts to SendGrid`,
      ...result
    });

  } catch (error) {
    console.error('Sync contacts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
