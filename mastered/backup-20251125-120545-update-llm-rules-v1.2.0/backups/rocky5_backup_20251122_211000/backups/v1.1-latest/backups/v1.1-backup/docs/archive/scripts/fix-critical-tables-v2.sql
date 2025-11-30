-- =====================================================
-- FIX CRITICAL TABLES WITHOUT user_id (Version 2)
-- Fixed variable naming conflict
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔧 FIXING CRITICAL TABLES';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- =====================================================
  -- 1. AFFILIATE TABLES
  -- =====================================================

  -- affiliate_clicks: Track which affiliate's link was clicked
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_clicks') THEN
    -- Add user_id referencing the affiliate's user
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_clicks' AND column_name = 'user_id') THEN
      -- First check if affiliate_id exists and references affiliates table
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_clicks' AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.affiliate_clicks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Copy user_id from affiliates table if the relationship exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliates') THEN
          UPDATE public.affiliate_clicks
          SET user_id = affiliates.user_id
          FROM public.affiliates
          WHERE affiliate_clicks.affiliate_id = affiliates.id;
        END IF;

        CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON public.affiliate_clicks(user_id);

        -- Create policies
        DROP POLICY IF EXISTS "users_select_own_affiliate_clicks" ON public.affiliate_clicks;
        DROP POLICY IF EXISTS "users_insert_own_affiliate_clicks" ON public.affiliate_clicks;
        DROP POLICY IF EXISTS "users_update_own_affiliate_clicks" ON public.affiliate_clicks;
        DROP POLICY IF EXISTS "users_delete_own_affiliate_clicks" ON public.affiliate_clicks;

        CREATE POLICY "users_select_own_affiliate_clicks" ON public.affiliate_clicks
          FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "users_insert_own_affiliate_clicks" ON public.affiliate_clicks
          FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "users_update_own_affiliate_clicks" ON public.affiliate_clicks
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "users_delete_own_affiliate_clicks" ON public.affiliate_clicks
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE '✅ Fixed affiliate_clicks table';
      END IF;
    ELSE
      RAISE NOTICE '✓ affiliate_clicks already has user_id';
    END IF;
  END IF;

  -- affiliate_referrals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_referrals') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_referrals' AND column_name = 'user_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_referrals' AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.affiliate_referrals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliates') THEN
          UPDATE public.affiliate_referrals
          SET user_id = affiliates.user_id
          FROM public.affiliates
          WHERE affiliate_referrals.affiliate_id = affiliates.id;
        END IF;

        CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON public.affiliate_referrals(user_id);

        DROP POLICY IF EXISTS "users_select_own_affiliate_referrals" ON public.affiliate_referrals;
        DROP POLICY IF EXISTS "users_insert_own_affiliate_referrals" ON public.affiliate_referrals;
        DROP POLICY IF EXISTS "users_update_own_affiliate_referrals" ON public.affiliate_referrals;
        DROP POLICY IF EXISTS "users_delete_own_affiliate_referrals" ON public.affiliate_referrals;

        CREATE POLICY "users_select_own_affiliate_referrals" ON public.affiliate_referrals
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "users_insert_own_affiliate_referrals" ON public.affiliate_referrals
          FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "users_update_own_affiliate_referrals" ON public.affiliate_referrals
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "users_delete_own_affiliate_referrals" ON public.affiliate_referrals
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE '✅ Fixed affiliate_referrals table';
      END IF;
    ELSE
      RAISE NOTICE '✓ affiliate_referrals already has user_id';
    END IF;
  END IF;

  -- affiliate_commissions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_commissions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_commissions' AND column_name = 'user_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_commissions' AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.affiliate_commissions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliates') THEN
          UPDATE public.affiliate_commissions
          SET user_id = affiliates.user_id
          FROM public.affiliates
          WHERE affiliate_commissions.affiliate_id = affiliates.id;
        END IF;

        CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON public.affiliate_commissions(user_id);

        DROP POLICY IF EXISTS "users_select_own_affiliate_commissions" ON public.affiliate_commissions;
        DROP POLICY IF EXISTS "users_insert_own_affiliate_commissions" ON public.affiliate_commissions;
        DROP POLICY IF EXISTS "users_update_own_affiliate_commissions" ON public.affiliate_commissions;
        DROP POLICY IF EXISTS "users_delete_own_affiliate_commissions" ON public.affiliate_commissions;

        CREATE POLICY "users_select_own_affiliate_commissions" ON public.affiliate_commissions
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "users_insert_own_affiliate_commissions" ON public.affiliate_commissions
          FOR INSERT WITH CHECK (true); -- System can create commissions

        CREATE POLICY "users_update_own_affiliate_commissions" ON public.affiliate_commissions
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "users_delete_own_affiliate_commissions" ON public.affiliate_commissions
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE '✅ Fixed affiliate_commissions table';
      END IF;
    ELSE
      RAISE NOTICE '✓ affiliate_commissions already has user_id';
    END IF;
  END IF;

  -- affiliate_payouts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_payouts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_payouts' AND column_name = 'user_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_payouts' AND column_name = 'affiliate_id') THEN
        ALTER TABLE public.affiliate_payouts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliates') THEN
          UPDATE public.affiliate_payouts
          SET user_id = affiliates.user_id
          FROM public.affiliates
          WHERE affiliate_payouts.affiliate_id = affiliates.id;
        END IF;

        CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_user_id ON public.affiliate_payouts(user_id);

        DROP POLICY IF EXISTS "users_select_own_affiliate_payouts" ON public.affiliate_payouts;
        DROP POLICY IF EXISTS "users_insert_own_affiliate_payouts" ON public.affiliate_payouts;
        DROP POLICY IF EXISTS "users_update_own_affiliate_payouts" ON public.affiliate_payouts;
        DROP POLICY IF EXISTS "users_delete_own_affiliate_payouts" ON public.affiliate_payouts;

        CREATE POLICY "users_select_own_affiliate_payouts" ON public.affiliate_payouts
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "users_insert_own_affiliate_payouts" ON public.affiliate_payouts
          FOR INSERT WITH CHECK (true); -- System can create payouts

        CREATE POLICY "users_update_own_affiliate_payouts" ON public.affiliate_payouts
          FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "users_delete_own_affiliate_payouts" ON public.affiliate_payouts
          FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE '✅ Fixed affiliate_payouts table';
      END IF;
    ELSE
      RAISE NOTICE '✓ affiliate_payouts already has user_id';
    END IF;
  END IF;

  -- affiliate_materials (marketing materials are usually public)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_materials') THEN
    -- Materials might be shared by admin, so we'll make them publicly readable
    DROP POLICY IF EXISTS "public_select_affiliate_materials" ON public.affiliate_materials;

    CREATE POLICY "public_select_affiliate_materials" ON public.affiliate_materials
      FOR SELECT USING (true); -- All affiliates can view materials

    RAISE NOTICE '✅ Fixed affiliate_materials table (public read access)';
  END IF;

  -- =====================================================
  -- 2. AUTOMATION/WORKFLOW TABLES
  -- =====================================================

  -- automation_executions: Belongs to the workflow owner
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'automation_executions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'automation_executions' AND column_name = 'user_id') THEN
      ALTER TABLE public.automation_executions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Try to populate from related workflow/campaign if possible
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'automation_executions' AND column_name = 'workflow_id') THEN
        -- Check if we have email_marketing_workflows table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_marketing_workflows') THEN
          UPDATE public.automation_executions
          SET user_id = email_marketing_workflows.user_id
          FROM public.email_marketing_workflows
          WHERE automation_executions.workflow_id = email_marketing_workflows.id;
        END IF;
      END IF;

      CREATE INDEX IF NOT EXISTS idx_automation_executions_user_id ON public.automation_executions(user_id);

      DROP POLICY IF EXISTS "users_select_own_automation_executions" ON public.automation_executions;
      DROP POLICY IF EXISTS "users_insert_own_automation_executions" ON public.automation_executions;
      DROP POLICY IF EXISTS "users_update_own_automation_executions" ON public.automation_executions;
      DROP POLICY IF EXISTS "users_delete_own_automation_executions" ON public.automation_executions;

      CREATE POLICY "users_select_own_automation_executions" ON public.automation_executions
        FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

      CREATE POLICY "users_insert_own_automation_executions" ON public.automation_executions
        FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

      CREATE POLICY "users_update_own_automation_executions" ON public.automation_executions
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "users_delete_own_automation_executions" ON public.automation_executions
        FOR DELETE USING (auth.uid() = user_id);

      RAISE NOTICE '✅ Fixed automation_executions table';
    ELSE
      RAISE NOTICE '✓ automation_executions already has user_id';
    END IF;
  END IF;

  -- =====================================================
  -- 3. CAMPAIGNS TABLE
  -- =====================================================

  -- campaigns: Should belong to the user who created them
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'user_id') THEN
      ALTER TABLE public.campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Check if there's a created_by column to migrate from
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'created_by') THEN
        UPDATE public.campaigns SET user_id = created_by WHERE created_by IS NOT NULL;
      END IF;

      CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);

      DROP POLICY IF EXISTS "users_select_own_campaigns" ON public.campaigns;
      DROP POLICY IF EXISTS "users_insert_own_campaigns" ON public.campaigns;
      DROP POLICY IF EXISTS "users_update_own_campaigns" ON public.campaigns;
      DROP POLICY IF EXISTS "users_delete_own_campaigns" ON public.campaigns;

      CREATE POLICY "users_select_own_campaigns" ON public.campaigns
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "users_insert_own_campaigns" ON public.campaigns
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "users_update_own_campaigns" ON public.campaigns
        FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "users_delete_own_campaigns" ON public.campaigns
        FOR DELETE USING (auth.uid() = user_id);

      RAISE NOTICE '✅ Fixed campaigns table';
    ELSE
      RAISE NOTICE '✓ campaigns already has user_id';
    END IF;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL CRITICAL TABLES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

END $$;

-- =====================================================
-- VERIFY THE FIXES
-- =====================================================

DO $$
DECLARE
  critical_tables TEXT[] := ARRAY[
    'affiliate_clicks',
    'affiliate_referrals',
    'affiliate_commissions',
    'affiliate_payouts',
    'affiliate_materials',
    'automation_executions',
    'campaigns'
  ];
  tbl_name TEXT;
  has_user_id BOOLEAN;
  has_rls BOOLEAN;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICATION OF FIXES:';
  RAISE NOTICE '';

  FOREACH tbl_name IN ARRAY critical_tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
      -- Check for user_id
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.table_name = tbl_name AND c.column_name = 'user_id'
      ) INTO has_user_id;

      -- Check RLS
      SELECT rowsecurity INTO has_rls
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = tbl_name;

      -- Count policies
      SELECT COUNT(*) INTO policy_count
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl_name;

      IF has_user_id AND has_rls AND policy_count >= 1 THEN
        RAISE NOTICE '✅ %: user_id ✓, RLS ✓, % policies', tbl_name, policy_count;
      ELSIF has_rls AND policy_count >= 1 THEN
        RAISE NOTICE '⚠️  %: NO user_id (special case), RLS ✓, % policies', tbl_name, policy_count;
      ELSE
        RAISE NOTICE '❌ %: Still has issues!', tbl_name;
      END IF;
    ELSE
      RAISE NOTICE '⏭️  %: Table does not exist', tbl_name;
    END IF;
  END LOOP;

  RAISE NOTICE '';
END $$;
