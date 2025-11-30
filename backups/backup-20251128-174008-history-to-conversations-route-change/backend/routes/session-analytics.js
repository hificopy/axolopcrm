/**
 * 🚀 AXOLOP CRM - SESSION ANALYTICS API
 *
 * Provides comprehensive session analytics and insights
 * for monitoring multi-session behavior and system health.
 *
 * Features:
 * - Session analytics and metrics
 * - Multi-session insights
 * - Performance monitoring
 * - Security analytics
 * - Real-time session tracking
 */

import express from "express";
import sessionManager from "../services/session-manager.js";
import tokenCache from "../services/token-cache.js";
import requestDeduplicator from "../services/request-deduplicator.js";
import { authenticateUser } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * GET /api/v1/sessions/analytics
 * Get comprehensive session analytics
 */
router.get("/analytics", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get session analytics
    const sessionAnalytics = sessionManager.getAnalytics();

    // Get user-specific sessions
    const userSessions = sessionManager.getUserSessions(userId);

    // Get token cache metrics
    const tokenMetrics = tokenCache.getMetrics();

    // Get request deduplicator metrics
    const deduplicatorMetrics = requestDeduplicator.getMetrics();

    // Calculate additional insights
    const insights = calculateSessionInsights(userSessions, sessionAnalytics);

    const analytics = {
      user: {
        id: userId,
        currentSessions: userSessions.length,
        sessionDetails: userSessions.map((session) => ({
          id: session.id,
          startTime: session.startTime,
          lastActivity: session.lastActivity,
          duration: Date.now() - session.startTime,
          status: session.status,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          loginMethod: session.loginMethod,
        })),
      },
      system: {
        sessionAnalytics,
        tokenMetrics,
        deduplicatorMetrics,
        insights,
        timestamp: Date.now(),
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error("Failed to get session analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve session analytics",
    });
  }
});

/**
 * GET /api/v1/sessions/health
 * Get session health metrics
 */
router.get("/health", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user sessions
    const userSessions = sessionManager.getUserSessions(userId);

    // Calculate health score
    const healthScore = calculateSessionHealthScore(userSessions);

    // Get health recommendations
    const recommendations = generateHealthRecommendations(
      userSessions,
      healthScore,
    );

    const health = {
      userId,
      healthScore,
      status: getHealthStatus(healthScore),
      activeSessions: userSessions.length,
      sessions: userSessions,
      recommendations,
      timestamp: Date.now(),
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error("Failed to get session health:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve session health",
    });
  }
});

/**
 * GET /api/v1/sessions
 * Get all active sessions for authenticated user
 */
router.get("/", authenticateUser, async (req, res) => {
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
    logger.error("Failed to get user sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve sessions",
    });
  }
});

/**
 * DELETE /api/v1/sessions/:sessionId
 * Logout specific session
 */
router.delete("/:sessionId", authenticateUser, async (req, res) => {
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
    logger.error("Failed to logout session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout session",
    });
  }
});

/**
 * DELETE /api/v1/sessions
 * Logout user from all sessions
 */
router.delete("/", authenticateUser, async (req, res) => {
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
        failed: result.failed || 0,
      },
    });
  } catch (error) {
    logger.error("Failed to logout all sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to logout from all sessions",
    });
  }
});

/**
 * POST /api/v1/sessions/revoke-token
 * Revoke a specific token
 */
router.post("/revoke-token", authenticateUser, async (req, res) => {
  try {
    const { token, reason = "manual_revocation" } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required",
      });
    }

    // Revoke token
    const result = await sessionManager.revokeToken(token, reason);

    res.json({
      success: true,
      data: {
        revoked: result.success,
        message: result.success
          ? "Token revoked successfully"
          : "Failed to revoke token",
      },
    });
  } catch (error) {
    logger.error("Failed to revoke token:", error);
    res.status(500).json({
      success: false,
      error: "Failed to revoke token",
    });
  }
});

/**
 * GET /api/v1/sessions/metrics
 * Get system-wide session metrics (admin only)
 */
router.get("/metrics", authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    // Get all sessions
    const allSessions = sessionManager.getAllSessions();

    // Get system metrics
    const systemMetrics = {
      totalActiveSessions: allSessions.length,
      uniqueUsers: new Set(allSessions.map((s) => s.userId)).size,
      averageSessionsPerUser:
        allSessions.length /
        Math.max(new Set(allSessions.map((s) => s.userId)).size, 1),
      sessionAnalytics: sessionManager.getAnalytics(),
      tokenMetrics: tokenCache.getMetrics(),
      deduplicatorMetrics: requestDeduplicator.getMetrics(),
      timestamp: Date.now(),
    };

    res.json({
      success: true,
      data: systemMetrics,
    });
  } catch (error) {
    logger.error("Failed to get system metrics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve system metrics",
    });
  }
});

/**
 * Calculate session insights
 */
function calculateSessionInsights(sessions, analytics) {
  const insights = {
    multiDeviceUsage: sessions.length > 1,
    sessionPatterns: analyzeSessionPatterns(sessions),
    securityFlags: analyzeSecurityFlags(sessions),
    performanceIssues: analyzePerformanceIssues(analytics),
  };

  return insights;
}

/**
 * Analyze session patterns
 */
function analyzeSessionPatterns(sessions) {
  const now = Date.now();
  const recentSessions = sessions.filter((s) => now - s.startTime < 86400000); // Last 24 hours

  return {
    peakUsageHours: calculatePeakHours(recentSessions),
    averageSessionDuration: calculateAverageDuration(recentSessions),
    mostActiveDevices: calculateMostActiveDevices(recentSessions),
    loginMethodDistribution: calculateLoginMethodDistribution(recentSessions),
  };
}

/**
 * Analyze security flags
 */
function analyzeSecurityFlags(sessions) {
  const flags = [];

  // Check for concurrent sessions from different IPs
  const uniqueIPs = new Set(sessions.map((s) => s.ipAddress));
  if (uniqueIPs.size > 1) {
    flags.push({
      type: "multiple_ips",
      severity: "medium",
      message: "Multiple concurrent sessions from different IP addresses",
    });
  }

  // Check for unusual session duration
  const longSessions = sessions.filter(
    (s) => Date.now() - s.startTime > 86400000 * 2,
  ); // > 48 hours
  if (longSessions.length > 0) {
    flags.push({
      type: "long_sessions",
      severity: "low",
      message: `${longSessions.length} sessions longer than 48 hours`,
    });
  }

  return flags;
}

/**
 * Analyze performance issues
 */
function analyzePerformanceIssues(analytics) {
  const issues = [];

  // Check cache hit rate
  if (
    analytics.tokenMetrics &&
    parseFloat(analytics.tokenMetrics.hitRate) < 50
  ) {
    issues.push({
      type: "low_cache_hit_rate",
      severity: "medium",
      message: `Token cache hit rate: ${analytics.tokenMetrics.hitRate}%`,
    });
  }

  // Check deduplication efficiency
  if (
    analytics.deduplicatorMetrics &&
    parseFloat(analytics.deduplicatorMetrics.efficiency) < 30
  ) {
    issues.push({
      type: "low_deduplication_efficiency",
      severity: "low",
      message: `Request deduplication efficiency: ${analytics.deduplicatorMetrics.efficiency}%`,
    });
  }

  return issues;
}

/**
 * Calculate session health score
 */
function calculateSessionHealthScore(sessions) {
  if (sessions.length === 0) return 100;

  let score = 100;

  // Deduct points for multiple sessions (potential security risk)
  if (sessions.length > 1) {
    score -= (sessions.length - 1) * 5;
  }

  // Deduct points for very long sessions
  const now = Date.now();
  sessions.forEach((session) => {
    const duration = now - session.startTime;
    if (duration > 86400000 * 2) {
      // > 48 hours
      score -= 10;
    }
  });

  return Math.max(score, 0);
}

/**
 * Get health status based on score
 */
function getHealthStatus(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

/**
 * Generate health recommendations
 */
function generateHealthRecommendations(sessions, healthScore) {
  const recommendations = [];

  if (sessions.length > 3) {
    recommendations.push({
      type: "session_limit",
      message: "Consider limiting concurrent sessions for better security",
      priority: "medium",
    });
  }

  if (healthScore < 60) {
    recommendations.push({
      type: "security_review",
      message: "Session health score is low, consider security review",
      priority: "high",
    });
  }

  return recommendations;
}

// Helper functions for pattern analysis
function calculatePeakHours(sessions) {
  const hourCounts = {};
  sessions.forEach((session) => {
    const hour = new Date(session.startTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  return Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }));
}

function calculateAverageDuration(sessions) {
  if (sessions.length === 0) return 0;

  const now = Date.now();
  const durations = sessions.map((s) => now - s.startTime);
  return (
    durations.reduce((sum, duration) => sum + duration, 0) / sessions.length
  );
}

function calculateMostActiveDevices(sessions) {
  const deviceCounts = {};
  sessions.forEach((session) => {
    const device = session.deviceInfo?.type || "unknown";
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  });

  return Object.entries(deviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([device, count]) => ({ device, count }));
}

function calculateLoginMethodDistribution(sessions) {
  const methodCounts = {};
  sessions.forEach((session) => {
    const method = session.loginMethod || "unknown";
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });

  return methodCounts;
}

export default router;
