# Quick Stripe Setup

Copy this to your `backend/.env` file:

```bash
# ============================================
# STRIPE CONFIGURATION
# ============================================

# Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Price IDs (already configured - these are your actual Stripe price IDs)
STRIPE_PRICE_SALES_MONTHLY=price_1SYFEUBZ8xGs87qd722VFiBl
STRIPE_PRICE_SALES_YEARLY=price_1SYFGpBZ8xGs87qd5xeAufMb
STRIPE_PRICE_BUILD_MONTHLY=price_1SYFFUBZ8xGs87qdgmoJkrqb
STRIPE_PRICE_BUILD_YEARLY=price_1SYFIwBZ8xGs87qdeJiy5aOX
STRIPE_PRICE_SCALE_MONTHLY=price_1SYFG4BZ8xGs87qdVTWodYJH
STRIPE_PRICE_SCALE_YEARLY=price_1SYFJLBZ8xGs87qd0Na0BsUe

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## What you still need:

1. **STRIPE_SECRET_KEY**: Go to https://dashboard.stripe.com/test/apikeys
   - Copy the "Secret key" (starts with `sk_test_`)

2. **STRIPE_WEBHOOK_SECRET** (for webhooks):
   - Install ngrok: `npm install -g ngrok`
   - Run: `ngrok http 3002`
   - Copy the HTTPS URL
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://YOUR-NGROK-URL.ngrok.io/api/v1/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, etc.
   - Copy the "Signing secret" (starts with `whsec_`)

## Test it!

1. Start backend: `npm run backend`
2. Start frontend: `npm run dev`
3. Go to: `http://localhost:3000`
4. Sign up → Select plan → Test checkout
5. Use test card: `4242 4242 4242 4242`

## Your Price IDs are already set!

✅ Sales Monthly: $67/mo - `price_1SYFEUBZ8xGs87qd722VFiBl`
✅ Sales Yearly: $54/mo - `price_1SYFGpBZ8xGs87qd5xeAufMb`
✅ Build Monthly: $187/mo - `price_1SYFFUBZ8xGs87qdgmoJkrqb`
✅ Build Yearly: $149/mo - `price_1SYFIwBZ8xGs87qdeJiy5aOX`
✅ Scale Monthly: $349/mo - `price_1SYFG4BZ8xGs87qdVTWodYJH`
✅ Scale Yearly: $279/mo - `price_1SYFJLBZ8xGs87qd0Na0BsUe`

These are hardcoded as defaults in `config/stripe-prices.js`, but you can override them with environment variables if needed.
