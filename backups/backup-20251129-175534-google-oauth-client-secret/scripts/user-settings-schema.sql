-- ========================================
-- USER SETTINGS SCHEMA
-- Store user-specific settings (theme, notifications, etc.)
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Theme settings
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  
  -- Notification settings
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  -- Communication preferences
  call_reminders BOOLEAN DEFAULT TRUE,
  meeting_reminders BOOLEAN DEFAULT TRUE,
  
  -- Display preferences
  language TEXT DEFAULT 'English',
  timezone TEXT DEFAULT 'America/New_York',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12 hour',
  
  -- Privacy settings
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  auto_logout BOOLEAN DEFAULT TRUE,
  auto_logout_minutes INTEGER DEFAULT 30,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================

-- Updated_at trigger
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTIONS
-- ========================================

-- Get user settings
CREATE OR REPLACE FUNCTION public.get_user_settings(p_user_id UUID)
  RETURNS SETOF public.user_settings AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_settings
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user settings
CREATE OR REPLACE FUNCTION public.update_user_settings(
  p_user_id UUID,
  p_theme TEXT DEFAULT NULL,
  p_email_notifications BOOLEAN DEFAULT NULL,
  p_push_notifications BOOLEAN DEFAULT NULL,
  p_sms_notifications BOOLEAN DEFAULT NULL,
  p_marketing_emails BOOLEAN DEFAULT NULL,
  p_call_reminders BOOLEAN DEFAULT NULL,
  p_meeting_reminders BOOLEAN DEFAULT NULL,
  p_language TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_date_format TEXT DEFAULT NULL,
  p_time_format TEXT DEFAULT NULL,
  p_two_factor_enabled BOOLEAN DEFAULT NULL,
  p_auto_logout BOOLEAN DEFAULT NULL,
  p_auto_logout_minutes INTEGER DEFAULT NULL
)
  RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update settings
  UPDATE public.user_settings
  SET
    theme = COALESCE(p_theme, theme),
    email_notifications = COALESCE(p_email_notifications, email_notifications),
    push_notifications = COALESCE(p_push_notifications, push_notifications),
    sms_notifications = COALESCE(p_sms_notifications, sms_notifications),
    marketing_emails = COALESCE(p_marketing_emails, marketing_emails),
    call_reminders = COALESCE(p_call_reminders, call_reminders),
    meeting_reminders = COALESCE(p_meeting_reminders, meeting_reminders),
    language = COALESCE(p_language, language),
    timezone = COALESCE(p_timezone, timezone),
    date_format = COALESCE(p_date_format, date_format),
    time_format = COALESCE(p_time_format, time_format),
    two_factor_enabled = COALESCE(p_two_factor_enabled, two_factor_enabled),
    auto_logout = COALESCE(p_auto_logout, auto_logout),
    auto_logout_minutes = COALESCE(p_auto_logout_minutes, auto_logout_minutes),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Return updated settings
  SELECT row_to_json(*) INTO v_result
  FROM public.user_settings
  WHERE user_id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_settings(
  UUID, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, 
  BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT, TEXT, 
  BOOLEAN, BOOLEAN, INTEGER
) TO authenticated;

-- Comments
COMMENT ON TABLE public.user_settings IS 'User-specific settings for theme, notifications, and preferences';