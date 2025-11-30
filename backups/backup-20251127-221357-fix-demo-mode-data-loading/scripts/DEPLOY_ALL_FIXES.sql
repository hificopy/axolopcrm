-- =============================================
-- COMPREHENSIVE FIX DEPLOYMENT
-- Run this script in Supabase SQL Editor
-- =============================================

-- ============================================
-- PART 1: FIX AGENCY AUTH FUNCTIONS (Critical)
-- ============================================

-- Drop the old validate_agency_access that returns BOOLEAN
DROP FUNCTION IF EXISTS public.validate_agency_access(UUID, UUID);

-- Create CORRECTED validate_agency_access that returns TABLE
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

-- Fix get_current_agency function
CREATE OR REPLACE FUNCTION public.get_current_agency(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_agency_id UUID;
BEGIN
    SELECT current_agency_id INTO v_agency_id
    FROM public.user_agency_preferences
    WHERE user_id = p_user_id;
    RETURN v_agency_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_current_agency(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_agency(UUID) TO service_role;

-- Fix set_current_agency function
CREATE OR REPLACE FUNCTION public.set_current_agency(p_user_id UUID, p_agency_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_agency_preferences (user_id, current_agency_id, updated_at)
    VALUES (p_user_id, p_agency_id, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET current_agency_id = p_agency_id, updated_at = NOW();
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not set current agency preference: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.set_current_agency(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_agency(UUID, UUID) TO service_role;

-- Create user_agency_preferences table if missing
CREATE TABLE IF NOT EXISTS public.user_agency_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_agency_prefs_user_id ON public.user_agency_preferences(user_id);

ALTER TABLE public.user_agency_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_prefs" ON public.user_agency_preferences;
CREATE POLICY "users_manage_own_prefs" ON public.user_agency_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- PART 2: ADD AGENCY_ID COLUMNS TO ALL CRM TABLES
-- (Must be done BEFORE creating RLS policies that reference agency_id)
-- ============================================

-- Add agency_id to leads
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

-- Add agency_id to contacts
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

-- Add agency_id to opportunities
ALTER TABLE public.opportunities
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

-- Add agency_id to user_todos
ALTER TABLE public.user_todos
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

-- ============================================
-- PART 3: CREATE INDEXES FOR AGENCY_ID
-- ============================================

-- Create indexes for agency_id
CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON public.leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agency_id ON public.contacts(agency_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_agency_id ON public.opportunities(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_agency_id ON public.user_todos(agency_id);

-- Create composite indexes for agency_id + user_id
CREATE INDEX IF NOT EXISTS idx_leads_agency_user ON public.leads(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agency_user ON public.contacts(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_agency_user ON public.opportunities(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_agency_user ON public.user_todos(agency_id, user_id);

-- ============================================
-- PART 4: BACKFILL EXISTING DATA WITH AGENCY_ID
-- ============================================

-- Backfill leads with user's primary agency
UPDATE public.leads l
SET agency_id = (
    SELECT am.agency_id FROM public.agency_members am
    WHERE am.user_id = l.user_id AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC LIMIT 1
) WHERE l.agency_id IS NULL AND l.user_id IS NOT NULL;

-- Backfill contacts with user's primary agency
UPDATE public.contacts c
SET agency_id = (
    SELECT am.agency_id FROM public.agency_members am
    WHERE am.user_id = c.user_id AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC LIMIT 1
) WHERE c.agency_id IS NULL AND c.user_id IS NOT NULL;

-- Backfill opportunities with user's primary agency
UPDATE public.opportunities o
SET agency_id = (
    SELECT am.agency_id FROM public.agency_members am
    WHERE am.user_id = o.user_id AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC LIMIT 1
) WHERE o.agency_id IS NULL AND o.user_id IS NOT NULL;

-- Backfill user_todos with user's primary agency
UPDATE public.user_todos t
SET agency_id = (
    SELECT am.agency_id FROM public.agency_members am
    WHERE am.user_id = t.user_id AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC LIMIT 1
) WHERE t.agency_id IS NULL AND t.user_id IS NOT NULL;

-- ============================================
-- PART 5: CREATE ROLE-BASED ACCESS HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_agency_admin_or_owner(p_agency_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.agency_members
        WHERE agency_id = p_agency_id
        AND user_id = p_user_id
        AND invitation_status = 'active'
        AND (role IN ('admin', 'owner') OR member_type IN ('admin', 'owner'))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_agency_member(p_agency_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.agency_members
        WHERE agency_id = p_agency_id
        AND user_id = p_user_id
        AND invitation_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_agency_admin_or_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_agency_member(UUID, UUID) TO authenticated;

-- ============================================
-- PART 6: DROP ALL OLD RLS POLICIES
-- (Must drop before creating new ones)
-- ============================================

-- Drop old leads policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_role_based_select" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_in_agency" ON public.leads;
DROP POLICY IF EXISTS "leads_role_based_update" ON public.leads;
DROP POLICY IF EXISTS "leads_role_based_delete" ON public.leads;

-- Drop old contacts policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_role_based_select" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_in_agency" ON public.contacts;
DROP POLICY IF EXISTS "contacts_role_based_update" ON public.contacts;
DROP POLICY IF EXISTS "contacts_role_based_delete" ON public.contacts;

-- Drop old opportunities policies
DROP POLICY IF EXISTS "Users can view their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can insert their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can delete their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_select_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_insert_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_update_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_delete_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_role_based_select" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_insert_in_agency" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_role_based_update" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_role_based_delete" ON public.opportunities;

-- Drop old user_todos policies
DROP POLICY IF EXISTS "Users can manage their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can view their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_select_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_insert_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_update_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_delete_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_role_based_select" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_insert_in_agency" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_role_based_update" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_role_based_delete" ON public.user_todos;

-- Drop old agencies policies
DROP POLICY IF EXISTS "agencies_read_all" ON public.agencies;
DROP POLICY IF EXISTS "Users can view their agencies" ON public.agencies;
DROP POLICY IF EXISTS "agencies_read_for_members" ON public.agencies;
DROP POLICY IF EXISTS "agencies_insert_own" ON public.agencies;
DROP POLICY IF EXISTS "agencies_insert_authenticated" ON public.agencies;

-- Drop old agency_members policies
DROP POLICY IF EXISTS "members_read_own" ON public.agency_members;
DROP POLICY IF EXISTS "members_read_own_memberships" ON public.agency_members;
DROP POLICY IF EXISTS "members_insert" ON public.agency_members;
DROP POLICY IF EXISTS "members_insert_authenticated" ON public.agency_members;

-- ============================================
-- PART 7: ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 8: CREATE NEW ROLE-BASED RLS POLICIES FOR LEADS
-- Owner/Admin see all agency leads, Seated Users see only their own
-- ============================================

CREATE POLICY "leads_role_based_select" ON public.leads
FOR SELECT TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

CREATE POLICY "leads_insert_in_agency" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

CREATE POLICY "leads_role_based_update" ON public.leads
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
)
WITH CHECK (public.is_agency_member(agency_id, auth.uid()));

CREATE POLICY "leads_role_based_delete" ON public.leads
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
);

-- ============================================
-- PART 9: CREATE NEW ROLE-BASED RLS POLICIES FOR CONTACTS
-- ============================================

CREATE POLICY "contacts_role_based_select" ON public.contacts
FOR SELECT TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

CREATE POLICY "contacts_insert_in_agency" ON public.contacts
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

CREATE POLICY "contacts_role_based_update" ON public.contacts
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
)
WITH CHECK (public.is_agency_member(agency_id, auth.uid()));

CREATE POLICY "contacts_role_based_delete" ON public.contacts
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
);

-- ============================================
-- PART 10: CREATE NEW ROLE-BASED RLS POLICIES FOR OPPORTUNITIES
-- ============================================

CREATE POLICY "opportunities_role_based_select" ON public.opportunities
FOR SELECT TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
);

CREATE POLICY "opportunities_insert_in_agency" ON public.opportunities
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

CREATE POLICY "opportunities_role_based_update" ON public.opportunities
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
)
WITH CHECK (public.is_agency_member(agency_id, auth.uid()));

CREATE POLICY "opportunities_role_based_delete" ON public.opportunities
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
);

-- ============================================
-- PART 11: CREATE NEW ROLE-BASED RLS POLICIES FOR USER_TODOS
-- ============================================

CREATE POLICY "user_todos_role_based_select" ON public.user_todos
FOR SELECT TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
);

CREATE POLICY "user_todos_insert_in_agency" ON public.user_todos
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

CREATE POLICY "user_todos_role_based_update" ON public.user_todos
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
)
WITH CHECK (public.is_agency_member(agency_id, auth.uid()));

CREATE POLICY "user_todos_role_based_delete" ON public.user_todos
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (public.is_agency_admin_or_owner(agency_id, auth.uid()) OR user_id = auth.uid())
);

-- ============================================
-- PART 12: CREATE RLS POLICIES FOR AGENCIES TABLE
-- ============================================

CREATE POLICY "agencies_read_for_members" ON public.agencies
    FOR SELECT TO authenticated
    USING (
        is_active = true AND deleted_at IS NULL
        AND (
            id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
            OR owner_id = auth.uid()
        )
    );

CREATE POLICY "agencies_insert_authenticated" ON public.agencies
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- PART 13: CREATE RLS POLICIES FOR AGENCY_MEMBERS TABLE
-- ============================================

CREATE POLICY "members_read_own_memberships" ON public.agency_members
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "members_insert_authenticated" ON public.agency_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- FINAL VERIFICATION
-- ============================================

SELECT 'ALL FIXES DEPLOYED SUCCESSFULLY!' as status;

-- Verify table columns have agency_id
SELECT
    'leads' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency
FROM public.leads
UNION ALL
SELECT
    'contacts' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency
FROM public.contacts
UNION ALL
SELECT
    'opportunities' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency
FROM public.opportunities
UNION ALL
SELECT
    'user_todos' as table_name,
    COUNT(*) as total_records,
    COUNT(agency_id) as records_with_agency
FROM public.user_todos;
