-- ========================================
-- AXOLOP CRM - COMPLETE SUPABASE SCHEMA
-- ========================================
-- Run this entire file in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
-- ========================================

-- ========================================
-- 1. FORMS TABLES
-- ========================================

-- Forms Table - Stores form definitions
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

-- Form Responses Table - Stores user submissions
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    lead_score INTEGER DEFAULT 0,
    lead_score_breakdown JSONB DEFAULT '{}'::jsonb,
    is_qualified BOOLEAN DEFAULT false,
    is_disqualified BOOLEAN DEFAULT false,
    disqualification_reason TEXT,
    contact_email VARCHAR(255),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_form_id FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Form Analytics Table
CREATE TABLE IF NOT EXISTS form_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    date DATE NOT NULL,
    hour INTEGER,
    views INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    dropoffs INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_completion_time INTEGER,
    average_lead_score DECIMAL(10,2) DEFAULT 0.00,
    qualified_leads INTEGER DEFAULT 0,
    disqualified_leads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_form_analytics_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, date, hour)
);

-- Question Analytics Table
CREATE TABLE IF NOT EXISTS question_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    views INTEGER DEFAULT 0,
    answers INTEGER DEFAULT 0,
    skips INTEGER DEFAULT 0,
    dropoffs INTEGER DEFAULT 0,
    response_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_question_analytics_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, question_id)
);

-- Form Integrations Table
CREATE TABLE IF NOT EXISTS form_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    webhook_url VARCHAR(500),
    webhook_method VARCHAR(10) DEFAULT 'POST',
    webhook_headers JSONB DEFAULT '{}'::jsonb,
    notification_email VARCHAR(255),
    email_template TEXT,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    total_triggers INTEGER DEFAULT 0,
    failed_triggers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_form_integrations_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Form Campaign Triggers Table
CREATE TABLE IF NOT EXISTS form_campaign_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    target_type VARCHAR(50),
    target_id UUID,
    campaign_config JSONB,
    workflow_config JSONB,
    webhook_config JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_form_campaign_triggers_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- ========================================
-- 2. LEADS & CONTACTS TABLES
-- ========================================

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'NEW',
    value DECIMAL(10,2) DEFAULT 0,
    source VARCHAR(100),
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    title VARCHAR(255),
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    value DECIMAL(10,2) DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'NEW',
    lead_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_opportunity_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- ========================================
-- 3. EMAIL MARKETING TABLES
-- ========================================

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    preview_text VARCHAR(500),
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    reply_to_email VARCHAR(255),
    type VARCHAR(50) DEFAULT 'ONE_TIME',
    status VARCHAR(50) DEFAULT 'DRAFT',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    html_content TEXT,
    text_content TEXT,
    target_segment JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Emails Table
CREATE TABLE IF NOT EXISTS campaign_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    subject TEXT,
    html_content TEXT,
    text_content TEXT,
    message_id VARCHAR(500),
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    lead_id UUID,
    contact_id UUID,
    form_id UUID,
    form_responses JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaign_email_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    CONSTRAINT fk_campaign_email_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    CONSTRAINT fk_campaign_email_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL
);

-- Automation Executions Table
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    trigger_entity_id UUID NOT NULL,
    trigger_entity_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    context JSONB DEFAULT '{}'::jsonb,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================

-- Forms indexes
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_is_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_is_published ON forms(is_published);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at DESC);

-- Form responses indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_is_qualified ON form_responses(is_qualified);
CREATE INDEX IF NOT EXISTS idx_form_responses_contact_email ON form_responses(contact_email);

-- Form analytics indexes
CREATE INDEX IF NOT EXISTS idx_form_analytics_form_id ON form_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_date ON form_analytics(date DESC);

-- Question analytics indexes
CREATE INDEX IF NOT EXISTS idx_question_analytics_form_id ON question_analytics(form_id);

-- Form integrations indexes
CREATE INDEX IF NOT EXISTS idx_form_integrations_form_id ON form_integrations(form_id);
CREATE INDEX IF NOT EXISTS idx_form_integrations_type ON form_integrations(integration_type);

-- Form campaign triggers indexes
CREATE INDEX IF NOT EXISTS idx_form_campaign_triggers_form_id ON form_campaign_triggers(form_id);
CREATE INDEX IF NOT EXISTS idx_form_campaign_triggers_is_active ON form_campaign_triggers(is_active);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Campaign emails indexes
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_recipient_email ON campaign_emails(recipient_email);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_lead_id ON campaign_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_contact_id ON campaign_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_form_id ON campaign_emails(form_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);

-- Automation executions indexes
CREATE INDEX IF NOT EXISTS idx_automation_executions_workflow_id ON automation_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_trigger_entity ON automation_executions(trigger_entity_id, trigger_entity_type);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- ========================================
-- 5. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_analytics_updated_at BEFORE UPDATE ON form_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_analytics_updated_at BEFORE UPDATE ON question_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_integrations_updated_at BEFORE UPDATE ON form_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_campaign_triggers_updated_at BEFORE UPDATE ON form_campaign_triggers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_emails_updated_at BEFORE UPDATE ON campaign_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_executions_updated_at BEFORE UPDATE ON automation_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ========================================

-- Insert sample form
INSERT INTO forms (title, description, is_active, is_published, questions)
VALUES (
    'Contact Form',
    'Simple contact form for lead generation',
    true,
    true,
    '[
        {
            "id": "q1",
            "type": "short_text",
            "label": "What is your name?",
            "required": true,
            "order": 1
        },
        {
            "id": "q2",
            "type": "email",
            "label": "What is your email?",
            "required": true,
            "order": 2
        },
        {
            "id": "q3",
            "type": "phone",
            "label": "What is your phone number?",
            "required": false,
            "order": 3
        }
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert sample form 2
INSERT INTO forms (title, description, is_active, is_published, questions, total_responses, conversion_rate)
VALUES (
    'Product Interest Survey',
    'Qualify leads based on product interest',
    true,
    true,
    '[
        {
            "id": "q1",
            "type": "multiple_choice",
            "label": "Which product are you interested in?",
            "required": true,
            "options": ["Product A", "Product B", "Product C"],
            "order": 1
        },
        {
            "id": "q2",
            "type": "email",
            "label": "Your email address",
            "required": true,
            "order": 2
        }
    ]'::jsonb,
    15,
    67.5
) ON CONFLICT DO NOTHING;

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_campaign_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can customize these later)
-- For development, we'll allow all operations with service role key

CREATE POLICY "Allow all for service role" ON forms
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON form_responses
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON form_analytics
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON question_analytics
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON form_integrations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON form_campaign_triggers
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON leads
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON contacts
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON opportunities
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON campaigns
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON campaign_emails
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON automation_executions
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- SETUP COMPLETE!
-- ========================================
-- All tables, indexes, triggers, and sample data created successfully.
-- Your Axolop CRM database is ready to use!
-- ========================================
