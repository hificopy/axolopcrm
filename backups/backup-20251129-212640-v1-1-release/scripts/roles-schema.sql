-- ============================================
-- AXOLOP CRM: Discord-Style Roles & Permissions Schema
-- ============================================
-- This script creates the foundation for the Discord-style
-- roles and permissions system with hierarchy:
-- Agency Owner > Agency Admin > Seated User
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ROLE TEMPLATES TABLE
-- Global role templates that agencies can copy
-- ============================================
CREATE TABLE IF NOT EXISTS role_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#4A1515',
  icon VARCHAR(50),
  permissions JSONB NOT NULL DEFAULT '{}',
  section_access JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_role_templates_category ON role_templates(category);
CREATE INDEX IF NOT EXISTS idx_role_templates_position ON role_templates(position);

-- ============================================
-- 2. AGENCY ROLES TABLE
-- Custom roles created by agencies (copied from templates or custom)
-- ============================================
CREATE TABLE IF NOT EXISTS agency_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES role_templates(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#4A1515',
  icon VARCHAR(50),
  permissions JSONB NOT NULL DEFAULT '{}',
  section_access JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, name)
);

-- Indexes for agency roles
CREATE INDEX IF NOT EXISTS idx_agency_roles_agency ON agency_roles(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_roles_template ON agency_roles(template_id);
CREATE INDEX IF NOT EXISTS idx_agency_roles_position ON agency_roles(agency_id, position);

-- ============================================
-- 3. MEMBER ROLES TABLE
-- Join table for member <-> role assignments
-- A member can have multiple roles (like Discord)
-- ============================================
CREATE TABLE IF NOT EXISTS member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES agency_members(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES agency_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, role_id)
);

-- Indexes for member roles
CREATE INDEX IF NOT EXISTS idx_member_roles_member ON member_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_role ON member_roles(role_id);

-- ============================================
-- 4. MEMBER PERMISSION OVERRIDES TABLE
-- User-specific permission overrides (Discord-style)
-- These override role permissions for specific users
-- ============================================
CREATE TABLE IF NOT EXISTS member_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES agency_members(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  value BOOLEAN NOT NULL,
  set_by UUID REFERENCES auth.users(id),
  set_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  UNIQUE(member_id, permission_key)
);

-- Index for permission overrides
CREATE INDEX IF NOT EXISTS idx_member_permission_overrides_member ON member_permission_overrides(member_id);

-- ============================================
-- 5. MODIFY AGENCIES TABLE
-- Add owner_id (ONLY person who manages billing)
-- ============================================
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Index for owner lookup
CREATE INDEX IF NOT EXISTS idx_agencies_owner ON agencies(owner_id);

-- ============================================
-- 6. MODIFY AGENCY_MEMBERS TABLE
-- Add member_type for hierarchy
-- ============================================
ALTER TABLE agency_members ADD COLUMN IF NOT EXISTS member_type VARCHAR(20) DEFAULT 'seated_user';

-- Constraint to ensure valid member types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_members_member_type_check'
  ) THEN
    ALTER TABLE agency_members ADD CONSTRAINT agency_members_member_type_check
    CHECK (member_type IN ('owner', 'admin', 'seated_user'));
  END IF;
END $$;

-- Index for member type
CREATE INDEX IF NOT EXISTS idx_agency_members_type ON agency_members(agency_id, member_type);

-- ============================================
-- 7. RPC FUNCTIONS FOR ROLE MANAGEMENT
-- ============================================

-- Function to get all roles for a member with resolved permissions
CREATE OR REPLACE FUNCTION get_member_roles_with_permissions(p_member_id UUID)
RETURNS TABLE (
  role_id UUID,
  role_name VARCHAR,
  role_display_name VARCHAR,
  role_color VARCHAR,
  role_permissions JSONB,
  role_section_access JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ar.id,
    ar.name,
    ar.display_name,
    ar.color,
    ar.permissions,
    ar.section_access
  FROM member_roles mr
  JOIN agency_roles ar ON ar.id = mr.role_id
  WHERE mr.member_id = p_member_id
  ORDER BY ar.position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get permission overrides for a member
CREATE OR REPLACE FUNCTION get_member_permission_overrides(p_member_id UUID)
RETURNS TABLE (
  permission_key VARCHAR,
  override_value BOOLEAN,
  override_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mpo.permission_key,
    mpo.value,
    mpo.reason
  FROM member_permission_overrides mpo
  WHERE mpo.member_id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve final permissions for a member (Discord-style)
CREATE OR REPLACE FUNCTION resolve_member_permissions(p_member_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_member_type VARCHAR;
  v_agency_id UUID;
  v_user_id UUID;
  v_is_god_mode BOOLEAN;
  v_merged_permissions JSONB := '{}';
  v_role_record RECORD;
  v_override_record RECORD;
  v_perm_key TEXT;
  v_perm_value BOOLEAN;
BEGIN
  -- Get member info
  SELECT am.member_type, am.agency_id, am.user_id
  INTO v_member_type, v_agency_id, v_user_id
  FROM agency_members am
  WHERE am.id = p_member_id;

  IF v_member_type IS NULL THEN
    RETURN '{}';
  END IF;

  -- Check for god mode (special admin users)
  SELECT EXISTS(
    SELECT 1 FROM auth.users u
    WHERE u.id = v_user_id
    AND u.email IN ('axolopcrm@gmail.com', 'kate@kateviolet.com')
  ) INTO v_is_god_mode;

  -- Owner or God Mode gets ALL permissions
  IF v_member_type = 'owner' OR v_is_god_mode THEN
    RETURN '{
      "can_view_dashboard": true,
      "can_view_leads": true,
      "can_create_leads": true,
      "can_edit_leads": true,
      "can_delete_leads": true,
      "can_view_contacts": true,
      "can_create_contacts": true,
      "can_edit_contacts": true,
      "can_delete_contacts": true,
      "can_view_opportunities": true,
      "can_create_opportunities": true,
      "can_edit_opportunities": true,
      "can_delete_opportunities": true,
      "can_view_activities": true,
      "can_create_activities": true,
      "can_edit_activities": true,
      "can_view_meetings": true,
      "can_manage_meetings": true,
      "can_view_calendar": true,
      "can_manage_calendar": true,
      "can_view_forms": true,
      "can_manage_forms": true,
      "can_view_campaigns": true,
      "can_manage_campaigns": true,
      "can_view_workflows": true,
      "can_manage_workflows": true,
      "can_view_reports": true,
      "can_export_data": true,
      "can_import_data": true,
      "can_manage_team": true,
      "can_manage_roles": true,
      "can_manage_billing": true,
      "can_manage_agency_settings": true,
      "can_access_api": true,
      "can_manage_integrations": true,
      "can_view_second_brain": true,
      "can_manage_second_brain": true
    }'::JSONB;
  END IF;

  -- Admin gets management permissions (except billing)
  IF v_member_type = 'admin' THEN
    v_merged_permissions := '{
      "can_view_dashboard": true,
      "can_view_leads": true,
      "can_create_leads": true,
      "can_edit_leads": true,
      "can_delete_leads": true,
      "can_view_contacts": true,
      "can_create_contacts": true,
      "can_edit_contacts": true,
      "can_delete_contacts": true,
      "can_view_opportunities": true,
      "can_create_opportunities": true,
      "can_edit_opportunities": true,
      "can_delete_opportunities": true,
      "can_view_activities": true,
      "can_create_activities": true,
      "can_edit_activities": true,
      "can_view_meetings": true,
      "can_manage_meetings": true,
      "can_view_calendar": true,
      "can_manage_calendar": true,
      "can_view_forms": true,
      "can_manage_forms": true,
      "can_view_campaigns": true,
      "can_manage_campaigns": true,
      "can_view_workflows": true,
      "can_manage_workflows": true,
      "can_view_reports": true,
      "can_export_data": true,
      "can_import_data": true,
      "can_manage_team": true,
      "can_manage_roles": true,
      "can_manage_billing": false,
      "can_manage_agency_settings": true,
      "can_access_api": true,
      "can_manage_integrations": true,
      "can_view_second_brain": true,
      "can_manage_second_brain": true
    }'::JSONB;
  ELSE
    -- Seated user: merge role permissions (most permissive wins)
    FOR v_role_record IN
      SELECT ar.permissions
      FROM member_roles mr
      JOIN agency_roles ar ON ar.id = mr.role_id
      WHERE mr.member_id = p_member_id
      ORDER BY ar.position
    LOOP
      -- Merge permissions (OR logic - if any role grants, permission is granted)
      FOR v_perm_key, v_perm_value IN SELECT * FROM jsonb_each_text(v_role_record.permissions)
      LOOP
        IF v_perm_value::BOOLEAN = true THEN
          v_merged_permissions := v_merged_permissions || jsonb_build_object(v_perm_key, true);
        ELSIF NOT v_merged_permissions ? v_perm_key THEN
          v_merged_permissions := v_merged_permissions || jsonb_build_object(v_perm_key, false);
        END IF;
      END LOOP;
    END LOOP;
  END IF;

  -- Apply permission overrides (these ALWAYS win)
  FOR v_override_record IN
    SELECT permission_key, value
    FROM member_permission_overrides
    WHERE member_id = p_member_id
  LOOP
    v_merged_permissions := v_merged_permissions ||
      jsonb_build_object(v_override_record.permission_key, v_override_record.value);
  END LOOP;

  RETURN v_merged_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if member has specific permission
CREATE OR REPLACE FUNCTION member_has_permission(p_member_id UUID, p_permission VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  v_permissions := resolve_member_permissions(p_member_id);
  RETURN COALESCE((v_permissions ->> p_permission)::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to copy role template to agency
CREATE OR REPLACE FUNCTION copy_role_template_to_agency(
  p_template_id UUID,
  p_agency_id UUID,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_new_role_id UUID;
  v_template RECORD;
BEGIN
  -- Get template
  SELECT * INTO v_template FROM role_templates WHERE id = p_template_id;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Role template not found';
  END IF;

  -- Check if role already exists in agency
  IF EXISTS(SELECT 1 FROM agency_roles WHERE agency_id = p_agency_id AND name = v_template.name) THEN
    RAISE EXCEPTION 'Role with this name already exists in agency';
  END IF;

  -- Create agency role from template
  INSERT INTO agency_roles (
    agency_id, template_id, name, display_name, description,
    color, icon, permissions, section_access, position, created_by
  ) VALUES (
    p_agency_id, p_template_id, v_template.name, v_template.display_name, v_template.description,
    v_template.color, v_template.icon, v_template.permissions, v_template.section_access,
    v_template.position, p_created_by
  ) RETURNING id INTO v_new_role_id;

  RETURN v_new_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign role to member
CREATE OR REPLACE FUNCTION assign_role_to_member(
  p_member_id UUID,
  p_role_id UUID,
  p_assigned_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_member_agency UUID;
  v_role_agency UUID;
BEGIN
  -- Verify member and role belong to same agency
  SELECT agency_id INTO v_member_agency FROM agency_members WHERE id = p_member_id;
  SELECT agency_id INTO v_role_agency FROM agency_roles WHERE id = p_role_id;

  IF v_member_agency IS NULL OR v_role_agency IS NULL THEN
    RAISE EXCEPTION 'Member or role not found';
  END IF;

  IF v_member_agency != v_role_agency THEN
    RAISE EXCEPTION 'Member and role must belong to same agency';
  END IF;

  -- Insert role assignment (ignore if already exists)
  INSERT INTO member_roles (member_id, role_id, assigned_by)
  VALUES (p_member_id, p_role_id, p_assigned_by)
  ON CONFLICT (member_id, role_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove role from member
CREATE OR REPLACE FUNCTION remove_role_from_member(p_member_id UUID, p_role_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM member_roles WHERE member_id = p_member_id AND role_id = p_role_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set permission override
CREATE OR REPLACE FUNCTION set_permission_override(
  p_member_id UUID,
  p_permission_key VARCHAR,
  p_value BOOLEAN,
  p_set_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO member_permission_overrides (member_id, permission_key, value, set_by, reason)
  VALUES (p_member_id, p_permission_key, p_value, p_set_by, p_reason)
  ON CONFLICT (member_id, permission_key)
  DO UPDATE SET value = p_value, set_by = p_set_by, set_at = NOW(), reason = p_reason;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove permission override (reverts to role-based permission)
CREATE OR REPLACE FUNCTION remove_permission_override(p_member_id UUID, p_permission_key VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM member_permission_overrides
  WHERE member_id = p_member_id AND permission_key = p_permission_key;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permission_overrides ENABLE ROW LEVEL SECURITY;

-- Role templates are readable by all authenticated users
CREATE POLICY "role_templates_select" ON role_templates
  FOR SELECT TO authenticated USING (true);

-- Agency roles - users can see roles for their agencies
CREATE POLICY "agency_roles_select" ON agency_roles
  FOR SELECT TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
    )
  );

-- Agency roles - only admins/owners can manage
CREATE POLICY "agency_roles_insert" ON agency_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_members
      WHERE agency_id = agency_roles.agency_id
      AND user_id = auth.uid()
      AND member_type IN ('owner', 'admin')
    )
  );

CREATE POLICY "agency_roles_update" ON agency_roles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members
      WHERE agency_id = agency_roles.agency_id
      AND user_id = auth.uid()
      AND member_type IN ('owner', 'admin')
    )
  );

CREATE POLICY "agency_roles_delete" ON agency_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members
      WHERE agency_id = agency_roles.agency_id
      AND user_id = auth.uid()
      AND member_type IN ('owner', 'admin')
    )
  );

-- Member roles - users can see role assignments in their agencies
CREATE POLICY "member_roles_select" ON member_roles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_roles.member_id
      AND am2.user_id = auth.uid()
    )
  );

-- Member roles - only admins/owners can manage
CREATE POLICY "member_roles_insert" ON member_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_roles.member_id
      AND am2.user_id = auth.uid()
      AND am2.member_type IN ('owner', 'admin')
    )
  );

CREATE POLICY "member_roles_delete" ON member_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_roles.member_id
      AND am2.user_id = auth.uid()
      AND am2.member_type IN ('owner', 'admin')
    )
  );

-- Permission overrides - same as member roles
CREATE POLICY "member_permission_overrides_select" ON member_permission_overrides
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_permission_overrides.member_id
      AND am2.user_id = auth.uid()
    )
  );

CREATE POLICY "member_permission_overrides_insert" ON member_permission_overrides
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_permission_overrides.member_id
      AND am2.user_id = auth.uid()
      AND am2.member_type IN ('owner', 'admin')
    )
  );

CREATE POLICY "member_permission_overrides_update" ON member_permission_overrides
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_permission_overrides.member_id
      AND am2.user_id = auth.uid()
      AND am2.member_type IN ('owner', 'admin')
    )
  );

CREATE POLICY "member_permission_overrides_delete" ON member_permission_overrides
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agency_members am1
      JOIN agency_members am2 ON am1.agency_id = am2.agency_id
      WHERE am1.id = member_permission_overrides.member_id
      AND am2.user_id = auth.uid()
      AND am2.member_type IN ('owner', 'admin')
    )
  );

-- ============================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS role_templates_updated_at ON role_templates;
CREATE TRIGGER role_templates_updated_at
  BEFORE UPDATE ON role_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS agency_roles_updated_at ON agency_roles;
CREATE TRIGGER agency_roles_updated_at
  BEFORE UPDATE ON agency_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE: Roles schema created
-- ============================================
