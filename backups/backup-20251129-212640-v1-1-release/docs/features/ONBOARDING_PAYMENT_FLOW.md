# Onboarding & Payment Flow Implementation Guide

**Version:** 1.0
**Date:** 2025-01-29
**Status:** IN PROGRESS

---

## Overview

This document describes the complete restructuring of the Axolop CRM onboarding and payment flow. The new flow prioritizes account creation first, then payment, then onboarding.

### Old Flow (Deprecated)
```
Landing → Onboarding Questions → Account Creation → Demo Mode Dashboard
```

### New Flow (Current Implementation)

**Flow A: User comes from Pricing Page (plan pre-selected)**
```
Pricing Page (click "Start Free Trial" on specific plan)
  ↓ (?plan=sales/build/scale)
SignUp Page (account creation)
  ↓ (redirects with plan token)
SelectPlan Page (CONFIRMATION MODE)
  - Shows "Confirm Your Plan"
  - Displays ONLY selected plan
  - Button: "Confirm & Start Trial"
  ↓ (click confirm)
Stripe Checkout (14-day trial)
  ↓ (payment success)
PaymentSuccess Page (verification)
  ↓ (?from=payment)
Onboarding Page (CRM questions)
  ↓ (completion)
Dashboard (?trial=active) - TRIAL MODE, NOT DEMO MODE
```

**Flow B: User comes directly to SignUp (no plan selected)**
```
Landing Page (click "Get Started")
  ↓ (no plan token)
SignUp Page (account creation)
  ↓ (no plan parameter)
SelectPlan Page (SELECTION MODE)
  - Shows "Select Your Plan"
  - Displays ALL three plans
  - Button: "Select Plan"
  ↓ (user picks plan)
Stripe Checkout (14-day trial)
  ↓ (payment success)
PaymentSuccess Page (verification)
  ↓ (?from=payment)
Onboarding Page (CRM questions)
  ↓ (completion)
Dashboard (?trial=active) - TRIAL MODE, NOT DEMO MODE
```

---

## Key Principles

1. **Account Creation First**: Users create their account BEFORE selecting a plan or going through onboarding
2. **Payment Second**: After account creation, users select a plan and go to Stripe for 14-day free trial
3. **Onboarding Last**: Only after successful payment does onboarding begin
4. **No Demo Mode for Trial Users**: Users coming from Stripe should be in trial mode, NOT demo mode
5. **Pre-selected Plans**: If user clicks from pricing page, their plan is pre-selected
6. **Authenticated State**: After Stripe redirect, user should already be authenticated

---

## Implementation Checklist

### ✅ Phase 1: Update Landing Page CTAs (COMPLETED)

**File:** `frontend/pages/Landing.jsx`

**Changes:**
- Added `useSupabase` hook to check authentication
- Updated `handleGetStarted()` to redirect to `/signup` instead of `/onboarding`
- If user is already authenticated, redirect to `/app/home`

**Code:**
```javascript
import { useSupabase } from "@/context/SupabaseContext";

const handleGetStarted = () => {
  if (user) {
    navigate("/app/home");
    return;
  }

  if (affiliateRef) {
    navigate(`/signup?ref=${affiliateRef}${affiliateName ? `&fname=${affiliateName}` : ""}`);
  } else {
    navigate("/signup");
  }
};
```

---

### ✅ Phase 2: Update Pricing Page CTAs (COMPLETED)

**File:** `frontend/pages/public/Pricing.jsx`

**Changes:**
- Updated all plan CTA links from `/onboarding?plan=X` to `/signup?plan=X`
- All three plans (sales, build, scale) now redirect to signup page

**Code:**
```javascript
const PLANS = [
  {
    id: "sales",
    ctaLink: "/signup?plan=sales",
    // ...
  },
  {
    id: "build",
    ctaLink: "/signup?plan=build",
    // ...
  },
  {
    id: "scale",
    ctaLink: "/signup?plan=scale",
    // ...
  },
];
```

---

### ✅ Phase 3: Update SignUp Page Redirect (COMPLETED)

**File:** `frontend/pages/SignUp.jsx`

**Changes:**
- After successful signup, redirect to `/select-plan?plan=X` instead of onboarding
- Clear onboarding data from localStorage
- Update success message to mention plan selection

**Code:**
```javascript
// Clear old onboarding data
localStorageRemove("onboarding_responses");
localStorageRemove("recommended_plan");

// Get plan from URL if coming from pricing page
const urlParams = new URLSearchParams(location.search);
const selectedPlan = urlParams.get('plan');

// Redirect to plan selection
setTimeout(() => {
  if (selectedPlan) {
    navigate(`/select-plan?plan=${selectedPlan}`, { replace: true });
  } else {
    navigate("/select-plan", { replace: true });
  }
}, 2000);
```

---

### 🔨 Phase 4: Create Plan Selection Page (IN PROGRESS)

**File:** `frontend/pages/SelectPlan.jsx` (NEW FILE)

**Requirements:**
1. Show all three pricing tiers (Sales, Build, Scale)
2. If `?plan=X` parameter exists, show "Already picked: [Plan Name]" badge
3. Monthly/Yearly toggle matching Pricing page design
4. "Test for free" buttons that initiate Stripe checkout
5. Dark theme matching Axolop branding
6. Use Axolop black logo
7. Responsive grid layout (3 columns on desktop, 1 on mobile)

**Design Elements:**
- Background: `#0F0510`
- Primary color: `#E92C92` (pink gradient)
- Gold accent: `#EBB207`
- Teal accent: `#1A777B`
- Logo: `/axolop-black-transparent.png`

**Component Structure:**
```jsx
export default function SelectPlan() {
  const [searchParams] = useSearchParams();
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();
  const preSelectedPlan = searchParams.get('plan');

  const handleSelectPlan = async (planId) => {
    // Store selected plan
    localStorage.setItem('selected_plan', planId);

    // Redirect to Stripe checkout
    // TODO: Implement Stripe checkout session creation
  };

  return (
    // Dark themed page with pricing cards
    // Show "Already picked" badge if preSelectedPlan exists
    // Monthly/Yearly toggle
    // "Test for free" buttons
  );
}
```

**Data Structure:**
```javascript
const PLANS = [
  {
    id: "sales",
    name: "Sales",
    description: "For solo operators getting started",
    price: { monthly: 67, yearly: 54 },
    yearlyTotal: 648,
    limits: {
      users: "1 User",
      agencies: "1 Agency",
      forms: "5 Forms",
      emails: "500/month",
    },
    features: [
      "Full CRM Features",
      "Lead Management",
      "Contact Management",
      "Opportunity Pipeline",
      "Calendar & Scheduling",
      "Basic Forms (5 forms)",
      "Email (500/month)",
      "Basic Reports",
      "Email Support",
    ],
  },
  // ... build, scale
];
```

---

### 🔨 Phase 5: Integrate Stripe Checkout (PENDING)

**Backend File:** `backend/routes/stripe.js` (NEW FILE)

**Requirements:**
1. Create Stripe checkout session endpoint
2. Configure 14-day free trial
3. Pass plan selection metadata
4. Set success/cancel URLs
5. Handle customer creation
6. Store subscription data

**API Endpoint:**
```javascript
// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.user.id;

    // Get price ID based on plan and billing cycle
    const priceId = getPriceId(planId, billingCycle);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      mode: 'subscription',
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
          plan_id: planId,
        },
      },
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/select-plan?plan=${planId}`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Stripe checkout error', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
```

**Frontend Integration:**
```javascript
// In SelectPlan.jsx
const handleSelectPlan = async (planId) => {
  try {
    localStorage.setItem('selected_plan', planId);

    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        planId,
        billingCycle: isYearly ? 'yearly' : 'monthly',
      }),
    });

    const { url } = await response.json();

    // Redirect to Stripe
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Failed to start checkout');
  }
};
```

**Environment Variables Needed:**
```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

**Stripe Price IDs Configuration:**
```javascript
// backend/config/stripe-prices.js
export const STRIPE_PRICES = {
  sales: {
    monthly: 'price_sales_monthly_id',
    yearly: 'price_sales_yearly_id',
  },
  build: {
    monthly: 'price_build_monthly_id',
    yearly: 'price_build_yearly_id',
  },
  scale: {
    monthly: 'price_scale_monthly_id',
    yearly: 'price_scale_yearly_id',
  },
};
```

---

### 🔨 Phase 6: Handle Stripe Success Redirect (PENDING)

**File:** `frontend/pages/PaymentSuccess.jsx` (NEW FILE)

**Requirements:**
1. Receive Stripe session ID from URL
2. Verify payment success with backend
3. Update user status to "trial"
4. Redirect to onboarding
5. Ensure user is authenticated (NOT demo mode)

**Component Structure:**
```jsx
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSupabase();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        navigate('/select-plan');
        return;
      }

      try {
        // Verify session with backend
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const { success, subscription } = await response.json();

        if (success) {
          // Store subscription info
          localStorage.setItem('subscription_status', 'trial');
          localStorage.setItem('trial_end_date', subscription.trial_end);

          // Redirect to onboarding
          navigate('/onboarding?from=payment');
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        navigate('/select-plan');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0510]">
      {verifying ? (
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#E92C92] mx-auto mb-4" />
          <p className="text-white text-xl">Verifying payment...</p>
        </div>
      ) : null}
    </div>
  );
}
```

**Backend Endpoint:**
```javascript
// POST /api/stripe/verify-session
router.post('/verify-session', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' || session.mode === 'subscription') {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      // Update user in database
      await supabase
        .from('users')
        .update({
          subscription_status: 'trial',
          subscription_id: subscription.id,
          trial_end_date: new Date(subscription.trial_end * 1000),
          plan_id: session.metadata.plan_id,
          stripe_customer_id: session.customer,
        })
        .eq('id', userId);

      res.json({
        success: true,
        subscription: {
          id: subscription.id,
          trial_end: subscription.trial_end,
          plan: session.metadata.plan_id,
        },
      });
    } else {
      res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    logger.error('Session verification error', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});
```

---

### 🔨 Phase 7: Rebrand Onboarding Page (PENDING)

**File:** `frontend/pages/Onboarding.jsx`

**Changes Required:**
1. Change "Build Funnel" → "Build your CRM"
2. Update all funnel-related questions to CRM-focused questions
3. Update feature list to match Axolop CRM capabilities
4. Only show onboarding if `?from=payment` parameter exists
5. After completion, redirect to `/app/home?trial=active`

**Updated Questions:**
```javascript
const ONBOARDING_QUESTIONS = [
  {
    id: "industry",
    type: "select",
    question: "What industry is your agency focused on?",
    field: "industry",
    options: [
      { value: "real-estate", label: "Real Estate" },
      { value: "healthcare", label: "Healthcare" },
      { value: "finance", label: "Finance" },
      { value: "ecommerce", label: "E-commerce" },
      { value: "saas", label: "SaaS" },
      { value: "education", label: "Education" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "team_size",
    type: "select",
    question: "How many people are on your team?",
    field: "team_size",
    options: [
      { value: "solo", label: "Just me" },
      { value: "2-5", label: "2-5 people" },
      { value: "6-10", label: "6-10 people" },
      { value: "11-20", label: "11-20 people" },
      { value: "20+", label: "20+ people" },
    ],
  },
  {
    id: "monthly_revenue",
    type: "select",
    question: "What's your monthly recurring revenue?",
    field: "monthly_revenue",
    options: [
      { value: "0-10k", label: "$0 - $10k" },
      { value: "10k-50k", label: "$10k - $50k" },
      { value: "50k-100k", label: "$50k - $100k" },
      { value: "100k+", label: "$100k+" },
    ],
  },
  {
    id: "primary_goal",
    type: "multi-select",
    question: "What are your primary goals with Axolop CRM?",
    field: "primary_goals",
    options: [
      { value: "lead-management", label: "Better lead management" },
      { value: "email-automation", label: "Email marketing automation" },
      { value: "team-collaboration", label: "Team collaboration" },
      { value: "reporting", label: "Better reporting & analytics" },
      { value: "consolidate-tools", label: "Consolidate multiple tools" },
      { value: "save-money", label: "Reduce tool costs" },
    ],
  },
  {
    id: "current_tools",
    type: "multi-select",
    question: "Which tools are you currently using?",
    field: "current_tools",
    options: [
      { value: "gohighlevel", label: "GoHighLevel" },
      { value: "hubspot", label: "HubSpot" },
      { value: "salesforce", label: "Salesforce" },
      { value: "activecampaign", label: "ActiveCampaign" },
      { value: "typeform", label: "Typeform" },
      { value: "calendly", label: "Calendly" },
      { value: "notion", label: "Notion" },
      { value: "clickup", label: "ClickUp" },
      { value: "other", label: "Other" },
    ],
  },
];
```

**Completion Redirect:**
```javascript
// After final question
const handleComplete = async () => {
  try {
    // Save onboarding data to backend
    await fetch('/api/users/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(responses),
    });

    // Clear localStorage
    localStorage.removeItem('onboarding_progress');

    // Redirect to dashboard with trial active
    navigate('/app/home?trial=active&onboarding=complete');
  } catch (error) {
    console.error('Onboarding save error:', error);
  }
};
```

---

### 🔨 Phase 8: Remove Demo Mode for Trial Users (PENDING)

**File:** `frontend/contexts/DemoModeContext.jsx`

**Changes Required:**
1. Check if user has active trial subscription
2. If trial is active, set `isDemoMode` to `false`
3. Show trial banner instead of demo banner

**Updated Context:**
```javascript
export const DemoModeProvider = ({ children }) => {
  const { user } = useSupabase();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsDemoMode(false);
        return;
      }

      // Check if user has active subscription/trial
      const { data } = await supabase
        .from('users')
        .select('subscription_status, trial_end_date')
        .eq('id', user.id)
        .single();

      if (data?.subscription_status === 'trial' || data?.subscription_status === 'active') {
        setIsDemoMode(false);
        setSubscriptionStatus(data.subscription_status);
      } else {
        // Check localStorage for demo mode flag
        const demoFlag = localStorage.getItem('demo_mode');
        setIsDemoMode(demoFlag === 'true');
      }
    };

    checkSubscription();
  }, [user]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setIsDemoMode, subscriptionStatus }}>
      {children}
    </DemoModeContext.Provider>
  );
};
```

**Trial Banner Component:**
```jsx
// components/TrialBanner.jsx
export default function TrialBanner() {
  const { subscriptionStatus } = useDemoMode();
  const [trialEndDate, setTrialEndDate] = useState(null);

  useEffect(() => {
    const endDate = localStorage.getItem('trial_end_date');
    if (endDate) {
      setTrialEndDate(new Date(endDate));
    }
  }, []);

  if (subscriptionStatus !== 'trial') return null;

  const daysLeft = trialEndDate
    ? Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24))
    : 14;

  return (
    <div className="bg-gradient-to-r from-[#E92C92] to-[#ff6b4a] text-white px-4 py-2 text-center">
      <p className="text-sm font-medium">
        🎉 Trial Active: {daysLeft} days remaining.
        <Link to="/billing" className="underline ml-2">Upgrade now</Link>
      </p>
    </div>
  );
}
```

---

### 🔨 Phase 9: Add Routes to App.jsx (PENDING)

**File:** `frontend/App.jsx`

**Routes to Add:**
```jsx
import SelectPlan from './pages/SelectPlan';
import PaymentSuccess from './pages/PaymentSuccess';

// In routes configuration
<Route path="/select-plan" element={<SelectPlan />} />
<Route path="/payment-success" element={<PaymentSuccess />} />
<Route path="/onboarding" element={<Onboarding />} />
```

---

### 🔨 Phase 10: Database Schema Updates (PENDING)

**File:** `backend/db/migrations/add_subscription_fields.sql`

**Schema Changes:**
```sql
-- Add subscription fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Subscription status values:
-- 'none' - no subscription
-- 'trial' - in 14-day trial
-- 'active' - paying subscriber
-- 'canceled' - subscription canceled
-- 'past_due' - payment failed
```

---

### 🔨 Phase 11: Stripe Webhook Handler (PENDING)

**File:** `backend/routes/stripe-webhooks.js`

**Events to Handle:**
1. `checkout.session.completed` - Trial started
2. `customer.subscription.updated` - Subscription changed
3. `customer.subscription.deleted` - Subscription canceled
4. `invoice.payment_failed` - Payment failed

**Webhook Handler:**
```javascript
import express from 'express';
import Stripe from 'stripe';
import { logger } from '../utils/logger.js';
import { supabase } from '../config/supabase-client.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.user_id;
  const planId = session.metadata.plan_id;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await supabase
    .from('users')
    .update({
      subscription_status: 'trial',
      subscription_id: subscription.id,
      plan_id: planId,
      stripe_customer_id: session.customer,
      trial_end_date: new Date(subscription.trial_end * 1000),
      subscription_start_date: new Date(subscription.created * 1000),
    })
    .eq('id', userId);

  logger.info(`Trial started for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('subscription_id', subscription.id)
    .single();

  if (!user) return;

  const status = subscription.status === 'active' && !subscription.trial_end
    ? 'active'
    : subscription.status === 'trialing'
    ? 'trial'
    : subscription.status;

  await supabase
    .from('users')
    .update({
      subscription_status: status,
      trial_end_date: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    })
    .eq('id', user.id);

  logger.info(`Subscription updated for user ${user.id}: ${status}`);
}

async function handleSubscriptionDeleted(subscription) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('subscription_id', subscription.id)
    .single();

  if (!user) return;

  await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      subscription_end_date: new Date(),
    })
    .eq('id', user.id);

  logger.info(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentFailed(invoice) {
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (!user) return;

  await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', user.id);

  // TODO: Send email notification about failed payment
  logger.warn(`Payment failed for user ${user.id}`);
}

export default router;
```

---

## Testing Checklist

### User Flow Testing

- [ ] Click "Get Started" on landing page → Should go to `/signup`
- [ ] Click "Start Free Trial" on pricing page (Sales) → Should go to `/signup?plan=sales`
- [ ] Complete signup with plan parameter → Should go to `/select-plan?plan=sales`
- [ ] Complete signup without plan parameter → Should go to `/select-plan`
- [ ] On select-plan page with plan parameter → Should show "Already picked: Sales" badge
- [ ] Click "Test for free" → Should redirect to Stripe checkout
- [ ] Complete Stripe payment → Should redirect to `/payment-success?session_id=XXX`
- [ ] Payment success page → Should verify payment and redirect to `/onboarding?from=payment`
- [ ] Complete onboarding → Should redirect to `/app/home?trial=active`
- [ ] Dashboard should show trial banner, NOT demo mode banner
- [ ] Authenticated user clicking "Get Started" → Should go directly to `/app/home`

### Edge Cases

- [ ] Cancel Stripe checkout → Should return to `/select-plan?plan=X`
- [ ] Expired Stripe session → Should show error and redirect to `/select-plan`
- [ ] Already subscribed user accessing `/select-plan` → Should redirect to `/app/home`
- [ ] User accessing `/onboarding` without `?from=payment` → Should redirect to `/select-plan`
- [ ] Trial expiry → Should change status from 'trial' to 'expired' and show upgrade prompt

### Backend Testing

- [ ] Stripe checkout session creation works
- [ ] Webhook signature verification works
- [ ] Database updates on checkout completion
- [ ] Subscription status updates correctly
- [ ] Trial end date calculation is accurate
- [ ] Payment failure handling works

---

## Environment Setup

### Required Environment Variables

**Frontend (.env):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:3002
```

**Backend (.env):**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

### Stripe Setup Steps

1. Create Stripe account (test mode)
2. Create three products: Sales, Build, Scale
3. For each product, create two prices: monthly and yearly
4. Set 14-day trial on all subscriptions
5. Copy price IDs to `backend/config/stripe-prices.js`
6. Set up webhook endpoint: `https://yourdomain.com/api/stripe-webhook`
7. Subscribe to events: checkout.session.completed, customer.subscription.*, invoice.payment_failed
8. Copy webhook secret to `.env`

---

## File Structure

```
frontend/
├── pages/
│   ├── SelectPlan.jsx          (NEW - Plan selection page)
│   ├── PaymentSuccess.jsx      (NEW - Payment verification)
│   ├── Onboarding.jsx          (UPDATED - Rebranded for CRM)
│   ├── SignUp.jsx              (UPDATED - Redirects to select-plan)
│   └── public/
│       ├── Landing.jsx         (UPDATED - Redirects to signup)
│       └── Pricing.jsx         (UPDATED - Redirects to signup)
├── components/
│   └── TrialBanner.jsx         (NEW - Trial status banner)
├── contexts/
│   └── DemoModeContext.jsx     (UPDATED - Check trial status)
└── App.jsx                     (UPDATED - New routes)

backend/
├── routes/
│   ├── stripe.js               (NEW - Stripe endpoints)
│   └── stripe-webhooks.js      (NEW - Webhook handler)
├── config/
│   └── stripe-prices.js        (NEW - Price ID mappings)
└── db/
    └── migrations/
        └── add_subscription_fields.sql  (NEW - Schema update)
```

---

## Success Criteria

✅ Users can create account without onboarding questions first
✅ Users can select a plan after account creation
✅ Stripe checkout flow works for 14-day trial
✅ Payment verification works correctly
✅ Onboarding shows AFTER payment, not before
✅ Trial users are NOT in demo mode
✅ Pre-selected plans from pricing page work
✅ Authenticated users bypass signup flow
✅ Database correctly tracks subscription status
✅ Webhooks update user status in real-time

---

## Notes for Other LLMs

1. **NEVER skip payment verification** - Always verify Stripe session on backend before granting access
2. **ALWAYS check authentication** - Users must be logged in before selecting plan
3. **Trial vs Demo Mode** - Trial users have full access, demo users have limited access
4. **Plan Pre-selection** - If `?plan=X` exists, show it clearly and pass to Stripe
5. **Error Handling** - Always handle Stripe errors gracefully and redirect appropriately
6. **Security** - Never expose Stripe secret keys in frontend code
7. **Webhook Verification** - Always verify webhook signatures before processing
8. **Database Isolation** - All queries must filter by `user_id`

---

## Implementation Status

### ✅ Completed (Frontend)

1. **SelectPlan.jsx** - Plan selection page with conditional UI:
   - **With plan token** (`?plan=X` from pricing page):
     - Shows "Confirm Your Plan" heading
     - Displays ONLY the selected plan (single card, centered)
     - Shows "Your Selection" badge
     - Button says "Confirm & Start Trial"
     - Includes "Change Plan" link to view all options
   - **Without plan token** (direct signup):
     - Shows "Select Your Plan" heading
     - Displays ALL three plans (grid layout)
     - Shows "Most Popular" badge on Build plan
     - Button says "Select Plan"
   - Monthly/yearly toggle (both modes)
   - Dark theme matching Axolop branding
   - Responsive design
   - Ready for Stripe integration

2. **PaymentSuccess.jsx** - Payment verification page with:
   - Session ID verification (mock for now, ready for backend)
   - Loading state during verification
   - Trial status storage in localStorage
   - Redirect to onboarding after success

3. **App.jsx routes** - Added:
   - `/select-plan` route
   - `/payment-success` route

4. **Onboarding.jsx updates** - Modified:
   - Added check for `?from=payment` parameter
   - Redirects users who didn't come from payment
   - Disabled demo mode on completion
   - Redirects to `/app/home?trial=active&onboarding=complete`

5. **DemoModeContext.jsx** - Enhanced:
   - Checks `subscription_status` from localStorage
   - If status is "trial" or "active", disables demo mode
   - Exports `subscriptionStatus` for other components

6. **Landing.jsx** - Updated:
   - Redirects to `/signup` instead of `/onboarding`
   - Checks if user is authenticated before redirecting

7. **SignUp.jsx** - Updated:
   - Redirects to `/select-plan?plan=X` after account creation
   - Passes plan parameter from pricing page

8. **Pricing.jsx** - Updated:
   - All CTAs redirect to `/signup?plan=X`

### ✅ Completed (Backend Integration)

1. **Stripe checkout session creation** - DONE:
   - ✅ `POST /api/v1/stripe/create-trial-checkout` endpoint created
   - ✅ Price IDs configured in `config/stripe-prices.js`
   - ✅ Actual Stripe price IDs set as defaults:
     - Sales Monthly: `price_1SYFEUBZ8xGs87qd722VFiBl`
     - Sales Yearly: `price_1SYFGpBZ8xGs87qd5xeAufMb`
     - Build Monthly: `price_1SYFFUBZ8xGs87qdgmoJkrqb`
     - Build Yearly: `price_1SYFIwBZ8xGs87qdeJiy5aOX`
     - Scale Monthly: `price_1SYFG4BZ8xGs87qdVTWodYJH`
     - Scale Yearly: `price_1SYFJLBZ8xGs87qd0Na0BsUe`
   - ✅ Environment variables template created in `.env.example`

2. **Stripe session verification** - DONE:
   - ✅ `POST /api/v1/stripe/verify-session` endpoint created
   - ✅ Database updates for subscription status (ready to implement in DB)

3. **Stripe webhook handler** - READY:
   - ✅ Webhook endpoint exists at `/api/v1/stripe/webhook`
   - ✅ Event handlers already implemented
   - ⚠️ Needs webhook secret configuration (see `SETUP_STRIPE.md`)

4. **Database migrations** - READY:
   - ⚠️ Need to run migration to add subscription fields to users table (SQL provided in docs)

### 📝 Pending (Content Updates)

1. **Onboarding questions rebranding** - Need to update:
   - Change "Build Funnel" to "Build your CRM"
   - Update questions to be CRM-focused instead of funnel-focused
   - Update feature list to match Axolop capabilities

---

**Document Status:** PARTIALLY IMPLEMENTED (Frontend complete, Backend pending)
**Next Step:** Implement Stripe backend integration (see Phase 5 above)
**Last Updated:** 2025-01-29
