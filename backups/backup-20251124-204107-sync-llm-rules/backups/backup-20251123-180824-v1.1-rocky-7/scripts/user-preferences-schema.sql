-- ========================================
-- USER PREFERENCES SCHEMA
-- Store all user-specific preferences and data
-- Replaces localStorage usage for cross-device sync
-- ========================================

-- ========================================
-- 1. USER TODOS TABLE
-- Store user's personal todo items
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Todo details
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,

  -- Organization
  category TEXT,
  tags TEXT[],

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON public.user_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_completed ON public.user_todos(completed);
CREATE INDEX IF NOT EXISTS idx_user_todos_created_at ON public.user_todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order ON public.user_todos(sort_order);

-- ========================================
-- 2. USER PREFERENCES TABLE
-- Store miscellaneous user preferences (extends user_settings)
-- ========================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Kate Onboarding
  kate_onboarding_completed BOOLEAN DEFAULT FALSE,
  kate_onboarding_messages JSONB DEFAULT '[]'::jsonb,
  kate_onboarding_completed_at TIMESTAMPTZ,

  -- Dashboard preferences
  dashboard_layout JSONB DEFAULT '{}'::jsonb,
  dashboard_widgets JSONB DEFAULT '[]'::jsonb,

  -- View preferences
  default_view_contacts TEXT DEFAULT 'table',
  default_view_leads TEXT DEFAULT 'table',
  default_view_opportunities TEXT DEFAULT 'kanban',

  -- Other preferences
  preferences JSONB DEFAULT '{}'::jsonb, -- For any additional custom preferences

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- User todos policies
CREATE POLICY "Users can view own todos"
  ON public.user_todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON public.user_todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON public.user_todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON public.user_todos FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================

-- Updated_at triggers
CREATE TRIGGER update_user_todos_updated_at
  BEFORE UPDATE ON public.user_todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user preferences when user is created
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_user_created_preferences ON public.users;

-- Create trigger
CREATE TRIGGER on_user_created_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_preferences();

-- ========================================
-- FUNCTIONS
-- ========================================

-- Get user's todos
CREATE OR REPLACE FUNCTION public.get_user_todos(p_user_id UUID)
RETURNS SETOF public.user_todos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_todos
  WHERE user_id = p_user_id
  ORDER BY sort_order ASC, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark todo as complete
CREATE OR REPLACE FUNCTION public.complete_todo(p_todo_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_todos
  SET
    completed = TRUE,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_todo_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user preferences
CREATE OR REPLACE FUNCTION public.update_user_preference(
  p_user_id UUID,
  p_key TEXT,
  p_value JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update or insert preference
  INSERT INTO public.user_preferences (user_id, preferences)
  VALUES (p_user_id, jsonb_build_object(p_key, p_value))
  ON CONFLICT (user_id) DO UPDATE
  SET
    preferences = user_preferences.preferences || jsonb_build_object(p_key, p_value),
    updated_at = NOW();

  -- Return updated preferences
  SELECT preferences INTO v_result
  FROM public.user_preferences
  WHERE user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete Kate onboarding
CREATE OR REPLACE FUNCTION public.complete_kate_onboarding(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_preferences
  SET
    kate_onboarding_completed = TRUE,
    kate_onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_todos(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_todo(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_preference(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_kate_onboarding(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE public.user_todos IS 'User personal todo items synced across devices';
COMMENT ON TABLE public.user_preferences IS 'User preferences and settings that replace localStorage';
