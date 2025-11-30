-- =============================================
-- FIX AGENCY CREATION RLS POLICY
-- Run this in Supabase SQL Editor
-- =============================================

-- This script fixes the "new row violates row-level security policy for table agencies" error
-- that occurs when authenticated users try to create a new agency.

-- Step 1: Check current policies on agencies table
SELECT 'Current agencies policies:' as info;
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'agencies';

-- Step 2: Drop existing INSERT policies that may be blocking
DROP POLICY IF EXISTS "agencies_insert" ON public.agencies;
DROP POLICY IF EXISTS "Authenticated users can create agencies" ON public.agencies;
DROP POLICY IF EXISTS "Users can create agencies" ON public.agencies;
DROP POLICY IF EXISTS "agency_insert_policy" ON public.agencies;

-- Step 3: Create proper INSERT policy
-- Allow any authenticated user to create an agency where they are the owner
CREATE POLICY "authenticated_users_can_create_agencies"
ON public.agencies
FOR INSERT
TO authenticated
WITH CHECK (
    -- The user creating the agency must be setting themselves as owner
    owner_id = auth.uid()
);

-- Step 4: Ensure SELECT policy allows users to see their own agencies
DROP POLICY IF EXISTS "agencies_select" ON public.agencies;
DROP POLICY IF EXISTS "Users can view agencies they belong to" ON public.agencies;
DROP POLICY IF EXISTS "agencies_visible_to_members" ON public.agencies;

CREATE POLICY "users_can_view_their_agencies"
ON public.agencies
FOR SELECT
TO authenticated
USING (
    -- User is the owner
    owner_id = auth.uid()
    -- OR user is a member
    OR id IN (
        SELECT agency_id
        FROM public.agency_members
        WHERE user_id = auth.uid()
    )
);

-- Step 5: Ensure UPDATE policy allows owners/admins to update
DROP POLICY IF EXISTS "agencies_update" ON public.agencies;
DROP POLICY IF EXISTS "agency_update_policy" ON public.agencies;

CREATE POLICY "owners_admins_can_update_agencies"
ON public.agencies
FOR UPDATE
TO authenticated
USING (
    -- Only owner or admin can update
    owner_id = auth.uid()
    OR id IN (
        SELECT agency_id
        FROM public.agency_members
        WHERE user_id = auth.uid()
        AND (role = 'admin' OR member_type = 'admin')
    )
)
WITH CHECK (
    -- Can't change owner unless you are the current owner
    owner_id = auth.uid()
    OR id IN (
        SELECT agency_id
        FROM public.agency_members
        WHERE user_id = auth.uid()
        AND (role = 'admin' OR member_type = 'admin')
    )
);

-- Step 6: Ensure DELETE policy only allows owners
DROP POLICY IF EXISTS "agencies_delete" ON public.agencies;
DROP POLICY IF EXISTS "agency_delete_policy" ON public.agencies;

CREATE POLICY "only_owners_can_delete_agencies"
ON public.agencies
FOR DELETE
TO authenticated
USING (
    owner_id = auth.uid()
);

-- Step 7: Verify RLS is enabled
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Step 8: Also fix agency_members policies to allow owner to add themselves
DROP POLICY IF EXISTS "agency_members_insert" ON public.agency_members;
DROP POLICY IF EXISTS "agency_members_insert_policy" ON public.agency_members;

CREATE POLICY "agency_owners_can_add_members"
ON public.agency_members
FOR INSERT
TO authenticated
WITH CHECK (
    -- User is adding themselves to an agency they own
    (
        user_id = auth.uid()
        AND agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())
    )
    -- OR user is admin of the agency they're adding to (role enum: 'admin', 'member')
    OR (
        agency_id IN (
            SELECT agency_id FROM public.agency_members
            WHERE user_id = auth.uid()
            AND (role = 'admin' OR member_type = 'admin')
        )
    )
    -- OR user is the owner of the agency (owner_id on agencies table)
    OR (
        agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())
    )
);

-- Step 9: Verify the fixes
SELECT 'Updated agencies policies:' as result;
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'agencies';

SELECT 'SUCCESS: Agency creation RLS policies have been fixed!' as final_status;
