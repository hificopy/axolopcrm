/**
 * User Type Detection Service
 * Determines user type, permissions, and subscription status
 *
 * User Types:
 * - GOD_MODE: Hand-picked by Axolop (configured via GOD_MODE_EMAILS env var)
 * - AGENCY_ADMIN: Paying user who owns an agency (gets 3 free seats)
 * - FREE_USER: User on free plan (no agency ownership)
 * - TRIAL_USER: User on trial period
 * - SEATED_USER: User invited to an agency (read-only, limited access)
 */

import { supabaseServer } from '../config/supabase-auth.js';
import { SUBSCRIPTION_TIERS } from '../utils/subscription-tiers.js';

/**
 * Parse comma-separated email list from environment variable
 * Falls back to empty array if not set
 */
const parseEmailList = (envVar) => {
  const value = process.env[envVar];
  if (!value) return [];
  return value.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

// God mode users (configured via GOD_MODE_EMAILS env var)
// Example: GOD_MODE_EMAILS=admin@example.com,super@example.com
const GOD_MODE_USERS = parseEmailList('GOD_MODE_EMAILS');

// Beta users (configured via BETA_USERS_EMAILS env var)
// Falls back to including god mode users
const BETA_USERS = [
  ...GOD_MODE_USERS,
  ...parseEmailList('BETA_USERS_EMAILS')
];

// Developer users (configured via DEVELOPER_USERS_EMAILS env var)
// Falls back to including god mode users
const DEVELOPER_USERS = [
  ...GOD_MODE_USERS,
  ...parseEmailList('DEVELOPER_USERS_EMAILS')
];

const USER_TYPES = {
  GOD_MODE: 'god_mode',
  AGENCY_ADMIN: 'agency_admin',
  FREE_USER: 'free_user',
  TRIAL_USER: 'trial_user',
  SEATED_USER: 'seated_user',
  BETA: 'beta',
  DEVELOPER: 'developer'
};

const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled'
};

/**
 * Get user type and permissions
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} User type info
 */
export async function getUserType(userId, userEmail) {
  try {
    // 1. Check if God Mode user
    if (GOD_MODE_USERS.includes(userEmail?.toLowerCase())) {
      return {
        type: USER_TYPES.GOD_MODE,
        isGodMode: true,
        isAdmin: true,
        isSeatedUser: false,
        canManageAgency: true,
        canManageBilling: true,
        canEditAnything: true,
        unlimited: true,
        tier: SUBSCRIPTION_TIERS.GOD_MODE
      };
    }

    // 2. Get user's agency memberships
    const { data: memberships, error: memberError } = await supabaseServer
      .from('agency_members')
      .select(`
        id,
        role,
        permissions,
        invitation_status,
        agency_id,
        agencies:agency_id (
          id,
          name,
          subscription_tier,
          subscription_status,
          trial_ends_at,
          max_users,
          current_users_count
        )
      `)
      .eq('user_id', userId)
      .eq('invitation_status', 'active');

    if (memberError) {
      console.error('Error fetching user memberships:', memberError);
      return {
        type: USER_TYPES.FREE_USER,
        isGodMode: false,
        isAdmin: false,
        isSeatedUser: false,
        canManageAgency: false,
        canManageBilling: false,
        canEditAnything: false,
        unlimited: false,
        tier: 'free'
      };
    }

    // 3. Determine user type based on memberships
    if (!memberships || memberships.length === 0) {
      // No agency memberships - FREE USER
      return {
        type: USER_TYPES.FREE_USER,
        isGodMode: false,
        isAdmin: false,
        isSeatedUser: false,
        canManageAgency: false,
        canManageBilling: false,
        canEditAnything: false,
        unlimited: false,
        tier: 'free',
        agencies: []
      };
    }

    // 4. Check if user is admin of any agency
    const adminMemberships = memberships.filter(m => m.role === 'admin');

    if (adminMemberships.length > 0) {
      // User is AGENCY ADMIN
      const primaryAgency = adminMemberships[0].agencies;
      const subscriptionStatus = primaryAgency.subscription_status;
      const tier = primaryAgency.subscription_tier;

      // Check if trial
      const isOnTrial = subscriptionStatus === SUBSCRIPTION_STATUS.TRIAL;
      const trialEnded = primaryAgency.trial_ends_at
        ? new Date(primaryAgency.trial_ends_at) < new Date()
        : false;

      return {
        type: isOnTrial ? USER_TYPES.TRIAL_USER : USER_TYPES.AGENCY_ADMIN,
        isGodMode: false,
        isAdmin: true,
        isSeatedUser: false,
        canManageAgency: true,
        canManageBilling: true,
        canEditAnything: true,
        unlimited: false,
        tier: tier || 'sales',
        subscriptionStatus,
        trialEnded,
        agencies: adminMemberships.map(m => ({
          id: m.agencies.id,
          name: m.agencies.name,
          role: m.role,
          tier: m.agencies.subscription_tier,
          status: m.agencies.subscription_status,
          maxUsers: m.agencies.max_users,
          currentUsers: m.agencies.current_users_count
        })),
        primaryAgency: {
          id: primaryAgency.id,
          name: primaryAgency.name,
          tier: primaryAgency.subscription_tier,
          status: primaryAgency.subscription_status,
          maxUsers: primaryAgency.max_users,
          currentUsers: primaryAgency.current_users_count
        }
      };
    }

    // 5. User is only a member (SEATED USER)
    const primaryMembership = memberships[0];
    return {
      type: USER_TYPES.SEATED_USER,
      isGodMode: false,
      isAdmin: false,
      isSeatedUser: true,
      canManageAgency: false,
      canManageBilling: false,
      canEditAnything: false,
      unlimited: false,
      tier: primaryMembership.agencies.subscription_tier,
      role: primaryMembership.role,
      permissions: primaryMembership.permissions,
      agencies: memberships.map(m => ({
        id: m.agencies.id,
        name: m.agencies.name,
        role: m.role,
        permissions: m.permissions,
        tier: m.agencies.subscription_tier
      })),
      primaryAgency: {
        id: primaryMembership.agencies.id,
        name: primaryMembership.agencies.name,
        tier: primaryMembership.agencies.subscription_tier,
        role: primaryMembership.role,
        permissions: primaryMembership.permissions
      }
    };

  } catch (error) {
    console.error('Error determining user type:', error);
    throw error;
  }
}

/**
 * Check if user is an agency admin
 * @param {string} userId - User ID
 * @param {string} agencyId - Agency ID
 * @returns {Promise<boolean>}
 */
export async function isAgencyAdmin(userId, agencyId) {
  try {
    const { data, error } = await supabaseServer
      .from('agency_members')
      .select('role')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('role', 'admin')
      .eq('invitation_status', 'active')
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if user can edit resources in an agency
 * Seated users (non-admins) have read-only access
 * @param {string} userId - User ID
 * @param {string} agencyId - Agency ID
 * @returns {Promise<boolean>}
 */
export async function canEditInAgency(userId, agencyId) {
  try {
    // Check if user is admin or has edit permissions
    const { data, error } = await supabaseServer
      .from('agency_members')
      .select('role, permissions')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (error || !data) {
      return false;
    }

    // Admins can always edit
    if (data.role === 'admin') {
      return true;
    }

    // Members and viewers are read-only (seated users)
    return false;
  } catch (error) {
    console.error('Error checking edit permissions:', error);
    return false;
  }
}

/**
 * Check if agency can add more seats
 * @param {string} agencyId - Agency ID
 * @returns {Promise<Object>} Seat availability info
 */
export async function checkSeatAvailability(agencyId) {
  try {
    const { data: agency, error } = await supabaseServer
      .from('agencies')
      .select('max_users, current_users_count, subscription_tier, subscription_status')
      .eq('id', agencyId)
      .single();

    if (error || !agency) {
      return {
        canAddSeats: false,
        availableSeats: 0,
        maxSeats: 0,
        currentSeats: 0,
        error: 'Agency not found'
      };
    }

    const availableSeats = agency.max_users - agency.current_users_count;
    const canAddSeats = availableSeats > 0;

    // Calculate cost for additional seats beyond the 3 free seats
    const freeSeats = 3;
    const paidSeats = Math.max(0, agency.current_users_count - freeSeats);
    const costPerSeat = 12; // $12/month per seat

    return {
      canAddSeats,
      availableSeats,
      maxSeats: agency.max_users,
      currentSeats: agency.current_users_count,
      freeSeats,
      paidSeats,
      costPerSeat,
      monthlyCost: paidSeats * costPerSeat,
      tier: agency.subscription_tier,
      status: agency.subscription_status
    };
  } catch (error) {
    console.error('Error checking seat availability:', error);
    throw error;
  }
}

/**
 * Calculate seat pricing for an agency
 * First 3 seats are free, then $12/month per additional seat
 * @param {number} totalSeats - Total number of seats needed
 * @returns {Object} Pricing breakdown
 */
export function calculateSeatPricing(totalSeats) {
  const freeSeats = 3;
  const costPerSeat = 12;

  if (totalSeats <= freeSeats) {
    return {
      totalSeats,
      freeSeats: totalSeats,
      paidSeats: 0,
      costPerSeat,
      monthlyCost: 0,
      breakdown: `${totalSeats} seats (all free)`
    };
  }

  const paidSeats = totalSeats - freeSeats;
  const monthlyCost = paidSeats * costPerSeat;

  return {
    totalSeats,
    freeSeats,
    paidSeats,
    costPerSeat,
    monthlyCost,
    breakdown: `${freeSeats} free seats + ${paidSeats} paid seats @ $${costPerSeat}/mo = $${monthlyCost}/mo`
  };
}

/**
 * Get user's effective permissions in an agency
 * @param {string} userId - User ID
 * @param {string} agencyId - Agency ID
 * @returns {Promise<Object>} User permissions
 */
export async function getUserPermissions(userId, agencyId) {
  try {
    const { data, error } = await supabaseServer
      .from('agency_members')
      .select('role, permissions')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    // If admin, grant all permissions
    if (data.role === 'admin') {
      return {
        role: 'admin',
        isAdmin: true,
        canEdit: true,
        canDelete: true,
        canManage: true,
        permissions: {
          // All permissions set to true for admin
          can_view_dashboard: true,
          can_view_leads: true,
          can_edit_leads: true,
          can_delete_leads: true,
          can_view_contacts: true,
          can_edit_contacts: true,
          can_delete_contacts: true,
          can_view_opportunities: true,
          can_edit_opportunities: true,
          can_view_activities: true,
          can_view_meetings: true,
          can_manage_meetings: true,
          can_view_forms: true,
          can_manage_forms: true,
          can_view_campaigns: true,
          can_manage_campaigns: true,
          can_view_workflows: true,
          can_manage_workflows: true,
          can_view_calendar: true,
          can_view_reports: true,
          can_manage_team: true,
          can_manage_billing: true,
          can_manage_agency_settings: true,
          can_access_api: true,
          can_manage_white_label: true
        }
      };
    }

    // For members and viewers (seated users), return limited permissions
    return {
      role: data.role,
      isAdmin: false,
      canEdit: false, // Seated users are read-only
      canDelete: false,
      canManage: false,
      permissions: {
        // Only view permissions for seated users
        can_view_dashboard: data.permissions?.can_view_dashboard ?? true,
        can_view_leads: data.permissions?.can_view_leads ?? true,
        can_edit_leads: false, // Always false for seated users
        can_delete_leads: false,
        can_view_contacts: data.permissions?.can_view_contacts ?? true,
        can_edit_contacts: false,
        can_delete_contacts: false,
        can_view_opportunities: data.permissions?.can_view_opportunities ?? true,
        can_edit_opportunities: false,
        can_view_activities: data.permissions?.can_view_activities ?? true,
        can_view_meetings: data.permissions?.can_view_meetings ?? true,
        can_manage_meetings: false,
        can_view_forms: data.permissions?.can_view_forms ?? true,
        can_manage_forms: false,
        can_view_campaigns: data.permissions?.can_view_campaigns ?? true,
        can_manage_campaigns: false,
        can_view_workflows: data.permissions?.can_view_workflows ?? true,
        can_manage_workflows: false,
        can_view_calendar: data.permissions?.can_view_calendar ?? true,
        can_view_reports: data.permissions?.can_view_reports ?? true,
        can_manage_team: false,
        can_manage_billing: false,
        can_manage_agency_settings: false,
        can_access_api: false,
        can_manage_white_label: false
      }
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    throw error;
  }
}

/**
 * Check if user has beta access (Beta or Developer user type)
 * @param {string} userEmail - User email
 * @returns {boolean} True if user has beta access
 */
export function hasBetaAccess(userEmail) {
  if (!userEmail) return false;

  const email = userEmail.toLowerCase();

  // God mode users always have beta access
  if (GOD_MODE_USERS.includes(email)) {
    return true;
  }

  // Check if user is in beta or developer lists
  return BETA_USERS.includes(email) || DEVELOPER_USERS.includes(email);
}

/**
 * Check if user is a beta user
 * @param {string} userEmail - User email
 * @returns {boolean} True if user is a beta user
 */
export function isBetaUser(userEmail) {
  if (!userEmail) return false;
  return BETA_USERS.includes(userEmail.toLowerCase());
}

/**
 * Check if user is a developer user
 * @param {string} userEmail - User email
 * @returns {boolean} True if user is a developer user
 */
export function isDeveloperUser(userEmail) {
  if (!userEmail) return false;
  return DEVELOPER_USERS.includes(userEmail.toLowerCase());
}

/**
 * Check if user is a god mode user (configured via GOD_MODE_EMAILS env var)
 * @param {string} userEmail - User email
 * @returns {boolean} True if user is a god mode user
 */
export function isGodModeUser(userEmail) {
  if (!userEmail) return false;
  return GOD_MODE_USERS.includes(userEmail.toLowerCase());
}

export default {
  USER_TYPES,
  SUBSCRIPTION_STATUS,
  GOD_MODE_USERS,
  BETA_USERS,
  DEVELOPER_USERS,
  getUserType,
  isAgencyAdmin,
  canEditInAgency,
  checkSeatAvailability,
  calculateSeatPricing,
  getUserPermissions,
  hasBetaAccess,
  isBetaUser,
  isDeveloperUser
};
