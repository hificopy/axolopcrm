/**
 * Stripe Service
 *
 * Handles all Stripe-related operations:
 * - Customer management
 * - Subscription management
 * - Checkout sessions
 * - Billing portal
 * - Webhook handling
 */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import logger from "../utils/logger.js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Pricing configuration
export const PRICING_TIERS = {
  sales: {
    name: "Sales",
    monthly: 6700, // $67.00 in cents
    yearly: 64800, // $648.00 in cents
    monthlyEquivalent: 5400, // $54.00/mo when paid yearly
    discount: 19,
    maxUsers: 3,
    maxAgencies: 1,
  },
  build: {
    name: "Build",
    monthly: 18700, // $187.00 in cents
    yearly: 178800, // $1788.00 in cents
    monthlyEquivalent: 14900, // $149.00/mo when paid yearly
    discount: 20,
    maxUsers: 5,
    maxAgencies: 1,
    popular: true,
  },
  scale: {
    name: "Scale",
    monthly: 34900, // $349.00 in cents
    yearly: 334800, // $3348.00 in cents
    monthlyEquivalent: 27900, // $279.00/mo when paid yearly
    discount: 20,
    maxUsers: 999999,
    maxAgencies: 999999,
  },
};

// Additional seat pricing
export const SEAT_PRICE = 1200; // $12.00/month per additional seat

// Trial duration in days
export const TRIAL_DAYS = 14;

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

/**
 * Create or get Stripe customer for agency
 */
export async function getOrCreateCustomer(agencyId, email, name) {
  try {
    // Check if customer already exists in our DB
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("agency_id", agencyId)
      .single();

    if (subscription?.stripe_customer_id) {
      // Retrieve existing customer
      const customer = await stripe.customers.retrieve(
        subscription.stripe_customer_id,
      );
      return { success: true, customer };
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        agency_id: agencyId,
      },
    });

    logger.info(
      `Created Stripe customer ${customer.id} for agency ${agencyId}`,
    );
    return { success: true, customer };
  } catch (error) {
    logger.error("Error getting/creating Stripe customer:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update customer email
 */
export async function updateCustomerEmail(customerId, email) {
  try {
    await stripe.customers.update(customerId, { email });
    return { success: true };
  } catch (error) {
    logger.error("Error updating customer email:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create checkout session for new subscription
 */
export async function createCheckoutSession(
  agencyId,
  tier,
  billingCycle,
  userEmail,
  userName,
  successUrl,
  cancelUrl,
) {
  try {
    // Get or create customer
    const { customer, error: customerError } = await getOrCreateCustomer(
      agencyId,
      userEmail,
      userName,
    );
    if (customerError) throw new Error(customerError);

    // Get price from pricing tiers
    const tierConfig = PRICING_TIERS[tier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const priceInCents =
      billingCycle === "yearly" ? tierConfig.yearly : tierConfig.monthly;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Axolop CRM - ${tierConfig.name}`,
              description: `${tierConfig.name} plan - ${billingCycle === "yearly" ? "Annual" : "Monthly"} billing`,
            },
            unit_amount: priceInCents,
            recurring: {
              interval: billingCycle === "yearly" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          agency_id: agencyId,
          tier,
          billing_cycle: billingCycle,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        agency_id: agencyId,
        tier,
        billing_cycle: billingCycle,
      },
    });

    logger.info(
      `Created checkout session ${session.id} for agency ${agencyId}`,
    );
    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    logger.error("Error creating checkout session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create billing portal session
 */
export async function createPortalSession(agencyId, returnUrl) {
  try {
    // Get customer ID from subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("agency_id", agencyId)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      throw new Error("No subscription found for this agency");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    return { success: true, url: session.url };
  } catch (error) {
    logger.error("Error creating portal session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(agencyId) {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        `
        *,
        pricing:pricing_tiers!subscriptions_tier_fkey(
          name,
          display_name,
          monthly_price_cents,
          yearly_price_cents,
          max_users,
          max_agencies,
          features
        )
      `,
      )
      .eq("agency_id", agencyId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (data?.status === "trialing" && data?.trial_end) {
      const trialEnd = new Date(data.trial_end);
      const now = new Date();
      trialDaysRemaining = Math.max(
        0,
        Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)),
      );
    }

    return {
      success: true,
      data: data
        ? {
            ...data,
            trial_days_remaining: trialDaysRemaining,
          }
        : null,
    };
  } catch (error) {
    logger.error("Error getting subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create trial subscription (internal use)
 */
export async function createTrialSubscription(
  agencyId,
  tier = "sales",
  billingCycle = "monthly",
) {
  try {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          agency_id: agencyId,
          tier,
          billing_cycle: billingCycle,
          status: "trialing",
          trial_start: new Date().toISOString(),
          trial_end: trialEnd.toISOString(),
        },
        {
          onConflict: "agency_id",
        },
      )
      .select()
      .single();

    if (error) throw error;

    // Log event
    await supabase.from("subscription_events").insert({
      subscription_id: data.id,
      agency_id: agencyId,
      event_type: "trial_started",
      new_tier: tier,
      new_status: "trialing",
    });

    logger.info(`Created trial subscription for agency ${agencyId}`);
    return { success: true, data };
  } catch (error) {
    logger.error("Error creating trial subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(agencyId, atPeriodEnd = true) {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("agency_id", agencyId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error("No active subscription found");
    }

    // Cancel in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: atPeriodEnd },
    );

    // Update our DB
    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: atPeriodEnd,
        canceled_at: atPeriodEnd ? null : new Date().toISOString(),
      })
      .eq("agency_id", agencyId);

    // Log event
    await supabase.from("subscription_events").insert({
      agency_id: agencyId,
      event_type: atPeriodEnd ? "cancel_scheduled" : "canceled_immediately",
    });

    logger.info(`Canceled subscription for agency ${agencyId}`);
    return { success: true, cancellation_date: stripeSubscription.cancel_at };
  } catch (error) {
    logger.error("Error canceling subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(agencyId) {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("agency_id", agencyId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error("No subscription found");
    }

    // Resume in Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    });

    // Update our DB
    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
      })
      .eq("agency_id", agencyId);

    // Log event
    await supabase.from("subscription_events").insert({
      agency_id: agencyId,
      event_type: "subscription_resumed",
    });

    logger.info(`Resumed subscription for agency ${agencyId}`);
    return { success: true };
  } catch (error) {
    logger.error("Error resuming subscription:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Change subscription tier
 */
export async function changeTier(agencyId, newTier, billingCycle = null) {
  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, tier, billing_cycle")
      .eq("agency_id", agencyId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error("No active subscription found");
    }

    const tierConfig = PRICING_TIERS[newTier];
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    const newBillingCycle = billingCycle || subscription.billing_cycle;
    const priceInCents =
      newBillingCycle === "yearly" ? tierConfig.yearly : tierConfig.monthly;

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id,
    );

    // Update subscription
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price_data: {
            currency: "usd",
            product: stripeSubscription.items.data[0].price.product,
            unit_amount: priceInCents,
            recurring: {
              interval: newBillingCycle === "yearly" ? "year" : "month",
            },
          },
        },
      ],
      proration_behavior: "create_prorations",
      metadata: {
        tier: newTier,
        billing_cycle: newBillingCycle,
      },
    });

    // Update our DB
    await supabase
      .from("subscriptions")
      .update({
        tier: newTier,
        billing_cycle: newBillingCycle,
      })
      .eq("agency_id", agencyId);

    // Log event
    await supabase.from("subscription_events").insert({
      agency_id: agencyId,
      event_type: "tier_changed",
      previous_tier: subscription.tier,
      new_tier: newTier,
    });

    logger.info(
      `Changed tier for agency ${agencyId} from ${subscription.tier} to ${newTier}`,
    );
    return { success: true };
  } catch (error) {
    logger.error("Error changing tier:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// WEBHOOK HANDLING
// ============================================

/**
 * Handle checkout.session.completed webhook
 */
export async function handleCheckoutCompleted(session) {
  try {
    const agencyId = session.metadata.agency_id;
    const tier = session.metadata.tier;
    const billingCycle = session.metadata.billing_cycle;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    // Get subscription details from Stripe
    const stripeSubscription =
      await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription in our DB
    const { error } = await supabase.from("subscriptions").upsert(
      {
        agency_id: agencyId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: stripeSubscription.items.data[0].price.id,
        tier,
        billing_cycle: billingCycle,
        status: stripeSubscription.status,
        trial_start: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000).toISOString()
          : null,
        trial_end: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000).toISOString()
          : null,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000,
        ).toISOString(),
      },
      {
        onConflict: "agency_id",
      },
    );

    if (error) throw error;

    // Update agency subscription tier
    await supabase
      .from("agencies")
      .update({ subscription_tier: tier })
      .eq("id", agencyId);

    // Log event
    await supabase.from("subscription_events").insert({
      agency_id: agencyId,
      event_type: "checkout_completed",
      new_tier: tier,
      new_status: stripeSubscription.status,
      stripe_event_id: session.id,
    });

    logger.info(`Checkout completed for agency ${agencyId}`);
    return { success: true };
  } catch (error) {
    logger.error("Error handling checkout completed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle customer.subscription.updated webhook
 */
export async function handleSubscriptionUpdated(subscription) {
  try {
    const agencyId = subscription.metadata.agency_id;
    if (!agencyId) {
      logger.warn("No agency_id in subscription metadata");
      return { success: false, error: "No agency_id in metadata" };
    }

    // Update subscription in our DB
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000,
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        tier: subscription.metadata.tier,
        billing_cycle: subscription.metadata.billing_cycle,
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) throw error;

    // Update agency subscription tier
    if (subscription.metadata.tier) {
      await supabase
        .from("agencies")
        .update({ subscription_tier: subscription.metadata.tier })
        .eq("id", agencyId);
    }

    logger.info(`Subscription updated for agency ${agencyId}`);
    return { success: true };
  } catch (error) {
    logger.error("Error handling subscription updated:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle customer.subscription.deleted webhook
 */
export async function handleSubscriptionDeleted(subscription) {
  try {
    // Update subscription status
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)
      .select("agency_id")
      .single();

    if (error) throw error;

    // Downgrade agency to free tier
    if (data?.agency_id) {
      await supabase
        .from("agencies")
        .update({ subscription_tier: "free" })
        .eq("id", data.agency_id);

      // Log event
      await supabase.from("subscription_events").insert({
        agency_id: data.agency_id,
        event_type: "subscription_deleted",
        new_status: "canceled",
      });
    }

    logger.info(`Subscription deleted: ${subscription.id}`);
    return { success: true };
  } catch (error) {
    logger.error("Error handling subscription deleted:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle invoice.paid webhook
 */
export async function handleInvoicePaid(invoice) {
  try {
    // Get agency from customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("agency_id, id")
      .eq("stripe_customer_id", invoice.customer)
      .single();

    if (!subscription) {
      logger.warn(`No subscription found for customer ${invoice.customer}`);
      return { success: false };
    }

    // Record invoice
    await supabase.from("invoices").upsert(
      {
        subscription_id: subscription.id,
        agency_id: subscription.agency_id,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount_cents: invoice.amount_paid,
        amount_paid_cents: invoice.amount_paid,
        currency: invoice.currency,
        status: "paid",
        invoice_date: new Date(invoice.created * 1000).toISOString(),
        paid_at: new Date().toISOString(),
        invoice_pdf_url: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        line_items: invoice.lines.data,
      },
      {
        onConflict: "stripe_invoice_id",
      },
    );

    logger.info(`Invoice paid recorded for agency ${subscription.agency_id}`);
    return { success: true };
  } catch (error) {
    logger.error("Error handling invoice paid:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle invoice.payment_failed webhook
 */
export async function handleInvoicePaymentFailed(invoice) {
  try {
    // Get agency from customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("agency_id")
      .eq("stripe_customer_id", invoice.customer)
      .single();

    if (!subscription) return { success: false };

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("agency_id", subscription.agency_id);

    // Log event
    await supabase.from("subscription_events").insert({
      agency_id: subscription.agency_id,
      event_type: "payment_failed",
      new_status: "past_due",
      amount_cents: invoice.amount_due,
    });

    logger.warn(`Payment failed for agency ${subscription.agency_id}`);
    return { success: true };
  } catch (error) {
    logger.error("Error handling payment failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Construct and verify webhook event
 */
export async function constructWebhookEvent(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    return { success: true, event };
  } catch (error) {
    logger.error("Webhook signature verification failed:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PRICING HELPERS
// ============================================

/**
 * Get all pricing tiers
 */
export function getPricingTiers() {
  return Object.entries(PRICING_TIERS).map(([key, config]) => ({
    id: key,
    ...config,
    monthlyFormatted: `$${(config.monthly / 100).toFixed(0)}`,
    yearlyFormatted: `$${(config.yearly / 100).toFixed(0)}`,
    monthlyEquivalentFormatted: `$${(config.monthlyEquivalent / 100).toFixed(0)}`,
  }));
}

/**
 * Get pricing tier by ID
 */
export function getPricingTier(tierId) {
  return PRICING_TIERS[tierId] || null;
}

// ============================================
// ENHANCED BILLING FUNCTIONS
// ============================================

/**
 * Get complete billing history for an agency
 */
export async function getBillingHistory(agencyId) {
  try {
    // Get customer
    const { success: customerSuccess, customer } =
      await getOrCreateCustomer(agencyId);
    if (!customerSuccess) {
      return { success: false, error: "Failed to get customer" };
    }

    // Get all invoices
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 100,
      expand: ["data.subscription", "data.charge"],
    });

    // Get all subscriptions for history
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
      expand: ["data.default_payment_method"],
    });

    // Format and combine data
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.total,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      description: invoice.description,
      created: invoice.created,
      due_date: invoice.due_date,
      finalized_at: invoice.finalized_at,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      attempt_count: invoice.attempt_count,
      subscription: invoice.subscription,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      lines: invoice.lines,
    }));

    return {
      success: true,
      data: {
        invoices: formattedInvoices,
        subscriptions: subscriptions.data,
        customer: {
          id: customer.id,
          email: customer.email,
          created: customer.created,
        },
      },
    };
  } catch (error) {
    logger.error("Error getting billing history:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Export billing history as CSV
 */
export async function exportBillingHistory(agencyId) {
  try {
    const { success, data } = await getBillingHistory(agencyId);
    if (!success) {
      return { success: false, error: "Failed to get billing history" };
    }

    // Create CSV content
    const csvHeaders = [
      "Date",
      "Type",
      "Description",
      "Amount",
      "Currency",
      "Status",
      "Invoice Number",
      "Period Start",
      "Period End",
    ];

    const csvRows = data.invoices.map((invoice) => [
      new Date(invoice.created * 1000).toLocaleDateString(),
      invoice.subscription ? "Subscription" : "One-time",
      invoice.description || "Payment",
      (invoice.amount_paid / 100).toFixed(2),
      invoice.currency.toUpperCase(),
      invoice.status,
      invoice.number || "",
      invoice.period_start
        ? new Date(invoice.period_start * 1000).toLocaleDateString()
        : "",
      invoice.period_end
        ? new Date(invoice.period_end * 1000).toLocaleDateString()
        : "",
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return { success: true, data: csvContent };
  } catch (error) {
    logger.error("Error exporting billing history:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all payment methods for a customer
 */
export async function getPaymentMethods(agencyId) {
  try {
    // Get customer
    const { success: customerSuccess, customer } =
      await getOrCreateCustomer(agencyId);
    if (!customerSuccess) {
      return { success: false, error: "Failed to get customer" };
    }

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
      expand: ["data.customer"],
    });

    // Get customer's default payment method
    const customerData = await stripe.customers.retrieve(customer.id);
    const defaultPaymentMethodId =
      customerData.invoice_settings.default_payment_method;

    // Format payment methods
    const formattedPaymentMethods = paymentMethods.data.map((method) => ({
      id: method.id,
      type: method.type,
      card: {
        brand: method.card.brand,
        last4: method.card.last4,
        exp_month: method.card.exp_month,
        exp_year: method.card.exp_year,
        fingerprint: method.card.fingerprint,
      },
      billing_details: method.billing_details,
      metadata: {
        is_default: method.id === defaultPaymentMethodId ? "true" : "false",
      },
      created: method.created,
    }));

    return {
      success: true,
      data: {
        paymentMethods: formattedPaymentMethods,
        defaultPaymentMethodId,
      },
    };
  } catch (error) {
    logger.error("Error getting payment methods:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a setup session for adding payment methods
 */
export async function createSetupSession(agencyId, successUrl, cancelUrl) {
  try {
    // Get customer
    const { success: customerSuccess, customer } =
      await getOrCreateCustomer(agencyId);
    if (!customerSuccess) {
      return { success: false, error: "Failed to get customer" };
    }

    // Create setup session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "setup",
      success_url: successUrl,
      cancel_url: cancelUrl,
      setup_intent_data: {
        metadata: {
          agency_id: agencyId,
        },
      },
    });

    logger.info(`Created setup session ${session.id} for agency ${agencyId}`);
    return { success: true, data: { url: session.url, sessionId: session.id } };
  } catch (error) {
    logger.error("Error creating setup session:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(agencyId, paymentMethodId) {
  try {
    // Get customer
    const { success: customerSuccess, customer } =
      await getOrCreateCustomer(agencyId);
    if (!customerSuccess) {
      return { success: false, error: "Failed to get customer" };
    }

    // Update customer's default payment method
    const updatedCustomer = await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    logger.info(
      `Set default payment method ${paymentMethodId} for agency ${agencyId}`,
    );
    return { success: true, data: updatedCustomer };
  } catch (error) {
    logger.error("Error setting default payment method:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(agencyId, paymentMethodId) {
  try {
    // Get customer to verify ownership
    const { success: customerSuccess, customer } =
      await getOrCreateCustomer(agencyId);
    if (!customerSuccess) {
      return { success: false, error: "Failed to get customer" };
    }

    // Verify payment method belongs to customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== customer.id) {
      return { success: false, error: "Payment method not found" };
    }

    // Check if it's the default payment method
    const customerData = await stripe.customers.retrieve(customer.id);
    const isDefault =
      customerData.invoice_settings.default_payment_method === paymentMethodId;

    if (isDefault) {
      return { success: false, error: "Cannot remove default payment method" };
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    logger.info(
      `Removed payment method ${paymentMethodId} for agency ${agencyId}`,
    );
    return { success: true };
  } catch (error) {
    logger.error("Error removing payment method:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get detailed account status with grace period info
 */
export async function getAccountStatus(agencyId) {
  try {
    // Get subscription from database
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("agency_id", agencyId)
      .single();

    if (!subscription) {
      return {
        success: true,
        data: {
          status: "unpaid",
          days_past_due: 0,
          in_grace_period: false,
          warning_level: "critical",
        },
      };
    }

    // Calculate days past due
    const now = new Date();
    const endDate = new Date(subscription.current_period_end);
    const daysPastDue = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
    const inGracePeriod =
      subscription.status === "past_due" && daysPastDue <= 7;

    // Determine warning level
    let warningLevel = "none";
    if (["canceled", "unpaid"].includes(subscription.status)) {
      warningLevel = "critical";
    } else if (subscription.status === "past_due") {
      if (daysPastDue > 7) warningLevel = "critical";
      else if (daysPastDue >= 5) warningLevel = "urgent";
      else if (daysPastDue >= 3) warningLevel = "warning";
      else warningLevel = "info";
    }

    return {
      success: true,
      data: {
        status: subscription.status,
        days_past_due: Math.max(0, daysPastDue),
        in_grace_period: inGracePeriod,
        grace_period_days_remaining: inGracePeriod
          ? Math.max(0, 7 - daysPastDue)
          : 0,
        warning_level: warningLevel,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        tier: subscription.tier,
      },
    };
  } catch (error) {
    logger.error("Error getting account status:", error);
    return { success: false, error: error.message };
  }
}

export default {
  // Customer
  getOrCreateCustomer,
  updateCustomerEmail,

  // Subscriptions
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  createTrialSubscription,
  cancelSubscription,
  resumeSubscription,
  changeTier,

  // Webhooks
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  constructWebhookEvent,

  // Enhanced Billing
  getBillingHistory,
  exportBillingHistory,
  getPaymentMethods,
  createSetupSession,
  setDefaultPaymentMethod,
  removePaymentMethod,
  getAccountStatus,

  // Pricing
  getPricingTiers,
  getPricingTier,
  PRICING_TIERS,
  SEAT_PRICE,
  TRIAL_DAYS,
};
