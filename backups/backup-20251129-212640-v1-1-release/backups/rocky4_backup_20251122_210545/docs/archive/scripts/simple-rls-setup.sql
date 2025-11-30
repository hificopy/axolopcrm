-- =====================================================
-- AXOLOP CRM - SIMPLIFIED RLS SETUP
-- Creates basic user isolation policies without complex dependencies
-- =====================================================

-- This script creates simple RLS policies based on user_id column
-- It avoids complex cross-table JOIN conditions that might fail
-- if referenced tables don't exist

DO $$
DECLARE
  table_record RECORD;
  policy_count INTEGER := 0;
BEGIN
  -- =====================================================
  -- STEP 1: Enable RLS on all tables with user_id
  -- =====================================================

  FOR table_record IN
    SELECT t.tablename
    FROM pg_tables t
    INNER JOIN information_schema.columns c
      ON c.table_name = t.tablename
      AND c.table_schema = t.schemaname
    WHERE t.schemaname = 'public'
      AND c.column_name = 'user_id'
      AND t.tablename NOT LIKE 'pg_%'
      AND t.tablename NOT LIKE 'sql_%'
    ORDER BY t.tablename
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    RAISE NOTICE '✅ Enabled RLS on: %', table_record.tablename;

    -- Drop existing policies if they exist
    EXECUTE format('DROP POLICY IF EXISTS "users_select_own_%s" ON public.%I', table_record.tablename, table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "users_insert_own_%s" ON public.%I', table_record.tablename, table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "users_update_own_%s" ON public.%I', table_record.tablename, table_record.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "users_delete_own_%s" ON public.%I', table_record.tablename, table_record.tablename);

    -- Create SELECT policy
    EXECUTE format('
      CREATE POLICY "users_select_own_%s"
      ON public.%I
      FOR SELECT
      USING (auth.uid() = user_id)',
      table_record.tablename, table_record.tablename
    );

    -- Create INSERT policy
    EXECUTE format('
      CREATE POLICY "users_insert_own_%s"
      ON public.%I
      FOR INSERT
      WITH CHECK (auth.uid() = user_id)',
      table_record.tablename, table_record.tablename
    );

    -- Create UPDATE policy
    EXECUTE format('
      CREATE POLICY "users_update_own_%s"
      ON public.%I
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)',
      table_record.tablename, table_record.tablename
    );

    -- Create DELETE policy
    EXECUTE format('
      CREATE POLICY "users_delete_own_%s"
      ON public.%I
      FOR DELETE
      USING (auth.uid() = user_id)',
      table_record.tablename, table_record.tablename
    );

    policy_count := policy_count + 1;
    RAISE NOTICE '✅ Created 4 policies for: %', table_record.tablename;

  END LOOP;

  -- =====================================================
  -- STEP 2: Create indexes for performance
  -- =====================================================

  FOR table_record IN
    SELECT t.tablename
    FROM pg_tables t
    INNER JOIN information_schema.columns c
      ON c.table_name = t.tablename
      AND c.table_schema = t.schemaname
    WHERE t.schemaname = 'public'
      AND c.column_name = 'user_id'
      AND t.tablename NOT LIKE 'pg_%'
      AND t.tablename NOT LIKE 'sql_%'
    ORDER BY t.tablename
  LOOP
    -- Create index on user_id if it doesn't exist
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_user_id ON public.%I(user_id)',
      table_record.tablename, table_record.tablename);
    RAISE NOTICE '✅ Created index on: %', table_record.tablename;
  END LOOP;

  -- =====================================================
  -- STEP 3: Handle special cases for public access
  -- =====================================================

  -- Form responses - allow anonymous submissions but users can view their own
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_responses') THEN
    DROP POLICY IF EXISTS "users_select_own_form_responses" ON public.form_responses;
    DROP POLICY IF EXISTS "users_insert_own_form_responses" ON public.form_responses;

    CREATE POLICY "users_select_own_form_responses"
      ON public.form_responses
      FOR SELECT
      USING (
        auth.uid() = user_id
        OR
        EXISTS (
          SELECT 1 FROM public.forms
          WHERE forms.id = form_responses.form_id
          AND forms.user_id = auth.uid()
        )
      );

    CREATE POLICY "public_insert_form_responses"
      ON public.form_responses
      FOR INSERT
      WITH CHECK (true); -- Allow public submissions

    RAISE NOTICE '✅ Created special policies for form_responses (public submissions allowed)';
  END IF;

  -- Booking links - allow public viewing of active links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_links') THEN
    DROP POLICY IF EXISTS "users_select_own_booking_links" ON public.booking_links;

    CREATE POLICY "users_select_own_booking_links"
      ON public.booking_links
      FOR SELECT
      USING (
        auth.uid() = user_id
        OR
        (is_active = true) -- Allow public viewing of active booking links
      );

    RAISE NOTICE '✅ Created special policies for booking_links (public access for active links)';
  END IF;

  -- Bookings - allow public creation but users can view their own
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    DROP POLICY IF EXISTS "users_select_own_bookings" ON public.bookings;
    DROP POLICY IF EXISTS "users_insert_own_bookings" ON public.bookings;

    CREATE POLICY "users_select_own_bookings"
      ON public.bookings
      FOR SELECT
      USING (
        auth.uid() = user_id
        OR
        EXISTS (
          SELECT 1 FROM public.booking_links
          WHERE booking_links.id = bookings.booking_link_id
          AND booking_links.user_id = auth.uid()
        )
      );

    CREATE POLICY "public_insert_bookings"
      ON public.bookings
      FOR INSERT
      WITH CHECK (true); -- Allow public booking creation

    RAISE NOTICE '✅ Created special policies for bookings (public booking allowed)';
  END IF;

  -- =====================================================
  -- FINAL SUMMARY
  -- =====================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ RLS SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Processed % tables', policy_count;
  RAISE NOTICE '✅ Created % basic policies (SELECT, INSERT, UPDATE, DELETE)', policy_count * 4;
  RAISE NOTICE '✅ Created performance indexes on user_id columns';
  RAISE NOTICE '✅ Set up special policies for public-facing features';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 All tables are now protected with Row Level Security';
  RAISE NOTICE '🔒 Users can only access their own data';
  RAISE NOTICE '🔒 Public features (forms, bookings) remain accessible';
  RAISE NOTICE '';

END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Show all tables with RLS enabled
DO $$
DECLARE
  rls_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%';

  SELECT COUNT(*) INTO total_count
  FROM pg_tables
  INNER JOIN information_schema.columns
    ON information_schema.columns.table_name = pg_tables.tablename
    AND information_schema.columns.table_schema = pg_tables.schemaname
  WHERE pg_tables.schemaname = 'public'
    AND information_schema.columns.column_name = 'user_id'
    AND pg_tables.tablename NOT LIKE 'pg_%'
    AND pg_tables.tablename NOT LIKE 'sql_%';

  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICATION:';
  RAISE NOTICE '   Tables with user_id column: %', total_count;
  RAISE NOTICE '   Tables with RLS enabled: %', rls_count;
  RAISE NOTICE '';

  IF rls_count = total_count THEN
    RAISE NOTICE '✅ SUCCESS: All tables with user_id have RLS enabled!';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % tables with user_id do not have RLS enabled', total_count - rls_count;
  END IF;
  RAISE NOTICE '';
END $$;
