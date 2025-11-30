-- Tasks table for project management / my work
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Core fields
    name TEXT NOT NULL,
    description TEXT,

    -- Organization
    group_name TEXT, -- e.g., "Hiring", "Events", "Youtube"
    board TEXT, -- e.g., "ceo", "juansbiz"

    -- Status & Priority
    status TEXT DEFAULT 'Not Started', -- Completed, Working on it, In Progress, Not Started, Published, etc.
    priority TEXT DEFAULT 'medium', -- critical, high, medium, low, TOF, MOF, BOF

    -- Assignment & Dates
    assigned_to TEXT, -- Person or team assigned
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Additional data
    tags TEXT[], -- Array of tags
    custom_fields JSONB DEFAULT '{}', -- Custom fields as JSON
    comments_count INTEGER DEFAULT 0,
    attachments_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- For ordering/sorting
    position INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_group_name ON tasks(group_name);
CREATE INDEX IF NOT EXISTS idx_tasks_board ON tasks(board);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own tasks
CREATE POLICY "Users can create their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at_trigger ON tasks;
CREATE TRIGGER update_tasks_updated_at_trigger
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();
