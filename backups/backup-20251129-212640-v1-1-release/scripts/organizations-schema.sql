-- ========================================
-- ORGANIZATIONS, TEAMS, ROLES & PERMISSIONS SCHEMA
-- ========================================

-- ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAM_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  permissions JSONB DEFAULT '[]',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations(name);
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON public.teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON public.roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);

-- RLS POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS POLICIES
CREATE POLICY "Users can view own organizations" ON public.organizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.organization_id = organizations.id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert organizations" ON public.organizations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.organization_id = organizations.id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can update organizations" ON public.organizations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.organization_id = organizations.id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
  )
);

-- TEAMS POLICIES
CREATE POLICY "Team members can view own teams" ON public.teams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can manage teams" ON public.teams FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
  )
);

-- TEAM_MEMBERS POLICIES
CREATE POLICY "Users can view own team memberships" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert team memberships" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team memberships" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own team memberships" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- ROLES POLICIES
CREATE POLICY "Users can view organization roles" ON public.roles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.organization_id = roles.organization_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Organization admins can manage roles" ON public.roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    JOIN public.teams t ON tm.team_id = t.id
    WHERE t.organization_id = roles.organization_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'owner')
  )
);

-- PERMISSIONS POLICIES
CREATE POLICY "Authenticated users can view permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');

-- TRIGGERS
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_user_organizations(p_user_id UUID)
RETURNS SETOF public.organizations AS $$
BEGIN
  RETURN QUERY
  SELECT o.* FROM public.organizations o
  JOIN public.teams t ON t.organization_id = o.id
  JOIN public.team_members tm ON tm.team_id = t.id AND tm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id UUID)
RETURNS SETOF public.teams AS $$
BEGIN
  RETURN QUERY
  SELECT t.* FROM public.teams t
  JOIN public.team_members tm ON tm.team_id = t.id AND tm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_roles(p_user_id UUID)
RETURNS SETOF public.roles AS $$
BEGIN
  RETURN QUERY
  SELECT r.* FROM public.roles r
  JOIN public.team_members tm ON tm.team_id IN (
    SELECT t.id FROM public.teams t WHERE t.organization_id = r.organization_id
  ) AND tm.user_id = p_user_id AND tm.role IN ('admin', 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GRANTS
GRANT EXECUTE ON FUNCTION public.get_user_organizations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_teams(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated;

-- COMMENTS
COMMENT ON TABLE public.organizations IS 'Organization/company information';
COMMENT ON TABLE public.teams IS 'Teams within organizations';
COMMENT ON TABLE public.team_members IS 'User membership in teams';
COMMENT ON TABLE public.roles IS 'User roles with permissions';
COMMENT ON TABLE public.permissions IS 'System permissions';