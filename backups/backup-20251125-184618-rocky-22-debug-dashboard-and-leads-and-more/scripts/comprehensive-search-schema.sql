-- ============================================
-- COMPREHENSIVE UNIVERSAL SEARCH SCHEMA
-- ============================================
-- This script adds all missing entities for universal search coverage
-- Run this in Supabase SQL editor
-- Script is IDEMPOTENT - safe to run multiple times

-- ============================================
-- STEP 0: ENSURE CORE TABLES EXIST (dependencies)
-- ============================================
-- The agencies table is required by many other tables as a foreign key

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('solo', 'small', 'medium', 'large', 'enterprise')),
  timezone TEXT DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'trial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agencies lookups
CREATE INDEX IF NOT EXISTS idx_agencies_owner_id ON agencies(owner_id);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);

-- ============================================
-- STEP 1: ADD MISSING COLUMNS TO EXISTING TABLES FIRST
-- ============================================
-- This MUST run before indexes to avoid "column does not exist" errors

-- Add category column to quick_actions if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quick_actions' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_actions' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE quick_actions ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
  END IF;
END $$;

-- Add category column to help_articles if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_articles' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE help_articles ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
  END IF;
END $$;

-- Add category column to video_tutorials if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_tutorials' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_tutorials' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE video_tutorials ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
  END IF;
END $$;

-- Add category and key columns to user_preferences if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE user_preferences ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'key' AND table_schema = 'public') THEN
      ALTER TABLE user_preferences ADD COLUMN key TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'value' AND table_schema = 'public') THEN
      ALTER TABLE user_preferences ADD COLUMN value JSONB;
    END IF;
  END IF;
END $$;

-- Add category and key columns to app_settings if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE app_settings ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'key' AND table_schema = 'public') THEN
      ALTER TABLE app_settings ADD COLUMN key TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'value' AND table_schema = 'public') THEN
      ALTER TABLE app_settings ADD COLUMN value JSONB;
    END IF;
  END IF;
END $$;

-- Add category column to workflow_templates if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_templates' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_templates' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE workflow_templates ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_templates' AND column_name = 'use_count' AND table_schema = 'public') THEN
      ALTER TABLE workflow_templates ADD COLUMN use_count INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Add category column to important_dates if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'important_dates' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'important_dates' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE important_dates ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
  END IF;
END $$;

-- Add category column to email_templates if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE email_templates ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'body_preview' AND table_schema = 'public') THEN
      ALTER TABLE email_templates ADD COLUMN body_preview TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'usage_count' AND table_schema = 'public') THEN
      ALTER TABLE email_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Add category column to products if table exists and column doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category' AND table_schema = 'public') THEN
      ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
  END IF;
END $$;

-- Add columns to recurring_events if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recurring_events' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_events' AND column_name = 'recurrence_pattern' AND table_schema = 'public') THEN
      ALTER TABLE recurring_events ADD COLUMN recurrence_pattern TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_events' AND column_name = 'next_occurrence' AND table_schema = 'public') THEN
      ALTER TABLE recurring_events ADD COLUMN next_occurrence TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- Add columns to notifications if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type' AND table_schema = 'public') THEN
      ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'info';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority' AND table_schema = 'public') THEN
      ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read' AND table_schema = 'public') THEN
      ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title' AND table_schema = 'public') THEN
      ALTER TABLE notifications ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message' AND table_schema = 'public') THEN
      ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;
  END IF;
END $$;

-- Add columns to feature_flags if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flags' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_flags' AND column_name = 'flag_name' AND table_schema = 'public') THEN
      ALTER TABLE feature_flags ADD COLUMN flag_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_flags' AND column_name = 'enabled' AND table_schema = 'public') THEN
      ALTER TABLE feature_flags ADD COLUMN enabled BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feature_flags' AND column_name = 'description' AND table_schema = 'public') THEN
      ALTER TABLE feature_flags ADD COLUMN description TEXT;
    END IF;
  END IF;
END $$;

-- Add columns to audit_logs if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action' AND table_schema = 'public') THEN
      ALTER TABLE audit_logs ADD COLUMN action TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type' AND table_schema = 'public') THEN
      ALTER TABLE audit_logs ADD COLUMN entity_type TEXT;
    END IF;
  END IF;
END $$;

-- Add columns to help_articles if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_articles' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'tags' AND table_schema = 'public') THEN
      ALTER TABLE help_articles ADD COLUMN tags TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'published' AND table_schema = 'public') THEN
      ALTER TABLE help_articles ADD COLUMN published BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'featured' AND table_schema = 'public') THEN
      ALTER TABLE help_articles ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'title' AND table_schema = 'public') THEN
      ALTER TABLE help_articles ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'content' AND table_schema = 'public') THEN
      ALTER TABLE help_articles ADD COLUMN content TEXT;
    END IF;
  END IF;
END $$;

-- Add columns to quick_actions if table exists and columns don't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quick_actions' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_actions' AND column_name = 'enabled' AND table_schema = 'public') THEN
      ALTER TABLE quick_actions ADD COLUMN enabled BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_actions' AND column_name = 'action_type' AND table_schema = 'public') THEN
      ALTER TABLE quick_actions ADD COLUMN action_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_actions' AND column_name = 'order_index' AND table_schema = 'public') THEN
      ALTER TABLE quick_actions ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_actions' AND column_name = 'title' AND table_schema = 'public') THEN
      ALTER TABLE quick_actions ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_actions' AND column_name = 'description' AND table_schema = 'public') THEN
      ALTER TABLE quick_actions ADD COLUMN description TEXT;
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 2: AGENCY USERS JUNCTION TABLE
-- ============================================
-- This table links users to agencies (required for RLS policies)

CREATE TABLE IF NOT EXISTS agency_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_agency_users_agency_id ON agency_users(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_user_id ON agency_users(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_users_role ON agency_users(role);
CREATE INDEX IF NOT EXISTS idx_agency_users_status ON agency_users(status);
CREATE INDEX IF NOT EXISTS idx_agency_users_lookup ON agency_users(agency_id, user_id);

-- RLS for agency_users (idempotent)
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own agency memberships" ON agency_users;
CREATE POLICY "Users can view their own agency memberships" ON agency_users
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Agency admins can manage agency users" ON agency_users;
CREATE POLICY "Agency admins can manage agency users" ON agency_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency_users au
      WHERE au.agency_id = agency_users.agency_id
      AND au.user_id = auth.uid()
      AND au.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- STEP 3: USER PREFERENCES & SETTINGS
-- ============================================

-- User Preferences (individual user settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('ui', 'notifications', 'privacy', 'accessibility', 'productivity', 'shortcuts')),
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, key)
);

-- App Settings (agency-wide settings)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('general', 'email', 'integrations', 'security', 'billing', 'features')),
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, category, key)
);

-- Feature Flags (enable/disable features per agency)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  flag_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, flag_name)
);

-- ============================================
-- SYSTEM & AUDIT ENTITIES
-- ============================================

-- Comprehensive Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  session_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'import', 'share', 'archive', 'restore')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  browser_info JSONB,
  location JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'task', 'reminder', 'mention', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Status & Health
CREATE TABLE IF NOT EXISTS system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down', 'maintenance')),
  message TEXT,
  metrics JSONB,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  incident_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HELP & DOCUMENTATION
-- ============================================

-- Help Articles & Documentation
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  related_articles UUID[],
  author_id UUID REFERENCES auth.users(id),
  last_updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Tutorials
CREATE TABLE IF NOT EXISTS video_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  category TEXT NOT NULL,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUICK ACTIONS & COMMANDS
-- ============================================

-- Quick Actions (command palette actions)
CREATE TABLE IF NOT EXISTS quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- lucide icon name
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'navigate', 'api_call', 'command', 'toggle', 'export', 'import')),
  target_route TEXT,
  target_entity TEXT,
  keyboard_shortcut TEXT,
  permissions TEXT[],
  enabled BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(title, action_type)
);

-- Command History
CREATE TABLE IF NOT EXISTS command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  command TEXT NOT NULL,
  command_type TEXT NOT NULL, -- 'search', 'create', 'navigate', 'action'
  entity_type TEXT,
  entity_id UUID,
  success BOOLEAN DEFAULT true,
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEMPLATES & AUTOMATION
-- ============================================

-- Email Templates (enhanced)
CREATE TABLE IF NOT EXISTS email_templates_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  html_content TEXT,
  text_content TEXT,
  category TEXT DEFAULT 'marketing',
  tags TEXT[],
  variables JSONB, -- template variables
  preview_text TEXT,
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Templates (enhanced)
CREATE TABLE IF NOT EXISTS workflow_templates_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'automation',
  tags TEXT[],
  trigger_type TEXT,
  steps JSONB,
  variables JSONB,
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INTEGRATIONS & APIS
-- ============================================

-- API Keys & Integrations
CREATE TABLE IF NOT EXISTS api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL, -- 'sendgrid', 'twilio', 'stripe', 'google', 'slack', etc.
  integration_type TEXT NOT NULL CHECK (integration_type IN ('email', 'sms', 'payment', 'calendar', 'storage', 'analytics', 'communication')),
  api_key_encrypted TEXT,
  webhook_url TEXT,
  configuration JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  last_sync_at TIMESTAMPTZ,
  sync_errors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES api_integrations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS & REPORTING
-- ============================================

-- User Activity Analytics
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  session_id TEXT,
  page_url TEXT,
  action TEXT, -- 'page_view', 'click', 'form_submit', 'search', etc.
  entity_type TEXT,
  entity_id UUID,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  dimensions JSONB, -- additional context
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR SEARCH PERFORMANCE
-- ============================================

-- User Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_search ON user_preferences(user_id, category, key);

-- App Settings Indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_agency_id ON app_settings(agency_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_search ON app_settings(agency_id, category, key);

-- Feature Flags Indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_agency_id ON feature_flags(agency_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_id ON audit_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON audit_logs(agency_id, action, entity_type, created_at DESC);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_agency_id ON notifications(agency_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_search ON notifications(user_id, type, read, created_at DESC);

-- Help Articles Indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_tags ON help_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_help_articles_published ON help_articles(published);
CREATE INDEX IF NOT EXISTS idx_help_articles_featured ON help_articles(featured);
CREATE INDEX IF NOT EXISTS idx_help_articles_search ON help_articles(published, category, title);

-- Add search_vector column for full-text search (to_tsvector is not IMMUTABLE, so we store it)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'help_articles' AND column_name = 'search_vector' AND table_schema = 'public') THEN
    ALTER TABLE help_articles ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Create trigger to auto-update search_vector
CREATE OR REPLACE FUNCTION help_articles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, '') || ' ' || coalesce(array_to_string(NEW.tags, ' '), ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS help_articles_search_vector_trigger ON help_articles;
CREATE TRIGGER help_articles_search_vector_trigger BEFORE INSERT OR UPDATE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION help_articles_search_vector_update();

-- Update existing rows to populate search_vector
UPDATE help_articles SET search_vector = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))
WHERE search_vector IS NULL;

-- Now create the GIN index on the stored tsvector column
CREATE INDEX IF NOT EXISTS idx_help_articles_fulltext ON help_articles USING GIN(search_vector);

-- Quick Actions Indexes
CREATE INDEX IF NOT EXISTS idx_quick_actions_enabled ON quick_actions(enabled);
CREATE INDEX IF NOT EXISTS idx_quick_actions_category ON quick_actions(category);
CREATE INDEX IF NOT EXISTS idx_quick_actions_action_type ON quick_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_quick_actions_order ON quick_actions(order_index);
CREATE INDEX IF NOT EXISTS idx_quick_actions_search ON quick_actions(enabled, title, description);

-- Command History Indexes
CREATE INDEX IF NOT EXISTS idx_command_history_user_id ON command_history(user_id);
CREATE INDEX IF NOT EXISTS idx_command_history_command_type ON command_history(command_type);
CREATE INDEX IF NOT EXISTS idx_command_history_created_at ON command_history(created_at DESC);

-- API Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_api_integrations_agency_id ON api_integrations(agency_id);
CREATE INDEX IF NOT EXISTS idx_api_integrations_service_name ON api_integrations(service_name);
CREATE INDEX IF NOT EXISTS idx_api_integrations_status ON api_integrations(status);

-- User Activity Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_agency_id ON user_activity(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- ============================================
-- RLS POLICIES (idempotent - drops before creating)
-- ============================================

-- User Preferences RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- App Settings RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agency users can view their settings" ON app_settings;
CREATE POLICY "Agency users can view their settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency_users
      WHERE agency_users.agency_id = app_settings.agency_id
      AND agency_users.user_id = auth.uid()
    )
  );

-- Feature Flags RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agency users can view their feature flags" ON feature_flags;
CREATE POLICY "Agency users can view their feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency_users
      WHERE agency_users.agency_id = feature_flags.agency_id
      AND agency_users.user_id = auth.uid()
    )
  );

-- Audit Logs RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their agency audit logs" ON audit_logs;
CREATE POLICY "Users can view their agency audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agency_users
      WHERE agency_users.agency_id = audit_logs.agency_id
      AND agency_users.user_id = auth.uid()
    )
  );

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Help Articles RLS
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published help articles" ON help_articles;
CREATE POLICY "Anyone can view published help articles" ON help_articles
  FOR SELECT USING (published = true);

-- Quick Actions RLS
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view enabled quick actions" ON quick_actions;
CREATE POLICY "Anyone can view enabled quick actions" ON quick_actions
  FOR SELECT USING (enabled = true);

-- Command History RLS
ALTER TABLE command_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own command history" ON command_history;
CREATE POLICY "Users can view their own command history" ON command_history
  FOR ALL USING (auth.uid() = user_id);

-- API Integrations RLS
ALTER TABLE api_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agency users can view their integrations" ON api_integrations;
CREATE POLICY "Agency users can view their integrations" ON api_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency_users
      WHERE agency_users.agency_id = api_integrations.agency_id
      AND agency_users.user_id = auth.uid()
    )
  );

-- User Activity RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own activity" ON user_activity;
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS (idempotent - drops before creating)
-- ============================================

-- Update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_help_articles_updated_at ON help_articles;
CREATE TRIGGER update_help_articles_updated_at BEFORE UPDATE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quick_actions_updated_at ON quick_actions;
CREATE TRIGGER update_quick_actions_updated_at BEFORE UPDATE ON quick_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_integrations_updated_at ON api_integrations;
CREATE TRIGGER update_api_integrations_updated_at BEFORE UPDATE ON api_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_users_updated_at ON agency_users;
CREATE TRIGGER update_agency_users_updated_at BEFORE UPDATE ON agency_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agencies_updated_at ON agencies;
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default quick actions
INSERT INTO quick_actions (title, description, icon, action_type, target_route, target_entity, keyboard_shortcut, category, order_index) VALUES
-- Create Actions
('Create New Lead', 'Add a new lead to your CRM', 'Users', 'create', '/app/leads/new', 'lead', 'cmd+shift+l', 'create', 1),
('Create New Contact', 'Add a new contact', 'Building2', 'create', '/app/contacts/new', 'contact', 'cmd+shift+c', 'create', 2),
('Create New Form', 'Build a new form', 'FileText', 'create', '/app/forms/builder/new', 'form', 'cmd+shift+f', 'create', 3),
('Create New Campaign', 'Launch a new email campaign', 'Mail', 'create', '/app/email-campaigns/new', 'campaign', 'cmd+shift+m', 'create', 4),
('Create New Meeting', 'Schedule a new meeting', 'Calendar', 'create', '/app/calendar/new', 'meeting', 'cmd+shift+e', 'create', 5),
('Create New Deal', 'Add a new deal to pipeline', 'Target', 'create', '/app/deals/new', 'deal', 'cmd+shift+d', 'create', 6),
('Create New Task', 'Add a new task', 'CheckCircle', 'create', '/app/tasks/new', 'task', 'cmd+shift+t', 'create', 7),
('Create New Note', 'Create a new note in Second Brain', 'FileText', 'create', '/app/second-brain/notes/new', 'note', 'cmd+shift+n', 'create', 8),
('Create New Workflow', 'Build a new workflow', 'Zap', 'create', '/app/workflows/new', 'workflow', 'cmd+shift+w', 'create', 9),
('Create New Opportunity', 'Add a new opportunity', 'TrendingUp', 'create', '/app/opportunities/new', 'opportunity', 'cmd+shift+o', 'create', 10),

-- Navigation Actions
('Go to Dashboard', 'Navigate to main dashboard', 'Layout', 'navigate', '/app/dashboard', null, 'cmd+1', 'navigate', 20),
('Go to Leads', 'View all leads', 'Users', 'navigate', '/app/leads', null, 'cmd+2', 'navigate', 21),
('Go to Contacts', 'View all contacts', 'Building2', 'navigate', '/app/contacts', null, 'cmd+3', 'navigate', 22),
('Go to Calendar', 'View calendar', 'Calendar', 'navigate', '/app/calendar', null, 'cmd+4', 'navigate', 23),
('Go to Forms', 'Manage forms', 'FileText', 'navigate', '/app/forms', null, 'cmd+5', 'navigate', 24),
('Go to Campaigns', 'View email campaigns', 'Mail', 'navigate', '/app/email-campaigns', null, 'cmd+6', 'navigate', 25),
('Go to Workflows', 'Manage workflows', 'Zap', 'navigate', '/app/workflows', null, 'cmd+7', 'navigate', 26),
('Go to Reports', 'View analytics and reports', 'BarChart3', 'navigate', '/app/reports', null, 'cmd+8', 'navigate', 27),
('Go to Settings', 'App settings and preferences', 'Settings', 'navigate', '/app/settings', null, 'cmd+,', 'navigate', 28),

-- Settings Actions
('User Profile', 'Manage your profile settings', 'User', 'navigate', '/app/profile', null, 'cmd+shift+p', 'settings', 30),
('Team Management', 'Manage team members and permissions', 'Users', 'navigate', '/app/team', null, 'cmd+shift+t', 'settings', 31),
('Agency Settings', 'Configure agency-wide settings', 'Building2', 'navigate', '/app/agency/settings', null, 'cmd+shift+a', 'settings', 32),
('Integrations', 'Manage third-party integrations', 'Zap', 'navigate', '/app/integrations', null, 'cmd+shift+i', 'settings', 33),
('Billing & Plans', 'View billing information and plans', 'CreditCard', 'navigate', '/app/billing', null, 'cmd+shift+b', 'settings', 34),

-- Help Actions
('Help Center', 'Get help and documentation', 'HelpCircle', 'navigate', '/app/help', null, 'cmd+?', 'help', 40),
('Keyboard Shortcuts', 'View all keyboard shortcuts', 'Command', 'navigate', '/app/shortcuts', null, 'cmd+/', 'help', 41),
('What''s New', 'Latest features and updates', 'Zap', 'navigate', '/app/whats-new', null, 'cmd+shift+n', 'help', 42),
('API Documentation', 'Developer API documentation', 'Code', 'navigate', '/app/docs/api', null, 'cmd+shift+d', 'help', 43),
('Video Tutorials', 'Watch video tutorials', 'Play', 'navigate', '/app/tutorials', null, 'cmd+shift+v', 'help', 44),

-- System Actions
('Toggle Dark Mode', 'Switch between light and dark themes', 'Moon', 'toggle', null, null, 'cmd+shift+d', 'system', 50),
('Export Data', 'Export your CRM data', 'Download', 'export', null, null, 'cmd+shift+e', 'system', 51),
('Import Data', 'Import data from other systems', 'Upload', 'import', null, null, 'cmd+shift+i', 'system', 52),
('System Status', 'Check system health and status', 'Activity', 'navigate', '/app/system/status', null, 'cmd+shift+s', 'system', 53)
ON CONFLICT (title, action_type) DO NOTHING;

-- Insert default help articles
INSERT INTO help_articles (title, slug, content, excerpt, category, tags, difficulty_level, order_index) VALUES
('Getting Started with Universal Search', 'getting-started-universal-search', 
'Learn how to use the powerful universal search and command palette to find anything in your CRM instantly.', 
'Master the universal search feature to navigate your CRM with lightning speed.', 
'getting-started', ARRAY['search', 'command-palette', 'productivity'], 'beginner', 1),

('Creating Your First Lead', 'creating-first-lead', 
'Step-by-step guide to creating and managing leads in Axolop CRM.', 
'Learn the lead creation process and best practices for lead management.', 
'leads', ARRAY['leads', 'creation', 'tutorial'], 'beginner', 2),

('Building Forms with the Form Builder', 'building-forms', 
'Discover how to create powerful forms with our drag-and-drop form builder.', 
'Master form creation with custom fields, conditional logic, and advanced features.', 
'forms', ARRAY['forms', 'builder', 'tutorial'], 'intermediate', 3),

('Setting Up Email Campaigns', 'setting-up-email-campaigns', 
'Learn to create and send effective email campaigns to your contacts.', 
'Complete guide to email marketing with templates, automation, and analytics.', 
'email', ARRAY['email', 'campaigns', 'marketing'], 'intermediate', 4),

('Workflow Automation Guide', 'workflow-automation-guide', 
'Automate repetitive tasks with powerful workflow automation.', 
'Build custom workflows to save time and improve efficiency.', 
'workflows', ARRAY['workflows', 'automation', 'productivity'], 'advanced', 5),

('Keyboard Shortcuts Reference', 'keyboard-shortcuts-reference', 
'Complete list of keyboard shortcuts to power through your CRM tasks.', 
'Memorize these shortcuts to navigate your CRM at lightning speed.', 
'productivity', ARRAY['shortcuts', 'keyboard', 'productivity'], 'beginner', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert default feature flags for ALL existing agencies
-- Using INSERT...SELECT pattern to handle multiple agencies properly
INSERT INTO feature_flags (agency_id, flag_name, enabled, description)
SELECT
  a.id,
  flags.flag_name,
  flags.enabled,
  flags.description
FROM agencies a
CROSS JOIN (
  VALUES
    ('universal_search', true, 'Enable universal search and command palette'),
    ('quick_actions', true, 'Enable quick actions in search'),
    ('command_palette', true, 'Enable command palette functionality'),
    ('real_time_creation', true, 'Enable real-time entity creation from search'),
    ('advanced_search', true, 'Enable advanced search with filters')
) AS flags(flag_name, enabled, description)
ON CONFLICT (agency_id, flag_name) DO NOTHING;

-- ============================================
-- SIMPLE VIEWS FOR SEARCH (no dynamic parameters)
-- ============================================

-- Help Articles View (simple, for listing)
CREATE OR REPLACE VIEW help_articles_published AS
SELECT
  id,
  title,
  slug,
  content,
  excerpt,
  category,
  tags,
  difficulty_level,
  view_count,
  helpful_count,
  featured,
  created_at,
  updated_at
FROM help_articles
WHERE published = true
ORDER BY featured DESC, view_count DESC;

-- Quick Actions View (simple, for listing)
CREATE OR REPLACE VIEW quick_actions_enabled AS
SELECT
  id,
  title,
  description,
  icon,
  action_type,
  target_route,
  target_entity,
  keyboard_shortcut,
  category,
  order_index
FROM quick_actions
WHERE enabled = true
ORDER BY category, order_index;

-- ============================================
-- GRANT PERMISSIONS FOR SERVICE ROLE
-- ============================================

-- Grant permissions on new tables (ignore errors if tables don't exist)
DO $$
BEGIN
  GRANT ALL ON user_preferences TO service_role;
  GRANT ALL ON app_settings TO service_role;
  GRANT ALL ON feature_flags TO service_role;
  GRANT ALL ON audit_logs TO service_role;
  GRANT ALL ON notifications TO service_role;
  GRANT ALL ON system_status TO service_role;
  GRANT ALL ON help_articles TO service_role;
  GRANT ALL ON video_tutorials TO service_role;
  GRANT ALL ON quick_actions TO service_role;
  GRANT ALL ON command_history TO service_role;
  GRANT ALL ON email_templates_enhanced TO service_role;
  GRANT ALL ON workflow_templates_enhanced TO service_role;
  GRANT ALL ON api_integrations TO service_role;
  GRANT ALL ON webhook_logs TO service_role;
  GRANT ALL ON user_activity TO service_role;
  GRANT ALL ON performance_metrics TO service_role;
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if service_role doesn't exist or tables don't exist
  NULL;
END $$;