-- ============================================
-- AXOLOP CRM: Subscriptions & Billing Schema
-- ============================================
-- This script creates the subscription tracking tables
-- for Stripe integration with 14-day trial support
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SUBSCRIPTIONS TABLE
-- Track Stripe subscriptions per agency
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE UNIQUE,

  -- Stripe identifiers
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  stripe_price_id VARCHAR(100),

  -- Plan details
  tier VARCHAR(20) NOT NULL DEFAULT 'sales',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',

  -- Subscription status
  status VARCHAR(20) NOT NULL DEFAULT 'trialing',

  -- Trial tracking
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  -- Payment method info (for display)
  card_last_four VARCHAR(4),
  card_brand VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_tier_check'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check
    CHECK (tier IN ('sales', 'build', 'scale', 'god_mode'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_billing_cycle_check'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_billing_cycle_check
    CHECK (billing_cycle IN ('monthly', 'yearly'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_agency ON subscriptions(agency_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end);

-- ============================================
-- 2. SUBSCRIPTION EVENTS TABLE
-- Track all subscription events for audit/history
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL,
  stripe_event_id VARCHAR(100),

  -- Event data
  previous_tier VARCHAR(20),
  new_tier VARCHAR(20),
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  amount_cents INTEGER,
  currency VARCHAR(3) DEFAULT 'usd',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for event lookup
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_agency ON subscription_events(agency_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe ON subscription_events(stripe_event_id);

-- ============================================
-- 3. INVOICES TABLE
-- Track payment history
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Stripe identifiers
  stripe_invoice_id VARCHAR(100) UNIQUE,
  stripe_payment_intent_id VARCHAR(100),

  -- Invoice details
  amount_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',

  -- Dates
  invoice_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- PDF URL from Stripe
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,

  -- Line items stored as JSON for historical reference
  line_items JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint for invoice status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_status_check'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
    CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_agency ON invoices(agency_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- 4. PRICING CONFIGURATION TABLE
-- Store pricing tiers (can be updated without code changes)
-- ============================================
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  display_name VARCHAR(50) NOT NULL,
  description TEXT,

  -- Pricing
  monthly_price_cents INTEGER NOT NULL,
  yearly_price_cents INTEGER NOT NULL,
  yearly_monthly_equivalent_cents INTEGER NOT NULL,
  discount_percent INTEGER DEFAULT 0,

  -- Stripe price IDs
  stripe_price_monthly VARCHAR(100),
  stripe_price_yearly VARCHAR(100),

  -- Limits
  max_users INTEGER NOT NULL DEFAULT 3,
  max_agencies INTEGER NOT NULL DEFAULT 1,
  max_leads_per_month INTEGER DEFAULT 500,
  max_emails_per_month INTEGER DEFAULT 1000,
  max_forms INTEGER DEFAULT 3,
  max_workflows INTEGER DEFAULT 2,
  storage_gb INTEGER DEFAULT 5,

  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{}',

  -- Display
  is_popular BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, display_name, description, monthly_price_cents, yearly_price_cents, yearly_monthly_equivalent_cents, discount_percent, max_users, max_agencies, max_leads_per_month, max_emails_per_month, max_forms, max_workflows, storage_gb, is_popular, position, features)
VALUES
  ('sales', 'Sales', 'Perfect for small sales teams getting started', 6700, 64800, 5400, 19, 3, 1, 500, 1000, 3, 2, 5, false, 1, '{
    "dashboard": true,
    "leads": true,
    "contacts": true,
    "opportunities": true,
    "activities": true,
    "calendar": true,
    "meetings": false,
    "forms": false,
    "email_campaigns": false,
    "workflows": false,
    "ai_scoring": false,
    "ai_transcription": false,
    "second_brain": false,
    "mind_maps": false,
    "team_chat": false,
    "white_label": false,
    "api_access": false,
    "custom_integrations": false
  }'::JSONB),
  ('build', 'Build', 'Scale your agency with powerful automation', 18700, 178800, 14900, 20, 5, 1, 2000, 5000, 10, 10, 50, true, 2, '{
    "dashboard": true,
    "leads": true,
    "contacts": true,
    "opportunities": true,
    "activities": true,
    "calendar": true,
    "meetings": true,
    "forms": true,
    "email_campaigns": true,
    "workflows": true,
    "ai_scoring": true,
    "ai_transcription": true,
    "second_brain": true,
    "mind_maps": false,
    "team_chat": false,
    "white_label": false,
    "api_access": false,
    "custom_integrations": false
  }'::JSONB),
  ('scale', 'Scale', 'Unlimited everything for enterprise agencies', 34900, 334800, 27900, 20, 999999, 999999, 999999, 999999, 999999, 999999, 500, false, 3, '{
    "dashboard": true,
    "leads": true,
    "contacts": true,
    "opportunities": true,
    "activities": true,
    "calendar": true,
    "meetings": true,
    "forms": true,
    "email_campaigns": true,
    "workflows": true,
    "ai_scoring": true,
    "ai_transcription": true,
    "second_brain": true,
    "mind_maps": true,
    "team_chat": true,
    "white_label": true,
    "api_access": true,
    "custom_integrations": true
  }'::JSONB)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  yearly_price_cents = EXCLUDED.yearly_price_cents,
  yearly_monthly_equivalent_cents = EXCLUDED.yearly_monthly_equivalent_cents,
  discount_percent = EXCLUDED.discount_percent,
  max_users = EXCLUDED.max_users,
  max_agencies = EXCLUDED.max_agencies,
  max_leads_per_month = EXCLUDED.max_leads_per_month,
  max_emails_per_month = EXCLUDED.max_emails_per_month,
  max_forms = EXCLUDED.max_forms,
  max_workflows = EXCLUDED.max_workflows,
  storage_gb = EXCLUDED.storage_gb,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  position = EXCLUDED.position,
  updated_at = NOW();

-- ============================================
-- 5. RPC FUNCTIONS FOR SUBSCRIPTIONS
-- ============================================

-- Function to create trial subscription
CREATE OR REPLACE FUNCTION create_trial_subscription(
  p_agency_id UUID,
  p_tier VARCHAR DEFAULT 'sales',
  p_billing_cycle VARCHAR DEFAULT 'monthly'
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_trial_end TIMESTAMPTZ;
BEGIN
  -- Calculate 14-day trial end
  v_trial_end := NOW() + INTERVAL '14 days';

  -- Insert subscription
  INSERT INTO subscriptions (
    agency_id, tier, billing_cycle, status, trial_start, trial_end
  ) VALUES (
    p_agency_id, p_tier, p_billing_cycle, 'trialing', NOW(), v_trial_end
  )
  ON CONFLICT (agency_id) DO UPDATE SET
    tier = p_tier,
    billing_cycle = p_billing_cycle,
    status = 'trialing',
    trial_start = NOW(),
    trial_end = v_trial_end,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;

  -- Log event
  INSERT INTO subscription_events (subscription_id, agency_id, event_type, new_tier, new_status)
  VALUES (v_subscription_id, p_agency_id, 'trial_started', p_tier, 'trialing');

  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription details
CREATE OR REPLACE FUNCTION get_subscription_details(p_agency_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  tier VARCHAR,
  billing_cycle VARCHAR,
  status VARCHAR,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  trial_days_remaining INTEGER,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  card_last_four VARCHAR,
  card_brand VARCHAR,
  monthly_price_cents INTEGER,
  yearly_price_cents INTEGER,
  max_users INTEGER,
  max_agencies INTEGER,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.tier,
    s.billing_cycle,
    s.status,
    s.trial_start,
    s.trial_end,
    GREATEST(0, EXTRACT(DAY FROM (s.trial_end - NOW()))::INTEGER),
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.card_last_four,
    s.card_brand,
    pt.monthly_price_cents,
    pt.yearly_price_cents,
    pt.max_users,
    pt.max_agencies,
    pt.features
  FROM subscriptions s
  JOIN pricing_tiers pt ON pt.name = s.tier
  WHERE s.agency_id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if feature is available for tier
CREATE OR REPLACE FUNCTION tier_has_feature(p_tier VARCHAR, p_feature VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_features JSONB;
BEGIN
  SELECT features INTO v_features FROM pricing_tiers WHERE name = p_tier;
  RETURN COALESCE((v_features ->> p_feature)::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check trial status
CREATE OR REPLACE FUNCTION get_trial_status(p_agency_id UUID)
RETURNS TABLE (
  is_trialing BOOLEAN,
  days_remaining INTEGER,
  trial_end TIMESTAMPTZ,
  has_payment_method BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.status = 'trialing',
    GREATEST(0, EXTRACT(DAY FROM (s.trial_end - NOW()))::INTEGER),
    s.trial_end,
    s.card_last_four IS NOT NULL
  FROM subscriptions s
  WHERE s.agency_id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription from Stripe webhook
CREATE OR REPLACE FUNCTION update_subscription_from_stripe(
  p_agency_id UUID,
  p_stripe_customer_id VARCHAR,
  p_stripe_subscription_id VARCHAR,
  p_stripe_price_id VARCHAR,
  p_tier VARCHAR,
  p_billing_cycle VARCHAR,
  p_status VARCHAR,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT false,
  p_card_last_four VARCHAR DEFAULT NULL,
  p_card_brand VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscriptions SET
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    stripe_price_id = p_stripe_price_id,
    tier = p_tier,
    billing_cycle = p_billing_cycle,
    status = p_status,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    card_last_four = COALESCE(p_card_last_four, card_last_four),
    card_brand = COALESCE(p_card_brand, card_brand),
    updated_at = NOW()
  WHERE agency_id = p_agency_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Pricing tiers are readable by all
CREATE POLICY "pricing_tiers_select" ON pricing_tiers
  FOR SELECT TO authenticated USING (true);

-- Subscriptions - only agency owner can see
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT TO authenticated
  USING (
    agency_id IN (
      SELECT a.id FROM agencies a
      WHERE a.owner_id = auth.uid()
    )
    OR
    agency_id IN (
      SELECT agency_id FROM agency_members
      WHERE user_id = auth.uid() AND member_type = 'owner'
    )
  );

-- Subscription events - only agency owner can see
CREATE POLICY "subscription_events_select" ON subscription_events
  FOR SELECT TO authenticated
  USING (
    agency_id IN (
      SELECT a.id FROM agencies a
      WHERE a.owner_id = auth.uid()
    )
  );

-- Invoices - only agency owner can see
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT TO authenticated
  USING (
    agency_id IN (
      SELECT a.id FROM agencies a
      WHERE a.owner_id = auth.uid()
    )
  );

-- ============================================
-- 7. TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS invoices_updated_at ON invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS pricing_tiers_updated_at ON pricing_tiers;
CREATE TRIGGER pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE: Subscriptions schema created
-- ============================================
