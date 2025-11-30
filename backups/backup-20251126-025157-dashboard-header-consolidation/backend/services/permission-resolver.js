/**
 * Permission Resolver Service
 *
 * Implements Discord-style permission resolution with hierarchy:
 * 1. Agency Owner -> ALL permissions
 * 2. Agency Admin -> Management permissions (except billing)
 * 3. Seated User -> Role-based + Permission overrides
 *
 * Permission Resolution Order:
 * 1. Check member_permission_overrides FIRST (always wins)
 * 2. Merge all assigned roles' permissions (most permissive wins)
 * 3. Fall back to default (false)
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// God mode emails (bypass all permission checks)
const GOD_MODE_EMAILS = (process.env.GOD_MODE_EMAILS || 'axolopcrm@gmail.com,kate@kateviolet.com').split(',');

// All available permissions
export const ALL_PERMISSIONS = {
  // Dashboard
  can_view_dashboard: 'View the main dashboard',

  // Leads
  can_view_leads: 'View leads',
  can_create_leads: 'Create new leads',
  can_edit_leads: 'Edit existing leads',
  can_delete_leads: 'Delete leads',

  // Contacts
  can_view_contacts: 'View contacts',
  can_create_contacts: 'Create new contacts',
  can_edit_contacts: 'Edit existing contacts',
  can_delete_contacts: 'Delete contacts',

  // Opportunities
  can_view_opportunities: 'View opportunities/deals',
  can_create_opportunities: 'Create new opportunities',
  can_edit_opportunities: 'Edit existing opportunities',
  can_delete_opportunities: 'Delete opportunities',

  // Activities
  can_view_activities: 'View activities',
  can_create_activities: 'Create new activities',
  can_edit_activities: 'Edit existing activities',

  // Calendar & Meetings
  can_view_calendar: 'View calendar',
  can_manage_calendar: 'Manage calendar events',
  can_view_meetings: 'View meetings',
  can_manage_meetings: 'Schedule and manage meetings',

  // Forms
  can_view_forms: 'View forms',
  can_manage_forms: 'Create and manage forms',

  // Campaigns
  can_view_campaigns: 'View email campaigns',
  can_manage_campaigns: 'Create and manage campaigns',

  // Workflows
  can_view_workflows: 'View automation workflows',
  can_manage_workflows: 'Create and manage workflows',

  // Reports
  can_view_reports: 'View reports and analytics',
  can_export_data: 'Export data',
  can_import_data: 'Import data',

  // Team Management
  can_manage_team: 'Invite and manage team members',
  can_manage_roles: 'Create and manage roles',

  // Billing (Owner only)
  can_manage_billing: 'Manage billing and subscription',

  // Settings
  can_manage_agency_settings: 'Manage agency settings',
  can_access_api: 'Access API',
  can_manage_integrations: 'Manage integrations',

  // Second Brain
  can_view_second_brain: 'View Second Brain',
  can_manage_second_brain: 'Manage Second Brain content'
};

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
  'CRM': [
    'can_view_dashboard',
    'can_view_leads', 'can_create_leads', 'can_edit_leads', 'can_delete_leads',
    'can_view_contacts', 'can_create_contacts', 'can_edit_contacts', 'can_delete_contacts',
    'can_view_opportunities', 'can_create_opportunities', 'can_edit_opportunities', 'can_delete_opportunities',
    'can_view_activities', 'can_create_activities', 'can_edit_activities'
  ],
  'Calendar': [
    'can_view_calendar', 'can_manage_calendar',
    'can_view_meetings', 'can_manage_meetings'
  ],
  'Marketing': [
    'can_view_forms', 'can_manage_forms',
    'can_view_campaigns', 'can_manage_campaigns',
    'can_view_workflows', 'can_manage_workflows'
  ],
  'Data': [
    'can_view_reports', 'can_export_data', 'can_import_data'
  ],
  'Administration': [
    'can_manage_team', 'can_manage_roles', 'can_manage_billing',
    'can_manage_agency_settings', 'can_access_api', 'can_manage_integrations'
  ],
  'AI Features': [
    'can_view_second_brain', 'can_manage_second_brain'
  ]
};

// Owner permissions (ALL)
const OWNER_PERMISSIONS = Object.keys(ALL_PERMISSIONS).reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

// Admin permissions (everything except billing)
const ADMIN_PERMISSIONS = Object.keys(ALL_PERMISSIONS).reduce((acc, key) => {
  acc[key] = key !== 'can_manage_billing';
  return acc;
}, {});

/**
 * Check if user is in god mode
 */
export function isGodModeUser(email) {
  return GOD_MODE_EMAILS.includes(email?.toLowerCase());
}

/**
 * Get member info including type and agency
 */
export async function getMemberInfo(memberId) {
  try {
    const { data, error } = await supabase
      .from('agency_members')
      .select(`
        id,
        user_id,
        agency_id,
        member_type,
        role,
        user:auth.users(email)
      `)
      .eq('id', memberId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error getting member info:', error);
    return null;
  }
}

/**
 * Get member info by user ID and agency ID
 */
export async function getMemberByUserAndAgency(userId, agencyId) {
  try {
    const { data, error } = await supabase
      .from('agency_members')
      .select(`
        id,
        user_id,
        agency_id,
        member_type,
        role
      `)
      .eq('user_id', userId)
      .eq('agency_id', agencyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error getting member by user and agency:', error);
    return null;
  }
}

/**
 * Get all roles assigned to a member
 */
export async function getMemberRoles(memberId) {
  try {
    const { data, error } = await supabase
      .from('member_roles')
      .select(`
        id,
        role:agency_roles(
          id,
          name,
          display_name,
          color,
          icon,
          permissions,
          section_access,
          position
        )
      `)
      .eq('member_id', memberId)
      .order('role(position)');

    if (error) throw error;
    return data?.map(mr => mr.role).filter(Boolean) || [];
  } catch (error) {
    logger.error('Error getting member roles:', error);
    return [];
  }
}

/**
 * Get permission overrides for a member
 */
export async function getPermissionOverrides(memberId) {
  try {
    const { data, error } = await supabase
      .from('member_permission_overrides')
      .select('permission_key, value, reason')
      .eq('member_id', memberId);

    if (error) throw error;

    // Convert to object for easy lookup
    const overrides = {};
    data?.forEach(override => {
      overrides[override.permission_key] = {
        value: override.value,
        reason: override.reason
      };
    });
    return overrides;
  } catch (error) {
    logger.error('Error getting permission overrides:', error);
    return {};
  }
}

/**
 * Merge permissions from multiple roles (most permissive wins)
 */
export function mergeRolePermissions(roles) {
  const merged = {};

  for (const role of roles) {
    const permissions = role.permissions || {};
    for (const [key, value] of Object.entries(permissions)) {
      // Most permissive wins (if any role grants, permission is granted)
      if (value === true) {
        merged[key] = true;
      } else if (merged[key] === undefined) {
        merged[key] = false;
      }
    }
  }

  return merged;
}

/**
 * Apply permission overrides to merged permissions
 * Overrides ALWAYS win (Discord-style)
 */
export function applyOverrides(mergedPermissions, overrides) {
  const final = { ...mergedPermissions };

  for (const [key, override] of Object.entries(overrides)) {
    final[key] = override.value;
  }

  return final;
}

/**
 * Resolve all permissions for a member (main function)
 *
 * @param {string} memberId - The agency_members ID
 * @param {string} userEmail - User's email (for god mode check)
 * @returns {Object} - Resolved permissions object
 */
export async function resolvePermissions(memberId, userEmail = null) {
  try {
    // Check god mode first
    if (userEmail && isGodModeUser(userEmail)) {
      logger.debug(`God mode user detected: ${userEmail}`);
      return OWNER_PERMISSIONS;
    }

    // Get member info
    const member = await getMemberInfo(memberId);
    if (!member) {
      logger.warn(`Member not found: ${memberId}`);
      return {};
    }

    // Check god mode by email from member data
    if (member.user?.email && isGodModeUser(member.user.email)) {
      return OWNER_PERMISSIONS;
    }

    // Owner gets ALL permissions
    if (member.member_type === 'owner') {
      return OWNER_PERMISSIONS;
    }

    // Admin gets all except billing
    if (member.member_type === 'admin') {
      return ADMIN_PERMISSIONS;
    }

    // For seated users, resolve from roles + overrides
    const [roles, overrides] = await Promise.all([
      getMemberRoles(memberId),
      getPermissionOverrides(memberId)
    ]);

    // Merge role permissions
    const mergedPermissions = mergeRolePermissions(roles);

    // Apply overrides (these ALWAYS win)
    const finalPermissions = applyOverrides(mergedPermissions, overrides);

    return finalPermissions;
  } catch (error) {
    logger.error('Error resolving permissions:', error);
    return {};
  }
}

/**
 * Check if member has a specific permission
 */
export async function hasPermission(memberId, permissionKey, userEmail = null) {
  const permissions = await resolvePermissions(memberId, userEmail);
  return permissions[permissionKey] === true;
}

/**
 * Check if member has ANY of the specified permissions
 */
export async function hasAnyPermission(memberId, permissionKeys, userEmail = null) {
  const permissions = await resolvePermissions(memberId, userEmail);
  return permissionKeys.some(key => permissions[key] === true);
}

/**
 * Check if member has ALL of the specified permissions
 */
export async function hasAllPermissions(memberId, permissionKeys, userEmail = null) {
  const permissions = await resolvePermissions(memberId, userEmail);
  return permissionKeys.every(key => permissions[key] === true);
}

/**
 * Get section access for a member (for UI visibility)
 */
export async function getSectionAccess(memberId, userEmail = null) {
  try {
    // Check god mode
    if (userEmail && isGodModeUser(userEmail)) {
      return {
        dashboard: true, leads: true, contacts: true, opportunities: true,
        calendar: true, forms: true, campaigns: true, workflows: true,
        reports: true, settings: true, second_brain: true
      };
    }

    // Get member info
    const member = await getMemberInfo(memberId);
    if (!member) return {};

    // Check god mode by email
    if (member.user?.email && isGodModeUser(member.user.email)) {
      return {
        dashboard: true, leads: true, contacts: true, opportunities: true,
        calendar: true, forms: true, campaigns: true, workflows: true,
        reports: true, settings: true, second_brain: true
      };
    }

    // Owner/Admin see everything
    if (member.member_type === 'owner' || member.member_type === 'admin') {
      return {
        dashboard: true, leads: true, contacts: true, opportunities: true,
        calendar: true, forms: true, campaigns: true, workflows: true,
        reports: true, settings: true, second_brain: true
      };
    }

    // For seated users, merge section access from roles
    const roles = await getMemberRoles(memberId);
    const mergedAccess = {};

    for (const role of roles) {
      const sectionAccess = role.section_access || {};
      for (const [section, value] of Object.entries(sectionAccess)) {
        if (value === true) {
          mergedAccess[section] = true;
        }
      }
    }

    return mergedAccess;
  } catch (error) {
    logger.error('Error getting section access:', error);
    return {};
  }
}

/**
 * Resolve permissions by user ID and agency ID
 * (Helper for routes that have user context instead of member ID)
 */
export async function resolvePermissionsByUserAndAgency(userId, agencyId, userEmail = null) {
  try {
    const member = await getMemberByUserAndAgency(userId, agencyId);
    if (!member) {
      logger.warn(`Member not found for user ${userId} in agency ${agencyId}`);
      return {};
    }
    return resolvePermissions(member.id, userEmail);
  } catch (error) {
    logger.error('Error resolving permissions by user and agency:', error);
    return {};
  }
}

/**
 * Check member type (for hierarchy checks)
 */
export async function getMemberType(userId, agencyId) {
  try {
    const member = await getMemberByUserAndAgency(userId, agencyId);
    return member?.member_type || null;
  } catch (error) {
    logger.error('Error getting member type:', error);
    return null;
  }
}

/**
 * Check if user is owner of agency
 */
export async function isOwner(userId, agencyId) {
  const memberType = await getMemberType(userId, agencyId);
  return memberType === 'owner';
}

/**
 * Check if user is admin or owner of agency
 */
export async function isAdminOrOwner(userId, agencyId) {
  const memberType = await getMemberType(userId, agencyId);
  return memberType === 'owner' || memberType === 'admin';
}

/**
 * Check if user can manage another member
 * - Owners can manage anyone
 * - Admins can only manage seated users
 * - Seated users cannot manage anyone
 */
export async function canManageMember(managerUserId, targetMemberId, agencyId) {
  try {
    const [managerType, targetMember] = await Promise.all([
      getMemberType(managerUserId, agencyId),
      getMemberInfo(targetMemberId)
    ]);

    if (!managerType || !targetMember) return false;

    // Owner can manage anyone
    if (managerType === 'owner') return true;

    // Admin can only manage seated users
    if (managerType === 'admin' && targetMember.member_type === 'seated_user') {
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error checking canManageMember:', error);
    return false;
  }
}

export default {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  isGodModeUser,
  getMemberInfo,
  getMemberByUserAndAgency,
  getMemberRoles,
  getPermissionOverrides,
  mergeRolePermissions,
  applyOverrides,
  resolvePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getSectionAccess,
  resolvePermissionsByUserAndAgency,
  getMemberType,
  isOwner,
  isAdminOrOwner,
  canManageMember
};
