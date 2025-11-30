# 🚀 Stripe Products Setup Instructions

## Your Account Details

- **Account ID**: acct_1PmO8ABZ8xGs87qdgo3K7eeLGRhpbvboUGUOXYo7qKQrM1Zewh0AvozUaWcj6LO63BMhLrpfG02ZwNiaIZSU3vl300wngymia7
- **Live Public Key**: pk_live_51PmO8ABZ8xGs87qdgo3K7eeLGRhpbvboUGUOXYo7qKQrM1Zewh0AvozUaWcj6LO63BMhLrpfG02ZwNiaIZSU3vl300wngymia7
- **Live Secret Key**: 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

## Products to Create

### 1. Sales Tier (prod_TVFjuiMGpgYiLo)

**Product Details:**

- Name: Axolop CRM - Sales
- Description: For solo operators getting started. Includes 1 user, unlimited leads, basic CRM, calendar, basic forms, and 500 emails/month.
- Metadata: tier=sales

**Prices:**

- Monthly: $67.00 (6700 cents)
- Yearly: $54.00/month (5400 cents)

### 2. Build Tier (prod_TVFl2SgXUEuydZ)

**Product Details:**

- Name: Axolop CRM - Build
- Description: For growing teams. Includes 3 users, unlimited leads, advanced CRM, calendar, unlimited forms, email marketing, basic automation, and AI features.
- Metadata: tier=build

**Prices:**

- Monthly: $187.00 (18700 cents)
- Yearly: $149.00/month (14900 cents)

### 3. Scale Tier (prod_TVFl9HNrabEQEd)

**Product Details:**

- Name: Axolop CRM - Scale
- Description: For agencies at scale. Includes unlimited users, unlimited everything, full automation, advanced AI, API access, white labeling, and priority support.
- Metadata: tier=scale

**Prices:**

- Monthly: $349.00 (34900 cents)
- Yearly: $279.00/month (27900 cents)

## Setup Steps

### Step 1: Create Products

1. Go to Stripe Dashboard → Products
2. Create 3 products with the details above
3. Add product images: https://axolopcrm.com/logo.png
4. Set type: "Service"

### Step 2: Create Prices

For each product, create 2 prices:

**Sales Product:**

- Price 1: $67.00/month, 14-day trial
- Price 2: $648.00/year ($54/month), 14-day trial

**Build Product:**

- Price 1: $187.00/month, 14-day trial
- Price 2: $1,788.00/year ($149/month), 14-day trial

**Scale Product:**

- Price 1: $349.00/month, 14-day trial
- Price 2: $3,348.00/year ($279/month), 14-day trial

### Step 3: Configure Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://axolop.hopto.org:3002/api/v1/stripe/webhook`
3. Select these events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
4. Copy the webhook signing secret

### Step 4: Update Environment Variables

Add to your `.env` file:

```env
# Stripe Live Keys
STRIPE_SECRET_KEY=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
STRIPE_PUBLIC_KEY=pk_live_51PmO8ABZ8xGs87qdgo3K7eeLGRhpbvboUGUOXYo7qKQrM1Zewh0AvozUaWcj6LO63BMhLrpfG02ZwNiaIZSU3vl300wngymia7
VITE_STRIPE_PUBLIC_KEY=pk_live_51PmO8ABZ8xGs87qdgo3K7eeLGRhpbvboUGUOXYo7qKQrM1Zewh0AvozUaWcj6LO63BMhLrpfG02ZwNiaIZSU3vl300wngymia7

# Webhook Secret (get from Stripe Dashboard after setting up webhook)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Price IDs (update after creating prices)
STRIPE_PRICE_SALES_MONTHLY=price_id_from_stripe
STRIPE_PRICE_SALES_YEARLY=price_id_from_stripe
STRIPE_PRICE_BUILD_MONTHLY=price_id_from_stripe
STRIPE_PRICE_BUILD_YEARLY=price_id_from_stripe
STRIPE_PRICE_SCALE_MONTHLY=price_id_from_stripe
STRIPE_PRICE_SCALE_YEARLY=price_id_from_stripe
```

## Important Notes

1. **14-Day Free Trial**: All prices should include a 14-day free trial
2. **Metadata**: Include tier and billing_interval in price metadata
3. **Test Mode**: You can test with test keys first, then switch to live
4. **Webhook Security**: Make sure webhook endpoint is accessible and HTTPS

## After Setup

1. Test the complete flow:
   - Signup → Select plan → Enter card → Start trial
   - Trial period → Full access
   - Trial ends → First payment
   - Payment failed → Grace period → Payment wall

2. Verify billing history works
3. Test plan upgrades/downgrades
4. Test payment method management

Your Stripe billing system will be fully functional! 🎉
