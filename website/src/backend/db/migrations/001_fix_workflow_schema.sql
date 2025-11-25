-- Migration: Fix Workflow Schema Mismatch and Add Missing Tables
-- Date: 2025-11-17
-- Description: Fixes the mismatch between code expectations and database schema

BEGIN;

-- ==============================================
-- 1. CREATE MISSING TABLES FOR AUTOMATION ENGINE
-- ==============================================

-- Create automation_workflows table (if using old schema name)
-- Check if we need to rename or create new
DO $$
BEGIN
    -- If email_marketing_workflows exists, create a view for compatibility
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_marketing_workflows') THEN
        -- Create view for backward compatibility
        CREATE OR REPLACE VIEW automation_workflows AS
        SELECT * FROM email_marketing_workflows;

        RAISE NOTICE 'Created view automation_workflows -> email_marketing_workflows';
    ELSE
        -- Create the table if it doesn't exist
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
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(name)
        );

        RAISE NOTICE 'Created table automation_workflows';
    END IF;

    -- Do the same for executions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_workflow_executions') THEN
        CREATE OR REPLACE VIEW automation_executions AS
        SELECT
            id,
            workflow_id,
            triggered_by as trigger_entity_type,
            trigger_data,
            contact_id,
            lead_id,
            email_address,
            status,
            current_node_id,
            executed_nodes,
            execution_log,
            error_message,
            started_at,
            completed_at,
            created_at,
            updated_at
        FROM email_workflow_executions;

        RAISE NOTICE 'Created view automation_executions -> email_workflow_executions';
    ELSE
        CREATE TABLE IF NOT EXISTS automation_executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workflow_id UUID NOT NULL,
            trigger_entity_id UUID,
            trigger_entity_type VARCHAR(100),
            trigger_data JSONB,
            status VARCHAR(50) DEFAULT 'PENDING',
            current_node_id VARCHAR(255),
            executed_nodes JSONB DEFAULT '[]'::jsonb,
            execution_log JSONB DEFAULT '[]'::jsonb,
            error_message TEXT,
            started_at TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            execution_time_ms INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Created table automation_executions';
    END IF;
END $$;

-- ==============================================
-- 2. CREATE EMAIL CAMPAIGN TABLES
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
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, cancelled
    campaign_type VARCHAR(50) DEFAULT 'email', -- email, sms, push

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
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS campaign_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,

    -- Recipient
    contact_id UUID,
    lead_id UUID,
    email_address VARCHAR(255) NOT NULL,

    -- Sending
    status VARCHAR(50) DEFAULT 'pending', -- pending, sending, sent, delivered, bounced, failed
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
    bounce_type VARCHAR(50), -- hard, soft, complaint
    bounce_reason TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_campaign_emails_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES email_campaigns(id)
        ON DELETE CASCADE
);

-- ==============================================
-- 3. CREATE WORKFLOW STEPS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS automation_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(100) NOT NULL, -- TRIGGER, EMAIL, CONDITION, DELAY, etc.
    step_config JSONB DEFAULT '{}'::jsonb,
    position INTEGER DEFAULT 0,
    parent_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key only if table exists (not view)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'automation_workflows'
        AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE automation_workflow_steps
        ADD CONSTRAINT fk_steps_workflow
        FOREIGN KEY (workflow_id)
        REFERENCES automation_workflows(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ==============================================
-- 4. CREATE INDEXES
-- ==============================================

-- Email campaigns indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);

-- Campaign emails indexes
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_email ON campaign_emails(email_address);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_contact_id ON campaign_emails(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_emails_lead_id ON campaign_emails(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_emails_sent_at ON campaign_emails(sent_at);

-- Workflow steps indexes
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON automation_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_position ON automation_workflow_steps(workflow_id, position);

-- ==============================================
-- 5. CREATE HELPER FUNCTIONS
-- ==============================================

-- Function to get pending executions (compatible with both table and view)
CREATE OR REPLACE FUNCTION get_pending_automation_executions(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    execution_id UUID,
    workflow_id UUID,
    trigger_entity_id UUID,
    trigger_entity_type VARCHAR(100),
    trigger_data JSONB,
    status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id as execution_id,
        e.workflow_id,
        e.trigger_entity_id,
        e.trigger_entity_type,
        e.trigger_data,
        e.status
    FROM automation_executions e
    WHERE e.status = 'PENDING'
    ORDER BY e.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
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

-- ==============================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES
-- ==============================================

-- Add tags column to leads if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'tags'
    ) THEN
        ALTER TABLE leads ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added tags column to leads';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contacts' AND column_name = 'tags'
    ) THEN
        ALTER TABLE contacts ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added tags column to contacts';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'lead_score'
    ) THEN
        ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 0;
        CREATE INDEX idx_leads_score ON leads(lead_score);
        RAISE NOTICE 'Added lead_score column to leads';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'leads' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE leads ADD COLUMN assigned_to UUID;
        RAISE NOTICE 'Added assigned_to column to leads';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'contacts' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE contacts ADD COLUMN assigned_to UUID;
        RAISE NOTICE 'Added assigned_to column to contacts';
    END IF;
END $$;

-- ==============================================
-- 7. CREATE TASKS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT

    -- Assignment
    assigned_to_id UUID,

    -- Relations
    entity_type VARCHAR(100),
    entity_id UUID,
    contact_id UUID,
    lead_id UUID,
    opportunity_id UUID,

    -- Timing
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Automation
    auto_created BOOLEAN DEFAULT false,

    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(entity_type, entity_id);

-- ==============================================
-- 8. CREATE NOTIFICATIONS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- workflow, task, email, system
    message TEXT NOT NULL,
    title VARCHAR(255),

    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Related entity
    related_entity_type VARCHAR(100),
    related_entity_id UUID,

    -- Actions
    action_url TEXT,
    action_label VARCHAR(100),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ==============================================
-- 9. CREATE EMAIL EVENTS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, bounced, complained

    -- Relations
    campaign_id UUID,
    campaign_email_id UUID,
    message_id VARCHAR(255),

    -- Event data
    event_data JSONB DEFAULT '{}'::jsonb,

    -- Tracking
    ip_address INET,
    user_agent TEXT,
    url TEXT, -- for click events

    -- Timestamp
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_events_email ON email_events(email);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_timestamp ON email_events(event_timestamp);

COMMIT;

-- Done!
-- Migration completed successfully
