/**
 * Stripe Routes
 *
 * Handles all billing and subscription endpoints:
 * - Checkout sessions
 * - Billing portal
 * - Subscription management
 * - Webhooks
 */

import express from "express";
import Stripe from "stripe";
import { authenticateUser } from "../middleware/auth.js";
import {
  requireAgencyAccess,
  requireAgencyOwner,
} from "../middleware/agency-access.js";
import stripeService from "../services/stripe-service.js";
import logger from "../utils/logger.js";
import { getPriceId } from "../config/stripe-prices.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET /api/v1/stripe/pricing
 * Get all pricing tiers (public)
 */
router.get("/pricing", async (req, res) => {
  try {
    const tiers = stripeService.getPricingTiers();
    res.json({ success: true, data: tiers });
  } catch (error) {
    logger.error("Error getting pricing:", error);
    res.status(500).json({ success: false, error: "Failed to get pricing" });
  }
});

/**
 * POST /api/v1/stripe/webhook
 * Handle Stripe webhooks (no auth - uses signature verification)
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    try {
      // Verify webhook signature
      const { success, event, error } =
        await stripeService.constructWebhookEvent(req.body, signature);

      if (!success) {
        logger.error("Webhook signature verification failed:", error);
        return res
          .status(400)
          .json({ error: "Webhook signature verification failed" });
      }

      // Handle different event types
      let result;
      switch (event.type) {
        case "checkout.session.completed":
          result = await stripeService.handleCheckoutCompleted(
            event.data.object,
          );
          break;

        case "customer.subscription.updated":
          result = await stripeService.handleSubscriptionUpdated(
            event.data.object,
          );
          break;

        case "customer.subscription.deleted":
          result = await stripeService.handleSubscriptionDeleted(
            event.data.object,
          );
          break;

        case "invoice.paid":
          result = await stripeService.handleInvoicePaid(event.data.object);
          break;

        case "invoice.payment_failed":
          result = await stripeService.handleInvoicePaymentFailed(
            event.data.object,
          );
          break;

        case "customer.subscription.trial_will_end":
          // TODO: Send reminder email
          logger.info("Trial ending soon:", event.data.object.id);
          result = { success: true };
          break;

        default:
          logger.debug(`Unhandled webhook event type: ${event.type}`);
          result = { success: true };
      }

      if (!result.success) {
        logger.error(`Error handling webhook ${event.type}:`, result.error);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook handler error" });
    }
  },
);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

/**
 * POST /api/v1/stripe/create-checkout-session
 * Create a checkout session for new subscription
 * Requires: authenticated user, agency owner
 */
router.post(
  "/create-checkout-session",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const { tier, billing_cycle } = req.body;
      const agencyId = req.agency.id;
      const user = req.user;

      if (!tier || !["sales", "build", "scale"].includes(tier)) {
        return res.status(400).json({
          success: false,
          error: "Invalid tier. Must be: sales, build, or scale",
        });
      }

      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const successUrl = `${baseUrl}/app/settings/billing?success=true`;
      const cancelUrl = `${baseUrl}/app/settings/billing?canceled=true`;

      const result = await stripeService.createCheckoutSession(
        agencyId,
        tier,
        billing_cycle,
        user.email,
        user.user_metadata?.full_name || user.email,
        successUrl,
        cancelUrl,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to create checkout session" });
    }
  },
);

/**
 * POST /api/v1/stripe/create-portal-session
 * Create a billing portal session
 * Requires: authenticated user, agency owner
 */
router.post(
  "/create-portal-session",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const returnUrl = `${baseUrl}/app/settings/billing`;

      const result = await stripeService.createPortalSession(
        agencyId,
        returnUrl,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error creating portal session:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to create portal session" });
    }
  },
);

/**
 * GET /api/v1/stripe/subscription
 * Get current subscription details
 * Requires: authenticated user, agency access
 */
router.get(
  "/subscription",
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await stripeService.getSubscription(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error getting subscription:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to get subscription" });
    }
  },
);

/**
 * POST /api/v1/stripe/cancel
 * Cancel subscription (at period end by default)
 * Requires: authenticated user, agency owner
 */
router.post(
  "/cancel",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { immediate } = req.body;

      const result = await stripeService.cancelSubscription(
        agencyId,
        !immediate,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error canceling subscription:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to cancel subscription" });
    }
  },
);

/**
 * POST /api/v1/stripe/resume
 * Resume a canceled subscription
 * Requires: authenticated user, agency owner
 */
router.post(
  "/resume",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await stripeService.resumeSubscription(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error resuming subscription:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to resume subscription" });
    }
  },
);

/**
 * POST /api/v1/stripe/upgrade
 * Upgrade subscription tier
 * Requires: authenticated user, agency owner
 */
router.post(
  "/upgrade",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { tier, billing_cycle } = req.body;

      if (!tier || !["sales", "build", "scale"].includes(tier)) {
        return res.status(400).json({
          success: false,
          error: "Invalid tier",
        });
      }

      const result = await stripeService.changeTier(
        agencyId,
        tier,
        billing_cycle,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error upgrading subscription:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to upgrade subscription" });
    }
  },
);

/**
 * POST /api/v1/stripe/downgrade
 * Downgrade subscription tier
 * Requires: authenticated user, agency owner
 */
router.post(
  "/downgrade",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { tier, billing_cycle } = req.body;

      if (!tier || !["sales", "build", "scale"].includes(tier)) {
        return res.status(400).json({
          success: false,
          error: "Invalid tier",
        });
      }

      const result = await stripeService.changeTier(
        agencyId,
        tier,
        billing_cycle,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error downgrading subscription:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to downgrade subscription" });
    }
  },
);

/**
 * POST /api/v1/stripe/start-trial
 * Start a trial subscription (internal use, for agency creation)
 * Requires: authenticated user
 */
router.post("/start-trial", authenticateUser, async (req, res) => {
  try {
    const { agency_id, tier, billing_cycle } = req.body;

    if (!agency_id) {
      return res.status(400).json({
        success: false,
        error: "agency_id is required",
      });
    }

    const result = await stripeService.createTrialSubscription(
      agency_id,
      tier || "sales",
      billing_cycle || "monthly",
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    logger.error("Error starting trial:", error);
    res.status(500).json({ error: "Failed to start trial" });
  }
});

/**
 * POST /api/v1/stripe/verify-session
 * Verify Stripe checkout session after payment
 * Requires: authenticated user
 */
router.post("/verify-session", authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "Session ID is required",
      });
    }

    // Retrieve session from Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // Verify session belongs to this user
    if (session.metadata.user_id !== userId) {
      logger.warn("Session user ID mismatch", {
        sessionUserId: session.metadata.user_id,
        requestUserId: userId,
      });
      return res.status(403).json({
        success: false,
        error: "Session does not belong to this user",
      });
    }

    // Check payment status
    if (session.status !== "complete") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
        status: session.status,
      });
    }

    // Get subscription details
    const subscription = session.subscription;
    const planId = session.metadata.plan;
    const billingCycle = session.metadata.billing_cycle;

    // Calculate trial end date
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null;

    logger.info("Session verified successfully", {
      userId,
      planId,
      subscriptionId: subscription.id,
    });

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: trialEnd,
        plan: planId,
        billing_cycle: billingCycle,
      },
    });
  } catch (error) {
    logger.error("Session verification failed", {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: "Failed to verify session. Please try again.",
    });
  }
});

/**
 * POST /api/v1/stripe/create-trial-checkout
 * Create trial checkout session for new user signup
 * Requires: authenticated user
 */
router.post("/create-trial-checkout", authenticateUser, async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;
    const userId = req.user.id;

    if (!plan || !["sales", "build", "scale"].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan. Must be: sales, build, or scale",
      });
    }

    const email = req.user.email;
    const fullName = req.user.user_metadata?.full_name || email.split("@")[0];

    // Get Stripe price ID from config
    const priceId = getPriceId(plan, billingCycle || "yearly");

    logger.info("Creating trial checkout with price ID", {
      plan,
      billingCycle: billingCycle || "yearly",
      priceId,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: userId,
          plan: plan,
          billing_cycle: billingCycle || "yearly",
        },
      },
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/select-plan?plan=${plan}`,
      metadata: {
        user_id: userId,
        plan: plan,
        billing_cycle: billingCycle || "yearly",
      },
    });

    if (!session.url) {
      return res.status(500).json({
        success: false,
        error: "Failed to create checkout session",
      });
    }

    logger.info("Trial checkout session created", {
      sessionId: session.id,
      userId,
      plan,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logger.error("Error creating trial checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ============================================
// ENHANCED BILLING ENDPOINTS
// ============================================

/**
 * GET /api/v1/stripe/billing-history
 * Get complete billing history with all-time data
 */
router.get(
  "/billing-history",
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await stripeService.getBillingHistory(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error getting billing history:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get billing history",
      });
    }
  },
);

/**
 * GET /api/v1/stripe/billing-history/export
 * Export billing history as CSV
 */
router.get(
  "/billing-history/export",
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await stripeService.exportBillingHistory(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="billing-history-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.send(result.data);
    } catch (error) {
      logger.error("Error exporting billing history:", error);
      res.status(500).json({
        success: false,
        error: "Failed to export billing history",
      });
    }
  },
);

/**
 * GET /api/v1/stripe/payment-methods
 * Get all payment methods for the customer
 */
router.get(
  "/payment-methods",
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await stripeService.getPaymentMethods(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error getting payment methods:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get payment methods",
      });
    }
  },
);

/**
 * POST /api/v1/stripe/create-setup-session
 * Create a setup session for adding new payment methods
 */
router.post(
  "/create-setup-session",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { success_url, cancel_url } = req.body;

      const result = await stripeService.createSetupSession(
        agencyId,
        success_url || `${process.env.FRONTEND_URL}/app/settings/billing`,
        cancel_url || `${process.env.FRONTEND_URL}/app/settings/billing`,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error creating setup session:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create setup session",
      });
    }
  },
);

/**
 * PUT /api/v1/stripe/payment-methods/:id/default
 * Set a payment method as default
 */
router.put(
  "/payment-methods/:id/default",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { id: paymentMethodId } = req.params;

      const result = await stripeService.setDefaultPaymentMethod(
        agencyId,
        paymentMethodId,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error setting default payment method:", error);
      res.status(500).json({
        success: false,
        error: "Failed to set default payment method",
      });
    }
  },
);

/**
 * DELETE /api/v1/stripe/payment-methods/:id
 * Remove a payment method
 */
router.delete(
  "/payment-methods/:id",
  authenticateUser,
  requireAgencyAccess,
  requireAgencyOwner,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { id: paymentMethodId } = req.params;

      const result = await stripeService.removePaymentMethod(
        agencyId,
        paymentMethodId,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error removing payment method:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove payment method",
      });
    }
  },
);

/**
 * GET /api/v1/stripe/account-status
 * Get detailed account status with grace period info
 */
router.get(
  "/account-status",
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await stripeService.getAccountStatus(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error("Error getting account status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get account status",
      });
    }
  },
);

export default router;
