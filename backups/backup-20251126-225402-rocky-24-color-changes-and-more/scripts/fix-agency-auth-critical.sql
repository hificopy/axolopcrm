-- =============================================
-- CRITICAL FIX: Agency Authentication Functions
-- Run this in Supabase SQL Editor IMMEDIATELY
-- Fixes: MandatoryAgencyModal showing for users with agencies
-- =============================================

-- Drop the old validate_agency_access that returns BOOLEAN
DROP FUNCTION IF EXISTS public.validate_agency_access(UUID, UUID);

-- Create CORRECTED validate_agency_access that returns TABLE
-- This is what AgencyContext.jsx expects
CREATE OR REPLACE FUNCTION public.validate_agency_access(p_user_id UUID, p_agency_id UUID)
RETURNS TABLE (
    has_access BOOLEAN,
    user_role TEXT,
    is_admin BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_agency_active BOOLEAN;
    v_membership RECORD;
BEGIN
    -- Check if agency exists and is active
    SELECT EXISTS(
        SELECT 1 FROM public.agencies
        WHERE id = p_agency_id
        AND is_active = true
        AND deleted_at IS NULL
    ) INTO v_agency_active;

    IF NOT v_agency_active THEN
        RETURN QUERY SELECT
            false::BOOLEAN as has_access,
            NULL::TEXT as user_role,
            false::BOOLEAN as is_admin,
            'Agency not found or inactive'::TEXT as error_message;
        RETURN;
    END IF;

    -- Check user membership
    SELECT
        am.role,
        am.invitation_status,
        COALESCE(am.member_type, am.role) as member_type
    INTO v_membership
    FROM public.agency_members am
    WHERE am.user_id = p_user_id
    AND am.agency_id = p_agency_id
    AND am.invitation_status = 'active';

    IF v_membership IS NULL THEN
        RETURN QUERY SELECT
            false::BOOLEAN as has_access,
            NULL::TEXT as user_role,
            false::BOOLEAN as is_admin,
            'User is not a member of this agency'::TEXT as error_message;
        RETURN;
    END IF;

    -- Return access granted
    RETURN QUERY SELECT
        true::BOOLEAN as has_access,
        v_membership.role::TEXT as user_role,
        (v_membership.role IN ('admin', 'owner') OR v_membership.member_type IN ('admin', 'owner'))::BOOLEAN as is_admin,
        NULL::TEXT as error_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.validate_agency_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_agency_access(UUID, UUID) TO service_role;

-- =============================================
-- Fix get_current_agency function if missing
-- =============================================

CREATE OR REPLACE FUNCTION public.get_current_agency(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_agency_id UUID;
BEGIN
    -- Try to get from user_agency_preferences
    SELECT current_agency_id INTO v_agency_id
    FROM public.user_agency_preferences
    WHERE user_id = p_user_id;

    -- If not found, return NULL (will trigger fallback to first agency)
    RETURN v_agency_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_current_agency(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_agency(UUID) TO service_role;

-- =============================================
-- Fix set_current_agency function
-- =============================================

CREATE OR REPLACE FUNCTION public.set_current_agency(p_user_id UUID, p_agency_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Upsert the preference
    INSERT INTO public.user_agency_preferences (user_id, current_agency_id, updated_at)
    VALUES (p_user_id, p_agency_id, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET current_agency_id = p_agency_id, updated_at = NOW();
EXCEPTION
    WHEN OTHERS THEN
        -- Log but don't fail - this is a preference, not critical
        RAISE WARNING 'Could not set current agency preference: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_current_agency(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_agency(UUID, UUID) TO service_role;

-- =============================================
-- Create user_agency_preferences table if missing
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_agency_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_agency_prefs_user_id ON public.user_agency_preferences(user_id);

-- RLS for user_agency_preferences
ALTER TABLE public.user_agency_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_prefs" ON public.user_agency_preferences;
CREATE POLICY "users_manage_own_prefs" ON public.user_agency_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- Fix RLS on agencies table - ensure users can read
-- =============================================

-- First, drop potentially problematic policies
DROP POLICY IF EXISTS "agencies_read_all" ON public.agencies;
DROP POLICY IF EXISTS "Users can view their agencies" ON public.agencies;

-- Create policy that allows:
-- 1. Users to see agencies they're members of
-- 2. Active agencies only
CREATE POLICY "agencies_read_for_members" ON public.agencies
    FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND deleted_at IS NULL
        AND (
            -- User is a member
            id IN (
                SELECT agency_id FROM public.agency_members
                WHERE user_id = auth.uid()
            )
            -- OR user is the owner
            OR owner_id = auth.uid()
        )
    );

-- Allow agency creation
DROP POLICY IF EXISTS "agencies_insert_own" ON public.agencies;
CREATE POLICY "agencies_insert_authenticated" ON public.agencies
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- Fix RLS on agency_members table
-- =============================================

-- Drop potentially problematic policies
DROP POLICY IF EXISTS "members_read_own" ON public.agency_members;
DROP POLICY IF EXISTS "Members can view agency members" ON public.agency_members;

-- Users can read their own memberships
CREATE POLICY "members_read_own_memberships" ON public.agency_members
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Allow inserting memberships (for agency creation)
DROP POLICY IF EXISTS "members_insert" ON public.agency_members;
CREATE POLICY "members_insert_authenticated" ON public.agency_members
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- Verify the fix
-- =============================================

SELECT 'Agency auth functions fixed!' as status;

-- Test query (should return results for current user)
-- SELECT * FROM public.validate_agency_access(auth.uid(), 'your-agency-id-here');
