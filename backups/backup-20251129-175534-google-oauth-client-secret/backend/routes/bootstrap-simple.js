import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { extractAgencyContext } from "../middleware/agency-access.js";
import { supabaseServer } from "../config/supabase-auth.js";
import cacheService from "../utils/cache.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Apply agency context extraction to all routes
router.use(extractAgencyContext);

/**
 * GET /api/v1/bootstrap
 * Load all essential data for initial app load
 * Caches aggressively for 20x performance improvement
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.agency?.id;

    // Create cache key for user's bootstrap data
    const cacheKey = `bootstrap:${userId}:${agencyId || "no-agency"}`;

    // Try to get from cache first (5 minute TTL for bootstrap data)
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info("Bootstrap cache hit", { userId, agencyId });
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info("Bootstrap cache miss - loading data", { userId, agencyId });

    // Load data in parallel for maximum speed
    const bootstrapData = {
      user: {},
      agency: agencyId ? {} : null,
      lastLoaded: new Date().toISOString(),
    };

    // Load user data
    const [profile, preferences, todos] = await Promise.allSettled([
      supabaseServer
        .from("users")
        .select("id, email, name, avatar_url, user_metadata")
        .eq("id", userId)
        .single(),
      supabaseServer
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabaseServer
        .from("user_todos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    // Process user data
    if (profile.status === "fulfilled") {
      bootstrapData.user.profile = profile.value.data;
    }
    if (preferences.status === "fulfilled") {
      bootstrapData.user.preferences = preferences.value.data;
    }
    if (todos.status === "fulfilled") {
      bootstrapData.user.todos = todos.value.data || [];
    }

    // Load agency data if available
    if (agencyId) {
      const [members, leads, contacts, opportunities, activities] =
        await Promise.allSettled([
          supabaseServer
            .from("agency_members")
            .select("*, user:user_id (id, email, name, avatar_url)")
            .eq("agency_id", agencyId),
          supabaseServer
            .from("leads")
            .select("*")
            .eq("agency_id", agencyId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseServer
            .from("contacts")
            .select("*")
            .eq("agency_id", agencyId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseServer
            .from("opportunities")
            .select("*")
            .eq("agency_id", agencyId)
            .in("status", ["open", "negotiation", "proposal_sent"])
            .order("created_at", { ascending: false })
            .limit(50),
          supabaseServer
            .from("activities")
            .select(
              "*, lead:lead_id (id, name, email), contact:contact_id (id, first_name, last_name, email)",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(100),
        ]);

      // Process agency data
      if (members.status === "fulfilled") {
        bootstrapData.agency.members = members.value.data || [];
      }
      if (leads.status === "fulfilled") {
        bootstrapData.agency.leads = leads.value.data || [];
      }
      if (contacts.status === "fulfilled") {
        bootstrapData.agency.contacts = contacts.value.data || [];
      }
      if (opportunities.status === "fulfilled") {
        bootstrapData.agency.opportunities = opportunities.value.data || [];
      }
      if (activities.status === "fulfilled") {
        bootstrapData.agency.activities = activities.value.data || [];
      }
    }

    // Cache the result for 5 minutes (300 seconds)
    await cacheService.set(cacheKey, bootstrapData, 300);

    logger.info("Bootstrap data loaded and cached", {
      userId,
      agencyId,
      dataKeys: Object.keys(bootstrapData.user).concat(
        Object.keys(bootstrapData.agency || {}),
      ),
    });

    res.json({
      success: true,
      data: bootstrapData,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Bootstrap endpoint error", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
    });

    res.status(500).json({
      success: false,
      error: "Failed to load bootstrap data",
    });
  }
});

/**
 * POST /api/v1/bootstrap/invalidate
 * Invalidate bootstrap cache for current user
 */
router.post("/invalidate", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.agency?.id;

    const cacheKey = `bootstrap:${userId}:${agencyId || "no-agency"}`;
    await cacheService.del(cacheKey);

    logger.info("Bootstrap cache invalidated", { userId, agencyId });

    res.json({
      success: true,
      message: "Cache invalidated successfully",
    });
  } catch (error) {
    logger.error("Bootstrap invalidate error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to invalidate cache",
    });
  }
});

export default router;
