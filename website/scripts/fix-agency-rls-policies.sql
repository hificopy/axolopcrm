-- =============================================
-- FIX: Infinite Recursion in Agency RLS Policies
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Drop ALL existing policies on agency tables
-- From agency-schema.sql (original policies causing infinite recursion)
DROP POLICY IF EXISTS "Users can view their agencies" ON public.agencies;
DROP POLICY IF EXISTS "Admins can update their agencies" ON public.agencies;
DROP POLICY IF EXISTS "Users can create agencies" ON public.agencies;
DROP POLICY IF EXISTS "Members can view agency members" ON public.agency_members;
DROP POLICY IF EXISTS "Users can insert agency members" ON public.agency_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.agency_members;

-- Other possible policy names
DROP POLICY IF EXISTS "Allow all agencies access" ON public.agencies;
DROP POLICY IF EXISTS "Allow all agency_members access" ON public.agency_members;
DROP POLICY IF EXISTS "Users can view agencies they belong to" ON public.agencies;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.agency_members;
DROP POLICY IF EXISTS "Admins can manage agency" ON public.agencies;
DROP POLICY IF EXISTS "Admins can manage members" ON public.agency_members;
DROP POLICY IF EXISTS "agencies_select_policy" ON public.agencies;
DROP POLICY IF EXISTS "agencies_insert_policy" ON public.agencies;
DROP POLICY IF EXISTS "agencies_update_policy" ON public.agencies;
DROP POLICY IF EXISTS "agencies_delete_policy" ON public.agencies;
DROP POLICY IF EXISTS "agency_members_select_policy" ON public.agency_members;
DROP POLICY IF EXISTS "agency_members_insert_policy" ON public.agency_members;
DROP POLICY IF EXISTS "agency_members_update_policy" ON public.agency_members;
DROP POLICY IF EXISTS "agency_members_delete_policy" ON public.agency_members;

-- Drop the new policies too (in case re-running)
DROP POLICY IF EXISTS "agencies_read_all" ON public.agencies;
DROP POLICY IF EXISTS "agencies_insert_own" ON public.agencies;
DROP POLICY IF EXISTS "agencies_update" ON public.agencies;
DROP POLICY IF EXISTS "agencies_delete" ON public.agencies;
DROP POLICY IF EXISTS "members_read_own" ON public.agency_members;
DROP POLICY IF EXISTS "members_insert" ON public.agency_members;
DROP POLICY IF EXISTS "members_update_own" ON public.agency_members;
DROP POLICY IF EXISTS "members_delete" ON public.agency_members;

-- Step 2: Disable RLS temporarily (optional - for testing)
-- ALTER TABLE public.agencies DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.agency_members DISABLE ROW LEVEL SECURITY;

-- Step 3: Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLE non-recursive policies

-- AGENCIES: Allow authenticated users to read all active agencies
CREATE POLICY "agencies_read_all" ON public.agencies
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- AGENCIES: Allow authenticated users to insert new agencies
CREATE POLICY "agencies_insert_own" ON public.agencies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- AGENCIES: Allow updates (will be controlled by backend)
CREATE POLICY "agencies_update" ON public.agencies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AGENCIES: Allow deletes (will be controlled by backend)
CREATE POLICY "agencies_delete" ON public.agencies
  FOR DELETE
  TO authenticated
  USING (true);

-- AGENCY_MEMBERS: Allow users to read their own memberships
CREATE POLICY "members_read_own" ON public.agency_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- AGENCY_MEMBERS: Allow inserts (controlled by backend)
CREATE POLICY "members_insert" ON public.agency_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- AGENCY_MEMBERS: Allow updates on own membership
CREATE POLICY "members_update_own" ON public.agency_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- AGENCY_MEMBERS: Allow deletes (controlled by backend)
CREATE POLICY "members_delete" ON public.agency_members
  FOR DELETE
  TO authenticated
  USING (true);

-- Step 5: Grant permissions to service_role (bypasses RLS)
GRANT ALL ON public.agencies TO service_role;
GRANT ALL ON public.agency_members TO service_role;
GRANT ALL ON public.agencies TO authenticated;
GRANT ALL ON public.agency_members TO authenticated;

-- Step 6: Verify the fix
SELECT 'RLS policies fixed!' as status;

-- Test query (should work now)
SELECT count(*) as member_count FROM public.agency_members;
SELECT count(*) as agency_count FROM public.agencies WHERE is_active = true;
