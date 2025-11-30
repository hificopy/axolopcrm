import express from "express";
import calendarSyncService from "../services/calendar-sync-service.js";
import { protect } from "../middleware/authMiddleware.js";
import { supabaseServer } from "../config/supabase-auth.js";

const router = express.Router();

/**
 * Google Calendar Webhook Routes
 * Handles real-time calendar synchronization via push notifications
 *
 * Webhook flow:
 * 1. Google sends notification to our webhook endpoint
 * 2. We verify the notification and extract channel info
 * 3. We sync the affected calendar events
 * 4. We update availability and booking status accordingly
 */

/**
 * POST /api/calendar/webhook
 * @desc Handle incoming Google Calendar webhook notifications
 * @access Public (but verified via channel ID)
 * @route POST /api/calendar/webhook
 */
router.post("/webhook", async (req, res) => {
  try {
    const headers = req.headers;
    const body = req.body;

    // Log incoming webhook for debugging
    console.log("Calendar webhook received:", {
      headers: {
        "x-goog-channel-id": headers["x-goog-channel-id"],
        "x-goog-resource-id": headers["x-goog-resource-id"],
        "x-goog-resource-state": headers["x-goog-resource-state"],
        "x-goog-resource-uri": headers["x-goog-resource-uri"],
      },
      body,
    });

    // Handle webhook notification
    const result = await calendarSyncService.handleWebhookNotification(
      headers,
      body,
    );

    if (result.success) {
      // Return 200 OK to acknowledge receipt
      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } else {
      // Return error but still 200 to prevent retries
      res.status(200).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error processing calendar webhook:", error);

    // Always return 200 to prevent Google from retrying
    res.status(200).json({
      success: false,
      error: "Webhook processing failed",
    });
  }
});

/**
 * POST /api/calendar/webhook/setup
 * @desc Set up push notifications for a user's calendar
 * @access Private
 * @route POST /api/calendar/webhook/setup
 */
router.post("/webhook/setup", protect, async (req, res) => {
  try {
    const { calendarId = "primary" } = req.body;
    const userId = req.user.id;

    const result = await calendarSyncService.setupPushNotifications(
      userId,
      calendarId,
    );

    res.json(result);
  } catch (error) {
    console.error("Error setting up calendar webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/calendar/webhook/stop
 * @desc Stop push notifications for a user's calendar
 * @access Private
 * @route POST /api/calendar/webhook/stop
 */
router.post("/webhook/stop", protect, async (req, res) => {
  try {
    const { calendarId = "primary" } = req.body;
    const userId = req.user.id;

    const result = await calendarSyncService.stopPushNotifications(
      userId,
      calendarId,
    );

    res.json(result);
  } catch (error) {
    console.error("Error stopping calendar webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/calendar/webhook/status
 * @desc Get webhook status for user's calendars
 * @access Private
 * @route GET /api/calendar/webhook/status
 */
router.get("/webhook/status", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get webhook status from database
    const { data: webhooks } = await supabaseServer
      .from("calendar_webhooks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    res.json({
      success: true,
      webhooks: webhooks || [],
    });
  } catch (error) {
    console.error("Error getting webhook status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/calendar/webhook/renew
 * @desc Manually renew expiring webhooks
 * @access Private
 * @route POST /api/calendar/webhook/renew
 */
router.post("/webhook/renew", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await calendarSyncService.renewExpiringWebhooks();

    res.json(result);
  } catch (error) {
    console.error("Error renewing webhooks:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/calendar/webhook/sync
 * @desc Manually trigger calendar sync for a user
 * @access Private
 * @route POST /api/calendar/webhook/sync
 */
router.post("/webhook/sync", protect, async (req, res) => {
  try {
    const { calendarId = "primary" } = req.body;
    const userId = req.user.id;

    const result = await calendarSyncService.syncCalendarEvents(
      userId,
      calendarId,
    );

    res.json(result);
  } catch (error) {
    console.error("Error manual syncing calendar:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/calendar/webhook/cleanup
 * @desc Clean up old stopped webhooks (admin only)
 * @access Private (Admin only)
 * @route POST /api/calendar/webhook/cleanup
 */
router.post("/webhook/cleanup", protect, async (req, res) => {
  try {
    // Only allow admin users
    if (req.user.email !== "axolopcrm@gmail.com") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const result = await calendarSyncService.cleanupOldWebhooks();

    res.json(result);
  } catch (error) {
    console.error("Error cleaning up webhooks:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
