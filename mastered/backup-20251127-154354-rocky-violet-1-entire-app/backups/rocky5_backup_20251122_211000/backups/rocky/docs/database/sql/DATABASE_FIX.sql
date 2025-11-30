-- ========================================
-- AXOLOP CRM - DATABASE FIX
-- ========================================
-- This file creates all missing tables needed for the CRM
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
-- ========================================

BEGIN;

-- ==============================================
-- 1. CREATE EMAIL TEMPLATES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    category VARCHAR(100),
    description TEXT,

    -- SendGrid integration
    sendgrid_template_id VARCHAR(255),
    sendgrid_version_id VARCHAR(255),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,

    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(name)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

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
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(name)
);

CREATE INDEX IF NOT EXISTS idx_automation_workflows_active ON automation_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_trigger ON automation_workflows(trigger_type);

-- ==============================================
-- 3. CREATE AUTOMATION EXECUTIONS TABLE
-- ==============================================

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_automation_executions_workflow
        FOREIGN KEY (workflow_id)
        REFERENCES automation_workflows(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow_id ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_created ON automation_executions(created_at);

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

    UNIQUE(name),

    CONSTRAINT fk_email_campaigns_template
        FOREIGN KEY (template_id)
        REFERENCES email_templates(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);

-- ==============================================
-- 5. CREATE CAMPAIGN EMAILS TABLE
-- ==============================================

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
    last_clicked_url TEXT,

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

CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_email ON campaign_emails(email_address);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_contact_id ON campaign_emails(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_emails_lead_id ON campaign_emails(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_emails_sent_at ON campaign_emails(sent_at);

-- ==============================================
-- 6. CREATE CAMPAIGN PERFORMANCE TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    date DATE NOT NULL,

    -- Metrics
    sent INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    unique_opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    spam_reports INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,

    -- Rates (calculated)
    delivery_rate DECIMAL(5,2) DEFAULT 0.00,
    open_rate DECIMAL(5,2) DEFAULT 0.00,
    click_rate DECIMAL(5,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    unsubscribe_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_campaign_performance_campaign
        FOREIGN KEY (campaign_id)
        REFERENCES email_campaigns(id)
        ON DELETE CASCADE,

    UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON campaign_performance(date);

-- ==============================================
-- 7. CREATE FORMS TABLE (if not exists)
-- ==============================================

CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{"branding": true, "analytics": true, "notifications": true, "mode": "standard", "theme": "default"}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    total_responses INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_lead_score DECIMAL(10,2) DEFAULT 0.00,
    public_url VARCHAR(500),
    embed_code TEXT,
    create_contact BOOLEAN DEFAULT false,
    contact_mapping JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_forms_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_published ON forms(is_published);

-- ==============================================
-- 8. CREATE UPDATE TIMESTAMP TRIGGERS
-- ==============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_email_templates_timestamp ON email_templates;
CREATE TRIGGER update_email_templates_timestamp
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

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

DROP TRIGGER IF EXISTS update_campaign_performance_timestamp ON campaign_performance;
CREATE TRIGGER update_campaign_performance_timestamp
    BEFORE UPDATE ON campaign_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

COMMIT;

-- ========================================
-- DATABASE FIX COMPLETE
-- ========================================
-- All tables have been created successfully
-- Next steps:
-- 1. Restart backend: npm run dev:backend
-- 2. Test forms creation
-- 3. Test email campaigns
-- 4. Test workflow automation
-- ========================================
