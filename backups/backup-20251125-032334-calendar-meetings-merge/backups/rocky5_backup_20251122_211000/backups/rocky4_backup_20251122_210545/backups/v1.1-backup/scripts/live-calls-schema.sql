-- ===========================================================================
-- Axolop CRM - Live Calls & Sales Features Database Schema
-- Insurance Agent Support Features
-- ===========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- ===========================================================================
-- SALES SCRIPTS & TEMPLATES
-- ===========================================================================

-- Sales Script Templates Table
-- Stores different script templates for various scenarios
CREATE TABLE IF NOT EXISTS public.sales_script_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  script_type TEXT NOT NULL DEFAULT 'default', -- default, interested, not_interested, upsell, downsell, follow_up, voicemail
  content TEXT NOT NULL,
  description TEXT,
  industry TEXT, -- insurance, real_estate, ecommerce, etc.
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  variables JSONB DEFAULT '{}'::jsonb, -- Dynamic variables like {lead_name}, {company}, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voicemail Drop Templates
CREATE TABLE IF NOT EXISTS public.voicemail_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  script TEXT NOT NULL,
  audio_url TEXT, -- Pre-recorded audio file URL
  duration_seconds INTEGER,
  industry TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================================================
-- CALL QUEUE & MANAGEMENT
-- ===========================================================================

-- Call Queue Table
CREATE TABLE IF NOT EXISTS public.call_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  auto_dial_enabled BOOLEAN DEFAULT false,
  auto_dial_interval_seconds INTEGER DEFAULT 60,
  active_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"},
    "wednesday": {"start": "09:00", "end": "17:00"},
    "thursday": {"start": "09:00", "end": "17:00"},
    "friday": {"start": "09:00", "end": "17:00"}
  }'::jsonb,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Call Queue Items
CREATE TABLE IF NOT EXISTS public.call_queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id UUID REFERENCES public.call_queues(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, disposed, callback
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_attempt_at TIMESTAMP WITH TIME ZONE,
  callback_scheduled_at TIMESTAMP WITH TIME ZONE,
  disposition TEXT, -- no_answer, busy, voicemail, interested, not_interested, callback, do_not_call
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================================================
-- CALLS & RECORDINGS
-- ===========================================================================

-- Calls Table (Main call records)
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  queue_item_id UUID REFERENCES public.call_queue_items(id) ON DELETE SET NULL,

  -- Call details
  direction TEXT NOT NULL DEFAULT 'outbound', -- outbound, inbound
  phone_number TEXT NOT NULL,
  caller_id TEXT,
  status TEXT NOT NULL DEFAULT 'initiated', -- initiated, ringing, answered, ended, failed, voicemail
  disposition TEXT, -- no_answer, busy, voicemail, completed, interested, not_interested, callback, do_not_call

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  talk_time_seconds INTEGER DEFAULT 0,

  -- Recording & Transcription
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  transcript_id UUID,
  has_recording BOOLEAN DEFAULT false,
  has_transcript BOOLEAN DEFAULT false,

  -- AI Analysis
  ai_summary TEXT,
  ai_sentiment TEXT, -- positive, neutral, negative
  ai_keywords TEXT[],
  ai_action_items TEXT[],
  lead_score_impact INTEGER DEFAULT 0,

  -- Scripts used
  script_template_id UUID REFERENCES public.sales_script_templates(id) ON DELETE SET NULL,
  voicemail_template_id UUID REFERENCES public.voicemail_templates(id) ON DELETE SET NULL,

  -- Metadata
  tags TEXT[],
  cost NUMERIC(10, 4) DEFAULT 0,
  provider TEXT DEFAULT 'twilio', -- twilio, vonage, etc.
  provider_call_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Call Transcripts Table
CREATE TABLE IF NOT EXISTS public.call_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transcript content
  full_transcript TEXT NOT NULL,
  segments JSONB DEFAULT '[]'::jsonb, -- Array of {speaker, text, timestamp, confidence}

  -- AI Analysis
  summary TEXT,
  key_points TEXT[],
  sentiment_analysis JSONB DEFAULT '{}'::jsonb,
  keywords TEXT[],
  action_items TEXT[],
  objections TEXT[],
  questions TEXT[],

  -- Metadata
  language TEXT DEFAULT 'en-US',
  confidence_score NUMERIC(3, 2),
  processing_status TEXT DEFAULT 'completed', -- pending, processing, completed, failed
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Call Comments/Notes
CREATE TABLE IF NOT EXISTS public.call_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  comment TEXT NOT NULL,
  comment_type TEXT DEFAULT 'note', -- note, action_item, follow_up, objection
  is_private BOOLEAN DEFAULT false,
  mentioned_users UUID[], -- Array of user IDs mentioned in comment

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================================================
-- LEAD BIRTHDAYS & IMPORTANT DATES
-- ===========================================================================

-- Lead Important Dates (Birthdays, Anniversaries, etc.)
CREATE TABLE IF NOT EXISTS public.lead_important_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  date_type TEXT NOT NULL DEFAULT 'birthday', -- birthday, anniversary, renewal_date, policy_expiration, etc.
  date_value DATE NOT NULL,
  recurring BOOLEAN DEFAULT true,

  -- Notification settings
  notify_days_before INTEGER DEFAULT 7,
  notification_sent BOOLEAN DEFAULT false,
  last_notification_sent_at TIMESTAMP WITH TIME ZONE,

  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===========================================================================
-- CALL ANALYTICS & ACTIVITY TRACKING
-- ===========================================================================

-- Daily Call Analytics
CREATE TABLE IF NOT EXISTS public.call_analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Call volumes
  total_calls INTEGER DEFAULT 0,
  outbound_calls INTEGER DEFAULT 0,
  inbound_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  missed_calls INTEGER DEFAULT 0,
  voicemails INTEGER DEFAULT 0,

  -- Duration stats
  total_talk_time_seconds INTEGER DEFAULT 0,
  average_talk_time_seconds INTEGER DEFAULT 0,
  longest_call_seconds INTEGER DEFAULT 0,

  -- Disposition stats
  interested_count INTEGER DEFAULT 0,
  not_interested_count INTEGER DEFAULT 0,
  callback_count INTEGER DEFAULT 0,
  no_answer_count INTEGER DEFAULT 0,

  -- Success metrics
  conversion_rate NUMERIC(5, 2) DEFAULT 0,
  contact_rate NUMERIC(5, 2) DEFAULT 0,

  -- Cost
  total_cost NUMERIC(10, 2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, date)
);

-- Agent Performance Metrics
CREATE TABLE IF NOT EXISTS public.agent_call_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Activity metrics
  calls_made INTEGER DEFAULT 0,
  calls_answered INTEGER DEFAULT 0,
  average_handle_time_seconds INTEGER DEFAULT 0,

  -- Quality metrics
  positive_sentiment_calls INTEGER DEFAULT 0,
  negative_sentiment_calls INTEGER DEFAULT 0,
  average_sentiment_score NUMERIC(3, 2),

  -- Conversion metrics
  leads_contacted INTEGER DEFAULT 0,
  leads_interested INTEGER DEFAULT 0,
  appointments_set INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,

  -- Script adherence
  scripts_used INTEGER DEFAULT 0,
  script_adherence_score NUMERIC(5, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(user_id, date)
);

-- ===========================================================================
-- INDEXES FOR PERFORMANCE
-- ===========================================================================

-- Sales Scripts
CREATE INDEX IF NOT EXISTS idx_sales_scripts_user_id ON public.sales_script_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_scripts_type ON public.sales_script_templates(script_type);
CREATE INDEX IF NOT EXISTS idx_voicemail_templates_user_id ON public.voicemail_templates(user_id);

-- Call Queues
CREATE INDEX IF NOT EXISTS idx_call_queues_user_id ON public.call_queues(user_id);
CREATE INDEX IF NOT EXISTS idx_call_queue_items_queue_id ON public.call_queue_items(queue_id);
CREATE INDEX IF NOT EXISTS idx_call_queue_items_lead_id ON public.call_queue_items(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_queue_items_status ON public.call_queue_items(status);
CREATE INDEX IF NOT EXISTS idx_call_queue_items_assigned_to ON public.call_queue_items(assigned_to);

-- Calls
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON public.calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_contact_id ON public.calls(contact_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON public.calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON public.calls(started_at);
CREATE INDEX IF NOT EXISTS idx_calls_disposition ON public.calls(disposition);

-- Call Transcripts
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON public.call_transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_user_id ON public.call_transcripts(user_id);

-- Call Comments
CREATE INDEX IF NOT EXISTS idx_call_comments_call_id ON public.call_comments(call_id);
CREATE INDEX IF NOT EXISTS idx_call_comments_user_id ON public.call_comments(user_id);

-- Important Dates
CREATE INDEX IF NOT EXISTS idx_important_dates_lead_id ON public.lead_important_dates(lead_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_user_id ON public.lead_important_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_date ON public.lead_important_dates(date_value);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_call_analytics_user_date ON public.call_analytics_daily(user_id, date);
CREATE INDEX IF NOT EXISTS idx_agent_performance_user_date ON public.agent_call_performance(user_id, date);

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================================================

-- Enable RLS
ALTER TABLE public.sales_script_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voicemail_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_call_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Sales Scripts
DROP POLICY IF EXISTS "Users can view their own scripts" ON public.sales_script_templates;
CREATE POLICY "Users can view their own scripts" ON public.sales_script_templates
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own scripts" ON public.sales_script_templates;
CREATE POLICY "Users can insert their own scripts" ON public.sales_script_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own scripts" ON public.sales_script_templates;
CREATE POLICY "Users can update their own scripts" ON public.sales_script_templates
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own scripts" ON public.sales_script_templates;
CREATE POLICY "Users can delete their own scripts" ON public.sales_script_templates
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Voicemail Templates (same pattern)
DROP POLICY IF EXISTS "Users can manage their voicemail templates" ON public.voicemail_templates;
CREATE POLICY "Users can manage their voicemail templates" ON public.voicemail_templates
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Call Queues
DROP POLICY IF EXISTS "Users can manage their call queues" ON public.call_queues;
CREATE POLICY "Users can manage their call queues" ON public.call_queues
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Call Queue Items
DROP POLICY IF EXISTS "Users can manage their queue items" ON public.call_queue_items;
CREATE POLICY "Users can manage their queue items" ON public.call_queue_items
  FOR ALL USING (auth.uid() = user_id OR assigned_to = auth.uid() OR user_id IS NULL);

-- RLS Policies for Calls
DROP POLICY IF EXISTS "Users can view their own calls" ON public.calls;
CREATE POLICY "Users can view their own calls" ON public.calls
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own calls" ON public.calls;
CREATE POLICY "Users can insert their own calls" ON public.calls
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own calls" ON public.calls;
CREATE POLICY "Users can update their own calls" ON public.calls
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own calls" ON public.calls;
CREATE POLICY "Users can delete their own calls" ON public.calls
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Call Transcripts
DROP POLICY IF EXISTS "Users can manage their transcripts" ON public.call_transcripts;
CREATE POLICY "Users can manage their transcripts" ON public.call_transcripts
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Call Comments
DROP POLICY IF EXISTS "Users can manage their call comments" ON public.call_comments;
CREATE POLICY "Users can manage their call comments" ON public.call_comments
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Important Dates
DROP POLICY IF EXISTS "Users can manage their lead dates" ON public.lead_important_dates;
CREATE POLICY "Users can manage their lead dates" ON public.lead_important_dates
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Analytics
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.call_analytics_daily;
CREATE POLICY "Users can view their own analytics" ON public.call_analytics_daily
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own performance" ON public.agent_call_performance;
CREATE POLICY "Users can view their own performance" ON public.agent_call_performance
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- ===========================================================================
-- FUNCTIONS & TRIGGERS
-- ===========================================================================

-- Function to update call analytics when a call is completed
CREATE OR REPLACE FUNCTION update_call_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when call status changes to 'ended'
  IF NEW.status = 'ended' AND (OLD.status IS NULL OR OLD.status != 'ended') THEN
    -- Insert or update daily analytics
    INSERT INTO public.call_analytics_daily (
      user_id,
      date,
      total_calls,
      outbound_calls,
      inbound_calls,
      answered_calls,
      total_talk_time_seconds
    ) VALUES (
      NEW.user_id,
      DATE(NEW.started_at),
      1,
      CASE WHEN NEW.direction = 'outbound' THEN 1 ELSE 0 END,
      CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END,
      CASE WHEN NEW.answered_at IS NOT NULL THEN 1 ELSE 0 END,
      COALESCE(NEW.talk_time_seconds, 0)
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      total_calls = public.call_analytics_daily.total_calls + 1,
      outbound_calls = public.call_analytics_daily.outbound_calls + CASE WHEN NEW.direction = 'outbound' THEN 1 ELSE 0 END,
      inbound_calls = public.call_analytics_daily.inbound_calls + CASE WHEN NEW.direction = 'inbound' THEN 1 ELSE 0 END,
      answered_calls = public.call_analytics_daily.answered_calls + CASE WHEN NEW.answered_at IS NOT NULL THEN 1 ELSE 0 END,
      total_talk_time_seconds = public.call_analytics_daily.total_talk_time_seconds + COALESCE(NEW.talk_time_seconds, 0),
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for call analytics
DROP TRIGGER IF EXISTS trigger_update_call_analytics ON public.calls;
CREATE TRIGGER trigger_update_call_analytics
  AFTER INSERT OR UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION update_call_analytics();

-- Function to update queue item attempts
CREATE OR REPLACE FUNCTION update_queue_item_attempts()
RETURNS TRIGGER AS $$
BEGIN
  -- When a call is created from a queue item, increment attempts
  IF NEW.queue_item_id IS NOT NULL THEN
    UPDATE public.call_queue_items
    SET
      attempts = attempts + 1,
      last_attempt_at = NEW.started_at,
      status = 'in_progress',
      updated_at = now()
    WHERE id = NEW.queue_item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for queue item attempts
DROP TRIGGER IF EXISTS trigger_update_queue_attempts ON public.calls;
CREATE TRIGGER trigger_update_queue_attempts
  AFTER INSERT ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_item_attempts();

-- ===========================================================================
-- DEFAULT DATA - SAMPLE SCRIPT TEMPLATES
-- ===========================================================================

-- Insert default script templates (will only insert if none exist)
INSERT INTO public.sales_script_templates (
  user_id,
  name,
  script_type,
  content,
  description,
  industry,
  is_default
) VALUES
(
  NULL, -- Available to all users
  'Insurance - Initial Contact',
  'default',
  E'Hi {lead_name}, this is {agent_name} from {company_name}.\n\nI''m reaching out because I noticed you might be interested in {insurance_type} coverage. \n\nIs now a good time to discuss how we can help protect what matters most to you?\n\n[Wait for response]\n\nGreat! Let me ask you a few quick questions to understand your needs better...',
  'Default script for initial insurance contact',
  'insurance',
  true
),
(
  NULL,
  'Insurance - Follow Up',
  'follow_up',
  E'Hi {lead_name}, this is {agent_name} from {company_name}.\n\nI wanted to follow up on our conversation from {last_contact_date}. \n\nHave you had a chance to think about the {insurance_type} coverage we discussed?\n\n[Wait for response]\n\nI completely understand. Let me address any questions you might have...',
  'Follow-up script for insurance leads',
  'insurance',
  true
),
(
  NULL,
  'Universal - Interested Lead',
  'interested',
  E'That''s fantastic, {lead_name}! I''m excited to help you with this.\n\nLet me walk you through the next steps:\n\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nDoes {time_slot} work for you to get this started?',
  'Script for leads showing interest',
  NULL,
  true
),
(
  NULL,
  'Universal - Not Interested',
  'not_interested',
  E'I completely understand, {lead_name}. I appreciate you taking the time to speak with me.\n\nMay I ask what your main concern is? Sometimes there''s a misunderstanding I can clarify.\n\n[If still not interested]\n\nNo problem at all. Would it be okay if I reach out in {timeframe} in case your situation changes?',
  'Script for handling not interested leads',
  NULL,
  true
),
(
  NULL,
  'Insurance - Voicemail Drop',
  'voicemail',
  E'Hi {lead_name}, this is {agent_name} from {company_name}.\n\nI''m calling to discuss your {insurance_type} coverage options. I have some information that could save you money while providing better protection.\n\nYou can reach me directly at {agent_phone} or I''ll try you again tomorrow.\n\nLooking forward to speaking with you!',
  'Voicemail script for insurance leads',
  'insurance',
  true
)
ON CONFLICT DO NOTHING;

-- ===========================================================================
-- SCHEMA DEPLOYMENT COMPLETE
-- ===========================================================================

-- Verify tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'sales_script_templates', 'voicemail_templates', 'call_queues',
    'call_queue_items', 'calls', 'call_transcripts', 'call_comments',
    'lead_important_dates', 'call_analytics_daily', 'agent_call_performance'
  );

  RAISE NOTICE '✅ Live Calls Schema Deployment Complete! % tables created/verified', table_count;
END $$;
