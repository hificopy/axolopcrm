# Pricing and Subscriptions

## Overview

Axolop CRM offers three pricing tiers designed for different stages of agency growth. All plans include a 14-day free trial with card required upfront.

## Pricing Tiers

### Sales - $67/month ($54/month yearly)
**For solo operators getting started**

| Feature | Included |
|---------|----------|
| Users | 1 |
| Leads | Unlimited |
| Contacts | Unlimited |
| CRM Features | Full |
| Calendar | Yes |
| Forms | Basic (5 forms) |
| Email | 500/month |
| Automation | No |
| AI Features | No |
| Reports | Basic |
| API Access | No |
| Support | Email |

### Build - $187/month ($149/month yearly)
**For growing teams** - Most Popular

| Feature | Included |
|---------|----------|
| Users | 3 |
| Leads | Unlimited |
| Contacts | Unlimited |
| CRM Features | Full |
| Calendar | Yes |
| Forms | Advanced (Unlimited) |
| Email | 5,000/month |
| Automation | Basic workflows |
| AI Features | Basic (Lead scoring) |
| Reports | Full |
| API Access | No |
| Support | Priority Email |

### Scale - $349/month ($279/month yearly)
**For agencies at scale**

| Feature | Included |
|---------|----------|
| Users | Unlimited |
| Leads | Unlimited |
| Contacts | Unlimited |
| CRM Features | Full |
| Calendar | Yes |
| Forms | Advanced + Custom branding |
| Email | Unlimited |
| Automation | Full workflows |
| AI Features | Full (AI Assistant, Transcription) |
| Reports | Full + Custom |
| API Access | Yes |
| White Label | Yes |
| Support | Priority + Onboarding |

## Free Trial

### How it works
1. User selects a plan during signup
2. Card details are required upfront (validated but not charged)
3. 14-day free trial begins immediately
4. Full access to selected tier's features
5. Card is automatically charged when trial ends
6. User can cancel anytime before trial ends

### Trial Features
- Full access to selected tier
- All features unlocked
- No feature restrictions
- Trial countdown shown in UI

## Billing

### Billing Interval
- **Monthly**: Pay month-to-month, cancel anytime
- **Yearly**: Save 20%, billed annually

### Payment Methods
- Credit/Debit cards via Stripe
- Automatic renewal

### Invoices
- Generated automatically after each payment
- Available in Billing Settings
- Downloadable as PDF

## Subscription Management

### Owner Only
- Only the agency owner can manage billing
- Admins cannot access billing settings
- Transfer ownership to change billing access

### Available Actions
- View current plan
- Upgrade to higher tier
- Downgrade to lower tier
- Switch billing interval
- Cancel subscription
- View billing history
- Download invoices

### Upgrades
- Immediate access to new features
- Prorated billing for current period
- New rate starts next billing cycle

### Downgrades
- Changes take effect at end of current period
- Retain current features until then
- Check feature usage before downgrading

### Cancellation
- Can cancel anytime
- Access continues until end of billing period
- Data retained for 30 days after expiration
- Can reactivate within retention period

## Value Proposition

### Tools Replaced
Axolop CRM replaces 10+ tools:

| Tool | Monthly Cost |
|------|-------------|
| GoHighLevel | $497 |
| Typeform/Jotform | $100 |
| ClickUp/Asana | $50 |
| Notion/Coda | $30 |
| Miro/Lucidchart | $50 |
| iClosed/Calendly | $97 |
| ActiveCampaign | $500 |
| Others | $51 |
| **Total** | **$1,375/month** |

### Savings by Tier
- **Sales**: Save $1,308/month ($67 vs $1,375)
- **Build**: Save $1,188/month ($187 vs $1,375)
- **Scale**: Save $1,026/month ($349 vs $1,375)

## API Reference

### Get Pricing Tiers
```
GET /api/v1/stripe/pricing
```

### Get Current Subscription
```
GET /api/v1/stripe/subscription
Headers: X-Agency-ID: <agency_id>
```

### Start Trial
```
POST /api/v1/stripe/start-trial
Headers: X-Agency-ID: <agency_id>
Body: { tier: "sales" | "build" | "scale" }
```

### Create Checkout Session
```
POST /api/v1/stripe/create-checkout-session
Headers: X-Agency-ID: <agency_id>
Body: {
  tier: "sales" | "build" | "scale",
  billing_interval: "monthly" | "yearly",
  success_url: "https://...",
  cancel_url: "https://..."
}
```

### Upgrade/Downgrade
```
POST /api/v1/stripe/upgrade
POST /api/v1/stripe/downgrade
Headers: X-Agency-ID: <agency_id>
Body: {
  new_tier: "sales" | "build" | "scale",
  billing_interval: "monthly" | "yearly" (upgrade only)
}
```

### Cancel Subscription
```
POST /api/v1/stripe/cancel
Headers: X-Agency-ID: <agency_id>
```

### Resume Subscription
```
POST /api/v1/stripe/resume
Headers: X-Agency-ID: <agency_id>
```

### Stripe Portal (Update Payment Method)
```
POST /api/v1/stripe/create-portal-session
Headers: X-Agency-ID: <agency_id>
```

## Frontend Components

### Trial Banner
```jsx
import TrialBanner, { TrialIndicator, TrialStatusCard } from '@/components/billing/TrialBanner';

// Full banner (shows at top of page)
<TrialBanner />

// Compact indicator (for sidebar/header)
<TrialIndicator />

// Status card (for billing page)
<TrialStatusCard />
```

### Context Helpers
```jsx
import { useAgency } from '@/hooks/useAgency';

const {
  subscription,           // Full subscription object
  subscriptionLoading,    // Loading state
  refreshSubscription,    // Refetch subscription
  isTrialing,            // Boolean function
  getTrialDaysLeft,      // Number or null
  hasActiveSubscription, // Boolean function
  getCurrentTier,        // 'sales' | 'build' | 'scale' | 'god_mode'
  getTierDisplayName,    // 'Sales' | 'Build' | 'Scale' | 'God Mode'
  tierHasFeature,        // Check feature availability
  getSeatLimit           // Number or Infinity
} = useAgency();
```

## Database Schema

### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  agency_id UUID REFERENCES agencies(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT, -- 'sales', 'build', 'scale'
  status TEXT, -- 'trialing', 'active', 'past_due', 'canceled'
  billing_interval TEXT, -- 'monthly', 'yearly'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Webhook Events

Axolop handles these Stripe webhooks:

- `checkout.session.completed` - New subscription created
- `customer.subscription.created` - Subscription activated
- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment processed
- `invoice.payment_failed` - Payment failed

## Environment Variables

Required for Stripe integration:

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_SALES_MONTHLY=price_...
STRIPE_PRICE_SALES_YEARLY=price_...
STRIPE_PRICE_BUILD_MONTHLY=price_...
STRIPE_PRICE_BUILD_YEARLY=price_...
STRIPE_PRICE_SCALE_MONTHLY=price_...
STRIPE_PRICE_SCALE_YEARLY=price_...
```

---

**Version:** 1.0
**Last Updated:** 2025-01-25
