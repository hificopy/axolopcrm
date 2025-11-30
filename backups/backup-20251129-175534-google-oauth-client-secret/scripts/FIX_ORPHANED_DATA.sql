-- =============================================
-- FIX ORPHANED DATA (records with NULL user_id)
-- =============================================

-- First, let's see what we're dealing with
SELECT 'Orphaned records (NULL user_id):' as info;

SELECT
    'leads' as table_name,
    COUNT(*) as orphaned_count
FROM public.leads WHERE user_id IS NULL
UNION ALL
SELECT
    'contacts' as table_name,
    COUNT(*) as orphaned_count
FROM public.contacts WHERE user_id IS NULL
UNION ALL
SELECT
    'opportunities' as table_name,
    COUNT(*) as orphaned_count
FROM public.opportunities WHERE user_id IS NULL
UNION ALL
SELECT
    'user_todos' as table_name,
    COUNT(*) as orphaned_count
FROM public.user_todos WHERE user_id IS NULL;

-- Let's see what agencies exist
SELECT 'Available agencies:' as info;

SELECT id, name, owner_id, is_active
FROM public.agencies
WHERE is_active = true AND deleted_at IS NULL
LIMIT 10;

-- Get the first active agency and its owner
-- We'll assign orphaned data to this agency/user

-- OPTION 1: Delete orphaned demo data (recommended for clean slate)
-- Uncomment these lines if you want to delete orphaned records:

-- DELETE FROM public.contacts WHERE user_id IS NULL;
-- DELETE FROM public.leads WHERE user_id IS NULL;
-- DELETE FROM public.opportunities WHERE user_id IS NULL;
-- DELETE FROM public.user_todos WHERE user_id IS NULL;

-- OPTION 2: Assign orphaned data to the first agency owner
-- This will make the orphaned data belong to your main agency

-- Get the owner of the first active agency
WITH first_agency AS (
    SELECT id as agency_id, owner_id
    FROM public.agencies
    WHERE is_active = true AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.leads l
SET
    user_id = fa.owner_id,
    agency_id = fa.agency_id
FROM first_agency fa
WHERE l.user_id IS NULL;

WITH first_agency AS (
    SELECT id as agency_id, owner_id
    FROM public.agencies
    WHERE is_active = true AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.contacts c
SET
    user_id = fa.owner_id,
    agency_id = fa.agency_id
FROM first_agency fa
WHERE c.user_id IS NULL;

WITH first_agency AS (
    SELECT id as agency_id, owner_id
    FROM public.agencies
    WHERE is_active = true AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.opportunities o
SET
    user_id = fa.owner_id,
    agency_id = fa.agency_id
FROM first_agency fa
WHERE o.user_id IS NULL;

WITH first_agency AS (
    SELECT id as agency_id, owner_id
    FROM public.agencies
    WHERE is_active = true AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE public.user_todos t
SET
    user_id = fa.owner_id,
    agency_id = fa.agency_id
FROM first_agency fa
WHERE t.user_id IS NULL;

-- Now backfill any remaining records that have user_id but no agency_id
UPDATE public.leads l
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = l.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE l.agency_id IS NULL
AND l.user_id IS NOT NULL;

UPDATE public.contacts c
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = c.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE c.agency_id IS NULL
AND c.user_id IS NOT NULL;

UPDATE public.opportunities o
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = o.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE o.agency_id IS NULL
AND o.user_id IS NOT NULL;

UPDATE public.user_todos t
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = t.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE t.agency_id IS NULL
AND t.user_id IS NOT NULL;

-- Final verification
SELECT 'FINAL RESULTS:' as status;

SELECT
    'leads' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as with_agency,
    COUNT(user_id) as with_user,
    COUNT(*) - COUNT(agency_id) as missing_agency
FROM public.leads
UNION ALL
SELECT
    'contacts' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as with_agency,
    COUNT(user_id) as with_user,
    COUNT(*) - COUNT(agency_id) as missing_agency
FROM public.contacts
UNION ALL
SELECT
    'opportunities' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as with_agency,
    COUNT(user_id) as with_user,
    COUNT(*) - COUNT(agency_id) as missing_agency
FROM public.opportunities
UNION ALL
SELECT
    'user_todos' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as with_agency,
    COUNT(user_id) as with_user,
    COUNT(*) - COUNT(agency_id) as missing_agency
FROM public.user_todos;

SELECT 'ALL ORPHANED DATA FIXED!' as final_status;
