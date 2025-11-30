-- =====================================================
-- COMPREHENSIVE SECURITY AUDIT FOR V1 LAUNCH
-- Checks for any missing user isolation or security gaps
-- =====================================================

-- =====================================================
-- 1. FIND TABLES WITHOUT user_id (Potential Security Gap)
-- =====================================================
SELECT
  '1. TABLES WITHOUT user_id' as audit_section,
  t.tablename,
  'Missing user_id column' as issue,
  'HIGH' as severity,
  'Add user_id column if this table contains user-specific data' as recommendation
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE 'sql_%'
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_name = t.tablename
      AND c.table_schema = 'public'
      AND c.column_name = 'user_id'
  )
ORDER BY t.tablename;

-- =====================================================
-- 2. TABLES WITH user_id BUT NO RLS (Critical Security Risk!)
-- =====================================================
SELECT
  '2. TABLES WITH user_id BUT NO RLS' as audit_section,
  t.tablename,
  'Has user_id but RLS is not enabled' as issue,
  'CRITICAL' as severity,
  'Enable RLS immediately - users can see each other''s data!' as recommendation
FROM pg_tables t
INNER JOIN information_schema.columns c
  ON c.table_name = t.tablename
  AND c.table_schema = 'public'
WHERE t.schemaname = 'public'
  AND c.column_name = 'user_id'
  AND t.rowsecurity = false
ORDER BY t.tablename;

-- =====================================================
-- 3. CHECK FOR ALTERNATIVE USER REFERENCE COLUMNS
-- =====================================================
SELECT
  '3. ALTERNATIVE USER COLUMNS' as audit_section,
  table_name as tablename,
  column_name,
  data_type,
  'May need RLS policy using this column' as issue,
  'MEDIUM' as severity
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('created_by', 'owner_id', 'assigned_to', 'updated_by')
  AND table_name NOT LIKE 'pg_%'
ORDER BY table_name, column_name;

-- =====================================================
-- 4. TABLES WITH RLS BUT NO POLICIES (Effectively Blocks All Access)
-- =====================================================
SELECT
  '4. RLS ENABLED BUT NO POLICIES' as audit_section,
  t.tablename,
  'RLS enabled but no policies exist' as issue,
  'CRITICAL' as severity,
  'Users cannot access this table - add policies!' as recommendation
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND p.tablename = t.tablename
  )
ORDER BY t.tablename;

-- =====================================================
-- 5. CHECK FOR ORPHANED DATA (No valid user_id)
-- =====================================================
-- This generates SQL you can run to check each table
SELECT
  '5. GENERATE ORPHAN CHECK QUERIES' as audit_section,
  t.tablename,
  format(
    'SELECT ''%s'' as table_name, COUNT(*) as orphaned_rows FROM %I WHERE user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = %I.user_id);',
    t.tablename,
    t.tablename,
    t.tablename
  ) as sql_to_run
FROM pg_tables t
INNER JOIN information_schema.columns c
  ON c.table_name = t.tablename
  AND c.table_schema = 'public'
WHERE t.schemaname = 'public'
  AND c.column_name = 'user_id'
ORDER BY t.tablename;

-- =====================================================
-- 6. TABLES WITH SENSITIVE DATA PATTERNS (Need Extra Security)
-- =====================================================
SELECT
  '6. POTENTIAL SENSITIVE DATA' as audit_section,
  table_name as tablename,
  column_name,
  data_type,
  'Contains potentially sensitive data' as issue,
  'REVIEW' as severity
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name ILIKE '%password%'
    OR column_name ILIKE '%token%'
    OR column_name ILIKE '%secret%'
    OR column_name ILIKE '%key%'
    OR column_name ILIKE '%ssn%'
    OR column_name ILIKE '%credit%'
    OR column_name ILIKE '%card%'
    OR column_name ILIKE '%api_key%'
  )
ORDER BY table_name, column_name;

-- =====================================================
-- 7. FOREIGN KEY RELATIONSHIPS WITHOUT CASCADE
-- =====================================================
SELECT
  '7. FOREIGN KEYS WITHOUT CASCADE' as audit_section,
  tc.table_name as tablename,
  kcu.column_name,
  ccu.table_name as references_table,
  rc.delete_rule,
  CASE
    WHEN rc.delete_rule = 'CASCADE' THEN 'OK'
    ELSE 'Consider adding ON DELETE CASCADE for user_id foreign keys'
  END as recommendation
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND kcu.column_name = 'user_id'
ORDER BY tc.table_name;

-- =====================================================
-- 8. POLICY COVERAGE CHECK
-- =====================================================
SELECT
  '8. POLICY COVERAGE' as audit_section,
  t.tablename,
  COUNT(p.policyname) as policy_count,
  string_agg(DISTINCT p.cmd::text, ', ') as covered_operations,
  CASE
    WHEN COUNT(DISTINCT p.cmd) >= 4 THEN '✅ Full CRUD coverage'
    WHEN COUNT(DISTINCT p.cmd) >= 1 THEN '⚠️ Partial coverage'
    ELSE '❌ No policies'
  END as coverage_status
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.tablename = t.tablename
  AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.tablename
ORDER BY policy_count ASC, t.tablename;

-- =====================================================
-- 9. TABLES THAT MIGHT NEED PUBLIC ACCESS
-- =====================================================
SELECT
  '9. POTENTIAL PUBLIC ACCESS NEEDS' as audit_section,
  tablename,
  'May need public access for anonymous users' as consideration,
  CASE
    WHEN tablename ILIKE '%form%response%' THEN 'Form submissions should allow public INSERT'
    WHEN tablename ILIKE '%booking%' THEN 'Bookings may need public INSERT'
    WHEN tablename ILIKE '%webhook%' THEN 'Webhooks may need special access'
    WHEN tablename ILIKE '%public%' THEN 'Name suggests public access needed'
    ELSE 'Review if public access is needed'
  END as recommendation
FROM pg_tables
WHERE schemaname = 'public'
  AND (
    tablename ILIKE '%form%response%'
    OR tablename ILIKE '%booking%'
    OR tablename ILIKE '%webhook%'
    OR tablename ILIKE '%public%'
    OR tablename ILIKE '%submission%'
  )
ORDER BY tablename;

-- =====================================================
-- 10. JUNCTION/RELATIONSHIP TABLES CHECK
-- =====================================================
SELECT
  '10. JUNCTION TABLES' as audit_section,
  t.tablename,
  string_agg(c.column_name, ', ') FILTER (WHERE c.column_name ILIKE '%_id') as foreign_key_columns,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t.tablename AND column_name = 'user_id')
    THEN '✅ Has user_id'
    ELSE '⚠️ Missing user_id - may need indirect access control'
  END as user_isolation_status
FROM pg_tables t
JOIN information_schema.columns c
  ON c.table_name = t.tablename
  AND c.table_schema = 'public'
WHERE t.schemaname = 'public'
  AND (
    -- Junction table patterns
    t.tablename ILIKE '%_%_%' -- Common junction naming like user_role_mapping
    OR (
      -- Has multiple foreign keys
      SELECT COUNT(*) FROM information_schema.columns
      WHERE table_name = t.tablename
        AND table_schema = 'public'
        AND column_name ILIKE '%_id'
    ) >= 2
  )
GROUP BY t.tablename
ORDER BY t.tablename;

-- =====================================================
-- 11. SUMMARY DASHBOARD
-- =====================================================
SELECT
  '11. SECURITY SUMMARY' as audit_section,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%') as total_tables,
  (SELECT COUNT(*) FROM pg_tables t
   INNER JOIN information_schema.columns c ON c.table_name = t.tablename AND c.table_schema = 'public'
   WHERE t.schemaname = 'public' AND c.column_name = 'user_id') as tables_with_user_id,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_tables t
          INNER JOIN information_schema.columns c ON c.table_name = t.tablename AND c.table_schema = 'public'
          WHERE t.schemaname = 'public' AND c.column_name = 'user_id' AND t.rowsecurity = false) = 0
    THEN '✅ ALL SECURE'
    ELSE '⚠️ SECURITY GAPS EXIST'
  END as overall_status;

-- =====================================================
-- 12. LIST ALL PUBLIC TABLES (Reference)
-- =====================================================
SELECT
  '12. ALL TABLES REFERENCE' as audit_section,
  t.tablename,
  pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename)::regclass)) as table_size,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename AND table_schema = 'public') as column_count,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t.tablename AND column_name = 'user_id') THEN '✅' ELSE '❌' END as has_user_id,
  CASE WHEN t.rowsecurity THEN '✅' ELSE '❌' END as rls_enabled,
  COALESCE((SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename), 0) as policy_count
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE 'sql_%'
ORDER BY pg_total_relation_size(quote_ident(t.tablename)::regclass) DESC;
