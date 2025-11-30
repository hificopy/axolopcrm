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

export default router;
