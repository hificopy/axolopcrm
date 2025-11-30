import express from "express";
import { supabaseServer } from "../config/supabase-auth.js";
import { authenticateUser } from "../middleware/auth.js";
import userPreferencesService from "../services/userPreferencesService.js";
import {
  hasBetaAccess,
  isBetaUser,
  isDeveloperUser,
} from "../services/user-type-service.js";
import sessionManager from "../services/session-manager.js";

const router = express.Router();

// ========================================
// USER PROFILE ROUTES
// ========================================

/**
 * GET /api/v1/users/me
 * Get current user's profile
 */
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile from database
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return res.status(404).json({
        error: "Not Found",
        message: "User profile not found",
      });
    }

    // Don't send sensitive data
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch user profile",
    });
  }
});

/**
 * POST /api/v1/users/login
 * User login endpoint
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Register session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const sessionInfo = {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      loginMethod: "email",
    };

    sessionManager.registerSession(sessionId, data.user.id, sessionInfo);

    res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          sessionId,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/v1/users/logout
 * Logout user from current session
 */
router.post("/logout", authenticateUser, async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"];

    if (sessionId) {
      sessionManager.unregisterSession(sessionId, "user_logout");
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/users/sessions
 * Get all sessions for current user
 */
router.get("/sessions", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const userSessions = sessionManager.getUserSessions(userId);

    res.json({
      success: true,
      data: {
        sessions: userSessions,
        count: userSessions.length,
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/v1/users/sessions/:sessionId
 * Logout specific session
 */
router.delete("/sessions/:sessionId", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    // Check if session belongs to user
    const session = sessionManager.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: "Session not found or not authorized",
      });
    }

    // Unregister session
    const unregisteredSession = sessionManager.unregisterSession(
      sessionId,
      "manual_logout",
    );

    res.json({
      success: true,
      data: {
        sessionId,
        message: "Session logged out successfully",
      },
    });
  } catch (error) {
    console.error("Logout session error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/v1/users/sessions
 * Logout user from all sessions
 */
router.delete("/sessions", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { includeCurrent = true, reason = "manual_logout_all" } = req.body;

    // Logout from all sessions
    const result = await sessionManager.logoutAllSessions(userId, {
      includeCurrent,
      reason,
      notifyOtherTabs: true,
    });

    res.json({
      success: true,
      data: {
        loggedOutSessions: result.loggedOutSessions,
        message: `Logged out from ${result.loggedOutSessions} sessions`,
      },
    });
  } catch (error) {
    console.error("Logout all sessions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/v1/users/me/settings
 * Get current user's settings
 */
router.get("/me/settings", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user settings from database
    const { data: settings, error } = await supabaseServer
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching user settings:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch user settings",
      });
    }

    // Return default settings if none exist
    const defaultSettings = {
      theme: "light",
      language: "en",
      timezone: "UTC",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profile_visibility: "public",
        activity_tracking: true,
      },
    };

    res.json({
      success: true,
      data: settings || defaultSettings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch user settings",
    });
  }
});

/**
 * PUT /api/v1/users/me/settings
 * Update current user's settings
 */
router.put("/me/settings", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

    // Upsert user settings
    const { data, error } = await supabaseServer
      .from("user_settings")
      .upsert({
        user_id: userId,
        settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update user settings",
      });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update user settings",
    });
  }
});

/**
 * GET /api/v1/users/me/activity
 * Get current user's activity log
 */
router.get("/me/activity", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    // Get user activity from database
    const { data: activities, error } = await supabaseServer
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error("Error fetching user activity:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch user activity",
      });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseServer
      .from("user_activity")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    res.json({
      success: true,
      data: activities || [],
      pagination: {
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch user activity",
    });
  }
});

/**
 * GET /api/v1/users/me/pinned-actions
 * Get user's pinned actions
 */
router.get("/me/pinned-actions", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's pinned actions from database
    const { data: pinnedActions, error } = await supabaseServer
      .from("user_preferences")
      .select("data")
      .eq("user_id", userId)
      .eq("key", "pinned_actions")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching pinned actions:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch pinned actions",
      });
    }

    res.json({
      success: true,
      data: pinnedActions?.data || [],
    });
  } catch (error) {
    console.error("Get pinned actions error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch pinned actions",
    });
  }
});

/**
 * GET /api/v1/users/me/sidebar-menu
 * Get user's sidebar menu preferences
 */
router.get("/me/sidebar-menu", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("[sidebar-menu] Fetching for user:", userId);

    // Get user's sidebar menu preferences from database
    const { data: sidebarMenu, error } = await supabaseServer
      .from("user_preferences")
      .select("data")
      .eq("user_id", userId)
      .eq("key", "sidebar_menu")
      .single();

    // PGRST116 = no rows found, which is fine - return default array
    if (error && error.code !== "PGRST116") {
      console.error("[sidebar-menu] Database error:", error);
      // Return default array instead of 500 to prevent app breakage
      return res.json({
        success: true,
        data: ["quick-search", "help"],
      });
    }

    console.log("[sidebar-menu] Success:", !!sidebarMenu);

    // Ensure we always return an array
    const menuData = sidebarMenu?.data;
    const responseData = Array.isArray(menuData) ? menuData : ["quick-search", "help"];

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[sidebar-menu] Unexpected error:", error);
    // Return default array instead of 500 to prevent app breakage
    res.json({
      success: true,
      data: ["quick-search", "help"],
    });
  }
});

/**
 * GET /api/v1/users/beta-access
 * Check if user has beta access
 */
router.get("/beta-access", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has beta access (you can implement your own logic here)
    // For now, check if user is in beta users list or has specific metadata
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("user_metadata")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking beta access:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to check beta access",
      });
    }

    const hasBetaAccess =
      user?.user_metadata?.beta_access === true ||
      user?.user_metadata?.role === "beta" ||
      isDeveloperUser(userId) ||
      isBetaUser(userId);

    res.json({
      success: true,
      data: {
        hasBetaAccess,
        betaFeatures: [
          "advanced-analytics",
          "custom-themes",
          "beta-workflows",
          "early-features",
        ],
      },
    });
  } catch (error) {
    console.error("Check beta access error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to check beta access",
    });
  }
});

export default router;
