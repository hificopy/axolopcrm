-- ============================================
-- CRITICAL FIX: Add missing sort_order columns
-- This script fixes the "column sort_order does not exist" error
-- ============================================

-- Fix 1: user_todos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_todos'
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.user_todos ADD COLUMN sort_order INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added sort_order column to user_todos table';
  ELSE
    RAISE NOTICE 'ℹ️ Column sort_order already exists in user_todos table';
  END IF;
END $$;

-- Fix 2: Check if forms table needs sort_order
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'forms'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'forms'
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.forms ADD COLUMN sort_order INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added sort_order column to forms table';
  END IF;
END $$;

-- Fix 3: Check if form_fields table needs sort_order
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'form_fields'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_fields'
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.form_fields ADD COLUMN sort_order INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added sort_order column to form_fields table';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order ON public.user_todos(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_forms_sort_order ON public.forms(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_form_fields_sort_order ON public.form_fields(form_id, sort_order);

-- Update existing records to have proper sort_order values
UPDATE public.user_todos 
SET sort_order = EXTRACT(EPOCH FROM created_at)::INTEGER 
WHERE sort_order = 0 AND created_at IS NOT NULL;

UPDATE public.forms 
SET sort_order = EXTRACT(EPOCH FROM created_at)::INTEGER 
WHERE sort_order = 0 AND created_at IS NOT NULL;

UPDATE public.form_fields 
SET sort_order = id 
WHERE sort_order = 0 AND id IS NOT NULL;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT
  'sort_order_column_fix' as fix_type,
  'user_todos' as table_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_todos'
      AND column_name = 'sort_order'
    ) THEN '✅ FIXED'
    ELSE '❌ MISSING'
  END AS status
UNION ALL
SELECT
  'sort_order_column_fix' as fix_type,
  'forms' as table_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'forms'
      AND column_name = 'sort_order'
    ) THEN '✅ FIXED'
    ELSE 'ℹ️ TABLE NOT FOUND'
  END AS status
UNION ALL
SELECT
  'sort_order_column_fix' as fix_type,
  'form_fields' as table_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'form_fields'
      AND column_name = 'sort_order'
    ) THEN '✅ FIXED'
    ELSE 'ℹ️ TABLE NOT FOUND'
  END AS status;

RAISE NOTICE '🎉 sort_order column fix completed successfully!';