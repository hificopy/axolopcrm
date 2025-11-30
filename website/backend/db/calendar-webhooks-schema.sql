-- Calendar Webhooks Table
-- Stores Google Calendar push notification webhook information

CREATE TABLE IF NOT EXISTS calendar_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  channel_id TEXT NOT NULL UNIQUE,
  resource_id TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  expiration TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stopped', 'expired')),
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_webhooks_user_id ON calendar_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_webhooks_channel_id ON calendar_webhooks(channel_id);
CREATE INDEX IF NOT EXISTS idx_calendar_webhooks_status ON calendar_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_calendar_webhooks_expiration ON calendar_webhooks(expiration);

-- RLS (Row Level Security) Policies
ALTER TABLE calendar_webhooks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own webhooks
CREATE POLICY "Users can view their own calendar webhooks" ON calendar_webhooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar webhooks" ON calendar_webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar webhooks" ON calendar_webhooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar webhooks" ON calendar_webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_webhooks TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE calendar_webhooks_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION gen_random_uuid() TO authenticated;

-- Comments for documentation
COMMENT ON TABLE calendar_webhooks IS 'Stores Google Calendar push notification webhook information for real-time sync';
COMMENT ON COLUMN calendar_webhooks.user_id IS 'ID of the user who owns this webhook';
COMMENT ON COLUMN calendar_webhooks.calendar_id IS 'Google Calendar ID (usually "primary")';
COMMENT ON COLUMN calendar_webhooks.channel_id IS 'Google Channel ID for the webhook';
COMMENT ON COLUMN calendar_webhooks.resource_id IS 'Google Resource ID for the webhook';
COMMENT ON COLUMN calendar_webhooks.webhook_url IS 'URL where Google sends webhook notifications';
COMMENT ON COLUMN calendar_webhooks.expiration IS 'When the webhook channel expires (Google limits to 7 days)';
COMMENT ON COLUMN calendar_webhooks.status IS 'Current status of the webhook';
COMMENT ON COLUMN calendar_webhooks.last_activity IS 'Last time this webhook received a notification';