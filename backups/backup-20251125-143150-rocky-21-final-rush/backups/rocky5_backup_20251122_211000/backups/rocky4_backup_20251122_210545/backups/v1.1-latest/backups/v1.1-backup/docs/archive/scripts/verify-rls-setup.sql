-- =====================================================
-- VERIFICATION SCRIPT FOR RLS SETUP
-- Run this AFTER executing fixed-rls-setup.sql
-- =====================================================

-- Check which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'leads', 'contacts', 'opportunities', 'lead_import_presets',
    'forms', 'form_responses', 'form_analytics', 'question_analytics',
    'form_integrations', 'form_campaign_triggers',
    'campaign_emails', 'email_campaigns', 'email_marketing_workflows',
    'email_workflow_executions', 'email_workflow_triggers',
    'emails', 'email_events', 'email_suppressions',
    'sendgrid_contact_sync', 'sendgrid_template_sync',
    'workflows', 'workflow_actions', 'workflow_executions',
    'workflow_templates', 'activities', 'activity_history',
    'communication_history', 'phone_calls', 'sms_messages',
    'tasks', 'notes', 'tags', 'entity_tags',
    'dashboard_presets', 'user_preferences', 'team_members',
    'team_settings', 'api_keys', 'webhooks', 'webhook_logs',
    'integrations', 'oauth_connections', 'import_jobs',
    'export_jobs', 'custom_fields', 'custom_field_values',
    'pipelines', 'pipeline_stages', 'products', 'invoices',
    'invoice_items', 'quotes', 'quote_items', 'documents',
    'email_templates', 'sms_templates', 'proposals',
    'proposal_templates', 'training_sessions', 'contracts',
    'booking_links', 'bookings', 'second_brain_nodes',
    'second_brain_maps', 'second_brain_notes'
  )
ORDER BY tablename;

-- Count how many policies exist per table
SELECT
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Show all policies with their details
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for tables without RLS enabled (potential security issue)
SELECT
  tablename,
  'WARNING: RLS NOT ENABLED' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- Summary statistics
SELECT
  COUNT(DISTINCT tablename) FILTER (WHERE rowsecurity = true) as tables_with_rls,
  COUNT(DISTINCT tablename) FILTER (WHERE rowsecurity = false) as tables_without_rls,
  COUNT(DISTINCT tablename) as total_tables
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%';
