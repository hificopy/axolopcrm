# Workflow Function Fix Instructions

## Problem

The backend container is showing this error:

```
Error fetching pending executions: {
  code: 'PGRST202',
  details: 'Searched for the function public.get_pending_workflow_executions with parameter p_limit or with a single unnamed json/jsonb parameter, but no matches were found in the schema cache.',
  hint: 'Perhaps you meant to call the function public.get_member_roles_with_permissions',
  message: 'Could not find the function public.get_pending_workflow_executions(p_limit) in the schema cache'
}
```

## Root Cause

The migration `003_workflow_schema_clean.sql` dropped the function `get_pending_workflow_executions` but the backend workflow execution engines still call it.

## Solution

Execute this SQL in your Supabase Dashboard > SQL Editor:

```sql
-- Create the missing function
CREATE OR REPLACE FUNCTION get_pending_workflow_executions(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    id UUID,
    workflow_id UUID,
    trigger_type TEXT,
    trigger_data JSONB,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
        SELECT
            ae.id,
            ae.workflow_id,
            COALESCE(aw.trigger_type, 'manual')::TEXT as trigger_type,
            ae.trigger_data,
            ae.status,
            ae.created_at,
            ae.updated_at
        FROM automation_executions ae
        LEFT JOIN automation_workflows aw ON ae.workflow_id = aw.id
        WHERE ae.status = 'PENDING'
        ORDER BY ae.created_at ASC
        LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) IS 'Returns pending workflow executions from automation_executions table for the workflow execution engine';
```

## Steps to Apply Fix

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL above
4. Click "Run" to execute
5. Verify the fix by checking backend logs - the error should disappear

## Verification

After applying the fix, the backend should stop showing the error and workflow execution should work properly.

## Files Created

- `fix-workflow-function-corrected.sql` - Contains the SQL fix
- `WORKFLOW_FUNCTION_FIX_INSTRUCTIONS.md` - This instruction file
