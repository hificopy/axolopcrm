/**
 * Dashboard API Routes
 * Consolidated cached endpoint for dashboard data
 * Uses Redis caching for 10 minute TTL (user selected for max speed)
 */

import express from "express";
import { supabaseServer } from "../config/supabase-auth.js";
import logger from "../utils/logger.js";
import { authenticateUser } from "../middleware/auth.js";
import cacheService from "../utils/cache.js";

const router = express.Router();

// Cache TTL: 10 minutes (600 seconds) - user selected for maximum speed
const DASHBOARD_CACHE_TTL = 600;

/**
 * GET /api/dashboard/summary
 * Returns all dashboard data in a single cached response
 * This replaces multiple API calls with one cached call
 */
router.get("/summary", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = "7d" } = req.query;

    // Generate cache key
    const cacheKey = cacheService.key(
      "dashboard",
      "summary",
      userId,
      timeRange,
    );

    // Use cache-aside pattern: check cache first, fetch if miss
    const data = await cacheService.getOrSet(
      cacheKey,
      async () => {
        logger.info("Dashboard cache miss - fetching from database", {
          userId,
          timeRange,
        });

        // Fetch all dashboard data in parallel
        const [overview, sales, marketing, recentLeads, recentActivities] =
          await Promise.all([
            getOverviewStats(userId),
            getSalesStats(userId),
            getMarketingStats(userId),
            getRecentLeads(userId, 10),
            getRecentActivities(userId, 20),
          ]);

        return {
          overview,
          sales,
          marketing,
          recentLeads,
          recentActivities,
          fetchedAt: new Date().toISOString(),
        };
      },
      DASHBOARD_CACHE_TTL,
    );

    logger.debug("Dashboard summary served", {
      userId,
      cached:
        !data.fetchedAt ||
        Date.now() - new Date(data.fetchedAt).getTime() > 1000,
    });

    res.json({
      success: true,
      data,
      cached: true, // Response may be cached
      cacheTtl: DASHBOARD_CACHE_TTL,
    });
  } catch (error) {
    logger.error("Error fetching dashboard summary", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
      message: error.message,
    });
  }
});

/**
 * POST /api/dashboard/invalidate
 * Manually invalidate dashboard cache (for use after CRUD operations)
 */
router.post("/invalidate", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Invalidate all dashboard caches for this user
    await cacheService.delPattern(
      cacheService.key("dashboard", "*", userId, "*"),
    );
    await cacheService.delPattern(cacheService.key("stats", "*", userId));

    logger.info("Dashboard cache invalidated", { userId });

    res.json({
      success: true,
      message: "Dashboard cache invalidated",
    });
  } catch (error) {
    logger.error("Error invalidating dashboard cache", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: "Failed to invalidate cache",
    });
  }
});

// ================================
// Helper Functions
// ================================

/**
 * Get overview counts for all major entities
 */
async function getOverviewStats(userId) {
  const [
    formsResult,
    formSubmissionsResult,
    contactsResult,
    leadsResult,
    opportunitiesResult,
    dealsResult,
    campaignsResult,
  ] = await Promise.all([
    supabase
      .from("forms")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("email_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  return {
    forms: {
      total: formsResult.count || 0,
      submissions: formSubmissionsResult.count || 0,
    },
    contacts: { total: contactsResult.count || 0 },
    leads: { total: leadsResult.count || 0 },
    opportunities: { total: opportunitiesResult.count || 0 },
    deals: { total: dealsResult.count || 0 },
    marketing: { campaigns: campaignsResult.count || 0 },
  };
}

/**
 * Get sales-specific metrics
 */
async function getSalesStats(userId) {
  const [
    leadsResult,
    qualifiedLeadsResult,
    opportunitiesResult,
    dealsResult,
    wonDealsResult,
    revenueResult,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "QUALIFIED"),
    supabase
      .from("opportunities")
      .select("id, value", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "WON"),
    supabase
      .from("deals")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "WON"),
  ]);

  const pipelineValue = (opportunitiesResult.data || []).reduce(
    (sum, opp) => sum + (opp.value || 0),
    0,
  );
  const totalRevenue = (revenueResult.data || []).reduce(
    (sum, deal) => sum + (deal.amount || 0),
    0,
  );

  return {
    leads: {
      total: leadsResult.count || 0,
      qualified: qualifiedLeadsResult.count || 0,
    },
    opportunities: { total: opportunitiesResult.count || 0, pipelineValue },
    deals: {
      total: dealsResult.count || 0,
      won: wonDealsResult.count || 0,
      revenue: totalRevenue,
    },
  };
}

/**
 * Get marketing-specific metrics
 */
async function getMarketingStats(userId) {
  const [
    formsResult,
    submissionsResult,
    campaignsResult,
    activeCampaignsResult,
  ] = await Promise.all([
    supabase
      .from("forms")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("email_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("email_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  return {
    forms: {
      total: formsResult.count || 0,
      submissions: submissionsResult.count || 0,
    },
    campaigns: {
      total: campaignsResult.count || 0,
      active: activeCampaignsResult.count || 0,
    },
  };
}

/**
 * Get recent leads for dashboard widget
 */
async function getRecentLeads(userId, limit = 10) {
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, email, company, status, value, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Error fetching recent leads", { error: error.message });
    return [];
  }

  return data || [];
}

/**
 * Get recent activities for dashboard widget
 */
async function getRecentActivities(userId, limit = 20) {
  const { data, error } = await supabase
    .from("activities")
    .select("id, type, description, created_at, lead_id, contact_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Error fetching recent activities", { error: error.message });
    return [];
  }

  return data || [];
}

export default router;
