-- ========================================
-- AXOLOP CRM - COMPLETE DATABASE DEPLOYMENT
-- ========================================
-- This file contains ALL database changes needed for the agency system
-- Run this ONCE in Supabase SQL Editor
-- ========================================

-- ========================================
-- STEP 1: CREATE ENUM TYPES
-- ========================================

-- Agency roles
DO $$ BEGIN
  CREATE TYPE agency_role AS ENUM ('admin', 'member', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Subscription tiers with new pricing structure
DO $$ BEGIN
  DROP TYPE IF EXISTS subscription_tier CASCADE;
  CREATE TYPE subscription_tier AS ENUM ('sales', 'build', 'scale', 'god_mode');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Billing cycles
DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- STEP 2: CREATE AGENCIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,

  -- Subscription info
  subscription_tier subscription_tier DEFAULT 'sales',
  billing_cycle billing_cycle DEFAULT 'monthly',
  subscription_status VARCHAR(50) DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled'
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '14 days'),

  -- Stripe integration
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),

  -- Limits based on subscription
  max_users INTEGER DEFAULT 3,
  max_agencies INTEGER DEFAULT 1, -- Only for Scale tier
  current_users_count INTEGER DEFAULT 1,

  -- White label settings (Scale tier only)
  white_label_enabled BOOLEAN DEFAULT false,
  custom_domain TEXT,
  custom_branding JSONB DEFAULT '{}'::jsonb,

  -- Settings with tier-based features
  settings JSONB DEFAULT '{
    "sections_enabled": {
      "dashboard": true,
      "leads": true,
      "contacts": true,
      "opportunities": true,
      "activities": true,
      "meetings": true,
      "forms": false,
      "email_campaigns": false,
      "workflows": false,
      "calendar": true,
      "second_brain": false,
      "mind_maps": false,
      "team_chat": false
    },
    "features_enabled": {
      "ai_scoring": false,
      "ai_transcription": false,
      "email_integration": true,
      "calendar_integration": true,
      "advanced_reporting": false,
      "api_access": false,
      "white_label": false,
      "custom_integrations": false
    },
    "limits": {
      "leads_per_month": 100,
      "emails_per_month": 500,
      "forms": 3,
      "workflows": 2,
      "team_members": 3
    }
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- ========================================
-- STEP 3: CREATE AGENCY MEMBERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role agency_role DEFAULT 'member',
  permissions JSONB DEFAULT '{
    "can_view_dashboard": true,
    "can_view_leads": true,
    "can_edit_leads": true,
    "can_delete_leads": false,
    "can_view_contacts": true,
    "can_edit_contacts": true,
    "can_delete_contacts": false,
    "can_view_opportunities": true,
    "can_edit_opportunities": true,
    "can_view_activities": true,
    "can_view_meetings": true,
    "can_manage_meetings": false,
    "can_view_forms": true,
    "can_manage_forms": false,
    "can_view_campaigns": true,
    "can_manage_campaigns": false,
    "can_view_workflows": true,
    "can_manage_workflows": false,
    "can_view_calendar": true,
    "can_view_reports": true,
    "can_manage_team": false,
    "can_manage_billing": false,
    "can_manage_agency_settings": false,
    "can_access_api": false,
    "can_manage_white_label": false
  }'::jsonb,

  -- Status
  invitation_status VARCHAR(50) DEFAULT 'active', -- 'pending', 'active', 'suspended'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure unique user per agency
  UNIQUE(agency_id, user_id)
);

-- ========================================
-- STEP 4: CREATE AGENCY SETTINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE UNIQUE,

  -- Branding (enhanced for white label)
  brand_color VARCHAR(7) DEFAULT '#ffed00', -- Axolop yellow
  brand_secondary_color VARCHAR(7) DEFAULT '#1a1d24',
  custom_domain TEXT,
  custom_logo_url TEXT,
  custom_favicon_url TEXT,
  company_name TEXT,

  -- Email settings
  email_signature TEXT,
  default_email_from_name VARCHAR(255),
  default_email_reply_to VARCHAR(255),
  smtp_settings JSONB DEFAULT '{}'::jsonb,

  -- Notification preferences
  notifications JSONB DEFAULT '{
    "email_on_new_lead": true,
    "email_on_form_submission": true,
    "email_on_meeting_scheduled": true,
    "slack_notifications": false,
    "slack_webhook_url": null
  }'::jsonb,

  -- Integration settings
  integrations JSONB DEFAULT '{}'::jsonb,

  -- White label settings (Scale tier)
  white_label_settings JSONB DEFAULT '{
    "hide_axolop_branding": false,
    "custom_login_page": false,
    "custom_email_templates": false,
    "custom_app_name": "Axolop CRM"
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- STEP 5: CREATE SUBSCRIPTION PLANS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,

  -- Pricing
  monthly_price_usd DECIMAL(10,2) NOT NULL,
  yearly_price_usd DECIMAL(10,2) NOT NULL,
  yearly_discount_percent INTEGER DEFAULT 20,

  -- Stripe IDs
  stripe_monthly_price_id VARCHAR(255),
  stripe_yearly_price_id VARCHAR(255),
  stripe_product_id VARCHAR(255),

  -- Limits
  max_users INTEGER NOT NULL,
  max_agencies INTEGER DEFAULT 1,
  max_leads_per_month INTEGER,
  max_emails_per_month INTEGER,
  max_forms INTEGER,
  max_workflows INTEGER,
  storage_gb INTEGER,

  -- Features
  features JSONB NOT NULL,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert subscription plans
INSERT INTO subscription_plans (tier, name, monthly_price_usd, yearly_price_usd, yearly_discount_percent, max_users, max_agencies, max_leads_per_month, max_emails_per_month, max_forms, max_workflows, storage_gb, features)
VALUES
  (
    'sales',
    'Sales Tier',
    67.00,
    648.00, -- $54/mo yearly
    19, -- Actual discount is 19.4%
    3,
    1,
    500,
    1000,
    3,
    2,
    5,
    '{
      "sections": ["dashboard", "leads", "contacts", "opportunities", "activities", "calendar"],
      "ai_scoring": false,
      "ai_transcription": false,
      "email_campaigns": false,
      "forms": false,
      "workflows": false,
      "advanced_reporting": false,
      "api_access": false,
      "white_label": false,
      "priority_support": false,
      "custom_integrations": false
    }'::jsonb
  ),
  (
    'build',
    'Build Tier',
    187.00,
    1788.00, -- $149/mo yearly
    20,
    5,
    1,
    2000,
    5000,
    10,
    10,
    50,
    '{
      "sections": ["dashboard", "leads", "contacts", "opportunities", "activities", "meetings", "forms", "email_campaigns", "workflows", "calendar", "second_brain"],
      "ai_scoring": true,
      "ai_transcription": true,
      "email_campaigns": true,
      "forms": true,
      "workflows": true,
      "advanced_reporting": true,
      "api_access": false,
      "white_label": false,
      "priority_support": true,
      "custom_integrations": false
    }'::jsonb
  ),
  (
    'scale',
    'Scale Tier',
    349.00,
    3348.00, -- $279/mo yearly
    20,
    999, -- Unlimited users
    999, -- Unlimited agencies
    999999, -- Unlimited leads
    999999, -- Unlimited emails
    999, -- Unlimited forms
    999, -- Unlimited workflows
    500,
    '{
      "sections": ["dashboard", "leads", "contacts", "opportunities", "activities", "meetings", "forms", "email_campaigns", "workflows", "calendar", "second_brain", "mind_maps", "team_chat"],
      "ai_scoring": true,
      "ai_transcription": true,
      "email_campaigns": true,
      "forms": true,
      "workflows": true,
      "advanced_reporting": true,
      "api_access": true,
      "white_label": true,
      "priority_support": true,
      "custom_integrations": true,
      "unlimited_everything": true
    }'::jsonb
  ),
  (
    'god_mode',
    'God Mode',
    0.00,
    0.00,
    0,
    999999,
    999999,
    999999,
    999999,
    999999,
    999999,
    999999,
    '{
      "sections": ["all"],
      "everything_unlimited": true,
      "axolop_internal_only": true
    }'::jsonb
  )
ON CONFLICT (tier) DO UPDATE SET
  monthly_price_usd = EXCLUDED.monthly_price_usd,
  yearly_price_usd = EXCLUDED.yearly_price_usd,
  max_users = EXCLUDED.max_users,
  max_agencies = EXCLUDED.max_agencies,
  features = EXCLUDED.features;

-- ========================================
-- STEP 6: CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_subscription ON agencies(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_agencies_active ON agencies(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agencies_stripe_customer ON agencies(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_agency_members_agency ON agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user ON agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_role ON agency_members(role);
CREATE INDEX IF NOT EXISTS idx_agency_members_status ON agency_members(invitation_status);

CREATE INDEX IF NOT EXISTS idx_agency_settings_agency ON agency_settings(agency_id);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;

-- ========================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS agencies_select_policy ON agencies;
DROP POLICY IF EXISTS agencies_update_policy ON agencies;
DROP POLICY IF EXISTS agency_members_select_policy ON agency_members;
DROP POLICY IF EXISTS agency_members_insert_policy ON agency_members;
DROP POLICY IF EXISTS agency_members_update_policy ON agency_members;
DROP POLICY IF EXISTS agency_members_delete_policy ON agency_members;
DROP POLICY IF EXISTS agency_settings_select_policy ON agency_settings;
DROP POLICY IF EXISTS agency_settings_update_policy ON agency_settings;
DROP POLICY IF EXISTS subscription_plans_select_policy ON subscription_plans;

-- Agencies: Users can only see agencies they're members of
CREATE POLICY agencies_select_policy ON agencies
  FOR SELECT
  USING (
    id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND invitation_status = 'active'
    )
  );

-- Agencies: Only admins can update
CREATE POLICY agencies_update_policy ON agencies
  FOR UPDATE
  USING (
    id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND invitation_status = 'active'
    )
  );

-- Agency Members: Users can see members of their agencies
CREATE POLICY agency_members_select_policy ON agency_members
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND invitation_status = 'active'
    )
  );

-- Agency Members: Only admins can manage members
CREATE POLICY agency_members_insert_policy ON agency_members
  FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND invitation_status = 'active'
    )
  );

CREATE POLICY agency_members_update_policy ON agency_members
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND invitation_status = 'active'
    )
  );

CREATE POLICY agency_members_delete_policy ON agency_members
  FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND invitation_status = 'active'
    )
  );

-- Agency Settings: Users can view settings of their agencies
CREATE POLICY agency_settings_select_policy ON agency_settings
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND invitation_status = 'active'
    )
  );

-- Agency Settings: Only admins can update settings
CREATE POLICY agency_settings_update_policy ON agency_settings
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND invitation_status = 'active'
    )
  );

-- Subscription Plans: Everyone can view active plans
CREATE POLICY subscription_plans_select_policy ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- ========================================
-- STEP 8: CREATE TRIGGERS
-- ========================================

-- Update updated_at timestamp on agencies
CREATE OR REPLACE FUNCTION update_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agencies_updated_at_trigger ON agencies;
CREATE TRIGGER agencies_updated_at_trigger
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_agencies_updated_at();

-- Update updated_at timestamp on agency_members
CREATE OR REPLACE FUNCTION update_agency_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agency_members_updated_at_trigger ON agency_members;
CREATE TRIGGER agency_members_updated_at_trigger
  BEFORE UPDATE ON agency_members
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_members_updated_at();

-- Update updated_at timestamp on agency_settings
CREATE OR REPLACE FUNCTION update_agency_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agency_settings_updated_at_trigger ON agency_settings;
CREATE TRIGGER agency_settings_updated_at_trigger
  BEFORE UPDATE ON agency_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_settings_updated_at();

-- Update current_users_count on agencies
CREATE OR REPLACE FUNCTION update_agency_users_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE agencies
    SET current_users_count = (
      SELECT COUNT(*)
      FROM agency_members
      WHERE agency_id = NEW.agency_id
      AND invitation_status = 'active'
    )
    WHERE id = NEW.agency_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE agencies
    SET current_users_count = (
      SELECT COUNT(*)
      FROM agency_members
      WHERE agency_id = OLD.agency_id
      AND invitation_status = 'active'
    )
    WHERE id = OLD.agency_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.invitation_status != OLD.invitation_status THEN
    UPDATE agencies
    SET current_users_count = (
      SELECT COUNT(*)
      FROM agency_members
      WHERE agency_id = NEW.agency_id
      AND invitation_status = 'active'
    )
    WHERE id = NEW.agency_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agency_users_count_trigger ON agency_members;
CREATE TRIGGER agency_users_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agency_members
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_users_count();

-- Create agency_settings entry when agency is created
CREATE OR REPLACE FUNCTION create_agency_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agency_settings (agency_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_agency_settings_trigger ON agencies;
CREATE TRIGGER create_agency_settings_trigger
  AFTER INSERT ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION create_agency_settings();

-- ========================================
-- STEP 9: HELPER FUNCTIONS
-- ========================================

-- Check if user is admin of agency
CREATE OR REPLACE FUNCTION is_agency_admin(p_user_id UUID, p_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM agency_members
    WHERE user_id = p_user_id
    AND agency_id = p_agency_id
    AND role = 'admin'
    AND invitation_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_agency_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
  v_role agency_role;
BEGIN
  SELECT permissions, role INTO v_permissions, v_role
  FROM agency_members
  WHERE user_id = p_user_id
  AND agency_id = p_agency_id
  AND invitation_status = 'active';

  -- Admins have all permissions
  IF v_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  IF v_permissions IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN COALESCE((v_permissions->>p_permission)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's agencies with their role
CREATE OR REPLACE FUNCTION get_user_agencies(p_user_id UUID)
RETURNS TABLE (
  agency_id UUID,
  agency_name VARCHAR,
  agency_slug VARCHAR,
  agency_logo_url TEXT,
  user_role agency_role,
  subscription_tier subscription_tier,
  subscription_status VARCHAR,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.slug,
    a.logo_url,
    am.role,
    a.subscription_tier,
    a.subscription_status,
    a.is_active
  FROM agencies a
  INNER JOIN agency_members am ON a.id = am.agency_id
  WHERE am.user_id = p_user_id
  AND am.invitation_status = 'active'
  AND a.is_active = true
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get subscription plan details
CREATE OR REPLACE FUNCTION get_subscription_plan(p_tier subscription_tier)
RETURNS TABLE (
  tier subscription_tier,
  name VARCHAR,
  monthly_price_usd DECIMAL,
  yearly_price_usd DECIMAL,
  yearly_discount_percent INTEGER,
  max_users INTEGER,
  max_agencies INTEGER,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.tier,
    sp.name,
    sp.monthly_price_usd,
    sp.yearly_price_usd,
    sp.yearly_discount_percent,
    sp.max_users,
    sp.max_agencies,
    sp.features
  FROM subscription_plans sp
  WHERE sp.tier = p_tier
  AND sp.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default agency for new user
CREATE OR REPLACE FUNCTION create_default_agency_for_user(
  p_user_id UUID,
  p_user_email TEXT
)
RETURNS UUID AS $$
DECLARE
  v_agency_id UUID;
  v_slug VARCHAR;
  v_tier subscription_tier;
BEGIN
  -- Check if user is god mode
  IF p_user_email = 'axolopcrm@gmail.com' THEN
    v_tier := 'god_mode';
  ELSE
    v_tier := 'sales'; -- Default to Sales tier (trial)
  END IF;

  -- Generate unique slug from email
  v_slug := LOWER(REPLACE(SPLIT_PART(p_user_email, '@', 1), '.', '-')) || '-' || SUBSTRING(MD5(p_user_email::TEXT) FROM 1 FOR 6);

  -- Create agency
  INSERT INTO agencies (name, slug, subscription_tier, subscription_status)
  VALUES (
    SPLIT_PART(p_user_email, '@', 1) || '''s Agency',
    v_slug,
    v_tier,
    CASE WHEN v_tier = 'god_mode' THEN 'active' ELSE 'trial' END
  )
  RETURNING id INTO v_agency_id;

  -- Add user as admin
  INSERT INTO agency_members (agency_id, user_id, role, invitation_status)
  VALUES (v_agency_id, p_user_id, 'admin', 'active');

  RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if agency can add more users
CREATE OR REPLACE FUNCTION can_add_agency_member(p_agency_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_max_users INTEGER;
  v_tier subscription_tier;
BEGIN
  SELECT current_users_count, max_users, subscription_tier
  INTO v_current_count, v_max_users, v_tier
  FROM agencies
  WHERE id = p_agency_id;

  -- God mode and Scale tier have unlimited users
  IF v_tier IN ('god_mode', 'scale') THEN
    RETURN TRUE;
  END IF;

  RETURN v_current_count < v_max_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply tier settings to agency
CREATE OR REPLACE FUNCTION apply_tier_settings(p_agency_id UUID, p_tier subscription_tier)
RETURNS VOID AS $$
DECLARE
  v_plan RECORD;
BEGIN
  -- Get plan details
  SELECT * INTO v_plan
  FROM subscription_plans
  WHERE tier = p_tier
  AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription plan not found for tier: %', p_tier;
  END IF;

  -- Update agency with tier settings
  UPDATE agencies
  SET
    subscription_tier = p_tier,
    max_users = v_plan.max_users,
    max_agencies = v_plan.max_agencies,
    settings = jsonb_set(
      settings,
      '{limits}',
      jsonb_build_object(
        'leads_per_month', v_plan.max_leads_per_month,
        'emails_per_month', v_plan.max_emails_per_month,
        'forms', v_plan.max_forms,
        'workflows', v_plan.max_workflows,
        'storage_gb', v_plan.storage_gb
      )
    ),
    white_label_enabled = (v_plan.features->>'white_label')::BOOLEAN
  WHERE id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 10: COMMENTS
-- ========================================

COMMENT ON TABLE agencies IS 'Stores agency information for multi-tenant setup with subscription tiers';
COMMENT ON TABLE agency_members IS 'Links users to agencies with roles and permissions';
COMMENT ON TABLE agency_settings IS 'Stores agency-specific configuration and preferences including white label';
COMMENT ON TABLE subscription_plans IS 'Defines subscription tiers: Sales ($67/mo), Build ($187/mo), Scale ($349/mo)';

COMMENT ON COLUMN agencies.subscription_tier IS 'Sales, Build, Scale, or God Mode tier';
COMMENT ON COLUMN agencies.billing_cycle IS 'Monthly or yearly billing';
COMMENT ON COLUMN agencies.trial_ends_at IS 'When the 14-day trial ends';
COMMENT ON COLUMN agencies.max_users IS 'Maximum users allowed: Sales/Build(3-5), Scale(unlimited)';
COMMENT ON COLUMN agencies.white_label_enabled IS 'Scale tier feature for custom branding';

-- ========================================
-- DEPLOYMENT COMPLETE!
-- ========================================
--
-- ✅ Created 4 tables: agencies, agency_members, agency_settings, subscription_plans
-- ✅ Created RLS policies for data isolation
-- ✅ Created helper functions for permission checking
-- ✅ Created triggers for auto-updates
-- ✅ Inserted subscription plans with pricing
--
-- Next steps:
-- 1. Verify tables exist in Supabase Table Editor
-- 2. Start your application: npm run dev
-- 3. Test agency creation and member management
--
-- ========================================
