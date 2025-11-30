-- Fix Leads Table - Add missing title column
-- Date: November 26, 2025
-- Priority: CRITICAL
-- Issue: Leads table missing 'title' column causing creation failures

-- Add missing title column
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Update existing records to use name as title temporarily
UPDATE public.leads 
SET title = COALESCE(name, 'Untitled Lead')
WHERE title IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.leads.title IS 'Lead title or name for display purposes';

-- Update indexes to include title column
CREATE INDEX IF NOT EXISTS idx_leads_title ON public.leads(title);
CREATE INDEX IF NOT EXISTS idx_leads_user_title ON public.leads(user_id, title);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Leads table title column added successfully';
END;
$$;