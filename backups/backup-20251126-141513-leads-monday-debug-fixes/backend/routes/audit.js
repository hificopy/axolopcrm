/**
 * Audit Routes
 * API endpoints for activity logging, analytics, and health metrics
 */

import express from 'express';
import { auditService, AUDIT_ACTIONS, ENTITY_TYPES, SEVERITY, extractRequestInfo } from '../services/audit-service.js';
import { authenticate } from '../middleware/auth.js';
import { requireAgencyAccess, requireAgencyAdmin } from '../middleware/agency-access.js';

const router = express.Router();

/**
 * GET /api/v1/audit/logs
 * Get activity logs for current agency
 */
router.get('/logs',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const {
        limit = 50,
        offset = 0,
        action,
        entity_type,
        user_id,
        start_date,
        end_date,
        severity
      } = req.query;

      const result = await auditService.getActivityLogs({
        agencyId,
        limit: parseInt(limit),
        offset: parseInt(offset),
        action,
        entityType: entity_type,
        userId: user_id,
        startDate: start_date,
        endDate: end_date,
        severity
      });

      res.json({
        success: true,
        data: result.data,
        count: result.count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity logs'
      });
    }
  }
);

/**
 * GET /api/v1/audit/recent
 * Get recent activity for dashboard widget
 */
router.get('/recent',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const limit = parseInt(req.query.limit) || 10;

      const data = await auditService.getRecentActivity(agencyId, limit);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent activity'
      });
    }
  }
);

/**
 * GET /api/v1/audit/summary
 * Get activity summary for analytics
 */
router.get('/summary',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const days = parseInt(req.query.days) || 30;

      const summary = await auditService.getActivitySummary(agencyId, days);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity summary'
      });
    }
  }
);

/**
 * GET /api/v1/audit/health
 * Get agency health metrics
 */
router.get('/health',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];

      const health = await auditService.getAgencyHealth(agencyId);

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Error fetching agency health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agency health'
      });
    }
  }
);

/**
 * GET /api/v1/audit/analytics
 * Get agency analytics data
 */
router.get('/analytics',
  authenticate,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const { start_date, end_date } = req.query;

      // Default to last 30 days
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const analytics = await auditService.getAgencyAnalytics(agencyId, startDate, endDate);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  }
);

/**
 * POST /api/v1/audit/log
 * Manually log an activity (admin only)
 */
router.post('/log',
  authenticate,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agencyId || req.headers['x-agency-id'];
      const { action, entity_type, entity_id, entity_name, details, severity } = req.body;
      const requestInfo = extractRequestInfo(req);

      const log = await auditService.logActivity({
        agencyId,
        userId: req.user.id,
        action,
        entityType: entity_type,
        entityId: entity_id,
        entityName: entity_name,
        details,
        severity: severity || SEVERITY.INFO,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent
      });

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to log activity'
      });
    }
  }
);

/**
 * GET /api/v1/audit/actions
 * Get list of available audit actions
 */
router.get('/actions',
  authenticate,
  (req, res) => {
    res.json({
      success: true,
      data: {
        actions: AUDIT_ACTIONS,
        entityTypes: ENTITY_TYPES,
        severityLevels: SEVERITY
      }
    });
  }
);

export default router;
