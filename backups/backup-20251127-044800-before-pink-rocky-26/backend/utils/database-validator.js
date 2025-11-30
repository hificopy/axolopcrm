import { supabaseServer } from "../config/supabase-auth.js";
import { sendErrorResponse } from "./error-handler.js";

/**
 * Database validation utilities to prevent ROOT CAUSE errors
 * Ensures data integrity before operations
 */

/**
 * Validates that an agency exists and is accessible
 * @param {string} agencyId - Agency ID to validate
 * @param {string} userId - User ID making the request
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{valid: boolean, agency?: any, error?: any}>}
 */
export const validateAgencyExists = async (
  agencyId,
  userId = null,
  requestId = null,
) => {
  try {
    const { data: agency, error } = await supabaseServer
      .from("agencies")
      .select("id, name, subscription_tier, subscription_status, owner_id")
      .eq("id", agencyId)
      .maybeSingle();

    if (error) {
      console.error(`Agency validation error [${requestId}]:`, error);
      return { valid: false, error };
    }

    if (!agency) {
      console.warn(`Agency not found [${requestId}]: ${agencyId}`);
      return {
        valid: false,
        error: { code: "AGENCY_NOT_FOUND", message: "Agency not found" },
      };
    }

    return { valid: true, agency };
  } catch (err) {
    console.error(`Agency validation exception [${requestId}]:`, err);
    return { valid: false, error: err };
  }
};

/**
 * Validates user membership in an agency
 * @param {string} userId - User ID to validate
 * @param {string} agencyId - Agency ID to check membership for
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{valid: boolean, membership?: any, error?: any}>}
 */
export const validateAgencyMembership = async (
  userId,
  agencyId,
  requestId = null,
) => {
  try {
    const { data: membership, error } = await supabaseServer
      .from("agency_members")
      .select(
        `
        id, role, member_type, invitation_status, permissions,
        agencies:agency_id (id, name, subscription_tier)
      `,
      )
      .eq("user_id", userId)
      .eq("agency_id", agencyId)
      .eq("invitation_status", "active")
      .maybeSingle();

    if (error) {
      console.error(`Membership validation error [${requestId}]:`, error);
      return { valid: false, error };
    }

    if (!membership) {
      console.warn(
        `No active membership found [${requestId}]: user ${userId} in agency ${agencyId}`,
      );
      return {
        valid: false,
        error: {
          code: "NO_MEMBERSHIP",
          message: "No active agency membership",
        },
      };
    }

    return { valid: true, membership };
  } catch (err) {
    console.error(`Membership validation exception [${requestId}]:`, err);
    return { valid: false, error: err };
  }
};

/**
 * Validates that a user exists and is active
 * @param {string} userId - User ID to validate
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{valid: boolean, user?: any, error?: any}>}
 */
export const validateUserExists = async (userId, requestId = null) => {
  try {
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("id, email, user_metadata, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(`User validation error [${requestId}]:`, error);
      return { valid: false, error };
    }

    if (!user) {
      console.warn(`User not found [${requestId}]: ${userId}`);
      return {
        valid: false,
        error: { code: "USER_NOT_FOUND", message: "User not found" },
      };
    }

    return { valid: true, user };
  } catch (err) {
    console.error(`User validation exception [${requestId}]:`, err);
    return { valid: false, error: err };
  }
};

/**
 * Validates foreign key relationship before operations
 * @param {string} table - Table name
 * @param {string} column - Column name
 * @param {string} value - Value to check
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{valid: boolean, exists?: boolean, error?: any}>}
 */
export const validateForeignKey = async (
  table,
  column,
  value,
  requestId = null,
) => {
  try {
    const { data, error } = await supabaseServer
      .from(table)
      .select("id")
      .eq(column, value)
      .maybeSingle();

    if (error) {
      console.error(`Foreign key validation error [${requestId}]:`, error);
      return { valid: false, error };
    }

    const exists = !!data;
    return { valid: true, exists };
  } catch (err) {
    console.error(`Foreign key validation exception [${requestId}]:`, err);
    return { valid: false, error: err };
  }
};

/**
 * Middleware to validate agency context before processing requests
 * Prevents ROOT CAUSE errors by validating upfront
 */
export const validateAgencyContext = async (req, res, next) => {
  try {
    const { agencyId } = req;
    const userId = req.user?.id;
    const requestId = req.requestId;

    if (!agencyId) {
      return next(); // No agency context required
    }

    if (!userId) {
      return sendErrorResponse(
        res,
        401,
        "Unauthorized",
        "Authentication required",
        { requiresAuth: true },
        requestId,
      );
    }

    // Validate agency exists
    const agencyValidation = await validateAgencyExists(
      agencyId,
      userId,
      requestId,
    );
    if (!agencyValidation.valid) {
      if (agencyValidation.error?.code === "AGENCY_NOT_FOUND") {
        return sendErrorResponse(
          res,
          404,
          "Not Found",
          "Agency not found",
          { agencyId },
          requestId,
        );
      }
      return sendErrorResponse(
        res,
        500,
        "Internal Server Error",
        "Failed to validate agency",
        { agencyId, originalError: agencyValidation.error },
        requestId,
      );
    }

    // Validate user membership (unless god mode)
    const isGodMode = req.user?.email === process.env.GOD_MODE_EMAIL;
    if (!isGodMode) {
      const membershipValidation = await validateAgencyMembership(
        userId,
        agencyId,
        requestId,
      );
      if (!membershipValidation.valid) {
        if (membershipValidation.error?.code === "NO_MEMBERSHIP") {
          return sendErrorResponse(
            res,
            403,
            "Forbidden",
            "You do not have access to this agency",
            { agencyId, userId },
            requestId,
          );
        }
        return sendErrorResponse(
          res,
          500,
          "Internal Server Error",
          "Failed to validate agency membership",
          { agencyId, userId, originalError: membershipValidation.error },
          requestId,
        );
      }

      // Attach membership to request
      req.agencyMembership = membershipValidation.membership;
    }

    // Attach agency to request
    req.agency = agencyValidation.agency;

    next();
  } catch (error) {
    console.error("Agency context validation error:", error);
    return sendErrorResponse(
      res,
      500,
      "Internal Server Error",
      "Failed to validate request context",
      { originalError: error.message },
      req.requestId,
    );
  }
};

/**
 * Checks for common database schema issues that cause ROOT CAUSE errors
 * @param {string} requestId - Request ID for tracing
 * @returns {Promise<{healthy: boolean, issues: string[]}>}
 */
export const checkDatabaseHealth = async (requestId = null) => {
  const issues = [];

  try {
    // Check critical tables exist
    const criticalTables = [
      "users",
      "agencies",
      "agency_members",
      "contacts",
      "leads",
    ];

    for (const table of criticalTables) {
      const { error } = await supabaseServer.from(table).select("id").limit(1);

      if (error) {
        issues.push(`Table '${table}' issue: ${error.message}`);
      }
    }

    // Check RLS policies are working
    const { error: rlsError } = await supabaseServer
      .from("agencies")
      .select("id")
      .limit(1);

    if (rlsError && rlsError.code === "42501") {
      issues.push("RLS policies may be misconfigured");
    }

    return { healthy: issues.length === 0, issues };
  } catch (error) {
    console.error(`Database health check error [${requestId}]:`, error);
    return { healthy: false, issues: ["Database health check failed"] };
  }
};
