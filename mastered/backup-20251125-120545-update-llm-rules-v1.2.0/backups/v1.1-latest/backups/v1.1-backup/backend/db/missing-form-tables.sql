-- Missing Forms Tables - Additional tables needed for complete form functionality

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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_campaign_triggers_updated_at BEFORE UPDATE ON form_campaign_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_emails_updated_at BEFORE UPDATE ON campaign_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_executions_updated_at BEFORE UPDATE ON automation_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();