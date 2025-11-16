-- Helper functions for Supabase

-- Function to increment a column value
CREATE OR REPLACE FUNCTION increment_column(table_name TEXT, column_name TEXT, row_id UUID)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = %L', table_name, column_name, column_name, row_id);
END;
$$ LANGUAGE plpgsql;

-- Table for Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  website TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy for leads: authenticated users can view their own leads
CREATE POLICY "Authenticated users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for leads: authenticated users can insert their own leads
CREATE POLICY "Authenticated users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for leads: authenticated users can update their own leads
CREATE POLICY "Authenticated users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for leads: authenticated users can delete their own leads
CREATE POLICY "Authenticated users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Table for Lead Import Presets
CREATE TABLE public.lead_import_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preset_name TEXT NOT NULL,
  source TEXT NOT NULL, -- e.g., 'apollo', 'hunter.io', 'evaboot', 'custom'
  mapping JSONB NOT NULL, -- Stores column mapping, e.g., {"csv_header": "db_field"}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, preset_name) -- Ensure unique preset names per user
);

-- Enable Row Level Security for lead_import_presets table
ALTER TABLE public.lead_import_presets ENABLE ROW LEVEL SECURITY;

-- Policy for lead_import_presets: authenticated users can view their own lead import presets
CREATE POLICY "Authenticated users can view their own lead import presets" ON public.lead_import_presets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for lead_import_presets: authenticated users can insert their own lead import presets
CREATE POLICY "Authenticated users can insert their own lead import presets" ON public.lead_import_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for lead_import_presets: authenticated users can update their own lead import presets
CREATE POLICY "Authenticated users can update their own lead import presets" ON public.lead_import_presets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for lead_import_presets: authenticated users can delete their own lead import presets
CREATE POLICY "Authenticated users can delete their own lead import presets" ON public.lead_import_presets
  FOR DELETE USING (auth.uid() = user_id);