/**
 * Stripe Price IDs Configuration
 *
 * IMPORTANT: Replace these with your actual Stripe price IDs from your Stripe Dashboard
 *
 * To get these IDs:
 * 1. Go to Stripe Dashboard > Products
 * 2. Create 3 products: Sales, Build, Scale
 * 3. For each product, create 2 prices: monthly and yearly
 * 4. Copy the price IDs (they start with "price_") and paste them here
 */

export const STRIPE_PRICES = {
  sales: {
    monthly: process.env.STRIPE_PRICE_SALES_MONTHLY || 'price_1SYFEUBZ8xGs87qd722VFiBl',
    yearly: process.env.STRIPE_PRICE_SALES_YEARLY || 'price_1SYFGpBZ8xGs87qd5xeAufMb',
  },
  build: {
    monthly: process.env.STRIPE_PRICE_BUILD_MONTHLY || 'price_1SYFFUBZ8xGs87qdgmoJkrqb',
    yearly: process.env.STRIPE_PRICE_BUILD_YEARLY || 'price_1SYFIwBZ8xGs87qdeJiy5aOX',
  },
  scale: {
    monthly: process.env.STRIPE_PRICE_SCALE_MONTHLY || 'price_1SYFG4BZ8xGs87qdVTWodYJH',
    yearly: process.env.STRIPE_PRICE_SCALE_YEARLY || 'price_1SYFJLBZ8xGs87qd0Na0BsUe',
  },
};

/**
 * Get Stripe price ID based on plan and billing cycle
 * @param {string} planId - Plan ID (sales, build, scale)
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @returns {string} Stripe price ID
 */
export function getPriceId(planId, billingCycle) {
  const plan = STRIPE_PRICES[planId];

  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const priceId = plan[billingCycle];

  if (!priceId) {
    throw new Error(`Invalid billing cycle: ${billingCycle}`);
  }

  return priceId;
}

/**
 * Plan metadata for Stripe
 */
export const PLAN_METADATA = {
  sales: {
    name: 'Sales',
    users: 1,
    agencies: 1,
    forms: 5,
    emails: 500,
  },
  build: {
    name: 'Build',
    users: 3,
    agencies: 3,
    forms: -1, // unlimited
    emails: 5000,
  },
  scale: {
    name: 'Scale',
    users: 3,
    agencies: -1, // unlimited
    forms: -1, // unlimited
    emails: -1, // unlimited
  },
};
