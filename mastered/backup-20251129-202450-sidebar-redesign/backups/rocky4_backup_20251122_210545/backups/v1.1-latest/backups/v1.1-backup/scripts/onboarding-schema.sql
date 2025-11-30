-- ========================================
-- ONBOARDING SCHEMA
-- Track user onboarding completion and data
-- ========================================

-- Add onboarding fields to users table if they don't exist
DO $$
BEGIN
  -- Add onboarding_completed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add onboarding_completed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create onboarding_data table to store all onboarding responses
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Business Information
  business_name TEXT,
  business_type TEXT, -- e.g., "agency", "ecommerce", "real-estate", "consulting", "other"
  industry TEXT,
  company_size TEXT, -- e.g., "1-5", "6-20", "21-50", "51-200", "201+"

  -- Role & Goals
  role TEXT, -- e.g., "owner", "sales", "marketing", "manager", "other"
  primary_goal TEXT, -- e.g., "lead-generation", "customer-management", "email-marketing", "automation", "other"
  goals JSONB DEFAULT '[]'::jsonb, -- Array of selected goals

  -- Current Tools
  current_crm TEXT, -- What CRM they're using now (if any)
  tools_to_replace TEXT[], -- Array of tools they want to replace
  pain_points TEXT[], -- Array of pain points

  -- Usage Intent
  team_size INTEGER,
  monthly_leads_expected INTEGER,
  monthly_revenue_target NUMERIC,

  -- Preferences
  preferred_features TEXT[], -- Array of features they're most interested in
  notification_preferences JSONB DEFAULT '{}'::jsonb,

  -- Additional Info
  how_did_you_hear TEXT, -- e.g., "google", "referral", "social-media", "other"
  referral_source TEXT,
  notes TEXT,

  -- Metadata
  completed_steps JSONB DEFAULT '[]'::jsonb, -- Track which steps were completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON public.onboarding_data(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_data_created_at ON public.onboarding_data(created_at DESC);

-- Enable RLS
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data"
  ON public.onboarding_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data"
  ON public.onboarding_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Updated_at trigger for onboarding_data
CREATE TRIGGER update_onboarding_data_updated_at
  BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to mark onboarding as complete
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  p_user_id UUID,
  p_onboarding_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update users table
  UPDATE public.users
  SET
    onboarding_completed = TRUE,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Insert or update onboarding data
  INSERT INTO public.onboarding_data (
    user_id,
    business_name,
    business_type,
    industry,
    company_size,
    role,
    primary_goal,
    goals,
    current_crm,
    tools_to_replace,
    pain_points,
    team_size,
    monthly_leads_expected,
    monthly_revenue_target,
    preferred_features,
    notification_preferences,
    how_did_you_hear,
    referral_source,
    notes,
    completed_steps
  ) VALUES (
    p_user_id,
    p_onboarding_data->>'business_name',
    p_onboarding_data->>'business_type',
    p_onboarding_data->>'industry',
    p_onboarding_data->>'company_size',
    p_onboarding_data->>'role',
    p_onboarding_data->>'primary_goal',
    COALESCE(p_onboarding_data->'goals', '[]'::jsonb),
    p_onboarding_data->>'current_crm',
    CASE
      WHEN p_onboarding_data->'tools_to_replace' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'tools_to_replace'))
      ELSE NULL
    END,
    CASE
      WHEN p_onboarding_data->'pain_points' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'pain_points'))
      ELSE NULL
    END,
    (p_onboarding_data->>'team_size')::INTEGER,
    (p_onboarding_data->>'monthly_leads_expected')::INTEGER,
    (p_onboarding_data->>'monthly_revenue_target')::NUMERIC,
    CASE
      WHEN p_onboarding_data->'preferred_features' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(p_onboarding_data->'preferred_features'))
      ELSE NULL
    END,
    COALESCE(p_onboarding_data->'notification_preferences', '{}'::jsonb),
    p_onboarding_data->>'how_did_you_hear',
    p_onboarding_data->>'referral_source',
    p_onboarding_data->>'notes',
    COALESCE(p_onboarding_data->'completed_steps', '[]'::jsonb)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    industry = EXCLUDED.industry,
    company_size = EXCLUDED.company_size,
    role = EXCLUDED.role,
    primary_goal = EXCLUDED.primary_goal,
    goals = EXCLUDED.goals,
    current_crm = EXCLUDED.current_crm,
    tools_to_replace = EXCLUDED.tools_to_replace,
    pain_points = EXCLUDED.pain_points,
    team_size = EXCLUDED.team_size,
    monthly_leads_expected = EXCLUDED.monthly_leads_expected,
    monthly_revenue_target = EXCLUDED.monthly_revenue_target,
    preferred_features = EXCLUDED.preferred_features,
    notification_preferences = EXCLUDED.notification_preferences,
    how_did_you_hear = EXCLUDED.how_did_you_hear,
    referral_source = EXCLUDED.referral_source,
    notes = EXCLUDED.notes,
    completed_steps = EXCLUDED.completed_steps,
    updated_at = NOW();

  -- Return success
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding completed successfully',
    'user_id', p_user_id,
    'completed_at', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'onboarding_data_user_id_key'
  ) THEN
    ALTER TABLE public.onboarding_data ADD CONSTRAINT onboarding_data_user_id_key UNIQUE(user_id);
  END IF;
END $$;

-- Mark admin account as onboarding complete
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Find admin user by email
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'axolopcrm@gmail.com'
  LIMIT 1;

  -- If admin exists, mark onboarding as complete
  IF v_admin_id IS NOT NULL THEN
    UPDATE public.users
    SET
      onboarding_completed = TRUE,
      onboarding_completed_at = NOW()
    WHERE id = v_admin_id;
  END IF;
END $$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.complete_user_onboarding(UUID, JSONB) TO authenticated;

-- Comments
COMMENT ON TABLE public.onboarding_data IS 'Stores user onboarding responses and preferences';
COMMENT ON FUNCTION public.complete_user_onboarding IS 'Marks user onboarding as complete and stores all onboarding data';
