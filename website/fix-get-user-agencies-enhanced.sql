-- Fix get_user_agencies_enhanced function
-- This fixes the "structure of query does not match function result type" error

DROP FUNCTION IF EXISTS public.get_user_agencies_enhanced(UUID);

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
    SELECT DISTINCT
        a.id as agency_id,
        a.name as agency_name,
        a.slug as agency_slug,
        a.logo_url as agency_logo_url,
        a.website as agency_website,
        a.description as agency_description,
        COALESCE(a.subscription_tier, 'free') as subscription_tier,
        CASE 
            WHEN a.owner_id = p_user_id THEN 'owner'
            WHEN am.user_id IS NOT NULL THEN 'member'
            ELSE 'invited'
        END as user_role,
        CASE 
            WHEN ai.status = 'accepted' THEN 'accepted'
            WHEN ai.status = 'pending' THEN 'pending'
            WHEN ai.status = 'declined' THEN 'declined'
            ELSE NULL
        END as invitation_status,
        COALESCE(am.created_at, ai.created_at) as joined_at
    FROM public.agencies a
    LEFT JOIN public.agency_members am ON a.id = am.agency_id AND am.user_id = p_user_id AND am.deleted_at IS NULL
    LEFT JOIN public.agency_invitations ai ON a.id = ai.agency_id AND ai.user_id = p_user_id AND ai.status IN ('pending', 'accepted')
    WHERE (
        a.owner_id = p_user_id 
        OR am.user_id IS NOT NULL 
        OR ai.user_id IS NOT NULL
    )
    AND a.is_active = true
    AND a.deleted_at IS NULL
    ORDER BY joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_agencies_enhanced(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_agencies_enhanced(UUID) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.get_user_agencies_enhanced IS 'Enhanced function that filters out deleted agencies and returns proper user roles';