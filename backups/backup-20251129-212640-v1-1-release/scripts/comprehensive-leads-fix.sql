-- ============================================
-- COMPREHENSIVE LEADS SYSTEM FIX
-- ============================================
-- Date: November 26, 2025
-- Priority: CRITICAL
-- Fixes: Leads table missing columns, Monday.com integration issues
-- ============================================

-- 1. FIX LEADS TABLE SCHEMA
-- Add missing columns that the backend expects

-- Add title column (missing from schema)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Add first_name and last_name columns (for B2C leads)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Add score column (lead_score vs score inconsistency)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Add form_id column (for leads created from forms)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL;

-- Add is_placeholder_data column (for demo data)
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT false;

-- Update existing records to populate new columns
UPDATE public.leads 
SET 
  title = COALESCE(name, 'Untitled Lead'),
  first_name = COALESCE(SPLIT_PART(name, ' ', 1), ''),
  last_name = COALESCE(SPLIT_PART(name, ' ', 2), ''),
  score = COALESCE(lead_score, 0)
WHERE title IS NULL OR first_name IS NULL OR last_name IS NULL OR score IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.leads.title IS 'Lead title or job title for display purposes';
COMMENT ON COLUMN public.leads.first_name IS 'First name for B2C leads';
COMMENT ON COLUMN public.leads.last_name IS 'Last name for B2C leads';
COMMENT ON COLUMN public.leads.score IS 'Lead score (alias for lead_score)';
COMMENT ON COLUMN public.leads.form_id IS 'Source form ID if lead was created from form submission';
COMMENT ON COLUMN public.leads.is_placeholder_data IS 'Flag for demo/test data';

-- Update indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_title ON public.leads(title);
CREATE INDEX IF NOT EXISTS idx_leads_first_name ON public.leads(first_name);
CREATE INDEX IF NOT EXISTS idx_leads_last_name ON public.leads(last_name);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_form_id ON public.leads(form_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON public.leads(user_id, status);

-- 2. CREATE MONDAY.COM STYLE BOARD TABLES
-- Tables for Monday.com-like functionality

-- Board items table (for Monday.com style boards)
CREATE TABLE IF NOT EXISTS public.board_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    board_id VARCHAR(255) NOT NULL DEFAULT 'default',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    position INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.board_items(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Board columns configuration (for dynamic board layouts)
CREATE TABLE IF NOT EXISTS public.board_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    board_id VARCHAR(255) NOT NULL DEFAULT 'default',
    column_key VARCHAR(100) NOT NULL,
    column_label VARCHAR(255) NOT NULL,
    column_type VARCHAR(50) DEFAULT 'text',
    width INTEGER DEFAULT 200,
    position INTEGER DEFAULT 0,
    is_editable BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Board views/presets
CREATE TABLE IF NOT EXISTS public.board_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_board_items_user_id ON public.board_items(user_id);
CREATE INDEX IF NOT EXISTS idx_board_items_board_id ON public.board_items(board_id);
CREATE INDEX IF NOT EXISTS idx_board_items_status ON public.board_items(status);
CREATE INDEX IF NOT EXISTS idx_board_items_priority ON public.board_items(priority);
CREATE INDEX IF NOT EXISTS idx_board_items_due_date ON public.board_items(due_date);
CREATE INDEX IF NOT EXISTS idx_board_items_position ON public.board_items(board_id, position);

CREATE INDEX IF NOT EXISTS idx_board_columns_user_board ON public.board_columns(user_id, board_id);
CREATE INDEX IF NOT EXISTS idx_board_columns_position ON public.board_columns(board_id, position);

CREATE INDEX IF NOT EXISTS idx_board_presets_user_id ON public.board_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_board_presets_default ON public.board_presets(user_id, is_default);

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for board_items
DROP POLICY IF EXISTS "Users can view their own board items" ON public.board_items;
CREATE POLICY "Users can view their own board items"
    ON public.board_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own board items" ON public.board_items;
CREATE POLICY "Users can insert their own board items"
    ON public.board_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own board items" ON public.board_items;
CREATE POLICY "Users can update their own board items"
    ON public.board_items FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own board items" ON public.board_items;
CREATE POLICY "Users can delete their own board items"
    ON public.board_items FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for board_columns
DROP POLICY IF EXISTS "Users can view their own board columns" ON public.board_columns;
CREATE POLICY "Users can view their own board columns"
    ON public.board_columns FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own board columns" ON public.board_columns;
CREATE POLICY "Users can insert their own board columns"
    ON public.board_columns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own board columns" ON public.board_columns;
CREATE POLICY "Users can update their own board columns"
    ON public.board_columns FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own board columns" ON public.board_columns;
CREATE POLICY "Users can delete their own board columns"
    ON public.board_columns FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for board_presets
DROP POLICY IF EXISTS "Users can view their own board presets" ON public.board_presets;
CREATE POLICY "Users can view their own board presets"
    ON public.board_presets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own board presets" ON public.board_presets;
CREATE POLICY "Users can insert their own board presets"
    ON public.board_presets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own board presets" ON public.board_presets;
CREATE POLICY "Users can update their own board presets"
    ON public.board_presets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own board presets" ON public.board_presets;
CREATE POLICY "Users can delete their own board presets"
    ON public.board_presets FOR DELETE
    USING (auth.uid() = user_id);

-- 5. INSERT DEFAULT BOARD COLUMNS
INSERT INTO public.board_columns (user_id, board_id, column_key, column_label, column_type, width, position, is_editable, is_visible) VALUES
    ('00000000-0000-0000-0000-000000000001', 'default', 'name', 'Name', 'text', 200, 0, true, true),
    ('00000000-0000-0000-0000-000000000001', 'default', 'status', 'Status', 'status', 120, 1, true, true),
    ('00000000-0000-0000-0000-000000000001', 'default', 'priority', 'Priority', 'priority', 100, 2, true, true),
    ('00000000-0000-0000-0000-000000000001', 'default', 'assignee', 'Assignee', 'user', 150, 3, true, true),
    ('00000000-0000-0000-0000-000000000001', 'default', 'due_date', 'Due Date', 'date', 120, 4, true, true),
    ('00000000-0000-0000-0000-000000000001', 'default', 'created_at', 'Created', 'datetime', 150, 5, false, true);

-- 6. INSERT DEFAULT BOARD PRESET
INSERT INTO public.board_presets (user_id, name, config, is_default) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Kanban Board', '{
        "view": "kanban",
        "columns": ["new", "in_progress", "completed"],
        "group_by": "status",
        "filters": {
            "status": ["new", "in_progress", "completed"]
        }
    }', true);

-- 7. SUCCESS MESSAGE
DO $$
BEGIN
    RAISE NOTICE 'Leads system fix completed successfully!';
    RAISE NOTICE 'Added missing columns: title, first_name, last_name, score, form_id, is_placeholder_data';
    RAISE NOTICE 'Created Monday.com style tables: board_items, board_columns, board_presets';
    RAISE NOTICE 'Added proper indexes and RLS policies';
    RAISE NOTICE 'System is now ready for full leads and board functionality';
END;
$$;