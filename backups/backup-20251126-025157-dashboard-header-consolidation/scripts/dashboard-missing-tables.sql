-- =============================================================================
-- Dashboard Missing Tables SQL Script
-- Run this in Supabase SQL Editor to create missing tables for full dashboard functionality
-- Created: 2025-11-25
-- FIXED: Removed agency_id references that don't exist in current schema
-- =============================================================================

-- =============================================================================
-- 1. EXPENSES TABLE - For Profit & Loss Widget
-- =============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  vendor TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT, -- monthly, quarterly, yearly
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- RLS Policy for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 2. USER_TODOS TABLE - For Task/Todo Widgets
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  related_lead_id UUID,
  related_contact_id UUID,
  related_deal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_todos
CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON user_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_due_date ON user_todos(due_date);
CREATE INDEX IF NOT EXISTS idx_user_todos_status ON user_todos(status);
CREATE INDEX IF NOT EXISTS idx_user_todos_priority ON user_todos(priority);

-- RLS Policy for user_todos
ALTER TABLE user_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own todos" ON user_todos;
CREATE POLICY "Users can manage own todos" ON user_todos
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 3. MEETINGS TABLE - For Calendar/Meetings Widgets
-- =============================================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  meeting_type TEXT DEFAULT 'call' CHECK (meeting_type IN ('call', 'video', 'in_person', 'other')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  attendees JSONB DEFAULT '[]',
  notes TEXT,
  outcome TEXT,
  no_show BOOLEAN DEFAULT FALSE,
  google_event_id TEXT,
  zoom_meeting_id TEXT,
  meeting_link TEXT,
  related_lead_id UUID,
  related_contact_id UUID,
  related_deal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for meetings
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- RLS Policy for meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own meetings" ON meetings;
CREATE POLICY "Users can manage own meetings" ON meetings
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 4. EMAIL_SUBSCRIBERS TABLE - For Marketing Metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  source TEXT, -- form, import, api, manual
  form_id UUID,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Indexes for email_subscribers
CREATE INDEX IF NOT EXISTS idx_email_subscribers_user_id ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);

-- RLS Policy for email_subscribers
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscribers" ON email_subscribers;
CREATE POLICY "Users can manage own subscribers" ON email_subscribers
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 5. EMAIL_CAMPAIGN_EVENTS TABLE - For Email Marketing Tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID,
  subscriber_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  email TEXT,
  link_url TEXT,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_campaign_events
CREATE INDEX IF NOT EXISTS idx_email_campaign_events_campaign_id ON email_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_events_subscriber_id ON email_campaign_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_events_user_id ON email_campaign_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_events_type ON email_campaign_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_campaign_events_created_at ON email_campaign_events(created_at);

-- RLS Policy for email_campaign_events
ALTER TABLE email_campaign_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own campaign events" ON email_campaign_events;
CREATE POLICY "Users can view own campaign events" ON email_campaign_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert campaign events" ON email_campaign_events;
CREATE POLICY "System can insert campaign events" ON email_campaign_events
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- 6. ACTIVITIES TABLE - For Activity Feed (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- call, email, meeting, note, task, status_change
  title TEXT NOT NULL,
  description TEXT,
  related_lead_id UUID,
  related_contact_id UUID,
  related_deal_id UUID,
  related_opportunity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- RLS Policy for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own activities" ON activities;
CREATE POLICY "Users can manage own activities" ON activities
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_todos_updated_at ON user_todos;
CREATE TRIGGER update_user_todos_updated_at
  BEFORE UPDATE ON user_todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_subscribers_updated_at ON email_subscribers;
CREATE TRIGGER update_email_subscribers_updated_at
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION QUERIES
-- Run these after creating tables to verify they exist
-- =============================================================================
/*
-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('expenses', 'user_todos', 'meetings', 'email_subscribers', 'email_campaign_events', 'activities');

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('expenses', 'user_todos', 'meetings', 'email_subscribers', 'email_campaign_events', 'activities');
*/

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Dashboard missing tables created successfully!';
  RAISE NOTICE 'Tables created: expenses, user_todos, meetings, email_subscribers, email_campaign_events, activities';
  RAISE NOTICE 'RLS policies applied to all tables';
  RAISE NOTICE 'Indexes created for optimal query performance';
END $$;
