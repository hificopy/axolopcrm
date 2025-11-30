# Stripe Checkout Setup Guide

This guide will walk you through configuring Stripe for Axolop CRM's payment and trial flow.

---

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers → API keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - **KEEP THIS SECRET**

5. Add to your `.env` files:

**Backend `.env`:**
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

---

## Step 2: Get Price IDs (NOT Product IDs!)

⚠️ **IMPORTANT:** You need **Price IDs** (start with `price_`), NOT Product IDs (start with `prod_`)

### You provided Product IDs:
- Scale: `prod_TVFl9HNrabEQEd`
- Build: `prod_TVFl9HNrabEQEd`
- Sales: `prod_TVFjuiMGpgYiLo`

### How to get Price IDs:

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products)
2. For each product (Sales, Build, Scale):
   - Click on the product name
   - You'll see a list of **Prices** under the product
   - Each price has an ID that starts with `price_`
   - You need **2 prices per product**: one for monthly, one for yearly

3. Copy the Price IDs and add them to **backend/.env**:

```bash
# Sales Plan Price IDs
STRIPE_PRICE_SALES_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_SALES_YEARLY=price_xxxxxxxxxxxxx

# Build Plan Price IDs
STRIPE_PRICE_BUILD_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUILD_YEARLY=price_xxxxxxxxxxxxx

# Scale Plan Price IDs
STRIPE_PRICE_SCALE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_SCALE_YEARLY=price_xxxxxxxxxxxxx
```

### Creating Prices (if you haven't):

For each product, create **2 prices**:

#### Monthly Price:
- Amount: Based on your pricing tier
  - Sales: $67/month
  - Build: $187/month
  - Scale: $349/month
- Billing period: **Monthly**
- Currency: USD

#### Yearly Price:
- Amount: Based on your yearly pricing
  - Sales: $648/year (saves $156)
  - Build: $1,788/year (saves $456)
  - Scale: $3,348/year (saves $840)
- Billing period: **Yearly**
- Currency: USD

---

## Step 3: Configure Webhooks

Webhooks allow Stripe to notify your app when events happen (payment success, trial end, etc.)

### Development (ngrok or similar):

1. Install ngrok: `npm install -g ngrok`
2. Start your backend: `npm run backend`
3. In another terminal: `ngrok http 3002`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks)
6. Click "Add endpoint"
7. Endpoint URL: `https://abc123.ngrok.io/api/v1/stripe/webhook`
8. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
9. Click "Add endpoint"
10. Copy the **Signing secret** (starts with `whsec_`)
11. Add to backend `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Production:

Same steps, but use your production domain:
- Endpoint URL: `https://yourdomain.com/api/v1/stripe/webhook`
- Use **Live mode** keys instead of test mode

---

## Step 4: Test the Integration

### Test Cards:

Stripe provides test cards for different scenarios:

**Successful payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Payment requires authentication (3D Secure):**
```
Card: 4000 0025 0000 3155
```

**Card declined:**
```
Card: 4000 0000 0000 0002
```

### Testing the Flow:

1. Start the backend: `npm run backend`
2. Start the frontend: `npm run dev`
3. Go to `http://localhost:3000`
4. Click "Get Started" or "Start Free Trial"
5. Create an account
6. Select a plan
7. Click "Confirm & Start Trial" (or "Select Plan")
8. You should be redirected to Stripe checkout
9. Use test card `4242 4242 4242 4242`
10. Complete payment
11. You should be redirected back to `/payment-success`
12. After verification, redirect to `/onboarding`
13. Complete onboarding
14. Land on dashboard with "Trial Active" status

### Check Logs:

**Backend logs should show:**
```
Trial checkout session created
Session verified successfully
```

**Stripe Dashboard should show:**
- New customer created
- Subscription created with 14-day trial
- No charge until trial ends

---

## Step 5: Common Issues

### Issue: "Stripe is not fully configured"

**Cause:** Price IDs are still placeholders in `stripe-prices.js`

**Fix:** Add real price IDs to `.env` (Step 2 above)

---

### Issue: "Session does not belong to this user"

**Cause:** User ID mismatch between session creation and verification

**Fix:** Make sure user is logged in when creating checkout session

---

### Issue: "Webhook signature verification failed"

**Cause:** Wrong webhook secret or wrong endpoint URL

**Fix:**
1. Check `STRIPE_WEBHOOK_SECRET` in `.env`
2. Make sure endpoint URL matches your ngrok/production URL
3. Restart backend after changing `.env`

---

### Issue: Checkout redirects to wrong URL

**Cause:** `FRONTEND_URL` not set correctly

**Fix:** Set in backend `.env`:
```bash
# Development
FRONTEND_URL=http://localhost:3000

# Production
FRONTEND_URL=https://yourdomain.com
```

---

## Step 6: Database Schema

Make sure your users table has these columns:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
```

---

## Pricing Reference

Your current pricing structure:

| Plan | Monthly | Yearly | Yearly Savings |
|------|---------|--------|----------------|
| **Sales** | $67/mo | $54/mo ($648/yr) | Save $156/yr (19%) |
| **Build** | $187/mo | $149/mo ($1,788/yr) | Save $456/yr (20%) |
| **Scale** | $349/mo | $279/mo ($3,348/yr) | Save $840/yr (20%) |

All plans include:
- **14-day free trial**
- No credit card required for trial
- Cancel anytime

---

## Next Steps

Once Stripe is configured:

1. ✅ Test the full payment flow in development
2. ✅ Verify webhooks are working
3. ✅ Check database updates after payment
4. ✅ Test trial expiration flow
5. ⬜ Switch to Live mode for production
6. ⬜ Update webhook endpoint to production URL
7. ⬜ Test with real credit card (will charge you!)
8. ⬜ Set up billing portal for subscription management

---

**Questions?** Check the [Stripe Documentation](https://stripe.com/docs/checkout/quickstart)
