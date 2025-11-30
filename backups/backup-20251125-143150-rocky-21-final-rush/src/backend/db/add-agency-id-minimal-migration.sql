-- ========================================
-- ADD AGENCY_ID TO MINIMAL CORE TABLES ONLY
-- Ultra-safe migration for ONLY tables that exist
-- ========================================
--
-- This migration adds agency_id ONLY to the core tables:
--  ✅ leads
--  ✅ contacts
--  ✅ opportunities
--
-- These are the absolute minimum tables needed for agency isolation
-- ========================================

-- ========================================
-- 1. ADD AGENCY_ID TO MINIMAL CORE TABLES
-- ========================================

-- Leads table
ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_leads_agency_id ON public.leads(agency_id);

-- Contacts table
ALTER TABLE IF EXISTS public.contacts
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_contacts_agency_id ON public.contacts(agency_id);

-- Opportunities table
ALTER TABLE IF EXISTS public.opportunities
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_opportunities_agency_id ON public.opportunities(agency_id);

-- ========================================
-- 2. UPDATE RLS POLICIES FOR MINIMAL CORE TABLES
-- ========================================

-- ==================
-- LEADS POLICIES
-- ==================
DROP POLICY IF EXISTS "Authenticated users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view agency leads" ON public.leads;
CREATE POLICY "Users can view agency leads"
  ON public.leads FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert agency leads" ON public.leads;
CREATE POLICY "Users can insert agency leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update agency leads" ON public.leads;
CREATE POLICY "Users can update agency leads"
  ON public.leads FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can delete their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete agency leads" ON public.leads;
CREATE POLICY "Users can delete agency leads"
  ON public.leads FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role = 'admin'
    )
  );

-- ==================
-- CONTACTS POLICIES
-- ==================
DROP POLICY IF EXISTS "Authenticated users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can view agency contacts" ON public.contacts;
CREATE POLICY "Users can view agency contacts"
  ON public.contacts FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert agency contacts" ON public.contacts;
CREATE POLICY "Users can insert agency contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update agency contacts" ON public.contacts;
CREATE POLICY "Users can update agency contacts"
  ON public.contacts FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can delete their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete agency contacts" ON public.contacts;
CREATE POLICY "Users can delete agency contacts"
  ON public.contacts FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role = 'admin'
    )
  );

-- ==================
-- OPPORTUNITIES POLICIES
-- ==================
DROP POLICY IF EXISTS "Authenticated users can view their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can view agency opportunities" ON public.opportunities;
CREATE POLICY "Users can view agency opportunities"
  ON public.opportunities FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can insert agency opportunities" ON public.opportunities;
CREATE POLICY "Users can insert agency opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can update agency opportunities" ON public.opportunities;
CREATE POLICY "Users can update agency opportunities"
  ON public.opportunities FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can delete their own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Users can delete agency opportunities" ON public.opportunities;
CREATE POLICY "Users can delete agency opportunities"
  ON public.opportunities FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role = 'admin'
    )
  );

-- ========================================
-- 3. HELPER FUNCTION FOR CURRENT AGENCY
-- ========================================

-- Function to get current agency ID for logged-in user
CREATE OR REPLACE FUNCTION public.get_user_current_agency()
RETURNS UUID AS $$
DECLARE
  v_agency_id UUID;
BEGIN
  SELECT current_agency_id INTO v_agency_id
  FROM public.user_agency_preferences
  WHERE user_id = auth.uid();

  RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ MINIMAL AGENCY_ID MIGRATION COMPLETE!';
  RAISE NOTICE '   Added agency_id column to core CRM tables';
  RAISE NOTICE '   Updated RLS policies for agency isolation';
  RAISE NOTICE '   Created helper function: get_user_current_agency()';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables updated:';
  RAISE NOTICE '   ✅ leads';
  RAISE NOTICE '   ✅ contacts';
  RAISE NOTICE '   ✅ opportunities';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: All NEW records must include agency_id!';
  RAISE NOTICE '   Update your API endpoints to include currentAgency.id';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Update backend API routes to include agency_id for leads/contacts/opportunities';
  RAISE NOTICE '   2. Test data isolation by switching agencies';
  RAISE NOTICE '   3. Deploy supabase-schema.sql for additional tables (emails, etc.)';
  RAISE NOTICE '   4. Then run migrations for those tables';
END $$;
