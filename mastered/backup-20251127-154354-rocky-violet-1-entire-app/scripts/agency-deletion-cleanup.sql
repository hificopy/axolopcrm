-- ========================================
-- AGENCY DELETION CLEANUP MIGRATION
-- Enhanced agency deletion with proper cleanup
-- ========================================

-- ========================================
-- 1. AGENCY CLEANUP FUNCTION
-- Handles complete cleanup when agency is deleted
-- ========================================
CREATE OR REPLACE FUNCTION public.cleanup_agency_on_delete(p_agency_id UUID)
RETURNS VOID AS $$
DECLARE
    v_agency_name TEXT;
BEGIN
    -- Get agency name for logging
    SELECT name INTO v_agency_name 
    FROM public.agencies 
    WHERE id = p_agency_id;
    
    RAISE LOG 'Starting cleanup for agency: % (%)', v_agency_name, p_agency_id;
    
    -- 1. Deactivate all agency members (mark as removed)
    UPDATE public.agency_members 
    SET 
        invitation_status = 'removed',
        updated_at = NOW()
    WHERE agency_id = p_agency_id 
      AND invitation_status != 'removed';
    
    RAISE LOG 'Deactivated % members for agency %', 
        (SELECT COUNT(*) FROM public.agency_members WHERE agency_id = p_agency_id), p_agency_id;
    
    -- 2. Deactivate all agency invites
    UPDATE public.agency_invites 
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE agency_id = p_agency_id 
      AND is_active = true;
    
    RAISE LOG 'Deactivated % invites for agency %', 
        (SELECT COUNT(*) FROM public.agency_invites WHERE agency_id = p_agency_id AND is_active = false), p_agency_id;
    
    -- 3. Clear current agency preferences for all users who had this agency selected
    UPDATE public.user_agency_preferences
    SET 
        current_agency_id = NULL,
        updated_at = NOW()
    WHERE current_agency_id = p_agency_id;
    
    RAISE LOG 'Cleared agency preferences for % users', 
        (SELECT COUNT(*) FROM public.user_agency_preferences WHERE current_agency_id IS NULL AND updated_at = NOW()), p_agency_id;
    
    -- 4. Update agency user count to 0
    UPDATE public.agencies
    SET 
        current_users_count = 0,
        updated_at = NOW()
    WHERE id = p_agency_id;
    
    RAISE LOG 'Agency cleanup completed for: % (%)', v_agency_name, p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 2. ENHANCED AGENCY DELETION FUNCTION
-- Combines soft delete with cleanup
-- ========================================
CREATE OR REPLACE FUNCTION public.delete_agency_complete(p_agency_id UUID, p_user_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    agency_name TEXT
) AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_agency_name TEXT;
    v_agency_exists BOOLEAN;
BEGIN
    -- Check if agency exists and is active
    SELECT EXISTS(
        SELECT 1 FROM public.agencies 
        WHERE id = p_agency_id AND is_active = true
    ) INTO v_agency_exists;
    
    IF NOT v_agency_exists THEN
        RETURN QUERY SELECT false, 'Agency not found or already deleted'::TEXT, NULL::TEXT;
        RETURN;
    END IF;
    
    -- Get agency name for response
    SELECT name INTO v_agency_name 
    FROM public.agencies 
    WHERE id = p_agency_id;
    
    -- Check if user is admin
    SELECT public.is_agency_admin(p_user_id, p_agency_id) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RETURN QUERY SELECT false, 'Only agency admins can delete the agency'::TEXT, v_agency_name;
        RETURN;
    END IF;
    
    -- Perform the deletion and cleanup
    -- 1. Soft delete the agency
    UPDATE public.agencies
    SET 
        is_active = false,
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_agency_id;
    
    -- 2. Run comprehensive cleanup
    PERFORM public.cleanup_agency_on_delete(p_agency_id);
    
    -- Return success
    RETURN QUERY SELECT true, 'Agency deleted successfully'::TEXT, v_agency_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. ENHANCED GET USER AGENCIES FUNCTION
-- Ensures deleted agencies never appear
-- ========================================
CREATE OR REPLACE FUNCTION public.get_user_agencies_enhanced(p_user_id UUID)
RETURNS TABLE (
  agency_id UUID,
  agency_name TEXT,
  agency_slug TEXT,
  agency_logo_url TEXT,
  agency_website TEXT,
  agency_description TEXT,
  subscription_tier TEXT,
  user_role TEXT,
  invitation_status TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id as agency_id,
    a.name as agency_name,
    a.slug as agency_slug,
    a.logo_url as agency_logo_url,
    a.website as agency_website,
    a.description as agency_description,
    a.subscription_tier,
    am.role as user_role,
    am.invitation_status,
    am.joined_at
  FROM public.agencies a
  INNER JOIN public.agency_members am ON a.id = am.agency_id
  WHERE am.user_id = p_user_id
    AND am.invitation_status = 'active'
    AND a.is_active = true
    AND a.deleted_at IS NULL
  ORDER BY am.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. VALIDATE AGENCY ACCESS FUNCTION
-- Checks if user has valid access to agency
-- ========================================
CREATE OR REPLACE FUNCTION public.validate_agency_access(p_user_id UUID, p_agency_id UUID)
RETURNS TABLE (
    has_access BOOLEAN,
    is_admin BOOLEAN,
    agency_name TEXT,
    user_role TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_agency_exists BOOLEAN;
    v_membership_exists BOOLEAN;
    v_agency_name TEXT;
    v_user_role TEXT;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if agency exists and is active
    SELECT EXISTS(
        SELECT 1 FROM public.agencies 
        WHERE id = p_agency_id 
          AND is_active = true 
          AND deleted_at IS NULL
    ) INTO v_agency_exists;
    
    IF NOT v_agency_exists THEN
        RETURN QUERY SELECT false, false, NULL::TEXT, NULL::TEXT, 'Agency not found or inactive'::TEXT;
        RETURN;
    END IF;
    
    -- Get agency name
    SELECT name INTO v_agency_name 
    FROM public.agencies 
    WHERE id = p_agency_id;
    
    -- Check user membership
    SELECT EXISTS(
        SELECT 1 FROM public.agency_members 
        WHERE user_id = p_user_id 
          AND agency_id = p_agency_id 
          AND invitation_status = 'active'
    ) INTO v_membership_exists;
    
    IF NOT v_membership_exists THEN
        RETURN QUERY SELECT false, false, v_agency_name, NULL::TEXT, 'User is not a member of this agency'::TEXT;
        RETURN;
    END IF;
    
    -- Get user role and admin status
    SELECT role INTO v_user_role
    FROM public.agency_members 
    WHERE user_id = p_user_id 
      AND agency_id = p_agency_id 
      AND invitation_status = 'active';
    
    v_is_admin := (v_user_role = 'admin');
    
    -- Return success
    RETURN QUERY SELECT true, v_is_admin, v_agency_name, v_user_role, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. AGENCY DELETION AUDIT FUNCTION
-- Logs agency deletion for audit trail
-- ========================================
CREATE OR REPLACE FUNCTION public.log_agency_deletion(p_agency_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_agency_name TEXT;
    v_user_email TEXT;
BEGIN
    -- Get agency and user info
    SELECT a.name INTO v_agency_name
    FROM public.agencies a
    WHERE a.id = p_agency_id;
    
    SELECT u.email INTO v_user_email
    FROM auth.users u
    WHERE u.id = p_user_id;
    
    -- Log the deletion (you can create an audit_log table if needed)
    RAISE LOG 'AGENCY DELETED: % (%) by user % at %', 
        v_agency_name, p_agency_id, v_user_email, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. UPDATE EXISTING FUNCTIONS
-- Ensure they handle deleted agencies properly
-- ========================================

-- Update set_current_agency to handle deleted agencies
CREATE OR REPLACE FUNCTION public.set_current_agency(p_user_id UUID, p_agency_id UUID)
RETURNS void AS $$
BEGIN
  -- If setting to a specific agency, validate it exists and is active
  IF p_agency_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.agencies 
      WHERE id = p_agency_id 
        AND is_active = true 
        AND deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Cannot set current agency: agency not found or inactive';
    END IF;
  END IF;
  
  INSERT INTO public.user_agency_preferences (user_id, current_agency_id)
  VALUES (p_user_id, p_agency_id)
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_agency_id = p_agency_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

-- Index for deleted_at filtering
CREATE INDEX IF NOT EXISTS idx_agencies_deleted_at ON public.agencies(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_active_not_deleted ON public.agencies(is_active, deleted_at) WHERE is_active = true AND deleted_at IS NULL;

-- Index for user preferences cleanup
CREATE INDEX IF NOT EXISTS idx_user_agency_preferences_current_agency ON public.user_agency_preferences(current_agency_id) WHERE current_agency_id IS NOT NULL;

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON FUNCTION public.cleanup_agency_on_delete IS 'Comprehensive cleanup when agency is deleted - deactivates members, invites, and clears preferences';
COMMENT ON FUNCTION public.delete_agency_complete IS 'Complete agency deletion with validation and cleanup';
COMMENT ON FUNCTION public.get_user_agencies_enhanced IS 'Enhanced function that filters out deleted agencies';
COMMENT ON FUNCTION public.validate_agency_access IS 'Validates user access to agency with detailed error messages';
COMMENT ON FUNCTION public.log_agency_deletion IS 'Logs agency deletion for audit purposes';

-- ========================================
-- 9. MIGRATION COMPLETE
-- ========================================

RAISE LOG 'Agency deletion cleanup migration completed successfully';