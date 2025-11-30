-- =====================================================
-- ENHANCED CALENDAR SYSTEM WITH AI - COMPLETE SCHEMA
-- =====================================================

-- ==================== CORE CALENDAR TABLES ====================

-- Recurring event patterns (RRULE support)
CREATE TABLE IF NOT EXISTS calendar_recurring_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rrule TEXT NOT NULL, -- RFC 5545 RRULE format
    frequency VARCHAR(50) NOT NULL, -- DAILY, WEEKLY, MONTHLY, YEARLY
    interval INTEGER DEFAULT 1,
    count INTEGER, -- Number of occurrences
    until TIMESTAMP WITH TIME ZONE, -- End date
    by_day VARCHAR(100), -- Days of week (MO,TU,WE,TH,FR,SA,SU)
    by_month_day VARCHAR(100), -- Days of month (1-31)
    by_month VARCHAR(100), -- Months (1-12)
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    exceptions JSONB DEFAULT '[]', -- Dates to exclude
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced calendar events with all features
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic event info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    meeting_url VARCHAR(1000), -- Zoom/Meet links

    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    all_day BOOLEAN DEFAULT FALSE,

    -- Recurring event relationship
    recurring_pattern_id UUID REFERENCES calendar_recurring_patterns(id) ON DELETE CASCADE,
    recurrence_instance_date DATE, -- For specific instances
    is_recurring_exception BOOLEAN DEFAULT FALSE,

    -- Event type and categorization
    event_type VARCHAR(100) NOT NULL, -- sales_call, demo, meeting, follow_up, etc.
    category VARCHAR(100) NOT NULL, -- sales, marketing, service
    subcategory VARCHAR(100),
    template_id UUID, -- Reference to event template used

    -- CRM Integration
    deal_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    account_id UUID,

    -- Meeting details
    attendees JSONB DEFAULT '[]', -- [{email, name, response_status, is_organizer}]
    internal_attendees JSONB DEFAULT '[]', -- Team members
    organizer_email VARCHAR(255),

    -- Status and outcomes
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show, rescheduled
    outcome VARCHAR(100), -- won, lost, follow_up_needed, qualified, etc.
    outcome_notes TEXT,
    meeting_score INTEGER CHECK (meeting_score >= 0 AND meeting_score <= 10),

    -- AI-powered features
    ai_prep_data JSONB, -- Pre-meeting context and suggestions
    ai_suggested_outcome VARCHAR(100),
    ai_action_items JSONB DEFAULT '[]',
    ai_sentiment VARCHAR(50), -- positive, neutral, negative
    ai_next_steps JSONB DEFAULT '[]',

    -- Integration
    google_event_id VARCHAR(255),
    google_calendar_id VARCHAR(255),
    sync_status VARCHAR(50) DEFAULT 'synced', -- synced, pending, conflict, error
    last_synced_at TIMESTAMP WITH TIME ZONE,

    -- Booking
    booked_via VARCHAR(100), -- booking_link, manual, google, imported
    booking_link_id UUID,
    confirmed_at TIMESTAMP WITH TIME ZONE,

    -- Visual
    color VARCHAR(50),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Event templates for reusable meeting types
CREATE TABLE IF NOT EXISTS calendar_event_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),

    -- Default values
    default_duration INTEGER NOT NULL, -- in minutes
    default_location VARCHAR(500),
    default_meeting_url VARCHAR(1000),
    default_title_template VARCHAR(500), -- e.g., "Demo with {contact_name}"
    default_description_template TEXT,

    -- Pre-configured settings
    buffer_before INTEGER DEFAULT 0, -- minutes
    buffer_after INTEGER DEFAULT 0, -- minutes
    color VARCHAR(50),

    -- AI settings
    auto_generate_prep BOOLEAN DEFAULT TRUE,
    auto_suggest_follow_up BOOLEAN DEFAULT TRUE,

    -- Usage tracking
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== BOOKING SYSTEM ====================

-- Booking links for prospect self-scheduling
CREATE TABLE IF NOT EXISTS calendar_booking_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Link configuration
    slug VARCHAR(100) NOT NULL UNIQUE, -- axolop.com/book/sales-demo
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    -- Event template
    event_template_id UUID REFERENCES calendar_event_templates(id),
    event_type VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes

    -- Availability
    availability_type VARCHAR(50) DEFAULT 'weekly', -- weekly, date_range, custom
    weekly_hours JSONB, -- {monday: [{start: '09:00', end: '17:00'}], ...}
    date_range_start DATE,
    date_range_end DATE,
    timezone VARCHAR(100) DEFAULT 'America/New_York',

    -- Buffer settings
    buffer_before INTEGER DEFAULT 0,
    buffer_after INTEGER DEFAULT 0,
    min_notice_hours INTEGER DEFAULT 24, -- Minimum hours in advance
    max_days_advance INTEGER DEFAULT 30, -- Maximum days in advance

    -- Team settings
    assignment_type VARCHAR(50) DEFAULT 'owner', -- owner, round_robin, territory, load_balanced
    team_member_ids JSONB DEFAULT '[]',

    -- Customization
    confirmation_message TEXT,
    redirect_url VARCHAR(1000),
    custom_questions JSONB DEFAULT '[]', -- Additional form fields

    -- Limits
    max_bookings_per_day INTEGER,
    max_bookings_per_week INTEGER,

    -- Tracking
    total_bookings INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    total_no_shows INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking link bookings (tracking)
CREATE TABLE IF NOT EXISTS calendar_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_link_id UUID NOT NULL REFERENCES calendar_booking_links(id) ON DELETE CASCADE,
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,

    -- Booker information
    booker_name VARCHAR(255) NOT NULL,
    booker_email VARCHAR(255) NOT NULL,
    booker_phone VARCHAR(50),
    booker_company VARCHAR(255),
    custom_responses JSONB DEFAULT '{}',

    -- Booking details
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(100) NOT NULL,

    -- Assignment
    assigned_to_user_id UUID REFERENCES auth.users(id),

    -- Status
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed, no_show, rescheduled
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,

    -- Communication
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== AVAILABILITY MANAGEMENT ====================

-- User availability overrides
CREATE TABLE IF NOT EXISTS calendar_availability_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Override details
    override_type VARCHAR(50) NOT NULL, -- available, unavailable, custom
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Recurring override
    recurring_pattern_id UUID REFERENCES calendar_recurring_patterns(id),

    reason VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== TEAM CALENDAR ====================

-- Team calendar sharing
CREATE TABLE IF NOT EXISTS calendar_team_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    permission_level VARCHAR(50) NOT NULL, -- view, edit, admin
    can_book BOOLEAN DEFAULT FALSE,
    can_see_details BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== AI & INTELLIGENCE ====================

-- AI pattern learning for delegation and suggestions
CREATE TABLE IF NOT EXISTS calendar_ai_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Pattern type
    pattern_type VARCHAR(100) NOT NULL, -- recurring_meeting, delegation_preference, scheduling_preference, outcome_prediction

    -- Pattern data
    pattern_name VARCHAR(255),
    pattern_data JSONB NOT NULL, -- Flexible storage for different pattern types

    -- Pattern metadata
    confidence_score DECIMAL(5,2), -- 0.00 to 1.00
    occurrence_count INTEGER DEFAULT 1,
    last_occurrence TIMESTAMP WITH TIME ZONE,

    -- Pattern specifics
    context JSONB, -- Additional context (deal stage, contact type, etc.)

    -- Learning
    is_active BOOLEAN DEFAULT TRUE,
    user_confirmed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-suggested events and actions
CREATE TABLE IF NOT EXISTS calendar_ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Suggestion type
    suggestion_type VARCHAR(100) NOT NULL, -- create_event, reschedule, delegate, cancel, follow_up

    -- Suggestion details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    reasoning TEXT, -- Why AI is suggesting this
    confidence_score DECIMAL(5,2),

    -- Suggested action data
    suggested_data JSONB NOT NULL,

    -- Related entities
    related_event_id UUID REFERENCES calendar_events(id),
    related_deal_id UUID REFERENCES opportunities(id),
    related_contact_id UUID REFERENCES contacts(id),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, expired
    user_action VARCHAR(50), -- accepted, rejected, modified
    user_action_at TIMESTAMP WITH TIME ZONE,

    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting intelligence and prep data
CREATE TABLE IF NOT EXISTS calendar_meeting_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

    -- Pre-meeting intelligence
    attendee_insights JSONB, -- History, previous meetings, deal context
    recommended_talking_points JSONB DEFAULT '[]',
    potential_objections JSONB DEFAULT '[]',
    suggested_agenda JSONB DEFAULT '[]',
    competitor_intel JSONB,

    -- During meeting
    meeting_notes TEXT,
    key_moments JSONB DEFAULT '[]',

    -- Post-meeting
    action_items JSONB DEFAULT '[]',
    decisions_made JSONB DEFAULT '[]',
    next_steps JSONB DEFAULT '[]',
    sentiment_analysis JSONB,
    ai_summary TEXT,

    -- Automated extraction
    extracted_at TIMESTAMP WITH TIME ZONE,
    extraction_source VARCHAR(100), -- manual, transcript, notes, email

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ANALYTICS & INSIGHTS ====================

-- Calendar analytics aggregations
CREATE TABLE IF NOT EXISTS calendar_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Time period
    period_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Meeting metrics
    total_meetings INTEGER DEFAULT 0,
    completed_meetings INTEGER DEFAULT 0,
    cancelled_meetings INTEGER DEFAULT 0,
    no_show_meetings INTEGER DEFAULT 0,
    rescheduled_meetings INTEGER DEFAULT 0,

    -- Time metrics
    total_meeting_hours DECIMAL(10,2) DEFAULT 0,
    average_meeting_duration INTEGER, -- minutes

    -- Outcome metrics
    meetings_won INTEGER DEFAULT 0,
    meetings_lost INTEGER DEFAULT 0,
    meeting_win_rate DECIMAL(5,2),
    average_meeting_score DECIMAL(3,2),

    -- Revenue metrics (from linked deals)
    total_pipeline_value DECIMAL(15,2),
    total_closed_value DECIMAL(15,2),

    -- Efficiency metrics
    utilization_rate DECIMAL(5,2), -- % of working hours in meetings
    response_time_hours DECIMAL(10,2), -- Avg time to respond to meeting requests

    -- Breakdown by type
    metrics_by_type JSONB, -- {sales_call: {count: 10, won: 5}, demo: {...}}

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SYNC & INTEGRATION ====================

-- Calendar sync state tracking
CREATE TABLE IF NOT EXISTS calendar_sync_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    provider VARCHAR(50) NOT NULL, -- google, outlook, etc.

    -- Sync status
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_successful_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50), -- success, error, in_progress
    sync_error TEXT,

    -- Sync stats
    events_synced_count INTEGER DEFAULT 0,
    events_created_count INTEGER DEFAULT 0,
    events_updated_count INTEGER DEFAULT 0,
    events_deleted_count INTEGER DEFAULT 0,
    conflicts_count INTEGER DEFAULT 0,

    -- Sync token (for incremental sync)
    sync_token TEXT,
    page_token TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync conflict resolution
CREATE TABLE IF NOT EXISTS calendar_sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    event_id UUID REFERENCES calendar_events(id),
    provider VARCHAR(50) NOT NULL,
    external_event_id VARCHAR(255),

    -- Conflict details
    conflict_type VARCHAR(100) NOT NULL, -- update_conflict, delete_conflict, duplicate
    local_data JSONB,
    remote_data JSONB,

    -- Resolution
    resolution_status VARCHAR(50) DEFAULT 'pending', -- pending, resolved, ignored
    resolution_action VARCHAR(50), -- keep_local, keep_remote, merge, manual
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================

-- Calendar events indexes
CREATE INDEX idx_calendar_events_user_time ON calendar_events(user_id, start_time);
CREATE INDEX idx_calendar_events_deal ON calendar_events(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_calendar_events_contact ON calendar_events(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_recurring ON calendar_events(recurring_pattern_id) WHERE recurring_pattern_id IS NOT NULL;
CREATE INDEX idx_calendar_events_google ON calendar_events(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE INDEX idx_calendar_events_sync_status ON calendar_events(sync_status);

-- Recurring patterns indexes
CREATE INDEX idx_recurring_patterns_user ON calendar_recurring_patterns(user_id);

-- Booking links indexes
CREATE INDEX idx_booking_links_slug ON calendar_booking_links(slug);
CREATE INDEX idx_booking_links_active ON calendar_booking_links(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bookings_link ON calendar_bookings(booking_link_id);
CREATE INDEX idx_bookings_status ON calendar_bookings(status);

-- AI patterns indexes
CREATE INDEX idx_ai_patterns_user_type ON calendar_ai_patterns(user_id, pattern_type);
CREATE INDEX idx_ai_patterns_active ON calendar_ai_patterns(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ai_suggestions_user_status ON calendar_ai_suggestions(user_id, status);
CREATE INDEX idx_ai_suggestions_expires ON calendar_ai_suggestions(expires_at) WHERE status = 'pending';

-- Analytics indexes
CREATE INDEX idx_analytics_user_period ON calendar_analytics(user_id, period_start, period_end);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_recurring_patterns_updated_at BEFORE UPDATE ON calendar_recurring_patterns
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_event_templates_updated_at BEFORE UPDATE ON calendar_event_templates
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_booking_links_updated_at BEFORE UPDATE ON calendar_booking_links
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

CREATE TRIGGER update_ai_patterns_updated_at BEFORE UPDATE ON calendar_ai_patterns
    FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();

-- Function to generate recurring event instances
CREATE OR REPLACE FUNCTION generate_recurring_instances(
    pattern_id UUID,
    range_start TIMESTAMP WITH TIME ZONE,
    range_end TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF calendar_events AS $$
DECLARE
    pattern calendar_recurring_patterns;
    base_event calendar_events;
    instance_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the recurring pattern
    SELECT * INTO pattern FROM calendar_recurring_patterns WHERE id = pattern_id;

    -- Get the base event (first occurrence)
    SELECT * INTO base_event FROM calendar_events
    WHERE recurring_pattern_id = pattern_id
    ORDER BY start_time
    LIMIT 1;

    -- Generate instances based on RRULE
    -- (This is a simplified version - in production, use a proper RRULE library)

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE calendar_recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_booking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_team_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_ai_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_meeting_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_conflicts ENABLE ROW LEVEL SECURITY;

-- Policies for calendar_events (example - apply similar to other tables)
CREATE POLICY "Users can view their own events" ON calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Public booking links can be viewed by anyone
CREATE POLICY "Public can view active booking links" ON calendar_booking_links
    FOR SELECT USING (is_active = TRUE);

COMMENT ON TABLE calendar_events IS 'Enhanced calendar events with full CRM integration, AI features, and sync capabilities';
COMMENT ON TABLE calendar_recurring_patterns IS 'RRULE-based recurring event patterns';
COMMENT ON TABLE calendar_booking_links IS 'Public booking links for prospect self-scheduling';
COMMENT ON TABLE calendar_ai_patterns IS 'AI-learned patterns for delegation, scheduling preferences, and predictions';
COMMENT ON TABLE calendar_meeting_intelligence IS 'AI-powered meeting prep, insights, and post-meeting analysis';
