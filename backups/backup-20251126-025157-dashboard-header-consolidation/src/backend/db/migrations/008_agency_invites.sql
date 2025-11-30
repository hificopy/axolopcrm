-- ========================================
-- AGENCY INVITES MIGRATION
-- Adds invite link functionality for agencies
-- ========================================

-- ========================================
-- 1. AGENCY INVITES TABLE
-- Store invite codes with expiration
-- ========================================
CREATE TABLE IF NOT EXISTS public.agency_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,

  -- Invite details
  invite_code TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),

  -- Usage limits
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Creator
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agency_invites_agency_id ON public.agency_invites(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_invites_invite_code ON public.agency_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_agency_invites_is_active ON public.agency_invites(is_active);
CREATE INDEX IF NOT EXISTS idx_agency_invites_expires_at ON public.agency_invites(expires_at);

-- ========================================
-- 2. RLS POLICIES FOR AGENCY INVITES
-- ========================================
ALTER TABLE public.agency_invites ENABLE ROW LEVEL SECURITY;

-- Admins can read invites for their agencies
CREATE POLICY "invites_read_own_agency"
  ON public.agency_invites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_invites.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'admin'
        AND am.invitation_status = 'active'
    )
  );

-- Allow inserts (controlled by backend)
CREATE POLICY "invites_insert"
  ON public.agency_invites FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can update invites
CREATE POLICY "invites_update"
  ON public.agency_invites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_invites.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'admin'
        AND am.invitation_status = 'active'
    )
  );

-- Admins can delete invites
CREATE POLICY "invites_delete"
  ON public.agency_invites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_invites.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'admin'
        AND am.invitation_status = 'active'
    )
  );

-- ========================================
-- 3. TRIGGER FOR UPDATED_AT
-- ========================================
CREATE TRIGGER update_agency_invites_updated_at
  BEFORE UPDATE ON public.agency_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. RPC FUNCTIONS FOR INVITE SYSTEM
-- ========================================

-- Generate a unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN := TRUE;
BEGIN
  -- Keep generating until we find a unique code
  WHILE v_exists LOOP
    -- Generate 8-character alphanumeric code
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.agency_invites WHERE invite_code = v_code) INTO v_exists;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an invite for an agency
CREATE OR REPLACE FUNCTION public.create_agency_invite(
  p_agency_id UUID,
  p_created_by UUID,
  p_role TEXT DEFAULT 'member',
  p_max_uses INTEGER DEFAULT 1,
  p_expires_in_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  invite_id UUID,
  invite_code TEXT,
  invite_url TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  v_invite_code TEXT;
  v_invite_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_agency_slug TEXT;
BEGIN
  -- Check if user is admin of this agency
  IF NOT EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = p_agency_id
      AND user_id = p_created_by
      AND role = 'admin'
      AND invitation_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only agency admins can create invites';
  END IF;

  -- Get agency slug
  SELECT slug INTO v_agency_slug FROM public.agencies WHERE id = p_agency_id AND is_active = true;
  IF v_agency_slug IS NULL THEN
    RAISE EXCEPTION 'Agency not found';
  END IF;

  -- Generate invite code
  v_invite_code := public.generate_invite_code();
  v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;

  -- Create invite
  INSERT INTO public.agency_invites (
    agency_id,
    invite_code,
    role,
    max_uses,
    expires_at,
    created_by
  ) VALUES (
    p_agency_id,
    v_invite_code,
    p_role,
    p_max_uses,
    v_expires_at,
    p_created_by
  )
  RETURNING id INTO v_invite_id;

  RETURN QUERY SELECT
    v_invite_id,
    v_invite_code,
    'axolop.com/invite/' || v_agency_slug || '/' || v_invite_code,
    v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate an invite code and get agency info
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_invite_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  agency_id UUID,
  agency_name TEXT,
  agency_slug TEXT,
  agency_logo_url TEXT,
  invite_role TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_invite RECORD;
  v_agency RECORD;
BEGIN
  -- Get invite
  SELECT * INTO v_invite
  FROM public.agency_invites
  WHERE invite_code = UPPER(p_invite_code)
    AND is_active = true;

  -- Check if invite exists
  IF v_invite IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Invalid invite code'::TEXT;
    RETURN;
  END IF;

  -- Check if expired
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Invite has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if max uses reached
  IF v_invite.max_uses IS NOT NULL AND v_invite.current_uses >= v_invite.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Invite has reached maximum uses'::TEXT;
    RETURN;
  END IF;

  -- Get agency
  SELECT * INTO v_agency
  FROM public.agencies
  WHERE id = v_invite.agency_id
    AND is_active = true;

  IF v_agency IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Agency not found or inactive'::TEXT;
    RETURN;
  END IF;

  -- Return valid invite info
  RETURN QUERY SELECT
    true,
    v_agency.id,
    v_agency.name,
    v_agency.slug,
    v_agency.logo_url,
    v_invite.role,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use invite to join agency
CREATE OR REPLACE FUNCTION public.use_invite_code(
  p_invite_code TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  agency_id UUID,
  agency_name TEXT,
  user_role TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_invite RECORD;
  v_agency RECORD;
  v_existing_member RECORD;
BEGIN
  -- Get and validate invite
  SELECT * INTO v_invite
  FROM public.agency_invites
  WHERE invite_code = UPPER(p_invite_code)
    AND is_active = true;

  -- Check if invite exists
  IF v_invite IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Invalid invite code'::TEXT;
    RETURN;
  END IF;

  -- Check if expired
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Invite has expired'::TEXT;
    RETURN;
  END IF;

  -- Check if max uses reached
  IF v_invite.max_uses IS NOT NULL AND v_invite.current_uses >= v_invite.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Invite has reached maximum uses'::TEXT;
    RETURN;
  END IF;

  -- Get agency
  SELECT * INTO v_agency
  FROM public.agencies
  WHERE id = v_invite.agency_id
    AND is_active = true;

  IF v_agency IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Agency not found or inactive'::TEXT;
    RETURN;
  END IF;

  -- Check if user is already a member
  SELECT * INTO v_existing_member
  FROM public.agency_members
  WHERE agency_id = v_invite.agency_id
    AND user_id = p_user_id;

  IF v_existing_member IS NOT NULL THEN
    IF v_existing_member.invitation_status = 'active' THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'You are already a member of this agency'::TEXT;
      RETURN;
    ELSE
      -- Reactivate membership
      UPDATE public.agency_members
      SET invitation_status = 'active',
          role = v_invite.role,
          joined_at = NOW(),
          updated_at = NOW()
      WHERE id = v_existing_member.id;
    END IF;
  ELSE
    -- Create new membership
    INSERT INTO public.agency_members (
      agency_id,
      user_id,
      role,
      invitation_status,
      invited_by,
      invited_at,
      joined_at
    ) VALUES (
      v_invite.agency_id,
      p_user_id,
      v_invite.role,
      'active',
      v_invite.created_by,
      NOW(),
      NOW()
    );
  END IF;

  -- Increment invite usage
  UPDATE public.agency_invites
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE id = v_invite.id;

  -- Update agency user count
  UPDATE public.agencies
  SET current_users_count = COALESCE(current_users_count, 0) + 1,
      updated_at = NOW()
  WHERE id = v_invite.agency_id;

  RETURN QUERY SELECT
    true,
    v_agency.id,
    v_agency.name,
    v_invite.role,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all invites for an agency (admin only)
CREATE OR REPLACE FUNCTION public.get_agency_invites(p_agency_id UUID, p_user_id UUID)
RETURNS TABLE (
  invite_id UUID,
  invite_code TEXT,
  invite_url TEXT,
  role TEXT,
  max_uses INTEGER,
  current_uses INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_agency_slug TEXT;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = p_agency_id
      AND user_id = p_user_id
      AND role = 'admin'
      AND invitation_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only agency admins can view invites';
  END IF;

  -- Get agency slug
  SELECT slug INTO v_agency_slug FROM public.agencies WHERE id = p_agency_id;

  RETURN QUERY
  SELECT
    ai.id as invite_id,
    ai.invite_code,
    'axolop.com/invite/' || v_agency_slug || '/' || ai.invite_code as invite_url,
    ai.role,
    ai.max_uses,
    ai.current_uses,
    ai.expires_at,
    ai.is_active,
    ai.created_at
  FROM public.agency_invites ai
  WHERE ai.agency_id = p_agency_id
  ORDER BY ai.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deactivate an invite
CREATE OR REPLACE FUNCTION public.deactivate_invite(p_invite_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- Get invite
  SELECT * INTO v_invite FROM public.agency_invites WHERE id = p_invite_id;

  IF v_invite IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.agency_members
    WHERE agency_id = v_invite.agency_id
      AND user_id = p_user_id
      AND role = 'admin'
      AND invitation_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only agency admins can deactivate invites';
  END IF;

  -- Deactivate
  UPDATE public.agency_invites
  SET is_active = false, updated_at = NOW()
  WHERE id = p_invite_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. ADD max_users and current_users_count to agencies if not exists
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'max_users') THEN
    ALTER TABLE public.agencies ADD COLUMN max_users INTEGER DEFAULT 3;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agencies' AND column_name = 'current_users_count') THEN
    ALTER TABLE public.agencies ADD COLUMN current_users_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE public.agency_invites IS 'Stores invite codes for agencies with usage tracking and expiration';
COMMENT ON FUNCTION public.create_agency_invite IS 'Creates a new invite code for an agency (admin only)';
COMMENT ON FUNCTION public.validate_invite_code IS 'Validates an invite code and returns agency info';
COMMENT ON FUNCTION public.use_invite_code IS 'Uses an invite code to join an agency';
