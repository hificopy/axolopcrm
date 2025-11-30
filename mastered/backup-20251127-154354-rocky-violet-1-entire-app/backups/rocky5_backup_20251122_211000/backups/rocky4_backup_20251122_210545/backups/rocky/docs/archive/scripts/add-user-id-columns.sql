-- =====================================================
-- MIGRATION: ADD user_id COLUMNS TO ALL TABLES
-- Run this BEFORE the RLS setup script
-- =====================================================

-- This script safely adds user_id columns to all tables
-- It checks if columns exist before adding them
-- It also creates proper foreign key relationships

DO $$
BEGIN
  -- =====================================================
  -- CORE CRM TABLES
  -- =====================================================

  -- Leads table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'user_id') THEN
      ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to leads table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in leads table';
    END IF;
  END IF;

  -- Contacts table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contacts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'user_id') THEN
      ALTER TABLE public.contacts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to contacts table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in contacts table';
    END IF;
  END IF;

  -- Opportunities table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'user_id') THEN
      ALTER TABLE public.opportunities ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to opportunities table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in opportunities table';
    END IF;
  END IF;

  -- =====================================================
  -- LEAD MANAGEMENT TABLES
  -- =====================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lead_import_presets') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'lead_import_presets' AND column_name = 'user_id') THEN
      ALTER TABLE public.lead_import_presets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to lead_import_presets table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in lead_import_presets table';
    END IF;
  END IF;

  -- =====================================================
  -- FORM TABLES
  -- =====================================================

  -- Forms
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forms') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'forms' AND column_name = 'user_id') THEN
      ALTER TABLE public.forms ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to forms table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in forms table';
    END IF;
  END IF;

  -- Form responses (Note: this might need to stay public for submissions)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_responses') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'form_responses' AND column_name = 'user_id') THEN
      ALTER TABLE public.form_responses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to form_responses table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in form_responses table';
    END IF;
  END IF;

  -- Form analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_analytics') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'form_analytics' AND column_name = 'user_id') THEN
      ALTER TABLE public.form_analytics ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to form_analytics table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in form_analytics table';
    END IF;
  END IF;

  -- Question analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_analytics') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'question_analytics' AND column_name = 'user_id') THEN
      ALTER TABLE public.question_analytics ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to question_analytics table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in question_analytics table';
    END IF;
  END IF;

  -- Form integrations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_integrations') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'form_integrations' AND column_name = 'user_id') THEN
      ALTER TABLE public.form_integrations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to form_integrations table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in form_integrations table';
    END IF;
  END IF;

  -- Form campaign triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_campaign_triggers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'form_campaign_triggers' AND column_name = 'user_id') THEN
      ALTER TABLE public.form_campaign_triggers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to form_campaign_triggers table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in form_campaign_triggers table';
    END IF;
  END IF;

  -- =====================================================
  -- EMAIL & COMMUNICATION TABLES
  -- =====================================================

  -- Campaign emails
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_emails') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaign_emails' AND column_name = 'user_id') THEN
      ALTER TABLE public.campaign_emails ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to campaign_emails table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in campaign_emails table';
    END IF;
  END IF;

  -- Email campaigns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_campaigns') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_campaigns' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_campaigns table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_campaigns table';
    END IF;
  END IF;

  -- Email marketing workflows
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_marketing_workflows') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_marketing_workflows' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_marketing_workflows ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_marketing_workflows table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_marketing_workflows table';
    END IF;
  END IF;

  -- Email workflow executions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_workflow_executions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_workflow_executions' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_workflow_executions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_workflow_executions table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_workflow_executions table';
    END IF;
  END IF;

  -- Email workflow triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_workflow_triggers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_workflow_triggers' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_workflow_triggers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_workflow_triggers table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_workflow_triggers table';
    END IF;
  END IF;

  -- Emails
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emails') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emails' AND column_name = 'user_id') THEN
      ALTER TABLE public.emails ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to emails table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in emails table';
    END IF;
  END IF;

  -- Email events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_events') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_events' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_events table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_events table';
    END IF;
  END IF;

  -- Email suppressions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_suppressions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_suppressions' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_suppressions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_suppressions table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_suppressions table';
    END IF;
  END IF;

  -- SendGrid contact sync
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sendgrid_contact_sync') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sendgrid_contact_sync' AND column_name = 'user_id') THEN
      ALTER TABLE public.sendgrid_contact_sync ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to sendgrid_contact_sync table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in sendgrid_contact_sync table';
    END IF;
  END IF;

  -- SendGrid template sync
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sendgrid_template_sync') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sendgrid_template_sync' AND column_name = 'user_id') THEN
      ALTER TABLE public.sendgrid_template_sync ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to sendgrid_template_sync table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in sendgrid_template_sync table';
    END IF;
  END IF;

  -- =====================================================
  -- WORKFLOW TABLES
  -- =====================================================

  -- Workflows
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workflows' AND column_name = 'user_id') THEN
      ALTER TABLE public.workflows ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to workflows table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in workflows table';
    END IF;
  END IF;

  -- Workflow actions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_actions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workflow_actions' AND column_name = 'user_id') THEN
      ALTER TABLE public.workflow_actions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to workflow_actions table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in workflow_actions table';
    END IF;
  END IF;

  -- Workflow executions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_executions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workflow_executions' AND column_name = 'user_id') THEN
      ALTER TABLE public.workflow_executions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to workflow_executions table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in workflow_executions table';
    END IF;
  END IF;

  -- Workflow templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_templates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workflow_templates' AND column_name = 'user_id') THEN
      ALTER TABLE public.workflow_templates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to workflow_templates table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in workflow_templates table';
    END IF;
  END IF;

  -- =====================================================
  -- ACTIVITY & HISTORY TABLES
  -- =====================================================

  -- Activities
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'user_id') THEN
      ALTER TABLE public.activities ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to activities table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in activities table';
    END IF;
  END IF;

  -- Activity history
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_history') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'activity_history' AND column_name = 'user_id') THEN
      ALTER TABLE public.activity_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to activity_history table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in activity_history table';
    END IF;
  END IF;

  -- Communication history
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'communication_history') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'communication_history' AND column_name = 'user_id') THEN
      ALTER TABLE public.communication_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to communication_history table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in communication_history table';
    END IF;
  END IF;

  -- =====================================================
  -- COMMUNICATION TABLES
  -- =====================================================

  -- Phone calls
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'phone_calls') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'phone_calls' AND column_name = 'user_id') THEN
      ALTER TABLE public.phone_calls ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to phone_calls table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in phone_calls table';
    END IF;
  END IF;

  -- SMS messages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sms_messages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sms_messages' AND column_name = 'user_id') THEN
      ALTER TABLE public.sms_messages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to sms_messages table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in sms_messages table';
    END IF;
  END IF;

  -- =====================================================
  -- PRODUCTIVITY TABLES
  -- =====================================================

  -- Tasks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'user_id') THEN
      ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to tasks table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in tasks table';
    END IF;
  END IF;

  -- Notes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'user_id') THEN
      ALTER TABLE public.notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to notes table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in notes table';
    END IF;
  END IF;

  -- Tags
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tags') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tags' AND column_name = 'user_id') THEN
      ALTER TABLE public.tags ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to tags table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in tags table';
    END IF;
  END IF;

  -- Entity tags
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'entity_tags') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'entity_tags' AND column_name = 'user_id') THEN
      ALTER TABLE public.entity_tags ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to entity_tags table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in entity_tags table';
    END IF;
  END IF;

  -- =====================================================
  -- USER PREFERENCE TABLES
  -- =====================================================

  -- Dashboard presets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dashboard_presets') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'dashboard_presets' AND column_name = 'user_id') THEN
      ALTER TABLE public.dashboard_presets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to dashboard_presets table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in dashboard_presets table';
    END IF;
  END IF;

  -- User preferences
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'user_id') THEN
      ALTER TABLE public.user_preferences ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to user_preferences table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in user_preferences table';
    END IF;
  END IF;

  -- =====================================================
  -- TEAM & COLLABORATION TABLES
  -- =====================================================

  -- Team members
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'user_id') THEN
      ALTER TABLE public.team_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to team_members table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in team_members table';
    END IF;
  END IF;

  -- Team settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_settings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'team_settings' AND column_name = 'user_id') THEN
      ALTER TABLE public.team_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to team_settings table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in team_settings table';
    END IF;
  END IF;

  -- =====================================================
  -- API & INTEGRATION TABLES
  -- =====================================================

  -- API keys
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id') THEN
      ALTER TABLE public.api_keys ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to api_keys table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in api_keys table';
    END IF;
  END IF;

  -- Webhooks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhooks') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webhooks' AND column_name = 'user_id') THEN
      ALTER TABLE public.webhooks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to webhooks table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in webhooks table';
    END IF;
  END IF;

  -- Webhook logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'webhook_logs' AND column_name = 'user_id') THEN
      ALTER TABLE public.webhook_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to webhook_logs table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in webhook_logs table';
    END IF;
  END IF;

  -- Integrations
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'integrations') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'integrations' AND column_name = 'user_id') THEN
      ALTER TABLE public.integrations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to integrations table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in integrations table';
    END IF;
  END IF;

  -- OAuth connections
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'oauth_connections') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'oauth_connections' AND column_name = 'user_id') THEN
      ALTER TABLE public.oauth_connections ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to oauth_connections table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in oauth_connections table';
    END IF;
  END IF;

  -- =====================================================
  -- DATA IMPORT/EXPORT TABLES
  -- =====================================================

  -- Import jobs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_jobs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'import_jobs' AND column_name = 'user_id') THEN
      ALTER TABLE public.import_jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to import_jobs table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in import_jobs table';
    END IF;
  END IF;

  -- Export jobs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'export_jobs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'export_jobs' AND column_name = 'user_id') THEN
      ALTER TABLE public.export_jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to export_jobs table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in export_jobs table';
    END IF;
  END IF;

  -- =====================================================
  -- CUSTOM FIELDS TABLES
  -- =====================================================

  -- Custom fields
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custom_fields') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_fields' AND column_name = 'user_id') THEN
      ALTER TABLE public.custom_fields ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to custom_fields table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in custom_fields table';
    END IF;
  END IF;

  -- Custom field values
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custom_field_values') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_field_values' AND column_name = 'user_id') THEN
      ALTER TABLE public.custom_field_values ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to custom_field_values table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in custom_field_values table';
    END IF;
  END IF;

  -- =====================================================
  -- SALES PIPELINE TABLES
  -- =====================================================

  -- Pipelines
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pipelines') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pipelines' AND column_name = 'user_id') THEN
      ALTER TABLE public.pipelines ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to pipelines table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in pipelines table';
    END IF;
  END IF;

  -- Pipeline stages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pipeline_stages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pipeline_stages' AND column_name = 'user_id') THEN
      ALTER TABLE public.pipeline_stages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to pipeline_stages table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in pipeline_stages table';
    END IF;
  END IF;

  -- =====================================================
  -- PRODUCT & BILLING TABLES
  -- =====================================================

  -- Products
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'user_id') THEN
      ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to products table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in products table';
    END IF;
  END IF;

  -- Invoices
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'user_id') THEN
      ALTER TABLE public.invoices ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to invoices table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in invoices table';
    END IF;
  END IF;

  -- Invoice items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'user_id') THEN
      ALTER TABLE public.invoice_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to invoice_items table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in invoice_items table';
    END IF;
  END IF;

  -- Quotes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'user_id') THEN
      ALTER TABLE public.quotes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to quotes table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in quotes table';
    END IF;
  END IF;

  -- Quote items
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quote_items') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quote_items' AND column_name = 'user_id') THEN
      ALTER TABLE public.quote_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to quote_items table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in quote_items table';
    END IF;
  END IF;

  -- =====================================================
  -- DOCUMENT & CONTENT TABLES
  -- =====================================================

  -- Documents
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'user_id') THEN
      ALTER TABLE public.documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to documents table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in documents table';
    END IF;
  END IF;

  -- Email templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_templates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'user_id') THEN
      ALTER TABLE public.email_templates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to email_templates table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in email_templates table';
    END IF;
  END IF;

  -- SMS templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sms_templates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sms_templates' AND column_name = 'user_id') THEN
      ALTER TABLE public.sms_templates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to sms_templates table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in sms_templates table';
    END IF;
  END IF;

  -- Proposals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'proposals') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'user_id') THEN
      ALTER TABLE public.proposals ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to proposals table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in proposals table';
    END IF;
  END IF;

  -- Proposal templates
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'proposal_templates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'proposal_templates' AND column_name = 'user_id') THEN
      ALTER TABLE public.proposal_templates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to proposal_templates table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in proposal_templates table';
    END IF;
  END IF;

  -- =====================================================
  -- TRAINING & CONTRACTS TABLES
  -- =====================================================

  -- Training sessions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'training_sessions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'training_sessions' AND column_name = 'user_id') THEN
      ALTER TABLE public.training_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to training_sessions table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in training_sessions table';
    END IF;
  END IF;

  -- Contracts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contracts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'user_id') THEN
      ALTER TABLE public.contracts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to contracts table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in contracts table';
    END IF;
  END IF;

  -- =====================================================
  -- BOOKING & SCHEDULING TABLES
  -- =====================================================

  -- Booking links
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_links') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'booking_links' AND column_name = 'user_id') THEN
      ALTER TABLE public.booking_links ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to booking_links table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in booking_links table';
    END IF;
  END IF;

  -- Bookings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id') THEN
      ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to bookings table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in bookings table';
    END IF;
  END IF;

  -- =====================================================
  -- SECOND BRAIN/NOTES TABLES
  -- =====================================================

  -- Second brain nodes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'second_brain_nodes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'second_brain_nodes' AND column_name = 'user_id') THEN
      ALTER TABLE public.second_brain_nodes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to second_brain_nodes table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in second_brain_nodes table';
    END IF;
  END IF;

  -- Second brain maps
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'second_brain_maps') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'second_brain_maps' AND column_name = 'user_id') THEN
      ALTER TABLE public.second_brain_maps ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to second_brain_maps table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in second_brain_maps table';
    END IF;
  END IF;

  -- Second brain notes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'second_brain_notes') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'second_brain_notes' AND column_name = 'user_id') THEN
      ALTER TABLE public.second_brain_notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE '✅ Added user_id to second_brain_notes table';
    ELSE
      RAISE NOTICE '✓ user_id already exists in second_brain_notes table';
    END IF;
  END IF;

END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ USER_ID COLUMN MIGRATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All existing tables now have user_id columns';
  RAISE NOTICE '✅ Foreign key relationships established';
  RAISE NOTICE '✅ Ready for RLS policy setup';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEP: Run fixed-rls-setup.sql';
  RAISE NOTICE '';
END $$;
