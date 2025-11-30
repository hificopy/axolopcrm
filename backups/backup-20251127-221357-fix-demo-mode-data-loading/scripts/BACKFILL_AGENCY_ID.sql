-- =============================================
-- BACKFILL AGENCY_ID FOR EXISTING RECORDS
-- Run this after DEPLOY_ALL_FIXES.sql
-- =============================================

-- First, let's see what agencies and members exist
SELECT 'Checking agency_members table...' as step;

SELECT
    am.user_id,
    am.agency_id,
    am.invitation_status,
    am.role,
    am.joined_at,
    a.name as agency_name
FROM public.agency_members am
LEFT JOIN public.agencies a ON a.id = am.agency_id
LIMIT 20;

-- Check what user_ids exist in leads
SELECT 'Checking leads user_ids...' as step;

SELECT DISTINCT user_id FROM public.leads LIMIT 20;

-- Now backfill using a more flexible approach (not requiring joined_at)
-- Backfill leads - get ANY active agency membership for the user
UPDATE public.leads l
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = l.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE l.agency_id IS NULL
AND l.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agency_members am
    WHERE am.user_id = l.user_id AND am.invitation_status = 'active'
);

-- Backfill contacts
UPDATE public.contacts c
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = c.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE c.agency_id IS NULL
AND c.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agency_members am
    WHERE am.user_id = c.user_id AND am.invitation_status = 'active'
);

-- Backfill opportunities
UPDATE public.opportunities o
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = o.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE o.agency_id IS NULL
AND o.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agency_members am
    WHERE am.user_id = o.user_id AND am.invitation_status = 'active'
);

-- Backfill user_todos
UPDATE public.user_todos t
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = t.user_id
    AND am.invitation_status = 'active'
    LIMIT 1
)
WHERE t.agency_id IS NULL
AND t.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agency_members am
    WHERE am.user_id = t.user_id AND am.invitation_status = 'active'
);

-- If still no match, try matching by agency owner_id
UPDATE public.leads l
SET agency_id = (
    SELECT a.id
    FROM public.agencies a
    WHERE a.owner_id = l.user_id
    AND a.is_active = true
    AND a.deleted_at IS NULL
    LIMIT 1
)
WHERE l.agency_id IS NULL
AND l.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.owner_id = l.user_id AND a.is_active = true AND a.deleted_at IS NULL
);

UPDATE public.contacts c
SET agency_id = (
    SELECT a.id
    FROM public.agencies a
    WHERE a.owner_id = c.user_id
    AND a.is_active = true
    AND a.deleted_at IS NULL
    LIMIT 1
)
WHERE c.agency_id IS NULL
AND c.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.owner_id = c.user_id AND a.is_active = true AND a.deleted_at IS NULL
);

UPDATE public.opportunities o
SET agency_id = (
    SELECT a.id
    FROM public.agencies a
    WHERE a.owner_id = o.user_id
    AND a.is_active = true
    AND a.deleted_at IS NULL
    LIMIT 1
)
WHERE o.agency_id IS NULL
AND o.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.owner_id = o.user_id AND a.is_active = true AND a.deleted_at IS NULL
);

UPDATE public.user_todos t
SET agency_id = (
    SELECT a.id
    FROM public.agencies a
    WHERE a.owner_id = t.user_id
    AND a.is_active = true
    AND a.deleted_at IS NULL
    LIMIT 1
)
WHERE t.agency_id IS NULL
AND t.user_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.owner_id = t.user_id AND a.is_active = true AND a.deleted_at IS NULL
);

-- Final verification
SELECT 'BACKFILL COMPLETE - Final counts:' as status;

SELECT
    'leads' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency,
    COUNT(*) - COUNT(agency_id) as records_without_agency
FROM public.leads
UNION ALL
SELECT
    'contacts' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency,
    COUNT(*) - COUNT(agency_id) as records_without_agency
FROM public.contacts
UNION ALL
SELECT
    'opportunities' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency,
    COUNT(*) - COUNT(agency_id) as records_without_agency
FROM public.opportunities
UNION ALL
SELECT
    'user_todos' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency,
    COUNT(*) - COUNT(agency_id) as records_without_agency
FROM public.user_todos;

-- Show records that still don't have agency_id (orphaned data)
SELECT 'Records without agency_id (orphaned):' as info;

SELECT 'leads' as table_name, l.id, l.user_id, l.name, l.email
FROM public.leads l
WHERE l.agency_id IS NULL
LIMIT 10;

SELECT 'contacts' as table_name, c.id, c.user_id, c.first_name, c.last_name
FROM public.contacts c
WHERE c.agency_id IS NULL
LIMIT 10;
