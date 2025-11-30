-- ENSURE AGENCY TABLES EXIST
-- Run this in Supabase SQL Editor if agency creation is failing

-- ========================================
-- 1. AGENCIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON public.agencies(is_active);

-- ========================================
-- 2. AGENCY MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  permissions JSONB DEFAULT '{}'::jsonb,
  invitation_status TEXT DEFAULT 'active',
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agency_members_user ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_agency ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_status ON public.agency_members(invitation_status);

-- ========================================
-- 3. ENABLE RLS BUT ALLOW ALL FOR NOW
-- ========================================
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all agencies access" ON public.agencies;
DROP POLICY IF EXISTS "Allow all agency_members access" ON public.agency_members;

-- Create permissive policies (for development - tighten for production)
CREATE POLICY "Allow all agencies access" ON public.agencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all agency_members access" ON public.agency_members FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 4. GRANT PERMISSIONS
-- ========================================
GRANT ALL ON public.agencies TO authenticated;
GRANT ALL ON public.agencies TO service_role;
GRANT ALL ON public.agency_members TO authenticated;
GRANT ALL ON public.agency_members TO service_role;

-- ========================================
-- VERIFICATION
-- ========================================
SELECT 'agencies table exists' as status, count(*) as count FROM public.agencies;
SELECT 'agency_members table exists' as status, count(*) as count FROM public.agency_members;
