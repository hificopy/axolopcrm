# Stripe Integration - Complete ✅

## ✅ What's Done

### 1. Frontend (100% Complete)
- ✅ **SelectPlan.jsx** - Plan selection page with Stripe checkout integration
- ✅ **PaymentSuccess.jsx** - Payment verification page
- ✅ **Onboarding.jsx** - Only accessible after payment (`?from=payment`)
- ✅ **DemoModeContext.jsx** - Checks trial status, disables demo mode for trial users
- ✅ **Routes** - All routes added to App.jsx

### 2. Backend (100% Complete)
- ✅ **stripe.js routes** - Created endpoints:
  - `POST /api/v1/stripe/create-trial-checkout` - Creates checkout session
  - `POST /api/v1/stripe/verify-session` - Verifies payment after redirect
  - `POST /api/v1/stripe/webhook` - Handles Stripe webhooks (already existed)
- ✅ **stripe-prices.js** - Price ID configuration with YOUR actual Stripe price IDs
- ✅ **.env.example** - Template with all required environment variables

### 3. Price IDs Configured
Your actual Stripe price IDs are already set as defaults in the code:

| Plan | Monthly | Yearly |
|------|---------|--------|
| **Sales** | `price_1SYFEUBZ8xGs87qd722VFiBl` | `price_1SYFGpBZ8xGs87qd5xeAufMb` |
| **Build** | `price_1SYFFUBZ8xGs87qdgmoJkrqb` | `price_1SYFIwBZ8xGs87qdeJiy5aOX` |
| **Scale** | `price_1SYFG4BZ8xGs87qdVTWodYJH` | `price_1SYFJLBZ8xGs87qd0Na0BsUe` |

---

## ⚙️ What You Need to Do

### Step 1: Add Stripe Keys to Backend .env

Create `backend/.env` (copy from `.env.example`) and add:

```bash
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Get after setting up webhook (Step 3)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Already configured for you
STRIPE_PRICE_SALES_MONTHLY=price_1SYFEUBZ8xGs87qd722VFiBl
STRIPE_PRICE_SALES_YEARLY=price_1SYFGpBZ8xGs87qd5xeAufMb
STRIPE_PRICE_BUILD_MONTHLY=price_1SYFFUBZ8xGs87qdgmoJkrqb
STRIPE_PRICE_BUILD_YEARLY=price_1SYFIwBZ8xGs87qdeJiy5aOX
STRIPE_PRICE_SCALE_MONTHLY=price_1SYFG4BZ8xGs87qdVTWodYJH
STRIPE_PRICE_SCALE_YEARLY=price_1SYFJLBZ8xGs87qd0Na0BsUe

# For redirects
FRONTEND_URL=http://localhost:3000
```

**Where to get STRIPE_SECRET_KEY:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the "Secret key" (starts with `sk_test_`)

---

### Step 2: Run Database Migration

Execute this SQL in your Supabase SQL editor:

```sql
-- Located at: backend/db/migrations/add_subscription_fields.sql

ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);
```

---

### Step 3: Set Up Webhook (Development)

For development, use ngrok to expose your local backend:

```bash
# Install ngrok
npm install -g ngrok

# In terminal 1: Start backend
npm run backend

# In terminal 2: Start ngrok
ngrok http 3002
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)

Then go to: https://dashboard.stripe.com/test/webhooks
1. Click "Add endpoint"
2. Endpoint URL: `https://abc123.ngrok.io/api/v1/stripe/webhook`
3. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
4. Click "Add endpoint"
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to backend `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

---

## 🧪 Test the Complete Flow

1. **Start everything:**
   ```bash
   # Terminal 1: Backend
   npm run backend

   # Terminal 2: Frontend
   npm run dev

   # Terminal 3: ngrok (for webhooks)
   ngrok http 3002
   ```

2. **Test signup flow:**
   - Go to `http://localhost:3000`
   - Click "Get Started" or "Start Free Trial"
   - Create an account
   - Select a plan (or confirm if coming from pricing page)
   - Click "Confirm & Start Trial"
   - You'll be redirected to Stripe checkout

3. **Complete payment:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
   - Click "Subscribe"

4. **Verify flow:**
   - ✅ Redirected to `/payment-success`
   - ✅ Shows "Verifying payment..."
   - ✅ Then "Payment Confirmed!"
   - ✅ Redirected to `/onboarding?from=payment`
   - ✅ Complete onboarding questions
   - ✅ Redirected to `/app/home?trial=active`
   - ✅ Dashboard shows trial status (NOT demo mode)

5. **Check Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/test/customers
   - You should see the new customer
   - Click on customer → Subscriptions
   - Should show "Trialing" status with 14-day trial

---

## 📊 What Happens During Checkout

```
User Flow:
1. User clicks "Confirm & Start Trial" on SelectPlan page
   ↓
2. Frontend calls POST /api/v1/stripe/create-trial-checkout
   - Sends: plan (sales/build/scale), billingCycle (monthly/yearly)
   - Backend creates Stripe checkout session with 14-day trial
   - Returns: Stripe checkout URL
   ↓
3. User redirected to Stripe checkout page
   - Hosted by Stripe (secure, PCI-compliant)
   - User enters payment details
   - Stripe validates card
   ↓
4. After payment, Stripe redirects to: /payment-success?session_id=XXX
   ↓
5. PaymentSuccess page calls POST /api/v1/stripe/verify-session
   - Backend verifies session with Stripe
   - Updates users table with subscription info
   - Returns: subscription details
   ↓
6. Frontend stores trial status in localStorage
   - subscription_status: "trial"
   - trial_end_date: [14 days from now]
   ↓
7. Redirect to /onboarding?from=payment
   ↓
8. After onboarding, redirect to /app/home?trial=active
   ↓
9. DemoModeContext checks localStorage
   - Sees subscription_status = "trial"
   - Disables demo mode
   - User has full access during trial
```

---

## 🎯 Flow Variations

### Flow A: From Pricing Page (Plan Pre-selected)
```
Pricing Page → SignUp (?plan=sales) → SelectPlan (Confirm Mode) → Stripe → Onboarding → Dashboard
```

### Flow B: Direct Signup (No Plan)
```
Landing → SignUp → SelectPlan (Choose from 3 plans) → Stripe → Onboarding → Dashboard
```

---

## 🔍 Troubleshooting

### Error: "Stripe is not fully configured"
**Cause:** Missing `STRIPE_SECRET_KEY` in backend `.env`
**Fix:** Add your Stripe secret key (Step 1 above)

---

### Error: "Session does not belong to this user"
**Cause:** User not logged in during checkout
**Fix:** Make sure user is authenticated before calling create-trial-checkout

---

### Error: "Payment not completed"
**Cause:** Stripe session status is not "complete"
**Fix:** Check if payment actually went through in Stripe dashboard

---

### Webhook not firing
**Cause:** Wrong webhook URL or secret
**Fix:**
1. Make sure ngrok URL matches webhook endpoint URL in Stripe
2. Verify `STRIPE_WEBHOOK_SECRET` in `.env`
3. Restart backend after changing `.env`

---

### User still in demo mode after payment
**Cause:** localStorage not updated
**Fix:**
1. Check browser console for errors
2. Verify `/api/v1/stripe/verify-session` was called
3. Check if `subscription_status` is in localStorage
4. Try clearing localStorage and going through flow again

---

## 📚 Documentation

- **Complete Guide**: `docs/features/ONBOARDING_PAYMENT_FLOW.md`
- **Quick Setup**: `backend/SETUP_STRIPE.md`
- **Detailed Setup**: `docs/setup/STRIPE_SETUP_GUIDE.md`
- **Migration SQL**: `backend/db/migrations/add_subscription_fields.sql`

---

## ✅ Checklist Before Going Live

Development:
- [x] Stripe price IDs configured
- [ ] Stripe secret key added to .env
- [ ] Database migration run
- [ ] Webhook configured with ngrok
- [ ] Test checkout flow works
- [ ] Verify trial status in dashboard
- [ ] Check Stripe dashboard shows subscription

Production:
- [ ] Switch to Stripe Live mode keys
- [ ] Update webhook URL to production domain
- [ ] Test with real credit card (small amount)
- [ ] Verify billing portal works
- [ ] Set up email notifications for trial ending
- [ ] Monitor for webhook delivery issues

---

**Status:** Ready to test! Just add your Stripe secret key and you're good to go.
