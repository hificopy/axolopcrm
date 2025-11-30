// ============================================
// MANUAL DATABASE INSTRUCTIONS
// ============================================
// Since automated execution failed, here are manual steps to apply the fixes
// ============================================

console.log(`
🔧 MANUAL DATABASE FIX INSTRUCTIONS
=====================================

The automated script couldn't execute SQL directly due to Supabase limitations.
Please follow these manual steps:

STEP 1: Apply Leads Table Fixes
--------------------------------
Go to your Supabase Dashboard → SQL Editor and run these commands one by one:

-- Add missing columns to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT false;

-- Update existing records
UPDATE public.leads 
SET 
  title = COALESCE(name, 'Untitled Lead'),
  first_name = COALESCE(SPLIT_PART(name, ' ', 1), ''),
  last_name = COALESCE(SPLIT_PART(name, ' ', 2), ''),
  score = COALESCE(lead_score, 0)
WHERE title IS NULL OR first_name IS NULL OR last_name IS NULL OR score IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leads_title ON public.leads(title);
CREATE INDEX IF NOT EXISTS idx_leads_first_name ON public.leads(first_name);
CREATE INDEX IF NOT EXISTS idx_leads_last_name ON public.leads(last_name);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_form_id ON public.leads(form_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON public.leads(user_id, status);

STEP 2: Create Monday.com Tables (Optional for now)
--------------------------------------------------
For now, let's focus on the leads table fixes first.
The Monday.com tables can be created later once leads are working.

STEP 3: Test the Fix
-------------------
After applying the SQL above, test with:
npm run test:leads

This should now work because the leads table will have the required columns.

STEP 4: Security Fix
-------------------
Remember to update your .env file to remove the exposed service role key:
- Replace the actual service role key with a placeholder
- Generate a new service role key from Supabase Dashboard if needed

=====================================
Once you've applied these fixes manually, the leads system should work properly!
`);
