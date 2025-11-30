CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  entity_type TEXT NOT NULL DEFAULT 'lead',
  options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  group_name TEXT,
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, field_name, entity_type)
);

ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own custom field definitions" ON custom_field_definitions;
CREATE POLICY "Users can view their own custom field definitions"
  ON custom_field_definitions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own custom field definitions" ON custom_field_definitions;
CREATE POLICY "Users can create their own custom field definitions"
  ON custom_field_definitions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own custom field definitions" ON custom_field_definitions;
CREATE POLICY "Users can update their own custom field definitions"
  ON custom_field_definitions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own custom field definitions" ON custom_field_definitions;
CREATE POLICY "Users can delete their own custom field definitions"
  ON custom_field_definitions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP INDEX IF EXISTS idx_custom_field_definitions_user_entity;
CREATE INDEX idx_custom_field_definitions_user_entity ON custom_field_definitions(user_id, entity_type, is_active);

DROP INDEX IF EXISTS idx_custom_field_definitions_display_order;
CREATE INDEX idx_custom_field_definitions_display_order ON custom_field_definitions(user_id, entity_type, display_order);

CREATE TABLE IF NOT EXISTS lead_import_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'custom',
  industry_id TEXT,
  mapping JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  UNIQUE(user_id, preset_name)
);

ALTER TABLE lead_import_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own import presets" ON lead_import_presets;
CREATE POLICY "Users can view their own import presets"
  ON lead_import_presets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own import presets" ON lead_import_presets;
CREATE POLICY "Users can create their own import presets"
  ON lead_import_presets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own import presets" ON lead_import_presets;
CREATE POLICY "Users can update their own import presets"
  ON lead_import_presets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own import presets" ON lead_import_presets;
CREATE POLICY "Users can delete their own import presets"
  ON lead_import_presets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP INDEX IF EXISTS idx_lead_import_presets_user;
CREATE INDEX idx_lead_import_presets_user ON lead_import_presets(user_id);

DROP INDEX IF EXISTS idx_lead_import_presets_last_used;
CREATE INDEX idx_lead_import_presets_last_used ON lead_import_presets(user_id, last_used_at DESC);

CREATE TABLE IF NOT EXISTS lead_import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry_id TEXT,
  preset_id UUID REFERENCES lead_import_presets(id) ON DELETE SET NULL,
  file_name TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  mapping JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lead_import_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own import history" ON lead_import_history;
CREATE POLICY "Users can view their own import history"
  ON lead_import_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own import history" ON lead_import_history;
CREATE POLICY "Users can create their own import history"
  ON lead_import_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP INDEX IF EXISTS idx_lead_import_history_user;
CREATE INDEX idx_lead_import_history_user ON lead_import_history(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_custom_field_definitions_updated_at ON custom_field_definitions;
CREATE TRIGGER update_custom_field_definitions_updated_at
  BEFORE UPDATE ON custom_field_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_import_presets_updated_at ON lead_import_presets;
CREATE TRIGGER update_lead_import_presets_updated_at
  BEFORE UPDATE ON lead_import_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();