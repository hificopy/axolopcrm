/**
 * Stripe Products Setup Script
 *
 * Creates the three pricing tiers in Stripe with your specifications
 */

const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(
  "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",
);

// Product configurations based on your specifications
const PRODUCTS = [
  {
    name: "Axolop CRM - Sales",
    description:
      "For solo operators getting started. Includes 1 user, unlimited leads, basic CRM, calendar, basic forms, and 500 emails/month.",
    images: ["https://axolopcrm.com/logo.png"],
    metadata: {
      tier: "sales",
      features:
        "1 user, unlimited leads, basic CRM, calendar, 5 forms, 500 emails/month",
    },
  },
  {
    name: "Axolop CRM - Build",
    description:
      "For growing teams. Includes 3 users, unlimited leads, advanced CRM, calendar, unlimited forms, email marketing, basic automation, and AI features.",
    images: ["https://axolopcrm.com/logo.png"],
    metadata: {
      tier: "build",
      features:
        "3 users, unlimited leads, advanced CRM, calendar, unlimited forms, 5,000 emails/month, basic automation, AI assistant",
    },
  },
  {
    name: "Axolop CRM - Scale",
    description:
      "For agencies at scale. Includes unlimited users, unlimited everything, full automation, advanced AI, API access, white labeling, and priority support.",
    images: ["https://axolopcrm.com/logo.png"],
    metadata: {
      tier: "scale",
      features:
        "unlimited users, unlimited everything, full automation, advanced AI, API access, white label, priority support",
    },
  },
];

// Price configurations
const PRICES = [
  {
    productId: "prod_TVFjuiMGpgYiLo",
    nickname: "Sales Monthly",
    amount: 6700, // $67.00 in cents
    currency: "usd",
    interval: "month",
    interval_count: 1,
    metadata: {
      tier: "sales",
      billing_interval: "monthly",
      product_id: "prod_TVFjuiMGpgYiLo",
    },
  },
  {
    productId: "prod_TVFjuiMGpgYiLo",
    nickname: "Sales Yearly",
    amount: 5400, // $54.00/month equivalent
    currency: "usd",
    interval: "year",
    interval_count: 1,
    metadata: {
      tier: "sales",
      billing_interval: "yearly",
      product_id: "prod_TVFjuiMGpgYiLo",
    },
  },
  {
    productId: "prod_TVFl2SgXUEuydZ",
    nickname: "Build Monthly",
    amount: 18700, // $187.00 in cents
    currency: "usd",
    interval: "month",
    interval_count: 1,
    metadata: {
      tier: "build",
      billing_interval: "monthly",
      product_id: "prod_TVFl2SgXUEuydZ",
    },
  },
  {
    productId: "prod_TVFl2SgXUEuydZ",
    nickname: "Build Yearly",
    amount: 14900, // $149.00/month equivalent
    currency: "usd",
    interval: "year",
    interval_count: 1,
    metadata: {
      tier: "build",
      billing_interval: "yearly",
      product_id: "prod_TVFl2SgXUEuydZ",
    },
  },
  {
    productId: "prod_TVFl9HNrabEQEd",
    nickname: "Scale Monthly",
    amount: 34900, // $349.00 in cents
    currency: "usd",
    interval: "month",
    interval_count: 1,
    metadata: {
      tier: "scale",
      billing_interval: "monthly",
      product_id: "prod_TVFl9HNrabEQEd",
    },
  },
  {
    productId: "prod_TVFl9HNrabEQEd",
    nickname: "Scale Yearly",
    amount: 27900, // $279.00/month equivalent
    currency: "usd",
    interval: "year",
    interval_count: 1,
    metadata: {
      tier: "scale",
      billing_interval: "yearly",
      product_id: "prod_TVFl9HNrabEQEd",
    },
  },
];

async function setupStripeProducts() {
  console.log("🚀 Setting up Stripe products and prices...");
  try {
    // Step 1: Create or update products
    const createdProducts = {};

    for (const productConfig of PRODUCTS) {
      console.log(`\n📦 Creating product: ${productConfig.name}`);

      // Check if product already exists
      const existingProducts = await stripe.products.list({
        limit: 100,
        metadata: {
          tier: productConfig.metadata.tier,
        },
      });

      let product;
      if (existingProducts.data.length > 0) {
        // Update existing product
        product = await stripe.products.update(existingProducts.data[0].id, {
          name: productConfig.name,
          description: productConfig.description,
          images: productConfig.images,
          metadata: productConfig.metadata,
        });
        console.log(`✅ Updated existing product: ${product.id}`);
      } else {
        // Create new product
        product = await stripe.products.create({
          name: productConfig.name,
          description: productConfig.description,
          images: productConfig.images,
          metadata: productConfig.metadata,
          type: "service",
        });
        console.log(`✅ Created new product: ${product.id}`);
      }

      createdProducts[productConfig.metadata.tier] = product;
    }

    // Step 2: Create or update prices
    console.log("\n💰 Creating prices...");

    for (const priceConfig of PRICES) {
      const product = createdProducts[priceConfig.metadata.tier];

      console.log(`Creating ${priceConfig.nickname} for ${product.name}...`);

      // Check if price already exists
      const existingPrices = await stripe.prices.list({
        product: product.id,
        limit: 100,
        metadata: {
          tier: priceConfig.metadata.tier,
          billing_interval: priceConfig.metadata.billing_interval,
        },
      });

      let price;
      if (existingPrices.data.length > 0) {
        // Archive existing price and create new one
        await stripe.prices.update(existingPrices.data[0].id, {
          active: false,
        });
      }

      // Create new price
      price = await stripe.prices.create({
        product: product.id,
        nickname: priceConfig.nickname,
        amount: priceConfig.amount,
        currency: priceConfig.currency,
        interval: priceConfig.interval,
        interval_count: priceConfig.interval_count,
        metadata: priceConfig.metadata,
        recurring: {
          interval: priceConfig.interval,
          interval_count: priceConfig.interval_count,
          trial_period_days: 14, // 14-day free trial
        },
      });

      console.log(`✅ Created price: ${price.id} (${priceConfig.nickname})`);

      // Store price ID for reference
      console.log(`   📋 Price ID: ${price.id}`);
      console.log(`   💰 Amount: $${(priceConfig.amount / 100).toFixed(2)}`);
      console.log(`   📅 Interval: ${priceConfig.interval}`);
    }

    // Step 3: Output environment variables
    console.log("\n🔧 Environment Variables to add to your .env file:\n");
    console.log("=".repeat(60));

    const envVars = {
      STRIPE_SECRET_KEY:
        "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",
      STRIPE_PUBLIC_KEY:
        "pk_live_51PmO8ABZ8xGs87qdgo3K7eeLGRhpbvboUGUOXYo7qKQrM1Zewh0AvozUaWcj6LO63BMhLrpfG02ZwNiaIZSU3vl300wngymia7",
      STRIPE_WEBHOOK_SECRET: "whsec_your_webhook_secret_here", // Generate after setting up webhook
      VITE_STRIPE_PUBLIC_KEY:
        "pk_live_51PmO8ABZ8xGs87qdgo3K7eeLGRhpbvboUGUOXYo7qKQrM1Zewh0AvozUaWcj6LO63BMhLrpfG02ZwNiaIZSU3vl300wngymia7",

      // Price IDs (will be updated after creating prices)
      STRIPE_PRICE_SALES_MONTHLY: "price_to_be_created",
      STRIPE_PRICE_SALES_YEARLY: "price_to_be_created",
      STRIPE_PRICE_BUILD_MONTHLY: "price_to_be_created",
      STRIPE_PRICE_BUILD_YEARLY: "price_to_be_created",
      STRIPE_PRICE_SCALE_MONTHLY: "price_to_be_created",
      STRIPE_PRICE_SCALE_YEARLY: "price_to_be_created",
    };

    for (const [key, value] of Object.entries(envVars)) {
      console.log(`${key}=${value}`);
    }

    console.log("\n🌐 Webhook Endpoint URL:");
    console.log("https://axolop.hopto.org:3002/api/v1/stripe/webhook");
    console.log("\n⚠️  IMPORTANT: After running this script:");
    console.log("1. Go to Stripe Dashboard → Webhooks");
    console.log(
      "2. Add endpoint: https://axolop.hopto.org:3002/api/v1/stripe/webhook",
    );
    console.log(
      "3. Select events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed",
    );
    console.log("4. Copy webhook secret and add to STRIPE_WEBHOOK_SECRET");

    console.log("\n✅ Stripe setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up Stripe products:", error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupStripeProducts();
}

module.exports = setupStripeProducts;
