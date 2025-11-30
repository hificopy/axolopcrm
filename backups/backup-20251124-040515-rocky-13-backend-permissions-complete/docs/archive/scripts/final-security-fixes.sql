-- =====================================================
-- FINAL SECURITY FIXES FOR V1 LAUNCH
-- Handles edge cases and alternative user columns
-- =====================================================

DO $$
BEGIN
  -- =====================================================
  -- 1. Handle tables with created_by instead of user_id
  -- =====================================================

  -- Forms table: Add user_id and copy from created_by
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forms') THEN
    -- Add user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'user_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'created_by') THEN
        -- Add user_id column
        ALTER TABLE public.forms ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Copy data from created_by to user_id
        UPDATE public.forms SET user_id = created_by WHERE created_by IS NOT NULL;

        -- Make user_id NOT NULL after copying data
        ALTER TABLE public.forms ALTER COLUMN user_id SET NOT NULL;

        -- Create index
        CREATE INDEX IF NOT EXISTS idx_forms_user_id ON public.forms(user_id);

        -- Enable RLS if not already
        ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

        -- Create policies
        DROP POLICY IF EXISTS "users_select_own_forms" ON public.forms;
        DROP POLICY IF EXISTS "users_insert_own_forms" ON public.forms;
        DROP POLICY IF EXISTS "users_update_own_forms" ON public.forms;
        DROP POLICY IF EXISTS "users_delete_own_forms" ON public.forms;

        CREATE POLICY "users_select_own_forms" ON public.forms
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "users_insert_own_forms" ON public.forms
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "users_update_own_forms" ON public.forms
          FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "users_delete_own_forms" ON public.forms
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE '✅ Fixed forms table: added user_id from created_by';
      END IF;
    END IF;
  END IF;

  -- =====================================================
  -- 2. Handle form_responses special case (needs owner access)
  -- =====================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_responses') THEN
    -- Enable RLS
    ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

    -- Drop old policies
    DROP POLICY IF EXISTS "users_select_own_form_responses" ON public.form_responses;
    DROP POLICY IF EXISTS "public_insert_form_responses" ON public.form_responses;
    DROP POLICY IF EXISTS "users_update_own_form_responses" ON public.form_responses;
    DROP POLICY IF EXISTS "users_delete_own_form_responses" ON public.form_responses;

    -- Users can see responses to their forms OR their own submissions
    CREATE POLICY "users_select_own_form_responses" ON public.form_responses
      FOR SELECT USING (
        auth.uid() = user_id
        OR
        EXISTS (
          SELECT 1 FROM public.forms
          WHERE forms.id = form_responses.form_id
          AND forms.user_id = auth.uid()
        )
      );

    -- Allow public form submissions (anonymous users)
    CREATE POLICY "public_insert_form_responses" ON public.form_responses
      FOR INSERT WITH CHECK (true);

    -- Users can update their own submissions OR form owners can update
    CREATE POLICY "users_update_own_form_responses" ON public.form_responses
      FOR UPDATE USING (
        auth.uid() = user_id
        OR
        EXISTS (
          SELECT 1 FROM public.forms
          WHERE forms.id = form_responses.form_id
          AND forms.user_id = auth.uid()
        )
      );

    -- Users can delete their own submissions OR form owners can delete
    CREATE POLICY "users_delete_own_form_responses" ON public.form_responses
      FOR DELETE USING (
        auth.uid() = user_id
        OR
        EXISTS (
          SELECT 1 FROM public.forms
          WHERE forms.id = form_responses.form_id
          AND forms.user_id = auth.uid()
        )
      );

    RAISE NOTICE '✅ Fixed form_responses: public submissions + owner access';
  END IF;

  -- =====================================================
  -- 3. Handle owner_id in leads table
  -- =====================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    -- owner_id should reference the assigned user, but user_id is the creator
    -- Both should be able to access the lead

    DROP POLICY IF EXISTS "users_select_own_leads" ON public.leads;
    DROP POLICY IF EXISTS "users_insert_own_leads" ON public.leads;
    DROP POLICY IF EXISTS "users_update_own_leads" ON public.leads;
    DROP POLICY IF EXISTS "users_delete_own_leads" ON public.leads;

    -- Users can see leads they created OR are assigned to
    CREATE POLICY "users_select_own_leads" ON public.leads
      FOR SELECT USING (
        auth.uid() = user_id
        OR
        auth.uid() = owner_id
      );

    -- Users can only create leads with their user_id
    CREATE POLICY "users_insert_own_leads" ON public.leads
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Users can update leads they created OR are assigned to
    CREATE POLICY "users_update_own_leads" ON public.leads
      FOR UPDATE USING (
        auth.uid() = user_id
        OR
        auth.uid() = owner_id
      ) WITH CHECK (
        auth.uid() = user_id
        OR
        auth.uid() = owner_id
      );

    -- Only creators can delete leads
    CREATE POLICY "users_delete_own_leads" ON public.leads
      FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE '✅ Fixed leads table: supports both user_id (creator) and owner_id (assigned)';
  END IF;

  -- =====================================================
  -- 4. Handle booking_links (public viewing of active links)
  -- =====================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_links') THEN
    ALTER TABLE public.booking_links ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "users_select_own_booking_links" ON public.booking_links;
    DROP POLICY IF EXISTS "users_insert_own_booking_links" ON public.booking_links;
    DROP POLICY IF EXISTS "users_update_own_booking_links" ON public.booking_links;
    DROP POLICY IF EXISTS "users_delete_own_booking_links" ON public.booking_links;

    -- Public can view active booking links, owners can see all their links
    CREATE POLICY "users_select_own_booking_links" ON public.booking_links
      FOR SELECT USING (
        auth.uid() = user_id
        OR
        (is_active = true)
      );

    CREATE POLICY "users_insert_own_booking_links" ON public.booking_links
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "users_update_own_booking_links" ON public.booking_links
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "users_delete_own_booking_links" ON public.booking_links
      FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE '✅ Fixed booking_links: public can view active links';
  END IF;

  -- =====================================================
  -- 5. Handle bookings (public booking creation)
  -- =====================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "users_select_own_bookings" ON public.bookings;
    DROP POLICY IF EXISTS "public_insert_bookings" ON public.bookings;
    DROP POLICY IF EXISTS "users_update_own_bookings" ON public.bookings;
    DROP POLICY IF EXISTS "users_delete_own_bookings" ON public.bookings;

    -- Users can see bookings they created OR bookings on their booking links
    CREATE POLICY "users_select_own_bookings" ON public.bookings
      FOR SELECT USING (
        auth.uid() = user_id
        OR
        EXISTS (
          SELECT 1 FROM public.booking_links
          WHERE booking_links.id = bookings.booking_link_id
          AND booking_links.user_id = auth.uid()
        )
      );

    -- Allow public booking creation
    CREATE POLICY "public_insert_bookings" ON public.bookings
      FOR INSERT WITH CHECK (true);

    -- Booking link owners can update bookings
    CREATE POLICY "users_update_own_bookings" ON public.bookings
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.booking_links
          WHERE booking_links.id = bookings.booking_link_id
          AND booking_links.user_id = auth.uid()
        )
      );

    -- Booking link owners can delete bookings
    CREATE POLICY "users_delete_own_bookings" ON public.bookings
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.booking_links
          WHERE booking_links.id = bookings.booking_link_id
          AND booking_links.user_id = auth.uid()
        )
      );

    RAISE NOTICE '✅ Fixed bookings: public can create, owners can manage';
  END IF;

  -- =====================================================
  -- 6. Handle emails table (inbox - needs special access)
  -- =====================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emails') THEN
    ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "users_select_own_emails" ON public.emails;
    DROP POLICY IF EXISTS "users_insert_own_emails" ON public.emails;
    DROP POLICY IF EXISTS "users_update_own_emails" ON public.emails;
    DROP POLICY IF EXISTS "users_delete_own_emails" ON public.emails;

    -- Users can see emails they sent/received
    CREATE POLICY "users_select_own_emails" ON public.emails
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "users_insert_own_emails" ON public.emails
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "users_update_own_emails" ON public.emails
      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "users_delete_own_emails" ON public.emails
      FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE '✅ Fixed emails table with standard user isolation';
  END IF;

  -- =====================================================
  -- 7. Verify all critical tables have indexes
  -- =====================================================

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
  CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
  CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
  CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON public.contacts(lead_id);
  CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON public.opportunities(user_id);
  CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON public.opportunities(lead_id);

  RAISE NOTICE '✅ Created performance indexes on foreign keys';

END $$;

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================

DO $$
DECLARE
  critical_tables TEXT[] := ARRAY[
    'leads', 'contacts', 'opportunities',
    'forms', 'form_responses',
    'emails', 'booking_links', 'bookings',
    'dashboard_presets', 'user_preferences'
  ];
  table_name TEXT;
  has_rls BOOLEAN;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔒 FINAL SECURITY VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  FOREACH table_name IN ARRAY critical_tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
      -- Check RLS
      SELECT rowsecurity INTO has_rls
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = table_name;

      -- Count policies
      SELECT COUNT(*) INTO policy_count
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = table_name;

      IF has_rls AND policy_count >= 4 THEN
        RAISE NOTICE '✅ %: RLS enabled, % policies', table_name, policy_count;
      ELSIF has_rls AND policy_count > 0 THEN
        RAISE NOTICE '⚠️  %: RLS enabled, only % policies', table_name, policy_count;
      ELSIF has_rls THEN
        RAISE NOTICE '❌ %: RLS enabled but NO POLICIES!', table_name;
      ELSE
        RAISE NOTICE '❌ %: RLS NOT ENABLED!', table_name;
      END IF;
    ELSE
      RAISE NOTICE '⏭️  %: Table does not exist (skipped)', table_name;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SECURITY AUDIT COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;
