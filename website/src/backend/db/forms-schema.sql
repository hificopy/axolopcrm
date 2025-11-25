-- Forms Table - Stores form definitions
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "branding": true,
        "analytics": true,
        "notifications": true,
        "mode": "standard",
        "theme": "default"
    }'::jsonb,
    is_active BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    total_responses INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_lead_score DECIMAL(10,2) DEFAULT 0.00,

    -- Embedding and sharing
    public_url VARCHAR(500),
    embed_code TEXT,

    -- Lead management
    create_contact BOOLEAN DEFAULT false,
    contact_mapping JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Form Responses Table - Stores user submissions
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Lead qualification
    lead_score INTEGER DEFAULT 0,
    lead_score_breakdown JSONB DEFAULT '{}'::jsonb,
    is_qualified BOOLEAN DEFAULT false,
    is_disqualified BOOLEAN DEFAULT false,
    disqualification_reason TEXT,

    -- User info (if collected)
    contact_email VARCHAR(255),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),

    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),

    -- Processing
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_form_id FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Form Analytics Table - Aggregated analytics per form
CREATE TABLE IF NOT EXISTS form_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,

    -- Time-based metrics
    date DATE NOT NULL,
    hour INTEGER,

    -- Counts
    views INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    dropoffs INTEGER DEFAULT 0,

    -- Conversion metrics
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_completion_time INTEGER, -- in seconds

    -- Lead scoring
    average_lead_score DECIMAL(10,2) DEFAULT 0.00,
    qualified_leads INTEGER DEFAULT 0,
    disqualified_leads INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_analytics_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, date, hour)
);

-- Question Analytics Table - Per-question drop-off and response patterns
CREATE TABLE IF NOT EXISTS question_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    question_id VARCHAR(255) NOT NULL,

    -- Metrics
    views INTEGER DEFAULT 0,
    answers INTEGER DEFAULT 0,
    skips INTEGER DEFAULT 0,
    dropoffs INTEGER DEFAULT 0,

    -- Response distribution (for multiple choice, etc)
    response_distribution JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_question_analytics_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, question_id)
);

-- Form Integrations Table - Webhook and integration configs
CREATE TABLE IF NOT EXISTS form_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,

    integration_type VARCHAR(50) NOT NULL, -- webhook, email, crm, zapier, etc
    is_active BOOLEAN DEFAULT true,

    -- Configuration
    config JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Webhook specific
    webhook_url VARCHAR(500),
    webhook_method VARCHAR(10) DEFAULT 'POST',
    webhook_headers JSONB DEFAULT '{}'::jsonb,

    -- Email specific
    notification_email VARCHAR(255),
    email_template TEXT,

    -- Status
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    total_triggers INTEGER DEFAULT 0,
    failed_triggers INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_integrations_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_is_published ON forms(is_published);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_is_qualified ON form_responses(is_qualified);
CREATE INDEX IF NOT EXISTS idx_form_responses_contact_email ON form_responses(contact_email);

CREATE INDEX IF NOT EXISTS idx_form_analytics_form_id ON form_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_date ON form_analytics(date DESC);

CREATE INDEX IF NOT EXISTS idx_question_analytics_form_id ON question_analytics(form_id);

CREATE INDEX IF NOT EXISTS idx_form_integrations_form_id ON form_integrations(form_id);
CREATE INDEX IF NOT EXISTS idx_form_integrations_type ON form_integrations(integration_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_analytics_updated_at BEFORE UPDATE ON form_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_analytics_updated_at BEFORE UPDATE ON question_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_integrations_updated_at BEFORE UPDATE ON form_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Form Campaign Triggers Table - Define conditions and actions for form submissions
CREATE TABLE IF NOT EXISTS form_campaign_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'SEND_CAMPAIGN_EMAIL', 'ADD_TO_CAMPAIGN', 'CREATE_CONTACT_AND_CAMPAIGN'
    name VARCHAR(255), -- Name for the trigger
    description TEXT, -- Description of what the trigger does
    
    -- Conditions (when to trigger)
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- Conditions based on form responses
    
    -- Target (what to do when triggered)
    target_type VARCHAR(50), -- 'CAMPAIGN', 'WORKFLOW', 'WEBHOOK'
    target_id UUID, -- ID of the target (campaign_id, workflow_id, etc.)
    
    -- Configuration for different trigger types
    campaign_config JSONB, -- For creating campaign configs on the fly
    workflow_config JSONB, -- For workflow-specific configurations
    webhook_config JSONB, -- For webhook-specific configurations
    
    -- Status and scheduling
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_form_campaign_triggers_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Campaign Emails Table - Track emails sent as part of campaigns
CREATE TABLE IF NOT EXISTS campaign_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID, -- Can be null for one-off emails not part of a campaign
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, BOUNCED, OPENED, CLICKED
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Email content (for tracking purposes)
    subject TEXT,
    html_content TEXT,
    text_content TEXT,
    
    -- Tracking
    message_id VARCHAR(500), -- ID from email service provider
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Related entities
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, -- Associated lead
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Associated contact
    form_id UUID REFERENCES forms(id) ON DELETE SET NULL, -- If triggered by form
    form_responses JSONB DEFAULT '{}'::jsonb, -- Responses that triggered the email
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automation Executions Table - Track automated workflows triggered by forms
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL, -- ID of the workflow being executed
    trigger_entity_id UUID NOT NULL, -- ID of the entity that triggered the workflow (contact, lead, etc.)
    trigger_entity_type VARCHAR(50) NOT NULL, -- 'CONTACT', 'LEAD', 'FORM_RESPONSE', etc.
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    
    -- Execution context
    context JSONB DEFAULT '{}'::jsonb, -- Additional context for the execution
    current_step INTEGER DEFAULT 1, -- Current step in the workflow
    total_steps INTEGER, -- Total number of steps in the workflow
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_campaign_triggers_form_id ON form_campaign_triggers(form_id);
CREATE INDEX IF NOT EXISTS idx_form_campaign_triggers_is_active ON form_campaign_triggers(is_active);

CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_recipient_email ON campaign_emails(recipient_email);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_lead_id ON campaign_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_contact_id ON campaign_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_form_id ON campaign_emails(form_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);

CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow_id ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_trigger_entity ON automation_executions(trigger_entity_id, trigger_entity_type);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_form_campaign_triggers_updated_at BEFORE UPDATE ON form_campaign_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_emails_updated_at BEFORE UPDATE ON campaign_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_executions_updated_at BEFORE UPDATE ON automation_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
