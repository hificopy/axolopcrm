/**
 * Audit Service
 * Handles activity logging and audit trail management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Action types for consistency
export const AUDIT_ACTIONS = {
  // Agency actions
  AGENCY_CREATED: 'agency_created',
  AGENCY_UPDATED: 'agency_updated',
  AGENCY_DELETED: 'agency_deleted',
  AGENCY_SETTINGS_UPDATED: 'agency_settings_updated',
  AGENCY_LOGO_UPDATED: 'agency_logo_updated',
  AGENCY_THEME_CHANGED: 'agency_theme_changed',

  // Member actions
  MEMBER_INVITED: 'member_invited',
  MEMBER_JOINED: 'member_joined',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_ROLE_CHANGED: 'member_role_changed',
  MEMBER_PERMISSIONS_UPDATED: 'member_permissions_updated',

  // Role actions
  ROLE_CREATED: 'role_created',
  ROLE_UPDATED: 'role_updated',
  ROLE_DELETED: 'role_deleted',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_UNASSIGNED: 'role_unassigned',

  // Invite actions
  INVITE_CREATED: 'invite_created',
  INVITE_USED: 'invite_used',
  INVITE_EXPIRED: 'invite_expired',
  INVITE_DEACTIVATED: 'invite_deactivated',

  // Data actions
  LEAD_CREATED: 'lead_created',
  LEAD_UPDATED: 'lead_updated',
  LEAD_DELETED: 'lead_deleted',
  LEAD_CONVERTED: 'lead_converted',

  CONTACT_CREATED: 'contact_created',
  CONTACT_UPDATED: 'contact_updated',
  CONTACT_DELETED: 'contact_deleted',

  OPPORTUNITY_CREATED: 'opportunity_created',
  OPPORTUNITY_UPDATED: 'opportunity_updated',
  OPPORTUNITY_DELETED: 'opportunity_deleted',
  OPPORTUNITY_WON: 'opportunity_won',
  OPPORTUNITY_LOST: 'opportunity_lost',

  // Communication actions
  EMAIL_SENT: 'email_sent',
  CALL_MADE: 'call_made',
  MEETING_SCHEDULED: 'meeting_scheduled',
  MEETING_COMPLETED: 'meeting_completed',

  // Authentication actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PASSWORD_CHANGED: 'password_changed',

  // System actions
  BULK_IMPORT: 'bulk_import',
  BULK_EXPORT: 'bulk_export',
  DATA_BACKUP: 'data_backup',
  SETTINGS_CHANGED: 'settings_changed'
};

// Entity types
export const ENTITY_TYPES = {
  AGENCY: 'agency',
  MEMBER: 'member',
  ROLE: 'role',
  INVITE: 'invite',
  LEAD: 'lead',
  CONTACT: 'contact',
  OPPORTUNITY: 'opportunity',
  EMAIL: 'email',
  CALL: 'call',
  MEETING: 'meeting',
  FORM: 'form',
  WORKFLOW: 'workflow',
  USER: 'user',
  SETTINGS: 'settings'
};

// Severity levels
export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

class AuditService {
  /**
   * Log an activity
   */
  async logActivity({
    agencyId,
    userId,
    action,
    entityType,
    entityId = null,
    entityName = null,
    details = {},
    severity = SEVERITY.INFO,
    ipAddress = null,
    userAgent = null
  }) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          agency_id: agencyId,
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          details,
          severity,
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in logActivity:', err);
      return null;
    }
  }

  /**
   * Get activity logs for an agency
   */
  async getActivityLogs({
    agencyId,
    limit = 50,
    offset = 0,
    action = null,
    entityType = null,
    userId = null,
    startDate = null,
    endDate = null,
    severity = null
  }) {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          created_at,
          user_id,
          action,
          entity_type,
          entity_id,
          entity_name,
          details,
          severity,
          ip_address
        `)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (action) query = query.eq('action', action);
      if (entityType) query = query.eq('entity_type', entityType);
      if (userId) query = query.eq('user_id', userId);
      if (severity) query = query.eq('severity', severity);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error, count } = await query;

      if (error) throw error;

      // Enrich with user info
      const userIds = [...new Set(data.map(log => log.user_id).filter(Boolean))];
      let userMap = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds);

        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      const enrichedData = data.map(log => ({
        ...log,
        user: userMap[log.user_id] || null
      }));

      return { data: enrichedData, count };
    } catch (err) {
      console.error('Error getting activity logs:', err);
      throw err;
    }
  }

  /**
   * Get activity summary for an agency
   */
  async getActivitySummary(agencyId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, entity_type, created_at')
        .eq('agency_id', agencyId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Group by action
      const actionCounts = data.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});

      // Group by entity type
      const entityCounts = data.reduce((acc, log) => {
        acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
        return acc;
      }, {});

      // Group by day
      const dailyActivity = data.reduce((acc, log) => {
        const day = log.created_at.split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      return {
        totalActions: data.length,
        actionCounts,
        entityCounts,
        dailyActivity
      };
    } catch (err) {
      console.error('Error getting activity summary:', err);
      throw err;
    }
  }

  /**
   * Get agency health metrics
   */
  async getAgencyHealth(agencyId) {
    try {
      // Try to get from cached metrics first
      const { data: cached } = await supabase
        .from('agency_health_metrics')
        .select('*')
        .eq('agency_id', agencyId)
        .single();

      // If recent enough (within 1 hour), return cached
      if (cached && new Date(cached.last_calculated_at) > new Date(Date.now() - 3600000)) {
        return cached;
      }

      // Calculate fresh metrics
      const health = await this.calculateHealth(agencyId);

      // Upsert the metrics
      await supabase
        .from('agency_health_metrics')
        .upsert({
          agency_id: agencyId,
          ...health,
          last_calculated_at: new Date().toISOString()
        });

      return health;
    } catch (err) {
      console.error('Error getting agency health:', err);
      throw err;
    }
  }

  /**
   * Calculate agency health metrics
   */
  async calculateHealth(agencyId) {
    try {
      // Get member stats
      const { data: members } = await supabase
        .from('agency_members')
        .select('user_id, invitation_status, joined_at, updated_at')
        .eq('agency_id', agencyId)
        .eq('invitation_status', 'active');

      const memberCount = members?.length || 0;
      const recentlyActive = members?.filter(m =>
        new Date(m.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      // Get activity stats
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const { data: recentActivity } = await supabase
        .from('audit_logs')
        .select('created_at')
        .eq('agency_id', agencyId)
        .gte('created_at', fourteenDaysAgo.toISOString());

      const thisWeek = recentActivity?.filter(a =>
        new Date(a.created_at) >= sevenDaysAgo
      ).length || 0;

      const lastWeek = recentActivity?.filter(a =>
        new Date(a.created_at) >= fourteenDaysAgo &&
        new Date(a.created_at) < sevenDaysAgo
      ).length || 0;

      // Calculate scores
      const activityScore = Math.min(100, Math.round((thisWeek / Math.max(memberCount, 1)) * 5));
      const engagementScore = memberCount > 0 ? Math.round((recentlyActive / memberCount) * 100) : 0;
      const growthScore = 50; // Baseline - would calculate from new members trend
      const retentionScore = Math.min(100, memberCount * 20);

      const overallHealth = Math.round((activityScore + engagementScore + growthScore + retentionScore) / 4);

      // Calculate trends
      const activityTrend = thisWeek > lastWeek * 1.1 ? 'up' : (thisWeek < lastWeek * 0.9 ? 'down' : 'stable');

      // Generate alerts
      const alerts = [];
      if (activityScore < 30) alerts.push('Low activity detected - encourage team engagement');
      if (engagementScore < 50) alerts.push('Member engagement is below average');
      if (memberCount === 1) alerts.push('Only one team member - consider inviting others');

      // Generate recommendations
      const recommendations = [];
      if (memberCount < 3) recommendations.push('Invite more team members for better collaboration');
      if (activityScore < 50) recommendations.push('Schedule regular check-ins to boost activity');
      if (thisWeek < lastWeek) recommendations.push('Activity is trending down - review team workload');

      return {
        overall_health: overallHealth,
        activity_score: activityScore,
        engagement_score: engagementScore,
        growth_score: growthScore,
        retention_score: retentionScore,
        activity_trend: activityTrend,
        engagement_trend: 'stable',
        growth_trend: 'stable',
        alerts,
        recommendations
      };
    } catch (err) {
      console.error('Error calculating health:', err);
      return {
        overall_health: 50,
        activity_score: 50,
        engagement_score: 50,
        growth_score: 50,
        retention_score: 50,
        activity_trend: 'stable',
        engagement_trend: 'stable',
        growth_trend: 'stable',
        alerts: [],
        recommendations: []
      };
    }
  }

  /**
   * Get agency analytics
   */
  async getAgencyAnalytics(agencyId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('agency_analytics')
        .select('*')
        .eq('agency_id', agencyId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error getting agency analytics:', err);
      throw err;
    }
  }

  /**
   * Get recent activity for dashboard widget
   */
  async getRecentActivity(agencyId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          created_at,
          user_id,
          action,
          entity_type,
          entity_name,
          details
        `)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get user info
      const userIds = [...new Set(data.map(log => log.user_id).filter(Boolean))];
      let userMap = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      return data.map(log => ({
        ...log,
        user: userMap[log.user_id] || null
      }));
    } catch (err) {
      console.error('Error getting recent activity:', err);
      throw err;
    }
  }
}

// Export singleton instance
export const auditService = new AuditService();

// Middleware to extract request info for logging
export function extractRequestInfo(req) {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  };
}

export default auditService;
