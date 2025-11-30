-- Migration: 006_email_marketing_tables.sql
-- Description: Create email marketing tables for campaigns, templates, and analytics
-- Date: 2025-11-25

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EMAIL CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  preview_text VARCHAR(500),
  html_content TEXT,
  text_content TEXT,
  from_name VARCHAR(255),
  from_email VARCHAR(255),
  reply_to_email VARCHAR(255),
  type VARCHAR(50) DEFAULT 'ONE_TIME',
  target_segment JSONB,
  status VARCHAR(50) DEFAULT 'DRAFT',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  html_content TEXT,
  text_content TEXT,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL ANALYTICS CACHE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  provider VARCHAR(50) DEFAULT 'sendgrid',
  requests INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  delivery_rate DECIMAL(5,2) DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, provider)
);

-- =====================================================
-- CAMPAIGN EMAILS (RECIPIENTS TRACKING) TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  lead_id UUID,
  contact_id UUID,
  status VARCHAR(50) DEFAULT 'PENDING',
  custom_fields JSONB,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_emails ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Users can manage own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can view own campaign emails" ON campaign_emails;
DROP POLICY IF EXISTS "Service role can manage all campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "Service role can manage all templates" ON email_templates;
DROP POLICY IF EXISTS "Service role can manage all campaign emails" ON campaign_emails;

-- Users can manage their own campaigns
CREATE POLICY "Users can manage own campaigns" ON email_campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own templates
CREATE POLICY "Users can manage own templates" ON email_templates
  FOR ALL USING (auth.uid() = user_id);

-- Users can view campaign emails for their own campaigns
CREATE POLICY "Users can view own campaign emails" ON campaign_emails
  FOR ALL USING (campaign_id IN (SELECT id FROM email_campaigns WHERE user_id = auth.uid()));

-- Service role policies for backend operations
CREATE POLICY "Service role can manage all campaigns" ON email_campaigns
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all templates" ON email_templates
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all campaign emails" ON campaign_emails
  FOR ALL TO service_role USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);
CREATE INDEX IF NOT EXISTS idx_email_analytics_cache_date ON email_analytics_cache(date);
CREATE INDEX IF NOT EXISTS idx_email_analytics_cache_provider ON email_analytics_cache(provider);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON email_campaigns TO authenticated;
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON campaign_emails TO authenticated;
GRANT ALL ON email_analytics_cache TO authenticated;
GRANT ALL ON email_campaigns TO service_role;
GRANT ALL ON email_templates TO service_role;
GRANT ALL ON campaign_emails TO service_role;
GRANT ALL ON email_analytics_cache TO service_role;
