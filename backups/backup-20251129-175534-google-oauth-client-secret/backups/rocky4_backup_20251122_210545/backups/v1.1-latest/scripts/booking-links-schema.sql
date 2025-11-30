-- Booking Links Schema
-- Comprehensive booking/scheduling system (iClosed/Calendly clone)

-- Main booking links table
CREATE TABLE IF NOT EXISTS booking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  internal_note TEXT, -- Only visible to team
  color TEXT DEFAULT '#0099FF',

  -- Location/Meeting Type
  location_type TEXT DEFAULT 'phone', -- phone, google_meet, zoom, in_person, custom
  location_details JSONB, -- {url, address, phone, etc}

  -- Timing
  duration INTEGER DEFAULT 30, -- minutes
  date_range_type TEXT DEFAULT 'calendar_days', -- calendar_days, business_days, indefinite
  date_range_value INTEGER DEFAULT 14, -- number of days
  start_time_increment INTEGER DEFAULT 15, -- minutes
  time_format TEXT DEFAULT '12h', -- 12h or 24h
  buffer_before INTEGER DEFAULT 0, -- minutes
  buffer_after INTEGER DEFAULT 0, -- minutes

  -- Limitations
  min_notice_hours INTEGER DEFAULT 1, -- minimum hours before booking
  allow_reschedule BOOLEAN DEFAULT true,
  prevent_duplicate_bookings BOOLEAN DEFAULT false,
  max_bookings_per_day INTEGER, -- null = unlimited

  -- Team/Hosts
  assignment_type TEXT DEFAULT 'round_robin', -- round_robin, load_balanced, manual
  host_priority TEXT DEFAULT 'optimize_manually', -- optimize_manually, optimize_automatically

  -- Qualification & Routing
  require_business_email BOOLEAN DEFAULT false,
  allowed_country_codes TEXT[], -- ['+1', '+44', etc]
  enable_two_step_qualification BOOLEAN DEFAULT false,

  -- Redirects
  confirmation_redirect_type TEXT DEFAULT 'default', -- default, custom_url
  confirmation_redirect_url TEXT,
  disqualified_redirect_url TEXT,

  -- Notifications
  send_confirmation_email BOOLEAN DEFAULT true,
  send_cancellation_email BOOLEAN DEFAULT true,
  send_reminder_emails BOOLEAN DEFAULT false,
  reminder_times INTEGER[], -- hours before meeting [24, 1]
  reply_to_type TEXT DEFAULT 'host_email', -- host_email, no_reply, custom
  custom_reply_to TEXT,

  -- Customization
  theme TEXT DEFAULT 'light', -- light, dark
  brand_color_primary TEXT DEFAULT '#0236C2',
  brand_color_secondary TEXT DEFAULT '#031953',
  use_gradient BOOLEAN DEFAULT false,
  scheduler_background TEXT DEFAULT '#FFFFFF',
  font_color TEXT DEFAULT '#1F2A37',
  border_color TEXT DEFAULT '#D1D5DB',
  input_fields_color TEXT DEFAULT '#F9FAFB',
  button_font_color TEXT DEFAULT '#FFFFFF',
  company_logo_url TEXT,

  -- Question Settings
  hide_primary_labels BOOLEAN DEFAULT false,
  collapse_radio_checkbox BOOLEAN DEFAULT false,
  enable_prefill_skipping BOOLEAN DEFAULT false, -- Skip form if URL has pre-fill params

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Analytics
  total_bookings INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_no_shows INTEGER DEFAULT 0,
  total_cancelled INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking link hosts/team members
CREATE TABLE IF NOT EXISTS booking_link_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  priority_order INTEGER DEFAULT 0, -- manual ordering
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_link_id, user_id)
);

-- Booking link questions (similar to form fields)
CREATE TABLE IF NOT EXISTS booking_link_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE CASCADE,

  -- Question Details
  question_type TEXT DEFAULT 'primary', -- primary, secondary
  field_type TEXT NOT NULL, -- text, email, phone, select, radio, checkbox, number
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,

  -- Validation
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB, -- {min, max, pattern, etc}

  -- Options (for select, radio, checkbox)
  options JSONB, -- [{label, value}]

  -- Order
  display_order INTEGER DEFAULT 0,

  -- For conditional logic
  parent_question_id UUID REFERENCES booking_link_questions(id),
  show_if_conditions JSONB, -- {parentValue: 'value', operator: 'equals'}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disqualification rules
CREATE TABLE IF NOT EXISTS booking_link_disqualification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE CASCADE,
  question_id UUID REFERENCES booking_link_questions(id) ON DELETE CASCADE,

  -- Rule Configuration
  operator TEXT NOT NULL, -- equals, not_equals, less_than, greater_than, contains, not_contains
  value TEXT NOT NULL,
  disqualification_message TEXT,

  -- Priority
  rule_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routing rules (conditional team assignment)
CREATE TABLE IF NOT EXISTS booking_link_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE CASCADE,
  question_id UUID REFERENCES booking_link_questions(id) ON DELETE CASCADE,

  -- Condition
  operator TEXT NOT NULL, -- equals, not_equals, less_than, greater_than, contains, not_contains
  value TEXT NOT NULL,

  -- Action
  route_to_user_id UUID REFERENCES auth.users(id),
  route_to_team UUID, -- future: route to team
  assignment_method TEXT DEFAULT 'specific', -- specific, round_robin, load_balanced

  -- Priority
  rule_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actual bookings/appointments
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE SET NULL,

  -- Lead/Contact Info
  lead_id UUID REFERENCES leads(id),
  contact_id UUID REFERENCES contacts(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,

  -- Assigned Host
  assigned_to UUID REFERENCES auth.users(id),

  -- Booking Details
  scheduled_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  location_type TEXT,
  location_details JSONB,
  timezone TEXT DEFAULT 'America/New_York',

  -- Qualification Data
  qualification_data JSONB, -- All form answers
  qualification_step INTEGER, -- Which step they completed
  qualified BOOLEAN DEFAULT true,
  disqualification_reason TEXT,
  qualification_completed_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show, rescheduled
  cancellation_reason TEXT,
  cancelled_by TEXT, -- lead, host, system
  cancelled_at TIMESTAMPTZ,
  rescheduled_from UUID REFERENCES bookings(id),
  rescheduled_to UUID REFERENCES bookings(id),

  -- Outcome (for sales calls)
  outcome TEXT, -- won, lost, pending
  outcome_notes TEXT,
  deal_value DECIMAL(10,2),

  -- Notifications
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,

  -- Metadata
  source TEXT DEFAULT 'booking_form',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking link analytics tracking
CREATE TABLE IF NOT EXISTS booking_link_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE CASCADE,

  -- Date
  date DATE NOT NULL,

  -- Metrics
  views INTEGER DEFAULT 0,
  form_starts INTEGER DEFAULT 0,
  form_completes INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  qualified INTEGER DEFAULT 0,
  disqualified INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  cancelled INTEGER DEFAULT 0,

  -- Revenue (for sales bookings)
  total_revenue DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_link_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_links_user_id ON booking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_links_slug ON booking_links(slug);
CREATE INDEX IF NOT EXISTS idx_booking_links_is_active ON booking_links(is_active);

CREATE INDEX IF NOT EXISTS idx_booking_link_hosts_booking_link ON booking_link_hosts(booking_link_id);
CREATE INDEX IF NOT EXISTS idx_booking_link_hosts_user ON booking_link_hosts(user_id);

CREATE INDEX IF NOT EXISTS idx_booking_link_questions_booking_link ON booking_link_questions(booking_link_id);
CREATE INDEX IF NOT EXISTS idx_booking_link_questions_type ON booking_link_questions(question_type);

CREATE INDEX IF NOT EXISTS idx_bookings_booking_link ON bookings(booking_link_id);
CREATE INDEX IF NOT EXISTS idx_bookings_lead ON bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_contact ON bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_to ON bookings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_time ON bookings(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Functions for analytics
CREATE OR REPLACE FUNCTION update_booking_link_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update booking link statistics when a booking is created/updated
  UPDATE booking_links
  SET
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE booking_link_id = NEW.booking_link_id),
    total_completed = (SELECT COUNT(*) FROM bookings WHERE booking_link_id = NEW.booking_link_id AND status = 'completed'),
    total_no_shows = (SELECT COUNT(*) FROM bookings WHERE booking_link_id = NEW.booking_link_id AND status = 'no_show'),
    total_cancelled = (SELECT COUNT(*) FROM bookings WHERE booking_link_id = NEW.booking_link_id AND status = 'cancelled'),
    conversion_rate = (
      SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
        END
      FROM bookings
      WHERE booking_link_id = NEW.booking_link_id
    ),
    updated_at = NOW()
  WHERE id = NEW.booking_link_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_link_stats
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_booking_link_stats();

-- Function to update booking link updated_at
CREATE OR REPLACE FUNCTION update_booking_link_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_link_updated_at
BEFORE UPDATE ON booking_links
FOR EACH ROW
EXECUTE FUNCTION update_booking_link_updated_at();

-- =====================================================
-- BOOKING REMINDERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  booking_link_id UUID REFERENCES booking_links(id) ON DELETE CASCADE NOT NULL,

  -- Reminder settings
  scheduled_for TIMESTAMPTZ NOT NULL,
  minutes_before INTEGER NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status values: 'pending', 'sent', 'failed', 'cancelled'

  sent_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_status ON booking_reminders(status);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_scheduled_for ON booking_reminders(scheduled_for);

-- RLS Policies
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_link_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_link_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_link_disqualification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_link_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;

-- Policies (users can manage their own booking links)
CREATE POLICY "Users can view their own booking links"
  ON booking_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own booking links"
  ON booking_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own booking links"
  ON booking_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own booking links"
  ON booking_links FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view active booking links by slug
CREATE POLICY "Public can view active booking links by slug"
  ON booking_links FOR SELECT
  USING (is_active = true);

-- Similar policies for related tables
CREATE POLICY "Users can manage booking link hosts"
  ON booking_link_hosts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = booking_link_hosts.booking_link_id
    AND booking_links.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage booking link questions"
  ON booking_link_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = booking_link_questions.booking_link_id
    AND booking_links.user_id = auth.uid()
  ));

-- Public can view questions for active booking links
CREATE POLICY "Public can view questions for active booking links"
  ON booking_link_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = booking_link_questions.booking_link_id
    AND booking_links.is_active = true
  ));

CREATE POLICY "Users can manage disqualification rules"
  ON booking_link_disqualification_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = booking_link_disqualification_rules.booking_link_id
    AND booking_links.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage routing rules"
  ON booking_link_routing_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = booking_link_routing_rules.booking_link_id
    AND booking_links.user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view bookings for their booking links"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM booking_links
      WHERE booking_links.id = bookings.booking_link_id
      AND booking_links.user_id = auth.uid()
    )
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Users can update bookings assigned to them"
  ON bookings FOR UPDATE
  USING (assigned_to = auth.uid() OR EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = bookings.booking_link_id
    AND booking_links.user_id = auth.uid()
  ));

-- Analytics policies
CREATE POLICY "Users can view analytics for their booking links"
  ON booking_link_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM booking_links
    WHERE booking_links.id = booking_link_analytics.booking_link_id
    AND booking_links.user_id = auth.uid()
  ));

-- Reminder policies
CREATE POLICY "System can manage reminders"
  ON booking_reminders FOR ALL
  USING (true)
  WITH CHECK (true);
