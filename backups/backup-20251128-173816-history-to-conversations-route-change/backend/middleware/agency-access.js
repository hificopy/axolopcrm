import { supabaseServer } from "../config/supabase-auth.js";
import {
  getUserType,
  getUserPermissions,
  canEditInAgency,
  isGodModeUser,
} from "../services/user-type-service.js";
import {
  resolvePermissions,
  getSectionAccess,
  isGodModeUser as isGodMode,
} from "../services/permission-resolver.js";
import {
  sendErrorResponse,
  handleSupabaseError,
} from "../utils/error-handler.js";

/**
 * Middleware to check if user has access to an agency
 * Expects agencyId in req.params or req.body or req.query or X-Agency-ID header
 * Attaches userType, permissions, and member info to request
 *
 * New hierarchy support:
 * - member_type: 'owner' | 'admin' | 'seated_user'
 * - owner: Full control including billing
 * - admin: Can manage team and roles (not billing)
 * - seated_user: Has role-based permissions
 */
export const requireAgencyAccess = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Get agency ID from various sources
    const agencyId =
      req.headers["x-agency-id"] ||
      req.params.agencyId ||
      req.params.id ||
      req.body.agency_id ||
      req.query.agency_id;

    if (!agencyId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Agency ID is required",
      });
    }

    // ROOT CAUSE FIX: Validate god mode bypass and add fallback
    const isGodModeUser = isGodMode(userEmail);
    if (isGodModeUser) {
      // Additional validation for god mode
      if (!userEmail || !process.env.GOD_MODE_EMAILS) {
        console.warn(
          "God mode enabled but email or environment not properly configured",
        );
      }

      // ROOT CAUSE FIX: Use maybeSingle() instead of .single() to prevent internal errors
      const { data: agency, error } = await supabaseServer
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .maybeSingle();

      if (error) {
        return handleSupabaseError(
          res,
          error,
          "Agency lookup (god mode)",
          req.requestId,
        );
      }

      if (!agency) {
        return sendErrorResponse(
          res,
          404,
          "Not Found",
          "Agency not found",
          { agencyId, godMode: true },
          req.requestId,
        );
      }

      if (!agency) {
        return sendErrorResponse(
          res,
          404,
          "Not Found",
          "Agency not found",
          { agencyId, godMode: true },
          req.requestId,
        );
      }

      req.agency = agency;
      req.agencyId = agencyId;
      req.member = { member_type: "owner", role: "admin" };
      req.memberType = "owner";
      req.isOwner = true;
      req.isAdmin = true;
      req.isGodMode = true;
      req.permissions = {}; // Will be resolved as needed
      return next();
    }

    // ROOT CAUSE FIX: Use maybeSingle() and proper error handling
    const { data: membership, error } = await supabaseServer
      .from("agency_members")
      .select("*")
      .eq("agency_id", agencyId)
      .eq("user_id", userId)
      .eq("invitation_status", "active")
      .maybeSingle();

    if (error) {
      // Use standardized error handling for ALL error types including internal PostgREST errors
      return handleSupabaseError(
        res,
        error,
        "Agency membership check",
        req.requestId,
      );
    }

    if (!membership) {
      return sendErrorResponse(
        res,
        403,
        "Forbidden",
        "You do not have access to this agency",
        { agencyId, userId, reason: "no_active_membership" },
        req.requestId,
      );
    }

    // ROOT CAUSE FIX: Use maybeSingle() for agency lookup
    const { data: agency, error: agencyError } = await supabaseServer
      .from("agencies")
      .select("*")
      .eq("id", agencyId)
      .maybeSingle();

    if (agencyError) {
      return handleSupabaseError(
        res,
        agencyError,
        "Agency lookup",
        req.requestId,
      );
    }

    if (!agency) {
      return sendErrorResponse(
        res,
        404,
        "Not Found",
        "Agency not found",
        { agencyId },
        req.requestId,
      );
    }

    // Determine member type (support both old role field and new member_type)
    const memberType =
      membership.member_type ||
      (membership.role === "admin" ? "admin" : "seated_user");

    // Get legacy user type and permissions
    const userType = await getUserType(userId, userEmail);

    // Resolve permissions using new Discord-style system
    let resolvedPermissions = {};
    try {
      resolvedPermissions = await resolvePermissions(membership.id, userEmail);
    } catch (e) {
      console.error("Error resolving permissions:", e);
      resolvedPermissions = await getUserPermissions(userId, agencyId);
    }

    // Attach to request
    req.agency = agency;
    req.agencyMembership = membership;
    req.member = membership;
    req.agencyId = agencyId;
    req.memberType = memberType;
    req.userType = userType;
    req.permissions = resolvedPermissions;

    // Hierarchy flags
    req.isOwner = memberType === "owner" || agency?.owner_id === userId;
    req.isAdmin =
      memberType === "owner" ||
      memberType === "admin" ||
      membership.role === "admin";
    req.isSeatedUser =
      memberType === "seated_user" && membership.role !== "admin";
    req.isAgencyAdmin = req.isAdmin; // Legacy support

    next();
  } catch (error) {
    console.error("Agency access check error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify agency access",
    });
  }
};

/**
 * Middleware to check if user is admin of an agency
 * Supports new hierarchy: owner and admin both pass this check
 */
export const requireAgencyAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Check god mode
    if (isGodMode(userEmail)) {
      return next();
    }

    // If already checked via requireAgencyAccess, use that
    if (req.isAdmin || req.isOwner) {
      return next();
    }

    // Get agency ID
    const agencyId =
      req.headers["x-agency-id"] ||
      req.params.agencyId ||
      req.params.id ||
      req.body.agency_id ||
      req.query.agency_id ||
      req.agencyId;

    if (!agencyId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Agency ID is required",
      });
    }

    // Check membership and type
    const { data: membership, error: memberError } = await supabaseServer
      .from("agency_members")
      .select("member_type, role")
      .eq("agency_id", agencyId)
      .eq("user_id", userId)
      .eq("invitation_status", "active")
      .single();

    if (memberError) {
      if (memberError.code === "PGRST116") {
        return res.status(403).json({
          error: "Forbidden",
          message: "You do not have access to this agency",
        });
      }
      console.error("Agency admin membership check error:", memberError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify agency membership",
      });
    }

    if (!membership) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have access to this agency",
      });
    }

    // Check if admin or owner
    const memberType =
      membership.member_type ||
      (membership.role === "admin" ? "admin" : "seated_user");
    const isAdminOrOwner =
      memberType === "owner" ||
      memberType === "admin" ||
      membership.role === "admin";

    if (!isAdminOrOwner) {
      // Fallback to RPC function for legacy support
      const { data: isAdmin, error } = await supabaseServer.rpc(
        "is_agency_admin",
        {
          p_user_id: userId,
          p_agency_id: agencyId,
        },
      );

      if (error || !isAdmin) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only agency admins can perform this action",
        });
      }
    }

    req.agencyId = agencyId;
    next();
  } catch (error) {
    console.error("Agency admin check error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify admin access",
    });
  }
};

/**
 * Middleware to check if user is OWNER of an agency
 * Only owners can access billing and transfer ownership
 * This is stricter than requireAgencyAdmin
 */
export const requireAgencyOwner = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Check god mode
    if (isGodMode(userEmail)) {
      req.isOwner = true;
      return next();
    }

    // If already checked via requireAgencyAccess, use that
    if (req.isOwner) {
      return next();
    }

    // Get agency ID
    const agencyId =
      req.headers["x-agency-id"] ||
      req.params.agencyId ||
      req.params.id ||
      req.body.agency_id ||
      req.query.agency_id ||
      req.agencyId;

    if (!agencyId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Agency ID is required",
      });
    }

    // Check if user is owner via member_type
    const { data: membership, error: memberError } = await supabaseServer
      .from("agency_members")
      .select("member_type")
      .eq("agency_id", agencyId)
      .eq("user_id", userId)
      .eq("invitation_status", "active")
      .single();

    if (memberError && memberError.code !== "PGRST116") {
      console.error("Agency owner membership check error:", memberError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify ownership",
      });
    }

    // Also check owner_id on agency
    const { data: agency, error: agencyError } = await supabaseServer
      .from("agencies")
      .select("owner_id")
      .eq("id", agencyId)
      .single();

    if (agencyError) {
      if (agencyError.code === "PGRST116") {
        return res.status(404).json({
          error: "Not Found",
          message: "Agency not found",
        });
      }
      console.error("Agency owner lookup error:", agencyError);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify agency ownership",
      });
    }

    const isOwner =
      membership?.member_type === "owner" || agency?.owner_id === userId;

    if (!isOwner) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the agency owner can perform this action",
      });
    }

    req.agencyId = agencyId;
    req.isOwner = true;
    next();
  } catch (error) {
    console.error("Agency owner check error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify owner access",
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
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      // Get agency ID
      const agencyId =
        req.params.agencyId ||
        req.body.agency_id ||
        req.query.agency_id ||
        req.agencyId;

      if (!agencyId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Agency ID is required",
        });
      }

      // Check if user has the permission
      const { data: hasPermission, error } = await supabaseServer.rpc(
        "user_has_permission",
        {
          p_user_id: userId,
          p_agency_id: agencyId,
          p_permission: permission,
        },
      );

      if (error) {
        console.error("Permission check error:", error);
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to verify permission",
        });
      }

      if (!hasPermission) {
        return res.status(403).json({
          error: "Forbidden",
          message: `You do not have permission to ${permission.replace("can_", "").replace(/_/g, " ")}`,
        });
      }

      req.agencyId = agencyId;
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify permission",
      });
    }
  };
};

/**
 * Middleware: Extract agency context from request headers
 * Looks for X-Agency-ID header and sets req.agencyId
 * This should be applied before requireEditPermissions
 */
export const extractAgencyContext = (req, res, next) => {
  try {
    // Extract agency ID from multiple possible sources
    const agencyId =
      req.headers["x-agency-id"] || // From frontend API interceptor
      req.params.agencyId || // From URL params
      req.body.agency_id || // From request body
      req.query.agency_id || // From query params
      req.agencyId; // Already set

    if (agencyId) {
      req.agencyId = agencyId;
    }

    next();
  } catch (error) {
    console.error("Error extracting agency context:", error);
    next(); // Continue even if extraction fails - agency ID is optional for some routes
  }
};

/**
 * Middleware to require edit/write permissions
 * Blocks seated users (non-admins) from modifying data
 * Use this on PUT, POST, DELETE routes that modify agency data
 */
export const requireEditPermissions = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Get agency ID from req.agencyId (set by extractAgencyContext middleware)
    const agencyId = req.agencyId;

    // If no agency ID, allow operation (user is working with personal data)
    // This allows users without agencies or when not in agency context to work normally
    if (!agencyId) {
      return next();
    }

    // Check if user can edit in this agency
    const canEdit = await canEditInAgency(userId, agencyId);

    if (!canEdit) {
      return res.status(403).json({
        error: "Forbidden",
        message:
          "You do not have permission to edit in this agency. Only agency admins can make changes.",
        isReadOnly: true,
      });
    }

    next();
  } catch (error) {
    console.error("Edit permission check error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify edit permissions",
    });
  }
};

/**
 * Middleware to attach current agency context to request
 * This is useful for routes that work with the user's current/active agency
 * Also attaches user type information
 */
export const attachAgencyContext = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) {
      return next(); // Not authenticated, skip
    }

    // Get user type
    try {
      const userType = await getUserType(userId, userEmail);
      req.userType = userType;
    } catch (error) {
      console.error("Error getting user type:", error);
    }

    // Get user's default/primary agency
    const { data: agencies, error } = await supabaseServer.rpc(
      "get_user_agencies",
      { p_user_id: userId },
    );

    if (error || !agencies || agencies.length === 0) {
      req.userAgencies = [];
      return next();
    }

    // Attach agencies to request
    req.userAgencies = agencies;
    req.primaryAgency = agencies[0]; // First agency is primary

    next();
  } catch (error) {
    console.error("Attach agency context error:", error);
    next(); // Don't block request if context attachment fails
  }
};

/**
 * Middleware to check subscription tier and enforce limits
 * Usage: requireSubscriptionTier('professional')
 */
export const requireSubscriptionTier = (minTier) => {
  const tierLevels = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
    god_mode: 999,
  };

  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      // God mode users bypass all checks (configured via GOD_MODE_EMAILS env var)
      if (isGodModeUser(userEmail)) {
        req.isGodMode = true;
        return next();
      }

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      // Get agency ID
      const agencyId =
        req.params.agencyId ||
        req.body.agency_id ||
        req.query.agency_id ||
        req.agencyId;

      if (!agencyId) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Agency ID is required",
        });
      }

      // Get agency subscription
      const { data: agency, error } = await supabaseServer
        .from("agencies")
        .select("subscription_tier, subscription_status")
        .eq("id", agencyId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return res.status(404).json({
            error: "Not Found",
            message: "Agency not found",
          });
        }
        console.error("Agency subscription check error:", error);
        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to verify agency subscription",
        });
      }

      if (!agency) {
        return res.status(404).json({
          error: "Not Found",
          message: "Agency not found",
        });
      }

      // Check if subscription is active
      if (agency.subscription_status !== "active") {
        return res.status(402).json({
          error: "Payment Required",
          message: "Agency subscription is not active",
        });
      }

      // Check tier level
      const currentLevel = tierLevels[agency.subscription_tier] || 0;
      const requiredLevel = tierLevels[minTier] || 0;

      if (currentLevel < requiredLevel) {
        return res.status(403).json({
          error: "Forbidden",
          message: `This feature requires ${minTier} tier or higher`,
          upgrade_required: true,
          current_tier: agency.subscription_tier,
          required_tier: minTier,
        });
      }

      req.subscriptionTier = agency.subscription_tier;
      next();
    } catch (error) {
      console.error("Subscription tier check error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify subscription tier",
      });
    }
  };
};
