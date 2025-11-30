-- ========================================
-- ENHANCED ONBOARDING & PRICING SCHEMA
-- Extends existing onboarding schema with trial tracking
-- ========================================

-- Add trial tracking fields to existing onboarding_data table
DO $$
BEGIN
  -- Add selected pricing tier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_data'
    AND column_name = 'selected_pricing_tier'
  ) THEN
    ALTER TABLE public.onboarding_data ADD COLUMN selected_pricing_tier TEXT;
  END IF;

  -- Add trial activation status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_data'
    AND column_name = 'trial_activated'
  ) THEN
    ALTER TABLE public.onboarding_data ADD COLUMN trial_activated BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add trial activation timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_data'
    AND column_name = 'trial_activated_at'
  ) THEN
    ALTER TABLE public.onboarding_data ADD COLUMN trial_activated_at TIMESTAMPTZ;
  END IF;

  -- Add recommended plan (calculated from responses)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_data'
    AND column_name = 'recommended_plan'
  ) THEN
    ALTER TABLE public.onboarding_data ADD COLUMN recommended_plan TEXT;
  END IF;

  -- Add onboarding completion source (web, mobile, api)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_data'
    AND column_name = 'completion_source'
  ) THEN
    ALTER TABLE public.onboarding_data ADD COLUMN completion_source TEXT DEFAULT 'web';
  END IF;
END $$;

-- Create pricing_tiers configuration table
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id TEXT UNIQUE NOT NULL, -- 'sales', 'build', 'scale'
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  monthly_price_cents INTEGER NOT NULL,
  yearly_price_cents INTEGER NOT NULL,
  monthly_equivalent_cents INTEGER NOT NULL, -- when billed yearly
  discount_percentage INTEGER DEFAULT 0,
  max_users INTEGER,
  max_agencies INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert pricing tiers data
INSERT INTO public.pricing_tiers (tier_id, name, display_name, monthly_price_cents, yearly_price_cents, monthly_equivalent_cents, discount_percentage, max_users, max_agencies, features, sort_order) VALUES
  ('sales', 'Sales', 'Sales', 6700, 64800, 5400, 19, 3, 1, '[
    {"id": "crm", "name": "Full CRM Features", "description": "Complete customer relationship management"},
    {"id": "leads", "name": "Lead Management", "description": "Unlimited lead tracking and management"},
    {"id": "contacts", "name": "Contact Management", "description": "Organize and manage all contacts"},
    {"id": "opportunities", "name": "Opportunity Pipeline", "description": "Visual sales pipeline tracking"},
    {"id": "calendar", "name": "Calendar & Scheduling", "description": "Integrated calendar and meeting scheduling"},
    {"id": "forms_basic", "name": "Basic Forms", "description": "Up to 5 custom forms"},
    {"id": "email_basic", "name": "Email", "description": "500 emails per month"},
    {"id": "reports_basic", "name": "Basic Reports", "description": "Essential business reports"},
    {"id": "support_email", "name": "Email Support", "description": "Email support during business hours"}
  ]'::jsonb, 1),
  ('build', 'Build', 'Build', 18700, 178800, 14900, 20, 5, 1, '[
    {"id": "crm", "name": "Full CRM Features", "description": "Complete customer relationship management"},
    {"id": "leads", "name": "Lead Management", "description": "Unlimited lead tracking and management"},
    {"id": "contacts", "name": "Contact Management", "description": "Organize and manage all contacts"},
    {"id": "opportunities", "name": "Opportunity Pipeline", "description": "Visual sales pipeline tracking"},
    {"id": "calendar", "name": "Calendar & Scheduling", "description": "Integrated calendar and meeting scheduling"},
    {"id": "forms_unlimited", "name": "Unlimited Forms", "description": "Unlimited custom forms"},
    {"id": "email_marketing", "name": "Email Marketing", "description": "5,000 emails per month"},
    {"id": "workflows_basic", "name": "Basic Workflows", "description": "Essential workflow automation"},
    {"id": "ai_scoring", "name": "AI Lead Scoring", "description": "AI-powered lead scoring"},
    {"id": "reports_advanced", "name": "Advanced Reports", "description": "Detailed analytics and reporting"},
    {"id": "support_priority", "name": "Priority Email Support", "description": "Priority email support"}
  ]'::jsonb, 2),
  ('scale', 'Scale', 'Scale', 34900, 334800, 27900, 20, 999999, 999999, '[
    {"id": "crm", "name": "Full CRM Features", "description": "Complete customer relationship management"},
    {"id": "leads", "name": "Lead Management", "description": "Unlimited lead tracking and management"},
    {"id": "contacts", "name": "Contact Management", "description": "Organize and manage all contacts"},
    {"id": "opportunities", "name": "Opportunity Pipeline", "description": "Visual sales pipeline tracking"},
    {"id": "calendar", "name": "Calendar & Scheduling", "description": "Integrated calendar and meeting scheduling"},
    {"id": "forms_unlimited", "name": "Unlimited Forms", "description": "Unlimited custom forms"},
    {"id": "email_unlimited", "name": "Unlimited Email Marketing", "description": "Unlimited email campaigns"},
    {"id": "workflows_full", "name": "Full Workflows", "description": "Advanced workflow automation"},
    {"id": "ai_full", "name": "Full AI Features", "description": "Complete AI-powered features"},
    {"id": "ai_assistant", "name": "AI Assistant & Transcription", "description": "AI assistant and call transcription"},
    {"id": "reports_custom", "name": "Custom Reports", "description": "Customizable reports and dashboards"},
    {"id": "api_access", "name": "API Access", "description": "Full API access for integrations"},
    {"id": "white_label", "name": "White Label", "description": "Custom branding options"},
    {"id": "support_premium", "name": "Premium Support", "description": "24/7 priority support with onboarding"}
  ]'::jsonb, 3)
ON CONFLICT (tier_id) DO UPDATE SET
  updated_at = NOW();

-- Create feature_gates table for dynamic feature access control
CREATE TABLE IF NOT EXISTS public.feature_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_description TEXT,
  available_in_tiers TEXT[] NOT NULL, -- Array of tier IDs
  is_released BOOLEAN DEFAULT TRUE,
  roadmap_eta TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert feature gates data
INSERT INTO public.feature_gates (feature_id, feature_name, feature_description, available_in_tiers, is_released, sort_order) VALUES
  -- Core CRM Features (Available in all tiers)
  ('leads', 'Lead Management', 'Manage and track leads through your pipeline', ARRAY['sales', 'build', 'scale'], TRUE, 1),
  ('contacts', 'Contact Management', 'Organize and manage all customer contacts', ARRAY['sales', 'build', 'scale'], TRUE, 2),
  ('opportunities', 'Opportunities Pipeline', 'Track deals through your sales pipeline', ARRAY['sales', 'build', 'scale'], TRUE, 3),
  ('calendar', 'Calendar & Scheduling', 'Integrated calendar and meeting scheduling', ARRAY['sales', 'build', 'scale'], TRUE, 4),
  
  -- Marketing & Automation (Build + Scale)
  ('forms_unlimited', 'Unlimited Forms', 'Create unlimited custom forms for lead capture', ARRAY['build', 'scale'], TRUE, 10),
  ('email_marketing', 'Email Marketing', 'Send marketing emails and newsletters', ARRAY['build', 'scale'], TRUE, 11),
  ('workflows_basic', 'Basic Workflows', 'Automate repetitive tasks and processes', ARRAY['build', 'scale'], TRUE, 12),
  ('ai_scoring', 'AI Lead Scoring', 'Automatically score and prioritize leads', ARRAY['build', 'scale'], TRUE, 13),
  
  -- Advanced Features (Scale only)
  ('email_unlimited', 'Unlimited Email Marketing', 'Unlimited email campaigns and sends', ARRAY['scale'], TRUE, 20),
  ('workflows_full', 'Full Workflows', 'Advanced workflow automation with complex logic', ARRAY['scale'], TRUE, 21),
  ('ai_full', 'Full AI Features', 'Complete AI-powered features and insights', ARRAY['scale'], TRUE, 22),
  ('ai_assistant', 'AI Assistant & Transcription', 'AI assistant and call transcription services', ARRAY['scale'], TRUE, 23),
  ('reports_custom', 'Custom Reports', 'Customizable reports and dashboards', ARRAY['scale'], TRUE, 24),
  ('api_access', 'API Access', 'Full API access for custom integrations', ARRAY['scale'], TRUE, 25),
  ('white_label', 'White Label', 'Custom branding and domain options', ARRAY['scale'], TRUE, 26),
  
  -- Future Features (Not yet released)
  ('mobile_app', 'Mobile App', 'Native iOS and Android applications', ARRAY['build', 'scale'], FALSE, 30),
  ('advanced_analytics', 'Advanced Analytics', 'Predictive analytics and business insights', ARRAY['scale'], FALSE, 31)
ON CONFLICT (feature_id) DO UPDATE SET
  updated_at = NOW();

-- Create user_subscriptions table to track active subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  tier_id TEXT NOT NULL REFERENCES public.pricing_tiers(tier_id),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON public.onboarding_data(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_data_trial_activated ON public.onboarding_data(trial_activated);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_tier_id ON public.pricing_tiers(tier_id);
CREATE INDEX IF NOT EXISTS idx_feature_gates_feature_id ON public.feature_gates(feature_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_agency_id ON public.user_subscriptions(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Enable RLS on new tables
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_tiers (public read access)
CREATE POLICY "Public read access to pricing tiers" ON public.pricing_tiers
  FOR SELECT USING (is_active = TRUE);

-- RLS Policies for feature_gates (public read access to released features)
CREATE POLICY "Public read access to released features" ON public.feature_gates
  FOR SELECT USING (is_released = TRUE);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Updated triggers
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_gates_updated_at
  BEFORE UPDATE ON public.feature_gates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's current tier and features
CREATE OR REPLACE FUNCTION public.get_user_tier_info(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_subscription JSONB;
  v_tier_info JSONB;
  v_features JSONB;
BEGIN
  -- Get user's active subscription
  SELECT to_jsonb(subs) INTO v_subscription
  FROM public.user_subscriptions subs
  WHERE subs.user_id = p_user_id
    AND subs.status IN ('trialing', 'active')
  ORDER BY subs.created_at DESC
  LIMIT 1;

  IF v_subscription IS NOT NULL THEN
    -- Get tier information
    SELECT to_jsonb(tiers) INTO v_tier_info
    FROM public.pricing_tiers tiers
    WHERE tiers.tier_id = (v_subscription->>'tier_id');

    -- Get available features for this tier
    SELECT jsonb_agg(
      jsonb_build_object(
        'feature_id', fg.feature_id,
        'feature_name', fg.feature_name,
        'feature_description', fg.feature_description,
        'is_released', fg.is_released,
        'roadmap_eta', fg.roadmap_eta
      )
    ) INTO v_features
    FROM public.feature_gates fg
    WHERE fg.is_released = TRUE
      AND (v_subscription->>'tier_id') = ANY (fg.available_in_tiers);

    RETURN jsonb_build_object(
      'subscription', v_subscription,
      'tier', v_tier_info,
      'features', v_features,
      'has_access', TRUE
    );
  ELSE
    -- No active subscription - return free tier info
    RETURN jsonb_build_object(
      'subscription', NULL,
      'tier', NULL,
      'features', '[]'::jsonb,
      'has_access', FALSE
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_tier_info(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.pricing_tiers IS 'Configuration for pricing tiers and features';
COMMENT ON TABLE public.feature_gates IS 'Feature availability and access control by pricing tier';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription tracking and management';
COMMENT ON FUNCTION public.get_user_tier_info IS 'Get user''s current tier information and available features';