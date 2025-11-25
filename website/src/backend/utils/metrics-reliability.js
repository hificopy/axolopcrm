/**
 * Backend API Reliability Detection
 * Adds health checks and reliability metadata to stats endpoints
 */

import logger from "../utils/logger.js";

class MetricsReliabilityDetector {
  constructor() {
    this.requestStats = new Map();
    this.healthStatus = {
      database: "unknown",
      api: "unknown",
      lastCheck: null,
    };
  }

  /**
   * Middleware to add reliability detection to API responses
   */
  addReliabilityMetadata(req, res, next) {
    const startTime = Date.now();
    const endpoint = req.path;

    // Store original res.json
    const originalJson = res.json;

    res.json = function (data) {
      const responseTime = Date.now() - startTime;

      // Add reliability metadata
      const enhancedData = {
        ...data,
        _reliability: {
          responseTime,
          timestamp: new Date().toISOString(),
          endpoint,
          status: "success",
          databaseStatus:
            MetricsReliabilityDetector.prototype.healthStatus.database,
          apiStatus: MetricsReliabilityDetector.prototype.healthStatus.api,
        },
      };

      // Update request stats
      MetricsReliabilityDetector.prototype.updateRequestStats(
        endpoint,
        responseTime,
        true,
      );

      return originalJson.call(this, enhancedData);
    };

    // Handle errors
    res.on("error", (error) => {
      const responseTime = Date.now() - startTime;
      MetricsReliabilityDetector.prototype.updateRequestStats(
        endpoint,
        responseTime,
        false,
        error,
      );
    });

    next();
  }

  /**
   * Updates request statistics
   */
  updateRequestStats(endpoint, responseTime, success, error = null) {
    if (!this.requestStats.has(endpoint)) {
      this.requestStats.set(endpoint, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        lastError: null,
        lastSuccess: null,
      });
    }

    const stats = this.requestStats.get(endpoint);
    stats.totalRequests++;

    if (success) {
      stats.successfulRequests++;
      stats.lastSuccess = new Date().toISOString();

      // Update average response time
      const totalTime =
        stats.averageResponseTime * (stats.successfulRequests - 1) +
        responseTime;
      stats.averageResponseTime = totalTime / stats.successfulRequests;
    } else {
      stats.failedRequests++;
      stats.lastError = {
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Health check endpoint
   */
  async performHealthCheck(supabase) {
    const startTime = Date.now();

    try {
      // Check database connectivity
      const dbHealth = await this.checkDatabaseHealth(supabase);

      // Check API performance
      const apiHealth = this.checkAPIHealth();

      const overallHealth = {
        status: dbHealth.healthy && apiHealth.healthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        database: dbHealth,
        api: apiHealth,
        endpoints: this.getEndpointHealth(),
      };

      // Update health status
      this.healthStatus = {
        database: dbHealth.status,
        api: apiHealth.status,
        lastCheck: new Date().toISOString(),
      };

      logger.info("Health check completed", overallHealth);
      return overallHealth;
    } catch (error) {
      const errorHealth = {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
        database: { status: "error", error: error.message },
        api: { status: "error", error: error.message },
      };

      this.healthStatus = {
        database: "error",
        api: "error",
        lastCheck: new Date().toISOString(),
      };

      logger.error("Health check failed", error);
      return errorHealth;
    }
  }

  /**
   * Checks database health
   */
  async checkDatabaseHealth(supabase) {
    const startTime = Date.now();

    try {
      // Simple connectivity test
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          status: "unhealthy",
          error: error.message,
          responseTime,
        };
      }

      // Check if response time is acceptable
      const healthy = responseTime < 2000; // 2 seconds threshold

      return {
        status: healthy ? "healthy" : "degraded",
        responseTime,
        connected: true,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        connected: false,
      };
    }
  }

  /**
   * Checks API health based on request statistics
   */
  checkAPIHealth() {
    const endpoints = Array.from(this.requestStats.keys());

    if (endpoints.length === 0) {
      return {
        status: "unknown",
        message: "No request data available",
      };
    }

    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalResponseTime = 0;
    let slowEndpoints = 0;

    endpoints.forEach((endpoint) => {
      const stats = this.requestStats.get(endpoint);
      totalRequests += stats.totalRequests;
      totalSuccessful += stats.successfulRequests;
      totalResponseTime += stats.averageResponseTime * stats.successfulRequests;

      if (stats.averageResponseTime > 3000) {
        // 3 seconds threshold
        slowEndpoints++;
      }
    });

    const successRate =
      totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0;
    const averageResponseTime =
      totalSuccessful > 0 ? totalResponseTime / totalSuccessful : 0;

    let status = "healthy";
    if (
      successRate < 90 ||
      averageResponseTime > 5000 ||
      slowEndpoints > endpoints.length / 2
    ) {
      status = "unhealthy";
    } else if (
      successRate < 95 ||
      averageResponseTime > 3000 ||
      slowEndpoints > 0
    ) {
      status = "degraded";
    }

    return {
      status,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      totalRequests,
      slowEndpoints,
      endpointsCount: endpoints.length,
    };
  }

  /**
   * Gets health status for individual endpoints
   */
  getEndpointHealth() {
    const endpoints = {};

    this.requestStats.forEach((stats, endpoint) => {
      const successRate =
        stats.totalRequests > 0
          ? (stats.successfulRequests / stats.totalRequests) * 100
          : 0;

      let status = "healthy";
      if (successRate < 90 || stats.averageResponseTime > 5000) {
        status = "unhealthy";
      } else if (successRate < 95 || stats.averageResponseTime > 3000) {
        status = "degraded";
      }

      endpoints[endpoint] = {
        status,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: Math.round(stats.averageResponseTime),
        totalRequests: stats.totalRequests,
        lastError: stats.lastError,
        lastSuccess: stats.lastSuccess,
      };
    });

    return endpoints;
  }

  /**
   * Determines if a metric response is reliable
   */
  isResponseReliable(response, endpoint) {
    if (!response) {
      return {
        reliable: false,
        reason: "No response received",
      };
    }

    // Check reliability metadata if available
    if (response._reliability) {
      const reliability = response._reliability;

      // Check response time
      if (reliability.responseTime > 5000) {
        return {
          reliable: false,
          reason: "Response time too high",
        };
      }

      // Check database status
      if (
        reliability.databaseStatus === "error" ||
        reliability.databaseStatus === "unhealthy"
      ) {
        return {
          reliable: false,
          reason: "Database connection issues",
        };
      }

      // Check API status
      if (
        reliability.apiStatus === "error" ||
        reliability.apiStatus === "unhealthy"
      ) {
        return {
          reliable: false,
          reason: "API performance issues",
        };
      }
    }

    // Check endpoint-specific stats
    if (endpoint && this.requestStats.has(endpoint)) {
      const stats = this.requestStats.get(endpoint);
      const successRate =
        stats.totalRequests > 0
          ? (stats.successfulRequests / stats.totalRequests) * 100
          : 0;

      if (successRate < 90) {
        return {
          reliable: false,
          reason: "Low success rate for this endpoint",
        };
      }

      if (stats.averageResponseTime > 5000) {
        return {
          reliable: false,
          reason: "High average response time for this endpoint",
        };
      }
    }

    return {
      reliable: true,
      reason: "Response appears reliable",
    };
  }

  /**
   * Gets reliability statistics for monitoring
   */
  getReliabilityStats() {
    return {
      healthStatus: this.healthStatus,
      endpointStats: this.getEndpointHealth(),
      requestStats: Object.fromEntries(this.requestStats),
    };
  }
}

// Singleton instance
export const metricsReliabilityDetector = new MetricsReliabilityDetector();
export default metricsReliabilityDetector;
