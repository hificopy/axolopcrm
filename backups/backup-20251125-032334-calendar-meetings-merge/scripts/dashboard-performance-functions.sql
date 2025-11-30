-- Dashboard Performance Optimization Functions
-- These functions replace multiple separate queries with optimized aggregated queries

-- Function to get realtime dashboard data (changes frequently)
CREATE OR REPLACE FUNCTION get_dashboard_realtime_data(
    p_user_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'recentLeads', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', l.id,
                    'name', l.name,
                    'email', l.email,
                    'status', l.status,
                    'value', l.value,
                    'created_at', l.created_at,
                    'company', l.company
                )
            ), '[]'::json)
            FROM leads l
            WHERE l.user_id = p_user_id
            AND l.created_at >= p_start_date
            AND l.created_at <= p_end_date
            ORDER BY l.created_at DESC
            LIMIT 5
        ),
        'recentActivities', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', a.id,
                    'type', a.activity_type,
                    'description', a.description,
                    'created_at', a.created_at,
                    'lead_id', a.lead_id,
                    'contact_id', a.contact_id
                )
            ), '[]'::json)
            FROM activities a
            WHERE a.user_id = p_user_id
            AND a.created_at >= p_start_date
            AND a.created_at <= p_end_date
            ORDER BY a.created_at DESC
            LIMIT 10
        ),
        'activeDeals', (
            SELECT COUNT(*)
            FROM deals d
            WHERE d.user_id = p_user_id
            AND d.status IN ('ACTIVE', 'PENDING')
        ),
        'todayStats', (
            SELECT json_build_object(
                'newLeads', (
                    SELECT COUNT(*)
                    FROM leads l
                    WHERE l.user_id = p_user_id
                    AND DATE(l.created_at) = CURRENT_DATE
                ),
                'newContacts', (
                    SELECT COUNT(*)
                    FROM contacts c
                    WHERE c.user_id = p_user_id
                    AND DATE(c.created_at) = CURRENT_DATE
                ),
                'activities', (
                    SELECT COUNT(*)
                    FROM activities a
                    WHERE a.user_id = p_user_id
                    AND DATE(a.created_at) = CURRENT_DATE
                )
            )
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get hourly dashboard data (moderately frequent changes)
CREATE OR REPLACE FUNCTION get_dashboard_hourly_data(
    p_user_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'sales', (
            SELECT json_build_object(
                'totalRevenue', COALESCE(SUM(d.amount), 0),
                'activeDeals', (
                    SELECT COUNT(*)
                    FROM deals d2
                    WHERE d2.user_id = p_user_id
                    AND d2.status IN ('ACTIVE', 'PENDING')
                ),
                'newLeads', (
                    SELECT COUNT(*)
                    FROM leads l
                    WHERE l.user_id = p_user_id
                    AND l.created_at >= p_start_date
                    AND l.created_at <= p_end_date
                ),
                'conversionRate', CASE 
                    WHEN (SELECT COUNT(*) FROM leads l WHERE l.user_id = p_user_id AND l.created_at >= p_start_date AND l.created_at <= p_end_date) > 0
                    THEN ROUND(
                        (SELECT COUNT(*) FROM deals d3 WHERE d3.user_id = p_user_id AND d3.status = 'WON' AND d3.created_at >= p_start_date AND d3.created_at <= p_end_date)::NUMERIC /
                        (SELECT COUNT(*) FROM leads l WHERE l.user_id = p_user_id AND l.created_at >= p_start_date AND l.created_at <= p_end_date)::NUMERIC * 100, 2
                    )
                    ELSE 0
                END,
                'avgDealSize', CASE 
                    WHEN (SELECT COUNT(*) FROM deals d4 WHERE d4.user_id = p_user_id AND d4.status = 'WON' AND d4.created_at >= p_start_date AND d4.created_at <= p_end_date) > 0
                    THEN ROUND(AVG(d4.amount), 2)
                    ELSE 0
                END,
                'winRate', CASE 
                    WHEN (SELECT COUNT(*) FROM deals d5 WHERE d5.user_id = p_user_id AND d5.created_at >= p_start_date AND d5.created_at <= p_end_date) > 0
                    THEN ROUND(
                        (SELECT COUNT(*) FROM deals d6 WHERE d6.user_id = p_user_id AND d6.status = 'WON' AND d6.created_at >= p_start_date AND d6.created_at <= p_end_date)::NUMERIC /
                        (SELECT COUNT(*) FROM deals d7 WHERE d7.user_id = p_user_id AND d7.created_at >= p_start_date AND d7.created_at <= p_end_date)::NUMERIC * 100, 2
                    )
                    ELSE 0
                END,
                'pipelineValue', COALESCE((
                    SELECT SUM(o.value)
                    FROM opportunities o
                    WHERE o.user_id = p_user_id
                    AND o.status NOT IN ('WON', 'LOST')
                ), 0)
            )
        ),
        'marketing', (
            SELECT json_build_object(
                'activeCampaigns', (
                    SELECT COUNT(*)
                    FROM email_campaigns ec
                    WHERE ec.user_id = p_user_id
                    AND ec.status = 'active'
                ),
                'emailOpens', COALESCE((
                    SELECT SUM(ec.opens)
                    FROM email_campaigns ec
                    WHERE ec.user_id = p_user_id
                    AND ec.created_at >= p_start_date
                    AND ec.created_at <= p_end_date
                ), 0),
                'clickRate', CASE 
                    WHEN (SELECT SUM(ec.sends) FROM email_campaigns ec WHERE ec.user_id = p_user_id AND ec.created_at >= p_start_date AND ec.created_at <= p_end_date) > 0
                    THEN ROUND(
                        (SELECT SUM(ec.clicks) FROM email_campaigns ec WHERE ec.user_id = p_user_id AND ec.created_at >= p_start_date AND ec.created_at <= p_end_date)::NUMERIC /
                        (SELECT SUM(ec.sends) FROM email_campaigns ec WHERE ec.user_id = p_user_id AND ec.created_at >= p_start_date AND ec.created_at <= p_end_date)::NUMERIC * 100, 2
                    )
                    ELSE 0
                END,
                'totalSubscribers', (
                    SELECT COUNT(*)
                    FROM email_subscribers es
                    WHERE es.user_id = p_user_id
                    AND es.status = 'active'
                ),
                'engagementRate', CASE 
                    WHEN (SELECT COUNT(*) FROM email_subscribers es WHERE es.user_id = p_user_id AND es.status = 'active') > 0
                    THEN ROUND(
                        (SELECT COUNT(*) FROM email_campaign_events ece JOIN email_campaigns ec ON ece.campaign_id = ec.id WHERE ec.user_id = p_user_id AND ece.event_type = 'open' AND ece.created_at >= p_start_date AND ece.created_at <= p_end_date)::NUMERIC /
                        (SELECT COUNT(*) FROM email_subscribers es WHERE es.user_id = p_user_id AND es.status = 'active')::NUMERIC * 100, 2
                    )
                    ELSE 0
                END
            )
        ),
        'opportunities', (
            SELECT json_build_object(
                'total', COUNT(*),
                'totalValue', COALESCE(SUM(o.value), 0),
                'won', COUNT(*) FILTER (WHERE o.status = 'WON'),
                'lost', COUNT(*) FILTER (WHERE o.status = 'LOST'),
                'winRate', CASE 
                    WHEN COUNT(*) > 0
                    THEN ROUND((COUNT(*) FILTER (WHERE o.status = 'WON'))::NUMERIC / COUNT(*) * 100, 2)
                    ELSE 0
                END
            )
            FROM opportunities o
            WHERE o.user_id = p_user_id
            AND o.created_at >= p_start_date
            AND o.created_at <= p_end_date
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily dashboard data (infrequent changes)
CREATE OR REPLACE FUNCTION get_dashboard_daily_data(
    p_user_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'overview', (
            SELECT json_build_object(
                'forms', json_build_object(
                    'total', (SELECT COUNT(*) FROM forms f WHERE f.user_id = p_user_id),
                    'submissions', (SELECT COUNT(*) FROM form_submissions fs WHERE fs.user_id = p_user_id)
                ),
                'contacts', json_build_object(
                    'total', (SELECT COUNT(*) FROM contacts c WHERE c.user_id = p_user_id)
                ),
                'leads', json_build_object(
                    'total', (SELECT COUNT(*) FROM leads l WHERE l.user_id = p_user_id)
                ),
                'deals', json_build_object(
                    'total', (SELECT COUNT(*) FROM deals d WHERE d.user_id = p_user_id)
                )
            )
        ),
        'forms', (
            SELECT json_build_object(
                'total', COUNT(*),
                'submissions', (
                    SELECT COUNT(*)
                    FROM form_submissions fs
                    WHERE fs.form_id IN (SELECT id FROM forms f WHERE f.user_id = p_user_id)
                ),
                'conversionRate', CASE 
                    WHEN COUNT(*) > 0
                    THEN ROUND(
                        (SELECT COUNT(*) FROM form_submissions fs WHERE fs.form_id IN (SELECT id FROM forms f WHERE f.user_id = p_user_id))::NUMERIC /
                        COUNT(*) * 100, 2
                    )
                    ELSE 0
                END
            )
            FROM forms f
            WHERE f.user_id = p_user_id
        ),
        'profitLoss', (
            SELECT json_build_object(
                'revenue', COALESCE((
                    SELECT SUM(d.amount)
                    FROM deals d
                    WHERE d.user_id = p_user_id
                    AND d.status = 'WON'
                    AND d.created_at >= p_start_date
                    AND d.created_at <= p_end_date
                ), 0),
                'expenses', 0, -- TODO: Implement expenses tracking
                'netProfit', COALESCE((
                    SELECT SUM(d.amount)
                    FROM deals d
                    WHERE d.user_id = p_user_id
                    AND d.status = 'WON'
                    AND d.created_at >= p_start_date
                    AND d.created_at <= p_end_date
                ), 0)
            )
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create composite indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_leads_user_date ON leads(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_deals_user_status_date ON deals(user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_status_date ON opportunities(user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forms_user_date ON forms(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_date ON form_submissions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_status_date ON email_campaigns(user_id, status, created_at);

-- Create materialized view for dashboard summary (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
SELECT 
    user_id,
    -- Counts
    (SELECT COUNT(*) FROM leads l WHERE l.user_id = users.id) as total_leads,
    (SELECT COUNT(*) FROM contacts c WHERE c.user_id = users.id) as total_contacts,
    (SELECT COUNT(*) FROM deals d WHERE d.user_id = users.id) as total_deals,
    (SELECT COUNT(*) FROM forms f WHERE f.user_id = users.id) as total_forms,
    (SELECT COUNT(*) FROM opportunities o WHERE o.user_id = users.id) as total_opportunities,
    -- Financials
    COALESCE((SELECT SUM(d.amount) FROM deals d WHERE d.user_id = users.id AND d.status = 'WON'), 0) as total_revenue,
    COALESCE((SELECT AVG(d.amount) FROM deals d WHERE d.user_id = users.id AND d.status = 'WON'), 0) as avg_deal_size,
    -- Recent activity counts
    (SELECT COUNT(*) FROM leads l WHERE l.user_id = users.id AND l.created_at >= NOW() - INTERVAL '30 days') as leads_last_30_days,
    (SELECT COUNT(*) FROM deals d WHERE d.user_id = users.id AND d.created_at >= NOW() - INTERVAL '30 days') as deals_last_30_days,
    -- Timestamps
    NOW() as last_updated
FROM users
GROUP BY user_id, NOW();

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_summary_user_id ON dashboard_summary(user_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_summary;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_dashboard_realtime_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_hourly_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_daily_data TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_dashboard_summary TO authenticated;

GRANT SELECT ON dashboard_summary TO authenticated;