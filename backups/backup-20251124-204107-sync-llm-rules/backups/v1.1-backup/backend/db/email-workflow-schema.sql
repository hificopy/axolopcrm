-- Email Marketing Workflow Schema
-- This creates the database structure for email marketing automation workflows

-- Email Marketing Workflows Table - Main workflow definitions
CREATE TABLE IF NOT EXISTS email_marketing_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Workflow status
    is_active BOOLEAN DEFAULT false,

    -- Visual workflow data (stored as JSON for React Flow)
    nodes JSONB DEFAULT '[]'::jsonb, -- Array of workflow nodes
    edges JSONB DEFAULT '[]'::jsonb, -- Array of workflow edges/connections

    -- Execution settings
    execution_mode VARCHAR(50) DEFAULT 'sequential', -- 'sequential', 'parallel'
    max_concurrent_executions INTEGER DEFAULT 100,
    retry_failed_steps BOOLEAN DEFAULT true,
    max_retries INTEGER DEFAULT 3,

    -- Analytics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,

    -- Metadata
    created_by UUID, -- User ID who created this workflow
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_executed_at TIMESTAMP WITH TIME ZONE,

    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(name)
);

-- Email Workflow Executions Table - Tracks each workflow execution
CREATE TABLE IF NOT EXISTS email_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,

    -- Execution context
    triggered_by VARCHAR(50) NOT NULL, -- 'manual', 'trigger', 'schedule'
    trigger_event VARCHAR(100), -- Event that triggered this execution
    trigger_data JSONB, -- Data related to the trigger

    -- Target information
    contact_id UUID, -- Contact being processed (if applicable)
    lead_id UUID, -- Lead being processed (if applicable)
    email_address VARCHAR(255),

    -- Execution status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
    current_step_index INTEGER DEFAULT 0,
    current_node_id VARCHAR(255),

    -- Path tracking
    executed_nodes JSONB DEFAULT '[]'::jsonb, -- Array of executed node IDs with timestamps
    execution_log JSONB DEFAULT '[]'::jsonb, -- Detailed log of each step

    -- Error handling
    error_message TEXT,
    error_stack TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_executions_workflow FOREIGN KEY (workflow_id)
        REFERENCES email_marketing_workflows(id) ON DELETE CASCADE
);

-- Email Workflow Triggers Table - Defines what triggers workflows
CREATE TABLE IF NOT EXISTS email_workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,

    -- Trigger type
    trigger_type VARCHAR(100) NOT NULL, -- 'LEAD_CREATED', 'EMAIL_OPENED', 'EMAIL_CLICKED', etc.

    -- Trigger configuration
    config JSONB DEFAULT '{}'::jsonb, -- Additional configuration for the trigger
    filters JSONB DEFAULT '{}'::jsonb, -- Filters to apply before triggering

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Analytics
    total_triggers INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_triggers_workflow FOREIGN KEY (workflow_id)
        REFERENCES email_marketing_workflows(id) ON DELETE CASCADE
);

-- Email Workflow Actions Table - Stores action results
CREATE TABLE IF NOT EXISTS email_workflow_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL,
    node_id VARCHAR(255) NOT NULL,

    -- Action details
    action_type VARCHAR(100) NOT NULL, -- 'EMAIL', 'TAG_ASSIGNMENT', 'FIELD_UPDATE', etc.
    action_config JSONB, -- Configuration data for the action

    -- Execution details
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed', 'skipped'
    result JSONB, -- Result data from the action
    error_message TEXT,

    -- For email actions
    email_id UUID, -- Reference to sent email if applicable
    email_subject VARCHAR(255),
    email_template_id VARCHAR(255),

    -- Timestamps
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_actions_execution FOREIGN KEY (execution_id)
        REFERENCES email_workflow_executions(id) ON DELETE CASCADE
);

-- Email Workflow Delays Table - Tracks delayed executions
CREATE TABLE IF NOT EXISTS email_workflow_delays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL,
    node_id VARCHAR(255) NOT NULL,

    -- Delay configuration
    delay_type VARCHAR(50) NOT NULL, -- 'TIME_DELAY', 'WAIT_UNTIL', 'WAIT_FOR_EVENT'
    delay_amount INTEGER, -- Amount of time to delay
    delay_unit VARCHAR(20), -- 'minutes', 'hours', 'days', 'weeks'
    wait_until_date TIMESTAMP WITH TIME ZONE, -- Specific date/time to wait until
    wait_for_event VARCHAR(100), -- Event to wait for

    -- Status
    status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'completed', 'cancelled'
    scheduled_resume_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resumed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_workflow_delays_execution FOREIGN KEY (execution_id)
        REFERENCES email_workflow_executions(id) ON DELETE CASCADE
);

-- Email Workflow Conditions Table - Tracks condition evaluations
CREATE TABLE IF NOT EXISTS email_workflow_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL,
    node_id VARCHAR(255) NOT NULL,

    -- Condition configuration
    condition_type VARCHAR(100) NOT NULL, -- 'FIELD_COMPARE', 'TAG_CHECK', 'EMAIL_STATUS', etc.
    condition_config JSONB,

    -- Evaluation result
    result BOOLEAN NOT NULL, -- true = condition met, false = condition not met
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_conditions_execution FOREIGN KEY (execution_id)
        REFERENCES email_workflow_executions(id) ON DELETE CASCADE
);

-- Email Workflow Templates Table - Email templates for workflows
CREATE TABLE IF NOT EXISTS email_workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,

    -- Template content
    html_content TEXT NOT NULL,
    text_content TEXT,

    -- Template variables
    variables JSONB DEFAULT '[]'::jsonb, -- Array of available variables

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Analytics
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,

    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_active ON email_marketing_workflows(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON email_marketing_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON email_marketing_workflows(created_at);

CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON email_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON email_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_contact_id ON email_workflow_executions(contact_id);
CREATE INDEX IF NOT EXISTS idx_executions_lead_id ON email_workflow_executions(lead_id);
CREATE INDEX IF NOT EXISTS idx_executions_email ON email_workflow_executions(email_address);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON email_workflow_executions(started_at);

CREATE INDEX IF NOT EXISTS idx_triggers_workflow_id ON email_workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_triggers_type ON email_workflow_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_triggers_active ON email_workflow_triggers(is_active);

CREATE INDEX IF NOT EXISTS idx_actions_execution_id ON email_workflow_actions(execution_id);
CREATE INDEX IF NOT EXISTS idx_actions_node_id ON email_workflow_actions(node_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON email_workflow_actions(status);

CREATE INDEX IF NOT EXISTS idx_delays_execution_id ON email_workflow_delays(execution_id);
CREATE INDEX IF NOT EXISTS idx_delays_status ON email_workflow_delays(status);
CREATE INDEX IF NOT EXISTS idx_delays_scheduled_resume ON email_workflow_delays(scheduled_resume_at);

CREATE INDEX IF NOT EXISTS idx_conditions_execution_id ON email_workflow_conditions(execution_id);

CREATE INDEX IF NOT EXISTS idx_templates_active ON email_workflow_templates(is_active);

-- Triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON email_marketing_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executions_updated_at BEFORE UPDATE ON email_workflow_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at BEFORE UPDATE ON email_workflow_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON email_workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to queue a workflow for execution
CREATE OR REPLACE FUNCTION queue_workflow_execution(
    p_workflow_id UUID,
    p_triggered_by VARCHAR(50),
    p_trigger_event VARCHAR(100) DEFAULT NULL,
    p_trigger_data JSONB DEFAULT '{}'::jsonb,
    p_contact_id UUID DEFAULT NULL,
    p_lead_id UUID DEFAULT NULL,
    p_email_address VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_execution_id UUID;
BEGIN
    -- Check if workflow is active
    IF NOT EXISTS (
        SELECT 1 FROM email_marketing_workflows
        WHERE id = p_workflow_id
        AND is_active = true
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Workflow % is not active or does not exist', p_workflow_id;
    END IF;

    -- Create execution record
    INSERT INTO email_workflow_executions (
        workflow_id,
        triggered_by,
        trigger_event,
        trigger_data,
        contact_id,
        lead_id,
        email_address,
        status,
        started_at
    ) VALUES (
        p_workflow_id,
        p_triggered_by,
        p_trigger_event,
        p_trigger_data,
        p_contact_id,
        p_lead_id,
        p_email_address,
        'pending',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_execution_id;

    -- Update workflow analytics
    UPDATE email_marketing_workflows
    SET
        total_executions = total_executions + 1,
        last_executed_at = CURRENT_TIMESTAMP
    WHERE id = p_workflow_id;

    RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get pending workflow executions
CREATE OR REPLACE FUNCTION get_pending_workflow_executions(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    execution_id UUID,
    workflow_id UUID,
    workflow_name VARCHAR(255),
    nodes JSONB,
    edges JSONB,
    contact_id UUID,
    lead_id UUID,
    email_address VARCHAR(255),
    trigger_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id as execution_id,
        e.workflow_id,
        w.name as workflow_name,
        w.nodes,
        w.edges,
        e.contact_id,
        e.lead_id,
        e.email_address,
        e.trigger_data
    FROM email_workflow_executions e
    JOIN email_marketing_workflows w ON e.workflow_id = w.id
    WHERE e.status = 'pending'
    AND w.is_active = true
    AND w.deleted_at IS NULL
    ORDER BY e.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get workflows that should be resumed after delay
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
        e.workflow_id,
        d.node_id
    FROM email_workflow_delays d
    JOIN email_workflow_executions e ON d.execution_id = e.id
    WHERE d.status = 'waiting'
    AND d.scheduled_resume_at <= CURRENT_TIMESTAMP
    ORDER BY d.scheduled_resume_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to evaluate a condition node
CREATE OR REPLACE FUNCTION evaluate_workflow_condition(
    p_condition_type VARCHAR(100),
    p_condition_config JSONB,
    p_context JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_result BOOLEAN := false;
    v_field VARCHAR(255);
    v_operator VARCHAR(50);
    v_value TEXT;
    v_context_value TEXT;
BEGIN
    CASE p_condition_type
        WHEN 'FIELD_COMPARE' THEN
            v_field := p_condition_config->>'field';
            v_operator := p_condition_config->>'operator';
            v_value := p_condition_config->>'value';
            v_context_value := p_context->>v_field;

            CASE v_operator
                WHEN 'equals' THEN
                    v_result := v_context_value = v_value;
                WHEN 'not_equals' THEN
                    v_result := v_context_value != v_value OR v_context_value IS NULL;
                WHEN 'contains' THEN
                    v_result := v_context_value LIKE '%' || v_value || '%';
                WHEN 'not_contains' THEN
                    v_result := v_context_value NOT LIKE '%' || v_value || '%' OR v_context_value IS NULL;
                WHEN 'greater_than' THEN
                    v_result := (v_context_value::NUMERIC) > (v_value::NUMERIC);
                WHEN 'less_than' THEN
                    v_result := (v_context_value::NUMERIC) < (v_value::NUMERIC);
                WHEN 'is_empty' THEN
                    v_result := v_context_value IS NULL OR v_context_value = '';
                WHEN 'is_not_empty' THEN
                    v_result := v_context_value IS NOT NULL AND v_context_value != '';
                ELSE
                    v_result := false;
            END CASE;

        WHEN 'TAG_CHECK' THEN
            -- Check if contact/lead has a specific tag
            -- Implementation depends on your tags table structure
            v_result := true; -- Placeholder

        WHEN 'EMAIL_STATUS' THEN
            -- Check email open/click status
            -- Implementation depends on your email tracking
            v_result := true; -- Placeholder

        WHEN 'LEAD_SCORE' THEN
            -- Check lead score threshold
            v_field := p_context->>'lead_score';
            v_operator := p_condition_config->>'scoreOperator';
            v_value := p_condition_config->>'scoreValue';

            CASE v_operator
                WHEN 'greater_than' THEN
                    v_result := (v_field::INTEGER) > (v_value::INTEGER);
                WHEN 'less_than' THEN
                    v_result := (v_field::INTEGER) < (v_value::INTEGER);
                WHEN 'equals' THEN
                    v_result := (v_field::INTEGER) = (v_value::INTEGER);
                ELSE
                    v_result := false;
            END CASE;

        ELSE
            -- Unknown condition type
            v_result := false;
    END CASE;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE email_marketing_workflows IS 'Main table for storing email marketing automation workflows';
COMMENT ON TABLE email_workflow_executions IS 'Tracks each execution instance of a workflow';
COMMENT ON TABLE email_workflow_triggers IS 'Defines what events trigger workflows';
COMMENT ON TABLE email_workflow_actions IS 'Records each action performed during workflow execution';
COMMENT ON TABLE email_workflow_delays IS 'Manages delayed workflow executions';
COMMENT ON TABLE email_workflow_conditions IS 'Tracks condition evaluations in workflows';
COMMENT ON TABLE email_workflow_templates IS 'Email templates used in workflows';
