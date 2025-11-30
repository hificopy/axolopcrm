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
 * Uses direct Supabase queries instead of RPC for better compatibility
 */
async function fetchRealtimeData(userId, dateRange) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Parallel queries for realtime data
    const [recentLeadsResult, recentActivitiesResult, activeDealsResult, todayLeadsResult, todayContactsResult, todayActivitiesResult] = await Promise.all([
      // Recent leads (last 10)
      supabase
        .from("leads")
        .select("id, name, email, status, created_at, value")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      // Recent activities (last 10)
      supabase
        .from("activities")
        .select("id, type, title, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      // Active deals count
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "new", "qualified", "proposal", "negotiation"]),
      // Today's new leads
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayStr),
      // Today's new contacts
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayStr),
      // Today's activities
      supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayStr),
    ]);

    return {
      recentLeads: recentLeadsResult.data || [],
      recentActivities: recentActivitiesResult.data || [],
      activeDeals: activeDealsResult.count || 0,
      todayStats: {
        newLeads: todayLeadsResult.count || 0,
        newContacts: todayContactsResult.count || 0,
        activities: todayActivitiesResult.count || 0,
      },
    };
  } catch (error) {
    logger.error("Error in fetchRealtimeData", { error: error.message, userId });
    return getEmptyRealtimeData();
  }
}

/**
 * Fetch hourly data (deals, opportunities, campaigns)
 * Uses direct Supabase queries instead of RPC for better compatibility
 */
async function fetchHourlyData(userId, dateRange) {
  try {
    const [dealsResult, wonDealsResult, opportunitiesResult, campaignsResult, emailStatsResult] = await Promise.all([
      // All deals in date range
      supabase
        .from("deals")
        .select("id, amount, status, created_at")
        .eq("user_id", userId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end),
      // Won deals for revenue
      supabase
        .from("deals")
        .select("amount")
        .eq("user_id", userId)
        .in("status", ["WON", "won"])
        .gte("closed_at", dateRange.start)
        .lte("closed_at", dateRange.end),
      // Opportunities
      supabase
        .from("opportunities")
        .select("id, value, status, stage")
        .eq("user_id", userId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end),
      // Active campaigns
      supabase
        .from("email_campaigns")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "active"),
      // Email stats
      supabase
        .from("email_campaigns")
        .select("sent_count, opened_count, clicked_count")
        .eq("user_id", userId)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end),
    ]);

    const deals = dealsResult.data || [];
    const wonDeals = wonDealsResult.data || [];
    const opportunities = opportunitiesResult.data || [];
    const emailStats = emailStatsResult.data || [];

    // Calculate revenue
    const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Calculate pipeline value
    const pipelineDeals = deals.filter(d =>
      ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "new", "qualified", "proposal", "negotiation"].includes(d.status)
    );
    const pipelineValue = pipelineDeals.reduce((sum, d) => sum + (d.amount || 0), 0) +
      opportunities.reduce((sum, o) => sum + (o.value || 0), 0);

    // Calculate win rate
    const totalClosed = deals.filter(d => ["WON", "LOST", "won", "lost"].includes(d.status)).length;
    const wonCount = deals.filter(d => ["WON", "won"].includes(d.status)).length;
    const lostCount = deals.filter(d => ["LOST", "lost"].includes(d.status)).length;
    const winRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0;

    // Calculate email metrics
    const totalSent = emailStats.reduce((sum, c) => sum + (c.sent_count || 0), 0);
    const totalOpened = emailStats.reduce((sum, c) => sum + (c.opened_count || 0), 0);
    const totalClicked = emailStats.reduce((sum, c) => sum + (c.clicked_count || 0), 0);

    return {
      sales: {
        totalRevenue,
        activeDeals: pipelineDeals.length,
        newLeads: deals.length,
        conversionRate: totalClosed > 0 ? (wonCount / deals.length) * 100 : 0,
        avgDealSize: wonCount > 0 ? totalRevenue / wonCount : 0,
        winRate: Math.round(winRate * 10) / 10,
        pipelineValue,
      },
      marketing: {
        activeCampaigns: campaignsResult.data?.length || 0,
        emailOpens: totalOpened,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        totalSubscribers: 0, // Would need email_subscribers table
        engagementRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      },
      opportunities: {
        total: opportunities.length,
        totalValue: opportunities.reduce((sum, o) => sum + (o.value || 0), 0),
        won: opportunities.filter(o => ["WON", "won"].includes(o.status || o.stage)).length,
        lost: opportunities.filter(o => ["LOST", "lost"].includes(o.status || o.stage)).length,
        winRate: opportunities.length > 0 ?
          (opportunities.filter(o => ["WON", "won"].includes(o.status || o.stage)).length / opportunities.length) * 100 : 0,
      },
    };
  } catch (error) {
    logger.error("Error in fetchHourlyData", { error: error.message, userId });
    return getEmptyHourlyData();
  }
}

/**
 * Fetch daily data (forms, contacts, historical data)
 * Uses direct Supabase queries instead of RPC for better compatibility
 */
async function fetchDailyData(userId, dateRange) {
  try {
    const [formsResult, formSubmissionsResult, contactsResult, leadsResult, dealsResult, expensesResult, revenueResult] = await Promise.all([
      // Forms count
      supabase
        .from("forms")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // Form submissions
      supabase
        .from("form_submissions")
        .select("id, converted_to_lead", { count: "exact" })
        .eq("user_id", userId)
        .gte("submitted_at", dateRange.start)
        .lte("submitted_at", dateRange.end),
      // Contacts count
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // Leads count
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // Deals count
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // Expenses (for profit/loss)
      supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", userId)
        .gte("date", dateRange.start)
        .lte("date", dateRange.end),
      // Revenue from won deals
      supabase
        .from("deals")
        .select("amount")
        .eq("user_id", userId)
        .in("status", ["WON", "won"])
        .gte("closed_at", dateRange.start)
        .lte("closed_at", dateRange.end),
    ]);

    const submissions = formSubmissionsResult.data || [];
    const convertedSubmissions = submissions.filter(s => s.converted_to_lead === true).length;
    const submissionCount = formSubmissionsResult.count || submissions.length;

    // Calculate profit/loss
    const expenses = (expensesResult.data || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const revenue = (revenueResult.data || []).reduce((sum, d) => sum + (d.amount || 0), 0);

    return {
      overview: {
        forms: { total: formsResult.count || 0, submissions: submissionCount },
        contacts: { total: contactsResult.count || 0 },
        leads: { total: leadsResult.count || 0 },
        deals: { total: dealsResult.count || 0 },
      },
      forms: {
        total: formsResult.count || 0,
        submissions: submissionCount,
        conversionRate: submissionCount > 0 ? (convertedSubmissions / submissionCount) * 100 : 0,
      },
      profitLoss: {
        revenue,
        expenses,
        netProfit: revenue - expenses,
      },
    };
  } catch (error) {
    logger.error("Error in fetchDailyData", { error: error.message, userId });
    return getEmptyDailyData();
  }
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

    // Test database connection - use count instead of single to avoid errors
    const { count, error } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .limit(1);

    const responseTime = Date.now() - startTime;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: {
          status: error ? "error" : "healthy",
          error: error?.message || null,
          testQuery: "leads count",
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
