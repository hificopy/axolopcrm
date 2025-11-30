-- ========================================
-- AGENCY AUDIT SYSTEM
-- Comprehensive activity tracking for agencies
-- ========================================

-- 1. AUDIT LOGS TABLE (Enhanced)
-- ========================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_name TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_id ON public.audit_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_created
ON public.audit_logs(agency_id, created_at DESC);

-- 2. AGENCY ANALYTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.agency_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Member metrics
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    new_members INTEGER DEFAULT 0,

    -- Activity metrics
    total_logins INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,

    -- Entity metrics
    leads_created INTEGER DEFAULT 0,
    contacts_created INTEGER DEFAULT 0,
    opportunities_created INTEGER DEFAULT 0,
    deals_won INTEGER DEFAULT 0,
    deals_lost INTEGER DEFAULT 0,

    -- Communication metrics
    emails_sent INTEGER DEFAULT 0,
    calls_made INTEGER DEFAULT 0,
    meetings_scheduled INTEGER DEFAULT 0,

    -- Revenue metrics
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    pipeline_value DECIMAL(12,2) DEFAULT 0,

    -- Engagement score (0-100)
    engagement_score INTEGER DEFAULT 0,
    health_score INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(agency_id, date)
);

CREATE INDEX IF NOT EXISTS idx_agency_analytics_agency_date
ON public.agency_analytics(agency_id, date DESC);

-- 3. AGENCY HEALTH METRICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.agency_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE UNIQUE,

    -- Overall scores (0-100)
    overall_health INTEGER DEFAULT 50,
    activity_score INTEGER DEFAULT 50,
    engagement_score INTEGER DEFAULT 50,
    growth_score INTEGER DEFAULT 50,
    retention_score INTEGER DEFAULT 50,

    -- Trending (up, down, stable)
    activity_trend VARCHAR(10) DEFAULT 'stable',
    engagement_trend VARCHAR(10) DEFAULT 'stable',
    growth_trend VARCHAR(10) DEFAULT 'stable',

    -- Alerts
    alerts JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',

    -- Last calculation
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculation_period_start DATE,
    calculation_period_end DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVITATION TEMPLATES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.invitation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '["{{invitee_name}}", "{{agency_name}}", "{{inviter_name}}", "{{invite_link}}", "{{role}}"]',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitation_templates_agency
ON public.invitation_templates(agency_id);

-- Insert default template
INSERT INTO public.invitation_templates (
    id,
    agency_id,
    name,
    subject,
    body_html,
    body_text,
    is_default
) VALUES (
    gen_random_uuid(),
    NULL, -- Global default template
    'Default Invitation',
    'You''ve been invited to join {{agency_name}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">You''re Invited!</h2>
        <p>Hi {{invitee_name}},</p>
        <p>{{inviter_name}} has invited you to join <strong>{{agency_name}}</strong> as a <strong>{{role}}</strong>.</p>
        <p style="margin: 30px 0;">
            <a href="{{invite_link}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
            </a>
        </p>
        <p style="color: #666; font-size: 14px;">This invitation link will expire in 7 days.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Powered by Axolop CRM</p>
    </div>',
    'Hi {{invitee_name}},

{{inviter_name}} has invited you to join {{agency_name}} as a {{role}}.

Click here to accept: {{invite_link}}

This invitation link will expire in 7 days.

Powered by Axolop CRM',
    true
) ON CONFLICT DO NOTHING;

-- 5. AUDIT LOG FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION public.log_activity(
    p_agency_id UUID,
    p_user_id UUID,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50),
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_severity VARCHAR(20) DEFAULT 'info',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        agency_id,
        user_id,
        action,
        entity_type,
        entity_id,
        entity_name,
        details,
        severity,
        ip_address,
        user_agent
    ) VALUES (
        p_agency_id,
        p_user_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_details,
        p_severity,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GET ACTIVITY LOGS FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION public.get_agency_activity_logs(
    p_agency_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_action_filter VARCHAR(100) DEFAULT NULL,
    p_entity_type_filter VARCHAR(50) DEFAULT NULL,
    p_user_id_filter UUID DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    entity_name TEXT,
    details JSONB,
    severity VARCHAR(20),
    ip_address INET
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.created_at,
        al.user_id,
        u.email AS user_email,
        COALESCE(up.full_name, u.email) AS user_name,
        al.action,
        al.entity_type,
        al.entity_id,
        al.entity_name,
        al.details,
        al.severity,
        al.ip_address
    FROM public.audit_logs al
    LEFT JOIN auth.users u ON al.user_id = u.id
    LEFT JOIN public.user_profiles up ON al.user_id = up.id
    WHERE al.agency_id = p_agency_id
        AND (p_action_filter IS NULL OR al.action = p_action_filter)
        AND (p_entity_type_filter IS NULL OR al.entity_type = p_entity_type_filter)
        AND (p_user_id_filter IS NULL OR al.user_id = p_user_id_filter)
        AND (p_start_date IS NULL OR al.created_at >= p_start_date)
        AND (p_end_date IS NULL OR al.created_at <= p_end_date)
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CALCULATE AGENCY HEALTH FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION public.calculate_agency_health(p_agency_id UUID)
RETURNS TABLE (
    overall_health INTEGER,
    activity_score INTEGER,
    engagement_score INTEGER,
    growth_score INTEGER,
    retention_score INTEGER,
    activity_trend VARCHAR(10),
    engagement_trend VARCHAR(10),
    growth_trend VARCHAR(10),
    alerts JSONB,
    recommendations JSONB
) AS $$
DECLARE
    v_member_count INTEGER;
    v_active_members INTEGER;
    v_actions_last_7d INTEGER;
    v_actions_prev_7d INTEGER;
    v_new_members_30d INTEGER;
    v_churned_members_30d INTEGER;
    v_activity_score INTEGER;
    v_engagement_score INTEGER;
    v_growth_score INTEGER;
    v_retention_score INTEGER;
    v_overall_health INTEGER;
    v_activity_trend VARCHAR(10);
    v_engagement_trend VARCHAR(10);
    v_growth_trend VARCHAR(10);
    v_alerts JSONB;
    v_recommendations JSONB;
BEGIN
    -- Get member counts
    SELECT
        COUNT(*) FILTER (WHERE invitation_status = 'active'),
        COUNT(*) FILTER (WHERE invitation_status = 'active' AND updated_at > NOW() - INTERVAL '7 days')
    INTO v_member_count, v_active_members
    FROM public.agency_members
    WHERE agency_id = p_agency_id;

    -- Get activity counts
    SELECT
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '14 days' AND created_at <= NOW() - INTERVAL '7 days')
    INTO v_actions_last_7d, v_actions_prev_7d
    FROM public.audit_logs
    WHERE agency_id = p_agency_id;

    -- Calculate scores (simplified algorithm)
    v_activity_score := LEAST(100, GREATEST(0, (v_actions_last_7d / GREATEST(v_member_count, 1)) * 10));
    v_engagement_score := CASE
        WHEN v_member_count = 0 THEN 0
        ELSE LEAST(100, (v_active_members * 100 / v_member_count))
    END;
    v_growth_score := 50; -- Baseline
    v_retention_score := CASE
        WHEN v_member_count = 0 THEN 0
        ELSE LEAST(100, (v_member_count * 20))
    END;

    -- Calculate trends
    v_activity_trend := CASE
        WHEN v_actions_last_7d > v_actions_prev_7d * 1.1 THEN 'up'
        WHEN v_actions_last_7d < v_actions_prev_7d * 0.9 THEN 'down'
        ELSE 'stable'
    END;
    v_engagement_trend := 'stable';
    v_growth_trend := 'stable';

    -- Calculate overall health
    v_overall_health := (v_activity_score + v_engagement_score + v_growth_score + v_retention_score) / 4;

    -- Generate alerts
    v_alerts := '[]'::JSONB;
    IF v_activity_score < 30 THEN
        v_alerts := v_alerts || '["Low activity detected - consider engaging your team"]'::JSONB;
    END IF;
    IF v_engagement_score < 50 THEN
        v_alerts := v_alerts || '["Member engagement is below average"]'::JSONB;
    END IF;

    -- Generate recommendations
    v_recommendations := '[]'::JSONB;
    IF v_member_count < 3 THEN
        v_recommendations := v_recommendations || '["Invite more team members to improve collaboration"]'::JSONB;
    END IF;

    -- Return results
    RETURN QUERY SELECT
        v_overall_health,
        v_activity_score,
        v_engagement_score,
        v_growth_score,
        v_retention_score,
        v_activity_trend,
        v_engagement_trend,
        v_growth_trend,
        v_alerts,
        v_recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. UPDATE AGENCY ANALYTICS FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION public.update_agency_analytics(p_agency_id UUID)
RETURNS VOID AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
    INSERT INTO public.agency_analytics (
        agency_id,
        date,
        total_members,
        active_members,
        total_actions
    )
    SELECT
        p_agency_id,
        v_today,
        (SELECT COUNT(*) FROM public.agency_members WHERE agency_id = p_agency_id AND invitation_status = 'active'),
        (SELECT COUNT(*) FROM public.agency_members WHERE agency_id = p_agency_id AND invitation_status = 'active' AND updated_at > NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*) FROM public.audit_logs WHERE agency_id = p_agency_id AND created_at::DATE = v_today)
    ON CONFLICT (agency_id, date)
    DO UPDATE SET
        total_members = EXCLUDED.total_members,
        active_members = EXCLUDED.active_members,
        total_actions = EXCLUDED.total_actions,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS POLICIES
-- ========================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;

-- Audit logs - members can view their agency's logs
CREATE POLICY "Agency members can view audit logs"
ON public.audit_logs FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_members
        WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
);

-- Agency analytics - members can view their agency's analytics
CREATE POLICY "Agency members can view analytics"
ON public.agency_analytics FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_members
        WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
);

-- Agency health metrics - members can view their agency's health
CREATE POLICY "Agency members can view health metrics"
ON public.agency_health_metrics FOR SELECT
USING (
    agency_id IN (
        SELECT agency_id FROM public.agency_members
        WHERE user_id = auth.uid() AND invitation_status = 'active'
    )
);

-- Invitation templates - agency admins can manage templates
CREATE POLICY "Agency admins can manage invitation templates"
ON public.invitation_templates FOR ALL
USING (
    agency_id IS NULL OR
    agency_id IN (
        SELECT agency_id FROM public.agency_members
        WHERE user_id = auth.uid()
        AND invitation_status = 'active'
        AND role = 'admin'
    )
);

-- 10. REALTIME SUBSCRIPTIONS
-- ========================================
-- Enable realtime for agency members table
ALTER PUBLICATION supabase_realtime ADD TABLE public.agency_members;

COMMENT ON TABLE public.audit_logs IS 'Comprehensive activity audit logging for agency actions';
COMMENT ON TABLE public.agency_analytics IS 'Daily aggregated analytics for each agency';
COMMENT ON TABLE public.agency_health_metrics IS 'Calculated health scores and recommendations';
COMMENT ON TABLE public.invitation_templates IS 'Custom email templates for member invitations';
