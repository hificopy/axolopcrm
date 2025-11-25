-- Create deals/opportunities table for V1
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
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
  owner_id UUID,
  product_type TEXT,
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies for deals
DROP POLICY IF EXISTS "Users can view all deals" ON public.deals;
CREATE POLICY "Users can view all deals" ON public.deals
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert deals" ON public.deals;
CREATE POLICY "Users can insert deals" ON public.deals
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update all deals" ON public.deals;
CREATE POLICY "Users can update all deals" ON public.deals
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete all deals" ON public.deals;
CREATE POLICY "Users can delete all deals" ON public.deals
  FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);

-- Also create the opportunities table as an alias (for backwards compatibility)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'NEW',
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  close_date DATE,
  status TEXT DEFAULT 'OPEN',
  description TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunities
DROP POLICY IF EXISTS "Users can view all opportunities" ON public.opportunities;
CREATE POLICY "Users can view all opportunities" ON public.opportunities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert opportunities" ON public.opportunities;
CREATE POLICY "Users can insert opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update all opportunities" ON public.opportunities;
CREATE POLICY "Users can update all opportunities" ON public.opportunities
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete all opportunities" ON public.opportunities;
CREATE POLICY "Users can delete all opportunities" ON public.opportunities
  FOR DELETE USING (true);

-- Create email_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
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

-- Create form_submissions table for dashboard
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
