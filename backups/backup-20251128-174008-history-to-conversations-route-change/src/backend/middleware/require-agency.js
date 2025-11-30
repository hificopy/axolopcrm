import { supabaseServer } from '../config/supabase-auth.js';

/**
 * Middleware to extract and validate agency_id from requests
 *
 * This middleware:
 * 1. Extracts agency_id from headers, query params, or body
 * 2. Validates that the user is a member of the agency
 * 3. Attaches agency_id and membership info to req object
 * 4. Enforces that all data operations are scoped to an agency
 *
 * Usage:
 *   router.get('/leads', authenticateUser, requireAgency, async (req, res) => {
 *     const agencyId = req.agency.id;
 *     const userRole = req.agency.role;
 *     // ... query with agency_id filter
 *   });
 */
export async function requireAgency(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    // Extract agency_id from multiple sources (in order of priority)
    const agencyId =
      req.headers['x-agency-id'] ||  // Header (preferred for API calls)
      req.query.agency_id ||           // Query param (for GET requests)
      req.body?.agency_id;             // Body (for POST/PUT requests)

    if (!agencyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'agency_id is required. Please select an agency to continue.',
        code: 'AGENCY_REQUIRED'
      });
    }

    // Validate that user is a member of this agency
    const { data: membership, error } = await supabaseServer
      .from('agency_members')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (error || !membership) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this agency',
        code: 'AGENCY_ACCESS_DENIED'
      });
    }

    // Attach agency info to request for use in route handlers
    req.agency = {
      id: agencyId,
      role: membership.role,
      permissions: membership.permissions || {},
      membership: membership
    };

    next();
  } catch (error) {
    console.error('Agency middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate agency access'
    });
  }
}

/**
 * Optional agency middleware - doesn't require agency_id but validates if provided
 * Useful for routes that can work with or without an agency
 */
export async function optionalAgency(req, res, next) {
  try {
    const userId = req.user?.id;
    const agencyId =
      req.headers['x-agency-id'] ||
      req.query.agency_id ||
      req.body?.agency_id;

    // If no agency_id provided, skip validation
    if (!agencyId || !userId) {
      req.agency = null;
      return next();
    }

    // Validate if agency_id is provided
    const { data: membership, error } = await supabaseServer
      .from('agency_members')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('user_id', userId)
      .eq('invitation_status', 'active')
      .single();

    if (error || !membership) {
      req.agency = null;
      return next();
    }

    req.agency = {
      id: agencyId,
      role: membership.role,
      permissions: membership.permissions || {},
      membership: membership
    };

    next();
  } catch (error) {
    console.error('Optional agency middleware error:', error);
    req.agency = null;
    next();
  }
}

/**
 * Helper function to add agency filter to Supabase query
 * Usage:
 *   let query = supabase.from('leads').select('*');
 *   query = applyAgencyFilter(query, req.agency.id);
 *   const { data } = await query;
 */
export function applyAgencyFilter(query, agencyId) {
  if (!agencyId) {
    throw new Error('agency_id is required for data queries');
  }
  return query.eq('agency_id', agencyId);
}

/**
 * Middleware to require admin role in current agency
 */
export async function requireAgencyAdmin(req, res, next) {
  if (!req.agency) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Agency context required'
    });
  }

  // God mode bypasses all restrictions
  if (req.user.email === 'axolopcrm@gmail.com') {
    return next();
  }

  if (req.agency.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin role required for this operation'
    });
  }

  next();
}

/**
 * Middleware to check specific permission
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.agency) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Agency context required'
      });
    }

    // God mode and admins have all permissions
    if (req.user.email === 'axolopcrm@gmail.com' || req.agency.role === 'admin') {
      return next();
    }

    // Check specific permission
    if (!req.agency.permissions[permission]) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Permission '${permission}' required for this operation`
      });
    }

    next();
  };
}
