-- ===========================================================================
-- Axolop CRM V1 - Complete Database Schema Deployment
-- Run this script in your Supabase SQL Editor
-- ===========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ===========================================================================
-- CORE CRM TABLES
-- ===========================================================================

-- Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  website TEXT,
  phone TEXT,
  address JSONB,
  type TEXT NOT NULL DEFAULT 'B2B_COMPANY',
  status TEXT NOT NULL DEFAULT 'NEW',
  value NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  title TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Opportunities/Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'NEW',
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  status TEXT DEFAULT 'OPEN',
  closed_at TIMESTAMP WITH TIME ZONE,
  won_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,
  closed_reason TEXT,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_type TEXT,
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================================================
-- FORMS TABLES
-- ===========================================================================

-- Forms Table
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{
    "branding": true,
    "analytics": true,
    "notifications": true,
    "mode": "standard",
    "theme": "default",
    "create_contact": true
  }'::jsonb,
  is_active BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  total_responses INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_lead_score DECIMAL(10,2) DEFAULT 0.00,
  public_url VARCHAR(500),
  embed_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Form Responses Table
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  lead_score INTEGER DEFAULT 0,
  lead_score_breakdown JSONB DEFAULT '{}'::jsonb,
  is_qualified BOOLEAN DEFAULT false,
  is_disqualified BOOLEAN DEFAULT false,
  disqualification_reason TEXT,
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Form Analytics Table
CREATE TABLE IF NOT EXISTS public.form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER,
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  dropoffs INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_completion_time INTEGER,
  average_lead_score DECIMAL(10,2) DEFAULT 0.00,
  qualified_leads INTEGER DEFAULT 0,
  disqualified_leads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, date, hour)
);

-- Question Analytics Table
CREATE TABLE IF NOT EXISTS public.question_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  question_id VARCHAR(255) NOT NULL,
  views INTEGER DEFAULT 0,
  answers INTEGER DEFAULT 0,
  skips INTEGER DEFAULT 0,
  dropoffs INTEGER DEFAULT 0,
  response_distribution JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, question_id)
);

-- Form Integrations Table
CREATE TABLE IF NOT EXISTS public.form_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  webhook_url VARCHAR(500),
  webhook_method VARCHAR(10) DEFAULT 'POST',
  webhook_headers JSONB DEFAULT '{}'::jsonb,
  notification_email VARCHAR(255),
  email_template TEXT,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  total_triggers INTEGER DEFAULT 0,
  failed_triggers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================================
-- EMAIL MARKETING TABLES
-- ===========================================================================

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  from_name VARCHAR(255),
  from_email VARCHAR(255),
  reply_to VARCHAR(255),
  html_content TEXT,
  plain_text_content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Form Submissions Table (for dashboard)
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  data JSONB DEFAULT '{}'::jsonb,
  converted_to_lead BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- RLS POLICIES
-- ===========================================================================

-- Leads Policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Contacts Policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
CREATE POLICY "Users can view their own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
CREATE POLICY "Users can insert their own contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
CREATE POLICY "Users can update their own contacts" ON public.contacts
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
CREATE POLICY "Users can delete their own contacts" ON public.contacts
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Deals Policies
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
CREATE POLICY "Users can view their own deals" ON public.deals
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own deals" ON public.deals;
CREATE POLICY "Users can insert their own deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
CREATE POLICY "Users can update their own deals" ON public.deals
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;
CREATE POLICY "Users can delete their own deals" ON public.deals
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Forms Policies
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;
CREATE POLICY "Users can view their own forms" ON public.forms
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own forms" ON public.forms;
CREATE POLICY "Users can insert their own forms" ON public.forms
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own forms" ON public.forms;
CREATE POLICY "Users can update their own forms" ON public.forms
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own forms" ON public.forms;
CREATE POLICY "Users can delete their own forms" ON public.forms
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Form Responses - Allow anyone to submit
DROP POLICY IF EXISTS "Anyone can submit form responses" ON public.form_responses;
CREATE POLICY "Anyone can submit form responses" ON public.form_responses
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view form responses" ON public.form_responses;
CREATE POLICY "Users can view form responses" ON public.form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = form_responses.form_id
      AND (forms.user_id = auth.uid() OR forms.user_id IS NULL)
    )
  );

-- Email Campaigns Policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can view their own campaigns" ON public.email_campaigns
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can insert their own campaigns" ON public.email_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.email_campaigns;
CREATE POLICY "Users can update their own campaigns" ON public.email_campaigns
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- ===========================================================================
-- INDEXES FOR PERFORMANCE
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON public.contacts(lead_id);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);

CREATE INDEX IF NOT EXISTS idx_forms_user_id ON public.forms(user_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_form_date ON public.form_analytics(form_id, date);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON public.email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);

-- ===========================================================================
-- DEPLOYMENT COMPLETE
-- ===========================================================================

-- Verify tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'leads', 'contacts', 'deals', 'forms', 'form_responses',
    'form_analytics', 'question_analytics', 'form_integrations',
    'email_campaigns', 'form_submissions'
  );

  RAISE NOTICE '✅ Deployment complete! % tables created/verified', table_count;
END $$;
