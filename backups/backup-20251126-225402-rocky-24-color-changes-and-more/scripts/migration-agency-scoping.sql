-- =============================================
-- MIGRATION: Add Agency Scoping to CRM Tables
-- Run in Supabase SQL Editor
-- This enables multi-agency data isolation with role-based visibility
-- =============================================

-- =============================================
-- STEP 1: Add agency_id columns to CRM tables
-- =============================================

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

-- Add agency_id to activities (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities' AND table_schema = 'public') THEN
        ALTER TABLE public.activities
        ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================
-- STEP 2: Create indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON public.leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_agency_user ON public.leads(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agency_id ON public.contacts(agency_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agency_user ON public.contacts(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_agency_id ON public.opportunities(agency_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_agency_user ON public.opportunities(agency_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_agency_id ON public.user_todos(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_agency_user ON public.user_todos(agency_id, user_id);

-- =============================================
-- STEP 3: Backfill existing data with agency_id
-- Sets agency_id from user's first/primary agency
-- =============================================

-- Backfill leads
UPDATE public.leads l
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = l.user_id
    AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC
    LIMIT 1
)
WHERE l.agency_id IS NULL;

-- Backfill contacts
UPDATE public.contacts c
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = c.user_id
    AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC
    LIMIT 1
)
WHERE c.agency_id IS NULL;

-- Backfill opportunities
UPDATE public.opportunities o
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = o.user_id
    AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC
    LIMIT 1
)
WHERE o.agency_id IS NULL;

-- Backfill user_todos
UPDATE public.user_todos t
SET agency_id = (
    SELECT am.agency_id
    FROM public.agency_members am
    WHERE am.user_id = t.user_id
    AND am.invitation_status = 'active'
    ORDER BY am.joined_at ASC
    LIMIT 1
)
WHERE t.agency_id IS NULL;

-- =============================================
-- STEP 4: Create helper function for role checks
-- =============================================

-- Function to check if user is admin/owner in an agency
CREATE OR REPLACE FUNCTION public.is_agency_admin_or_owner(p_agency_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.agency_members
        WHERE agency_id = p_agency_id
        AND user_id = p_user_id
        AND invitation_status = 'active'
        AND (
            role IN ('admin', 'owner')
            OR member_type IN ('admin', 'owner')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a member of an agency
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_agency_admin_or_owner(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_agency_member(UUID, UUID) TO authenticated;

-- =============================================
-- STEP 5: Update RLS policies for LEADS
-- Rule: Owner/Admin see ALL agency leads, Seated Users see only their own
-- =============================================

-- Drop old user-only policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
DROP POLICY IF EXISTS "Role-based lead visibility" ON public.leads;

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- SELECT: Admin/Owner see all agency leads, others see only their own
CREATE POLICY "leads_role_based_select" ON public.leads
FOR SELECT TO authenticated
USING (
    -- User must be in the agency
    public.is_agency_member(agency_id, auth.uid())
    AND (
        -- Admin/Owner can see ALL leads in agency
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        -- OR user can see their own leads
        OR user_id = auth.uid()
    )
);

-- INSERT: Any agency member can create leads (in their agency, owned by them)
CREATE POLICY "leads_insert_in_agency" ON public.leads
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

-- UPDATE: Admin/Owner can update any lead, others only their own
CREATE POLICY "leads_role_based_update" ON public.leads
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
)
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
);

-- DELETE: Admin/Owner can delete any lead, others only their own
CREATE POLICY "leads_role_based_delete" ON public.leads
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

-- =============================================
-- STEP 6: Update RLS policies for CONTACTS
-- Same pattern as leads
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "contacts_select_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_insert_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_update_policy" ON public.contacts;
DROP POLICY IF EXISTS "contacts_delete_policy" ON public.contacts;

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "contacts_role_based_select" ON public.contacts
FOR SELECT TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

-- INSERT
CREATE POLICY "contacts_insert_in_agency" ON public.contacts
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

-- UPDATE
CREATE POLICY "contacts_role_based_update" ON public.contacts
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
)
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
);

-- DELETE
CREATE POLICY "contacts_role_based_delete" ON public.contacts
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

-- =============================================
-- STEP 7: Update RLS policies for OPPORTUNITIES
-- Same pattern as leads
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can insert their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can delete their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_select_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_insert_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_update_policy" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_delete_policy" ON public.opportunities;

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "opportunities_role_based_select" ON public.opportunities
FOR SELECT TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

-- INSERT
CREATE POLICY "opportunities_insert_in_agency" ON public.opportunities
FOR INSERT TO authenticated
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
    AND user_id = auth.uid()
);

-- UPDATE
CREATE POLICY "opportunities_role_based_update" ON public.opportunities
FOR UPDATE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
)
WITH CHECK (
    public.is_agency_member(agency_id, auth.uid())
);

-- DELETE
CREATE POLICY "opportunities_role_based_delete" ON public.opportunities
FOR DELETE TO authenticated
USING (
    public.is_agency_member(agency_id, auth.uid())
    AND (
        public.is_agency_admin_or_owner(agency_id, auth.uid())
        OR user_id = auth.uid()
    )
);

-- =============================================
-- STEP 8: Update RLS policies for USER_TODOS
-- Same pattern as leads
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_select_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_insert_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_update_policy" ON public.user_todos;
DROP POLICY IF EXISTS "user_todos_delete_policy" ON public.user_todos;

-- Enable RLS
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "todos_role_based_select" ON public.user_todos
FOR SELECT TO authenticated
USING (
    -- Allow if agency_id is null (legacy data) and user owns it
    (agency_id IS NULL AND user_id = auth.uid())
    OR (
        -- Or agency-scoped with role-based access
        agency_id IS NOT NULL
        AND public.is_agency_member(agency_id, auth.uid())
        AND (
            public.is_agency_admin_or_owner(agency_id, auth.uid())
            OR user_id = auth.uid()
        )
    )
);

-- INSERT
CREATE POLICY "todos_insert_in_agency" ON public.user_todos
FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND (
        agency_id IS NULL
        OR public.is_agency_member(agency_id, auth.uid())
    )
);

-- UPDATE
CREATE POLICY "todos_role_based_update" ON public.user_todos
FOR UPDATE TO authenticated
USING (
    (agency_id IS NULL AND user_id = auth.uid())
    OR (
        agency_id IS NOT NULL
        AND public.is_agency_member(agency_id, auth.uid())
        AND (
            public.is_agency_admin_or_owner(agency_id, auth.uid())
            OR user_id = auth.uid()
        )
    )
)
WITH CHECK (user_id = auth.uid());

-- DELETE
CREATE POLICY "todos_role_based_delete" ON public.user_todos
FOR DELETE TO authenticated
USING (
    (agency_id IS NULL AND user_id = auth.uid())
    OR (
        agency_id IS NOT NULL
        AND public.is_agency_member(agency_id, auth.uid())
        AND (
            public.is_agency_admin_or_owner(agency_id, auth.uid())
            OR user_id = auth.uid()
        )
    )
);

-- =============================================
-- STEP 9: Grant permissions
-- =============================================

GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.contacts TO authenticated;
GRANT ALL ON public.opportunities TO authenticated;
GRANT ALL ON public.user_todos TO authenticated;

GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.contacts TO service_role;
GRANT ALL ON public.opportunities TO service_role;
GRANT ALL ON public.user_todos TO service_role;

-- =============================================
-- VERIFICATION
-- =============================================

SELECT 'Migration complete! Agency scoping added to CRM tables.' as status;

-- Show counts
SELECT
    'leads' as table_name,
    COUNT(*) as total,
    COUNT(agency_id) as with_agency,
    COUNT(*) - COUNT(agency_id) as without_agency
FROM public.leads
UNION ALL
SELECT
    'contacts' as table_name,
    COUNT(*) as total,
    COUNT(agency_id) as with_agency,
    COUNT(*) - COUNT(agency_id) as without_agency
FROM public.contacts
UNION ALL
SELECT
    'opportunities' as table_name,
    COUNT(*) as total,
    COUNT(agency_id) as with_agency,
    COUNT(*) - COUNT(agency_id) as without_agency
FROM public.opportunities;
