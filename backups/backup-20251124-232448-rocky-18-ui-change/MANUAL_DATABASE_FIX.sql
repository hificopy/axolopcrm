-- ============================================
-- MANUAL DATABASE FIX - Run in Supabase SQL Editor
-- ============================================
-- Date: November 24, 2025
-- Purpose: Fix missing user_preferences table and forms columns
-- How to Run: Copy entire contents and paste into Supabase Dashboard > SQL Editor > Run

-- ============================================
-- 1. CREATE user_preferences TABLE
-- ============================================

DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    CREATE TABLE public.user_preferences (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      preference_key VARCHAR(255) NOT NULL,
      preference_value JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT unique_user_preference UNIQUE(user_id, preference_key)
    );

    RAISE NOTICE 'Created user_preferences table';
  ELSE
    RAISE NOTICE 'Table user_preferences already exists';
  END IF;
END $$;

-- ============================================
-- 2. ENABLE RLS on user_preferences
-- ============================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP existing policies if they exist (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Policy: Users can only see their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_key
  ON public.user_preferences(preference_key);

-- ============================================
-- 6. ADD MISSING COLUMNS TO forms TABLE
-- ============================================

-- Add workflow_nodes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'forms'
    AND column_name = 'workflow_nodes'
  ) THEN
    ALTER TABLE public.forms ADD COLUMN workflow_nodes JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added workflow_nodes column to forms table';
  ELSE
    RAISE NOTICE 'Column workflow_nodes already exists';
  END IF;
END $$;

-- Add endings column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'forms'
    AND column_name = 'endings'
  ) THEN
    ALTER TABLE public.forms ADD COLUMN endings JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added endings column to forms table';
  ELSE
    RAISE NOTICE 'Column endings already exists';
  END IF;
END $$;

-- ============================================
-- 7. ADD COLUMN COMMENTS
-- ============================================

COMMENT ON COLUMN public.forms.workflow_nodes IS 'Stores workflow automation nodes configuration';
COMMENT ON COLUMN public.forms.endings IS 'Stores form completion and redirect configuration';

-- ============================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get user preference
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

-- Function to set user preference
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
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_preference TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_preference TO authenticated;

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Verify user_preferences table exists
SELECT
  'user_preferences table' AS check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = 'user_preferences'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status;

-- Verify forms columns exist
SELECT
  'workflow_nodes column' AS check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'forms'
      AND column_name = 'workflow_nodes'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
UNION ALL
SELECT
  'endings column' AS check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'forms'
      AND column_name = 'endings'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema fixes completed!';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '   1. Refresh your browser (Cmd+Shift+R)';
  RAISE NOTICE '   2. Check the verification results above';
  RAISE NOTICE '   3. Test the Todos page';
  RAISE NOTICE '   4. Test the Forms page';
END $$;
