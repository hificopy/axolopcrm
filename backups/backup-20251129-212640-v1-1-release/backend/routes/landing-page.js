import express from "express";
import landingPageCache from "../services/landing-page-cache.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * GET /api/v1/landing/data
 * Get cached landing page data
 */
router.get("/data", async (req, res) => {
  try {
    const { type, affiliate } = req.query;

    if (type) {
      // Get specific data type
      let data;
      switch (type) {
        case "customer-logos":
          data = await landingPageCache.getCustomerLogos();
          break;
        case "stats":
          data = await landingPageCache.getStats();
          break;
        case "feature-showcase":
          data = await landingPageCache.getFeatureShowcase();
          break;
        case "use-cases":
          data = await landingPageCache.getUseCases();
          break;
        case "testimonials":
          data = await landingPageCache.getTestimonials();
          break;
        case "trust-badges":
          data = await landingPageCache.getTrustBadges();
          break;
        case "affiliate":
          if (!affiliate) {
            return res.status(400).json({
              success: false,
              error: "Affiliate ID required for affiliate data",
            });
          }
          data = await landingPageCache.getAffiliateData(affiliate);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: "Invalid data type",
          });
      }

      return res.json({
        success: true,
        data,
        cached: data !== null,
        type,
      });
    }

    // Get all landing page data
    const [
      customerLogos,
      stats,
      featureShowcase,
      useCases,
      testimonials,
      trustBadges,
    ] = await Promise.all([
      landingPageCache.getCustomerLogos(),
      landingPageCache.getStats(),
      landingPageCache.getFeatureShowcase(),
      landingPageCache.getUseCases(),
      landingPageCache.getTestimonials(),
      landingPageCache.getTrustBadges(),
    ]);

    res.json({
      success: true,
      data: {
        customerLogos,
        stats,
        featureShowcase,
        useCases,
        testimonials,
        trustBadges,
      },
      cached: {
        customerLogos: customerLogos !== null,
        stats: stats !== null,
        featureShowcase: featureShowcase !== null,
        useCases: useCases !== null,
        testimonials: testimonials !== null,
        trustBadges: trustBadges !== null,
      },
    });
  } catch (error) {
    logger.error("Landing data fetch error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to fetch landing page data",
    });
  }
});

/**
 * POST /api/v1/landing/warmup
 * Warm up landing page cache
 */
router.post("/warmup", async (req, res) => {
  try {
    const result = await landingPageCache.warmUpCache();

    res.json({
      success: true,
      message: "Landing page cache warm up initiated",
      result,
    });
  } catch (error) {
    logger.error("Landing cache warm up error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to warm up cache",
    });
  }
});

/**
 * DELETE /api/v1/landing/cache
 * Clear landing page cache
 */
router.delete("/cache", async (req, res) => {
  try {
    const { type } = req.query;

    let result;
    if (type) {
      result = await landingPageCache.invalidate(type);
    } else {
      result = await landingPageCache.clear();
    }

    res.json({
      success: true,
      message: type
        ? `Cache invalidated for ${type}`
        : "All landing page cache cleared",
      result,
    });
  } catch (error) {
    logger.error("Landing cache clear error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to clear cache",
    });
  }
});

/**
 * GET /api/v1/landing/stats
 * Get cache statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await landingPageCache.getCacheStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Landing cache stats error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get cache statistics",
    });
  }
});

/**
 * POST /api/v1/landing/track
 * Track landing page analytics events (batch processing)
 */
router.post("/track", async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: "Events must be an array",
      });
    }

    // Get existing events from cache
    const existingEvents = (await landingPageCache.getAnalyticsEvents()) || [];

    // Add new events
    const updatedEvents = [...existingEvents, ...events];

    // Update cache (will be processed by background job)
    await landingPageCache.setAnalyticsEvents(updatedEvents);

    res.json({
      success: true,
      message: "Events tracked successfully",
      count: events.length,
    });
  } catch (error) {
    logger.error("Landing analytics track error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to track events",
    });
  }
});

/**
 * GET /api/v1/landing/seo/:path
 * Get cached SEO metadata for path
 */
router.get("/seo/:path", async (req, res) => {
  try {
    const { path } = req.params;
    const seoData = await landingPageCache.getSEOData(path);

    if (!seoData) {
      return res.status(404).json({
        success: false,
        error: "SEO data not found",
      });
    }

    res.json({
      success: true,
      data: seoData,
    });
  } catch (error) {
    logger.error("Landing SEO data fetch error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to fetch SEO data",
    });
  }
});

/**
 * POST /api/v1/landing/seo/:path
 * Cache SEO metadata for path
 */
router.post("/seo/:path", async (req, res) => {
  try {
    const { path } = req.params;
    const seoData = req.body;

    await landingPageCache.setSEOData(path, seoData);

    res.json({
      success: true,
      message: "SEO data cached successfully",
      path,
    });
  } catch (error) {
    logger.error("Landing SEO data cache error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to cache SEO data",
    });
  }
});

export default router;
