-- Dashboard Presets Table
-- Stores custom dashboard layouts for users

CREATE TABLE IF NOT EXISTS dashboard_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,
  base_preset VARCHAR(50) DEFAULT 'default',
  is_custom BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_user_id ON dashboard_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_is_default ON dashboard_presets(user_id, is_default);

-- Enable Row Level Security (RLS)
ALTER TABLE dashboard_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own dashboard presets" ON dashboard_presets;
DROP POLICY IF EXISTS "Users can create their own dashboard presets" ON dashboard_presets;
DROP POLICY IF EXISTS "Users can update their own dashboard presets" ON dashboard_presets;
DROP POLICY IF EXISTS "Users can delete their own dashboard presets" ON dashboard_presets;

-- Create RLS policies
CREATE POLICY "Users can view their own dashboard presets"
  ON dashboard_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard presets"
  ON dashboard_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard presets"
  ON dashboard_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard presets"
  ON dashboard_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE dashboard_presets IS 'Stores custom dashboard layout presets for users';
