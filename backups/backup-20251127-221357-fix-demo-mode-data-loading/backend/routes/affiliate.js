// backend/routes/affiliate.js
import express from "express";
import { getUserFromRequest, supabaseServer } from "../config/supabase-auth.js";
import affiliateService from "../services/affiliate-service.js";
import {
  createSuccessResponse,
  createErrorResponse,
  withStandardizedResponse,
} from "../utils/standard-responses";

const router = express.Router();

/**
 * @swagger
 * /api/v1/affiliate/join:
 *   post:
 *     summary: Join affiliate program
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Successfully joined affiliate program
 */
router.post("/join", async (req, res) => {
  console.log("\n🔍 === AFFILIATE JOIN REQUEST DEBUG ===");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("🌐 Request URL:", req.originalUrl);
  console.log("📝 Request Method:", req.method);
  console.log(
    "🔑 Authorization Header:",
    req.headers.authorization ? "Present (Bearer token)" : "MISSING",
  );
  console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));

  try {
    console.log("\n🔐 Step 1: Getting user from request...");
    const user = await getUserFromRequest(req);

    if (!user) {
      console.error("❌ Step 1 FAILED: User not authenticated");
      console.error("   - Authorization header:", req.headers.authorization);
      return res
        .status(401)
        .json(
          createErrorResponse(
            "Unauthorized",
            401,
            "User authentication failed - no valid session token",
          ),
        );
    }

    console.log("✅ Step 1 SUCCESS: User authenticated");
    console.log("   - User ID:", user.id);
    console.log("   - User Email:", user.email);

    console.log("\n🎯 Step 2: Creating affiliate account...");
    const result = await affiliateService.createAffiliate(user.id, req.body);

    console.log("✅ Step 2 SUCCESS: Affiliate account created");
    console.log("   - Referral Code:", result.data?.referral_code);
    console.log("   - Commission Rate:", result.data?.commission_rate);
    console.log("\n✅ === REQUEST COMPLETED SUCCESSFULLY ===\n");

    res.json(result);
  } catch (error) {
    console.error("\n❌ === REQUEST FAILED ===");
    console.error("❌ Error Type:", error.constructor.name);
    console.error("❌ Error Message:", error.message);
    console.error("❌ Error Stack:", error.stack);

    // Check if the error is related to missing database tables
    if (error.message?.includes("Affiliate tables are not set up")) {
      console.error("💾 Database Issue: Tables not set up");
      return res.status(500).json({
        error: "Affiliate program database is not set up",
        message:
          "Please run the affiliate database migration first. See TO-DOS.md for instructions.",
        hint: "Run `node scripts/run-affiliate-migration.js` after setting up your Supabase credentials",
        debug: error.message,
      });
    }

    console.error(
      "🔥 Generic Error - Full Details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    );
    console.error("\n=== END DEBUG ===\n");

res.status(500).json(createErrorResponse(
      "Failed to fetch affiliate dashboard",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/dashboard:
 *   get:
 *     summary: Get affiliate dashboard data
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Affiliate dashboard data
 */
router.get("/dashboard", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await affiliateService.getAffiliateDashboard(user.id);

    if (!result.success) {
      return res.status(404).json(createErrorResponse(result.message, 404));
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching affiliate dashboard:", error);
    res.status(500).json(createErrorResponse(
      "Failed to fetch affiliate dashboard",
      500,
      error.message
    ));
  }
  }
});

/**
 * @swagger
 * /api/v1/affiliate/profile:
 *   get:
 *     summary: Get affiliate profile
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Affiliate profile
 */
router.get("/profile", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const affiliate = await affiliateService.getAffiliateByUserId(user.id);

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate account not found" });
    }

    res.json(affiliate);
  } catch (error) {
    console.error("Error fetching affiliate profile:", error);

    // Check if the error is related to missing database tables
    if (error.message?.includes("does not exist")) {
      return res.status(500).json({
        error: "Affiliate program database is not set up",
        message:
          "Please run the affiliate database migration first. See TO-DOS.md for instructions.",
        hint: "Run `node scripts/run-affiliate-migration.js` after setting up your Supabase credentials",
      });
    }

res.status(500).json(createErrorResponse(
      "Failed to fetch affiliate dashboard",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/track-click:
 *   post:
 *     summary: Track affiliate link click
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Click tracked successfully
 */
router.post("/track-click", async (req, res) => {
  try {
    const { referral_code, ...clickData } = req.body;

    if (!referral_code) {
      return res.status(400).json({ error: "Referral code is required" });
    }

    // Add IP and user agent from request
    clickData.ip_address = req.ip || req.connection.remoteAddress;
    clickData.user_agent = req.headers["user-agent"];
    clickData.referer_url = req.headers.referer;

    const result = await affiliateService.trackClick(referral_code, clickData);

    res.json(result);
  } catch (error) {
    console.error("Error tracking click:", error);

    // Check if the error is related to missing database tables
    if (error.message?.includes("does not exist")) {
      // Return success to avoid breaking the user experience, even if tracking isn't working
      return res.json({
        success: true,
        message: "Click tracking is not available - database not set up",
        hint: "Run `node scripts/run-affiliate-migration.js` after setting up your Supabase credentials",
      });
    }

    res.status(500).json(createErrorResponse(
      "Failed to track click",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/create-referral:
 *   post:
 *     summary: Create a referral (called on signup)
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Referral created successfully
 */
router.post("/create-referral", async (req, res) => {
  try {
    const { referral_code, ...referralData } = req.body;

    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json(createErrorResponse("Unauthorized", 401));
    }

    if (!referral_code) {
      return res
        .status(400)
        .json(createErrorResponse("Referral code is required", 400));
    }

    // Add IP and user agent from request
    referralData.ip_address = req.ip || req.connection.remoteAddress;
    referralData.user_agent = req.headers["user-agent"];

    const result = await affiliateService.createReferral(
      referral_code,
      user.id,
      referralData,
    );

    res.json(result);
  } catch (error) {
    console.error("Error creating referral:", error);

    // Check if the error is related to missing database tables
    if (error.message?.includes("does not exist")) {
      // Return success to avoid breaking the signup flow, even if referral tracking isn't working
      return res.json({
        success: true,
        message: "Referral tracking is not available - database not set up",
        hint: "Run `node scripts/run-affiliate-migration.js` after setting up your Supabase credentials",
      });
    }

    res.status(500).json(createErrorResponse(
      "Failed to create referral",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/materials:
 *   get:
 *     summary: Get marketing materials
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Marketing materials
 */
router.get("/materials", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await affiliateService.getMarketingMaterials();

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching marketing materials:", error);
res.status(500).json(createErrorResponse(
      "Failed to fetch affiliate profile",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/payment-details:
 *   put:
 *     summary: Update payment details
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Payment details updated
 */
router.put("/payment-details", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await affiliateService.updatePaymentDetails(
      user.id,
      req.body,
    );

    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error updating payment details:", error);
    res.status(500).json(createErrorResponse(
      "Failed to update payment details",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/report:
 *   get:
 *     summary: Get referral performance report
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Referral report
 */
router.get("/report", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { start_date, end_date } = req.query;

    const result = await affiliateService.getReferralReport(
      user.id,
      start_date,
      end_date,
    );

    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error fetching referral report:", error);
res.status(500).json(createErrorResponse(
      "Failed to fetch affiliate dashboard",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/request-payout:
 *   post:
 *     summary: Request payout
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Payout requested successfully
 */
router.post("/request-payout", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payout amount" });
    }

    const result = await affiliateService.requestPayout(user.id, amount);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error requesting payout:", error);
res.status(500).json(createErrorResponse(
      "Failed to activate trial",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/regenerate:
 *   post:
 *     summary: Regenerate affiliate referral code (invalidates old code)
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: New referral code generated
 */
router.post("/regenerate", async (req, res) => {
  console.log("\n🔄 === REGENERATE AFFILIATE CODE REQUEST ===");
  console.log("📅 Timestamp:", new Date().toISOString());

  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      console.error("❌ User not authenticated");
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("✅ User authenticated:", user.id);
    console.log("🔄 Regenerating affiliate code...");

    const result = await affiliateService.regenerateAffiliateCode(user.id);

    if (!result.success) {
      console.error("❌ Regeneration failed:", result.message);
      return res.status(400).json({ error: result.message });
    }

    console.log("✅ Code regenerated successfully");
    console.log("   - Old code invalidated");
    console.log("   - New code:", result.data.referral_code);
    console.log("=== REGENERATION COMPLETE ===\n");

    res.json(result);
  } catch (error) {
    console.error("\n❌ Error regenerating code:", error.message);
    res.status(500).json(createErrorResponse(
      "Failed to regenerate code",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/check-code/{code}:
 *   get:
 *     summary: Check if referral code is valid
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Referral code validation result
 */
router.get("/check-code/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const affiliate = await affiliateService.getAffiliateByCode(code);

    if (!affiliate) {
      return res.json({ valid: false });
    }

    if (affiliate.status !== "active") {
      return res.json({
        valid: false,
        message: "Affiliate account is not active",
      });
    }

    // Also get the affiliate user's profile to return first name
    const { data: userProfile, error: profileError } = await supabaseServer
      .from("user_profiles")
      .select("first_name")
      .eq("id", affiliate.user_id)
      .single();

res.json(createSuccessResponse(result.data));
      valid: true,
      commission_rate: affiliate.commission_rate,
      user_id: affiliate.user_id,
      first_name: userProfile?.first_name || null,
    });
  } catch (error) {
    console.error("Error checking referral code:", error);
res.status(500).json(createErrorResponse(
      "Failed to fetch referral report",
      500,
      error.message
    ));
  }
});

/**
 * @swagger
 * /api/v1/affiliate/activate-trial:
 *   post:
 *     summary: Activate trial for user who signed up via affiliate link
 *     tags: [Affiliate]
 *     responses:
 *       200:
 *         description: Trial activated successfully
 */
router.post("/activate-trial", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await affiliateService.activateTrialForUser(user.id);

    res.json(result);
  } catch (error) {
    console.error("Error activating trial:", error);
res.status(500).json(createErrorResponse(
      "Failed to fetch marketing materials",
      500,
      error.message
    ));
  }
});

export default router;
