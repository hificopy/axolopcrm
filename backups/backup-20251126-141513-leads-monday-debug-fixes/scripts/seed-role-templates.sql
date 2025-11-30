-- ============================================
-- AXOLOP CRM: 200+ Default Role Templates
-- ============================================
-- Discord-style roles organized by category
-- Each role has default permissions and section access
-- ============================================

-- NOTE: Using ON CONFLICT to make this script idempotent (can be run multiple times safely)
-- This replaces TRUNCATE which can cause issues with foreign key constraints

-- ============================================
-- PERMISSION DEFINITIONS
-- ============================================
-- Base permissions for reference:
-- can_view_dashboard, can_view_leads, can_create_leads, can_edit_leads, can_delete_leads
-- can_view_contacts, can_create_contacts, can_edit_contacts, can_delete_contacts
-- can_view_opportunities, can_create_opportunities, can_edit_opportunities, can_delete_opportunities
-- can_view_activities, can_create_activities, can_edit_activities
-- can_view_meetings, can_manage_meetings, can_view_calendar, can_manage_calendar
-- can_view_forms, can_manage_forms, can_view_campaigns, can_manage_campaigns
-- can_view_workflows, can_manage_workflows, can_view_reports, can_export_data, can_import_data
-- can_manage_team, can_manage_roles, can_manage_billing, can_manage_agency_settings
-- can_access_api, can_manage_integrations, can_view_second_brain, can_manage_second_brain

-- ============================================
-- CATEGORY: SALES (30 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('sales_representative', 'Sales Representative', 'Entry-level sales team member focused on lead conversion', 'Sales', '#4A1515', 'user', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": false,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": false,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": false,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 1),

('sales_manager', 'Sales Manager', 'Manages sales team and oversees pipeline performance', 'Sales', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 2),

('sales_director', 'Sales Director', 'Senior leadership overseeing all sales operations', 'Sales', '#4A1515', 'briefcase', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true, "settings": true}', 3),

('account_executive', 'Account Executive', 'Manages client relationships and closes deals', 'Sales', '#4A1515', 'user-check', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 4),

('business_development_rep', 'Business Development Rep', 'Identifies and qualifies new business opportunities', 'Sales', '#4A1515', 'target', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 5),

('sales_development_rep', 'Sales Development Rep (SDR)', 'Focuses on outbound prospecting and lead qualification', 'Sales', '#4A1515', 'phone-outgoing', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true}', 6),

('inside_sales_rep', 'Inside Sales Rep', 'Handles inbound leads and remote sales calls', 'Sales', '#4A1515', 'phone', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 7),

('outside_sales_rep', 'Outside Sales Rep', 'Field sales representative for in-person meetings', 'Sales', '#4A1515', 'map-pin', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 8),

('enterprise_sales', 'Enterprise Sales', 'Handles large enterprise accounts and complex deals', 'Sales', '#4A1515', 'building', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 9),

('smb_sales', 'SMB Sales', 'Focuses on small and medium business accounts', 'Sales', '#4A1515', 'store', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 10),

('sales_engineer', 'Sales Engineer', 'Technical sales support for complex product demos', 'Sales', '#4A1515', 'settings', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 11),

('solution_architect', 'Solution Architect', 'Designs technical solutions for client needs', 'Sales', '#4A1515', 'layers', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 12),

('sales_coordinator', 'Sales Coordinator', 'Administrative support for the sales team', 'Sales', '#4A1515', 'clipboard', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 13),

('territory_manager', 'Territory Manager', 'Manages sales within a specific geographic region', 'Sales', '#4A1515', 'globe', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 14),

('regional_sales_manager', 'Regional Sales Manager', 'Oversees sales operations for a specific region', 'Sales', '#4A1515', 'map', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 15),

('vp_sales', 'VP of Sales', 'Executive leadership for all sales functions', 'Sales', '#4A1515', 'award', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true, "settings": true}', 16),

('chief_revenue_officer', 'Chief Revenue Officer', 'C-level executive responsible for all revenue', 'Sales', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true,
  "can_access_api": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true, "settings": true}', 17),

('quota_carrier', 'Quota Carrier', 'Sales rep with assigned revenue targets', 'Sales', '#4A1515', 'dollar-sign', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 18),

('sdr_manager', 'SDR Manager', 'Manages the sales development team', 'Sales', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 19),

('lead_qualifier', 'Lead Qualifier', 'Screens and qualifies inbound leads', 'Sales', '#4A1515', 'filter', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true}', 20),

('demo_specialist', 'Demo Specialist', 'Conducts product demonstrations for prospects', 'Sales', '#4A1515', 'play-circle', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 21),

('closer', 'Closer', 'Specialist focused on closing deals', 'Sales', '#4A1515', 'check-circle', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 22),

('sales_trainer', 'Sales Trainer', 'Trains and develops sales team members', 'Sales', '#4A1515', 'book-open', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 23),

('sales_operations', 'Sales Operations', 'Manages sales processes and tools', 'Sales', '#4A1515', 'settings', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true, "settings": true}', 24),

('commission_analyst', 'Commission Analyst', 'Calculates and tracks sales commissions', 'Sales', '#4A1515', 'calculator', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 25),

('deal_desk_analyst', 'Deal Desk Analyst', 'Reviews and approves deal structures', 'Sales', '#4A1515', 'file-text', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 26),

('contract_specialist', 'Contract Specialist', 'Manages sales contracts and agreements', 'Sales', '#4A1515', 'file-signature', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "opportunities": true}', 27),

('proposal_manager', 'Proposal Manager', 'Creates and manages sales proposals', 'Sales', '#4A1515', 'file-plus', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true}', 28),

('rfp_coordinator', 'RFP Coordinator', 'Manages responses to requests for proposals', 'Sales', '#4A1515', 'inbox', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "opportunities": true}', 29),

('sales_enablement', 'Sales Enablement', 'Provides tools and content to support sales', 'Sales', '#4A1515', 'zap', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_campaigns": true
}', '{"dashboard": true, "leads": true, "forms": true, "reports": true}', 30),

('revenue_operations', 'Revenue Operations', 'Aligns sales, marketing, and customer success operations', 'Sales', '#4A1515', 'activity', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_integrations": true,
  "can_access_api": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true, "settings": true}', 31)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: MARKETING (30 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('marketing_manager', 'Marketing Manager', 'Manages marketing campaigns and team', 'Marketing', '#4A1515', 'megaphone', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "forms": true, "workflows": true, "reports": true}', 40),

('marketing_director', 'Marketing Director', 'Senior leadership for marketing department', 'Marketing', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "forms": true, "workflows": true, "reports": true, "settings": true}', 41),

('cmo', 'Chief Marketing Officer', 'Executive leadership for all marketing', 'Marketing', '#4A1515', 'award', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "forms": true, "workflows": true, "reports": true, "settings": true}', 42),

('content_writer', 'Content Writer', 'Creates written content for marketing', 'Marketing', '#4A1515', 'edit-3', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_view_forms": true
}', '{"dashboard": true, "campaigns": true}', 43),

('copywriter', 'Copywriter', 'Writes persuasive marketing copy', 'Marketing', '#4A1515', 'type', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true
}', '{"dashboard": true, "campaigns": true, "forms": true}', 44),

('seo_specialist', 'SEO Specialist', 'Optimizes content for search engines', 'Marketing', '#4A1515', 'search', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "campaigns": true, "reports": true}', 45),

('sem_manager', 'SEM Manager', 'Manages paid search campaigns', 'Marketing', '#4A1515', 'dollar-sign', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "campaigns": true, "reports": true}', 46),

('social_media_manager', 'Social Media Manager', 'Manages social media presence and campaigns', 'Marketing', '#4A1515', 'share-2', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_reports": true
}', '{"dashboard": true, "campaigns": true, "reports": true}', 47),

('brand_manager', 'Brand Manager', 'Maintains brand consistency and strategy', 'Marketing', '#4A1515', 'bookmark', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_reports": true
}', '{"dashboard": true, "campaigns": true, "forms": true, "reports": true}', 48),

('product_marketing_manager', 'Product Marketing Manager', 'Markets products and manages positioning', 'Marketing', '#4A1515', 'package', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "forms": true, "reports": true}', 49),

('growth_marketer', 'Growth Marketer', 'Focuses on rapid user and revenue growth', 'Marketing', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "workflows": true, "reports": true}', 50),

('demand_gen_manager', 'Demand Generation Manager', 'Creates demand through marketing campaigns', 'Marketing', '#4A1515', 'zap', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_workflows": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "forms": true, "reports": true}', 51),

('email_marketing_specialist', 'Email Marketing Specialist', 'Creates and manages email campaigns', 'Marketing', '#4A1515', 'mail', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "campaigns": true, "reports": true}', 52),

('marketing_operations', 'Marketing Operations', 'Manages marketing technology and processes', 'Marketing', '#4A1515', 'settings', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "workflows": true, "reports": true, "settings": true}', 53),

('creative_director', 'Creative Director', 'Leads creative vision and design direction', 'Marketing', '#4A1515', 'compass', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_manage_team": true
}', '{"dashboard": true, "campaigns": true, "forms": true}', 54),

('art_director', 'Art Director', 'Directs visual style of marketing materials', 'Marketing', '#4A1515', 'image', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true
}', '{"dashboard": true, "campaigns": true, "forms": true}', 55),

('graphic_designer', 'Graphic Designer', 'Creates visual designs for marketing', 'Marketing', '#4A1515', 'pen-tool', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true,
  "can_view_forms": true
}', '{"dashboard": true, "campaigns": true, "forms": true}', 56),

('video_producer', 'Video Producer', 'Creates video content for marketing', 'Marketing', '#4A1515', 'video', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true
}', '{"dashboard": true, "campaigns": true}', 57),

('photographer', 'Photographer', 'Creates photography for marketing', 'Marketing', '#4A1515', 'camera', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true
}', '{"dashboard": true, "campaigns": true}', 58),

('web_designer', 'Web Designer', 'Designs web pages and landing pages', 'Marketing', '#4A1515', 'monitor', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true,
  "can_view_forms": true,
  "can_manage_forms": true
}', '{"dashboard": true, "campaigns": true, "forms": true}', 59),

('ui_ux_designer', 'UI/UX Designer', 'Designs user interfaces and experiences', 'Marketing', '#4A1515', 'layout', '{
  "can_view_dashboard": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_reports": true
}', '{"dashboard": true, "forms": true, "reports": true}', 60),

('marketing_analyst', 'Marketing Analyst', 'Analyzes marketing data and performance', 'Marketing', '#4A1515', 'bar-chart-2', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "campaigns": true, "reports": true}', 61),

('data_analyst', 'Data Analyst', 'Analyzes data for insights', 'Marketing', '#4A1515', 'database', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "reports": true}', 62),

('pr_manager', 'PR Manager', 'Manages public relations and media', 'Marketing', '#4A1515', 'radio', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_campaigns": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "campaigns": true}', 63),

('event_manager', 'Event Manager', 'Plans and executes marketing events', 'Marketing', '#4A1515', 'calendar', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_campaigns": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_forms": true
}', '{"dashboard": true, "leads": true, "contacts": true, "campaigns": true, "calendar": true, "forms": true}', 64),

('campaign_manager', 'Campaign Manager', 'Manages marketing campaign execution', 'Marketing', '#4A1515', 'send', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "workflows": true, "reports": true}', 65),

('affiliate_manager', 'Affiliate Manager', 'Manages affiliate marketing program', 'Marketing', '#4A1515', 'link', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "campaigns": true, "reports": true}', 66),

('influencer_manager', 'Influencer Manager', 'Manages influencer relationships', 'Marketing', '#4A1515', 'star', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_campaigns": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "campaigns": true}', 67),

('community_manager', 'Community Manager', 'Builds and manages online communities', 'Marketing', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_campaigns": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true, "campaigns": true}', 68),

('marketing_coordinator', 'Marketing Coordinator', 'Coordinates marketing activities', 'Marketing', '#4A1515', 'clipboard', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "campaigns": true, "calendar": true}', 69)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: OPERATIONS (25 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('operations_manager', 'Operations Manager', 'Manages daily operations and processes', 'Operations', '#4A1515', 'settings', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true, "reports": true}', 80),

('coo', 'Chief Operating Officer', 'Executive leadership for operations', 'Operations', '#4A1515', 'briefcase', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true, "settings": true}', 81),

('project_manager', 'Project Manager', 'Manages projects and timelines', 'Operations', '#4A1515', 'folder', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true, "reports": true}', 82),

('program_manager', 'Program Manager', 'Manages multiple related projects', 'Operations', '#4A1515', 'layers', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true, "reports": true}', 83),

('process_improvement', 'Process Improvement Specialist', 'Optimizes business processes', 'Operations', '#4A1515', 'refresh-cw', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "workflows": true, "reports": true}', 84),

('quality_assurance', 'Quality Assurance Specialist', 'Ensures quality standards are met', 'Operations', '#4A1515', 'check-square', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "reports": true}', 85),

('logistics_coordinator', 'Logistics Coordinator', 'Coordinates logistics and shipping', 'Operations', '#4A1515', 'truck', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 86),

('supply_chain_manager', 'Supply Chain Manager', 'Manages supply chain operations', 'Operations', '#4A1515', 'link', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 87),

('inventory_manager', 'Inventory Manager', 'Manages inventory and stock', 'Operations', '#4A1515', 'box', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 88),

('facilities_manager', 'Facilities Manager', 'Manages office and facilities', 'Operations', '#4A1515', 'home', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "calendar": true}', 89),

('office_manager', 'Office Manager', 'Manages office operations', 'Operations', '#4A1515', 'briefcase', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_manage_team": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 90),

('executive_assistant', 'Executive Assistant', 'Supports executive leadership', 'Operations', '#4A1515', 'user-check', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true}', 91),

('administrative_assistant', 'Administrative Assistant', 'Provides administrative support', 'Operations', '#4A1515', 'clipboard', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 92),

('receptionist', 'Receptionist', 'Handles front desk and visitor management', 'Operations', '#4A1515', 'phone', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_calendar": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 93),

('procurement_specialist', 'Procurement Specialist', 'Handles purchasing and procurement', 'Operations', '#4A1515', 'shopping-cart', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 94),

('vendor_manager', 'Vendor Manager', 'Manages vendor relationships', 'Operations', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 95),

('compliance_officer', 'Compliance Officer', 'Ensures regulatory compliance', 'Operations', '#4A1515', 'shield', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "reports": true}', 96),

('risk_manager', 'Risk Manager', 'Identifies and manages risks', 'Operations', '#4A1515', 'alert-triangle', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "reports": true}', 97),

('business_analyst', 'Business Analyst', 'Analyzes business processes and data', 'Operations', '#4A1515', 'bar-chart', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true}', 98),

('systems_administrator', 'Systems Administrator', 'Manages IT systems and infrastructure', 'Operations', '#4A1515', 'server', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_manage_integrations": true,
  "can_access_api": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "reports": true, "settings": true}', 99),

('it_support', 'IT Support Specialist', 'Provides technical support', 'Operations', '#4A1515', 'headphones', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 100),

('data_entry', 'Data Entry Specialist', 'Enters and maintains data', 'Operations', '#4A1515', 'edit', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true
}', '{"dashboard": true, "leads": true, "contacts": true}', 101),

('documentation_specialist', 'Documentation Specialist', 'Creates and maintains documentation', 'Operations', '#4A1515', 'file-text', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_second_brain": true,
  "can_manage_second_brain": true
}', '{"dashboard": true, "second_brain": true}', 102),

('training_coordinator', 'Training Coordinator', 'Coordinates training programs', 'Operations', '#4A1515', 'book', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 103),

('hr_generalist', 'HR Generalist', 'Handles human resources functions', 'Operations', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_manage_team": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 104)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: FINANCE (20 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('cfo', 'Chief Financial Officer', 'Executive leadership for finance', 'Finance', '#4A1515', 'dollar-sign', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "opportunities": true, "reports": true, "settings": true}', 120),

('finance_director', 'Finance Director', 'Senior leadership for finance', 'Finance', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 121),

('controller', 'Controller', 'Oversees accounting operations', 'Finance', '#4A1515', 'file-text', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 122),

('accountant', 'Accountant', 'Manages financial records', 'Finance', '#4A1515', 'book', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 123),

('bookkeeper', 'Bookkeeper', 'Maintains financial books', 'Finance', '#4A1515', 'book-open', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 124),

('financial_analyst', 'Financial Analyst', 'Analyzes financial data', 'Finance', '#4A1515', 'bar-chart-2', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 125),

('fpa_manager', 'FP&A Manager', 'Financial planning and analysis', 'Finance', '#4A1515', 'pie-chart', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 126),

('treasury_manager', 'Treasury Manager', 'Manages cash and investments', 'Finance', '#4A1515', 'lock', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 127),

('tax_specialist', 'Tax Specialist', 'Handles tax compliance', 'Finance', '#4A1515', 'percent', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "reports": true}', 128),

('audit_manager', 'Audit Manager', 'Manages internal audits', 'Finance', '#4A1515', 'search', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true}', 129),

('billing_specialist', 'Billing Specialist', 'Manages billing and invoicing', 'Finance', '#4A1515', 'file-invoice', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "reports": true}', 130),

('collections_specialist', 'Collections Specialist', 'Manages accounts receivable', 'Finance', '#4A1515', 'inbox', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "opportunities": true}', 131),

('accounts_receivable', 'Accounts Receivable Specialist', 'Manages incoming payments', 'Finance', '#4A1515', 'download', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "reports": true}', 132),

('accounts_payable', 'Accounts Payable Specialist', 'Manages outgoing payments', 'Finance', '#4A1515', 'upload', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 133),

('payroll_specialist', 'Payroll Specialist', 'Manages employee payroll', 'Finance', '#4A1515', 'credit-card', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 134),

('budget_analyst', 'Budget Analyst', 'Analyzes and manages budgets', 'Finance', '#4A1515', 'clipboard', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 135),

('cost_accountant', 'Cost Accountant', 'Analyzes costs and profitability', 'Finance', '#4A1515', 'calculator', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 136),

('revenue_accountant', 'Revenue Accountant', 'Manages revenue recognition', 'Finance', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 137),

('financial_controller', 'Financial Controller', 'Controls financial operations', 'Finance', '#4A1515', 'shield', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 138),

('investment_analyst', 'Investment Analyst', 'Analyzes investment opportunities', 'Finance', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "opportunities": true, "reports": true}', 139)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: CLIENT SUCCESS (25 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('customer_success_manager', 'Customer Success Manager', 'Manages customer relationships and success', 'Client Success', '#4A1515', 'heart', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 160),

('client_services_director', 'Client Services Director', 'Leads client services team', 'Client Success', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 161),

('account_manager', 'Account Manager', 'Manages client accounts', 'Client Success', '#4A1515', 'user', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "calendar": true}', 162),

('client_partner', 'Client Partner', 'Strategic partner for key clients', 'Client Success', '#4A1515', 'briefcase', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 163),

('onboarding_specialist', 'Onboarding Specialist', 'Onboards new customers', 'Client Success', '#4A1515', 'user-plus', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 164),

('implementation_manager', 'Implementation Manager', 'Manages customer implementations', 'Client Success', '#4A1515', 'check-circle', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 165),

('training_specialist', 'Training Specialist', 'Trains customers on product', 'Client Success', '#4A1515', 'book-open', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 166),

('support_manager', 'Support Manager', 'Manages support team', 'Client Success', '#4A1515', 'headphones', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 167),

('support_representative', 'Support Representative', 'Provides customer support', 'Client Success', '#4A1515', 'message-circle', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 168),

('technical_support', 'Technical Support Specialist', 'Provides technical assistance', 'Client Success', '#4A1515', 'tool', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 169),

('help_desk', 'Help Desk Agent', 'First-line support agent', 'Client Success', '#4A1515', 'help-circle', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 170),

('escalation_manager', 'Escalation Manager', 'Handles escalated issues', 'Client Success', '#4A1515', 'alert-triangle', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 171),

('customer_advocate', 'Customer Advocate', 'Advocates for customer needs', 'Client Success', '#4A1515', 'heart', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 172),

('retention_specialist', 'Retention Specialist', 'Focuses on customer retention', 'Client Success', '#4A1515', 'anchor', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "reports": true}', 173),

('renewal_manager', 'Renewal Manager', 'Manages subscription renewals', 'Client Success', '#4A1515', 'refresh-cw', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "reports": true}', 174),

('upsell_specialist', 'Upsell Specialist', 'Identifies upsell opportunities', 'Client Success', '#4A1515', 'trending-up', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "opportunities": true}', 175),

('cross_sell_specialist', 'Cross-sell Specialist', 'Identifies cross-sell opportunities', 'Client Success', '#4A1515', 'git-branch', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true, "opportunities": true}', 176),

('voice_of_customer', 'Voice of Customer Analyst', 'Gathers and analyzes customer feedback', 'Client Success', '#4A1515', 'mic', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 177),

('nps_analyst', 'NPS Analyst', 'Manages Net Promoter Score program', 'Client Success', '#4A1515', 'bar-chart', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 178),

('customer_experience_manager', 'Customer Experience Manager', 'Optimizes customer experience', 'Client Success', '#4A1515', 'smile', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 179),

('client_relationship_manager', 'Client Relationship Manager', 'Manages key client relationships', 'Client Success', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "calendar": true}', 180),

('service_delivery_manager', 'Service Delivery Manager', 'Manages service delivery', 'Client Success', '#4A1515', 'truck', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "calendar": true, "reports": true}', 181),

('solutions_consultant', 'Solutions Consultant', 'Provides solution guidance to clients', 'Client Success', '#4A1515', 'lightbulb', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "opportunities": true, "calendar": true}', 182),

('customer_education', 'Customer Education Specialist', 'Educates customers on product', 'Client Success', '#4A1515', 'book', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true
}', '{"dashboard": true, "contacts": true, "calendar": true}', 183),

('success_operations', 'Success Operations', 'Manages customer success operations', 'Client Success', '#4A1515', 'settings', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "contacts": true, "workflows": true, "reports": true, "settings": true}', 184)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: AGENCY-SPECIFIC (20 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('agency_principal', 'Agency Principal', 'Agency owner or partner', 'Agency', '#4A1515', 'award', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_delete_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true,
  "can_access_api": true,
  "can_manage_integrations": true,
  "can_view_second_brain": true,
  "can_manage_second_brain": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "forms": true, "campaigns": true, "workflows": true, "reports": true, "settings": true, "second_brain": true}', 200),

('client_lead', 'Client Lead', 'Leads client accounts', 'Agency', '#4A1515', 'user-check', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 201),

('appointment_setter', 'Appointment Setter', 'Books appointments for sales team', 'Agency', '#4A1515', 'calendar', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true}', 202),

('appointment_coordinator', 'Appointment Coordinator', 'Coordinates scheduling', 'Agency', '#4A1515', 'clock', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true, "calendar": true}', 203),

('cold_caller', 'Cold Caller', 'Makes outbound prospecting calls', 'Agency', '#4A1515', 'phone-call', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true}', 204),

('outreach_specialist', 'Outreach Specialist', 'Handles outbound outreach', 'Agency', '#4A1515', 'send', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_campaigns": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true, "campaigns": true}', 205),

('lead_generator', 'Lead Generator', 'Generates new leads', 'Agency', '#4A1515', 'user-plus', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "leads": true, "contacts": true}', 206),

('list_builder', 'List Builder', 'Builds prospect lists', 'Agency', '#4A1515', 'list', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_create_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_import_data": true
}', '{"dashboard": true, "leads": true, "contacts": true}', 207),

('crm_administrator', 'CRM Administrator', 'Manages CRM system', 'Agency', '#4A1515', 'database', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_manage_integrations": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "workflows": true, "reports": true, "settings": true}', 208),

('pipeline_manager', 'Pipeline Manager', 'Manages sales pipeline', 'Agency', '#4A1515', 'git-branch', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_create_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true}', 209),

('funnel_specialist', 'Funnel Specialist', 'Optimizes sales funnels', 'Agency', '#4A1515', 'filter', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "opportunities": true, "forms": true, "workflows": true, "reports": true}', 210),

('landing_page_designer', 'Landing Page Designer', 'Designs landing pages', 'Agency', '#4A1515', 'layout', '{
  "can_view_dashboard": true,
  "can_view_forms": true,
  "can_manage_forms": true
}', '{"dashboard": true, "forms": true}', 211),

('email_sequence_writer', 'Email Sequence Writer', 'Writes email sequences', 'Agency', '#4A1515', 'mail', '{
  "can_view_dashboard": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true
}', '{"dashboard": true, "campaigns": true, "workflows": true}', 212),

('automation_specialist', 'Automation Specialist', 'Creates automated workflows', 'Agency', '#4A1515', 'zap', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "workflows": true, "campaigns": true, "settings": true}', 213),

('retargeting_specialist', 'Retargeting Specialist', 'Manages retargeting campaigns', 'Agency', '#4A1515', 'repeat', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "campaigns": true, "reports": true}', 214),

('ppc_manager', 'PPC Manager', 'Manages pay-per-click campaigns', 'Agency', '#4A1515', 'dollar-sign', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "reports": true}', 215),

('media_buyer', 'Media Buyer', 'Purchases advertising media', 'Agency', '#4A1515', 'shopping-bag', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "reports": true}', 216),

('campaign_optimizer', 'Campaign Optimizer', 'Optimizes marketing campaigns', 'Agency', '#4A1515', 'sliders', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "workflows": true, "reports": true}', 217),

('analytics_specialist', 'Analytics Specialist', 'Analyzes performance data', 'Agency', '#4A1515', 'activity', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "campaigns": true, "reports": true}', 218),

('reporting_analyst', 'Reporting Analyst', 'Creates reports and dashboards', 'Agency', '#4A1515', 'pie-chart', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_campaigns": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "campaigns": true, "reports": true}', 219)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: LEADERSHIP (15 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('ceo', 'Chief Executive Officer', 'Top executive leadership', 'Leadership', '#4A1515', 'award', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_view_forms": true,
  "can_view_campaigns": true,
  "can_view_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true,
  "can_view_second_brain": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "forms": true, "campaigns": true, "workflows": true, "reports": true, "settings": true, "second_brain": true}', 240),

('president', 'President', 'Company president', 'Leadership', '#4A1515', 'crown', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true,
  "can_manage_roles": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 241),

('managing_director', 'Managing Director', 'Senior management', 'Leadership', '#4A1515', 'briefcase', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 242),

('partner', 'Partner', 'Business partner', 'Leadership', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 243),

('principal', 'Principal', 'Senior principal', 'Leadership', '#4A1515', 'star', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_meetings": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 244),

('board_member', 'Board Member', 'Board of directors member', 'Leadership', '#4A1515', 'shield', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "reports": true}', 245),

('advisor', 'Advisor', 'Business advisor', 'Leadership', '#4A1515', 'compass', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true}', 246),

('mentor', 'Mentor', 'Team mentor', 'Leadership', '#4A1515', 'heart', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "reports": true}', 247),

('department_head', 'Department Head', 'Leads a department', 'Leadership', '#4A1515', 'flag', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 248),

('team_lead', 'Team Lead', 'Leads a team', 'Leadership', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 249),

('squad_lead', 'Squad Lead', 'Leads a small squad', 'Leadership', '#4A1515', 'user', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true}', 250),

('chapter_lead', 'Chapter Lead', 'Leads a chapter', 'Leadership', '#4A1515', 'book-open', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "reports": true}', 251),

('tribe_lead', 'Tribe Lead', 'Leads a tribe', 'Leadership', '#4A1515', 'globe', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true}', 252),

('general_manager', 'General Manager', 'Manages overall operations', 'Leadership', '#4A1515', 'briefcase', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true, "settings": true}', 253),

('executive_director', 'Executive Director', 'Executive leadership role', 'Leadership', '#4A1515', 'award', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true,
  "can_manage_roles": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "calendar": true, "reports": true}', 254)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: TECHNOLOGY (25 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('cto', 'Chief Technology Officer', 'Executive technology leadership', 'Technology', '#4A1515', 'cpu', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true,
  "can_manage_roles": true,
  "can_manage_agency_settings": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 260),

('vp_engineering', 'VP of Engineering', 'Vice president of engineering', 'Technology', '#4A1515', 'code', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_team": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 261),

('engineering_manager', 'Engineering Manager', 'Manages engineering team', 'Technology', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_manage_team": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 262),

('senior_developer', 'Senior Developer', 'Senior software developer', 'Technology', '#4A1515', 'terminal', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 263),

('junior_developer', 'Junior Developer', 'Junior software developer', 'Technology', '#4A1515', 'code', '{
  "can_view_dashboard": true,
  "can_access_api": true
}', '{"dashboard": true}', 264),

('full_stack_developer', 'Full Stack Developer', 'Full stack software developer', 'Technology', '#4A1515', 'layers', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 265),

('frontend_developer', 'Frontend Developer', 'Frontend web developer', 'Technology', '#4A1515', 'monitor', '{
  "can_view_dashboard": true,
  "can_view_forms": true,
  "can_access_api": true
}', '{"dashboard": true, "forms": true}', 266),

('backend_developer', 'Backend Developer', 'Backend software developer', 'Technology', '#4A1515', 'server', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 267),

('devops_engineer', 'DevOps Engineer', 'DevOps and infrastructure engineer', 'Technology', '#4A1515', 'git-branch', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "reports": true, "settings": true}', 268),

('sre_engineer', 'Site Reliability Engineer', 'Ensures system reliability', 'Technology', '#4A1515', 'activity', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "reports": true, "settings": true}', 269),

('qa_engineer', 'QA Engineer', 'Quality assurance engineer', 'Technology', '#4A1515', 'check-circle', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_forms": true,
  "can_view_reports": true
}', '{"dashboard": true, "leads": true, "contacts": true, "forms": true, "reports": true}', 270),

('test_automation', 'Test Automation Engineer', 'Automates testing processes', 'Technology', '#4A1515', 'play', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true
}', '{"dashboard": true, "reports": true}', 271),

('security_engineer', 'Security Engineer', 'Application and infrastructure security', 'Technology', '#4A1515', 'shield', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "reports": true, "settings": true}', 272),

('data_engineer', 'Data Engineer', 'Builds data pipelines', 'Technology', '#4A1515', 'database', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_import_data": true,
  "can_access_api": true
}', '{"dashboard": true, "leads": true, "contacts": true, "reports": true}', 273),

('ml_engineer', 'Machine Learning Engineer', 'Builds ML models', 'Technology', '#4A1515', 'cpu', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_access_api": true
}', '{"dashboard": true, "reports": true}', 274),

('ai_specialist', 'AI Specialist', 'Artificial intelligence specialist', 'Technology', '#4A1515', 'zap', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_access_api": true,
  "can_view_second_brain": true,
  "can_manage_second_brain": true
}', '{"dashboard": true, "reports": true, "second_brain": true}', 275),

('mobile_developer', 'Mobile Developer', 'Mobile app developer', 'Technology', '#4A1515', 'smartphone', '{
  "can_view_dashboard": true,
  "can_access_api": true
}', '{"dashboard": true}', 276),

('ios_developer', 'iOS Developer', 'iOS app developer', 'Technology', '#4A1515', 'smartphone', '{
  "can_view_dashboard": true,
  "can_access_api": true
}', '{"dashboard": true}', 277),

('android_developer', 'Android Developer', 'Android app developer', 'Technology', '#4A1515', 'smartphone', '{
  "can_view_dashboard": true,
  "can_access_api": true
}', '{"dashboard": true}', 278),

('cloud_architect', 'Cloud Architect', 'Designs cloud infrastructure', 'Technology', '#4A1515', 'cloud', '{
  "can_view_dashboard": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true,
  "can_manage_agency_settings": true
}', '{"dashboard": true, "reports": true, "settings": true}', 279),

('solutions_architect', 'Solutions Architect', 'Designs technical solutions', 'Technology', '#4A1515', 'git-merge', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_opportunities": true,
  "can_view_reports": true,
  "can_access_api": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "leads": true, "contacts": true, "opportunities": true, "reports": true, "settings": true}', 280),

('technical_writer', 'Technical Writer', 'Creates technical documentation', 'Technology', '#4A1515', 'file-text', '{
  "can_view_dashboard": true,
  "can_view_second_brain": true,
  "can_manage_second_brain": true
}', '{"dashboard": true, "second_brain": true}', 281),

('scrum_master', 'Scrum Master', 'Facilitates agile processes', 'Technology', '#4A1515', 'refresh-cw', '{
  "can_view_dashboard": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "calendar": true, "reports": true}', 282),

('product_owner', 'Product Owner', 'Owns product backlog', 'Technology', '#4A1515', 'package', '{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true,
  "can_view_forms": true
}', '{"dashboard": true, "leads": true, "contacts": true, "reports": true, "forms": true}', 283),

('agile_coach', 'Agile Coach', 'Coaches agile practices', 'Technology', '#4A1515', 'compass', '{
  "can_view_dashboard": true,
  "can_view_activities": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "calendar": true, "reports": true}', 284)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CATEGORY: SUPPORT (15 roles)
-- ============================================
INSERT INTO role_templates (name, display_name, description, category, color, icon, permissions, section_access, position) VALUES

('support_team_lead', 'Support Team Lead', 'Leads support team', 'Support', '#4A1515', 'users', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_reports": true,
  "can_manage_team": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 300),

('tier_1_support', 'Tier 1 Support', 'First-level support', 'Support', '#4A1515', 'headphones', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 301),

('tier_2_support', 'Tier 2 Support', 'Second-level support', 'Support', '#4A1515', 'tool', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true
}', '{"dashboard": true, "contacts": true}', 302),

('tier_3_support', 'Tier 3 Support', 'Third-level escalation support', 'Support', '#4A1515', 'shield', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 303),

('chat_support', 'Chat Support Agent', 'Handles live chat support', 'Support', '#4A1515', 'message-circle', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 304),

('phone_support', 'Phone Support Agent', 'Handles phone support', 'Support', '#4A1515', 'phone', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 305),

('email_support', 'Email Support Agent', 'Handles email support', 'Support', '#4A1515', 'mail', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_create_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true
}', '{"dashboard": true, "contacts": true}', 306),

('knowledge_base_manager', 'Knowledge Base Manager', 'Manages knowledge base content', 'Support', '#4A1515', 'book', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_second_brain": true,
  "can_manage_second_brain": true
}', '{"dashboard": true, "second_brain": true}', 307),

('support_quality_analyst', 'Support Quality Analyst', 'Analyzes support quality', 'Support', '#4A1515', 'bar-chart', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_export_data": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 308),

('support_trainer', 'Support Trainer', 'Trains support team', 'Support', '#4A1515', 'book-open', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_reports": true,
  "can_view_second_brain": true,
  "can_manage_second_brain": true
}', '{"dashboard": true, "contacts": true, "reports": true, "second_brain": true}', 309),

('support_operations', 'Support Operations', 'Manages support operations', 'Support', '#4A1515', 'settings', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_reports": true,
  "can_export_data": true,
  "can_manage_integrations": true
}', '{"dashboard": true, "contacts": true, "workflows": true, "reports": true, "settings": true}', 310),

('customer_advocate', 'Customer Advocate', 'Advocates for customer needs', 'Support', '#4A1515', 'heart', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 311),

('escalation_specialist', 'Escalation Specialist', 'Handles escalated issues', 'Support', '#4A1515', 'alert-circle', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true,
  "can_view_reports": true
}', '{"dashboard": true, "contacts": true, "reports": true}', 312),

('support_scheduler', 'Support Scheduler', 'Schedules support coverage', 'Support', '#4A1515', 'calendar', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_calendar": true,
  "can_manage_calendar": true,
  "can_view_activities": true
}', '{"dashboard": true, "calendar": true}', 313),

('support_dispatcher', 'Support Dispatcher', 'Routes support tickets', 'Support', '#4A1515', 'send', '{
  "can_view_dashboard": true,
  "can_view_contacts": true,
  "can_view_activities": true,
  "can_create_activities": true,
  "can_edit_activities": true
}', '{"dashboard": true, "contacts": true}', 314)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFY: Count total role templates
-- ============================================
-- SELECT category, COUNT(*) as count FROM role_templates GROUP BY category ORDER BY category;
-- Expected: ~200+ roles across 10 categories

-- ============================================
-- COMPLETE: 200+ role templates seeded
-- ============================================
