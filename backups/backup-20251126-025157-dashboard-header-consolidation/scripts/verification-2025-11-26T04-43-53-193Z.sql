-- ============================================
-- TABLE VERIFICATION SCRIPT
-- Run this after migration to verify tables
-- ============================================

SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Critical tables to verify:
SELECT 'user_todos' as table_name, COUNT(*) as count FROM user_todos
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL  
SELECT 'agencies' as table_name, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'forms' as table_name, COUNT(*) as count FROM forms
UNION ALL
SELECT 'form_submissions' as table_name, COUNT(*) as count FROM form_submissions;
