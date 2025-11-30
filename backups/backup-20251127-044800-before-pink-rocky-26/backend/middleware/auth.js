import { supabaseServer } from "../config/supabase-auth.js";
import { sendErrorResponse } from "../utils/error-handler.js";
import tokenCache from "../services/token-cache.js";

// Authentication middleware with token caching
const authenticateUser = async (req, res, next) => {
  try {
    console.log("[AUTH] 🔍 Authenticating request to:", req.path);

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    console.log("[AUTH] Has authorization header:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[AUTH] ❌ No authorization header found");
      return sendErrorResponse(
        res,
        401,
        "Unauthorized",
        "Authentication token is invalid or missing",
        {},
        req.requestId,
      );
    }

    const token = authHeader.substring(7);
    console.log("[AUTH] Token extracted, length:", token.length);
    console.log("[AUTH] Token preview:", token.substring(0, 20) + "...");

    // Check if supabaseServer is available
    if (!supabaseServer) {
      console.error(
        "[AUTH] ❌ CRITICAL: supabaseServer is null! Service role key not configured!",
      );
      return sendErrorResponse(
        res,
        500,
        "Server Configuration Error",
        "Authentication service not properly configured",
        {},
        req.requestId,
      );
    }
    console.log("[AUTH] ✅ supabaseServer exists");

    // Use token cache for validation with deduplication
    const validationFunction = async (token) => {
      console.log("[AUTH] 📡 Calling supabaseServer.auth.getUser()...");
      const {
        data: { user },
        error,
      } = await supabaseServer.auth.getUser(token);

      if (error || !user) {
        console.error("[AUTH] ❌ Authentication failed!");
        console.error("[AUTH] Error:", error?.message || "No user found");
        console.error("[AUTH] Error details:", JSON.stringify(error, null, 2));
        console.error(
          "[AUTH] Token (first 20 chars):",
          token?.substring(0, 20),
        );
        throw new Error(error?.message || "Invalid token");
      }

      return { user };
    };

    // Validate token with caching and deduplication
    const result = await tokenCache.deduplicateValidation(
      token,
      validationFunction,
    );

    console.log("[AUTH] Response:", {
      hasUser: !!result.user,
      userId: result.user?.id,
      cached: result.cached || false,
    });

    // Verify that the user object has the necessary fields
    if (!result.user?.id) {
      console.error(
        "Invalid user object: missing ID after successful authentication",
      );
      return sendErrorResponse(
        res,
        401,
        "Unauthorized",
        "Invalid user data",
        {},
        req.requestId,
      );
    }

    // Attach user info to request
    req.user = {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role || result.user.user_metadata?.role || "USER",
    };

    // Add session info for rate limiting
    req.sessionId = req.headers["x-session-id"] || `unknown_${Date.now()}`;

    console.log(
      "[AUTH] ✅ User authenticated:",
      result.user.id,
      "(cached:",
      result.cached,
      ")",
    );

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    // Provide a more general error response to avoid exposing internal details
    return sendErrorResponse(
      res,
      401,
      "Unauthorized",
      "Authentication failed",
      { originalError: error.message },
      req.requestId,
    );
  }
};

// Optional authentication middleware (doesn't fail if no auth)
const optionalAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);

    // Get user using supabase server client (service role)
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(token);
    if (!error && user) {
      // User authenticated, attach to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || "USER",
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    console.warn("Optional auth failed:", error.message);
    next();
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const userRole = req.user.role.toLowerCase();
    const allowedRoles = Array.isArray(roles)
      ? roles.map((r) => r.toLowerCase())
      : [roles.toLowerCase()];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export { authenticateUser, optionalAuth, requireRole };
