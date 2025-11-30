-- Migration: Add workflow columns to forms table
-- This allows forms to store their workflow visualization data

-- Add workflow_nodes column to store ReactFlow nodes
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS workflow_nodes JSONB DEFAULT '[]'::jsonb;

-- Add workflow_edges column to store ReactFlow edges/connections
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS workflow_edges JSONB DEFAULT '[]'::jsonb;

-- Add endings column to store form ending configurations
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS endings JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN forms.workflow_nodes IS 'Stores ReactFlow nodes for workflow visualization';
COMMENT ON COLUMN forms.workflow_edges IS 'Stores ReactFlow edges/connections for workflow';
COMMENT ON COLUMN forms.endings IS 'Stores form ending configurations (success/failure screens)';

-- Create index on workflow_nodes for faster queries if needed
CREATE INDEX IF NOT EXISTS idx_forms_workflow_nodes ON forms USING GIN (workflow_nodes);
CREATE INDEX IF NOT EXISTS idx_forms_endings ON forms USING GIN (endings);
