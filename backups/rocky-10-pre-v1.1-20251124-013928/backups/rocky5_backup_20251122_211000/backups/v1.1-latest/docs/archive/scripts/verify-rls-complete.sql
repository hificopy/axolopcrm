-- =====================================================
-- COMPREHENSIVE RLS VERIFICATION
-- Run this to confirm your RLS setup is complete
-- =====================================================

-- 1. Show all tables with RLS enabled
SELECT
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN '✅ Protected'
    ELSE '❌ Not Protected'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY rowsecurity DESC, tablename;

-- 2. Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count,
  string_agg(DISTINCT cmd::text, ', ') as operations
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- 3. Show detailed policy information
SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_check,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 4. Summary statistics
SELECT
  COUNT(DISTINCT t.tablename) as total_tables,
  COUNT(DISTINCT CASE WHEN t.rowsecurity THEN t.tablename END) as tables_with_rls,
  COUNT(DISTINCT CASE WHEN NOT t.rowsecurity THEN t.tablename END) as tables_without_rls,
  COUNT(p.policyname) as total_policies,
  ROUND(
    COUNT(DISTINCT CASE WHEN t.rowsecurity THEN t.tablename END)::numeric /
    NULLIF(COUNT(DISTINCT t.tablename), 0) * 100,
    2
  ) as rls_coverage_percentage
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE 'sql_%';

-- 5. Check for tables with user_id but no RLS (security risk!)
SELECT
  t.tablename,
  '⚠️ HAS user_id BUT NO RLS!' as warning,
  'SECURITY RISK' as severity
FROM pg_tables t
INNER JOIN information_schema.columns c
  ON c.table_name = t.tablename
  AND c.table_schema = t.schemaname
WHERE t.schemaname = 'public'
  AND c.column_name = 'user_id'
  AND t.rowsecurity = false
ORDER BY t.tablename;

-- 6. List all indexes on user_id columns (for performance)
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef ILIKE '%user_id%'
ORDER BY tablename;

-- 7. Test RLS functionality (safe read-only check)
-- This shows if RLS would prevent unauthorized access
SELECT
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity THEN 'Users isolated by auth.uid() = user_id'
    ELSE 'NO ISOLATION - All users can see all data'
  END as isolation_status
FROM pg_tables
WHERE schemaname = 'public'
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = pg_tables.tablename
      AND table_schema = pg_tables.schemaname
      AND column_name = 'user_id'
  )
ORDER BY rowsecurity DESC, tablename;
