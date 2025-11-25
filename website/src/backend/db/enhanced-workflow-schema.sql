-- Enhanced Workflow Schema for Enterprise CRM Automation
-- Combines features from ActiveCampaign and GoHighLevel
-- Created: 2025

-- ==========================================
-- MAIN WORKFLOW TABLES (Already exists, this extends it)
-- ==========================================

-- Main Workflows Table
CREATE TABLE IF NOT EXISTS email_marketing_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Visual workflow data
    nodes JSONB DEFAULT '[]'::jsonb,
    edges JSONB DEFAULT '[]'::jsonb,

    -- Status and settings
    is_active BOOLEAN DEFAULT false,
    execution_mode VARCHAR(50) DEFAULT 'sequential', -- 'sequential', 'parallel'

    -- Entry limits
    max_entries INTEGER, -- NULL = unlimited
    current_entries INTEGER DEFAULT 0,

    -- Timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,

    -- Goals and analytics
    goal_type VARCHAR(50), -- 'conversions', 'engagement', 'revenue'
    goal_target INTEGER,
    goal_current INTEGER DEFAULT 0,

    -- Analytics counters
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,

    -- AI and optimization
    ai_optimization_enabled BOOLEAN DEFAULT false,
    predictive_sending_enabled BOOLEAN DEFAULT false,

    -- Metadata
    created_by UUID,
    folder_id UUID,
    tags TEXT[],
    version INTEGER DEFAULT 1,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- WORKFLOW TRIGGERS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,

    -- Trigger configuration
    trigger_type VARCHAR(100) NOT NULL,
    -- Types: FORM_SUBMITTED, LEAD_CREATED, EMAIL_OPENED, EMAIL_CLICKED,
    --        PAGE_VISITED, API_CALL, SCHEDULED_TIME, RECURRING_SCHEDULE,
    --        TAG_ADDED, TAG_REMOVED, FIELD_UPDATED, DEAL_STAGE_CHANGED,
    --        CONTACT_CREATED, CONTACT_UPDATED, TASK_COMPLETED,
    --        CALENDAR_EVENT, WEBHOOK_RECEIVED, SMS_RECEIVED, etc.

    config JSONB DEFAULT '{}'::jsonb,
    -- Config examples:
    -- {form_id: 'uuid', field_conditions: {...}}
    -- {page_url: 'https://...', visit_count: 3}
    -- {schedule: '0 9 * * *', timezone: 'America/New_York'}
    -- {tag_name: 'qualified', action: 'added'}

    -- Filters and conditions
    filters JSONB DEFAULT '{}'::jsonb,
    -- Advanced filtering:
    -- {lead_score: {min: 50}, tags: {any: ['hot', 'warm']}, custom_fields: {...}}

    -- Trigger limits
    max_triggers INTEGER, -- NULL = unlimited
    current_triggers INTEGER DEFAULT 0,

    -- Re-entry settings
    allow_reentry BOOLEAN DEFAULT false,
    reentry_cooldown_hours INTEGER DEFAULT 24,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW EXECUTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,

    -- Execution context
    contact_id UUID,
    lead_id UUID,
    opportunity_id UUID,
    email_address VARCHAR(255),
    phone_number VARCHAR(50),

    -- Trigger information
    triggered_by VARCHAR(100), -- 'manual', 'trigger', 'api', 'scheduled'
    trigger_event VARCHAR(100),
    trigger_data JSONB,

    -- Execution state
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'waiting', 'completed', 'failed', 'cancelled'
    current_node_id VARCHAR(255),
    executed_nodes JSONB DEFAULT '[]'::jsonb,

    -- Variables and context
    execution_context JSONB DEFAULT '{}'::jsonb,
    custom_variables JSONB DEFAULT '{}'::jsonb,

    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,

    -- Error handling
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    error_stack TEXT,

    -- Goal tracking
    goals_achieved JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW ACTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES email_workflow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,

    -- Action details
    action_type VARCHAR(100) NOT NULL,
    -- Types: EMAIL, SMS, INTERNAL_NOTIFICATION, TAG_ADD, TAG_REMOVE,
    --        FIELD_UPDATE, TASK_CREATE, WEBHOOK, API_CALL,
    --        OPPORTUNITY_CREATE, OPPORTUNITY_UPDATE, PIPELINE_MOVE,
    --        LEAD_SCORE_UPDATE, ASSIGN_TO_USER, CREATE_CONTACT,
    --        UPDATE_CONTACT, CALENDAR_EVENT_CREATE, SEND_SLACK_MESSAGE,
    --        TRIGGER_WORKFLOW, STOP_WORKFLOW, etc.

    action_config JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed', 'skipped'

    -- Results
    result JSONB,
    error_message TEXT,

    -- Retry
    retry_count INTEGER DEFAULT 0,

    -- Timing
    executed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW CONDITIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES email_workflow_executions(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,

    -- Condition details
    condition_type VARCHAR(100) NOT NULL,
    -- Types: FIELD_COMPARE, TAG_CHECK, EMAIL_STATUS, LEAD_SCORE,
    --        MULTI_FIELD, NESTED_LOGIC, TIME_BASED, ENGAGEMENT_SCORE,
    --        CUSTOM_LOGIC, WEBHOOK_RESPONSE, etc.

    condition_config JSONB NOT NULL,
    -- Examples:
    -- Single field: {field: 'status', operator: 'equals', value: 'qualified'}
    -- Multi-field: {logic: 'AND', conditions: [{...}, {...}]}
    -- Nested: {logic: 'OR', groups: [{logic: 'AND', conditions: [...]}, ...]}

    result BOOLEAN NOT NULL,
    path_taken VARCHAR(50), -- 'true', 'false', 'branch_a', 'branch_b', etc.

    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW DELAYS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_delays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES email_workflow_executions(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,

    -- Delay configuration
    delay_type VARCHAR(50) NOT NULL, -- 'TIME_DELAY', 'WAIT_UNTIL', 'WAIT_FOR_EVENT'

    -- Time-based delays
    delay_amount INTEGER,
    delay_unit VARCHAR(20), -- 'minutes', 'hours', 'days', 'weeks'

    -- Wait until specific time
    wait_until_date DATE,
    wait_until_time TIME,

    -- Wait for event
    wait_for_event_type VARCHAR(100),
    wait_for_event_config JSONB,
    timeout_hours INTEGER DEFAULT 168, -- 7 days default

    -- Scheduling
    scheduled_resume_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resumed_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'completed', 'timeout', 'cancelled'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW GOALS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES email_workflow_executions(id) ON DELETE CASCADE,

    -- Goal definition
    goal_type VARCHAR(100) NOT NULL,
    -- Types: EMAIL_CLICKED, FORM_SUBMITTED, PAGE_VISITED, PURCHASE_MADE,
    --        DEAL_CLOSED, MEETING_SCHEDULED, etc.

    goal_config JSONB,
    skip_to_node_id VARCHAR(255), -- Node to jump to when goal is achieved

    -- Status
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW SPLIT TESTS (A/B Testing)
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_split_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL,

    -- Split configuration
    split_name VARCHAR(255),
    variant_a_percentage INTEGER DEFAULT 50,
    variant_b_percentage INTEGER DEFAULT 50,
    variant_c_percentage INTEGER DEFAULT 0,
    variant_d_percentage INTEGER DEFAULT 0,

    -- Results tracking
    variant_a_count INTEGER DEFAULT 0,
    variant_b_count INTEGER DEFAULT 0,
    variant_c_count INTEGER DEFAULT 0,
    variant_d_count INTEGER DEFAULT 0,

    variant_a_conversions INTEGER DEFAULT 0,
    variant_b_conversions INTEGER DEFAULT 0,
    variant_c_conversions INTEGER DEFAULT 0,
    variant_d_conversions INTEGER DEFAULT 0,

    -- Winner determination
    winning_variant VARCHAR(10),
    winner_selected_at TIMESTAMP WITH TIME ZONE,
    auto_select_winner BOOLEAN DEFAULT false,
    min_sample_size INTEGER DEFAULT 100,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW TEMPLATES
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'lead_nurture', 'onboarding', 'sales', 'support', etc.

    -- Template data
    nodes JSONB NOT NULL,
    edges JSONB NOT NULL,
    default_settings JSONB,

    -- Metadata
    use_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    estimated_setup_time INTEGER, -- in minutes

    -- Tags and search
    tags TEXT[],
    industry TEXT[], -- 'real_estate', 'saas', 'ecommerce', etc.

    -- Preview
    preview_image_url VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORKFLOW ANALYTICS
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Execution metrics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,

    -- Contact metrics
    unique_contacts INTEGER DEFAULT 0,
    new_contacts_added INTEGER DEFAULT 0,

    -- Action metrics
    emails_sent INTEGER DEFAULT 0,
    sms_sent INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    webhooks_called INTEGER DEFAULT 0,

    -- Engagement metrics
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    forms_submitted INTEGER DEFAULT 0,

    -- Conversion metrics
    goals_achieved INTEGER DEFAULT 0,
    deals_created INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,

    -- Performance metrics
    avg_execution_time_seconds INTEGER,
    avg_completion_time_hours DECIMAL(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(workflow_id, date)
);

-- ==========================================
-- WORKFLOW FOLDERS (Organization)
-- ==========================================

CREATE TABLE IF NOT EXISTS email_workflow_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_folder_id UUID REFERENCES email_workflow_folders(id) ON DELETE CASCADE,
    color VARCHAR(20),
    icon VARCHAR(50),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INTERNAL NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS workflow_internal_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES email_workflow_executions(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES email_marketing_workflows(id) ON DELETE CASCADE,

    -- Notification details
    recipient_user_id UUID NOT NULL,
    notification_type VARCHAR(50), -- 'slack', 'email', 'in_app', 'sms'

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

    -- Status
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Links and actions
    action_url VARCHAR(500),
    action_label VARCHAR(100),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_workflows_active ON email_marketing_workflows(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_folder ON email_marketing_workflows(folder_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON email_marketing_workflows(created_by);

CREATE INDEX IF NOT EXISTS idx_triggers_workflow ON email_workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_triggers_type ON email_workflow_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_triggers_active ON email_workflow_triggers(is_active);

CREATE INDEX IF NOT EXISTS idx_executions_workflow ON email_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON email_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_contact ON email_workflow_executions(contact_id);
CREATE INDEX IF NOT EXISTS idx_executions_lead ON email_workflow_executions(lead_id);
CREATE INDEX IF NOT EXISTS idx_executions_scheduled ON email_workflow_executions(scheduled_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_actions_execution ON email_workflow_actions(execution_id);
CREATE INDEX IF NOT EXISTS idx_actions_type ON email_workflow_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_actions_status ON email_workflow_actions(status);

CREATE INDEX IF NOT EXISTS idx_conditions_execution ON email_workflow_conditions(execution_id);
CREATE INDEX IF NOT EXISTS idx_delays_execution ON email_workflow_delays(execution_id);
CREATE INDEX IF NOT EXISTS idx_delays_resume ON email_workflow_delays(scheduled_resume_at, status);

CREATE INDEX IF NOT EXISTS idx_analytics_workflow_date ON email_workflow_analytics(workflow_id, date);
CREATE INDEX IF NOT EXISTS idx_templates_category ON email_workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON email_workflow_templates(is_featured);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON workflow_internal_notifications(recipient_user_id, is_read);

-- ==========================================
-- DATABASE FUNCTIONS
-- ==========================================

-- Function to queue a workflow execution
CREATE OR REPLACE FUNCTION queue_workflow_execution(
    p_workflow_id UUID,
    p_triggered_by VARCHAR(100),
    p_trigger_event VARCHAR(100),
    p_trigger_data JSONB DEFAULT '{}'::jsonb,
    p_contact_id UUID DEFAULT NULL,
    p_lead_id UUID DEFAULT NULL,
    p_opportunity_id UUID DEFAULT NULL,
    p_email_address VARCHAR(255) DEFAULT NULL,
    p_phone_number VARCHAR(50) DEFAULT NULL,
    p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_execution_id UUID;
BEGIN
    INSERT INTO email_workflow_executions (
        workflow_id,
        triggered_by,
        trigger_event,
        trigger_data,
        contact_id,
        lead_id,
        opportunity_id,
        email_address,
        phone_number,
        scheduled_at,
        status
    ) VALUES (
        p_workflow_id,
        p_triggered_by,
        p_trigger_event,
        p_trigger_data,
        p_contact_id,
        p_lead_id,
        p_opportunity_id,
        p_email_address,
        p_phone_number,
        COALESCE(p_scheduled_at, CURRENT_TIMESTAMP),
        CASE WHEN p_scheduled_at IS NULL THEN 'pending' ELSE 'scheduled' END
    )
    RETURNING id INTO v_execution_id;

    -- Update workflow counter
    UPDATE email_marketing_workflows
    SET total_executions = total_executions + 1
    WHERE id = p_workflow_id;

    RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending workflow executions
CREATE OR REPLACE FUNCTION get_pending_workflow_executions(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    execution_id UUID,
    workflow_id UUID,
    workflow_name VARCHAR(255),
    nodes JSONB,
    edges JSONB,
    contact_id UUID,
    lead_id UUID,
    opportunity_id UUID,
    email_address VARCHAR(255),
    phone_number VARCHAR(50),
    trigger_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id AS execution_id,
        e.workflow_id,
        w.name AS workflow_name,
        w.nodes,
        w.edges,
        e.contact_id,
        e.lead_id,
        e.opportunity_id,
        e.email_address,
        e.phone_number,
        e.trigger_data
    FROM email_workflow_executions e
    INNER JOIN email_marketing_workflows w ON e.workflow_id = w.id
    WHERE e.status = 'pending'
    AND w.is_active = true
    AND w.deleted_at IS NULL
    AND (e.scheduled_at IS NULL OR e.scheduled_at <= CURRENT_TIMESTAMP)
    ORDER BY e.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get delayed executions ready to resume
CREATE OR REPLACE FUNCTION get_delayed_executions_to_resume()
RETURNS TABLE (
    execution_id UUID,
    workflow_id UUID,
    node_id VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.execution_id,
        d.workflow_id,
        d.node_id
    FROM email_workflow_delays d
    WHERE d.status = 'waiting'
    AND d.scheduled_resume_at <= CURRENT_TIMESTAMP
    ORDER BY d.scheduled_resume_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to record workflow analytics
CREATE OR REPLACE FUNCTION record_workflow_analytics(
    p_workflow_id UUID,
    p_date DATE,
    p_metric VARCHAR(50),
    p_value INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    -- Upsert analytics record
    INSERT INTO email_workflow_analytics (workflow_id, date)
    VALUES (p_workflow_id, p_date)
    ON CONFLICT (workflow_id, date) DO NOTHING;

    -- Update specific metric
    CASE p_metric
        WHEN 'execution' THEN
            UPDATE email_workflow_analytics
            SET total_executions = total_executions + p_value
            WHERE workflow_id = p_workflow_id AND date = p_date;
        WHEN 'success' THEN
            UPDATE email_workflow_analytics
            SET successful_executions = successful_executions + p_value
            WHERE workflow_id = p_workflow_id AND date = p_date;
        WHEN 'failed' THEN
            UPDATE email_workflow_analytics
            SET failed_executions = failed_executions + p_value
            WHERE workflow_id = p_workflow_id AND date = p_date;
        WHEN 'email_sent' THEN
            UPDATE email_workflow_analytics
            SET emails_sent = emails_sent + p_value
            WHERE workflow_id = p_workflow_id AND date = p_date;
        WHEN 'sms_sent' THEN
            UPDATE email_workflow_analytics
            SET sms_sent = sms_sent + p_value
            WHERE workflow_id = p_workflow_id AND date = p_date;
        WHEN 'goal_achieved' THEN
            UPDATE email_workflow_analytics
            SET goals_achieved = goals_achieved + p_value
            WHERE workflow_id = p_workflow_id AND date = p_date;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON email_marketing_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON email_workflow_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executions_updated_at BEFORE UPDATE ON email_workflow_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_split_tests_updated_at BEFORE UPDATE ON email_workflow_split_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON email_workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON email_workflow_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
