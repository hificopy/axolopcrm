-- ========================================
-- SendGrid Integration Database Schema
-- ========================================
-- This schema supports full SendGrid email marketing functionality
-- including events tracking, suppressions, and analytics

-- Email Events Table (tracks all email events from SendGrid webhooks)
CREATE TABLE IF NOT EXISTS email_events (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- delivered, open, click, bounce, dropped, spam_report, unsubscribe
  timestamp TIMESTAMP NOT NULL,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  message_id VARCHAR(255),
  response TEXT,
  reason TEXT,
  url TEXT, -- for click events
  user_agent TEXT,
  ip VARCHAR(45),
  provider VARCHAR(50) DEFAULT 'sendgrid',
  raw_data JSONB, -- full webhook payload
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_events_email (email),
  INDEX idx_email_events_campaign (campaign_id),
  INDEX idx_email_events_type (event_type),
  INDEX idx_email_events_timestamp (timestamp)
);

-- Email Suppressions Table (bounces, blocks, spam reports, unsubscribes)
CREATE TABLE IF NOT EXISTS email_suppressions (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- bounces, blocks, spam_reports, unsubscribes
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  provider VARCHAR(50) DEFAULT 'sendgrid',
  UNIQUE(email, type)
);

-- Indexes for suppressions
CREATE INDEX IF NOT EXISTS idx_email_suppressions_email ON email_suppressions(email);
CREATE INDEX IF NOT EXISTS idx_email_suppressions_type ON email_suppressions(type);

-- Add new columns to campaign_emails table for SendGrid tracking
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS bounce_reason TEXT;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS click_count INT DEFAULT 0;
ALTER TABLE campaign_emails ADD COLUMN IF NOT EXISTS last_clicked_url TEXT;

-- SendGrid Contact Sync Table (track sync status between Supabase and SendGrid)
CREATE TABLE IF NOT EXISTS sendgrid_contact_sync (
  id BIGSERIAL PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  sendgrid_contact_id VARCHAR(255),
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contact_id)
);

-- SendGrid Template Sync Table (track templates synced to SendGrid)
CREATE TABLE IF NOT EXISTS sendgrid_template_sync (
  id BIGSERIAL PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  sendgrid_template_id VARCHAR(255),
  sendgrid_version_id VARCHAR(255),
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id)
);

-- SendGrid Lists (contact lists in SendGrid)
CREATE TABLE IF NOT EXISTS sendgrid_lists (
  id BIGSERIAL PRIMARY KEY,
  sendgrid_list_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  contact_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Analytics Cache (cache SendGrid stats for faster dashboard loading)
CREATE TABLE IF NOT EXISTS email_analytics_cache (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  provider VARCHAR(50) DEFAULT 'sendgrid',
  requests INT DEFAULT 0,
  delivered INT DEFAULT 0,
  opens INT DEFAULT 0,
  unique_opens INT DEFAULT 0,
  clicks INT DEFAULT 0,
  unique_clicks INT DEFAULT 0,
  bounces INT DEFAULT 0,
  spam_reports INT DEFAULT 0,
  unsubscribes INT DEFAULT 0,
  delivery_rate DECIMAL(5,2),
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  bounce_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, provider)
);

CREATE INDEX IF NOT EXISTS idx_analytics_cache_date ON email_analytics_cache(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_sendgrid_contact_sync_updated_at BEFORE UPDATE ON sendgrid_contact_sync
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sendgrid_template_sync_updated_at BEFORE UPDATE ON sendgrid_template_sync
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sendgrid_lists_updated_at BEFORE UPDATE ON sendgrid_lists
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_analytics_cache_updated_at BEFORE UPDATE ON email_analytics_cache
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics

-- Email performance summary view
CREATE OR REPLACE VIEW email_performance_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(CASE WHEN event_type = 'delivered' THEN 1 END) as delivered,
  COUNT(CASE WHEN event_type = 'open' THEN 1 END) as opens,
  COUNT(DISTINCT CASE WHEN event_type = 'open' THEN email END) as unique_opens,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as clicks,
  COUNT(DISTINCT CASE WHEN event_type = 'click' THEN email END) as unique_clicks,
  COUNT(CASE WHEN event_type = 'bounce' THEN 1 END) as bounces,
  COUNT(CASE WHEN event_type = 'spam_report' THEN 1 END) as spam_reports,
  COUNT(CASE WHEN event_type = 'unsubscribe' THEN 1 END) as unsubscribes
FROM email_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Campaign performance view
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
  c.id,
  c.name,
  c.subject,
  c.status,
  COUNT(ce.id) as total_sent,
  COUNT(CASE WHEN ce.status = 'DELIVERED' THEN 1 END) as delivered,
  COUNT(CASE WHEN ce.opened_at IS NOT NULL THEN 1 END) as opened,
  COUNT(CASE WHEN ce.clicked_at IS NOT NULL THEN 1 END) as clicked,
  COUNT(CASE WHEN ce.status = 'BOUNCED' THEN 1 END) as bounced,
  COUNT(CASE WHEN ce.unsubscribed_at IS NOT NULL THEN 1 END) as unsubscribed,
  ROUND(COUNT(CASE WHEN ce.opened_at IS NOT NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN ce.status = 'DELIVERED' THEN 1 END), 0) * 100, 2) as open_rate,
  ROUND(COUNT(CASE WHEN ce.clicked_at IS NOT NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN ce.status = 'DELIVERED' THEN 1 END), 0) * 100, 2) as click_rate,
  c.created_at,
  c.scheduled_at,
  c.sent_at
FROM email_campaigns c
LEFT JOIN campaign_emails ce ON c.id = ce.campaign_id
GROUP BY c.id, c.name, c.subject, c.status, c.created_at, c.scheduled_at, c.sent_at
ORDER BY c.created_at DESC;

-- Comments for documentation
COMMENT ON TABLE email_events IS 'Stores all email events from SendGrid webhooks';
COMMENT ON TABLE email_suppressions IS 'Stores emails that should not receive emails (bounces, unsubscribes, etc)';
COMMENT ON TABLE sendgrid_contact_sync IS 'Tracks sync status of contacts between Supabase and SendGrid';
COMMENT ON TABLE sendgrid_template_sync IS 'Tracks sync status of templates between Supabase and SendGrid';
COMMENT ON TABLE sendgrid_lists IS 'Stores SendGrid contact lists';
COMMENT ON TABLE email_analytics_cache IS 'Cached email analytics for faster dashboard loading';

-- Grant permissions (adjust based on your database setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
