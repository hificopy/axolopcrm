-- ========================================
-- Axolop CRM - Agency Management Schema
-- ========================================
-- This schema implements a multi-tenant agency system where:
-- - Each paid account gets 1 agency with up to 3 users
-- - Agency admins can manage members and configure permissions
-- - axolopcrm@gmail.com has god mode (best tier always)
-- ========================================

-- Create enum types for roles and subscription tiers
DO $$ BEGIN
  CREATE TYPE agency_role AS ENUM ('admin', 'member', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'enterprise', 'god_mode');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- AGENCIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,

  -- Subscription info
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Limits based on subscription
  max_users INTEGER DEFAULT 3,
  current_users_count INTEGER DEFAULT 1,

  -- Settings
  settings JSONB DEFAULT '{
    "sections_enabled": {
      "dashboard": true,
      "leads": true,
      "contacts": true,
      "opportunities": true,
      "activities": true,
      "meetings": true,
      "forms": true,
      "email_campaigns": true,
      "workflows": true,
      "calendar": true,
      "second_brain": false,
      "mind_maps": false,
      "team_chat": false
    },
    "features_enabled": {
      "ai_scoring": true,
      "ai_transcription": true,
      "email_integration": true,
      "calendar_integration": true
    }
  }'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- ========================================
-- AGENCY MEMBERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS agency_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role agency_role DEFAULT 'member',
  permissions JSONB DEFAULT '{
    "can_view_dashboard": true,
    "can_view_leads": true,
    "can_edit_leads": true,
    "can_delete_leads": false,
    "can_view_contacts": true,
    "can_edit_contacts": true,
    "can_delete_contacts": false,
    "can_view_opportunities": true,
    "can_edit_opportunities": true,
    "can_view_activities": true,
    "can_view_meetings": true,
    "can_manage_meetings": false,
    "can_view_forms": true,
    "can_manage_forms": false,
    "can_view_campaigns": true,
    "can_manage_campaigns": false,
    "can_view_workflows": true,
    "can_manage_workflows": false,
    "can_view_calendar": true,
    "can_view_reports": true,
    "can_manage_team": false,
    "can_manage_billing": false,
    "can_manage_agency_settings": false
  }'::jsonb,

  -- Status
  invitation_status VARCHAR(50) DEFAULT 'active', -- 'pending', 'active', 'suspended'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure unique user per agency
  UNIQUE(agency_id, user_id)
);

-- ========================================
-- AGENCY SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE UNIQUE,

  -- Branding
  brand_color VARCHAR(7) DEFAULT '#ffed00', -- Axolop yellow
  brand_secondary_color VARCHAR(7) DEFAULT '#1a1d24',
  custom_domain TEXT,

  -- Email settings
  email_signature TEXT,
  default_email_from_name VARCHAR(255),
  default_email_reply_to VARCHAR(255),

  -- Notification preferences
  notifications JSONB DEFAULT '{
    "email_on_new_lead": true,
    "email_on_form_submission": true,
    "email_on_meeting_scheduled": true,
    "slack_notifications": false,
    "slack_webhook_url": null
  }'::jsonb,

  -- Integration settings
  integrations JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(slug);
CREATE INDEX IF NOT EXISTS idx_agencies_subscription ON agencies(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_agencies_active ON agencies(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_agency_members_agency ON agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user ON agency_members(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_role ON agency_members(role);
CREATE INDEX IF NOT EXISTS idx_agency_members_status ON agency_members(invitation_status);

CREATE INDEX IF NOT EXISTS idx_agency_settings_agency ON agency_settings(agency_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

-- Agencies: Users can only see agencies they're members of
CREATE POLICY agencies_select_policy ON agencies
  FOR SELECT
  USING (
    id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
    )
  );

-- Agencies: Only admins can update
CREATE POLICY agencies_update_policy ON agencies
  FOR UPDATE
  USING (
    id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Agency Members: Users can see members of their agencies
CREATE POLICY agency_members_select_policy ON agency_members
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
    )
  );

-- Agency Members: Only admins can manage members
CREATE POLICY agency_members_insert_policy ON agency_members
  FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY agency_members_update_policy ON agency_members
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY agency_members_delete_policy ON agency_members
  FOR DELETE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Agency Settings: Users can view settings of their agencies
CREATE POLICY agency_settings_select_policy ON agency_settings
  FOR SELECT
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
    )
  );

-- Agency Settings: Only admins can update settings
CREATE POLICY agency_settings_update_policy ON agency_settings
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT agency_id
      FROM agency_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp on agencies
CREATE OR REPLACE FUNCTION update_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agencies_updated_at_trigger
  BEFORE UPDATE ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_agencies_updated_at();

-- Update updated_at timestamp on agency_members
CREATE OR REPLACE FUNCTION update_agency_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agency_members_updated_at_trigger
  BEFORE UPDATE ON agency_members
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_members_updated_at();

-- Update updated_at timestamp on agency_settings
CREATE OR REPLACE FUNCTION update_agency_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agency_settings_updated_at_trigger
  BEFORE UPDATE ON agency_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_settings_updated_at();

-- Update current_users_count on agencies when members are added/removed
CREATE OR REPLACE FUNCTION update_agency_users_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE agencies
    SET current_users_count = (
      SELECT COUNT(*)
      FROM agency_members
      WHERE agency_id = NEW.agency_id
      AND invitation_status = 'active'
    )
    WHERE id = NEW.agency_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE agencies
    SET current_users_count = (
      SELECT COUNT(*)
      FROM agency_members
      WHERE agency_id = OLD.agency_id
      AND invitation_status = 'active'
    )
    WHERE id = OLD.agency_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.invitation_status != OLD.invitation_status THEN
    UPDATE agencies
    SET current_users_count = (
      SELECT COUNT(*)
      FROM agency_members
      WHERE agency_id = NEW.agency_id
      AND invitation_status = 'active'
    )
    WHERE id = NEW.agency_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agency_users_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agency_members
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_users_count();

-- Create agency_settings entry when agency is created
CREATE OR REPLACE FUNCTION create_agency_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agency_settings (agency_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_agency_settings_trigger
  AFTER INSERT ON agencies
  FOR EACH ROW
  EXECUTE FUNCTION create_agency_settings();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Check if user is admin of agency
CREATE OR REPLACE FUNCTION is_agency_admin(p_user_id UUID, p_agency_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM agency_members
    WHERE user_id = p_user_id
    AND agency_id = p_agency_id
    AND role = 'admin'
    AND invitation_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission in agency
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_agency_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT permissions INTO v_permissions
  FROM agency_members
  WHERE user_id = p_user_id
  AND agency_id = p_agency_id
  AND invitation_status = 'active';

  IF v_permissions IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN COALESCE((v_permissions->>p_permission)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's agencies with their role
CREATE OR REPLACE FUNCTION get_user_agencies(p_user_id UUID)
RETURNS TABLE (
  agency_id UUID,
  agency_name VARCHAR,
  agency_slug VARCHAR,
  agency_logo_url TEXT,
  user_role agency_role,
  subscription_tier subscription_tier,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.slug,
    a.logo_url,
    am.role,
    a.subscription_tier,
    a.is_active
  FROM agencies a
  INNER JOIN agency_members am ON a.id = am.agency_id
  WHERE am.user_id = p_user_id
  AND am.invitation_status = 'active'
  AND a.is_active = true
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default agency for new user
CREATE OR REPLACE FUNCTION create_default_agency_for_user(
  p_user_id UUID,
  p_user_email TEXT
)
RETURNS UUID AS $$
DECLARE
  v_agency_id UUID;
  v_slug VARCHAR;
  v_tier subscription_tier;
BEGIN
  -- Check if user is god mode
  IF p_user_email = 'axolopcrm@gmail.com' THEN
    v_tier := 'god_mode';
  ELSE
    v_tier := 'free';
  END IF;

  -- Generate unique slug from email
  v_slug := LOWER(REPLACE(SPLIT_PART(p_user_email, '@', 1), '.', '-')) || '-' || SUBSTRING(MD5(p_user_email::TEXT) FROM 1 FOR 6);

  -- Create agency
  INSERT INTO agencies (name, slug, subscription_tier)
  VALUES (
    SPLIT_PART(p_user_email, '@', 1) || '''s Agency',
    v_slug,
    v_tier
  )
  RETURNING id INTO v_agency_id;

  -- Add user as admin
  INSERT INTO agency_members (agency_id, user_id, role, invitation_status)
  VALUES (v_agency_id, p_user_id, 'admin', 'active');

  RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE agencies IS 'Stores agency information for multi-tenant setup';
COMMENT ON TABLE agency_members IS 'Links users to agencies with roles and permissions';
COMMENT ON TABLE agency_settings IS 'Stores agency-specific configuration and preferences';

COMMENT ON COLUMN agencies.max_users IS 'Maximum users allowed based on subscription tier';
COMMENT ON COLUMN agencies.current_users_count IS 'Current number of active users (auto-updated)';
COMMENT ON COLUMN agency_members.permissions IS 'Granular permissions for what user can access';
COMMENT ON COLUMN agency_members.role IS 'User role: admin (full access), member (limited), viewer (read-only)';
