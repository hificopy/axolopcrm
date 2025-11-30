# 🚀 Deploy to Supabase - Complete Guide

**Last Updated**: January 23, 2025
**Status**: Ready for Deployment

---

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Open Supabase SQL Editor

```
https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
```

### Step 2: Copy the Complete SQL

```bash
# Copy the complete deployment SQL to clipboard
cat docs/database/sql/complete-deployment.sql | pbcopy
```

### Step 3: Paste and Run

1. Paste the SQL in the Supabase SQL Editor
2. Click "Run" or press `Cmd/Ctrl + Enter`
3. Wait for completion (should take 5-10 seconds)

### Step 4: Verify Deployment

You should see: ✅ **"Success. No rows returned"**

Check that these tables exist in Table Editor:
- ✅ `agencies`
- ✅ `agency_members`
- ✅ `agency_settings`
- ✅ `subscription_plans`

---

## 📋 What Gets Deployed

### Tables Created (4)

1. **agencies** - Stores agency information
   - Subscription tier (sales, build, scale, god_mode)
   - Billing cycle (monthly, yearly)
   - Stripe integration fields
   - User limits and settings
   - White label configuration

2. **agency_members** - Links users to agencies
   - User roles (admin, member, viewer)
   - Granular permissions (20+ permissions)
   - Invitation status tracking

3. **agency_settings** - Additional agency configuration
   - Branding settings
   - Email configuration
   - Notification preferences
   - White label settings (Scale tier)

4. **subscription_plans** - Pricing and features
   - **Sales Tier**: $67/mo or $54/mo yearly
   - **Build Tier**: $187/mo or $149/mo yearly
   - **Scale Tier**: $349/mo or $279/mo yearly
   - **God Mode**: Free (internal use)

### Features Created

- ✅ **Row Level Security (RLS)** - Complete data isolation
- ✅ **Helper Functions** (8 functions)
  - `is_agency_admin()` - Check if user is admin
  - `get_user_agencies()` - Get user's agencies
  - `user_has_permission()` - Check specific permission
  - `create_default_agency_for_user()` - Auto-create agency
  - `can_add_agency_member()` - Check user limits
  - `apply_tier_settings()` - Apply subscription settings
  - `get_subscription_plan()` - Get plan details
- ✅ **Triggers** (4 triggers)
  - Auto-update timestamps
  - Auto-update user counts
  - Auto-create agency settings
- ✅ **Indexes** (10 indexes) - For fast queries
- ✅ **Enum Types** (3 types)
  - `agency_role` - admin, member, viewer
  - `subscription_tier` - sales, build, scale, god_mode
  - `billing_cycle` - monthly, yearly

---

## 💰 Subscription Plans Inserted

The deployment automatically inserts 4 subscription plans:

### Sales Tier - $67/mo
- **Yearly**: $648/year ($54/mo)
- **Users**: Up to 3
- **Agencies**: 1
- **Features**: Basic CRM (leads, contacts, pipeline, calendar)

### Build Tier - $187/mo 🔥
- **Yearly**: $1,788/year ($149/mo)
- **Users**: Up to 5
- **Agencies**: 1
- **Features**: Everything + Forms, Email Campaigns, AI, Workflows

### Scale Tier - $349/mo
- **Yearly**: $3,348/year ($279/mo)
- **Users**: Unlimited
- **Agencies**: Unlimited
- **Features**: Everything + White Label, API, Custom Integrations

### God Mode - FREE
- **For**: axolopcrm@gmail.com only
- **Users**: Unlimited
- **Features**: Everything unlimited

---

## 🧪 Testing After Deployment

### 1. Verify Tables Exist

Go to Supabase Table Editor and check:
- [ ] `agencies` table exists
- [ ] `agency_members` table exists
- [ ] `agency_settings` table exists
- [ ] `subscription_plans` table exists

### 2. Verify Subscription Plans

Run this query in SQL Editor:
```sql
SELECT tier, name, monthly_price_usd, yearly_price_usd, max_users
FROM subscription_plans
ORDER BY monthly_price_usd;
```

Expected result: 4 rows (sales, build, scale, god_mode)

### 3. Test Helper Functions

```sql
-- Test getting subscription plan
SELECT * FROM get_subscription_plan('build');

-- Test creating default agency (replace with your user ID)
SELECT create_default_agency_for_user(
  'YOUR_USER_ID',
  'test@example.com'
);
```

### 4. Verify RLS Policies

```sql
-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('agencies', 'agency_members', 'agency_settings')
ORDER BY tablename, policyname;
```

Expected: 8+ policies

---

## 🔧 If Deployment Fails

### Error: "relation already exists"

**Cause**: Tables already exist from previous deployment

**Solution 1**: Drop and recreate (CAUTION: Deletes all data)
```sql
DROP TABLE IF EXISTS agency_members CASCADE;
DROP TABLE IF EXISTS agency_settings CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Then run the complete-deployment.sql again
```

**Solution 2**: Skip to just inserting subscription plans
```sql
-- Just update subscription plans
INSERT INTO subscription_plans (...)
VALUES (...)
ON CONFLICT (tier) DO UPDATE SET ...;
```

### Error: "permission denied"

**Cause**: Using anon key instead of service role

**Solution**: Make sure you're in Supabase SQL Editor (uses service role automatically)

### Error: "function does not exist"

**Cause**: Helper functions not created

**Solution**: Re-run the complete SQL deployment

---

## 📊 Database Schema Overview

### agencies Table

```sql
id                    UUID PRIMARY KEY
name                  VARCHAR(255)
slug                  VARCHAR(255) UNIQUE
logo_url              TEXT
subscription_tier     subscription_tier (sales|build|scale|god_mode)
billing_cycle         billing_cycle (monthly|yearly)
subscription_status   VARCHAR(50) (trial|active|past_due|canceled)
stripe_customer_id    VARCHAR(255)
max_users             INTEGER (3, 5, or unlimited)
white_label_enabled   BOOLEAN
settings              JSONB (enabled sections & features)
created_at            TIMESTAMP
```

### agency_members Table

```sql
id                 UUID PRIMARY KEY
agency_id          UUID (FK to agencies)
user_id            UUID (FK to auth.users)
role               agency_role (admin|member|viewer)
permissions        JSONB (20+ granular permissions)
invitation_status  VARCHAR(50) (pending|active|suspended)
```

### subscription_plans Table

```sql
tier                     subscription_tier PRIMARY KEY
name                     VARCHAR(100)
monthly_price_usd        DECIMAL(10,2)
yearly_price_usd         DECIMAL(10,2)
yearly_discount_percent  INTEGER
max_users                INTEGER
features                 JSONB
```

---

## 🎯 Next Steps After Deployment

### 1. Start Your Application

```bash
npm run dev
```

### 2. Test Agency Creation

1. Sign in with any user
2. Check sidebar - you'll see "Agencies" section
3. Click + button to create new agency
4. Agency will default to "Sales" tier with 14-day trial

### 3. Test Subscription Tiers

```sql
-- Update your agency to Build tier
UPDATE agencies
SET subscription_tier = 'build',
    subscription_status = 'active'
WHERE slug = 'your-agency-slug';
```

### 4. Test God Mode

1. Sign in as `axolopcrm@gmail.com`
2. Create agency - will be "god_mode" tier
3. Should have unlimited access

---

## 📚 Documentation

**Complete Guide**: `docs/implementation/AGENCY_SYSTEM_IMPLEMENTATION.md`
**Quick Start**: `docs/implementation/AGENCY_QUICK_START.md`
**Pricing Guide**: `docs/PRICING_GUIDE.md`
**This File**: `DEPLOY_TO_SUPABASE.md`

---

## ✅ Deployment Checklist

Before deployment:
- [ ] Backup created: `backups/backup-20251123-164350-agency-system-implementation/`
- [ ] Supabase project URL correct: `fuclpfhitgwugxogxkmw`
- [ ] SQL file ready: `docs/database/sql/complete-deployment.sql`

Deploy:
- [ ] Open Supabase SQL Editor
- [ ] Copy SQL from file
- [ ] Paste in editor
- [ ] Run SQL (Cmd+Enter)
- [ ] Verify success message

After deployment:
- [ ] Check tables exist in Table Editor
- [ ] Verify subscription_plans has 4 rows
- [ ] Test helper functions
- [ ] Verify RLS policies exist
- [ ] Start application (`npm run dev`)
- [ ] Test agency creation
- [ ] Test agency switching
- [ ] Test god mode (axolopcrm@gmail.com)

---

## 🎉 You're Ready!

Once deployed:
1. ✅ All agency tables created
2. ✅ Subscription plans inserted
3. ✅ RLS policies enabled
4. ✅ Helper functions available
5. ✅ Ready to create agencies

**Time to deploy**: ~5 minutes
**Time to test**: ~10 minutes
**Total time**: 15 minutes to full agency system!

---

**Questions?** Check the documentation or contact support.

**Deploy Now**: Copy `docs/database/sql/complete-deployment.sql` to Supabase! 🚀
