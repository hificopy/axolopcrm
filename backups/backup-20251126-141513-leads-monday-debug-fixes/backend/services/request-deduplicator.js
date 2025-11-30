/**
 * 🚀 AXOLOP CRM - REQUEST DEDUPLICATION SERVICE
 *
 * Prevents duplicate authentication validations and similar requests
 * from hitting the backend multiple times simultaneously.
 *
 * Features:
 * - Request deduplication by key
 * - Response caching for identical requests
 * - Automatic cleanup of stale requests
 * - Performance monitoring
 * - Memory-efficient implementation
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map(); // Currently processing requests
    this.responseCache = new Map(); // Cached responses
    this.config = {
      cacheTimeout: 5000, // Cache responses for 5 seconds
      maxPendingRequests: 100, // Max concurrent pending requests
      maxCacheSize: 200, // Max cached responses
      cleanupInterval: 30000, // Cleanup every 30 seconds
    };

    this.metrics = {
      duplicatesPrevented: 0,
      cacheHits: 0,
      cacheMisses: 0,
      pendingRequests: 0,
      averageResponseTime: 0,
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Generate unique request key
   */
  generateKey(request) {
    const { method, url, params, data, headers } = request;

    // Include relevant headers in key (auth, session)
    const relevantHeaders = {
      authorization: headers?.authorization,
      "x-session-id": headers?.["x-session-id"],
    };

    // Create key components
    const keyComponents = [
      method?.toUpperCase() || "GET",
      url,
      JSON.stringify(params || {}),
      JSON.stringify(data || {}),
      JSON.stringify(relevantHeaders),
    ];

    // Hash the components for a compact key
    const keyString = keyComponents.join("|");
    return this.hashString(keyString);
  }

  /**
   * Hash string for cache key
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Execute request with deduplication
   */
  async execute(requestKey, requestFunction) {
    const startTime = Date.now();

    try {
      // Check if request is already pending
      if (this.pendingRequests.has(requestKey)) {
        this.metrics.duplicatesPrevented++;
        console.log(
          `🔄 Request deduplication: waiting for existing request ${requestKey}`,
        );

        // Wait for existing request to complete
        const existingPromise = this.pendingRequests.get(requestKey);
        const result = await existingPromise;

        // Update metrics
        const duration = Date.now() - startTime;
        this.updateMetrics(duration, true);

        return result;
      }

      // Check cache first
      const cachedResponse = this.getCachedResponse(requestKey);
      if (cachedResponse) {
        this.metrics.cacheHits++;
        console.log(`💾 Request deduplication: cache hit ${requestKey}`);

        const duration = Date.now() - startTime;
        this.updateMetrics(duration, true);

        return cachedResponse;
      }

      this.metrics.cacheMisses++;

      // Check if we have too many pending requests
      if (this.pendingRequests.size >= this.config.maxPendingRequests) {
        console.warn(
          `⚠️ Too many pending requests (${this.pendingRequests.size}), rejecting new request`,
        );
        throw new Error("Too many concurrent requests");
      }

      // Create request promise
      const requestPromise = this.performRequest(
        requestKey,
        requestFunction,
        startTime,
      );

      // Store in pending requests
      this.pendingRequests.set(requestKey, requestPromise);
      this.metrics.pendingRequests = this.pendingRequests.size;

      try {
        const result = await requestPromise;
        return result;
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(requestKey);
        this.metrics.pendingRequests = this.pendingRequests.size;
      }
    } catch (error) {
      // Clean up on error
      this.pendingRequests.delete(requestKey);
      this.metrics.pendingRequests = this.pendingRequests.size;

      const duration = Date.now() - startTime;
      this.updateMetrics(duration, false);

      throw error;
    }
  }

  /**
   * Perform the actual request
   */
  async performRequest(requestKey, requestFunction, startTime) {
    console.log(
      `🚀 Request deduplication: executing new request ${requestKey}`,
    );

    try {
      const result = await requestFunction();

      // Cache successful responses
      if (result && typeof result === "object") {
        this.cacheResponse(requestKey, result);
      }

      const duration = Date.now() - startTime;
      console.log(
        `✅ Request deduplication: completed ${requestKey} (${duration}ms)`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `❌ Request deduplication: failed ${requestKey} (${duration}ms)`,
        error,
      );
      throw error;
    }
  }

  /**
   * Cache a response
   */
  cacheResponse(key, response) {
    // Don't cache error responses
    if (response?.error || response?.statusCode >= 400) {
      return;
    }

    // Limit cache size
    if (this.responseCache.size >= this.config.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }

    const cacheEntry = {
      response,
      timestamp: Date.now(),
      key,
    };

    this.responseCache.set(key, cacheEntry);
  }

  /**
   * Get cached response
   */
  getCachedResponse(key) {
    const cached = this.responseCache.get(key);
    if (!cached) {
      return null;
    }

    // Check if cache entry is still valid
    const age = Date.now() - cached.timestamp;
    if (age > this.config.cacheTimeout) {
      this.responseCache.delete(key);
      return null;
    }

    return cached.response;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(duration, fromCache) {
    const alpha = 0.1; // Smoothing factor

    if (!fromCache) {
      // Only update average response time for actual requests
      this.metrics.averageResponseTime =
        this.metrics.averageResponseTime * (1 - alpha) + duration * alpha;
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup stale entries
   */
  cleanup() {
    const now = Date.now();
    let cleanedResponses = 0;
    let cleanedPending = 0;

    // Clean stale cache entries
    for (const [key, entry] of this.responseCache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.config.cacheTimeout) {
        this.responseCache.delete(key);
        cleanedResponses++;
      }
    }

    // Clean stale pending requests (shouldn't happen, but safety net)
    for (const [key, promise] of this.pendingRequests.entries()) {
      // This is tricky - we can't easily check if a promise is stale
      // For now, we'll just log if there are many pending requests
      if (this.pendingRequests.size > this.config.maxPendingRequests / 2) {
        console.warn(
          `⚠️ High number of pending requests: ${this.pendingRequests.size}`,
        );
        break;
      }
    }

    if (cleanedResponses > 0) {
      console.log(
        `🧹 Deduplicator cleanup: removed ${cleanedResponses} stale cache entries`,
      );
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      pendingRequests: this.pendingRequests.size,
      cachedResponses: this.responseCache.size,
      metrics: { ...this.metrics },
    };
  }

  /**
   * Get detailed metrics
   */
  getMetrics() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return {
      ...this.metrics,
      cacheHitRate:
        total > 0 ? ((this.metrics.cacheHits / total) * 100).toFixed(2) : 0,
      deduplicationRate:
        this.metrics.pendingRequests > 0
          ? (
              (this.metrics.duplicatesPrevented /
                this.metrics.pendingRequests) *
              100
            ).toFixed(2)
          : 0,
      efficiency:
        total > 0
          ? (
              ((this.metrics.cacheHits + this.metrics.duplicatesPrevented) /
                total) *
              100
            ).toFixed(2)
          : 0,
    };
  }

  /**
   * Clear all caches and pending requests
   */
  clear() {
    // Cancel all pending requests (we can't actually cancel them, but we can clear the map)
    const pendingCount = this.pendingRequests.size;
    this.pendingRequests.clear();

    // Clear response cache
    const cacheCount = this.responseCache.size;
    this.responseCache.clear();

    console.log(
      `🧹 Request deduplicator cleared: ${pendingCount} pending, ${cacheCount} cached`,
    );

    // Reset metrics
    this.metrics = {
      duplicatesPrevented: 0,
      cacheHits: 0,
      cacheMisses: 0,
      pendingRequests: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Force invalidate cache entry
   */
  invalidate(key) {
    this.responseCache.delete(key);
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern) {
    let invalidated = 0;
    for (const [key] of this.responseCache.entries()) {
      if (key.includes(pattern)) {
        this.responseCache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      console.log(
        `🗑️ Invalidated ${invalidated} cache entries matching pattern: ${pattern}`,
      );
    }

    return invalidated;
  }
}

// Create singleton instance
const requestDeduplicator = new RequestDeduplicator();

export default requestDeduplicator;
