import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { supabaseServer } from "../config/supabase-auth.js";
import inviteService from "../services/invite-service.js";

const router = express.Router();

/**
 * POST /api/v1/invites
 * Create and send an invite (simplified endpoint for frontend)
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { agencyId, email, name, role } = req.body;
    const userId = req.user.id;

    console.log("[Invites] Creating invite:", {
      agencyId,
      email,
      name,
      role,
      userId,
    });

    if (!agencyId || !email) {
      return res.status(400).json({
        success: false,
        error: "Agency ID and email are required",
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address",
      });
    }

    // Use the existing invite service
    const result = await inviteService.createInvite({
      agencyId,
      invitedByUserId: userId,
      recipientEmail: email,
      recipientName: name,
      role: role || "member",
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Invites] Error creating invite:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create invitation",
    });
  }
});

/**
 * POST /api/v1/invites/accept
 * Accept an invitation
 */
router.post("/accept", authenticateUser, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    console.log("[Invites] Accepting invite:", { token, userId });

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Invite token is required",
      });
    }

    const result = await inviteService.acceptInvite({
      token,
      userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Invites] Error accepting invite:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to accept invitation",
    });
  }
});

/**
 * GET /api/v1/invites/agency/:agencyId
 * List pending invites for an agency (admin only)
 */
router.get("/agency/:agencyId", authenticateUser, async (req, res) => {
  try {
    const agencyId = req.params.agencyId;
    const userId = req.user.id;

    // Check if user is admin of this agency
    const { data: membership } = await supabaseServer
      .from("agency_members")
      .select("role")
      .eq("agency_id", agencyId)
      .eq("user_id", userId)
      .eq("invitation_status", "active")
      .single();

    if (
      !membership ||
      (membership.role !== "admin" && membership.role !== "owner")
    ) {
      return res.status(403).json({
        success: false,
        error: "Only agency admins can view invites",
      });
    }

    const { data, error } = await supabaseServer
      .from("agency_invites")
      .select("*")
      .eq("agency_id", agencyId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[Invites] Error fetching invites:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch invitations",
      });
    }

    res.json({
      success: true,
      invites: data || [],
    });
  } catch (error) {
    console.error("[Invites] Error fetching invites:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch invitations",
    });
  }
});

/**
 * POST /api/v1/invites/:inviteId/resend
 * Resend an invitation email
 */
router.post("/:inviteId/resend", authenticateUser, async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    const userId = req.user.id;

    const result = await inviteService.resendInvite({
      inviteId,
      userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Invites] Error resending invite:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to resend invitation",
    });
  }
});

/**
 * DELETE /api/v1/invites/:inviteId
 * Cancel/delete an invitation
 */
router.delete("/:inviteId", authenticateUser, async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    const userId = req.user.id;

    const result = await inviteService.cancelInvite({
      inviteId,
      userId,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Invites] Error cancelling invite:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to cancel invitation",
    });
  }
});

export default router;
