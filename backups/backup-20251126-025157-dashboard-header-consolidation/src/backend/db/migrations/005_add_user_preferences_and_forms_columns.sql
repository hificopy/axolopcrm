-- Database Schema Fixes - User Preferences and Forms Columns
-- Date: November 24, 2025
-- Priority: CRITICAL
-- Fixes: Todos page, Forms page, User settings, Sidebar customization

-- ============================================
-- 1. Create user_preferences table
-- ============================================
-- Required for: Todos, Sidebar customization, User settings

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key VARCHAR(255) NOT NULL,
  preference_value JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_preference UNIQUE(user_id, preference_key)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_key
  ON public.user_preferences(preference_key);

-- ============================================
-- 2. Add missing columns to forms table
-- ============================================
-- Required for: Forms page, Form builder, Workflows

-- Add workflow_nodes column (stores workflow configuration)
ALTER TABLE public.forms
  ADD COLUMN IF NOT EXISTS workflow_nodes JSONB DEFAULT '[]'::jsonb;

-- Add endings column (stores form completion actions)
ALTER TABLE public.forms
  ADD COLUMN IF NOT EXISTS endings JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.forms.workflow_nodes IS 'Stores workflow automation nodes configuration';
COMMENT ON COLUMN public.forms.endings IS 'Stores form completion and redirect configuration';

-- ============================================
-- 3. Create helper function for user preferences
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_preference(
  p_user_id UUID,
  p_preference_key VARCHAR(255),
  p_default_value JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_preference_value JSONB;
BEGIN
  SELECT preference_value INTO v_preference_value
  FROM public.user_preferences
  WHERE user_id = p_user_id
    AND preference_key = p_preference_key;

  RETURN COALESCE(v_preference_value, p_default_value);
END;
$$;

-- ============================================
-- 4. Create helper function to set user preference
-- ============================================

CREATE OR REPLACE FUNCTION public.set_user_preference(
  p_user_id UUID,
  p_preference_key VARCHAR(255),
  p_preference_value JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, preference_key, preference_value)
  VALUES (p_user_id, p_preference_key, p_preference_value)
  ON CONFLICT (user_id, preference_key)
  DO UPDATE SET
    preference_value = EXCLUDED.preference_value,
    updated_at = NOW();
END;
$$;

-- ============================================
-- 5. Grant permissions
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
