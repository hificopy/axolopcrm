# Affiliate Program

## Overview

The Axolop CRM Affiliate Program allows existing users and partners to refer new customers and earn commissions on successful conversions.

## Trial Policies

### Regular Signups (Non-Affiliate)
- **Trial Duration:** 14 days
- **Credit Card Required:** Yes (card required at signup, not charged during trial)
- **Conversion:** Automatic billing after trial ends unless cancelled

### Affiliate Referrals
- **Trial Duration:** 30 days (extended trial)
- **Credit Card Required:** No (no card required for affiliate signups)
- **Special Tracking:** Referrals tracked via `?ref=CODE` URL parameter
- **Conversion:** User must add payment method to continue after trial

## Commission Structure

| Tier | Commission Rate | Eligibility |
|------|-----------------|-------------|
| Standard | 20% | All affiliates |
| Silver | 30% | 10+ successful referrals |
| Gold | 40% | 25+ successful referrals |

Commissions are:
- **Recurring:** Paid monthly for as long as the referred customer remains active
- **Paid:** Monthly via PayPal, Stripe, or bank transfer
- **Minimum Payout:** $50

## How It Works

1. **Join:** Sign up for the affiliate program in Settings > Affiliate Portal
2. **Share:** Get your unique referral link (e.g., `axolop.com/landing?ref=YOUR_CODE`)
3. **Earn:** Receive commissions when referrals become paying customers

## Affiliate Portal Features

- Real-time dashboard showing:
  - Total referrals
  - Active referrals
  - Pending earnings
  - Total earnings
- Performance analytics
- Marketing materials
- Payment history
- Promotional strategies guide

## Technical Implementation

### URL Parameters
- `ref`: Affiliate referral code
- Stored in session on landing page visit
- Applied to signup if user registers within session

### Referral Tracking
- Referral code stored in `referral` table
- Links to `affiliate_accounts` table
- Tracks customer lifetime value for tiered commissions

### Database Tables
- `affiliate_accounts`: Affiliate user data
- `affiliate_referrals`: Referral tracking
- `affiliate_commissions`: Commission calculations and payouts

## Landing Page Messaging

When accessed via affiliate link (`?ref=CODE`):
- Shows "30-day FREE trial" (instead of standard 14-day)
- Shows "No credit card required"
- May display affiliate name if available

## Related Documentation

- [Pricing Guide](../PRICING_GUIDE.md) - Pricing tiers and features
- [Billing System](./BILLING.md) - Stripe integration details
