import cacheService from "../utils/cache.js";
import logger from "../utils/logger.js";

/**
 * Landing page cache service for performance optimization
 */
class LandingPageCache {
  constructor() {
    this.baseKey = "landing";
    this.defaultTtl = 1800; // 30 minutes
  }

  /**
   * Cache key generator for landing page data
   */
  key(type, identifier = "") {
    return `${this.baseKey}:${type}${identifier ? `:${identifier}` : ""}`;
  }

  /**
   * Get cached landing page data
   */
  async getData(type) {
    try {
      return await cacheService.get(this.key(type));
    } catch (error) {
      logger.error("Landing cache get error", { type, error: error.message });
      return null;
    }
  }

  /**
   * Set landing page data in cache
   */
  async setData(type, data, ttl = this.defaultTtl) {
    try {
      return await cacheService.set(this.key(type), data, ttl);
    } catch (error) {
      logger.error("Landing cache set error", { type, error: error.message });
      return false;
    }
  }

  /**
   * Get or set pattern for landing page data
   */
  async getOrSet(type, fetchFn, ttl = this.defaultTtl) {
    const cached = await this.getData(type);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFn();
      if (data !== null && data !== undefined) {
        await this.setData(type, data, ttl);
      }
      return data;
    } catch (error) {
      logger.error("Landing cache fetch error", { type, error: error.message });
      throw error;
    }
  }

  /**
   * Invalidate specific landing page cache
   */
  async invalidate(type) {
    try {
      return await cacheService.del(this.key(type));
    } catch (error) {
      logger.error("Landing cache invalidate error", {
        type,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Clear all landing page cache
   */
  async clear() {
    try {
      return await cacheService.delPattern(`${this.baseKey}:*`);
    } catch (error) {
      logger.error("Landing cache clear error", { error: error.message });
      return false;
    }
  }

  // ===============================
  // Specific landing page data methods
  // ===============================

  /**
   * Cache customer logos data
   */
  async getCustomerLogos() {
    return this.getData("customer_logos");
  }

  async setCustomerLogos(logos) {
    return this.setData("customer_logos", logos, 3600); // 1 hour
  }

  /**
   * Cache stats data
   */
  async getStats() {
    return this.getData("stats");
  }

  async setStats(stats) {
    return this.setData("stats", stats, 1800); // 30 minutes
  }

  /**
   * Cache feature showcase data
   */
  async getFeatureShowcase() {
    return this.getData("feature_showcase");
  }

  async setFeatureShowcase(features) {
    return this.setData("feature_showcase", features, 3600); // 1 hour
  }

  /**
   * Cache use cases data
   */
  async getUseCases() {
    return this.getData("use_cases");
  }

  async setUseCases(useCases) {
    return this.setData("use_cases", useCases, 3600); // 1 hour
  }

  /**
   * Cache testimonials data
   */
  async getTestimonials() {
    return this.getData("testimonials");
  }

  async setTestimonials(testimonials) {
    return this.setData("testimonials", testimonials, 1800); // 30 minutes
  }

  /**
   * Cache trust badges data
   */
  async getTrustBadges() {
    return this.getData("trust_badges");
  }

  async setTrustBadges(badges) {
    return this.setData("trust_badges", badges, 7200); // 2 hours
  }

  /**
   * Cache affiliate data (personalized content)
   */
  async getAffiliateData(affiliateId) {
    return this.getData(`affiliate:${affiliateId}`);
  }

  async setAffiliateData(affiliateId, data) {
    return this.setData(`affiliate:${affiliateId}`, data, 900); // 15 minutes
  }

  /**
   * Cache A/B test variations
   */
  async getABTestVariation(testName, userId) {
    return this.getData(`ab_test:${testName}:${userId}`);
  }

  async setABTestVariation(testName, userId, variation) {
    return this.setData(`ab_test:${testName}:${userId}`, variation, 86400); // 24 hours
  }

  /**
   * Cache analytics events (batch processing)
   */
  async getAnalyticsEvents() {
    return this.getData("analytics_events");
  }

  async setAnalyticsEvents(events) {
    return this.setData("analytics_events", events, 300); // 5 minutes
  }

  /**
   * Cache SEO metadata
   */
  async getSEOData(path) {
    return this.getData(`seo:${path}`);
  }

  async setSEOData(path, seoData) {
    return this.setData(`seo:${path}`, seoData, 7200); // 2 hours
  }

  /**
   * Cache performance metrics
   */
  async getPerformanceMetrics() {
    return this.getData("performance_metrics");
  }

  async setPerformanceMetrics(metrics) {
    return this.setData("performance_metrics", metrics, 600); // 10 minutes
  }

  /**
   * Batch invalidate multiple cache keys
   */
  async invalidateMultiple(types) {
    try {
      const promises = types.map((type) => this.invalidate(type));
      await Promise.all(promises);
      return true;
    } catch (error) {
      logger.error("Landing cache batch invalidate error", {
        types,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Warm up cache with common data
   */
  async warmUpCache() {
    try {
      logger.info("Warming up landing page cache");

      // This would typically be called with actual data fetching functions
      // For now, we'll just log the action
      const warmUpActions = [
        "customer_logos",
        "stats",
        "feature_showcase",
        "use_cases",
        "testimonials",
        "trust_badges",
      ];

      logger.info(`Cache warm up initiated for: ${warmUpActions.join(", ")}`);
      return true;
    } catch (error) {
      logger.error("Landing cache warm up error", { error: error.message });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      // This would require Redis INFO command or similar
      // For now, return basic status
      return {
        available: cacheService.isAvailable(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Landing cache stats error", { error: error.message });
      return null;
    }
  }
}

// Create singleton instance
const landingPageCache = new LandingPageCache();

export default landingPageCache;
