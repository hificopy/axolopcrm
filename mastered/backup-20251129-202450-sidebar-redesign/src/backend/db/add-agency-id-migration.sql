-- ========================================
-- ADD AGENCY_ID TO ALL CRM TABLES
-- Migration script to add agency isolation
-- ========================================

-- ========================================
-- 1. ADD AGENCY_ID COLUMNS
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

-- Forms table
ALTER TABLE IF EXISTS public.forms
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_forms_agency_id ON public.forms(agency_id);

-- Form submissions table
ALTER TABLE IF EXISTS public.form_submissions
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_form_submissions_agency_id ON public.form_submissions(agency_id);

-- Workflows table
ALTER TABLE IF EXISTS public.workflows
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_workflows_agency_id ON public.workflows(agency_id);

-- Workflow executions table
ALTER TABLE IF EXISTS public.workflow_executions
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_workflow_executions_agency_id ON public.workflow_executions(agency_id);

-- Email campaigns table
ALTER TABLE IF EXISTS public.email_campaigns
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_agency_id ON public.email_campaigns(agency_id);

-- Email templates table
ALTER TABLE IF EXISTS public.email_templates
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_email_templates_agency_id ON public.email_templates(agency_id);

-- Calendar events table
ALTER TABLE IF EXISTS public.calendar_events
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_calendar_events_agency_id ON public.calendar_events(agency_id);

-- Tasks table
ALTER TABLE IF EXISTS public.tasks
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tasks_agency_id ON public.tasks(agency_id);

-- Notes table
ALTER TABLE IF EXISTS public.notes
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notes_agency_id ON public.notes(agency_id);

-- Activities table
ALTER TABLE IF EXISTS public.activities
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_activities_agency_id ON public.activities(agency_id);

-- Pipelines table
ALTER TABLE IF EXISTS public.pipelines
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_pipelines_agency_id ON public.pipelines(agency_id);

-- Custom fields table
ALTER TABLE IF EXISTS public.custom_fields
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_custom_fields_agency_id ON public.custom_fields(agency_id);

-- Booking links table
ALTER TABLE IF EXISTS public.booking_links
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_booking_links_agency_id ON public.booking_links(agency_id);

-- ========================================
-- 2. UPDATE RLS POLICIES FOR AGENCY ISOLATION
-- ========================================

-- Drop existing policies (if any) and recreate with agency filtering

-- Leads policies
DROP POLICY IF EXISTS "Users can view leads" ON public.leads;
CREATE POLICY "Users can view agency leads"
  ON public.leads FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
CREATE POLICY "Users can insert agency leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update leads" ON public.leads;
CREATE POLICY "Users can update agency leads"
  ON public.leads FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can delete leads" ON public.leads;
CREATE POLICY "Users can delete agency leads"
  ON public.leads FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role = 'admin'
    )
  );

-- Contacts policies
DROP POLICY IF EXISTS "Users can view contacts" ON public.contacts;
CREATE POLICY "Users can view agency contacts"
  ON public.contacts FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert contacts" ON public.contacts;
CREATE POLICY "Users can insert agency contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update contacts" ON public.contacts;
CREATE POLICY "Users can update agency contacts"
  ON public.contacts FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can delete contacts" ON public.contacts;
CREATE POLICY "Users can delete agency contacts"
  ON public.contacts FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role = 'admin'
    )
  );

-- Opportunities policies
DROP POLICY IF EXISTS "Users can view opportunities" ON public.opportunities;
CREATE POLICY "Users can view agency opportunities"
  ON public.opportunities FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can insert opportunities" ON public.opportunities;
CREATE POLICY "Users can insert agency opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update opportunities" ON public.opportunities;
CREATE POLICY "Users can update agency opportunities"
  ON public.opportunities FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can delete opportunities" ON public.opportunities;
CREATE POLICY "Users can delete agency opportunities"
  ON public.opportunities FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role = 'admin'
    )
  );

-- Forms policies
DROP POLICY IF EXISTS "Users can view forms" ON public.forms;
CREATE POLICY "Users can view agency forms"
  ON public.forms FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
    OR is_public = true  -- Allow public forms to be viewed by anyone
  );

DROP POLICY IF EXISTS "Users can insert forms" ON public.forms;
CREATE POLICY "Users can insert agency forms"
  ON public.forms FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can update forms" ON public.forms;
CREATE POLICY "Users can update agency forms"
  ON public.forms FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id FROM public.agency_members
      WHERE user_id = auth.uid() AND invitation_status = 'active'
      AND role IN ('admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Users can delete forms" ON public.forms;
CREATE POLICY "Users can delete agency forms"
  ON public.forms FOR DELETE
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
  RAISE NOTICE '✅ AGENCY_ID MIGRATION COMPLETE!';
  RAISE NOTICE '   Added agency_id column to all CRM tables';
  RAISE NOTICE '   Updated RLS policies for agency isolation';
  RAISE NOTICE '   Created helper function: get_user_current_agency()';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: All NEW records must include agency_id!';
  RAISE NOTICE '   Update your API endpoints to include currentAgency.id';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '   1. Update all backend API routes to include agency_id';
  RAISE NOTICE '   2. Test data isolation by switching agencies';
  RAISE NOTICE '   3. Verify RLS policies are working';
END $$;
