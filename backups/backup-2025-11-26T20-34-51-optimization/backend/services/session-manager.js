/**
 * 🚀 AXOLOP CRM - SESSION MANAGER
 *
 * Provides comprehensive session management including token revocation,
 * logout all sessions functionality, and session analytics.
 *
 * Features:
 * - Token revocation and invalidation
 * - Logout all sessions functionality
 * - Session analytics and insights
 * - Cross-tab session coordination
 * - Security-focused session management
 */

import tokenCache from "./token-cache.js";
import { redis } from "../index.js";
import logger from "../utils/logger.js";

class SessionManager {
  constructor() {
    this.activeSessions = new Map(); // Track all active sessions
    this.revocationQueue = new Map(); // Queue for token revocations
    this.analytics = {
      totalLogins: 0,
      totalLogouts: 0,
      concurrentSessions: 0,
      maxConcurrentSessions: 0,
      averageSessionDuration: 0,
      sessionDurations: [],
      revokedTokens: 0,
      forcedLogouts: 0,
    };

    this.config = {
      maxSessionDuration: 86400000, // 24 hours
      sessionCleanupInterval: 300000, // 5 minutes
      revocationBatchSize: 100, // Max tokens to revoke at once
      analyticsRetentionDays: 30, // Keep analytics for 30 days
    };

    // Initialize cleanup interval
    this.startCleanupInterval();

    // Bind methods
    this.performSessionCleanup = this.performSessionCleanup.bind(this);
  }

  /**
   * Register a new session
   */
  registerSession(sessionId, userId, sessionInfo = {}) {
    const session = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      status: "active",
      deviceInfo: sessionInfo.deviceInfo || {},
      ipAddress: sessionInfo.ipAddress || "unknown",
      userAgent: sessionInfo.userAgent || "unknown",
      loginMethod: sessionInfo.loginMethod || "unknown",
      ...sessionInfo,
    };

    this.activeSessions.set(sessionId, session);
    this.updateAnalytics("login", session);

    // Register with health monitor if available
    if (typeof window !== "undefined" && window.sessionHealthMonitor) {
      window.sessionHealthMonitor.registerSession(sessionId, session);
    }

    logger.info(`📝 Session registered: ${sessionId} for user ${userId}`);
    return session;
  }

  /**
   * Unregister a session (logout)
   */
  unregisterSession(sessionId, reason = "user_logout") {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      logger.warn(`Session not found for unregistration: ${sessionId}`);
      return null;
    }

    // Calculate session duration
    const duration = Date.now() - session.startTime;
    session.endTime = Date.now();
    session.duration = duration;
    session.logoutReason = reason;

    // Update analytics
    this.updateAnalytics("logout", session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    // Invalidate cached tokens for this session
    this.invalidateSessionTokens(sessionId);

    // Unregister from health monitor
    if (typeof window !== "undefined" && window.sessionHealthMonitor) {
      window.sessionHealthMonitor.unregisterSession(sessionId);
    }

    logger.info(`🗑️ Session unregistered: ${sessionId} (${reason})`);
    return session;
  }

  /**
   * Logout user from all sessions
   */
  async logoutAllSessions(userId, options = {}) {
    const {
      includeCurrent = true,
      reason = "logout_all",
      notifyOtherTabs = true,
      forceImmediate = false,
    } = options;

    try {
      logger.info(`🔐 Logging out user ${userId} from all sessions`);

      // Find all sessions for this user
      const userSessions = Array.from(this.activeSessions.values()).filter(
        (session) => session.userId === userId,
      );

      if (userSessions.length === 0) {
        logger.warn(`No active sessions found for user ${userId}`);
        return { loggedOutSessions: 0, sessions: [] };
      }

      // Invalidate all cached tokens for this user
      await tokenCache.invalidateUserTokens(userId);

      // Mark sessions for revocation
      const sessionsToRevoke = userSessions.map((session) => ({
        sessionId: session.id,
        userId: session.userId,
        revokeTime: forceImmediate ? Date.now() : Date.now() + 5000, // 5 second grace period
        reason,
      }));

      // Add to revocation queue
      sessionsToRevoke.forEach((session) => {
        this.revocationQueue.set(session.sessionId, session);
      });

      // Process revocations
      const revocationResults = await this.processRevocations(sessionsToRevoke);

      // Notify other tabs
      if (notifyOtherTabs && typeof window !== "undefined") {
        this.broadcastLogoutEvent(userId, reason, includeCurrent);
      }

      // Update analytics
      this.analytics.forcedLogouts += userSessions.length;

      logger.info(
        `✅ Logout all completed: ${revocationResults.successful} sessions, ${revocationResults.failed} failed`,
      );

      return {
        loggedOutSessions: revocationResults.successful,
        sessions: revocationResults.results,
        failed: revocationResults.failed,
      };
    } catch (error) {
      logger.error("❌ Failed to logout all sessions:", error);
      throw error;
    }
  }

  /**
   * Revoke specific token
   */
  async revokeToken(token, reason = "manual_revocation") {
    try {
      // Add to revocation queue
      const revocationId = this.generateRevocationId();
      this.revocationQueue.set(revocationId, {
        token,
        reason,
        timestamp: Date.now(),
        status: "pending",
      });

      // Process revocation
      const result = await this.processTokenRevocation(revocationId, token);

      // Update analytics
      if (result.success) {
        this.analytics.revokedTokens++;
      }

      return result;
    } catch (error) {
      logger.error("❌ Failed to revoke token:", error);
      throw error;
    }
  }

  /**
   * Process batch revocations
   */
  async processRevocations(sessions) {
    const results = {
      successful: 0,
      failed: 0,
      results: [],
    };

    // Process in batches to avoid overwhelming system
    const batches = this.createBatches(
      sessions,
      this.config.revocationBatchSize,
    );

    for (const batch of batches) {
      const batchPromises = batch.map(async (session) => {
        try {
          // Wait for grace period if not immediate
          if (session.revokeTime > Date.now()) {
            await new Promise((resolve) =>
              setTimeout(resolve, session.revokeTime - Date.now()),
            );
          }

          // Invalidate session tokens
          await this.invalidateSessionTokens(session.sessionId);

          // Mark session as revoked
          const registeredSession = this.activeSessions.get(session.sessionId);
          if (registeredSession) {
            registeredSession.status = "revoked";
            registeredSession.revokeTime = Date.now();
            registeredSession.revokeReason = session.reason;
          }

          results.successful++;
          results.results.push({
            sessionId: session.sessionId,
            success: true,
            reason: session.reason,
          });

          logger.debug(`✅ Session revoked: ${session.sessionId}`);
        } catch (error) {
          results.failed++;
          results.results.push({
            sessionId: session.sessionId,
            success: false,
            error: error.message,
          });

          logger.error(
            `❌ Failed to revoke session ${session.sessionId}:`,
            error,
          );
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Process individual token revocation
   */
  async processTokenRevocation(revocationId, token) {
    try {
      const revocation = this.revocationQueue.get(revocationId);
      if (!revocation) {
        throw new Error("Revocation not found");
      }

      revocation.status = "processing";

      // Invalidate token in cache
      await tokenCache.invalidateToken(token);

      // Add token to Redis blocklist if available
      if (redis) {
        const blocklistKey = `revoked_token:${this.hashToken(token)}`;
        await redis.setex(
          blocklistKey,
          86400,
          JSON.stringify({
            token: this.hashToken(token),
            reason: revocation.reason,
            timestamp: Date.now(),
          }),
        );
      }

      revocation.status = "completed";
      this.revocationQueue.delete(revocationId);

      return { success: true, revocationId };
    } catch (error) {
      const revocation = this.revocationQueue.get(revocationId);
      if (revocation) {
        revocation.status = "failed";
        revocation.error = error.message;
      }

      throw error;
    }
  }

  /**
   * Invalidate tokens for a specific session
   */
  async invalidateSessionTokens(sessionId) {
    try {
      // This would need to be implemented based on your token storage strategy
      // For now, we'll clear the token cache for any tokens associated with this session
      const session = this.activeSessions.get(sessionId);
      if (session) {
        await tokenCache.invalidateUserTokens(session.userId);
      }
    } catch (error) {
      logger.error(
        `Failed to invalidate tokens for session ${sessionId}:`,
        error,
      );
    }
  }

  /**
   * Check if token is revoked
   */
  async isTokenRevoked(token) {
    try {
      if (!redis) {
        return false;
      }

      const tokenHash = this.hashToken(token);
      const blocklistKey = `revoked_token:${tokenHash}`;
      const blocked = await redis.get(blocklistKey);

      return !!blocked;
    } catch (error) {
      logger.error("Failed to check token revocation status:", error);
      return false;
    }
  }

  /**
   * Broadcast logout event to other tabs
   */
  broadcastLogoutEvent(userId, reason) {
    try {
      if (typeof window !== "undefined" && window.supabaseSingleton) {
        window.supabaseSingleton.broadcast("SESSION_LOGOUT", {
          allSessions: true,
          userId,
          reason,
        });
      }
    } catch (error) {
      logger.warn("Failed to broadcast logout event:", error);
    }
  }

  /**
   * Update session analytics
   */
  updateAnalytics(type, session) {
    switch (type) {
      case "login":
        this.analytics.totalLogins++;
        this.analytics.concurrentSessions = this.activeSessions.size;
        this.analytics.maxConcurrentSessions = Math.max(
          this.analytics.maxConcurrentSessions,
          this.analytics.concurrentSessions,
        );
        break;

      case "logout":
        this.analytics.totalLogouts++;
        if (session.duration) {
          this.analytics.sessionDurations.push(session.duration);

          // Keep only last 1000 session durations for average calculation
          if (this.analytics.sessionDurations.length > 1000) {
            this.analytics.sessionDurations =
              this.analytics.sessionDurations.slice(-1000);
          }

          // Calculate average session duration
          const sum = this.analytics.sessionDurations.reduce(
            (a, b) => a + b,
            0,
          );
          this.analytics.averageSessionDuration =
            sum / this.analytics.sessionDurations.length;
        }
        this.analytics.concurrentSessions = this.activeSessions.size;
        break;
    }
  }

  /**
   * Get session analytics
   */
  getAnalytics() {
    return {
      ...this.analytics,
      currentActiveSessions: this.activeSessions.size,
      averageSessionDurationMinutes: Math.round(
        this.analytics.averageSessionDuration / 60000,
      ),
      maxConcurrentSessions: this.analytics.maxConcurrentSessions,
      revocationQueueSize: this.revocationQueue.size,
      sessionHealthScore: this.calculateSessionHealthScore(),
    };
  }

  /**
   * Calculate overall session health score
   */
  calculateSessionHealthScore() {
    const totalSessions = this.analytics.totalLogins;
    if (totalSessions === 0) return 100;

    const errorRate =
      (this.analytics.revokedTokens + this.analytics.forcedLogouts) /
      totalSessions;
    const healthScore = Math.max(100 - errorRate * 100, 0);

    return Math.round(healthScore);
  }

  /**
   * Get active sessions for user
   */
  getUserSessions(userId) {
    return Array.from(this.activeSessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  /**
   * Get session details
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    setInterval(this.performSessionCleanup, this.config.sessionCleanupInterval);
  }

  /**
   * Perform session cleanup
   */
  performSessionCleanup() {
    const now = Date.now();
    let cleanedSessions = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const age = now - session.startTime;
      const inactivity = now - session.lastActivity;

      // Clean up sessions older than max duration
      if (age > this.config.maxSessionDuration) {
        this.unregisterSession(sessionId, "expired");
        cleanedSessions++;
      }
      // Clean up sessions inactive for more than 2 hours
      else if (inactivity > 7200000) {
        // 2 hours
        this.unregisterSession(sessionId, "inactive");
        cleanedSessions++;
      }
    }

    // Clean up old revocation entries
    const oldRevocations = [];
    for (const [revocationId, revocation] of this.revocationQueue.entries()) {
      if (now - revocation.timestamp > 3600000) {
        // 1 hour
        oldRevocations.push(revocationId);
      }
    }

    oldRevocations.forEach((id) => {
      this.revocationQueue.delete(id);
    });

    if (cleanedSessions > 0 || oldRevocations.length > 0) {
      logger.info(
        `🧹 Session cleanup: ${cleanedSessions} sessions, ${oldRevocations.length} revocations`,
      );
    }
  }

  /**
   * Utility functions
   */
  generateRevocationId() {
    return `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Export analytics data
   */
  exportAnalytics() {
    return {
      analytics: this.getAnalytics(),
      sessions: this.getAllSessions(),
      timestamp: Date.now(),
      version: "1.0.0",
    };
  }

  /**
   * Reset analytics
   */
  resetAnalytics() {
    this.analytics = {
      totalLogins: 0,
      totalLogouts: 0,
      concurrentSessions: 0,
      maxConcurrentSessions: 0,
      averageSessionDuration: 0,
      sessionDurations: [],
      revokedTokens: 0,
      forcedLogouts: 0,
    };

    logger.info("📊 Session analytics reset");
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
