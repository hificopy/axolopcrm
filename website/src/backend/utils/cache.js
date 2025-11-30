import config from "../config/app.config.js";
import logger, { logCacheOperation } from "./logger.js";

/**
 * Cache Service using Redis
 */
class CacheService {
  constructor() {
    this.redis = null;
    this.enabled = config.cache.enabled;
    this.defaultTtl = config.cache.defaultTtl;
  }

  /**
   * Initialize cache with Redis client
   */
  initialize(redisClient) {
    this.redis = redisClient;
    logger.info("Cache service initialized");
  }

  /**
   * Check if cache is available
   */
  isAvailable() {
    return this.enabled && this.redis !== null;
  }

  /**
   * Generate cache key
   */
  key(...parts) {
    return parts.join(":");
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isAvailable()) return null;

    try {
      const value = await this.redis.get(key);
      if (value) {
        logCacheOperation("get", key, true);
        return JSON.parse(value);
      }
      logCacheOperation("get", key, false);
      return null;
    } catch (error) {
      logger.error("Cache get error", { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = this.defaultTtl) {
    if (!this.isAvailable()) return false;

    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttl);
      logCacheOperation("set", key);
      return true;
    } catch (error) {
      logger.error("Cache set error", { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.isAvailable()) return false;

    try {
      await this.redis.del(key);
      logCacheOperation("del", key);
      return true;
    } catch (error) {
      logger.error("Cache delete error", { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  async delPattern(pattern) {
    if (!this.isAvailable()) return false;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logCacheOperation("delPattern", pattern, { count: keys.length });
      }
      return true;
    } catch (error) {
      logger.error("Cache delete pattern error", {
        pattern,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get or set with fetch function
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTtl) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttl);
    }
    return value;
  }

  /**
   * Invalidate multiple related keys
   */
  async invalidate(...keys) {
    if (!this.isAvailable()) return false;

    try {
      const promises = keys.map((k) => this.del(k));
      await Promise.all(promises);
      return true;
    } catch (error) {
      logger.error("Cache invalidate error", { keys, error: error.message });
      return false;
    }
  }

  // ===============================
  // Domain-specific cache methods
  // ===============================

  /**
   * Workflow caching
   */
  async getWorkflow(workflowId) {
    return this.get(this.key("workflow", workflowId));
  }

  async setWorkflow(workflowId, workflow) {
    return this.set(
      this.key("workflow", workflowId),
      workflow,
      config.cache.workflowTtl,
    );
  }

  async invalidateWorkflow(workflowId) {
    return this.del(this.key("workflow", workflowId));
  }

  /**
   * Template caching
   */
  async getTemplate(templateId) {
    return this.get(this.key("template", templateId));
  }

  async setTemplate(templateId, template) {
    return this.set(
      this.key("template", templateId),
      template,
      config.cache.templateTtl,
    );
  }

  async invalidateTemplate(templateId) {
    return this.del(this.key("template", templateId));
  }

  /**
   * Lead caching
   */
  async getLead(leadId) {
    return this.get(this.key("lead", leadId));
  }

  async setLead(leadId, lead) {
    return this.set(this.key("lead", leadId), lead, config.cache.leadTtl);
  }

  async invalidateLead(leadId) {
    return this.del(this.key("lead", leadId));
  }

  /**
   * Lead list caching
   */
  async getLeadList(userId, filters = {}) {
    const filterKey = JSON.stringify(filters);
    return this.get(this.key("leads", userId, filterKey));
  }

  async setLeadList(userId, filters, leads) {
    const filterKey = JSON.stringify(filters);
    return this.set(
      this.key("leads", userId, filterKey),
      leads,
      config.cache.leadTtl,
    );
  }

  async invalidateUserLeads(userId) {
    return this.delPattern(this.key("leads", userId, "*"));
  }

  /**
   * Contact caching
   */
  async getContact(contactId) {
    return this.get(this.key("contact", contactId));
  }

  async setContact(contactId, contact) {
    return this.set(
      this.key("contact", contactId),
      contact,
      config.cache.leadTtl,
    );
  }

  async invalidateContact(contactId) {
    return this.del(this.key("contact", contactId));
  }

  /**
   * User session caching
   */
  async getUserSession(userId) {
    return this.get(this.key("session", userId));
  }

  async setUserSession(userId, session, ttl = 3600) {
    return this.set(this.key("session", userId), session, ttl);
  }

  async invalidateUserSession(userId) {
    return this.del(this.key("session", userId));
  }

  /**
   * Campaign caching
   */
  async getCampaign(campaignId) {
    return this.get(this.key("campaign", campaignId));
  }

  async setCampaign(campaignId, campaign) {
    return this.set(
      this.key("campaign", campaignId),
      campaign,
      config.cache.templateTtl,
    );
  }

  async invalidateCampaign(campaignId) {
    return this.del(this.key("campaign", campaignId));
  }

  /**
   * Statistics caching
   */
  async getStats(key, ttl = 300) {
    return this.get(this.key("stats", key));
  }

  async setStats(key, stats, ttl = 300) {
    return this.set(this.key("stats", key), stats, ttl);
  }

  /**
   * Tiered dashboard caching for optimal performance
   */
  async getDashboardData(userId, tier, timeRange) {
    return this.get(this.key("dashboard", "v2", tier, userId, timeRange));
  }

  async setDashboardData(userId, tier, timeRange, data) {
    const ttl = this.getDashboardTtl(tier);
    return this.set(
      this.key("dashboard", "v2", tier, userId, timeRange),
      data,
      ttl,
    );
  }

  /**
   * Get TTL based on cache tier
   */
  getDashboardTtl(tier) {
    const tiers = {
      realtime: 30, // 30 seconds - leads, activities, recent data
      hourly: 3600, // 1 hour - deals, opportunities, campaigns
      daily: 86400, // 24 hours - forms, contacts, historical data
    };
    return tiers[tier] || 3600; // Default to 1 hour
  }

  /**
   * Invalidate all dashboard cache for a user
   */
  async invalidateUserDashboard(userId) {
    const patterns = [
      this.key("dashboard", "v2", "realtime", userId, "*"),
      this.key("dashboard", "v2", "hourly", userId, "*"),
      this.key("dashboard", "v2", "daily", userId, "*"),
    ];

    const promises = patterns.map((pattern) => this.delPattern(pattern));
    await Promise.all(promises);
    return true;
  }

  /**
   * Invalidate specific tier for user
   */
  async invalidateUserDashboardTier(userId, tier) {
    const pattern = this.key("dashboard", "v2", tier, userId, "*");
    return this.delPattern(pattern);
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.isAvailable()) return false;

    try {
      await this.redis.flushdb();
      logger.info("Cache cleared");
      return true;
    } catch (error) {
      logger.error("Cache clear error", { error: error.message });
      return false;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;

/**
 * Cache middleware factory
 */
export function cacheMiddleware(keyFn, ttl) {
  return async (req, res, next) => {
    if (!cacheService.isAvailable()) {
      return next();
    }

    try {
      const key = typeof keyFn === "function" ? keyFn(req) : keyFn;
      const cached = await cacheService.get(key);

      if (cached) {
        logger.debug("Cache hit for middleware", { key });
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data) {
        cacheService.set(key, data, ttl);
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error", { error: error.message });
      next();
    }
  };
}
