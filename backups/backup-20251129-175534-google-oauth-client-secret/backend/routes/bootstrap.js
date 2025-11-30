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
    const dataPromises = [];

    // Core user data
    dataPromises.push(
      Promise.all([
        // User profile
        supabaseServer
          .from("users")
          .select("id, email, name, avatar_url, user_metadata")
          .eq("id", userId)
          .single()
          .then(({ data, error }) => ({ data: data, error, type: "profile" })),

        // User preferences
        supabaseServer
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .single()
          .then(({ data, error }) => ({
            data: data,
            error,
            type: "preferences",
          })),

        // User todos
        supabaseServer
          .from("user_todos")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20)
          .then(({ data, error }) => ({
            data: data || [],
            error,
            type: "todos",
          })),
      ]),
    );

    // Agency data (if agency exists)
    if (agencyId) {
      dataPromises.push(
        Promise.all([
          // Agency members
          supabaseServer
            .from("agency_members")
            .select(
              `
              *,
              user:user_id (
                id,
                email,
                name,
                avatar_url
              )
            `,
            )
            .eq("agency_id", agencyId)
            .then(({ data, error }) => ({
              data: data || [],
              error,
              type: "members",
            })),

          // Recent leads (last 50)
          supabaseServer
            .from("leads")
            .select("*")
            .eq("agency_id", agencyId)
            .order("created_at", { ascending: false })
            .limit(50)
            .then(({ data, error }) => ({
              data: data || [],
              error,
              type: "leads",
            })),

          // Recent contacts (last 50)
          supabaseServer
            .from("contacts")
            .select("*")
            .eq("agency_id", agencyId)
            .order("created_at", { ascending: false })
            .limit(50)
            .then(({ data, error }) => ({
              data: data || [],
              error,
              type: "contacts",
            })),

          // Active opportunities
          supabaseServer
            .from("opportunities")
            .select("*")
            .eq("agency_id", agencyId)
            .in("status", ["open", "negotiation", "proposal_sent"])
            .order("created_at", { ascending: false })
            .limit(50)
            .then(({ data, error }) => ({
              data: data || [],
              error,
              type: "opportunities",
            })),

          // Recent activities (last 100)
          supabaseServer
            .from("activities")
            .select(
              `
              *,
              lead:lead_id (
                id,
                name,
                email
              ),
              contact:contact_id (
                id,
                first_name,
                last_name,
                email
              )
            `,
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(100)
            .then(({ data, error }) => ({
              data: data || [],
              error,
              type: "activities",
            })),
        ]),
      );
    }

    // Wait for all data to load
    const results = await Promise.allSettled(dataPromises);

    // Process results
    const bootstrapData = {
      user: {},
      agency: agencyId ? {} : null,
      lastLoaded: new Date().toISOString(),
    };

    // Process user data
    const userResults = results[0];
    if (userResults.status === "fulfilled") {
      userResults.value.forEach(({ data, error, type }) => {
        if (error && error.code !== "PGRST116") {
          logger.error(`Bootstrap ${type} error`, { error: error.message });
        }
        bootstrapData.user[type] = data;
      });
    }

    // Process agency data
    if (agencyId && results[1]?.status === "fulfilled") {
      results[1].value.forEach(({ data, error, type }) => {
        if (error) {
          logger.error(`Bootstrap ${type} error`, { error: error.message });
        }
        bootstrapData.agency[type] = data;
      });
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

/**
 * GET /api/v1/bootstrap/status
 * Get cache status for debugging
 */
router.get("/status", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.agency?.id;

    const cacheKey = `bootstrap:${userId}:${agencyId || "no-agency"}`;
    const cached = await cacheService.get(cacheKey);

    res.json({
      success: true,
      data: {
        cacheAvailable: cacheService.isAvailable(),
        hasCachedData: !!cached,
        cacheKey,
        userId,
        agencyId,
        timestamp: cached?.lastLoaded,
      },
    });
  } catch (error) {
    logger.error("Bootstrap status error", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to get cache status",
    });
  }
});

export default router;
