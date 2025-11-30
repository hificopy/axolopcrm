/**
 * 🚀 AXOLOP CRM - SESSION HEALTH MONITOR
 *
 * Monitors session health across multiple tabs and devices,
 * providing insights into session quality and detecting issues.
 *
 * Features:
 * - Real-time session health monitoring
 * - Cross-tab health synchronization
 * - Session quality metrics
 * - Automatic session recovery
 * - Health-based session management
 */

class SessionHealthMonitor {
  constructor() {
    this.sessions = new Map(); // Active sessions
    this.healthMetrics = {
      totalSessions: 0,
      healthySessions: 0,
      staleSessions: 0,
      errorSessions: 0,
      averageSessionAge: 0,
      lastHealthCheck: Date.now(),
    };

    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      staleThreshold: 300000, // 5 minutes
      errorThreshold: 60000, // 1 minute
      maxSessions: 10, // Max sessions to track
      healthScoreThreshold: 70, // Minimum health score %
    };

    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.broadcastChannel = null;

    // Initialize broadcast channel
    this.initializeBroadcastChannel();

    // Bind methods
    this.performHealthCheck = this.performHealthCheck.bind(this);
    this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
  }

  /**
   * Initialize broadcast channel for cross-tab health sync
   */
  initializeBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel("session-health");
      this.broadcastChannel.addEventListener(
        "message",
        this.handleBroadcastMessage,
      );
    } catch (error) {
      console.warn("Session health: BroadcastChannel not supported");
    }
  }

  /**
   * Handle broadcast messages from other tabs
   */
  handleBroadcastMessage(event) {
    const { type, data, sessionId } = event.data;

    switch (type) {
      case "SESSION_HEALTH_UPDATE":
        this.updateExternalSessionHealth(sessionId, data);
        break;
      case "SESSION_HEALTH_CHECK":
        this.respondToHealthCheck(sessionId);
        break;
      case "SESSION_CLEANUP":
        this.cleanupStaleSessions();
        break;
    }
  }

  /**
   * Start health monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log("Session health monitoring already active");
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(
      this.performHealthCheck,
      this.config.healthCheckInterval,
    );

    console.log("🏥 Session health monitoring started");
    this.broadcastHealthEvent("MONITORING_STARTED");
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log("🏥 Session health monitoring stopped");
    this.broadcastHealthEvent("MONITORING_STOPPED");
  }

  /**
   * Register a session for monitoring
   */
  registerSession(sessionId, sessionInfo = {}) {
    const session = {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      health: "healthy",
      healthScore: 100,
      errors: [],
      warnings: [],
      ...sessionInfo,
    };

    this.sessions.set(sessionId, session);
    this.updateMetrics();

    console.log(`📝 Session registered: ${sessionId}`);
    this.broadcastHealthEvent("SESSION_REGISTERED", { sessionId, session });

    // Limit number of tracked sessions
    if (this.sessions.size > this.config.maxSessions) {
      this.cleanupOldestSession();
    }
  }

  /**
   * Unregister a session
   */
  unregisterSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.updateMetrics();

      console.log(`🗑️ Session unregistered: ${sessionId}`);
      this.broadcastHealthEvent("SESSION_UNREGISTERED", { sessionId, session });
    }
  }

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId, activity = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.registerSession(sessionId, activity);
      return;
    }

    session.lastActivity = Date.now();
    Object.assign(session, activity);

    // Reset health if it was degraded
    if (session.health !== "healthy") {
      session.health = "healthy";
      session.healthScore = Math.min(session.healthScore + 10, 100);
    }

    this.updateMetrics();
  }

  /**
   * Record session error
   */
  recordSessionError(sessionId, error) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const errorRecord = {
      timestamp: Date.now(),
      message: error.message || error,
      type: error.type || "unknown",
      severity: error.severity || "medium",
    };

    session.errors.push(errorRecord);
    session.health = "error";
    session.healthScore = Math.max(session.healthScore - 20, 0);

    // Keep only recent errors (last 10)
    if (session.errors.length > 10) {
      session.errors = session.errors.slice(-10);
    }

    console.error(`❌ Session error recorded: ${sessionId}`, errorRecord);
    this.broadcastHealthEvent("SESSION_ERROR", {
      sessionId,
      error: errorRecord,
    });
    this.updateMetrics();
  }

  /**
   * Record session warning
   */
  recordSessionWarning(sessionId, warning) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const warningRecord = {
      timestamp: Date.now(),
      message: warning.message || warning,
      type: warning.type || "warning",
    };

    session.warnings.push(warningRecord);
    session.health = "warning";
    session.healthScore = Math.max(session.healthScore - 5, 0);

    // Keep only recent warnings (last 20)
    if (session.warnings.length > 20) {
      session.warnings = session.warnings.slice(-20);
    }

    console.warn(`⚠️ Session warning recorded: ${sessionId}`, warningRecord);
    this.broadcastHealthEvent("SESSION_WARNING", {
      sessionId,
      warning: warningRecord,
    });
    this.updateMetrics();
  }

  /**
   * Perform comprehensive health check
   */
  performHealthCheck() {
    const now = Date.now();
    let healthUpdates = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now - session.startTime;
      const inactivity = now - session.lastActivity;

      let health = "healthy";
      let healthScore = session.healthScore;
      const issues = [];

      // Check for stale session
      if (inactivity > this.config.staleThreshold) {
        health = "stale";
        healthScore = Math.max(healthScore - 15, 0);
        issues.push("Session inactive for too long");
      }

      // Check for recent errors
      const recentErrors = session.errors.filter(
        (error) => now - error.timestamp < this.config.errorThreshold,
      );

      if (recentErrors.length > 0) {
        health = "error";
        healthScore = Math.max(healthScore - recentErrors.length * 10, 0);
        issues.push(`${recentErrors.length} recent errors`);
      }

      // Check for old sessions
      if (age > 3600000) {
        // 1 hour
        healthScore = Math.max(healthScore - 5, 0);
        issues.push("Session is very old");
      }

      // Update session health
      const previousHealth = session.health;
      session.health = health;
      session.healthScore = healthScore;
      session.lastHealthCheck = now;

      if (previousHealth !== health || issues.length > 0) {
        healthUpdates.push({
          sessionId,
          previousHealth,
          newHealth: health,
          healthScore,
          issues,
        });
      }
    }

    // Broadcast health updates
    if (healthUpdates.length > 0) {
      this.broadcastHealthEvent("BATCH_HEALTH_UPDATE", {
        updates: healthUpdates,
      });
    }

    this.updateMetrics();
    this.cleanupStaleSessions();
  }

  /**
   * Update external session health
   */
  updateExternalSessionHealth(sessionId, healthData) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, healthData);
      this.updateMetrics();
    }
  }

  /**
   * Respond to health check from another tab
   */
  respondToHealthCheck(requestingSessionId) {
    const mySessionId = this.getCurrentSessionId();
    if (mySessionId && mySessionId !== requestingSessionId) {
      const session = this.sessions.get(mySessionId);
      if (session) {
        this.broadcastHealthEvent("HEALTH_CHECK_RESPONSE", {
          requestingSessionId,
          respondingSessionId: mySessionId,
          session: {
            health: session.health,
            healthScore: session.healthScore,
            lastActivity: session.lastActivity,
          },
        });
      }
    }
  }

  /**
   * Get current session ID (from singleton)
   */
  getCurrentSessionId() {
    if (window.supabaseSingleton) {
      return window.supabaseSingleton.sessionId;
    }
    return null;
  }

  /**
   * Broadcast health event
   */
  broadcastHealthEvent(type, data = {}) {
    const message = {
      type,
      data,
      sessionId: this.getCurrentSessionId(),
      timestamp: Date.now(),
    };

    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message);
      }
    } catch (error) {
      console.warn("Failed to broadcast health event:", error);
    }
  }

  /**
   * Update health metrics
   */
  updateMetrics() {
    const now = Date.now();
    let healthyCount = 0;
    let staleCount = 0;
    let errorCount = 0;
    let totalAge = 0;

    for (const session of this.sessions.values()) {
      totalAge += now - session.startTime;

      switch (session.health) {
        case "healthy":
          healthyCount++;
          break;
        case "stale":
          staleCount++;
          break;
        case "error":
        case "warning":
          errorCount++;
          break;
      }
    }

    this.healthMetrics = {
      totalSessions: this.sessions.size,
      healthySessions: healthyCount,
      staleSessions: staleCount,
      errorSessions: errorCount,
      averageSessionAge:
        this.sessions.size > 0 ? totalAge / this.sessions.size : 0,
      lastHealthCheck: now,
    };
  }

  /**
   * Cleanup stale sessions
   */
  cleanupStaleSessions() {
    const now = Date.now();
    const staleSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactivity = now - session.lastActivity;

      // Remove sessions inactive for more than 30 minutes
      if (inactivity > 1800000) {
        // 30 minutes
        staleSessions.push(sessionId);
      }
    }

    staleSessions.forEach((sessionId) => {
      this.unregisterSession(sessionId);
    });

    if (staleSessions.length > 0) {
      console.log(`🧹 Cleaned up ${staleSessions.length} stale sessions`);
      this.broadcastHealthEvent("CLEANUP_COMPLETED", {
        cleanedSessions: staleSessions,
      });
    }
  }

  /**
   * Cleanup oldest session when limit exceeded
   */
  cleanupOldestSession() {
    let oldestSessionId = null;
    let oldestTime = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < oldestTime) {
        oldestTime = session.startTime;
        oldestSessionId = sessionId;
      }
    }

    if (oldestSessionId) {
      this.unregisterSession(oldestSessionId);
    }
  }

  /**
   * Get health metrics
   */
  getHealthMetrics() {
    return {
      ...this.healthMetrics,
      isMonitoring: this.isMonitoring,
      healthScore: this.calculateOverallHealthScore(),
      recommendations: this.generateHealthRecommendations(),
    };
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealthScore() {
    if (this.healthMetrics.totalSessions === 0) {
      return 100;
    }

    const healthyWeight = 1.0;
    const warningWeight = 0.7;
    const errorWeight = 0.3;
    const staleWeight = 0.5;

    let totalScore = 0;

    for (const session of this.sessions.values()) {
      let weight = healthyWeight;

      switch (session.health) {
        case "warning":
          weight = warningWeight;
          break;
        case "error":
          weight = errorWeight;
          break;
        case "stale":
          weight = staleWeight;
          break;
      }

      totalScore += session.healthScore * weight;
    }

    return Math.round(totalScore / this.healthMetrics.totalSessions);
  }

  /**
   * Generate health recommendations
   */
  generateHealthRecommendations() {
    const recommendations = [];
    const metrics = this.healthMetrics;

    if (metrics.errorSessions > 0) {
      recommendations.push({
        type: "error",
        message: `${metrics.errorSessions} session(s) have errors. Consider refreshing these sessions.`,
        priority: "high",
      });
    }

    if (metrics.staleSessions > 0) {
      recommendations.push({
        type: "stale",
        message: `${metrics.staleSessions} session(s) are inactive. Consider cleaning up stale sessions.`,
        priority: "medium",
      });
    }

    const overallScore = this.calculateOverallHealthScore();
    if (overallScore < this.config.healthScoreThreshold) {
      recommendations.push({
        type: "health",
        message: `Overall session health is ${overallScore}%. Consider investigating session issues.`,
        priority: "medium",
      });
    }

    if (metrics.totalSessions > this.config.maxSessions * 0.8) {
      recommendations.push({
        type: "capacity",
        message: `Approaching session limit (${metrics.totalSessions}/${this.config.maxSessions}). Consider cleanup.`,
        priority: "low",
      });
    }

    return recommendations;
  }

  /**
   * Get session details
   */
  getSessionDetails(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  /**
   * Force cleanup of all sessions
   */
  forceCleanup() {
    const sessionIds = Array.from(this.sessions.keys());
    sessionIds.forEach((sessionId) => {
      this.unregisterSession(sessionId);
    });

    console.log("🧹 Force cleanup completed");
    this.broadcastHealthEvent("FORCE_CLEANUP_COMPLETED");
  }
}

// Create singleton instance
const sessionHealthMonitor = new SessionHealthMonitor();

export default sessionHealthMonitor;
