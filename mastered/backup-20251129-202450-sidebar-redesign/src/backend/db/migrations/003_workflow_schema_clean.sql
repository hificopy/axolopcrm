-- Migration: Clean and Fix Workflow Schema
-- Date: 2025-11-23
-- Description: Safely creates workflow tables by cleaning up old views/functions first

BEGIN;

-- ==============================================
-- 1. DROP ANY CONFLICTING VIEWS/FUNCTIONS
-- ==============================================

-- Drop tables first (CASCADE will drop dependent views)
DROP TABLE IF EXISTS automation_executions CASCADE;
DROP TABLE IF EXISTS automation_workflows CASCADE;
DROP TABLE IF EXISTS campaign_emails CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;

-- Drop any remaining views
DROP VIEW IF EXISTS workflow_executions CASCADE;

-- Drop any problematic functions
DROP FUNCTION IF EXISTS get_pending_automation_executions(INTEGER);
DROP FUNCTION IF EXISTS get_pending_workflow_executions(INTEGER);

DO $$ BEGIN
    RAISE NOTICE 'Cleaned up old views and functions';
END $$;

-- ==============================================
-- 2. CREATE AUTOMATION WORKFLOWS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100),
    trigger_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    is_paused BOOLEAN DEFAULT false,
    nodes JSONB DEFAULT '[]'::jsonb,
    edges JSONB DEFAULT '[]'::jsonb,
    execution_mode VARCHAR(50) DEFAULT 'sequential',
    max_concurrent_executions INTEGER DEFAULT 100,
    retry_failed_steps BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

DO $$ BEGIN
    RAISE NOTICE 'Created automation_workflows table';
END $$;

-- ==============================================
-- 3. CREATE AUTOMATION EXECUTIONS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID,
    trigger_entity_id UUID,
    trigger_entity_type VARCHAR(100),
    trigger_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'PENDING',
    current_node_id VARCHAR(255),
    executed_nodes JSONB DEFAULT '[]'::jsonb,
    execution_log JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    contact_id UUID,
    lead_id UUID,
    user_id UUID,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
    RAISE NOTICE 'Created automation_executions table';
END $$;

-- ==============================================
-- 4. CREATE EMAIL CAMPAIGNS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    from_email VARCHAR(255),
    from_name VARCHAR(255),
    reply_to VARCHAR(255),
    template_id UUID,
    html_content TEXT,
    text_content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    campaign_type VARCHAR(50) DEFAULT 'email',
    segment_id UUID,
    target_list_id UUID,
    filters JSONB DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    send_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(100) DEFAULT 'UTC',
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_complained INTEGER DEFAULT 0,
    user_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

DO $$ BEGIN
    RAISE NOTICE 'Created email_campaigns table';
END $$;

-- ==============================================
-- 5. CREATE CAMPAIGN EMAILS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS campaign_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID,
    contact_id UUID,
    lead_id UUID,
    email_address VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    send_attempts INTEGER DEFAULT 0,
    last_send_attempt TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    first_opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    first_clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    complained_at TIMESTAMP WITH TIME ZONE,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    message_id VARCHAR(255),
    subject VARCHAR(500),
    error_message TEXT,
    bounce_type VARCHAR(50),
    bounce_reason TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
    RAISE NOTICE 'Created campaign_emails table';
END $$;

-- ==============================================
-- 6. ADD FOREIGN KEYS (AFTER ALL TABLES EXIST)
-- ==============================================

-- Add foreign key to automation_executions
DO $$
BEGIN
    -- Check if foreign key already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_automation_executions_workflow'
        AND table_name = 'automation_executions'
    ) THEN
        -- Only add if both tables exist and workflow_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_workflows')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'automation_executions' AND column_name = 'workflow_id')
        THEN
            ALTER TABLE automation_executions
            ADD CONSTRAINT fk_automation_executions_workflow
            FOREIGN KEY (workflow_id)
            REFERENCES automation_workflows(id)
            ON DELETE SET NULL;

            RAISE NOTICE 'Added foreign key: automation_executions -> automation_workflows';
        END IF;
    END IF;
END $$;

-- Add foreign key to campaign_emails
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_campaign_emails_campaign'
        AND table_name = 'campaign_emails'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_campaigns')
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_emails' AND column_name = 'campaign_id')
        THEN
            ALTER TABLE campaign_emails
            ADD CONSTRAINT fk_campaign_emails_campaign
            FOREIGN KEY (campaign_id)
            REFERENCES email_campaigns(id)
            ON DELETE SET NULL;

            RAISE NOTICE 'Added foreign key: campaign_emails -> email_campaigns';
        END IF;
    END IF;
END $$;

-- ==============================================
-- 7. CREATE INDEXES
-- ==============================================

-- Automation workflows
CREATE INDEX IF NOT EXISTS idx_automation_workflows_user_id ON automation_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_active ON automation_workflows(is_active) WHERE deleted_at IS NULL;

-- Automation executions
CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow_id ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_user_id ON automation_executions(user_id);

-- Email campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);

-- Campaign emails
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_email ON campaign_emails(email_address);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_user_id ON campaign_emails(user_id);

DO $$ BEGIN
    RAISE NOTICE 'Created indexes';
END $$;

-- ==============================================
-- 8. CREATE TIMESTAMP TRIGGER FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_automation_workflows_timestamp ON automation_workflows;
CREATE TRIGGER update_automation_workflows_timestamp
    BEFORE UPDATE ON automation_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_automation_executions_timestamp ON automation_executions;
CREATE TRIGGER update_automation_executions_timestamp
    BEFORE UPDATE ON automation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_email_campaigns_timestamp ON email_campaigns;
CREATE TRIGGER update_email_campaigns_timestamp
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_campaign_emails_timestamp ON campaign_emails;
CREATE TRIGGER update_campaign_emails_timestamp
    BEFORE UPDATE ON campaign_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DO $$ BEGIN
    RAISE NOTICE 'Created update triggers';
END $$;

COMMIT;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - automation_workflows';
    RAISE NOTICE '  - automation_executions';
    RAISE NOTICE '  - email_campaigns';
    RAISE NOTICE '  - campaign_emails';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Update .env: ENABLE_WORKFLOWS=true';
    RAISE NOTICE '  2. Restart your backend';
    RAISE NOTICE '';
END $$;
