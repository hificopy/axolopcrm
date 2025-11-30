-- Fix missing database relationships and functions for authentication system
-- This addresses the critical schema errors causing background job failures

-- Fix 1: Add missing relationship between email_campaigns and email_templates
-- First, check if campaign_emails table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_emails') THEN
        CREATE TABLE campaign_emails (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
            template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
            email_to TEXT NOT NULL,
            subject TEXT,
            content TEXT,
            status TEXT DEFAULT 'pending',
            sent_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add indexes for performance
        CREATE INDEX idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
        CREATE INDEX idx_campaign_emails_status ON campaign_emails(status);
        CREATE INDEX idx_campaign_emails_sent_at ON campaign_emails(sent_at);
        
        RAISE NOTICE 'Created campaign_emails table';
    END IF;
END $$;

-- Fix 2: Create missing function get_pending_workflow_executions
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
        we.id,
        we.workflow_id,
        we.trigger_type,
        we.trigger_data,
        we.status,
        we.created_at,
        we.updated_at
    FROM workflow_executions we
    WHERE we.status = 'pending'
    ORDER BY we.created_at ASC
    LIMIT p_limit;
END;
$$;

-- Fix 3: Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at);

-- Fix 4: Ensure proper RLS policies exist
ALTER TABLE campaign_emails ENABLE ROW LEVEL SECURITY;

-- Policy for campaign_emails
CREATE POLICY "Users can view their own campaign emails"
ON campaign_emails FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM email_campaigns ec
        WHERE ec.id = campaign_emails.campaign_id
        AND ec.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own campaign emails"
ON campaign_emails FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM email_campaigns ec
        WHERE ec.id = campaign_emails.campaign_id
        AND ec.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own campaign emails"
ON campaign_emails FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM email_campaigns ec
        WHERE ec.id = campaign_emails.campaign_id
        AND ec.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own campaign emails"
ON campaign_emails FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM email_campaigns ec
        WHERE ec.id = campaign_emails.campaign_id
        AND ec.user_id = auth.uid()
    )
);

-- Fix 5: Grant proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON campaign_emails TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_workflow_executions(p_limit INTEGER) TO authenticated;
GRANT SELECT ON workflow_executions TO authenticated;

-- Fix 6: Update workflow_executions table structure if needed
DO $$
BEGIN
    -- Check if workflow_executions table exists and has required columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_executions') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_executions' AND column_name = 'trigger_type') THEN
            ALTER TABLE workflow_executions ADD COLUMN trigger_type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_executions' AND column_name = 'trigger_data') THEN
            ALTER TABLE workflow_executions ADD COLUMN trigger_data JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_executions' AND column_name = 'status') THEN
            ALTER TABLE workflow_executions ADD COLUMN status TEXT DEFAULT 'pending';
        END IF;
        
        RAISE NOTICE 'Updated workflow_executions table structure';
    END IF;
END $$;

-- Fix 7: Create missing workflow_executions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_executions') THEN
        CREATE TABLE workflow_executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
            trigger_type TEXT NOT NULL,
            trigger_data JSONB,
            status TEXT DEFAULT 'pending',
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add indexes
        CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
        CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
        CREATE INDEX idx_workflow_executions_created_at ON workflow_executions(created_at);
        
        -- Enable RLS
        ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
        
        -- Add RLS policies
        CREATE POLICY "Users can view their own workflow executions"
        ON workflow_executions FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM workflows w
                WHERE w.id = workflow_executions.workflow_id
                AND w.user_id = auth.uid()
            )
        );
        
        CREATE POLICY "Users can insert their own workflow executions"
        ON workflow_executions FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM workflows w
                WHERE w.id = workflow_executions.workflow_id
                AND w.user_id = auth.uid()
            )
        );
        
        CREATE POLICY "Users can update their own workflow executions"
        ON workflow_executions FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM workflows w
                WHERE w.id = workflow_executions.workflow_id
                AND w.user_id = auth.uid()
            )
        );
        
        -- Grant permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON workflow_executions TO authenticated;
        
        RAISE NOTICE 'Created workflow_executions table';
    END IF;
END $$;

COMMIT;