-- ========================================
-- AGENCY SYSTEM SCHEMA
-- Complete schema for multi-agency CRM
-- ========================================

-- ========================================
-- 1. AGENCIES TABLE
-- Core table for agency management
-- ========================================
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,

  -- Subscription & Billing
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'sales', 'build', 'scale', 'god_mode')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trial')),
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,

  -- Settings
  settings JSONB DEFAULT '{
    "sections_enabled": {
      "leads": true,
      "contacts": true,
      "opportunities": true,
      "calendar": true,
      "email": true,
      "forms": true,
      "workflows": true
    },
    "features_enabled": {
      "ai_features": false,
      "advanced_reporting": false,
      "custom_fields": true
    }
  }'::jsonb,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_subscription_tier ON public.agencies(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON public.agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies(created_at DESC);

-- ========================================
-- 2. AGENCY MEMBERS TABLE
-- User-to-agency relationships with roles
-- ========================================
CREATE TABLE IF NOT EXISTS public.agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Role & Permissions
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,

  -- Invitation Management
  invitation_status TEXT DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'suspended', 'removed')),
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agency_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agency_members_agency_id ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_role ON public.agency_members(role);
CREATE INDEX IF NOT EXISTS idx_agency_members_invitation_status ON public.agency_members(invitation_status);

-- ========================================
-- 3. USER AGENCY PREFERENCES TABLE
-- Store which agency is currently selected for each user
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_agency_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_agency_preferences_user_id ON public.user_agency_preferences(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================
-- NOTE: These policies are designed to AVOID infinite recursion.
-- The agency_members table policies must NOT query agency_members itself!

-- Enable RLS on agency tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agency_preferences ENABLE ROW LEVEL SECURITY;

-- ========================================
-- AGENCIES POLICIES
-- ========================================

-- Allow authenticated users to view all active agencies
-- (Fine-grained filtering done in application layer)
CREATE POLICY "agencies_read_all"
  ON public.agencies FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow authenticated users to create agencies
CREATE POLICY "agencies_insert_own"
  ON public.agencies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow updates (controlled by backend)
CREATE POLICY "agencies_update"
  ON public.agencies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow deletes (controlled by backend)
CREATE POLICY "agencies_delete"
  ON public.agencies FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- AGENCY_MEMBERS POLICIES
-- IMPORTANT: These must NOT query agency_members to avoid infinite recursion!
-- ========================================

-- Users can read their own memberships (NO RECURSION - only checks user_id)
CREATE POLICY "members_read_own"
  ON public.agency_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow inserts (controlled by backend)
CREATE POLICY "members_insert"
  ON public.agency_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own memberships
CREATE POLICY "members_update_own"
  ON public.agency_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow deletes (controlled by backend)
CREATE POLICY "members_delete"
  ON public.agency_members FOR DELETE
  TO authenticated
  USING (true);

-- ========================================
-- USER AGENCY PREFERENCES POLICIES
-- ========================================

-- User agency preferences policies
CREATE POLICY "Users can view own preferences"
  ON public.user_agency_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_agency_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_agency_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp for agencies
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for agency_members
CREATE TRIGGER update_agency_members_updated_at
  BEFORE UPDATE ON public.agency_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp for user_agency_preferences
CREATE TRIGGER update_user_agency_preferences_updated_at
  BEFORE UPDATE ON public.user_agency_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RPC FUNCTIONS
-- ========================================

-- Get all agencies for a user
CREATE OR REPLACE FUNCTION public.get_user_agencies(p_user_id UUID)
RETURNS TABLE (
  agency_id UUID,
  agency_name TEXT,
  agency_slug TEXT,
  agency_logo_url TEXT,
  agency_website TEXT,
  agency_description TEXT,
  subscription_tier TEXT,
  user_role TEXT,
  invitation_status TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as agency_id,
    a.name as agency_name,
    a.slug as agency_slug,
    a.logo_url as agency_logo_url,
    a.website as agency_website,
    a.description as agency_description,
    a.subscription_tier,
    am.role as user_role,
    am.invitation_status,
    am.joined_at
  FROM public.agencies a
  INNER JOIN public.agency_members am ON a.id = am.agency_id
  WHERE am.user_id = p_user_id
    AND am.invitation_status = 'active'
    AND a.is_active = true
  ORDER BY am.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current agency for user
CREATE OR REPLACE FUNCTION public.get_current_agency(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_agency_id UUID;
BEGIN
  SELECT current_agency_id INTO v_agency_id
  FROM public.user_agency_preferences
  WHERE user_id = p_user_id;

  RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set current agency for user
CREATE OR REPLACE FUNCTION public.set_current_agency(p_user_id UUID, p_agency_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_agency_preferences (user_id, current_agency_id)
  VALUES (p_user_id, p_agency_id)
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_agency_id = p_agency_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is agency admin
CREATE OR REPLACE FUNCTION public.is_agency_admin(p_user_id UUID, p_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE user_id = p_user_id
      AND agency_id = p_agency_id
      AND role = 'admin'
      AND invitation_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DATA MIGRATION (if coming from teams)
-- ========================================

-- Migrate existing teams to agencies (if needed)
-- Uncomment if you want to migrate from old team system
/*
INSERT INTO public.agencies (id, name, slug, description, subscription_tier, settings, created_at, updated_at)
SELECT
  id,
  name,
  slug,
  description,
  CASE plan
    WHEN 'free' THEN 'free'
    WHEN 'starter' THEN 'sales'
    WHEN 'professional' THEN 'build'
    WHEN 'enterprise' THEN 'scale'
    ELSE 'free'
  END as subscription_tier,
  settings,
  created_at,
  updated_at
FROM public.teams
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.agency_members (agency_id, user_id, role, permissions, joined_at, created_at, updated_at)
SELECT
  team_id,
  user_id,
  CASE role
    WHEN 'owner' THEN 'admin'
    WHEN 'admin' THEN 'admin'
    WHEN 'member' THEN 'member'
    WHEN 'guest' THEN 'viewer'
    ELSE 'member'
  END as role,
  permissions,
  joined_at,
  NOW(),
  NOW()
FROM public.team_members
ON CONFLICT (agency_id, user_id) DO NOTHING;
*/

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.agencies IS 'Core table for agency management in multi-tenant CRM';
COMMENT ON TABLE public.agency_members IS 'Junction table linking users to agencies with roles and permissions';
COMMENT ON TABLE public.user_agency_preferences IS 'Stores which agency is currently selected for each user';

COMMENT ON COLUMN public.agencies.subscription_tier IS 'Subscription plan: free, sales, build, scale, god_mode';
COMMENT ON COLUMN public.agency_members.role IS 'User role in agency: admin (can manage), member (can use), viewer (read-only)';
COMMENT ON COLUMN public.agency_members.invitation_status IS 'Member status: pending, active, suspended, removed';
