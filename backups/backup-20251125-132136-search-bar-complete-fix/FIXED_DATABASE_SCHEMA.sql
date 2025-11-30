-- ============================================
-- CORRECTED DATABASE FIX - Run in Supabase SQL Editor
-- ============================================
-- Date: November 24, 2025
-- Purpose: Fix user_preferences table with correct schema and forms columns

-- ============================================
-- 1. DROP AND RECREATE user_preferences TABLE with correct schema
-- ============================================

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS public.user_preferences CASCADE;

-- Create user_preferences table with correct columns matching backend code
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  kate_onboarding_completed BOOLEAN DEFAULT false,
  kate_onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  kate_onboarding_messages JSONB DEFAULT '[]'::jsonb,
  dashboard_layout JSONB DEFAULT '{}'::jsonb,
  dashboard_widgets JSONB DEFAULT '[]'::jsonb,
  default_view_contacts VARCHAR(50) DEFAULT 'table',
  default_view_leads VARCHAR(50) DEFAULT 'table',
  default_view_opportunities VARCHAR(50) DEFAULT 'kanban',
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE RLS on user_preferences
-- ============================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
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
-- 4. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);

-- ============================================
-- 5. ADD MISSING COLUMNS TO forms TABLE
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
-- 6. ADD COLUMN COMMENTS
-- ============================================

COMMENT ON COLUMN public.forms.workflow_nodes IS 'Stores workflow automation nodes configuration';
COMMENT ON COLUMN public.forms.endings IS 'Stores form completion and redirect configuration';
COMMENT ON TABLE public.user_preferences IS 'Stores user-specific preferences and UI state';
COMMENT ON COLUMN public.user_preferences.preferences IS 'JSONB field for storing nested preferences like sidebar buttons and pinned actions';

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Verify user_preferences table exists with correct columns
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_preferences'
ORDER BY ordinal_position;

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
  RAISE NOTICE '📋 Schema now matches backend expectations';
  RAISE NOTICE '   - user_preferences table with correct columns';
  RAISE NOTICE '   - forms table with workflow_nodes and endings';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next steps:';
  RAISE NOTICE '   1. Restart Docker backend: docker restart website-backend-1';
  RAISE NOTICE '   2. Refresh browser (Cmd+Shift+R)';
  RAISE NOTICE '   3. Test Todos and Forms pages';
END $$;
