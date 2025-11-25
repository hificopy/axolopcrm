-- =====================================================
-- EMAIL MARKETING & WORKFLOW USER ISOLATION
-- Ensures all email marketing and workflow tables have proper user isolation
-- =====================================================

-- =====================================================
-- 1. EMAIL MARKETING WORKFLOWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_marketing_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- EMAIL_OPENED, LINK_CLICKED, FORM_SUBMITTED, etc.
    trigger_config JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_workflows_user_id ON email_marketing_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_email_workflows_is_active ON email_marketing_workflows(is_active);

-- Enable RLS
ALTER TABLE email_marketing_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own workflows" ON email_marketing_workflows;
DROP POLICY IF EXISTS "Users can insert their own workflows" ON email_marketing_workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON email_marketing_workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON email_marketing_workflows;

CREATE POLICY "Users can view their own workflows"
    ON email_marketing_workflows FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflows"
    ON email_marketing_workflows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
    ON email_marketing_workflows FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
    ON email_marketing_workflows FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 2. INBOX EMAILS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS inbox_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id VARCHAR(500) UNIQUE,
    thread_id VARCHAR(500),
    from_email VARCHAR(255),
    from_name VARCHAR(255),
    to_email VARCHAR(255),
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    received_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    labels TEXT[],
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inbox_emails_user_id ON inbox_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_message_id ON inbox_emails(message_id);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_thread_id ON inbox_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_received_at ON inbox_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_emails_is_read ON inbox_emails(is_read);

-- Enable RLS
ALTER TABLE inbox_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own inbox emails" ON inbox_emails;
DROP POLICY IF EXISTS "Users can insert their own inbox emails" ON inbox_emails;
DROP POLICY IF EXISTS "Users can update their own inbox emails" ON inbox_emails;
DROP POLICY IF EXISTS "Users can delete their own inbox emails" ON inbox_emails;

CREATE POLICY "Users can view their own inbox emails"
    ON inbox_emails FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inbox emails"
    ON inbox_emails FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox emails"
    ON inbox_emails FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inbox emails"
    ON inbox_emails FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. CALL LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    call_sid VARCHAR(500),
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    direction VARCHAR(20), -- inbound, outbound
    status VARCHAR(50),
    duration INTEGER, -- seconds
    recording_url TEXT,
    transcription TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_sid ON call_logs(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact_id ON call_logs(contact_id);

-- Enable RLS
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own call logs" ON call_logs;
DROP POLICY IF EXISTS "Users can insert their own call logs" ON call_logs;
DROP POLICY IF EXISTS "Users can update their own call logs" ON call_logs;
DROP POLICY IF EXISTS "Users can delete their own call logs" ON call_logs;

CREATE POLICY "Users can view their own call logs"
    ON call_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs"
    ON call_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call logs"
    ON call_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own call logs"
    ON call_logs FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. MEETING BOOKINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_link_id UUID,
    attendee_name VARCHAR(255),
    attendee_email VARCHAR(255) NOT NULL,
    attendee_phone VARCHAR(50),
    meeting_type VARCHAR(100),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone VARCHAR(100),
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    meeting_url TEXT,
    notes TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_bookings_user_id ON meeting_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_scheduled_at ON meeting_bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_status ON meeting_bookings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_attendee_email ON meeting_bookings(attendee_email);

-- Enable RLS
ALTER TABLE meeting_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own meeting bookings" ON meeting_bookings;
DROP POLICY IF EXISTS "Anyone can create meeting bookings" ON meeting_bookings;
DROP POLICY IF EXISTS "Users can update their own meeting bookings" ON meeting_bookings;
DROP POLICY IF EXISTS "Users can delete their own meeting bookings" ON meeting_bookings;

CREATE POLICY "Users can view their own meeting bookings"
    ON meeting_bookings FOR SELECT
    USING (auth.uid() = user_id);

-- Allow public to create bookings (for booking links)
CREATE POLICY "Anyone can create meeting bookings"
    ON meeting_bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own meeting bookings"
    ON meeting_bookings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting bookings"
    ON meeting_bookings FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. BOOKING LINKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS booking_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    buffer_time_minutes INTEGER DEFAULT 0,
    availability_config JSONB DEFAULT '{}'::jsonb,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    redirect_url TEXT,
    calendar_integration_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_links_user_id ON booking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_links_slug ON booking_links(slug);
CREATE INDEX IF NOT EXISTS idx_booking_links_is_active ON booking_links(is_active);

-- Enable RLS
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own booking links" ON booking_links;
DROP POLICY IF EXISTS "Anyone can view active booking links" ON booking_links;
DROP POLICY IF EXISTS "Users can insert their own booking links" ON booking_links;
DROP POLICY IF EXISTS "Users can update their own booking links" ON booking_links;
DROP POLICY IF EXISTS "Users can delete their own booking links" ON booking_links;

CREATE POLICY "Users can view their own booking links"
    ON booking_links FOR SELECT
    USING (auth.uid() = user_id);

-- Allow public to view active booking links by slug
CREATE POLICY "Anyone can view active booking links"
    ON booking_links FOR SELECT
    USING (is_active = true);

CREATE POLICY "Users can insert their own booking links"
    ON booking_links FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own booking links"
    ON booking_links FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own booking links"
    ON booking_links FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Additional tables now have:
-- ✅ user_id columns with foreign keys
-- ✅ Performance indexes on user_id
-- ✅ RLS enabled
-- ✅ RLS policies for CRUD operations
-- ✅ Proper data isolation per user
-- =====================================================
