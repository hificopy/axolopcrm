-- Dashboard Presets Table
-- Stores custom dashboard layouts and configurations for users

CREATE TABLE IF NOT EXISTS dashboard_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB NOT NULL, -- Stores the widget layout configuration
  base_preset VARCHAR(50) DEFAULT 'default', -- Base preset it was created from
  is_custom BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- User's default dashboard
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_user_id ON dashboard_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_presets_is_default ON dashboard_presets(user_id, is_default) WHERE is_default = true;

-- Enable Row Level Security
ALTER TABLE dashboard_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own presets
CREATE POLICY "Users can view own dashboard presets"
  ON dashboard_presets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own presets
CREATE POLICY "Users can create own dashboard presets"
  ON dashboard_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update own dashboard presets"
  ON dashboard_presets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete own dashboard presets"
  ON dashboard_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dashboard_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER dashboard_presets_updated_at
  BEFORE UPDATE ON dashboard_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_presets_updated_at();

-- Function to ensure only one default preset per user
CREATE OR REPLACE FUNCTION ensure_single_default_preset()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE dashboard_presets
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default preset
CREATE TRIGGER ensure_single_default_preset_trigger
  BEFORE INSERT OR UPDATE ON dashboard_presets
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_preset();

-- Sample comment
COMMENT ON TABLE dashboard_presets IS 'Stores custom dashboard layouts and configurations for users';
COMMENT ON COLUMN dashboard_presets.layout IS 'JSONB array of widget configurations including position, size, and component type';
COMMENT ON COLUMN dashboard_presets.base_preset IS 'The industry preset this custom layout was based on (default, realtor, brokerage, b2b, agency, creator, ecommerce)';
COMMENT ON COLUMN dashboard_presets.is_default IS 'Whether this is the user''s default dashboard view';
