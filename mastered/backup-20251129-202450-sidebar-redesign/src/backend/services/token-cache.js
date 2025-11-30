/**
 * 🚀 AXOLOP CRM - TOKEN CACHE SERVICE
 *
 * Provides Redis-based token caching to reduce Supabase API calls
 * and improve authentication performance for concurrent sessions.
 *
 * Features:
 * - Token validation caching with 5-minute TTL
 * - Request deduplication
 * - Cache invalidation on logout
 * - Performance monitoring
 * - Graceful fallback
 */

import { redis } from "../index.js";
import logger from "../utils/logger.js";
import requestDeduplicator from "./request-deduplicator.js";

class TokenCache {
  constructor() {
    this.cache = new Map(); // Fallback in-memory cache
    this.pendingValidations = new Map(); // Request deduplication
    this.metrics = {
      hits: 0,
      misses: 0,
      validations: 0,
      cacheErrors: 0,
      averageValidationTime: 0,
    };

    // Cache configuration
    this.config = {
      ttl: 300, // 5 minutes
      keyPrefix: "auth:token:",
      validationKeyPrefix: "auth:validation:",
      maxInMemoryCache: 1000,
    };

    this.isRedisAvailable = false;
    this.checkRedisConnection();
  }

  /**
   * Check Redis connection and availability
   */
  async checkRedisConnection() {
    try {
      await redis.ping();
      this.isRedisAvailable = true;
      logger.info("✅ Token cache: Redis connection available");
    } catch (error) {
      this.isRedisAvailable = false;
      logger.warn("⚠️ Token cache: Redis unavailable, using in-memory cache");
    }
  }

  /**
   * Generate cache key for token
   */
  generateTokenKey(token) {
    // Use hash of token for security and to avoid storing raw tokens
    const tokenHash = this.hashToken(token);
    return `${this.config.keyPrefix}${tokenHash}`;
  }

  /**
   * Generate validation cache key
   */
  generateValidationKey(token) {
    const tokenHash = this.hashToken(token);
    return `${this.config.validationKeyPrefix}${tokenHash}`;
  }

  /**
   * Hash token for cache keys (security)
   */
  hashToken(token) {
    // Simple hash for cache key - in production, use crypto
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Cache validated token result
   */
  async cacheTokenValidation(token, user, ttl = this.config.ttl) {
    const startTime = Date.now();

    try {
      const cacheKey = this.generateTokenKey(token);
      const validationKey = this.generateValidationKey(token);

      const cacheData = {
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || "USER",
          aud: user.aud,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata,
        },
        validated_at: Date.now(),
        expires_at: Date.now() + ttl * 1000,
        token_hash: this.hashToken(token),
      };

      if (this.isRedisAvailable) {
        // Use Redis for distributed cache
        await Promise.all([
          redis.setex(cacheKey, ttl, JSON.stringify(cacheData)),
          redis.setex(validationKey, ttl, "1"),
        ]);
      } else {
        // Fallback to in-memory cache
        this.setInMemoryCache(cacheKey, cacheData, ttl);
      }

      const duration = Date.now() - startTime;
      this.updateMetrics("cache", duration);

      logger.debug(
        `✅ Token cached: ${cacheKey.substring(0, 20)}... (${duration}ms)`,
      );
    } catch (error) {
      this.metrics.cacheErrors++;
      logger.error("❌ Failed to cache token validation:", error);
    }
  }

  /**
   * Get cached token validation
   */
  async getCachedTokenValidation(token) {
    const startTime = Date.now();

    try {
      const cacheKey = this.generateTokenKey(token);

      let cachedData;

      if (this.isRedisAvailable) {
        // Try Redis first
        const redisData = await redis.get(cacheKey);
        if (redisData) {
          cachedData = JSON.parse(redisData);
        }
      } else {
        // Fallback to in-memory cache
        cachedData = this.getInMemoryCache(cacheKey);
      }

      if (cachedData) {
        // Check if cache is still valid
        if (Date.now() < cachedData.expires_at) {
          const duration = Date.now() - startTime;
          this.updateMetrics("hit", duration);

          logger.debug(
            `✅ Cache hit: ${cacheKey.substring(0, 20)}... (${duration}ms)`,
          );
          return cachedData.user;
        } else {
          // Cache expired, remove it
          await this.invalidateToken(token);
        }
      }

      const duration = Date.now() - startTime;
      this.updateMetrics("miss", duration);

      logger.debug(
        `❌ Cache miss: ${cacheKey.substring(0, 20)}... (${duration}ms)`,
      );
      return null;
    } catch (error) {
      this.metrics.cacheErrors++;
      logger.error("❌ Failed to get cached token validation:", error);
      return null;
    }
  }

  /**
   * Deduplicate concurrent validation requests
   */
  async deduplicateValidation(token, validationFunction) {
    const validationKey = this.generateValidationKey(token);

    // Create request object for deduplicator
    const request = {
      method: "POST",
      url: "/auth/validate",
      headers: {
        authorization: `Bearer ${token}`,
        "x-session-id": "token-validation",
      },
      data: { token: token.substring(0, 20) + "..." }, // Only log partial token
    };

    const requestKey = requestDeduplicator.generateKey(request);

    // Use request deduplicator for comprehensive deduplication
    return requestDeduplicator.execute(requestKey, async () => {
      // Check if validation is already in progress (legacy fallback)
      if (this.pendingValidations.has(validationKey)) {
        logger.debug(
          `⏳ Validation already in progress: ${validationKey.substring(0, 20)}...`,
        );
        return this.pendingValidations.get(validationKey);
      }

      // Create validation promise
      const validationPromise = this.performValidation(
        token,
        validationFunction,
      );

      // Store for deduplication
      this.pendingValidations.set(validationKey, validationPromise);

      // Cleanup after validation completes
      validationPromise.finally(() => {
        this.pendingValidations.delete(validationKey);
      });

      return validationPromise;
    });
  }

  /**
   * Perform token validation with caching
   */
  async performValidation(token, validationFunction) {
    const startTime = Date.now();

    try {
      // Check cache first
      const cachedUser = await this.getCachedTokenValidation(token);
      if (cachedUser) {
        return { user: cachedUser, cached: true };
      }

      // Perform actual validation
      logger.debug(`🔍 Validating token: ${token.substring(0, 20)}...`);
      const result = await validationFunction(token);

      if (result.user) {
        // Cache successful validation
        await this.cacheTokenValidation(token, result.user);
      }

      const duration = Date.now() - startTime;
      this.updateMetrics("validation", duration);

      return { ...result, cached: false };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ Token validation failed (${duration}ms):`, error);
      throw error;
    }
  }

  /**
   * Invalidate token cache
   */
  async invalidateToken(token) {
    try {
      const cacheKey = this.generateTokenKey(token);
      const validationKey = this.generateValidationKey(token);

      if (this.isRedisAvailable) {
        await Promise.all([redis.del(cacheKey), redis.del(validationKey)]);
      } else {
        this.deleteInMemoryCache(cacheKey);
      }

      logger.debug(`🗑️ Token invalidated: ${cacheKey.substring(0, 20)}...`);
    } catch (error) {
      logger.error("❌ Failed to invalidate token:", error);
    }
  }

  /**
   * Invalidate all tokens for a user
   */
  async invalidateUserTokens(userId) {
    try {
      if (this.isRedisAvailable) {
        // Find all token keys for this user
        const pattern = `${this.config.keyPrefix}*`;
        const keys = await redis.keys(pattern);

        // Check each key to see if it belongs to user
        for (const key of keys) {
          const data = await redis.get(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.user?.id === userId) {
              await redis.del(key);
            }
          }
        }
      } else {
        // For in-memory cache, we need to check each entry
        for (const [key, value] of this.cache.entries()) {
          if (value.user?.id === userId) {
            this.cache.delete(key);
          }
        }
      }

      logger.info(`🗑️ Invalidated all tokens for user: ${userId}`);
    } catch (error) {
      logger.error("❌ Failed to invalidate user tokens:", error);
    }
  }

  /**
   * In-memory cache operations (fallback)
   */
  setInMemoryCache(key, data, ttl) {
    // Limit cache size
    if (this.cache.size >= this.config.maxInMemoryCache) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      ...data,
      expires_at: Date.now() + ttl * 1000,
    });
  }

  getInMemoryCache(key) {
    const data = this.cache.get(key);
    if (!data) return null;

    if (Date.now() > data.expires_at) {
      this.cache.delete(key);
      return null;
    }

    return data;
  }

  deleteInMemoryCache(key) {
    this.cache.delete(key);
  }

  /**
   * Update performance metrics
   */
  updateMetrics(type, duration) {
    switch (type) {
      case "hit":
        this.metrics.hits++;
        break;
      case "miss":
        this.metrics.misses++;
        break;
      case "validation":
        this.metrics.validations++;
        break;
      case "cache":
        // Cache operation metrics
        break;
    }

    // Update average validation time
    const alpha = 0.1;
    this.metrics.averageValidationTime =
      this.metrics.averageValidationTime * (1 - alpha) + duration * alpha;
  }

  /**
   * Get cache metrics
   */
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? ((this.metrics.hits / total) * 100).toFixed(2) : 0,
      cacheType: this.isRedisAvailable ? "redis" : "memory",
      pendingValidations: this.pendingValidations.size,
      inMemoryCacheSize: this.cache.size,
    };
  }

  /**
   * Clear all cache
   */
  async clearCache() {
    try {
      if (this.isRedisAvailable) {
        const pattern = `${this.config.keyPrefix}*`;
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        this.cache.clear();
      }

      this.pendingValidations.clear();
      logger.info("🧹 Token cache cleared");
    } catch (error) {
      logger.error("❌ Failed to clear cache:", error);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    const health = {
      status: "healthy",
      redis: this.isRedisAvailable,
      metrics: this.getMetrics(),
    };

    try {
      if (this.isRedisAvailable) {
        await redis.ping();
        health.redis = "connected";
      }
    } catch (error) {
      health.status = "degraded";
      health.redis = "disconnected";
    }

    return health;
  }
}

// Create singleton instance
const tokenCache = new TokenCache();

export default tokenCache;
