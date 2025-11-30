import { supabaseServer } from '../config/supabase-auth.js';

/**
 * Middleware to check if user has access to an agency
 * Expects agencyId in req.params or req.body or req.query
 */
export const requireAgencyAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Get agency ID from various sources
    const agencyId = req.params.agencyId || req.body.agency_id || req.query.agency_id;

    if (!agencyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Agency ID is required'
      });
    }

    // Check if user is a member of this agency
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
        message: 'You do not have access to this agency'
      });
    }

    // Attach agency membership to request
    req.agencyMembership = membership;
    req.agencyId = agencyId;

    next();
  } catch (error) {
    console.error('Agency access check error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify agency access'
    });
  }
};

/**
 * Middleware to check if user is admin of an agency
 */
export const requireAgencyAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Get agency ID
    const agencyId = req.params.agencyId || req.body.agency_id || req.query.agency_id || req.agencyId;

    if (!agencyId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Agency ID is required'
      });
    }

    // Check if user is admin
    const { data: isAdmin, error } = await supabaseServer
      .rpc('is_agency_admin', {
        p_user_id: userId,
        p_agency_id: agencyId
      });

    if (error) {
      console.error('Admin check error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify admin status'
      });
    }

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only agency admins can perform this action'
      });
    }

    req.agencyId = agencyId;
    next();
  } catch (error) {
    console.error('Agency admin check error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify admin access'
    });
  }
};

/**
 * Middleware to check if user has a specific permission
 * Usage: requirePermission('can_manage_leads')
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Get agency ID
      const agencyId = req.params.agencyId || req.body.agency_id || req.query.agency_id || req.agencyId;

      if (!agencyId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Agency ID is required'
        });
      }

      // Check if user has the permission
      const { data: hasPermission, error } = await supabaseServer
        .rpc('user_has_permission', {
          p_user_id: userId,
          p_agency_id: agencyId,
          p_permission: permission
        });

      if (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to verify permission'
        });
      }

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `You do not have permission to ${permission.replace('can_', '').replace(/_/g, ' ')}`
        });
      }

      req.agencyId = agencyId;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify permission'
      });
    }
  };
};

/**
 * Middleware to attach current agency context to request
 * This is useful for routes that work with the user's current/active agency
 */
export const attachAgencyContext = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(); // Not authenticated, skip
    }

    // Get user's default/primary agency
    const { data: agencies, error } = await supabaseServer
      .rpc('get_user_agencies', { p_user_id: userId });

    if (error || !agencies || agencies.length === 0) {
      req.userAgencies = [];
      return next();
    }

    // Attach agencies to request
    req.userAgencies = agencies;
    req.primaryAgency = agencies[0]; // First agency is primary

    next();
  } catch (error) {
    console.error('Attach agency context error:', error);
    next(); // Don't block request if context attachment fails
  }
};

/**
 * Middleware to check subscription tier and enforce limits
 * Usage: requireSubscriptionTier('professional')
 */
export const requireSubscriptionTier = (minTier) => {
  const tierLevels = {
    'free': 0,
    'starter': 1,
    'professional': 2,
    'enterprise': 3,
    'god_mode': 999
  };

  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      // God mode users bypass all checks
      if (userEmail === 'axolopcrm@gmail.com') {
        req.isGodMode = true;
        return next();
      }

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Get agency ID
      const agencyId = req.params.agencyId || req.body.agency_id || req.query.agency_id || req.agencyId;

      if (!agencyId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Agency ID is required'
        });
      }

      // Get agency subscription
      const { data: agency, error } = await supabaseServer
        .from('agencies')
        .select('subscription_tier, subscription_status')
        .eq('id', agencyId)
        .single();

      if (error || !agency) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Agency not found'
        });
      }

      // Check if subscription is active
      if (agency.subscription_status !== 'active') {
        return res.status(402).json({
          error: 'Payment Required',
          message: 'Agency subscription is not active'
        });
      }

      // Check tier level
      const currentLevel = tierLevels[agency.subscription_tier] || 0;
      const requiredLevel = tierLevels[minTier] || 0;

      if (currentLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `This feature requires ${minTier} tier or higher`,
          upgrade_required: true,
          current_tier: agency.subscription_tier,
          required_tier: minTier
        });
      }

      req.subscriptionTier = agency.subscription_tier;
      next();
    } catch (error) {
      console.error('Subscription tier check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify subscription tier'
      });
    }
  };
};
