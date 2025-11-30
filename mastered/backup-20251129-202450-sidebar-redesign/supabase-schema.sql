-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper functions for Supabase
-- ========================================

-- Function to increment a column value
CREATE OR REPLACE FUNCTION increment_column(table_name TEXT, column_name TEXT, row_id UUID)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = %L', table_name, column_name, column_name, row_id);
END;
$$ LANGUAGE plpgsql;

-- 1. AUTH USERS TABLE (for authentication)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Table for Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  website TEXT,
  phone TEXT,
  address JSONB, -- For company address or B2C customer address
  type TEXT NOT NULL DEFAULT 'B2B_COMPANY', -- 'B2B_COMPANY' or 'B2C_CUSTOMER'
  status TEXT NOT NULL DEFAULT 'NEW', -- e.g., 'NEW', 'QUALIFIED', 'CONTACTED', 'DISQUALIFIED'
  value NUMERIC DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Lead owner
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy for leads: authenticated users can view their own leads
CREATE POLICY "Authenticated users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for leads: authenticated users can insert their own leads
CREATE POLICY "Authenticated users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for leads: authenticated users can update their own leads
CREATE POLICY "Authenticated users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for leads: authenticated users can delete their own leads
CREATE POLICY "Authenticated users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Table for Contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  title TEXT, -- Job title
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL, -- Associated company lead
  is_primary_contact BOOLEAN DEFAULT FALSE,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy for contacts: authenticated users can view their own contacts
CREATE POLICY "Authenticated users can view their own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for contacts: authenticated users can insert their own contacts
CREATE POLICY "Authenticated users can insert their own contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for contacts: authenticated users can update their own contacts
CREATE POLICY "Authenticated users can update their own contacts" ON public.contacts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for contacts: authenticated users can delete their own contacts" ON public.contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Table for Opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'PROSPECTING', -- e.g., 'PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST'
  amount NUMERIC DEFAULT 0,
  close_date DATE,
  description TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for opportunities table
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Policy for opportunities: authenticated users can view their own opportunities
CREATE POLICY "Authenticated users can view their own opportunities" ON public.opportunities
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for opportunities: authenticated users can insert their own opportunities
CREATE POLICY "Authenticated users can insert their own opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for opportunities: authenticated users can update their own opportunities
CREATE POLICY "Authenticated users can update their own opportunities" ON public.opportunities
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for opportunities: authenticated users can delete their own opportunities
CREATE POLICY "Authenticated users can delete their own opportunities" ON public.opportunities
  FOR DELETE USING (auth.uid() = user_id);

-- Table for Lead Import Presets
CREATE TABLE public.lead_import_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preset_name TEXT NOT NULL,
  source TEXT NOT NULL, -- e.g., 'apollo', 'hunter.io', 'evaboot', 'custom'
  mapping JSONB NOT NULL, -- Stores column mapping, e.g., {"csv_header": "db_field"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, preset_name) -- Ensure unique preset names per user
);

-- Enable Row Level Security for lead_import_presets table
ALTER TABLE public.lead_import_presets ENABLE ROW LEVEL SECURITY;

-- Policy for lead_import_presets: authenticated users can view their own lead import presets
CREATE POLICY "Authenticated users can view their own lead import presets" ON public.lead_import_presets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for lead_import_presets: authenticated users can insert their own lead import presets
CREATE POLICY "Authenticated users can insert their own lead import presets" ON public.lead_import_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for lead_import_presets: authenticated users can update their own lead import presets
CREATE POLICY "Authenticated users can update their own lead import presets" ON public.lead_import_presets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for lead_import_presets: authenticated users can delete their own lead import presets
CREATE POLICY "Authenticated users can delete their own lead import presets" ON public.lead_import_presets
  FOR DELETE USING (auth.uid() = user_id);

-- Table for Emails (Inbox)
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  labels TEXT[] DEFAULT ARRAY['inbox'], -- e.g., ['inbox', 'starred', 'archive']
  potential JSONB, -- Stores identified potential lead/contact info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their own emails" ON public.emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own emails" ON public.emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own emails" ON public.emails
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own emails" ON public.emails
  FOR DELETE USING (auth.uid() = user_id);

-- Table for Email Identification Keywords
CREATE TABLE public.identification_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional, for shared/global keywords if NULL
  keyword TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Lead' or 'Contact'
  industry TEXT, -- e.g., 'Real Estate', 'E-commerce', 'B2B Business', 'General'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (keyword, type, industry, user_id) -- Ensure unique keywords per type, industry and user
);

ALTER TABLE public.identification_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their own identification keywords" ON public.identification_keywords
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can manage their own identification keywords" ON public.identification_keywords
  FOR ALL USING (auth.uid() = user_id);

-- Table for Gmail API Tokens
CREATE TABLE public.gmail_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT, -- Refresh token might not always be provided or needed for short-lived access
  scope TEXT,
  token_type TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id) -- Each user should only have one set of Gmail tokens
);

ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage their own gmail tokens" ON public.gmail_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Include forms schema
\i backend/db/forms-schema.sql
