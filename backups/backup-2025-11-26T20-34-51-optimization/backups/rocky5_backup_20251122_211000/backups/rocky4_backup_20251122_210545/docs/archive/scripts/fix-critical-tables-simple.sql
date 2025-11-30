-- =====================================================
-- FIX CRITICAL TABLES - SIMPLE VERSION
-- Fixes tables with RLS but no user_id
-- =====================================================

-- Add user_id to affiliate_clicks
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_clicks' AND column_name = 'user_id') THEN
    ALTER TABLE public.affiliate_clicks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added user_id to affiliate_clicks';
  END IF;
END $$;

-- Populate affiliate_clicks.user_id from affiliates
DO $$ BEGIN
  UPDATE public.affiliate_clicks SET user_id = affiliates.user_id
  FROM public.affiliates WHERE affiliate_clicks.affiliate_id = affiliates.id;
  RAISE NOTICE '✅ Populated affiliate_clicks.user_id';
END $$;

-- Create index and policies for affiliate_clicks
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_user_id ON public.affiliate_clicks(user_id);

DROP POLICY IF EXISTS "users_select_own_affiliate_clicks" ON public.affiliate_clicks;
CREATE POLICY "users_select_own_affiliate_clicks" ON public.affiliate_clicks
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "users_insert_own_affiliate_clicks" ON public.affiliate_clicks;
CREATE POLICY "users_insert_own_affiliate_clicks" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "users_update_own_affiliate_clicks" ON public.affiliate_clicks;
CREATE POLICY "users_update_own_affiliate_clicks" ON public.affiliate_clicks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_affiliate_clicks" ON public.affiliate_clicks;
CREATE POLICY "users_delete_own_affiliate_clicks" ON public.affiliate_clicks
  FOR DELETE USING (auth.uid() = user_id);

-- Add user_id to affiliate_referrals
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_referrals' AND column_name = 'user_id') THEN
    ALTER TABLE public.affiliate_referrals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added user_id to affiliate_referrals';
  END IF;
END $$;

-- Populate affiliate_referrals.user_id from affiliates
DO $$ BEGIN
  UPDATE public.affiliate_referrals SET user_id = affiliates.user_id
  FROM public.affiliates WHERE affiliate_referrals.affiliate_id = affiliates.id;
  RAISE NOTICE '✅ Populated affiliate_referrals.user_id';
END $$;

-- Create index and policies for affiliate_referrals
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON public.affiliate_referrals(user_id);

DROP POLICY IF EXISTS "users_select_own_affiliate_referrals" ON public.affiliate_referrals;
CREATE POLICY "users_select_own_affiliate_referrals" ON public.affiliate_referrals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_affiliate_referrals" ON public.affiliate_referrals;
CREATE POLICY "users_insert_own_affiliate_referrals" ON public.affiliate_referrals
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "users_update_own_affiliate_referrals" ON public.affiliate_referrals;
CREATE POLICY "users_update_own_affiliate_referrals" ON public.affiliate_referrals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_affiliate_referrals" ON public.affiliate_referrals;
CREATE POLICY "users_delete_own_affiliate_referrals" ON public.affiliate_referrals
  FOR DELETE USING (auth.uid() = user_id);

-- Add user_id to affiliate_commissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_commissions' AND column_name = 'user_id') THEN
    ALTER TABLE public.affiliate_commissions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added user_id to affiliate_commissions';
  END IF;
END $$;

-- Populate affiliate_commissions.user_id from affiliates
DO $$ BEGIN
  UPDATE public.affiliate_commissions SET user_id = affiliates.user_id
  FROM public.affiliates WHERE affiliate_commissions.affiliate_id = affiliates.id;
  RAISE NOTICE '✅ Populated affiliate_commissions.user_id';
END $$;

-- Create index and policies for affiliate_commissions
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON public.affiliate_commissions(user_id);

DROP POLICY IF EXISTS "users_select_own_affiliate_commissions" ON public.affiliate_commissions;
CREATE POLICY "users_select_own_affiliate_commissions" ON public.affiliate_commissions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_affiliate_commissions" ON public.affiliate_commissions;
CREATE POLICY "users_insert_own_affiliate_commissions" ON public.affiliate_commissions
  FOR INSERT WITH CHECK (true); -- System can create

DROP POLICY IF EXISTS "users_update_own_affiliate_commissions" ON public.affiliate_commissions;
CREATE POLICY "users_update_own_affiliate_commissions" ON public.affiliate_commissions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_affiliate_commissions" ON public.affiliate_commissions;
CREATE POLICY "users_delete_own_affiliate_commissions" ON public.affiliate_commissions
  FOR DELETE USING (auth.uid() = user_id);

-- Add user_id to affiliate_payouts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'affiliate_payouts' AND column_name = 'user_id') THEN
    ALTER TABLE public.affiliate_payouts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added user_id to affiliate_payouts';
  END IF;
END $$;

-- Populate affiliate_payouts.user_id from affiliates
DO $$ BEGIN
  UPDATE public.affiliate_payouts SET user_id = affiliates.user_id
  FROM public.affiliates WHERE affiliate_payouts.affiliate_id = affiliates.id;
  RAISE NOTICE '✅ Populated affiliate_payouts.user_id';
END $$;

-- Create index and policies for affiliate_payouts
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_user_id ON public.affiliate_payouts(user_id);

DROP POLICY IF EXISTS "users_select_own_affiliate_payouts" ON public.affiliate_payouts;
CREATE POLICY "users_select_own_affiliate_payouts" ON public.affiliate_payouts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_affiliate_payouts" ON public.affiliate_payouts;
CREATE POLICY "users_insert_own_affiliate_payouts" ON public.affiliate_payouts
  FOR INSERT WITH CHECK (true); -- System can create

DROP POLICY IF EXISTS "users_update_own_affiliate_payouts" ON public.affiliate_payouts;
CREATE POLICY "users_update_own_affiliate_payouts" ON public.affiliate_payouts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_affiliate_payouts" ON public.affiliate_payouts;
CREATE POLICY "users_delete_own_affiliate_payouts" ON public.affiliate_payouts
  FOR DELETE USING (auth.uid() = user_id);

-- Fix affiliate_materials (public read access)
DROP POLICY IF EXISTS "public_select_affiliate_materials" ON public.affiliate_materials;
CREATE POLICY "public_select_affiliate_materials" ON public.affiliate_materials
  FOR SELECT USING (true);

-- Add user_id to automation_executions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'automation_executions' AND column_name = 'user_id') THEN
    ALTER TABLE public.automation_executions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added user_id to automation_executions';
  END IF;
END $$;

-- Create index and policies for automation_executions
CREATE INDEX IF NOT EXISTS idx_automation_executions_user_id ON public.automation_executions(user_id);

DROP POLICY IF EXISTS "users_select_own_automation_executions" ON public.automation_executions;
CREATE POLICY "users_select_own_automation_executions" ON public.automation_executions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "users_insert_own_automation_executions" ON public.automation_executions;
CREATE POLICY "users_insert_own_automation_executions" ON public.automation_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "users_update_own_automation_executions" ON public.automation_executions;
CREATE POLICY "users_update_own_automation_executions" ON public.automation_executions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_automation_executions" ON public.automation_executions;
CREATE POLICY "users_delete_own_automation_executions" ON public.automation_executions
  FOR DELETE USING (auth.uid() = user_id);

-- Add user_id to campaigns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'user_id') THEN
    ALTER TABLE public.campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added user_id to campaigns';
  END IF;
END $$;

-- Create index and policies for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);

DROP POLICY IF EXISTS "users_select_own_campaigns" ON public.campaigns;
CREATE POLICY "users_select_own_campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_campaigns" ON public.campaigns;
CREATE POLICY "users_insert_own_campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_campaigns" ON public.campaigns;
CREATE POLICY "users_update_own_campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_campaigns" ON public.campaigns;
CREATE POLICY "users_delete_own_campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Final success message
DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL CRITICAL TABLES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ affiliate_clicks - Fixed';
  RAISE NOTICE '✅ affiliate_referrals - Fixed';
  RAISE NOTICE '✅ affiliate_commissions - Fixed';
  RAISE NOTICE '✅ affiliate_payouts - Fixed';
  RAISE NOTICE '✅ affiliate_materials - Fixed (public access)';
  RAISE NOTICE '✅ automation_executions - Fixed';
  RAISE NOTICE '✅ campaigns - Fixed';
  RAISE NOTICE '';
END $$;
