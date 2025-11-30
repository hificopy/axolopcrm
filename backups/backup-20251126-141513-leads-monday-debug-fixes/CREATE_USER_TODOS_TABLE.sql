-- ============================================
-- CREATE user_todos TABLE
-- ============================================
-- This is the ACTUAL table needed for the Todos page!

DROP TABLE IF EXISTS public.user_todos CASCADE;

CREATE TABLE public.user_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own todos"
  ON public.user_todos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON public.user_todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON public.user_todos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON public.user_todos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON public.user_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_completed ON public.user_todos(completed);
CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order ON public.user_todos(sort_order);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_todos TO authenticated;

-- Verification
SELECT 'user_todos table created!' AS status;
