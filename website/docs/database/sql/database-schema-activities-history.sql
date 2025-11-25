-- =============================================
-- Activities and History Tables Schema
-- =============================================
-- This schema creates the necessary tables for the Activities and History subsections
-- Run this in your Supabase SQL editor to set up the tables
-- =============================================

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- CALL, EMAIL, MEETING, TASK, NOTE, VIDEO_CALL, OTHER
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    due_date TIMESTAMPTZ,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for activities table
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create history_events table
CREATE TABLE IF NOT EXISTS history_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- LEAD_CREATED, LEAD_UPDATED, OPPORTUNITY_WON, EMAIL_SENT, etc.
    entity_type VARCHAR(50) NOT NULL, -- LEAD, OPPORTUNITY, CONTACT, ACTIVITY, etc.
    entity_id UUID,
    entity_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    changes JSONB DEFAULT '{}', -- Store before/after values for updates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for history_events table
CREATE INDEX IF NOT EXISTS idx_history_events_user_id ON history_events(user_id);
CREATE INDEX IF NOT EXISTS idx_history_events_event_type ON history_events(event_type);
CREATE INDEX IF NOT EXISTS idx_history_events_entity_type ON history_events(entity_type);
CREATE INDEX IF NOT EXISTS idx_history_events_entity_id ON history_events(entity_id);
CREATE INDEX IF NOT EXISTS idx_history_events_created_at ON history_events(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activities table
CREATE POLICY "Users can view their own activities"
    ON activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
    ON activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
    ON activities FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
    ON activities FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for history_events table
CREATE POLICY "Users can view their own history events"
    ON history_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history events"
    ON history_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: History events are typically append-only (no updates or deletes)
-- If you need to allow deletion for cleanup purposes, uncomment the following:
-- CREATE POLICY "Users can delete their own history events"
--     ON history_events FOR DELETE
--     USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for activities table
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Optional: Sample data for testing
-- =============================================
-- Uncomment the following lines to insert sample data

-- INSERT INTO activities (user_id, type, title, description, status, due_date)
-- VALUES
--     (auth.uid(), 'CALL', 'Follow-up call with John Doe', 'Discuss pricing and contract terms', 'PENDING', NOW() + INTERVAL '1 day'),
--     (auth.uid(), 'EMAIL', 'Send proposal to Jane Smith', 'Send detailed proposal for Q1 services', 'COMPLETED', NOW() - INTERVAL '2 days'),
--     (auth.uid(), 'MEETING', 'Product demo with ABC Corp', 'Demonstrate new features and answer questions', 'IN_PROGRESS', NOW());

-- INSERT INTO history_events (user_id, event_type, entity_type, entity_id, entity_name, title, description)
-- VALUES
--     (auth.uid(), 'LEAD_CREATED', 'LEAD', uuid_generate_v4(), 'John Doe', 'Lead created', 'New lead John Doe was added to the system'),
--     (auth.uid(), 'OPPORTUNITY_WON', 'OPPORTUNITY', uuid_generate_v4(), 'ABC Corp Deal', 'Opportunity won', 'Successfully closed deal with ABC Corp for $50,000'),
--     (auth.uid(), 'EMAIL_SENT', 'ACTIVITY', uuid_generate_v4(), 'Welcome Email', 'Email sent', 'Welcome email sent to new lead');

-- =============================================
-- Verification Queries
-- =============================================
-- Run these queries to verify the tables were created successfully:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('activities', 'history_events');
-- SELECT * FROM activities LIMIT 5;
-- SELECT * FROM history_events LIMIT 5;
