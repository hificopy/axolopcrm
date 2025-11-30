/**
 * Unified Dashboard API Route
 * Replaces multiple separate API calls with single optimized endpoint
 * Implements tiered caching strategy for maximum performance
 */

import express from "express";
import { supabase } from "../config/supabase-auth.js";
import logger from "../utils/logger.js";
import { authenticateUser } from "../middleware/auth.js";
import cacheService from "../utils/cache.js";

const router = express.Router();

// Tiered cache TTLs based on data change frequency
const CACHE_TIERS = {
  realtime: 30, // 30 seconds - leads, activities, recent data
  hourly: 3600, // 1 hour - deals, opportunities, campaigns
  daily: 86400, // 24 hours - forms, contacts, historical data
};

/**
 * GET /api/v2/dashboard/summary
 * Unified dashboard endpoint with tiered caching
 * Query params:
 * - timeRange: week|month|quarter|year
 * - include: realtime|hourly|daily|all (default: all)
 */
router.get("/summary", authenticateUser, async (req, res) => {
  const startTime = Date.now();
  const { timeRange = "month", include = "all" } = req.query;
  const userId = req.user.id;

  try {
    // Determine cache tiers based on include parameter
    const includeRealtime = include === "all" || include === "realtime";
    const includeHourly = include === "all" || include === "hourly";
    const includeDaily = include === "all" || include === "daily";

    // Generate cache keys for different tiers
    const cacheKeys = {
      realtime: includeRealtime
        ? cacheService.key("dashboard", "v2", "realtime", userId, timeRange)
        : null,
      hourly: includeHourly
        ? cacheService.key("dashboard", "v2", "hourly", userId, timeRange)
        : null,
      daily: includeDaily
        ? cacheService.key("dashboard", "v2", "daily", userId, timeRange)
        : null,
    };

    // Try to get data from cache by tier
    let cachedData = {};
    let cacheHits = 0;

    if (includeRealtime && cacheKeys.realtime) {
      const realtimeData = await cacheService.get(cacheKeys.realtime);
      if (realtimeData) {
        cachedData.realtime = realtimeData;
        cacheHits++;
      }
    }

    if (includeHourly && cacheKeys.hourly) {
      const hourlyData = await cacheService.get(cacheKeys.hourly);
      if (hourlyData) {
        cachedData.hourly = hourlyData;
        cacheHits++;
      }
    }

    if (includeDaily && cacheKeys.daily) {
      const dailyData = await cacheService.get(cacheKeys.daily);
      if (dailyData) {
        cachedData.daily = dailyData;
        cacheHits++;
      }
    }

    // If we have all requested data from cache, return it
    const expectedTiers =
      (includeRealtime ? 1 : 0) +
      (includeHourly ? 1 : 0) +
      (includeDaily ? 1 : 0);
    if (cacheHits === expectedTiers) {
      const responseTime = Date.now() - startTime;
      logger.debug(
        `Dashboard served from cache (${cacheHits}/${expectedTiers} tiers)`,
        {
          userId,
          responseTime,
          timeRange,
        },
      );

      return res.json({
        success: true,
        data: mergeCachedData(cachedData, include),
        source: "cache",
        responseTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Cache miss - fetch data from database
    logger.debug(
      `Cache miss for dashboard tiers (${cacheHits}/${expectedTiers})`,
      { userId, timeRange },
    );

    const freshData = await fetchDashboardData(userId, timeRange, {
      includeRealtime,
      includeHourly,
      includeDaily,
    });

    // Cache the fresh data by tier
    const cachePromises = [];

    if (includeRealtime && freshData.realtime && cacheKeys.realtime) {
      cachePromises.push(
        cacheService.set(
          cacheKeys.realtime,
          freshData.realtime,
          CACHE_TIERS.realtime,
        ),
      );
    }

    if (includeHourly && freshData.hourly && cacheKeys.hourly) {
      cachePromises.push(
        cacheService.set(
          cacheKeys.hourly,
          freshData.hourly,
          CACHE_TIERS.hourly,
        ),
      );
    }

    if (includeDaily && freshData.daily && cacheKeys.daily) {
      cachePromises.push(
        cacheService.set(cacheKeys.daily, freshData.daily, CACHE_TIERS.daily),
      );
    }

    // Execute cache operations in parallel (don't wait for them)
    Promise.all(cachePromises).catch((error) => {
      logger.error("Error caching dashboard data", {
        error: error.message,
        userId,
      });
    });

    const responseTime = Date.now() - startTime;
    logger.info(`Dashboard data fetched and cached`, {
      userId,
      responseTime,
      timeRange,
      tiersCached: cachePromises.length,
    });

    res.json({
      success: true,
      data: freshData,
      source: "database",
      responseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error("Error fetching dashboard summary", {
      error: error.message,
      stack: error.stack,
      userId,
      responseTime,
    });

    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
      message: error.message,
      responseTime,
    });
  }
});

/**
 * Fetch dashboard data from database with optimized queries
 */
async function fetchDashboardData(userId, timeRange, options) {
  const { includeRealtime, includeHourly, includeDaily } = options;
  const dateRange = getDateRange(timeRange);

  const result = {};

  // Parallel data fetching by tier
  const promises = [];

  // Realtime data (changes frequently)
  if (includeRealtime) {
    promises.push(
      fetchRealtimeData(userId, dateRange)
        .then((data) => {
          result.realtime = data;
        })
        .catch((error) => {
          logger.error("Error fetching realtime data", {
            error: error.message,
            userId,
          });
          result.realtime = getEmptyRealtimeData();
        }),
    );
  }

  // Hourly data (moderately frequent changes)
  if (includeHourly) {
    promises.push(
      fetchHourlyData(userId, dateRange)
        .then((data) => {
          result.hourly = data;
        })
        .catch((error) => {
          logger.error("Error fetching hourly data", {
            error: error.message,
            userId,
          });
          result.hourly = getEmptyHourlyData();
        }),
    );
  }

  // Daily data (infrequent changes)
  if (includeDaily) {
    promises.push(
      fetchDailyData(userId, dateRange)
        .then((data) => {
          result.daily = data;
        })
        .catch((error) => {
          logger.error("Error fetching daily data", {
            error: error.message,
            userId,
          });
          result.daily = getEmptyDailyData();
        }),
    );
  }

  await Promise.all(promises);
  return result;
}

/**
 * Fetch realtime data (leads, activities, recent changes)
 */
async function fetchRealtimeData(userId, dateRange) {
  // Use a single aggregated query instead of multiple separate queries
  const { data, error } = await supabase.rpc("get_dashboard_realtime_data", {
    p_user_id: userId,
    p_start_date: dateRange.start,
    p_end_date: dateRange.end,
  });

  if (error) throw error;

  return data || getEmptyRealtimeData();
}

/**
 * Fetch hourly data (deals, opportunities, campaigns)
 */
async function fetchHourlyData(userId, dateRange) {
  const { data, error } = await supabase.rpc("get_dashboard_hourly_data", {
    p_user_id: userId,
    p_start_date: dateRange.start,
    p_end_date: dateRange.end,
  });

  if (error) throw error;

  return data || getEmptyHourlyData();
}

/**
 * Fetch daily data (forms, contacts, historical data)
 */
async function fetchDailyData(userId, dateRange) {
  const { data, error } = await supabase.rpc("get_dashboard_daily_data", {
    p_user_id: userId,
    p_start_date: dateRange.start,
    p_end_date: dateRange.end,
  });

  if (error) throw error;

  return data || getEmptyDailyData();
}

/**
 * Get date range for time period
 */
function getDateRange(timeRange) {
  const now = new Date();
  const start = new Date();

  switch (timeRange) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

/**
 * Merge cached data from different tiers
 */
function mergeCachedData(cachedData, include) {
  const merged = {};

  if (include === "all" || include === "realtime") {
    Object.assign(merged, cachedData.realtime || {});
  }
  if (include === "all" || include === "hourly") {
    Object.assign(merged, cachedData.hourly || {});
  }
  if (include === "all" || include === "daily") {
    Object.assign(merged, cachedData.daily || {});
  }

  return merged;
}

// Empty data fallbacks
function getEmptyRealtimeData() {
  return {
    recentLeads: [],
    recentActivities: [],
    activeDeals: 0,
    todayStats: {
      newLeads: 0,
      newContacts: 0,
      activities: 0,
    },
  };
}

function getEmptyHourlyData() {
  return {
    sales: {
      totalRevenue: 0,
      activeDeals: 0,
      newLeads: 0,
      conversionRate: 0,
      avgDealSize: 0,
      winRate: 0,
      pipelineValue: 0,
    },
    marketing: {
      activeCampaigns: 0,
      emailOpens: 0,
      clickRate: 0,
      totalSubscribers: 0,
      engagementRate: 0,
    },
    opportunities: {
      total: 0,
      totalValue: 0,
      won: 0,
      lost: 0,
      winRate: 0,
    },
  };
}

function getEmptyDailyData() {
  return {
    overview: {
      forms: { total: 0, submissions: 0 },
      contacts: { total: 0 },
      leads: { total: 0 },
      deals: { total: 0 },
    },
    forms: {
      total: 0,
      submissions: 0,
      conversionRate: 0,
    },
    profitLoss: {
      revenue: 0,
      expenses: 0,
      netProfit: 0,
    },
  };
}

/**
 * GET /api/v2/dashboard/health
 * Health check for dashboard endpoints
 */
router.get("/health", async (req, res) => {
  try {
    const startTime = Date.now();

    // Test cache availability
    const cacheAvailable = cacheService.isAvailable();

    // Test database connection
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: {
          status: error ? "error" : "healthy",
          error: error?.message || null,
        },
        cache: {
          status: cacheAvailable ? "healthy" : "unavailable",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
