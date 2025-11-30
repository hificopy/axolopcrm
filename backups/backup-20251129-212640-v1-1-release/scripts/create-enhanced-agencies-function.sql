-- Enhanced user agencies function
-- Returns agencies with enhanced data including member counts, permissions, and settings
CREATE OR REPLACE FUNCTION get_user_agencies_enhanced(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN,
  is_owner BOOLEAN,
  member_count INTEGER,
  role_name TEXT,
  permissions JSONB,
  settings JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_agency RECORD;
BEGIN
  -- Return agencies with enhanced data
  FOR v_agency IN (
    SELECT 
      a.id,
      a.name,
      a.description,
      a.logo_url,
      a.is_active,
      CASE WHEN am.user_id = p_user_id THEN true ELSE false END as is_owner,
      COALESCE(member_counts.member_count, 0) as member_count,
      COALESCE(r.name, 'Member') as role_name,
      COALESCE(r.permissions, '[]')::jsonb as permissions,
      COALESCE(a.settings, '{}')::jsonb as settings,
      a.created_at,
      a.updated_at
    FROM agencies a
    LEFT JOIN agency_members am ON a.id = am.agency_id AND am.user_id = p_user_id
    LEFT JOIN roles r ON am.role_id = r.id
    LEFT JOIN (
      SELECT 
        agency_id,
        COUNT(*) as member_count
      FROM agency_members
      WHERE is_active = true
      GROUP BY agency_id
    ) member_counts ON a.id = member_counts.agency_id
    WHERE a.is_active = true
    ORDER BY a.created_at DESC
  )
  LOOP
    RETURN NEXT v_agency;
  END LOOP;
END;
$$;