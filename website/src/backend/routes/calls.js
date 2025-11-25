import express from 'express';
import callService from '../services/call-service.js';
import aiCallAnalysisService from '../services/ai-call-analysis-service.js';
import salesScriptService from '../services/sales-script-service.js';
import callQueueService from '../services/call-queue-service.js';
import importantDatesService from '../services/important-dates-service.js';
import { getUserFromRequest } from '../config/supabase-auth.js';
import {
  asyncHandler,
  validateCallInitiation,
  validateDispositionUpdate,
  validateScriptCreation,
  validateQueueItemCreation,
  validateImportantDateCreation,
  validateRequired,
  validateUUID
} from '../middleware/validation.js';
import { extractAgencyContext } from '../middleware/agency-access.js';

const router = express.Router();

// Apply agency context extraction to all routes
router.use(extractAgencyContext);

/**
 * Calls API Routes
 * Comprehensive call management endpoints
 */

// ===========================================================================
// CALL MANAGEMENT
// ===========================================================================

/**
 * GET /api/calls
 * Get all calls for the authenticated user with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filters = {
      leadId: req.query.leadId,
      contactId: req.query.contactId,
      status: req.query.status,
      disposition: req.query.disposition,
      direction: req.query.direction,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 50
    };

    const calls = await callService.getCalls(user.id, filters);
    res.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/calls/:id
 * Get a specific call by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const call = await callService.getCallById(user.id, req.params.id);
    res.json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/calls/initiate
 * Initiate a new outbound call
 */
router.post('/initiate', validateCallInitiation, asyncHandler(async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const callData = {
    leadId: req.body.leadId,
    contactId: req.body.contactId,
    phoneNumber: req.body.phoneNumber,
    queueItemId: req.body.queueItemId,
    scriptTemplateId: req.body.scriptTemplateId,
    callerId: req.body.callerId
  };

  const call = await callService.initiateCall(user.id, callData);
  res.json({ success: true, call });
}));

/**
 * POST /api/calls/:id/end
 * End an active call
 */
router.post('/:id/end', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const call = await callService.updateCallStatus(req.params.id, {
      status: 'ended',
      endedAt: new Date(),
      durationSeconds: req.body.duration,
      talkTimeSeconds: req.body.talkTime
    });

    res.json({ success: true, call });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/calls/:id/disposition
 * Set call disposition
 */
router.post('/:id/disposition', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const call = await callService.updateCallDisposition(
      user.id,
      req.params.id,
      req.body.disposition,
      req.body.notes
    );

    res.json({ success: true, call });
  } catch (error) {
    console.error('Error setting disposition:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/calls/:id/voicemail
 * Drop voicemail on call
 */
router.post('/:id/voicemail', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const call = await callService.dropVoicemail(
      user.id,
      req.params.id,
      req.body.templateId
    );

    res.json({ success: true, call });
  } catch (error) {
    console.error('Error dropping voicemail:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/calls/:id/comments
 * Get comments for a call
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const comments = await callService.getCallComments(user.id, req.params.id);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/calls/:id/comments
 * Add comment to call
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const comment = await callService.addCallComment(user.id, req.params.id, {
      comment: req.body.comment,
      commentType: req.body.commentType,
      isPrivate: req.body.isPrivate,
      mentionedUsers: req.body.mentionedUsers
    });

    res.json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// CALL ANALYTICS
// ===========================================================================

/**
 * GET /api/calls/stats/today
 * Get today's call statistics
 */
router.get('/stats/today', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const stats = await callService.getTodayStats(user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching today stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/calls/analytics
 * Get call analytics for date range
 */
router.get('/analytics', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate || new Date();

    const analytics = await callService.getCallAnalytics(user.id, startDate, endDate);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/calls/analytics/performance
 * Get agent performance metrics
 */
router.get('/analytics/performance', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate || new Date();

    const performance = await callService.getAgentPerformance(user.id, startDate, endDate);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/calls/analytics/trends
 * Get call trends analysis
 */
router.get('/analytics/trends', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate || new Date();

    const trends = await aiCallAnalysisService.analyzeCallTrends(user.id, startDate, endDate);
    res.json(trends);
  } catch (error) {
    console.error('Error analyzing trends:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// CALL QUEUE
// ===========================================================================

/**
 * GET /api/call-queue
 * Get all call queues
 */
router.get('/queue', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const queues = await callQueueService.getCallQueues(user.id);
    res.json(queues);
  } catch (error) {
    console.error('Error fetching queues:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/call-queue/next
 * Get next item to call from queue
 */
router.get('/queue/next', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const queueId = req.query.queueId || null;
    const nextItem = await callQueueService.getNextItemToCall(user.id, queueId);
    res.json(nextItem);
  } catch (error) {
    console.error('Error getting next item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/call-queue/items
 * Get queue items
 */
router.get('/queue/items', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filters = {
      status: req.query.status,
      assignedTo: req.query.assignedTo,
      limit: parseInt(req.query.limit) || 50
    };

    const queueId = req.query.queueId;
    const items = await callQueueService.getQueueItems(user.id, queueId, filters);
    res.json(items);
  } catch (error) {
    console.error('Error fetching queue items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/call-queue/items/:id/requeue
 * Requeue an item
 */
router.post('/queue/items/:id/requeue', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const item = await callQueueService.requeueItem(
      user.id,
      req.params.id,
      req.body.nextAttemptAt
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error requeueing item:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/call-queue/items/:id/dispose
 * Dispose a queue item
 */
router.post('/queue/items/:id/dispose', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const item = await callQueueService.disposeQueueItem(
      user.id,
      req.params.id,
      req.body.disposition,
      req.body.notes
    );

    res.json({ success: true, item });
  } catch (error) {
    console.error('Error disposing item:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// SALES SCRIPTS
// ===========================================================================

/**
 * GET /api/sales-scripts
 * Get all sales script templates
 */
router.get('/scripts', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filters = {
      scriptType: req.query.scriptType,
      industry: req.query.industry,
      isActive: req.query.isActive
    };

    const scripts = await salesScriptService.getScriptTemplates(user.id, filters);
    res.json(scripts);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sales-scripts/recommended
 * Get recommended script for lead and scenario
 */
router.get('/scripts/recommended', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const script = await salesScriptService.getRecommendedScript(
      user.id,
      req.query.leadId,
      req.query.scenario || 'default'
    );

    // Populate with lead data if script found
    if (script && req.query.leadId) {
      const populated = await salesScriptService.populateScriptTemplate(
        script.id,
        req.query.leadId,
        req.query.contactId
      );
      return res.json(populated);
    }

    res.json(script);
  } catch (error) {
    console.error('Error getting recommended script:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sales-scripts
 * Create a new script template
 */
router.post('/scripts', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const script = await salesScriptService.createScriptTemplate(user.id, req.body);
    res.json({ success: true, script });
  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// VOICEMAIL TEMPLATES
// ===========================================================================

/**
 * GET /api/voicemail-templates
 * Get all voicemail templates
 */
router.get('/voicemail-templates', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filters = {
      industry: req.query.industry,
      isActive: req.query.isActive
    };

    const templates = await salesScriptService.getVoicemailTemplates(user.id, filters);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching voicemail templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// IMPORTANT DATES / BIRTHDAYS
// ===========================================================================

/**
 * GET /api/important-dates
 * Get important dates (birthdays, policy expirations, etc.)
 */
router.get('/important-dates', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filters = {
      dateType: req.query.dateType,
      leadId: req.query.leadId,
      contactId: req.query.contactId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const dates = await importantDatesService.getImportantDates(user.id, filters);
    res.json(dates);
  } catch (error) {
    console.error('Error fetching important dates:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/important-dates/birthdays/upcoming
 * Get upcoming birthdays
 */
router.get('/important-dates/birthdays/upcoming', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const daysAhead = parseInt(req.query.daysAhead) || 30;
    const birthdays = await importantDatesService.getUpcomingBirthdays(user.id, daysAhead);
    res.json(birthdays);
  } catch (error) {
    console.error('Error fetching upcoming birthdays:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/important-dates/birthdays/today
 * Get today's birthdays
 */
router.get('/important-dates/birthdays/today', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const birthdays = await importantDatesService.getTodayBirthdays(user.id);
    res.json(birthdays);
  } catch (error) {
    console.error('Error fetching today birthdays:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/important-dates
 * Add important date
 */
router.post('/important-dates', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const date = await importantDatesService.addImportantDate(user.id, req.body);
    res.json({ success: true, date });
  } catch (error) {
    console.error('Error adding important date:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================================================
// AI FEATURES
// ===========================================================================

/**
 * POST /api/calls/:id/transcript/generate
 * Generate transcript for call
 */
router.post('/:id/transcript/generate', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const call = await callService.getCallById(user.id, req.params.id);
    if (!call.recording_url) {
      return res.status(400).json({ error: 'No recording available' });
    }

    // Generate transcript (async operation)
    aiCallAnalysisService.generateTranscript(req.params.id, call.recording_url);

    res.json({ success: true, message: 'Transcript generation started' });
  } catch (error) {
    console.error('Error generating transcript:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
