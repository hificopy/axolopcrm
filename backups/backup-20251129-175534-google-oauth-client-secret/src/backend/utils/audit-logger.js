/**
 * Audit Logger Utility
 *
 * Provides convenient methods for logging agency activities
 * with automatic context extraction and severity classification.
 */

import { supabaseServer } from '../config/supabase-auth.js';
import logger from './logger.js';

// Action types for categorization
export const AUDIT_ACTIONS = {
  // Agency
  AGENCY_CREATED: 'agency_created',
  AGENCY_UPDATED: 'agency_updated',
  AGENCY_DELETED: 'agency_deleted',
  AGENCY_SETTINGS_CHANGED: 'agency_settings_changed',

  // Members
  MEMBER_INVITED: 'member_invited',
  MEMBER_JOINED: 'member_joined',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_ROLE_CHANGED: 'member_role_changed',
  MEMBER_TYPE_CHANGED: 'member_type_changed',

  // Roles
  ROLE_CREATED: 'role_created',
  ROLE_UPDATED: 'role_updated',
  ROLE_DELETED: 'role_deleted',
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_UNASSIGNED: 'role_unassigned',

  // Permissions
  PERMISSION_OVERRIDE_SET: 'permission_override_set',
  PERMISSION_OVERRIDE_REMOVED: 'permission_override_removed',
  BULK_PERMISSIONS_CHANGED: 'bulk_permissions_changed',

  // Seats
  SEAT_ADDED: 'seat_added',
  SEAT_REMOVED: 'seat_removed',
  SEATS_UPGRADED: 'seats_upgraded',
  SEATS_DOWNGRADED: 'seats_downgraded',

  // Billing
  SUBSCRIPTION_CHANGED: 'subscription_changed',
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_FAILED: 'payment_failed',

  // Security
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_CHANGED: 'password_changed',
  API_KEY_CREATED: 'api_key_created',
  API_KEY_REVOKED: 'api_key_revoked',

  // Data
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported',
  BULK_DELETE: 'bulk_delete',

  // System
  ERROR_OCCURRED: 'error_occurred',
  RATE_LIMITED: 'rate_limited'
};

// Entity types
export const ENTITY_TYPES = {
  AGENCY: 'agency',
  MEMBER: 'member',
  ROLE: 'role',
  PERMISSION: 'permission',
  SEAT: 'seat',
  SUBSCRIPTION: 'subscription',
  USER: 'user',
  SETTINGS: 'settings',
  DATA: 'data'
};

// Severity levels
export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Determine severity based on action
function getSeverityForAction(action) {
  const criticalActions = [
    AUDIT_ACTIONS.AGENCY_DELETED,
    AUDIT_ACTIONS.MEMBER_REMOVED,
    AUDIT_ACTIONS.BULK_DELETE,
    AUDIT_ACTIONS.PAYMENT_FAILED
  ];

  const warningActions = [
    AUDIT_ACTIONS.PERMISSION_OVERRIDE_SET,
    AUDIT_ACTIONS.MEMBER_TYPE_CHANGED,
    AUDIT_ACTIONS.SEATS_DOWNGRADED,
    AUDIT_ACTIONS.ROLE_DELETED,
    AUDIT_ACTIONS.LOGIN_FAILED,
    AUDIT_ACTIONS.RATE_LIMITED
  ];

  const errorActions = [
    AUDIT_ACTIONS.ERROR_OCCURRED
  ];

  if (criticalActions.includes(action)) return SEVERITY.CRITICAL;
  if (errorActions.includes(action)) return SEVERITY.ERROR;
  if (warningActions.includes(action)) return SEVERITY.WARNING;
  return SEVERITY.INFO;
}

/**
 * Log an activity to the audit log
 * @param {Object} params - Log parameters
 * @returns {Promise<Object>} Log entry
 */
export async function logActivity({
  agencyId,
  userId,
  action,
  entityType,
  entityId = null,
  entityName = null,
  details = {},
  severity = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    // Auto-determine severity if not provided
    const finalSeverity = severity || getSeverityForAction(action);

    // Insert into audit_logs table
    const { data, error } = await supabaseServer
      .from('audit_logs')
      .insert({
        agency_id: agencyId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        details,
        severity: finalSeverity,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to write audit log', { error, action, agencyId });
      return null;
    }

    // Also log to system logger for critical events
    if (finalSeverity === SEVERITY.CRITICAL) {
      logger.warn('Critical audit event', {
        action,
        agencyId,
        userId,
        entityType,
        entityId,
        details
      });
    }

    return data;
  } catch (err) {
    logger.error('Audit logging error', { error: err.message, action });
    return null;
  }
}

/**
 * Extract request context for logging
 * @param {Object} req - Express request object
 * @returns {Object} Request context
 */
export function extractRequestContext(req) {
  return {
    userId: req.user?.id,
    agencyId: req.params?.agencyId || req.body?.agencyId || req.headers?.['x-agency-id'],
    ipAddress: req.ip || req.headers?.['x-forwarded-for']?.split(',')[0],
    userAgent: req.headers?.['user-agent']
  };
}

/**
 * Create an audit logger bound to request context
 * @param {Object} req - Express request object
 * @returns {Object} Bound logger methods
 */
export function createRequestLogger(req) {
  const context = extractRequestContext(req);

  return {
    log: (action, entityType, options = {}) => logActivity({
      ...context,
      action,
      entityType,
      ...options
    }),

    // Convenience methods for common actions
    memberInvited: (memberId, email, role) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.MEMBER_INVITED,
      entityType: ENTITY_TYPES.MEMBER,
      entityId: memberId,
      entityName: email,
      details: { role }
    }),

    memberRemoved: (memberId, email, reason) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.MEMBER_REMOVED,
      entityType: ENTITY_TYPES.MEMBER,
      entityId: memberId,
      entityName: email,
      details: { reason }
    }),

    roleAssigned: (memberId, roleId, roleName) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.ROLE_ASSIGNED,
      entityType: ENTITY_TYPES.ROLE,
      entityId: roleId,
      entityName: roleName,
      details: { memberId }
    }),

    roleUnassigned: (memberId, roleId, roleName) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.ROLE_UNASSIGNED,
      entityType: ENTITY_TYPES.ROLE,
      entityId: roleId,
      entityName: roleName,
      details: { memberId }
    }),

    permissionChanged: (memberId, permissionKey, value, reason) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.PERMISSION_OVERRIDE_SET,
      entityType: ENTITY_TYPES.PERMISSION,
      entityName: permissionKey,
      details: { memberId, value, reason }
    }),

    roleCreated: (roleId, roleName) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.ROLE_CREATED,
      entityType: ENTITY_TYPES.ROLE,
      entityId: roleId,
      entityName: roleName
    }),

    roleUpdated: (roleId, roleName, changes) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.ROLE_UPDATED,
      entityType: ENTITY_TYPES.ROLE,
      entityId: roleId,
      entityName: roleName,
      details: { changes }
    }),

    roleDeleted: (roleId, roleName) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.ROLE_DELETED,
      entityType: ENTITY_TYPES.ROLE,
      entityId: roleId,
      entityName: roleName
    }),

    settingsChanged: (settingType, changes) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.AGENCY_SETTINGS_CHANGED,
      entityType: ENTITY_TYPES.SETTINGS,
      entityName: settingType,
      details: { changes }
    }),

    error: (errorMessage, errorDetails) => logActivity({
      ...context,
      action: AUDIT_ACTIONS.ERROR_OCCURRED,
      entityType: ENTITY_TYPES.DATA,
      entityName: errorMessage,
      details: errorDetails,
      severity: SEVERITY.ERROR
    })
  };
}

/**
 * Express middleware to attach audit logger to request
 */
export function auditLoggerMiddleware(req, res, next) {
  req.auditLog = createRequestLogger(req);
  next();
}

/**
 * Get recent audit logs for an agency
 * @param {string} agencyId - Agency ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Audit logs
 */
export async function getAuditLogs(agencyId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    action = null,
    entityType = null,
    userId = null,
    severity = null,
    startDate = null,
    endDate = null
  } = options;

  try {
    let query = supabaseServer
      .from('audit_logs')
      .select('*', { count: 'exact' })
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

    if (error) {
      logger.error('Failed to fetch audit logs', { error, agencyId });
      return { logs: [], total: 0 };
    }

    return { logs: data, total: count };
  } catch (err) {
    logger.error('Audit log fetch error', { error: err.message });
    return { logs: [], total: 0 };
  }
}

export default {
  logActivity,
  extractRequestContext,
  createRequestLogger,
  auditLoggerMiddleware,
  getAuditLogs,
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  SEVERITY
};
