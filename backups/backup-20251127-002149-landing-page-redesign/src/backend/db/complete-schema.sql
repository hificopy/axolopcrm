-- ========================================
-- AXOLOP CRM - COMPLETE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ========================================

-- ========================================
-- PART 1: USERS & AUTHENTICATION SCHEMA
-- ========================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MANAGER', 'AGENT')),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 2. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT CHECK (two_factor_method IN ('sms', 'email', 'authenticator')),
  session_timeout INTEGER DEFAULT 86400,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  compact_mode BOOLEAN DEFAULT FALSE,
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  default_lead_status TEXT,
  default_opportunity_stage TEXT,
  email_signature TEXT,
  calendar_sync_enabled BOOLEAN DEFAULT FALSE,
  calendar_provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Enable RLS on users tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- User settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PART 2: AGENCY SYSTEM SCHEMA
-- ========================================

-- 1. AGENCIES TABLE
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'sales', 'build', 'scale', 'god_mode')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trial')),
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agencies_slug ON public.agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_subscription_tier ON public.agencies(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON public.agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies(created_at DESC);

-- 2. AGENCY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  invitation_status TEXT DEFAULT 'active' CHECK (invitation_status IN ('pending', 'active', 'suspended', 'removed')),
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_agency_members_agency_id ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_role ON public.agency_members(role);
CREATE INDEX IF NOT EXISTS idx_agency_members_invitation_status ON public.agency_members(invitation_status);

-- 3. USER AGENCY PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_agency_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_agency_preferences_user_id ON public.user_agency_preferences(user_id);

-- Enable RLS on agency tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_agency_preferences ENABLE ROW LEVEL SECURITY;

-- Agencies policies
DROP POLICY IF EXISTS "Users can view their agencies" ON public.agencies;
CREATE POLICY "Users can view their agencies"
  ON public.agencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members
      WHERE agency_id = id
        AND user_id = auth.uid()
        AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can update their agencies" ON public.agencies;
CREATE POLICY "Admins can update their agencies"
  ON public.agencies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members
      WHERE agency_id = id
        AND user_id = auth.uid()
        AND role = 'admin'
        AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can create agencies" ON public.agencies;
CREATE POLICY "Users can create agencies"
  ON public.agencies FOR INSERT
  WITH CHECK (true);

-- Agency members policies
DROP POLICY IF EXISTS "Members can view agency members" ON public.agency_members;
CREATE POLICY "Members can view agency members"
  ON public.agency_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_id
        AND am.user_id = auth.uid()
        AND am.invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert agency members" ON public.agency_members;
CREATE POLICY "Users can insert agency members"
  ON public.agency_members FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update members" ON public.agency_members;
CREATE POLICY "Admins can update members"
  ON public.agency_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members
      WHERE agency_id = agency_members.agency_id
        AND user_id = auth.uid()
        AND role = 'admin'
        AND invitation_status = 'active'
    )
  );

-- User agency preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_agency_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_agency_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_agency_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_agency_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_agency_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_agency_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- PART 3: TRIGGERS & FUNCTIONS
-- ========================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agencies_updated_at ON public.agencies;
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_members_updated_at ON public.agency_members;
CREATE TRIGGER update_agency_members_updated_at
  BEFORE UPDATE ON public.agency_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_agency_preferences_updated_at ON public.user_agency_preferences;
CREATE TRIGGER update_user_agency_preferences_updated_at
  BEFORE UPDATE ON public.user_agency_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    first_name,
    last_name,
    profile_picture,
    email_verified,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    'USER'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    profile_picture = COALESCE(EXCLUDED.profile_picture, users.profile_picture),
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- PART 4: AGENCY RPC FUNCTIONS
-- ========================================

-- Drop existing functions if they exist (to avoid conflicts)
DROP FUNCTION IF EXISTS public.get_user_agencies(UUID);
DROP FUNCTION IF EXISTS public.get_current_agency(UUID);
DROP FUNCTION IF EXISTS public.set_current_agency(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_agency_admin(UUID, UUID);

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
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ AXOLOP CRM SCHEMA DEPLOYMENT COMPLETE!';
  RAISE NOTICE '   Tables created: users, user_settings, agencies, agency_members, user_agency_preferences';
  RAISE NOTICE '   Functions created: get_user_agencies, get_current_agency, set_current_agency, is_agency_admin';
  RAISE NOTICE '   RLS policies: Enabled and configured';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Refresh your app at localhost:3000';
  RAISE NOTICE '   2. Try creating an agency';
  RAISE NOTICE '   3. Check that it works!';
END $$;
