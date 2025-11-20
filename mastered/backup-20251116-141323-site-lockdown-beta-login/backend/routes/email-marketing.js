import express from 'express';
const router = express.Router();
import { supabaseServer } from '../config/supabase-auth.js';
import EmailCampaignService from '../services/email-campaign-service.js';
const emailCampaignService = new EmailCampaignService();
import { authenticateUser } from '../middleware/auth.js';
import { 
  emailTemplateDb, 
  emailCampaignDb, 
  workflowDb 
} from '../utils/db-helpers.js';

// Email Templates API
router.get('/templates', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = category;

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.emailTemplate.count({ where })
    ]);

    res.json({
      templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/templates', authenticateUser, async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent, previewText, description, category, tags, variables } = req.body;
    const userId = req.user?.id; // Assuming user authentication middleware is in place

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        htmlContent,
        textContent,
        previewText,
        description,
        category,
        tags: tags || [],
        variables,
        createdById: userId
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/templates/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, htmlContent, textContent, previewText, description, category, tags, variables, isActive } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name,
        subject,
        htmlContent,
        textContent,
        previewText,
        description,
        category,
        tags: tags || [],
        variables,
        isActive
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/templates/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.emailTemplate.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email Campaigns API
router.get('/campaigns', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (type) where.type = type;

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          emails: {
            select: {
              status: true,
              sentAt: true,
              openedAt: true,
              clickedAt: true
            }
          }
        }
      }),
      prisma.emailCampaign.count({ where })
    ]);

    // Add calculated stats
    const campaignsWithStats = campaigns.map(campaign => {
      const stats = {
        sent: campaign.emails.filter(email => email.status !== 'PENDING' && email.status !== 'FAILED').length,
        opened: campaign.emails.filter(email => email.openedAt).length,
        clicked: campaign.emails.filter(email => email.clickedAt).length,
        openRate: campaign.totalSent > 0 ? (campaign.totalOpened / campaign.totalSent) * 100 : 0,
        clickRate: campaign.totalSent > 0 ? (campaign.totalClicked / campaign.totalSent) * 100 : 0
      };
      
      return {
        ...campaign,
        stats
      };
    });

    res.json({
      campaigns: campaignsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/campaigns', authenticateUser, async (req, res) => {
  try {
    const { 
      name, 
      subject, 
      previewText, 
      htmlContent, 
      textContent, 
      type, 
      fromName, 
      fromEmail, 
      replyToEmail, 
      targetSegment, 
      testRecipients,
      scheduledAt 
    } = req.body;
    const userId = req.user?.id;

    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        previewText,
        htmlContent,
        textContent,
        type,
        fromName,
        fromEmail,
        replyToEmail,
        targetSegment,
        testRecipients: testRecipients || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: userId
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        emails: true,
        sequences: true
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Calculate stats
    const stats = {
      sent: campaign.emails.filter(email => email.status !== 'PENDING' && email.status !== 'FAILED').length,
      opened: campaign.emails.filter(email => email.openedAt).length,
      clicked: campaign.emails.filter(email => email.clickedAt).length,
      openRate: campaign.totalSent > 0 ? (campaign.totalOpened / campaign.totalSent) * 100 : 0,
      clickRate: campaign.totalSent > 0 ? (campaign.totalClicked / campaign.totalSent) * 100 : 0
    };

    res.json({
      ...campaign,
      stats
    });
  } catch (error) {
    console.error('Error fetching email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      subject, 
      previewText, 
      htmlContent, 
      textContent, 
      status, 
      fromName, 
      fromEmail, 
      replyToEmail, 
      targetSegment, 
      testRecipients,
      scheduledAt 
    } = req.body;

    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        name,
        subject,
        previewText,
        htmlContent,
        textContent,
        status,
        fromName,
        fromEmail,
        replyToEmail,
        targetSegment,
        testRecipients: testRecipients || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      }
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.emailCampaign.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting email campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send campaign
router.post('/campaigns/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduleFor } = req.body;

    if (scheduleFor) {
      // Schedule the campaign
      const scheduledCampaign = await emailCampaignService.scheduleCampaign(id, scheduleFor);
      res.json(scheduledCampaign);
    } else {
      // Send the campaign immediately
      const result = await emailCampaignService.sendCampaign(id);
      res.json(result);
    }
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Send test email for campaign
router.post('/campaigns/:id/send-test', async (req, res) => {
  try {
    const { id } = req.params;
    const { testEmails } = req.body;

    // In a real implementation, you would send actual test emails here
    // For now, we'll just return a success response
    console.log(`Sending test emails for campaign ${id} to:`, testEmails);

    res.json({ message: 'Test emails sent successfully' });
  } catch (error) {
    console.error('Error sending test emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get campaign statistics
router.get('/campaigns/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await emailCampaignService.getCampaignStats(id);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update campaign statistics
router.post('/campaigns/:id/stats/update', async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await emailCampaignService.updateCampaignStats(id);
    
    res.json(stats);
  } catch (error) {
    console.error('Error updating campaign stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Automation Workflows API
router.get('/workflows', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [workflows, total] = await Promise.all([
      prisma.automationWorkflow.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          steps: {
            orderBy: { position: 'asc' }
          }
        }
      }),
      prisma.automationWorkflow.count({ where })
    ]);

    res.json({
      workflows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching automation workflows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/workflows', async (req, res) => {
  try {
    const { name, description, triggerType, triggerConfig, flowData } = req.body;
    const userId = req.user?.id;

    const workflow = await prisma.automationWorkflow.create({
      data: {
        name,
        description,
        triggerType,
        triggerConfig,
        flowData,
        createdById: userId
      }
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating automation workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.automationWorkflow.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        steps: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    console.error('Error fetching automation workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, triggerType, triggerConfig, flowData, isActive, isPaused } = req.body;

    const workflow = await prisma.automationWorkflow.update({
      where: { id },
      data: {
        name,
        description,
        triggerType,
        triggerConfig,
        flowData,
        isActive,
        isPaused
      }
    });

    res.json(workflow);
  } catch (error) {
    console.error('Error updating automation workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.automationWorkflow.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting automation workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle workflow active status
router.post('/workflows/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.automationWorkflow.findUnique({
      where: { id }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const updatedWorkflow = await prisma.automationWorkflow.update({
      where: { id },
      data: {
        isActive: !workflow.isActive
      }
    });

    res.json(updatedWorkflow);
  } catch (error) {
    console.error('Error toggling workflow status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workflow execution history
router.get('/workflows/:id/executions', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = { workflowId: id };
    if (status) where.status = status;

    const [executions, total] = await Promise.all([
      prisma.automationExecution.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.automationExecution.count({ where })
    ]);

    res.json({
      executions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger workflow manually
router.post('/workflows/:id/trigger', async (req, res) => {
  try {
    const { id } = req.params;
    const { triggerEntityId, triggerEntityType } = req.body;

    // Create execution record
    const execution = await prisma.automationExecution.create({
      data: {
        workflowId: id,
        triggerEntityId,
        triggerEntityType,
        status: 'PENDING',
        startedAt: new Date()
      }
    });

    // In a real implementation, you would queue the execution here
    // For now, we'll just return the execution record

    res.status(201).json(execution);
  } catch (error) {
    console.error('Error triggering workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Segmentation endpoints
router.get('/segments', authenticateUser, async (req, res) => {
  try {
    // Get all saved segments
    const segments = await prisma.segment.findMany({
      where: {
        createdById: req.user?.id // Assuming user authentication
      }
    });
    
    res.json(segments);
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/segments', async (req, res) => {
  try {
    const { name, description, criteria } = req.body;
    const userId = req.user?.id;
    
    const segment = await prisma.segment.create({
      data: {
        name,
        description,
        criteria,
        createdById: userId
      }
    });
    
    res.status(201).json(segment);
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// A/B Testing endpoints
router.post('/campaigns/:id/ab-test', async (req, res) => {
  try {
    const { id } = req.params;
    const { variants, testPercentage } = req.body;
    
    // Update campaign to be an A/B test
    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        isABTest: true,
        abTestVariants: variants,
        status: 'DRAFT' // Keep in draft until user decides to send
      }
    });
    
    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error creating A/B test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get A/B test results
router.get('/campaigns/:id/ab-results', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the campaign and its email performance data grouped by variant
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        emails: {
          select: {
            status: true,
            openedAt: true,
            clickedAt: true,
            // In a real implementation, we'd track which variant was sent
          }
        }
      }
    });
    
    if (!campaign || !campaign.isABTest) {
      return res.status(404).json({ error: 'Campaign not found or not an A/B test' });
    }
    
    // Calculate results per variant (simplified logic)
    // In a real implementation, we'd need to track which emails were sent with which variant
    const results = campaign.abTestVariants?.map((variant, index) => ({
      variantId: variant.id || `variant-${index}`,
      subject: variant.subject,
      openRate: 0, // Would be calculated from actual data
      clickRate: 0, // Would be calculated from actual data
      sentCount: 0 // Would be calculated from actual data
    })) || [];
    
    res.json({
      campaignId: id,
      results,
      winner: results.length > 0 ? results[0] : null
    });
  } catch (error) {
    console.error('Error getting A/B test results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all recipients for campaign targeting
router.get('/recipients', async (req, res) => {
  try {
    const { search, tags, status, industry, companySize, dateRange, page = 1, limit = 50 } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (tags) filters.tags = tags.split(',');
    if (status) filters.status = status;
    if (industry) filters.industry = industry;
    if (companySize) filters.companySize = companySize;
    if (dateRange) filters.dateRange = JSON.parse(dateRange);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const allRecipients = await emailCampaignService.getAllRecipients(filters);
    const paginatedRecipients = allRecipients.slice(skip, skip + parseInt(limit));
    
    res.json({
      recipients: paginatedRecipients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allRecipients.length,
        pages: Math.ceil(allRecipients.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoints
router.get('/analytics', async (req, res) => {
  try {
    const { dateRange, campaignType } = req.query;
    
    const filters = {};
    if (dateRange) {
      filters.dateRange = JSON.parse(dateRange);
    }
    if (campaignType) {
      filters.campaignType = campaignType;
    }
    
    const analytics = await emailCampaignService.getCampaignAnalytics(filters);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/analytics/engagement', async (req, res) => {
  try {
    const engagementStats = await emailCampaignService.getContactEngagementAnalytics();
    
    res.json(engagementStats);
  } catch (error) {
    console.error('Error getting engagement analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;