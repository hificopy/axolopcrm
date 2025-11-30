-- Migration: Add is_placeholder_data column to track demo/placeholder data
-- This allows users to easily clear all placeholder data with one click

-- Add is_placeholder_data column to leads table
ALTER TABLE IF EXISTS leads
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add is_placeholder_data column to contacts table
ALTER TABLE IF EXISTS contacts
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add is_placeholder_data column to opportunities table
ALTER TABLE IF EXISTS opportunities
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add is_placeholder_data column to forms table
ALTER TABLE IF EXISTS forms
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add is_placeholder_data column to form_responses table
ALTER TABLE IF EXISTS form_responses
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add is_placeholder_data column to email_marketing_workflows table
ALTER TABLE IF EXISTS email_marketing_workflows
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add is_placeholder_data column to email_workflow_executions table
ALTER TABLE IF EXISTS email_workflow_executions
ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_placeholder ON leads(user_id, is_placeholder_data) WHERE is_placeholder_data = true;
CREATE INDEX IF NOT EXISTS idx_contacts_placeholder ON contacts(user_id, is_placeholder_data) WHERE is_placeholder_data = true;
CREATE INDEX IF NOT EXISTS idx_opportunities_placeholder ON opportunities(user_id, is_placeholder_data) WHERE is_placeholder_data = true;
CREATE INDEX IF NOT EXISTS idx_forms_placeholder ON forms(user_id, is_placeholder_data) WHERE is_placeholder_data = true;
CREATE INDEX IF NOT EXISTS idx_workflows_placeholder ON email_marketing_workflows(created_by, is_placeholder_data) WHERE is_placeholder_data = true;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added is_placeholder_data tracking columns to all tables';
END $$;
