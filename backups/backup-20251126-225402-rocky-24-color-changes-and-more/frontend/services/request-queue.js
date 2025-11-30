/**
 * 🚀 AXOLOP CRM - REQUEST QUEUE SERVICE
 *
 * Manages API requests during token refresh cycles to prevent race conditions
 * and ensure consistent authentication state across multiple concurrent requests.
 *
 * Features:
 * - Request queuing during token refresh
 * - Request deduplication
 * - Exponential backoff retry
 * - Rate limit detection and handling
 * - Request cancellation
 * - Performance monitoring
 * - Automatic auth header injection
 */

import axios from "axios";
import supabaseSingleton from "./supabase-singleton.js";

class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.pendingRequests = new Map(); // For deduplication
    this.rateLimitInfo = {
      resetTime: null,
      retryAfter: null,
      limit: null,
      remaining: null,
    };

    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      queuedRequests: 0,
      failedRequests: 0,
      rateLimitHits: 0,
      averageResponseTime: 0,
    };

    // Bind methods
    this.processQueue = this.processQueue.bind(this);
    this.handleRateLimit = this.handleRateLimit.bind(this);
  }

  /**
   * Add request to queue or execute immediately
   */
  async enqueue(requestConfig) {
    const requestId = this.generateRequestId(requestConfig);

    // Check for duplicate request
    if (this.pendingRequests.has(requestId)) {
      console.log(`🔄 Duplicate request detected: ${requestId}`);
      return this.pendingRequests.get(requestId);
    }

    // Create request promise
    const requestPromise = new Promise((resolve, reject) => {
      const queuedRequest = {
        id: requestId,
        config: requestConfig,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
      };

      // Check if we need to queue (token refresh in progress)
      if (this.shouldQueue()) {
        this.queue.push(queuedRequest);
        this.metrics.queuedRequests++;
        console.log(
          `⏳ Request queued: ${requestId} (queue size: ${this.queue.length})`,
        );
      } else {
        // Execute immediately
        this.executeRequest(queuedRequest);
      }
    });

    // Store for deduplication
    this.pendingRequests.set(requestId, requestPromise);

    // Cleanup after request completes
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestId);
    });

    return requestPromise;
  }

  /**
   * Generate unique request ID
   */
  generateRequestId(config) {
    const { method, url, params, data } = config;
    const key = `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
    return btoa(key).substring(0, 16);
  }

  /**
   * Check if request should be queued
   */
  shouldQueue() {
    // Queue if token refresh is in progress
    if (window.supabaseSingleton?.isRefreshing) {
      return true;
    }

    // Queue if we're rate limited
    if (
      this.rateLimitInfo.resetTime &&
      Date.now() < this.rateLimitInfo.resetTime
    ) {
      return true;
    }

    return false;
  }

  /**
   * Inject authentication headers into request config
   */
  async injectAuthHeaders(config) {
    try {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {};
      }

      // Get session from singleton (with timeout)
      const getSessionWithTimeout = () => {
        return Promise.race([
          supabaseSingleton.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session timeout')), 5000)
          ),
        ]);
      };

      // Only inject if we're authenticated and don't already have an auth header
      if (supabaseSingleton.isAuthenticated() && !config.headers.Authorization) {
        try {
          const session = await getSessionWithTimeout();
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
            console.log('[RequestQueue] Auth header injected');
          }
        } catch (sessionError) {
          console.warn('[RequestQueue] Could not get session for auth header:', sessionError.message);
          // Continue without auth - will get 401 and retry with fresh token
        }
      }

      // Add session ID header for tracking
      try {
        const sessionHealth = supabaseSingleton.getSessionHealth();
        if (sessionHealth?.sessionId) {
          config.headers['X-Session-ID'] = sessionHealth.sessionId;
        }
      } catch (healthError) {
        // Non-critical
      }

      // Add agency ID header if available
      try {
        const currentAgencyStr = localStorage.getItem('axolop_current_agency');
        if (currentAgencyStr) {
          const currentAgency = JSON.parse(currentAgencyStr);
          if (currentAgency?.id) {
            config.headers['X-Agency-ID'] = currentAgency.id;
          }
        }
      } catch (agencyError) {
        // Non-critical
      }
    } catch (error) {
      console.warn('[RequestQueue] Error injecting auth headers:', error);
    }

    return config;
  }

  /**
   * Execute a single request
   */
  async executeRequest(queuedRequest) {
    const { id, config, resolve, reject, retryCount, maxRetries } =
      queuedRequest;
    const startTime = Date.now();

    try {
      this.metrics.totalRequests++;

      console.log(
        `🚀 Executing request: ${id} (attempt ${retryCount + 1}/${maxRetries})`,
      );

      // CRITICAL: Inject auth headers before making request
      await this.injectAuthHeaders(config);

      // Add request metadata
      config.metadata = {
        requestId: id,
        timestamp: startTime,
        retryCount,
      };

      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      // Update metrics
      this.updateResponseTime(responseTime);

      // Check for rate limit headers
      this.checkRateLimitHeaders(response);

      console.log(`✅ Request completed: ${id} (${responseTime}ms)`);
      resolve(response);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Handle different error types
      if (this.isRateLimitError(error)) {
        await this.handleRateLimit(error, queuedRequest);
      } else if (this.isAuthError(error) && retryCount < maxRetries) {
        await this.handleAuthError(error, queuedRequest);
      } else if (this.isRetryableError(error) && retryCount < maxRetries) {
        await this.handleRetryableError(error, queuedRequest);
      } else {
        // Final failure
        this.metrics.failedRequests++;
        console.error(`❌ Request failed: ${id} (${responseTime}ms)`, error);
        reject(error);
      }
    }
  }

  /**
   * Check if error is rate limit related
   */
  isRateLimitError(error) {
    return (
      error.response?.status === 429 ||
      error.response?.data?.error?.includes("rate limit") ||
      error.response?.data?.message?.includes("rate limit") ||
      error.response?.headers?.["x-ratelimit-remaining"] === "0"
    );
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(error) {
    return error.response?.status === 401;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const status = error.response?.status;
    return (
      !status || // Network errors
      status >= 500 || // Server errors
      status === 408 || // Request timeout
      status === 429 // Rate limit (handled separately but still retryable)
    );
  }

  /**
   * Handle rate limit errors
   */
  async handleRateLimit(error, queuedRequest) {
    this.metrics.rateLimitHits++;

    const retryAfter = error.response?.headers?.["retry-after"] || 60;
    const resetTime = Date.now() + retryAfter * 1000;

    this.rateLimitInfo = {
      resetTime,
      retryAfter,
      limit: error.response?.headers?.["x-ratelimit-limit"],
      remaining: error.response?.headers?.["x-ratelimit-remaining"],
    };

    console.warn(
      `⚠️ Rate limit hit for request ${queuedRequest.id}. Retrying after ${retryAfter}s`,
    );

    // Wait for rate limit reset
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

    // Retry the request
    queuedRequest.retryCount++;
    this.queue.push(queuedRequest);
    this.processQueue();
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(error, queuedRequest) {
    console.warn(
      `🔐 Auth error for request ${queuedRequest.id}. Attempting token refresh...`,
    );

    try {
      // Trigger token refresh if not already in progress
      if (!window.supabaseSingleton?.isRefreshing) {
        await window.supabaseSingleton.refreshToken();
      }

      // Wait for refresh to complete
      await this.waitForTokenRefresh();

      // Update request with new token
      const session = await window.supabaseSingleton.getSession();
      if (session?.access_token) {
        queuedRequest.config.headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Retry the request
      queuedRequest.retryCount++;
      this.queue.push(queuedRequest);
      this.processQueue();
    } catch (refreshError) {
      console.error(
        `❌ Token refresh failed for request ${queuedRequest.id}:`,
        refreshError,
      );
      queuedRequest.reject(refreshError);
    }
  }

  /**
   * Handle retryable errors with exponential backoff
   */
  async handleRetryableError(error, queuedRequest) {
    const delay = Math.min(1000 * Math.pow(2, queuedRequest.retryCount), 10000);

    console.warn(
      `⚠️ Retryable error for request ${queuedRequest.id}. Retrying after ${delay}ms`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));

    queuedRequest.retryCount++;
    this.queue.push(queuedRequest);
    this.processQueue();
  }

  /**
   * Wait for token refresh to complete
   */
  async waitForTokenRefresh() {
    const maxWaitTime = 30000; // 30 seconds max
    const startTime = Date.now();

    while (
      window.supabaseSingleton?.isRefreshing &&
      Date.now() - startTime < maxWaitTime
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (window.supabaseSingleton?.isRefreshing) {
      throw new Error("Token refresh timeout");
    }
  }

  /**
   * Check rate limit headers
   */
  checkRateLimitHeaders(response) {
    const headers = response.headers;

    if (headers["x-ratelimit-limit"] || headers["x-ratelimit-remaining"]) {
      this.rateLimitInfo = {
        ...this.rateLimitInfo,
        limit: parseInt(headers["x-ratelimit-limit"]),
        remaining: parseInt(headers["x-ratelimit-remaining"]),
        resetTime: null, // Reset if we get a successful response
      };
    }
  }

  /**
   * Update average response time
   */
  updateResponseTime(responseTime) {
    const alpha = 0.1; // Smoothing factor
    this.metrics.averageResponseTime =
      this.metrics.averageResponseTime * (1 - alpha) + responseTime * alpha;
  }

  /**
   * Process queued requests
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`📋 Processing queue: ${this.queue.length} requests`);

    while (this.queue.length > 0) {
      if (this.shouldQueue()) {
        // Still need to wait
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      const request = this.queue.shift();
      this.executeRequest(request);

      // Small delay between requests to prevent overwhelming
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
    console.log("✅ Queue processing completed");
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      pendingRequests: this.pendingRequests.size,
      rateLimitInfo: this.rateLimitInfo,
      metrics: { ...this.metrics },
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    const clearedRequests = this.queue.length;

    // Reject all queued requests
    this.queue.forEach((request) => {
      request.reject(new Error("Request cancelled - queue cleared"));
    });

    this.queue = [];
    console.log(`🧹 Queue cleared: ${clearedRequests} requests cancelled`);
  }

  /**
   * Cancel specific request
   */
  cancelRequest(requestId) {
    // Remove from queue
    const queueIndex = this.queue.findIndex((req) => req.id === requestId);
    if (queueIndex > -1) {
      const [request] = this.queue.splice(queueIndex, 1);
      request.reject(new Error("Request cancelled"));
      return true;
    }

    // Check pending requests
    if (this.pendingRequests.has(requestId)) {
      this.pendingRequests.delete(requestId);
      return true;
    }

    return false;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate:
        this.metrics.totalRequests > 0
          ? (
              ((this.metrics.totalRequests - this.metrics.failedRequests) /
                this.metrics.totalRequests) *
              100
            ).toFixed(2)
          : 0,
      queueEfficiency:
        this.metrics.totalRequests > 0
          ? (
              (this.metrics.queuedRequests / this.metrics.totalRequests) *
              100
            ).toFixed(2)
          : 0,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      queuedRequests: 0,
      failedRequests: 0,
      rateLimitHits: 0,
      averageResponseTime: 0,
    };
  }
}

// Create singleton instance
const requestQueue = new RequestQueue();

// Make available globally for other modules
window.requestQueue = requestQueue;

export default requestQueue;
