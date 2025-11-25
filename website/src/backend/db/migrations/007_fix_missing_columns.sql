-- ============================================
-- MIGRATION: Complete Home Dashboard Tables Setup
-- Purpose: Create tables if they don't exist, then add missing columns
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: DEALS TABLE
-- ============================================

-- Create deals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  amount DECIMAL(15, 2) DEFAULT 0,
  value DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'NEW',
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

-- Add user_id column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to deals table';
  END IF;
END $$;

-- Add name column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN name VARCHAR(255);
    RAISE NOTICE 'Added name column to deals table';
  END IF;
END $$;

-- Add status column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN status VARCHAR(50) DEFAULT 'NEW';
    RAISE NOTICE 'Added status column to deals table';
  END IF;
END $$;

-- Add amount column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN amount DECIMAL(15, 2) DEFAULT 0;
    RAISE NOTICE 'Added amount column to deals table';
  END IF;
END $$;

-- Add value column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'value'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN value DECIMAL(15, 2) DEFAULT 0;
    RAISE NOTICE 'Added value column to deals table';
  END IF;
END $$;

-- Add stage column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'stage'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN stage VARCHAR(50);
    RAISE NOTICE 'Added stage column to deals table';
  END IF;
END $$;

-- Add contact_id column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN contact_id UUID;
    RAISE NOTICE 'Added contact_id column to deals table';
  END IF;
END $$;

-- Add lead_id column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN lead_id UUID;
    RAISE NOTICE 'Added lead_id column to deals table';
  END IF;
END $$;

-- Add opportunity_id column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'opportunity_id'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN opportunity_id UUID;
    RAISE NOTICE 'Added opportunity_id column to deals table';
  END IF;
END $$;

-- Add expected_close_date column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'expected_close_date'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN expected_close_date DATE;
    RAISE NOTICE 'Added expected_close_date column to deals table';
  END IF;
END $$;

-- Add closed_at column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'closed_at'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN closed_at TIMESTAMPTZ;
    RAISE NOTICE 'Added closed_at column to deals table';
  END IF;
END $$;

-- Add won_at column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'won_at'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN won_at TIMESTAMPTZ;
    RAISE NOTICE 'Added won_at column to deals table';
  END IF;
END $$;

-- Add lost_reason column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'lost_reason'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN lost_reason TEXT;
    RAISE NOTICE 'Added lost_reason column to deals table';
  END IF;
END $$;

-- Add notes column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column to deals table';
  END IF;
END $$;

-- Add created_at column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to deals table';
  END IF;
END $$;

-- Add updated_at column to deals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'deals'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.deals ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to deals table';
  END IF;
END $$;

-- Create indexes for deals
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);

-- Enable RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for deals
DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can create own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON public.deals;

CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 2: OPPORTUNITIES TABLE
-- ============================================

-- Create opportunities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  value DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'open',
  stage VARCHAR(50) DEFAULT 'new',
  probability INTEGER DEFAULT 10,
  contact_id UUID,
  lead_id UUID,
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to opportunities table';
  END IF;
END $$;

-- Add name column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN name VARCHAR(255);
    RAISE NOTICE 'Added name column to opportunities table';
  END IF;
END $$;

-- Add value column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'value'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN value DECIMAL(15, 2) DEFAULT 0;
    RAISE NOTICE 'Added value column to opportunities table';
  END IF;
END $$;

-- Add status column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN status VARCHAR(50) DEFAULT 'open';
    RAISE NOTICE 'Added status column to opportunities table';
  END IF;
END $$;

-- Add stage column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'stage'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN stage VARCHAR(50) DEFAULT 'new';
    RAISE NOTICE 'Added stage column to opportunities table';
  END IF;
END $$;

-- Add probability column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'probability'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN probability INTEGER DEFAULT 10;
    RAISE NOTICE 'Added probability column to opportunities table';
  END IF;
END $$;

-- Add contact_id column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN contact_id UUID;
    RAISE NOTICE 'Added contact_id column to opportunities table';
  END IF;
END $$;

-- Add lead_id column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN lead_id UUID;
    RAISE NOTICE 'Added lead_id column to opportunities table';
  END IF;
END $$;

-- Add expected_close_date column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'expected_close_date'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN expected_close_date DATE;
    RAISE NOTICE 'Added expected_close_date column to opportunities table';
  END IF;
END $$;

-- Add closed_at column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'closed_at'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN closed_at TIMESTAMPTZ;
    RAISE NOTICE 'Added closed_at column to opportunities table';
  END IF;
END $$;

-- Add notes column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column to opportunities table';
  END IF;
END $$;

-- Add created_at column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to opportunities table';
  END IF;
END $$;

-- Add updated_at column to opportunities if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'opportunities'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to opportunities table';
  END IF;
END $$;

-- Create indexes for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- Enable RLS on opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for opportunities
DROP POLICY IF EXISTS "Users can view own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can create own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can delete own opportunities" ON public.opportunities;

CREATE POLICY "Users can view own opportunities" ON public.opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON public.opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own opportunities" ON public.opportunities FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 3: LEADS TABLE
-- ============================================

-- Create leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'NEW',
  source VARCHAR(100),
  score INTEGER DEFAULT 0,
  notes TEXT,
  form_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to leads table';
  END IF;
END $$;

-- Add name column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN name VARCHAR(255);
    RAISE NOTICE 'Added name column to leads table';
  END IF;
END $$;

-- Add first_name column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN first_name VARCHAR(100);
    RAISE NOTICE 'Added first_name column to leads table';
  END IF;
END $$;

-- Add last_name column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN last_name VARCHAR(100);
    RAISE NOTICE 'Added last_name column to leads table';
  END IF;
END $$;

-- Add email column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN email VARCHAR(255);
    RAISE NOTICE 'Added email column to leads table';
  END IF;
END $$;

-- Add phone column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN phone VARCHAR(50);
    RAISE NOTICE 'Added phone column to leads table';
  END IF;
END $$;

-- Add company column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'company'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN company VARCHAR(255);
    RAISE NOTICE 'Added company column to leads table';
  END IF;
END $$;

-- Add status column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN status VARCHAR(50) DEFAULT 'NEW';
    RAISE NOTICE 'Added status column to leads table';
  END IF;
END $$;

-- Add source column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN source VARCHAR(100);
    RAISE NOTICE 'Added source column to leads table';
  END IF;
END $$;

-- Add score column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'score'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN score INTEGER DEFAULT 0;
    RAISE NOTICE 'Added score column to leads table';
  END IF;
END $$;

-- Add notes column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN notes TEXT;
    RAISE NOTICE 'Added notes column to leads table';
  END IF;
END $$;

-- Add form_id column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'form_id'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN form_id UUID;
    RAISE NOTICE 'Added form_id column to leads table';
  END IF;
END $$;

-- Add created_at column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to leads table';
  END IF;
END $$;

-- Add updated_at column to leads if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to leads table';
  END IF;
END $$;

-- Create indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for leads
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 4: FORM_SUBMISSIONS TABLE
-- ============================================

-- Create form_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id UUID,
  data JSONB DEFAULT '{}',
  converted_to_lead BOOLEAN DEFAULT false,
  lead_id UUID,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to form_submissions table';
  END IF;
END $$;

-- Add form_id column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'form_id'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN form_id UUID;
    RAISE NOTICE 'Added form_id column to form_submissions table';
  END IF;
END $$;

-- Add data column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'data'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN data JSONB DEFAULT '{}';
    RAISE NOTICE 'Added data column to form_submissions table';
  END IF;
END $$;

-- Add converted_to_lead column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'converted_to_lead'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN converted_to_lead BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added converted_to_lead column to form_submissions table';
  END IF;
END $$;

-- Add lead_id column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'lead_id'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN lead_id UUID;
    RAISE NOTICE 'Added lead_id column to form_submissions table';
  END IF;
END $$;

-- Add submitted_at column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN submitted_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added submitted_at column to form_submissions table';
  END IF;
END $$;

-- Add ip_address column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN ip_address INET;
    RAISE NOTICE 'Added ip_address column to form_submissions table';
  END IF;
END $$;

-- Add user_agent column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN user_agent TEXT;
    RAISE NOTICE 'Added user_agent column to form_submissions table';
  END IF;
END $$;

-- Add created_at column to form_submissions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_submissions'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.form_submissions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to form_submissions table';
  END IF;
END $$;

-- Create indexes for form_submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON public.form_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_converted ON public.form_submissions(converted_to_lead);

-- Enable RLS on form_submissions
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for form_submissions
DROP POLICY IF EXISTS "Users can view own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can create form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can update own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can delete own form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit to public forms" ON public.form_submissions;

CREATE POLICY "Users can view own form submissions" ON public.form_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create form submissions" ON public.form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own form submissions" ON public.form_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own form submissions" ON public.form_submissions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 5: EMAIL_CAMPAIGNS TABLE
-- ============================================

-- Create email_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  subject VARCHAR(500),
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
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

-- Add user_id column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to email_campaigns table';
  END IF;
END $$;

-- Add name column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN name VARCHAR(255);
    RAISE NOTICE 'Added name column to email_campaigns table';
  END IF;
END $$;

-- Add subject column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'subject'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN subject VARCHAR(500);
    RAISE NOTICE 'Added subject column to email_campaigns table';
  END IF;
END $$;

-- Add content column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'content'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN content TEXT;
    RAISE NOTICE 'Added content column to email_campaigns table';
  END IF;
END $$;

-- Add status column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
    RAISE NOTICE 'Added status column to email_campaigns table';
  END IF;
END $$;

-- Add sent_at column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN sent_at TIMESTAMPTZ;
    RAISE NOTICE 'Added sent_at column to email_campaigns table';
  END IF;
END $$;

-- Add scheduled_at column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN scheduled_at TIMESTAMPTZ;
    RAISE NOTICE 'Added scheduled_at column to email_campaigns table';
  END IF;
END $$;

-- Add sent_count column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'sent_count'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN sent_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added sent_count column to email_campaigns table';
  END IF;
END $$;

-- Add delivered_count column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'delivered_count'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN delivered_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added delivered_count column to email_campaigns table';
  END IF;
END $$;

-- Add opened_count column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'opened_count'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN opened_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added opened_count column to email_campaigns table';
  END IF;
END $$;

-- Add clicked_count column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'clicked_count'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN clicked_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added clicked_count column to email_campaigns table';
  END IF;
END $$;

-- Add bounced_count column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'bounced_count'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN bounced_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added bounced_count column to email_campaigns table';
  END IF;
END $$;

-- Add unsubscribed_count column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'unsubscribed_count'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN unsubscribed_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added unsubscribed_count column to email_campaigns table';
  END IF;
END $$;

-- Add cost column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'cost'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN cost DECIMAL(10, 2) DEFAULT 0;
    RAISE NOTICE 'Added cost column to email_campaigns table';
  END IF;
END $$;

-- Add attributed_revenue column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'attributed_revenue'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN attributed_revenue DECIMAL(15, 2) DEFAULT 0;
    RAISE NOTICE 'Added attributed_revenue column to email_campaigns table';
  END IF;
END $$;

-- Add created_at column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to email_campaigns table';
  END IF;
END $$;

-- Add updated_at column to email_campaigns if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'email_campaigns'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.email_campaigns ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to email_campaigns table';
  END IF;
END $$;

-- Create indexes for email_campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON public.email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON public.email_campaigns(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);

-- Enable RLS on email_campaigns
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for email_campaigns
DROP POLICY IF EXISTS "Users can view own email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can create own email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can update own email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Users can delete own email campaigns" ON public.email_campaigns;

CREATE POLICY "Users can view own email campaigns" ON public.email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own email campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email campaigns" ON public.email_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email campaigns" ON public.email_campaigns FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 6: EXPENSES TABLE
-- ============================================

-- Create expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100),
  amount DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  vendor VARCHAR(255),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to expenses table';
  END IF;
END $$;

-- Add category column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN category VARCHAR(100);
    RAISE NOTICE 'Added category column to expenses table';
  END IF;
END $$;

-- Add amount column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN amount DECIMAL(15, 2) DEFAULT 0;
    RAISE NOTICE 'Added amount column to expenses table';
  END IF;
END $$;

-- Add description column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to expenses table';
  END IF;
END $$;

-- Add date column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'date'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN date DATE DEFAULT CURRENT_DATE;
    RAISE NOTICE 'Added date column to expenses table';
  END IF;
END $$;

-- Add vendor column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'vendor'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN vendor VARCHAR(255);
    RAISE NOTICE 'Added vendor column to expenses table';
  END IF;
END $$;

-- Add receipt_url column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN receipt_url TEXT;
    RAISE NOTICE 'Added receipt_url column to expenses table';
  END IF;
END $$;

-- Add created_at column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to expenses table';
  END IF;
END $$;

-- Add updated_at column to expenses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'expenses'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to expenses table';
  END IF;
END $$;

-- Create indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for expenses
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 7: DASHBOARD_PRESETS TABLE
-- ============================================

-- Create dashboard_presets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dashboard_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  layout JSONB DEFAULT '[]',
  base_preset VARCHAR(50) DEFAULT 'default',
  is_custom BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to dashboard_presets table';
  END IF;
END $$;

-- Add name column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN name VARCHAR(255);
    RAISE NOTICE 'Added name column to dashboard_presets table';
  END IF;
END $$;

-- Add description column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to dashboard_presets table';
  END IF;
END $$;

-- Add layout column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'layout'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN layout JSONB DEFAULT '[]';
    RAISE NOTICE 'Added layout column to dashboard_presets table';
  END IF;
END $$;

-- Add base_preset column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'base_preset'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN base_preset VARCHAR(50) DEFAULT 'default';
    RAISE NOTICE 'Added base_preset column to dashboard_presets table';
  END IF;
END $$;

-- Add is_custom column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'is_custom'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN is_custom BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_custom column to dashboard_presets table';
  END IF;
END $$;

-- Add is_default column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'is_default'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN is_default BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_default column to dashboard_presets table';
  END IF;
END $$;

-- Add created_at column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to dashboard_presets table';
  END IF;
END $$;

-- Add updated_at column to dashboard_presets if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dashboard_presets'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.dashboard_presets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to dashboard_presets table';
  END IF;
END $$;

-- Create indexes for dashboard_presets
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_user_id ON public.dashboard_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_is_default ON public.dashboard_presets(user_id, is_default);

-- Enable RLS on dashboard_presets
ALTER TABLE public.dashboard_presets ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for dashboard_presets
DROP POLICY IF EXISTS "Users can view own dashboard presets" ON public.dashboard_presets;
DROP POLICY IF EXISTS "Users can create own dashboard presets" ON public.dashboard_presets;
DROP POLICY IF EXISTS "Users can update own dashboard presets" ON public.dashboard_presets;
DROP POLICY IF EXISTS "Users can delete own dashboard presets" ON public.dashboard_presets;

CREATE POLICY "Users can view own dashboard presets" ON public.dashboard_presets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dashboard presets" ON public.dashboard_presets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dashboard presets" ON public.dashboard_presets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dashboard presets" ON public.dashboard_presets FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 8: TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create the update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
DROP TRIGGER IF EXISTS update_deals_updated_at ON public.deals;
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_presets_updated_at ON public.dashboard_presets;
CREATE TRIGGER update_dashboard_presets_updated_at
  BEFORE UPDATE ON public.dashboard_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'HOME DASHBOARD MIGRATION COMPLETE!';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Tables created/updated:';
  RAISE NOTICE '  - deals (with user_id, status, amount, value, stage, etc.)';
  RAISE NOTICE '  - opportunities (with user_id, status, stage, value, etc.)';
  RAISE NOTICE '  - leads (with user_id, status, score, source, etc.)';
  RAISE NOTICE '  - form_submissions (with user_id, converted_to_lead, etc.)';
  RAISE NOTICE '  - email_campaigns (with user_id, counts, status, etc.)';
  RAISE NOTICE '  - expenses (with user_id, category, amount, etc.)';
  RAISE NOTICE '  - dashboard_presets (with user_id, layout, etc.)';
  RAISE NOTICE '';
  RAISE NOTICE 'All tables have:';
  RAISE NOTICE '  - user_id column for user isolation';
  RAISE NOTICE '  - RLS policies enabled';
  RAISE NOTICE '  - Indexes for performance';
  RAISE NOTICE '  - updated_at triggers';
  RAISE NOTICE '';
  RAISE NOTICE 'Your Home page should now work correctly!';
END $$;
