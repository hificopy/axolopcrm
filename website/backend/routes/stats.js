/**
 * Statistics and Metrics API Routes
 * Provides aggregated counts and metrics from database
 * Now with Redis caching for improved performance (10 min TTL)
 */

import express from "express";
import { supabase } from "../config/supabase-auth.js";
import logger from "../utils/logger.js";
import { authenticateUser } from "../middleware/auth.js";
import metricsReliabilityDetector from "../utils/metrics-reliability.js";
import cacheService from "../utils/cache.js";

const router = express.Router();

// Cache TTL: 10 minutes (600 seconds) for stats endpoints
const STATS_CACHE_TTL = 600;

/**
 * GET /api/stats/overview
 * Get overall system stats (counts of all major entities)
 * Cached for 10 minutes
 */
router.get(
  "/overview",
  metricsReliabilityDetector.addReliabilityMetadata.bind(
    metricsReliabilityDetector,
  ),
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const cacheKey = cacheService.key("stats", "overview", userId);

      const stats = await cacheService.getOrSet(
        cacheKey,
        async () => {
          // Fetch counts in parallel
          const [
            formsResult,
            formSubmissionsResult,
            contactsResult,
            leadsResult,
            opportunitiesResult,
            dealsResult,
            campaignsResult,
          ] = await Promise.all([
            supabase.from("forms").select("id", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("form_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("deals").select("id", { count: "exact", head: true }).eq("user_id", userId),
            supabase.from("email_campaigns").select("id", { count: "exact", head: true }).eq("user_id", userId),
          ]);

          // Check for errors
          if (formsResult.error) throw formsResult.error;
          if (formSubmissionsResult.error) throw formSubmissionsResult.error;
          if (contactsResult.error) throw contactsResult.error;
          if (leadsResult.error) throw leadsResult.error;
          if (opportunitiesResult.error) throw opportunitiesResult.error;
          if (dealsResult.error) throw dealsResult.error;
          if (campaignsResult.error) throw campaignsResult.error;

          return {
            forms: { total: formsResult.count || 0, submissions: formSubmissionsResult.count || 0 },
            contacts: { total: contactsResult.count || 0 },
            leads: { total: leadsResult.count || 0 },
            opportunities: { total: opportunitiesResult.count || 0 },
            deals: { total: dealsResult.count || 0 },
            marketing: { campaigns: campaignsResult.count || 0 },
          };
        },
        STATS_CACHE_TTL
      );

      logger.debug("Stats overview served", { userId });
      res.json(stats);
    } catch (error) {
      logger.error("Error fetching stats overview", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        error: "Failed to fetch stats",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/stats/sales
 * Get sales-specific metrics
 * Cached for 10 minutes
 */
router.get("/sales", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheService.key("stats", "sales", userId);

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [
          leadsResult,
          qualifiedLeadsResult,
          opportunitiesResult,
          dealsResult,
          wonDealsResult,
          revenueResult,
        ] = await Promise.all([
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "QUALIFIED"),
          supabase.from("opportunities").select("id, value", { count: "exact" }).eq("user_id", userId),
          supabase.from("deals").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("deals").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "WON"),
          supabase.from("deals").select("amount").eq("user_id", userId).eq("status", "WON"),
        ]);

        if (leadsResult.error) throw leadsResult.error;
        if (qualifiedLeadsResult.error) throw qualifiedLeadsResult.error;
        if (opportunitiesResult.error) throw opportunitiesResult.error;
        if (dealsResult.error) throw dealsResult.error;
        if (wonDealsResult.error) throw wonDealsResult.error;
        if (revenueResult.error) throw revenueResult.error;

        const pipelineValue = (opportunitiesResult.data || []).reduce((sum, opp) => sum + (opp.value || 0), 0);
        const totalRevenue = (revenueResult.data || []).reduce((sum, deal) => sum + (deal.amount || 0), 0);

        return {
          leads: { total: leadsResult.count || 0, qualified: qualifiedLeadsResult.count || 0 },
          opportunities: { total: opportunitiesResult.count || 0, pipelineValue },
          deals: { total: dealsResult.count || 0, won: wonDealsResult.count || 0, revenue: totalRevenue },
        };
      },
      STATS_CACHE_TTL
    );

    logger.debug("Sales stats served", { userId });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching sales stats", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to fetch sales stats", message: error.message });
  }
});

/**
 * GET /api/stats/marketing
 * Get marketing-specific metrics
 * Cached for 10 minutes
 */
router.get("/marketing", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheService.key("stats", "marketing", userId);

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [formsResult, submissionsResult, campaignsResult, activeCampaignsResult] = await Promise.all([
          supabase.from("forms").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("form_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("email_campaigns").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("email_campaigns").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
        ]);

        if (formsResult.error) throw formsResult.error;
        if (submissionsResult.error) throw submissionsResult.error;
        if (campaignsResult.error) throw campaignsResult.error;
        if (activeCampaignsResult.error) throw activeCampaignsResult.error;

        return {
          forms: { total: formsResult.count || 0, submissions: submissionsResult.count || 0 },
          campaigns: { total: campaignsResult.count || 0, active: activeCampaignsResult.count || 0 },
        };
      },
      STATS_CACHE_TTL
    );

    logger.debug("Marketing stats served", { userId });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching marketing stats", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to fetch marketing stats", message: error.message });
  }
});

/**
 * GET /api/stats/contacts
 * Get contact-specific metrics
 * Cached for 10 minutes
 */
router.get("/contacts", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheService.key("stats", "contacts", userId);

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const [totalResult, withCompanyResult, withTitleResult, thisMonthResult] = await Promise.all([
          supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", userId).not("company", "is", null),
          supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", userId).not("title", "is", null),
          supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", monthStart),
        ]);

        if (totalResult.error) throw totalResult.error;
        if (withCompanyResult.error) throw withCompanyResult.error;
        if (withTitleResult.error) throw withTitleResult.error;
        if (thisMonthResult.error) throw thisMonthResult.error;

        return {
          total: totalResult.count || 0,
          withCompany: withCompanyResult.count || 0,
          withTitle: withTitleResult.count || 0,
          createdThisMonth: thisMonthResult.count || 0,
        };
      },
      STATS_CACHE_TTL
    );

    logger.debug("Contact stats served", { userId });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching contact stats", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to fetch contact stats", message: error.message });
  }
});

/**
 * GET /api/stats/leads
 * Get lead-specific metrics
 * Cached for 10 minutes
 */
router.get("/leads", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheService.key("stats", "leads", userId);

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [totalResult, qualifiedResult, contactedResult, valueResult] = await Promise.all([
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "QUALIFIED"),
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "CONTACTED"),
          supabase.from("leads").select("value").eq("user_id", userId),
        ]);

        if (totalResult.error) throw totalResult.error;
        if (qualifiedResult.error) throw qualifiedResult.error;
        if (contactedResult.error) throw contactedResult.error;
        if (valueResult.error) throw valueResult.error;

        const totalValue = (valueResult.data || []).reduce((sum, lead) => sum + (lead.value || 0), 0);

        return {
          total: totalResult.count || 0,
          qualified: qualifiedResult.count || 0,
          contacted: contactedResult.count || 0,
          totalValue,
        };
      },
      STATS_CACHE_TTL
    );

    logger.debug("Lead stats served", { userId });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching lead stats", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to fetch lead stats", message: error.message });
  }
});

/**
 * GET /api/stats/opportunities
 * Get opportunity-specific metrics
 * Cached for 10 minutes
 */
router.get("/opportunities", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = cacheService.key("stats", "opportunities", userId);

    const stats = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [totalResult, valueResult, wonResult, lostResult] = await Promise.all([
          supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("opportunities").select("value").eq("user_id", userId),
          supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "WON"),
          supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "LOST"),
        ]);

        if (totalResult.error) throw totalResult.error;
        if (valueResult.error) throw valueResult.error;
        if (wonResult.error) throw wonResult.error;
        if (lostResult.error) throw lostResult.error;

        const totalValue = (valueResult.data || []).reduce((sum, opp) => sum + (opp.value || 0), 0);

        return {
          total: totalResult.count || 0,
          totalValue,
          won: wonResult.count || 0,
          lost: lostResult.count || 0,
          winRate: (totalResult.count || 0) > 0 ? Math.round(((wonResult.count || 0) / (totalResult.count || 0)) * 100) : 0,
        };
      },
      STATS_CACHE_TTL
    );

    logger.debug("Opportunity stats served", { userId });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching opportunity stats", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to fetch opportunity stats", message: error.message });
  }
});

/**
 * GET /api/stats/health
 * Health check for metrics endpoints
 */
router.get("/health", async (req, res) => {
  try {
    const health =
      await metricsReliabilityDetector.performHealthCheck(supabase);
    res.json(health);
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/stats/reliability
 * Get reliability statistics for monitoring
 */
router.get("/reliability", async (req, res) => {
  try {
    const stats = metricsReliabilityDetector.getReliabilityStats();
    res.json(stats);
  } catch (error) {
    logger.error("Reliability stats failed", { error: error.message });
    res.status(500).json({
      error: "Failed to get reliability stats",
      message: error.message,
    });
  }
});

export default router;
