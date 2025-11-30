-- ========================================
-- DATABASE PERFORMANCE OPTIMIZATION
-- ========================================
-- Axolop CRM Performance Enhancement Script
-- Version: 1.0
-- Created: 2025-11-26

-- ========================================
-- 1. PERFORMANCE INDEXES
-- ========================================

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id_created_at ON contacts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id_email ON contacts(user_id, email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id_status ON contacts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id_tags ON contacts(user_id) WHERE tags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_search_vector ON contacts USING gin(search_vector);

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id_created_at ON leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_id_status ON leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_user_id_source ON leads(user_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_user_id_score ON leads(user_id, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;

-- Opportunities table indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id_stage ON opportunities(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id_value ON opportunities(user_id, value DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id_close_date ON opportunities(user_id, expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id_created_at ON activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id_type ON activities(user_id, type);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_date_range ON activities(user_id, created_at, type);

-- Email campaigns indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id_status ON email_campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id_created_at ON email_campaigns(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaign_analytics_campaign_id ON email_campaign_analytics(campaign_id);

-- Forms table indexes
CREATE INDEX IF NOT EXISTS idx_forms_user_id_status ON forms(user_id, status);
CREATE INDEX IF NOT EXISTS idx_forms_user_id_created_at ON forms(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id_created_at ON form_submissions(form_id, created_at DESC);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON tasks(contact_id);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id_start_time ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id_end_time ON calendar_events(user_id, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_user_id_status ON workflows(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id_created_at ON workflow_executions(workflow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Agency-related indexes
CREATE INDEX IF NOT EXISTS idx_agencies_owner_id ON agencies(owner_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_agency_id ON agency_members(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_members_user_id ON agency_members(user_id);

-- ========================================
-- 2. MATERIALIZED VIEWS FOR DASHBOARD
-- ========================================

-- Dashboard stats materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT c.id) as total_contacts,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT o.id) as total_opportunities,
    COALESCE(SUM(o.value), 0) as total_pipeline_value,
    COUNT(DISTINCT CASE WHEN o.stage = 'won' THEN o.id END) as won_deals,
    COUNT(DISTINCT CASE WHEN o.stage = 'lost' THEN o.id END) as lost_deals,
    COUNT(DISTINCT CASE WHEN a.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN a.id END) as activities_30_days,
    COUNT(DISTINCT CASE WHEN t.due_date >= CURRENT_DATE AND t.status != 'completed' THEN t.id END) as pending_tasks
FROM users u
LEFT JOIN contacts c ON c.user_id = u.id
LEFT JOIN leads l ON l.user_id = u.id
LEFT JOIN opportunities o ON o.user_id = u.id
LEFT JOIN activities a ON a.user_id = u.id
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id;

-- Create unique index for refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_user_id ON dashboard_stats(user_id);

-- Lead conversion funnel materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS lead_conversion_funnel AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'qualified' THEN l.id END) as qualified_leads,
    COUNT(DISTINCT CASE WHEN l.contact_id IS NOT NULL THEN l.id END) as converted_to_contacts,
    COUNT(DISTINCT o.id) as total_opportunities,
    COUNT(DISTINCT CASE WHEN o.stage = 'proposal' THEN o.id END) as proposals_sent,
    COUNT(DISTINCT CASE WHEN o.stage = 'negotiation' THEN o.id END) -> in_negotiation,
    COUNT(DISTINCT CASE WHEN o.stage = 'won' THEN o.id END) as won_deals,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT l.id) > 0 THEN 
                (COUNT(DISTINCT CASE WHEN o.stage = 'won' THEN o.id END)::decimal / COUNT(DISTINCT l.id)) * 100 
            ELSE 0 
        END, 2
    ) as conversion_rate
FROM users u
LEFT JOIN leads l ON l.user_id = u.id
LEFT JOIN opportunities o ON o.user_id = u.id AND o.contact_id = l.contact_id
GROUP BY u.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_conversion_funnel_user_id ON lead_conversion_funnel(user_id);

-- Email campaign performance materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS email_campaign_performance AS
SELECT 
    ec.id as campaign_id,
    ec.user_id,
    ec.name,
    ec.status,
    COUNT(DISTINCT eca.id) as total_sent,
    COUNT(DISTINCT CASE WHEN eca.opened_at IS NOT NULL THEN eca.id END) as total_opens,
    COUNT(DISTINCT CASE WHEN eca.clicked_at IS NOT NULL THEN eca.id END) as total_clicks,
    COUNT(DISTINCT CASE WHEN eca.bounced THEN eca.id END) as total_bounces,
    COUNT(DISTINCT CASE WHEN eca.unsubscribed THEN eca.id END) as total_unsubscribes,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT eca.id) > 0 THEN 
                (COUNT(DISTINCT CASE WHEN eca.opened_at IS NOT NULL THEN eca.id END)::decimal / COUNT(DISTINCT eca.id)) * 100 
            ELSE 0 
        END, 2
    ) as open_rate,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT eca.id) > 0 THEN 
                (COUNT(DISTINCT CASE WHEN eca.clicked_at IS NOT NULL THEN eca.id END)::decimal / COUNT(DISTINCT eca.id)) * 100 
            ELSE 0 
        END, 2
    ) as click_rate
FROM email_campaigns ec
LEFT JOIN email_campaign_analytics eca ON eca.campaign_id = ec.id
GROUP BY ec.id, ec.user_id, ec.name, ec.status;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_campaign_performance_campaign_id ON email_campaign_performance(campaign_id);

-- ========================================
-- 3. PARTITIONING FOR LARGE TABLES
-- ========================================

-- Partition activities table by month (for better performance on large datasets)
-- Note: This would require recreating the table, so it's commented out for safety
/*
CREATE TABLE activities_partitioned (
    LIKE activities INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE activities_2025_01 PARTITION OF activities_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE activities_2025_02 PARTITION OF activities_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Add more partitions as needed
*/

-- ========================================
-- 4. PERFORMANCE FUNCTIONS
-- ========================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_dashboard_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY lead_conversion_funnel;
    REFRESH MATERIALIZED VIEW CONCURRENTLY email_campaign_performance;
END;
$$ LANGUAGE plpgsql;

-- Function to get user dashboard data efficiently
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'stats', (
            SELECT row_to_json(dashboard_stats) 
            FROM dashboard_stats 
            WHERE user_id = p_user_id
        ),
        'funnel', (
            SELECT row_to_json(lead_conversion_funnel) 
            FROM lead_conversion_funnel 
            WHERE user_id = p_user_id
        ),
        'recent_activities', (
            SELECT json_agg(
                json_build_object(
                    'id', a.id,
                    'type', a.type,
                    'title', a.title,
                    'created_at', a.created_at,
                    'contact_name', c.first_name || ' ' || c.last_name
                )
            )
            FROM activities a
            LEFT JOIN contacts c ON c.id = a.contact_id
            WHERE a.user_id = p_user_id
            ORDER BY a.created_at DESC
            LIMIT 10
        ),
        'upcoming_tasks', (
            SELECT json_agg(
                json_build_object(
                    'id', t.id,
                    'title', t.title,
                    'due_date', t.due_date,
                    'priority', t.priority,
                    'contact_name', c.first_name || ' ' || c.last_name
                )
            )
            FROM tasks t
            LEFT JOIN contacts c ON c.id = t.contact_id
            WHERE t.user_id = p_user_id 
                AND t.due_date >= CURRENT_DATE 
                AND t.status != 'completed'
            ORDER BY t.due_date ASC
            LIMIT 10
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. DATABASE CONFIGURATION OPTIMIZATIONS
-- ========================================

-- These are configuration suggestions that should be applied to PostgreSQL
-- Note: These require superuser privileges

-- Suggested PostgreSQL performance settings:
-- shared_buffers = 256MB (25% of RAM on 1GB system)
-- effective_cache_size = 1GB (75% of RAM)
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.9
-- wal_buffers = 16MB
-- default_statistics_target = 100
-- random_page_cost = 1.1 (for SSD)
-- effective_io_concurrency = 200 (for SSD)

-- ========================================
-- 6. CLEANUP AND MAINTENANCE
-- ========================================

-- Function to clean up old data (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old activity logs (older than 2 years)
    DELETE FROM activities WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    
    -- Delete old email analytics (older than 1 year)
    DELETE FROM email_campaign_analytics WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Delete old form submissions (older than 2 years)
    DELETE FROM form_submissions WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    
    -- Delete old workflow executions (older than 6 months)
    DELETE FROM workflow_executions WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
    
    -- Log the cleanup
    INSERT INTO system_logs (level, message, created_at) 
    VALUES ('INFO', 'Old data cleanup completed', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. MONITORING QUERIES
-- ========================================

-- Query to find slow queries (requires pg_stat_statements extension)
/*
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
*/

-- Query to check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Query to find missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
    AND n_distinct > 100 
    AND correlation < 0.1;

-- ========================================
-- 8. DEPLOYMENT INSTRUCTIONS
-- ========================================

/*
To deploy these optimizations:

1. Backup your database:
   pg_dump axolop_crm > backup_before_optimization.sql

2. Run the optimization script:
   psql -d axolop_crm -f database_performance_optimization.sql

3. Set up a cron job to refresh materialized views:
   */5 * * * * psql -d axolop_crm -c "SELECT refresh_dashboard_materialized_views();"

4. Set up a weekly cleanup job:
   0 2 * * 0 psql -d axolop_crm -c "SELECT cleanup_old_data();"

5. Monitor performance with the monitoring queries above

6. Consider implementing connection pooling in your application:
   - Use PgBouncer for connection pooling
   - Set max_connections appropriately
   - Configure connection timeout settings
*/

-- ========================================
-- 9. VERIFICATION
-- ========================================

-- Verify indexes were created
SELECT indexname FROM pg_indexes WHERE tablename IN (
    'contacts', 'leads', 'opportunities', 'activities', 
    'email_campaigns', 'forms', 'tasks', 'calendar_events',
    'workflows', 'agencies', 'agency_members'
) AND indexname LIKE 'idx_%';

-- Verify materialized views were created
SELECT matviewname FROM pg_matviews WHERE matviewname LIKE '%dashboard%' OR matviewname LIKE '%funnel%' OR matviewname LIKE '%campaign%';

-- Verify functions were created
SELECT proname FROM pg_proc WHERE proname IN (
    'refresh_dashboard_materialized_views', 
    'get_user_dashboard_stats', 
    'cleanup_old_data'
);

COMMIT;