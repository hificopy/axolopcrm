-- Calendar Integration Schema for Axolop CRM
-- This schema supports Google Calendar integration and calendar visibility presets

-- ==================== Calendar Integrations Table ====================
-- Stores OAuth tokens for calendar providers (Google Calendar, etc.)

CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'google', -- google, outlook, apple, etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry BIGINT, -- Unix timestamp in milliseconds
  scope TEXT[], -- Array of scopes granted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON calendar_integrations(user_id);

-- ==================== Calendar Presets Table ====================
-- Stores user's calendar visibility and display preferences

CREATE TABLE IF NOT EXISTS calendar_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_name VARCHAR(255) DEFAULT 'My Calendar Preset',

  -- Visibility settings for CRM event categories
  visible_categories JSONB DEFAULT '{
    "sales": {
      "enabled": true,
      "subcategories": {
        "salesCalls": true,
        "meetings": true,
        "demos": true,
        "followUps": true,
        "closingEvents": true
      }
    },
    "marketing": {
      "enabled": true,
      "subcategories": {
        "emailCampaigns": true,
        "webinars": true,
        "contentPublishing": true,
        "socialMediaPosts": true,
        "adCampaigns": true
      }
    },
    "service": {
      "enabled": true,
      "subcategories": {
        "supportCalls": true,
        "maintenanceWindows": true,
        "customerCheckIns": true,
        "trainingsSessions": true,
        "renewalReminders": true
      }
    }
  }'::jsonb,

  -- Array of Google Calendar IDs that are visible
  visible_google_calendars TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Display preferences
  default_view VARCHAR(20) DEFAULT 'month', -- month, week, day, agenda
  time_zone VARCHAR(100) DEFAULT 'America/New_York',
  week_start VARCHAR(10) DEFAULT 'sunday', -- sunday, monday
  business_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_calendar_presets_user_id ON calendar_presets(user_id);

-- ==================== CRM Activities Table ====================
-- Stores CRM activities that appear on the calendar (calls, meetings, demos, etc.)

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity details
  type VARCHAR(50) NOT NULL, -- call, meeting, demo, follow_up, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30, -- Duration in minutes

  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  outcome TEXT, -- Notes about the outcome

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_scheduled_at ON crm_activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact_id ON crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opportunity_id ON crm_activities(opportunity_id);

-- ==================== Webinars Table ====================
-- Stores scheduled webinars

CREATE TABLE IF NOT EXISTS webinars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- Duration in minutes

  -- Webinar details
  platform VARCHAR(50), -- zoom, google_meet, teams, etc.
  meeting_url TEXT,
  registration_url TEXT,
  max_attendees INTEGER,

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, live, completed, cancelled

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webinars_user_id ON webinars(user_id);
CREATE INDEX IF NOT EXISTS idx_webinars_scheduled_at ON webinars(scheduled_at);

-- ==================== Content Schedule Table ====================
-- Stores scheduled content publishing dates

CREATE TABLE IF NOT EXISTS content_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(50), -- blog, video, podcast, ebook, etc.
  description TEXT,
  publish_date DATE NOT NULL,

  -- Publishing details
  platform VARCHAR(50), -- wordpress, youtube, medium, etc.
  url TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, published, draft

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_schedule_user_id ON content_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_content_schedule_publish_date ON content_schedule(publish_date);

-- ==================== Social Media Schedule Table ====================
-- Stores scheduled social media posts

CREATE TABLE IF NOT EXISTS social_media_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  platform VARCHAR(50), -- twitter, linkedin, facebook, instagram, etc.
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Media attachments
  media_urls TEXT[],

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, posted, failed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_media_schedule_user_id ON social_media_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_schedule_scheduled_at ON social_media_schedule(scheduled_at);

-- ==================== Ad Campaigns Table ====================
-- Stores advertising campaign schedules

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50), -- google_ads, facebook_ads, linkedin_ads, etc.

  start_date DATE NOT NULL,
  end_date DATE,

  budget DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, paused, completed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user_id ON ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_start_date ON ad_campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_end_date ON ad_campaigns(end_date);

-- ==================== Support Calls Table ====================
-- Stores scheduled support calls

CREATE TABLE IF NOT EXISTS support_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30,

  customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  ticket_id VARCHAR(100), -- Reference to support ticket

  status VARCHAR(50) DEFAULT 'scheduled',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_calls_user_id ON support_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_support_calls_scheduled_at ON support_calls(scheduled_at);

-- ==================== Maintenance Windows Table ====================
-- Stores scheduled maintenance windows

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,

  affected_services TEXT[],
  status VARCHAR(50) DEFAULT 'scheduled',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_windows_user_id ON maintenance_windows(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_start_time ON maintenance_windows(start_time);

-- ==================== Customer Check-ins Table ====================
-- Stores scheduled customer check-in calls

CREATE TABLE IF NOT EXISTS customer_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,

  customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  type VARCHAR(50) DEFAULT 'regular', -- regular, onboarding, renewal, escalation

  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_checkins_user_id ON customer_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_checkins_scheduled_at ON customer_checkins(scheduled_at);

-- ==================== Training Sessions Table ====================
-- Stores scheduled training sessions

CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,

  trainer VARCHAR(255),
  platform VARCHAR(50),
  meeting_url TEXT,

  max_attendees INTEGER,
  status VARCHAR(50) DEFAULT 'scheduled',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_scheduled_at ON training_sessions(scheduled_at);

-- ==================== Contracts Table ====================
-- Stores contract information including renewal dates

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  customer_name VARCHAR(255) NOT NULL,
  customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  start_date DATE NOT NULL,
  end_date DATE,
  renewal_date DATE,

  value DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active', -- active, expiring, expired, renewed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_renewal_date ON contracts(renewal_date);

-- ==================== RLS Policies ====================
-- Row Level Security policies to ensure users can only see their own data

-- Calendar Integrations RLS
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY calendar_integrations_user_policy ON calendar_integrations
  FOR ALL
  USING (auth.uid() = user_id);

-- Calendar Presets RLS
ALTER TABLE calendar_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY calendar_presets_user_policy ON calendar_presets
  FOR ALL
  USING (auth.uid() = user_id);

-- CRM Activities RLS
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY crm_activities_user_policy ON crm_activities
  FOR ALL
  USING (auth.uid() = user_id);

-- All other calendar tables RLS
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
CREATE POLICY webinars_user_policy ON webinars FOR ALL USING (auth.uid() = user_id);

ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_schedule_user_policy ON content_schedule FOR ALL USING (auth.uid() = user_id);

ALTER TABLE social_media_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_media_schedule_user_policy ON social_media_schedule FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY ad_campaigns_user_policy ON ad_campaigns FOR ALL USING (auth.uid() = user_id);

ALTER TABLE support_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_calls_user_policy ON support_calls FOR ALL USING (auth.uid() = user_id);

ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_windows_user_policy ON maintenance_windows FOR ALL USING (auth.uid() = user_id);

ALTER TABLE customer_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_checkins_user_policy ON customer_checkins FOR ALL USING (auth.uid() = user_id);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY training_sessions_user_policy ON training_sessions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_user_policy ON contracts FOR ALL USING (auth.uid() = user_id);

-- ==================== Functions ====================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_presets_updated_at BEFORE UPDATE ON calendar_presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON crm_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webinars_updated_at BEFORE UPDATE ON webinars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_schedule_updated_at BEFORE UPDATE ON content_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_media_schedule_updated_at BEFORE UPDATE ON social_media_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_calls_updated_at BEFORE UPDATE ON support_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_windows_updated_at BEFORE UPDATE ON maintenance_windows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_checkins_updated_at BEFORE UPDATE ON customer_checkins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
