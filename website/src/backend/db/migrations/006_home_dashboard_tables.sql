-- ============================================
-- MIGRATION: Home Dashboard Tables
-- Purpose: Ensure all tables needed for Home page functionality exist
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: DASHBOARD PRESETS TABLE
-- ============================================

-- Create dashboard_presets table for saving user layouts
CREATE TABLE IF NOT EXISTS public.dashboard_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,
  base_preset VARCHAR(50) DEFAULT 'default',
  is_custom BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_user_id ON public.dashboard_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_is_default ON public.dashboard_presets(user_id, is_default);

-- Enable Row Level Security
ALTER TABLE public.dashboard_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe idempotent approach)
DROP POLICY IF EXISTS "Users can view own dashboard presets" ON public.dashboard_presets;
DROP POLICY IF EXISTS "Users can create own dashboard presets" ON public.dashboard_presets;
DROP POLICY IF EXISTS "Users can update own dashboard presets" ON public.dashboard_presets;
DROP POLICY IF EXISTS "Users can delete own dashboard presets" ON public.dashboard_presets;

-- Create RLS policies for dashboard_presets
CREATE POLICY "Users can view own dashboard presets"
  ON public.dashboard_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dashboard presets"
  ON public.dashboard_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard presets"
  ON public.dashboard_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dashboard presets"
  ON public.dashboard_presets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 2: DEALS TABLE (for Revenue & Sales metrics)
-- ============================================

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) DEFAULT 0,
  value DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  stage VARCHAR(50),
  contact_id UUID,
  lead_id UUID,
  opportunity_id UUID,
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can create own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON public.deals;

CREATE POLICY "Users can view own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON public.deals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 3: OPPORTUNITIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'open',
  stage VARCHAR(50) DEFAULT 'new',
  probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
  contact_id UUID,
  lead_id UUID,
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can create own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can delete own opportunities" ON public.opportunities;

CREATE POLICY "Users can view own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 4: LEADS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST')),
  source VARCHAR(100),
  score INTEGER DEFAULT 0,
  notes TEXT,
  form_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 5: FORM SUBMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id UUID NOT NULL,
  data JSONB DEFAULT '{}',
  converted_to_lead BOOLEAN DEFAULT false,
  lead_id UUID,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON public.form_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_converted ON public.form_submissions(converted_to_lead);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can create own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can update own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can delete own form submissions" ON public.form_submissions;

CREATE POLICY "Users can view own form submissions"
  ON public.form_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own form submissions"
  ON public.form_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own form submissions"
  ON public.form_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own form submissions"
  ON public.form_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Allow anonymous form submissions (for public forms)
DROP POLICY IF EXISTS "Anyone can submit to public forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit to public forms"
  ON public.form_submissions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PART 6: EMAIL CAMPAIGNS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'active', 'paused', 'completed')),
  sent_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  attributed_revenue DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON public.email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON public.email_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can create own email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update own email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete own email campaigns" ON public.email_campaigns;

CREATE POLICY "Users can view own email campaigns"
  ON public.email_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email campaigns"
  ON public.email_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email campaigns"
  ON public.email_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email campaigns"
  ON public.email_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 7: EXPENSES TABLE (for Profit/Loss widget)
-- ============================================

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  vendor VARCHAR(255),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PART 8: TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create update_updated_at function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
DROP TRIGGER IF EXISTS update_dashboard_presets_updated_at ON public.dashboard_presets;
CREATE TRIGGER update_dashboard_presets_updated_at
  BEFORE UPDATE ON public.dashboard_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deals_updated_at ON public.deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'HOME DASHBOARD MIGRATION COMPLETE!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Tables created/verified:';
  RAISE NOTICE '  - dashboard_presets (for saving layouts)';
  RAISE NOTICE '  - deals (revenue & sales metrics)';
  RAISE NOTICE '  - opportunities (pipeline data)';
  RAISE NOTICE '  - leads (conversion funnel)';
  RAISE NOTICE '  - form_submissions (form metrics)';
  RAISE NOTICE '  - email_campaigns (marketing metrics)';
  RAISE NOTICE '  - expenses (P&L widget)';
  RAISE NOTICE '';
  RAISE NOTICE 'All tables have RLS enabled with user isolation.';
  RAISE NOTICE 'Refresh your app to see the Home page with real data!';
END $$;
