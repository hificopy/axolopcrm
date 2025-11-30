-- ========================================
-- AGENCY DELETION FUNCTIONS
-- Deploy these functions in Supabase SQL Editor
-- ========================================

-- 1. Enhanced Agency Deletion Function
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
    END IF;
    
    -- Get agency name for response
    SELECT name INTO v_agency_name 
    FROM public.agencies 
    WHERE id = p_agency_id;
    
    -- Check if user is admin
    SELECT EXISTS(
        SELECT 1 FROM public.agency_members am
        WHERE am.user_id = p_user_id 
          AND am.agency_id = p_agency_id 
          AND am.role = 'admin' 
          AND am.invitation_status = 'active'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RETURN QUERY SELECT false, 'Only agency admins can delete the agency'::TEXT, v_agency_name;
    END IF;
    
    -- Perform the deletion and cleanup
    -- 1. Soft delete the agency
    UPDATE public.agencies
    SET 
        is_active = false,
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_agency_id;
    
    -- 2. Deactivate all agency members
    UPDATE public.agency_members 
    SET 
        invitation_status = 'removed',
        updated_at = NOW()
    WHERE agency_id = p_agency_id 
      AND invitation_status != 'removed';
    
    -- 3. Deactivate all agency invites
    UPDATE public.agency_invites 
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE agency_id = p_agency_id 
      AND is_active = true;
    
    -- 4. Clear current agency preferences for all users who had this agency selected
    UPDATE public.user_agency_preferences
    SET 
        current_agency_id = NULL,
        updated_at = NOW()
    WHERE current_agency_id = p_agency_id;
    
    -- 5. Update agency user count to 0
    UPDATE public.agencies
    SET 
        current_users_count = 0,
        updated_at = NOW()
    WHERE id = p_agency_id;
    
    -- Return success
    RETURN QUERY SELECT true, 'Agency deleted successfully'::TEXT, v_agency_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enhanced Get User Agencies Function
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
    JOIN public.agency_members am ON a.id = am.agency_id
    WHERE am.user_id = p_user_id 
      AND a.is_active = true
    ORDER BY am.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Agency Access Validation Function
CREATE OR REPLACE FUNCTION public.validate_agency_access(p_user_id UUID, p_agency_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_member BOOLEAN;
BEGIN
    -- Check if user is an active member of the agency
    SELECT EXISTS(
        SELECT 1 FROM public.agency_members am
        WHERE am.user_id = p_user_id 
          AND am.agency_id = p_agency_id 
          AND am.invitation_status = 'active'
    ) INTO v_is_member;
    
    RETURN v_is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Agency Cleanup Function (triggered by deletion)
CREATE OR REPLACE FUNCTION public.cleanup_agency_on_delete(p_agency_id UUID)
RETURNS VOID AS $$
DECLARE
    v_agency_name TEXT;
BEGIN
    -- Get agency name for logging
    SELECT name INTO v_agency_name 
    FROM public.agencies 
    WHERE id = p_agency_id;
    
    -- Log the cleanup (optional, for debugging)
    RAISE LOG 'Agency cleanup completed for: % (%)', v_agency_name, p_agency_id;
    
    -- The actual cleanup is now handled in the main deletion function
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Set Current Agency Function
CREATE OR REPLACE FUNCTION public.set_current_agency(p_user_id UUID, p_agency_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear previous agency selection
    UPDATE public.user_agency_preferences
    SET 
        current_agency_id = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Set new agency selection
    UPDATE public.user_agency_preferences
    SET 
        current_agency_id = p_agency_id,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Log Agency Deletion Function
CREATE OR REPLACE FUNCTION public.log_agency_deletion(p_agency_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_agency_name TEXT;
BEGIN
    -- Get agency name for logging
    SELECT name INTO v_agency_name 
    FROM public.agencies 
    WHERE id = p_agency_id;
    
    -- Log the deletion
    INSERT INTO public.audit_logs (
        id,
        created_at,
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address
    ) VALUES (
        gen_random_uuid(),
        NOW(),
        p_user_id,
        'DELETE_AGENCY',
        'agency',
        p_agency_id,
        JSON_BUILD_OBJECT('agency_name', v_agency_name),
        '127.0.0.1'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Index for agency queries
CREATE INDEX IF NOT EXISTS idx_agencies_active_not_deleted 
ON public.agencies(is_active, deleted_at);

-- Index for agency member queries
CREATE INDEX IF NOT EXISTS idx_agency_members_user_agency 
ON public.agency_members(user_id, agency_id);

-- Index for user agency preferences
CREATE INDEX IF NOT EXISTS idx_user_agency_preferences_current_agency 
ON public.user_agency_preferences(user_id, current_agency_id);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
ON public.audit_logs(user_id, created_at);