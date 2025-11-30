-- Migration: Fix Workflow Schema (Safe Version)
-- Date: 2025-11-23
-- Description: Creates missing workflow tables without relying on existing schema

BEGIN;

-- ==============================================
-- 1. CREATE AUTOMATION WORKFLOWS TABLE
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
    user_id UUID, -- For user isolation
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'automation_workflows_name_user_id_key'
    ) THEN
        ALTER TABLE automation_workflows
        ADD CONSTRAINT automation_workflows_name_user_id_key
        UNIQUE(name, user_id);
    END IF;
END $$;

-- ==============================================
-- 2. CREATE AUTOMATION EXECUTIONS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
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
    user_id UUID, -- For user isolation
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_automation_executions_workflow'
    ) THEN
        ALTER TABLE automation_executions
        ADD CONSTRAINT fk_automation_executions_workflow
        FOREIGN KEY (workflow_id)
        REFERENCES automation_workflows(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ==============================================
-- 3. CREATE EMAIL CAMPAIGNS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    from_email VARCHAR(255),
    from_name VARCHAR(255),
    reply_to VARCHAR(255),

    -- Campaign content
    template_id UUID,
    html_content TEXT,
    text_content TEXT,

    -- Campaign settings
    status VARCHAR(50) DEFAULT 'draft',
    campaign_type VARCHAR(50) DEFAULT 'email',

    -- Targeting
    segment_id UUID,
    target_list_id UUID,
    filters JSONB DEFAULT '{}'::jsonb,

    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    send_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(100) DEFAULT 'UTC',

    -- Tracking
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,

    -- Analytics
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    total_complained INTEGER DEFAULT 0,

    -- Metadata
    user_id UUID, -- For user isolation
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- 4. CREATE CAMPAIGN EMAILS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS campaign_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,

    -- Recipient
    contact_id UUID,
    lead_id UUID,
    email_address VARCHAR(255) NOT NULL,

    -- Sending
    status VARCHAR(50) DEFAULT 'pending',
    send_attempts INTEGER DEFAULT 0,
    last_send_attempt TIMESTAMP WITH TIME ZONE,

    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    first_opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    first_clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    complained_at TIMESTAMP WITH TIME ZONE,

    -- Analytics
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,

    -- Email details
    message_id VARCHAR(255),
    subject VARCHAR(500),

    -- Error handling
    error_message TEXT,
    bounce_type VARCHAR(50),
    bounce_reason TEXT,

    -- Metadata
    user_id UUID, -- For user isolation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_campaign_emails_campaign'
    ) THEN
        ALTER TABLE campaign_emails
        ADD CONSTRAINT fk_campaign_emails_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES email_campaigns(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ==============================================
-- 5. CREATE INDEXES
-- ==============================================

-- Automation workflows indexes
CREATE INDEX IF NOT EXISTS idx_automation_workflows_user_id ON automation_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_active ON automation_workflows(is_active) WHERE deleted_at IS NULL;

-- Automation executions indexes
CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow_id ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_user_id ON automation_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_created ON automation_executions(created_at);

-- Email campaigns indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);

-- Campaign emails indexes
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_email ON campaign_emails(email_address);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_user_id ON campaign_emails(user_id);

-- ==============================================
-- 6. CREATE UPDATE TIMESTAMP TRIGGER
-- ==============================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
BEGIN
    -- automation_workflows
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_automation_workflows_timestamp') THEN
        CREATE TRIGGER update_automation_workflows_timestamp
            BEFORE UPDATE ON automation_workflows
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
    END IF;

    -- automation_executions
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_automation_executions_timestamp') THEN
        CREATE TRIGGER update_automation_executions_timestamp
            BEFORE UPDATE ON automation_executions
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
    END IF;

    -- email_campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_campaigns_timestamp') THEN
        CREATE TRIGGER update_email_campaigns_timestamp
            BEFORE UPDATE ON email_campaigns
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
    END IF;

    -- campaign_emails
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_campaign_emails_timestamp') THEN
        CREATE TRIGGER update_campaign_emails_timestamp
            BEFORE UPDATE ON campaign_emails
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp();
    END IF;
END $$;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Workflow schema migration completed successfully!';
    RAISE NOTICE 'Created tables: automation_workflows, automation_executions, email_campaigns, campaign_emails';
END $$;
