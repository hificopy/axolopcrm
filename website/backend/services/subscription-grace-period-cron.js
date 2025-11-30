/**
 * Subscription Grace Period Cron Service
 *
 * Handles automatic downgrading of users after grace period expires
 * Runs daily to check for expired grace periods
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import logger from "../utils/logger.js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check and downgrade users whose grace period has expired
 */
export async function checkGracePeriodExpirations() {
  try {
    logger.info("[Grace Period Cron] Starting grace period expiration check");

    // Get all users from Supabase Auth
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      logger.error("[Grace Period Cron] Error fetching users:", error);
      return { success: false, error: error.message };
    }

    if (!users || !users.users || users.users.length === 0) {
      logger.info("[Grace Period Cron] No users found");
      return { success: true, checked: 0, downgraded: 0 };
    }

    const now = new Date();
    let downgraded = 0;

    // Filter users who are past_due
    const pastDueUsers = users.users.filter(
      (u) => u.user_metadata?.subscription_status === "past_due"
    );

    logger.info(`[Grace Period Cron] Found ${pastDueUsers.length} past_due users to check`);

    for (const user of pastDueUsers) {
      const gracePeriodEnds = user.user_metadata?.grace_period_ends_at;
      const stripeSubscriptionId = user.user_metadata?.stripe_subscription_id;

      if (!gracePeriodEnds) {
        logger.warn(`[Grace Period Cron] User ${user.id} has no grace_period_ends_at`);
        continue;
      }

      const gracePeriodDate = new Date(gracePeriodEnds);

      // Check if grace period has expired
      if (now > gracePeriodDate) {
        logger.info(`[Grace Period Cron] Grace period expired for user ${user.id}`);

        try {
          // Downgrade user to free
          await downgradeUserToFree(user.id, user, stripeSubscriptionId);
          downgraded++;
        } catch (err) {
          logger.error(`[Grace Period Cron] Error downgrading user ${user.id}:`, err);
        }
      }
    }

    logger.info(`[Grace Period Cron] Completed. Checked ${pastDueUsers.length} users, downgraded ${downgraded}`);

    return { success: true, checked: pastDueUsers.length, downgraded };
  } catch (error) {
    logger.error("[Grace Period Cron] Error in grace period check:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Downgrade a user to free tier after grace period expires
 */
async function downgradeUserToFree(userId, user, stripeSubscriptionId) {
  logger.info(`[Grace Period Cron] Downgrading user ${userId} to free`);

  const updatedMetadata = {
    ...user.user_metadata,
    subscription_status: "free",
    previous_subscription_status: "past_due",
    downgraded_at: new Date().toISOString(),
    // Keep trial_claimed and previous plan info
    previous_plan_id: user.user_metadata?.plan_id,
  };

  // Update user metadata
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: updatedMetadata,
  });

  // Cancel Stripe subscription if exists
  if (stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
      logger.info(`[Grace Period Cron] Cancelled Stripe subscription ${stripeSubscriptionId}`);
    } catch (err) {
      logger.error(`[Grace Period Cron] Error cancelling subscription:`, err);
    }
  }

  logger.info(`[Grace Period Cron] User ${userId} downgraded to free`);
}

/**
 * Check and handle trial expirations
 * Converts trialing users to active paid or downgrades to free
 */
export async function checkTrialExpirations() {
  try {
    logger.info("[Trial Expiration Cron] Starting trial expiration check");

    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      logger.error("[Trial Expiration Cron] Error fetching users:", error);
      return { success: false, error: error.message };
    }

    if (!users || !users.users || users.users.length === 0) {
      logger.info("[Trial Expiration Cron] No users found");
      return { success: true, checked: 0, converted: 0 };
    }

    const now = new Date();
    let converted = 0;

    // Filter users who are trialing
    const trialingUsers = users.users.filter(
      (u) => u.user_metadata?.subscription_status === "trialing"
    );

    logger.info(`[Trial Expiration Cron] Found ${trialingUsers.length} trialing users to check`);

    for (const user of trialingUsers) {
      const trialEndsAt = user.user_metadata?.trial_ends_at;

      if (!trialEndsAt) {
        logger.warn(`[Trial Expiration Cron] User ${user.id} has no trial_ends_at`);
        continue;
      }

      const trialEndDate = new Date(trialEndsAt);

      // Check if trial has expired
      if (now > trialEndDate) {
        logger.info(`[Trial Expiration Cron] Trial expired for user ${user.id}`);

        try {
          // Stripe webhooks should handle this automatically
          // This is a backup check
          const stripeSubscriptionId = user.user_metadata?.stripe_subscription_id;

          if (stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

            if (subscription.status === "active") {
              // Trial ended, subscription is active - update user metadata
              const updatedMetadata = {
                ...user.user_metadata,
                subscription_status: "active",
              };

              await supabase.auth.admin.updateUserById(user.id, {
                user_metadata: updatedMetadata,
              });

              logger.info(`[Trial Expiration Cron] User ${user.id} converted to active`);
              converted++;
            } else if (subscription.status === "canceled" || subscription.status === "incomplete") {
              // Trial ended without payment - downgrade to free
              const updatedMetadata = {
                ...user.user_metadata,
                subscription_status: "free",
                downgraded_at: new Date().toISOString(),
              };

              await supabase.auth.admin.updateUserById(user.id, {
                user_metadata: updatedMetadata,
              });

              logger.info(`[Trial Expiration Cron] User ${user.id} downgraded to free`);
              converted++;
            }
          }
        } catch (err) {
          logger.error(`[Trial Expiration Cron] Error processing user ${user.id}:`, err);
        }
      }
    }

    logger.info(`[Trial Expiration Cron] Completed. Checked ${trialingUsers.length} users, converted ${converted}`);

    return { success: true, checked: trialingUsers.length, converted };
  } catch (error) {
    logger.error("[Trial Expiration Cron] Error in trial expiration check:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Main cron job function
 * Runs both grace period and trial expiration checks
 */
export async function runSubscriptionCronJobs() {
  logger.info("============================================");
  logger.info("[Subscription Cron] Starting subscription cron jobs");
  logger.info("============================================");

  const gracePeriodResult = await checkGracePeriodExpirations();
  const trialExpirationResult = await checkTrialExpirations();

  logger.info("============================================");
  logger.info("[Subscription Cron] Subscription cron jobs completed");
  logger.info(`[Subscription Cron] Grace Period: ${gracePeriodResult.downgraded || 0} users downgraded`);
  logger.info(`[Subscription Cron] Trial Expiration: ${trialExpirationResult.converted || 0} users converted`);
  logger.info("============================================");

  return {
    success: true,
    gracePeriod: gracePeriodResult,
    trialExpiration: trialExpirationResult,
  };
}

export default {
  checkGracePeriodExpirations,
  checkTrialExpirations,
  runSubscriptionCronJobs,
};
