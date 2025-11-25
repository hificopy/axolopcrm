/**
 * Statistics and Metrics API Routes
 * Provides aggregated counts and metrics from database
 */

import express from "express";
import { supabase } from "../config/supabase-auth.js";
import logger from "../utils/logger.js";
import { authenticateUser } from "../middleware/auth.js";
import metricsReliabilityDetector from "../utils/metrics-reliability.js";

const router = express.Router();

/**
 * GET /api/stats/overview
 * Get overall system stats (counts of all major entities)
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
        // Forms count
        supabase
          .from("forms")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Form submissions count
        supabase
          .from("form_submissions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

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

        // Opportunities count
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Deals count (won opportunities)
        supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Email campaigns count
        supabase
          .from("email_campaigns")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);

      // Check for errors
      if (formsResult.error) throw formsResult.error;
      if (formSubmissionsResult.error) throw formSubmissionsResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (leadsResult.error) throw leadsResult.error;
      if (opportunitiesResult.error) throw opportunitiesResult.error;
      if (dealsResult.error) throw dealsResult.error;
      if (campaignsResult.error) throw campaignsResult.error;

      const stats = {
        forms: {
          total: formsResult.count || 0,
          submissions: formSubmissionsResult.count || 0,
        },
        contacts: {
          total: contactsResult.count || 0,
        },
        leads: {
          total: leadsResult.count || 0,
        },
        opportunities: {
          total: opportunitiesResult.count || 0,
        },
        deals: {
          total: dealsResult.count || 0,
        },
        marketing: {
          campaigns: campaignsResult.count || 0,
        },
      };

      logger.info("Stats overview fetched", { userId, stats });
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
 */
router.get("/sales", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch sales data in parallel
    const [
      leadsResult,
      qualifiedLeadsResult,
      opportunitiesResult,
      dealsResult,
      wonDealsResult,
      revenueResult,
    ] = await Promise.all([
      // Total leads
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Qualified leads
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "QUALIFIED"),

      // Total opportunities
      supabase
        .from("opportunities")
        .select("id, value", { count: "exact" })
        .eq("user_id", userId),

      // Total deals
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Won deals
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "WON"),

      // Revenue from won deals
      supabase
        .from("deals")
        .select("amount")
        .eq("user_id", userId)
        .eq("status", "WON"),
    ]);

    // Check for errors
    if (leadsResult.error) throw leadsResult.error;
    if (qualifiedLeadsResult.error) throw qualifiedLeadsResult.error;
    if (opportunitiesResult.error) throw opportunitiesResult.error;
    if (dealsResult.error) throw dealsResult.error;
    if (wonDealsResult.error) throw wonDealsResult.error;
    if (revenueResult.error) throw revenueResult.error;

    // Calculate pipeline value
    const pipelineValue = (opportunitiesResult.data || []).reduce(
      (sum, opp) => sum + (opp.value || 0),
      0,
    );

    // Calculate total revenue
    const totalRevenue = (revenueResult.data || []).reduce(
      (sum, deal) => sum + (deal.amount || 0),
      0,
    );

    const stats = {
      leads: {
        total: leadsResult.count || 0,
        qualified: qualifiedLeadsResult.count || 0,
      },
      opportunities: {
        total: opportunitiesResult.count || 0,
        pipelineValue: pipelineValue,
      },
      deals: {
        total: dealsResult.count || 0,
        won: wonDealsResult.count || 0,
        revenue: totalRevenue,
      },
    };

    logger.info("Sales stats fetched", { userId, stats });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching sales stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to fetch sales stats",
      message: error.message,
    });
  }
});

/**
 * GET /api/stats/marketing
 * Get marketing-specific metrics
 */
router.get("/marketing", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch marketing data in parallel
    const [
      formsResult,
      submissionsResult,
      campaignsResult,
      activeCampaignsResult,
    ] = await Promise.all([
      // Total forms
      supabase
        .from("forms")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Total form submissions
      supabase
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Total email campaigns
      supabase
        .from("email_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Active campaigns
      supabase
        .from("email_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "active"),
    ]);

    // Check for errors
    if (formsResult.error) throw formsResult.error;
    if (submissionsResult.error) throw submissionsResult.error;
    if (campaignsResult.error) throw campaignsResult.error;
    if (activeCampaignsResult.error) throw activeCampaignsResult.error;

    const stats = {
      forms: {
        total: formsResult.count || 0,
        submissions: submissionsResult.count || 0,
      },
      campaigns: {
        total: campaignsResult.count || 0,
        active: activeCampaignsResult.count || 0,
      },
    };

    logger.info("Marketing stats fetched", { userId, stats });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching marketing stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to fetch marketing stats",
      message: error.message,
    });
  }
});

/**
 * GET /api/stats/contacts
 * Get contact-specific metrics
 */
router.get("/contacts", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch contact data in parallel
    const [totalResult, withCompanyResult, withTitleResult, thisMonthResult] =
      await Promise.all([
        // Total contacts
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Contacts with company
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("company", "is", null),

        // Contacts with title
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .not("title", "is", null),

        // Contacts created this month
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1,
            ).toISOString(),
          ),
      ]);

    // Check for errors
    if (totalResult.error) throw totalResult.error;
    if (withCompanyResult.error) throw withCompanyResult.error;
    if (withTitleResult.error) throw withTitleResult.error;
    if (thisMonthResult.error) throw thisMonthResult.error;

    const stats = {
      total: totalResult.count || 0,
      withCompany: withCompanyResult.count || 0,
      withTitle: withTitleResult.count || 0,
      createdThisMonth: thisMonthResult.count || 0,
    };

    logger.info("Contact stats fetched", { userId, stats });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching contact stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to fetch contact stats",
      message: error.message,
    });
  }
});

/**
 * GET /api/stats/leads
 * Get lead-specific metrics
 */
router.get("/leads", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch lead data in parallel
    const [totalResult, qualifiedResult, contactedResult, valueResult] =
      await Promise.all([
        // Total leads
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Qualified leads
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "QUALIFIED"),

        // Contacted leads
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "CONTACTED"),

        // Total value of all leads
        supabase.from("leads").select("value").eq("user_id", userId),
      ]);

    // Check for errors
    if (totalResult.error) throw totalResult.error;
    if (qualifiedResult.error) throw qualifiedResult.error;
    if (contactedResult.error) throw contactedResult.error;
    if (valueResult.error) throw valueResult.error;

    // Calculate total value
    const totalValue = (valueResult.data || []).reduce(
      (sum, lead) => sum + (lead.value || 0),
      0,
    );

    const stats = {
      total: totalResult.count || 0,
      qualified: qualifiedResult.count || 0,
      contacted: contactedResult.count || 0,
      totalValue: totalValue,
    };

    logger.info("Lead stats fetched", { userId, stats });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching lead stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to fetch lead stats",
      message: error.message,
    });
  }
});

/**
 * GET /api/stats/opportunities
 * Get opportunity-specific metrics
 */
router.get("/opportunities", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch opportunity data
    const [totalResult, valueResult, wonResult, lostResult] = await Promise.all(
      [
        // Total opportunities
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Total value
        supabase.from("opportunities").select("value").eq("user_id", userId),

        // Won opportunities
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "WON"),

        // Lost opportunities
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "LOST"),
      ],
    );

    // Check for errors
    if (totalResult.error) throw totalResult.error;
    if (valueResult.error) throw valueResult.error;
    if (wonResult.error) throw wonResult.error;
    if (lostResult.error) throw lostResult.error;

    // Calculate total and weighted value
    const totalValue = (valueResult.data || []).reduce(
      (sum, opp) => sum + (opp.value || 0),
      0,
    );

    const stats = {
      total: totalResult.count || 0,
      totalValue: totalValue,
      won: wonResult.count || 0,
      lost: lostResult.count || 0,
      winRate:
        (totalResult.count || 0) > 0
          ? Math.round(
              ((wonResult.count || 0) / (totalResult.count || 0)) * 100,
            )
          : 0,
    };

    logger.info("Opportunity stats fetched", { userId, stats });
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching opportunity stats", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to fetch opportunity stats",
      message: error.message,
    });
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
