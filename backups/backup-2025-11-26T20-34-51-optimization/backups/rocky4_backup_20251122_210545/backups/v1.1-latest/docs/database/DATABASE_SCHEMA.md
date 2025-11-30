# Database Schema for Axolop CRM

## Overview

The Axolop CRM database is designed to support all three main categories (Sales, Marketing, Service) with a unified, interconnected structure. The schema is implemented directly in Supabase PostgreSQL (no ORM used) and supports all Close CRM-like functionality while adding advanced features for email marketing, forms, automation, and more.

## Database Design Principles

1. **Unified Entity System**: All entities (Leads, Contacts, Deals) can be interconnected regardless of category
2. **Polymorphic Relations**: Generic relationship patterns using entity types and IDs
3. **Category-Agnostic**: Common functionality shared across Sales, Marketing, and Service categories
4. **Extensible**: Easy to add new entity types and relationships
5. **Supabase Native**: Built with Supabase Row Level Security (RLS) in mind

## Core Tables

### Users Table
```sql
-- Table for system users with roles and permissions
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'admin', 'user', 'manager'
  permissions JSONB, -- Store user permissions as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Only users can view/edit their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

### Organizations Table
```sql
-- Organizations for multi-tenancy
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB, -- Custom organization settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Teams Table
```sql
-- Teams within organizations
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#4C7FFF', -- For category styling
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Memberships Table
```sql
-- User-team relationships
CREATE TABLE memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member', 'viewer'
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Entity Tables

### Leads Table
```sql
-- Primary leads table with qualification and ownership
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Basic info
  name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  
  -- Contact info
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Lead details
  source TEXT, -- 'referral', 'web', 'event', etc.
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'unqualified', 'converted'
  qualification_level TEXT DEFAULT 'cold', -- 'cold', 'warm', 'hot'
  lead_score INTEGER DEFAULT 0,
  
  -- Custom fields
  custom_fields JSONB,
  tags TEXT[],
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  converted_to_contact BOOLEAN DEFAULT FALSE,
  converted_to_deal BOOLEAN DEFAULT FALSE
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leads in their teams" ON leads
  FOR SELECT TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = leads.team_id
    ) OR auth.uid() = leads.owner_id);

CREATE POLICY "Users can insert leads in their teams" ON leads
  FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = leads.team_id
    ) OR auth.uid() = owner_id);
```

### Contacts Table
```sql
-- Detailed contact information
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Basic info
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  title TEXT,
  
  -- Contact info
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address JSONB, -- address: {street, city, state, zip, country}
  
  -- Contact preferences
  do_not_call BOOLEAN DEFAULT FALSE,
  do_not_email BOOLEAN DEFAULT FALSE,
  
  -- Custom fields
  custom_fields JSONB,
  tags TEXT[],
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  created_from_lead_id UUID REFERENCES leads(id), -- If converted from lead
  primary_deal_id UUID REFERENCES deals(id) -- Primary deal relationship
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts in their teams" ON contacts
  FOR SELECT TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = contacts.team_id
    ) OR auth.uid() = contacts.owner_id);
```

### Deals Table
```sql
-- Sales deals and opportunities
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Basic deal info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Financial info
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  
  -- Deal stages
  stage_id UUID REFERENCES pipeline_stages(id),
  pipeline_id UUID REFERENCES pipelines(id),
  status TEXT DEFAULT 'open', -- 'open', 'won', 'lost', 'abandoned'
  
  -- Dates
  close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Related entities
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES companies(id),
  
  -- Custom fields
  custom_fields JSONB,
  tags TEXT[],
  
  -- Probability and tracking
  probability INTEGER DEFAULT 10, -- 0-100%
  next_step TEXT,
  next_step_date DATE
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deals in their teams" ON deals
  FOR SELECT TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = deals.team_id
    ) OR auth.uid() = deals.owner_id);
```

## Activity and Interaction Tables

### Interactions Table
```sql
-- All interactions with entities (calls, emails, meetings, etc.)
CREATE TABLE interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Interaction details
  type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
  direction TEXT, -- 'inbound', 'outbound' (for calls/emails)
  subject TEXT,
  description TEXT,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Related entities (polymorphic)
  entity_type TEXT NOT NULL, -- 'lead', 'contact', 'deal', 'company'
  entity_id UUID NOT NULL,
  
  -- Custom fields
  custom_fields JSONB,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interactions in their teams" ON interactions
  FOR SELECT TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = interactions.team_id
    ) OR auth.uid() = interactions.owner_id);
```

### Tasks Table
```sql
-- Tasks and to-dos
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'task', -- 'task', 'followup', 'meeting', 'call', 'email'
  
  -- Status and priority
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Timing
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Assignment
  assigned_to_id UUID REFERENCES auth.users(id),
  
  -- Related entities (polymorphic)
  entity_type TEXT, -- 'lead', 'contact', 'deal', 'company' (optional)
  entity_id UUID,
  
  -- Custom fields
  custom_fields JSONB,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their teams" ON tasks
  FOR SELECT TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = tasks.team_id
    ) OR auth.uid() = tasks.owner_id OR auth.uid() = tasks.assigned_to_id);
```

### Notes Table
```sql
-- Notes for entities
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Note content
  title TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'note', -- 'note', 'reminder', 'log'
  
  -- Related entity (polymorphic)
  entity_type TEXT NOT NULL, -- 'lead', 'contact', 'deal', 'company'
  entity_id UUID NOT NULL,
  
  -- Visibility
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs client-facing
  
  -- Custom fields
  custom_fields JSONB,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes in their teams" ON notes
  FOR SELECT TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM memberships WHERE team_id = notes.team_id
    ) OR auth.uid() = notes.owner_id);
```

## Marketing and Service Tables

### Email Campaigns
```sql
-- Email marketing campaigns
CREATE TABLE email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Campaign details
  name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  
  -- Content
  content_type TEXT DEFAULT 'html', -- 'html', 'text'
  content TEXT, -- HTML or plain text content
  template_id UUID REFERENCES email_templates(id),
  
  -- Recipients
  recipient_type TEXT, -- 'list', 'segment', 'manual'
  recipient_data JSONB, -- IDs or criteria for recipients
  
  -- Timing
  send_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
  stats JSONB, -- Send statistics
  
  -- Custom fields
  custom_fields JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
```

### Forms
```sql
-- Web forms for lead capture
CREATE TABLE forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  -- Form details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'lead_capture', -- 'lead_capture', 'contact', 'survey', etc.
  
  -- Configuration
  settings JSONB, -- Form settings like redirect URL, styling, etc.
  fields JSONB, -- Form field definitions
  branding JSONB, -- Branding settings
  
  -- Webhook and automation
  webhook_url TEXT,
  automation_workflow_id UUID REFERENCES automation_workflows(id),
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  is_embedded BOOLEAN DEFAULT FALSE,
  stats JSONB, -- Submission statistics
  
  -- Custom fields
  custom_fields JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Form submissions
CREATE TABLE form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  
  -- Submission data
  data JSONB, -- Submitted form data
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  lead_created_id UUID REFERENCES leads(id), -- Created from submission
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
```

## Utility Tables

### Pipelines and Stages
```sql
-- Sales pipelines
CREATE TABLE pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'sales', -- 'sales', 'marketing', 'service'
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline stages
CREATE TABLE pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  probability INTEGER DEFAULT 10, -- 0-100%
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
```

### Smart Views
```sql
-- Saved filters and views
CREATE TABLE smart_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL, -- 'lead', 'contact', 'deal', etc.
  filters JSONB, -- Filter criteria
  sort JSONB, -- Sort configuration
  columns JSONB, -- Visible columns
  
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with_team_id UUID REFERENCES teams(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE smart_views ENABLE ROW LEVEL SECURITY;
```

### Activity Log (for audit trail)
```sql
-- System activity log for audit trail
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', etc.
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
```

## Key Features Implemented

1. **Row Level Security**: All tables have RLS policies to ensure users only see data they should have access to
2. **Polymorphic Relations**: The `entity_type` + `entity_id` pattern allows flexible relationships
3. **JSONB for Extensibility**: Custom fields and settings stored as JSONB for flexibility
4. **Organization Multi-tenancy**: All records belong to organizations for multi-tenant support
5. **Team-based Access**: Users can be organized into teams with different permissions
6. **Audit Trail**: Activity log table tracks all important changes

## Indexes for Performance

```sql
-- Common indexes for performance
CREATE INDEX idx_leads_owner ON leads(owner_id);
CREATE INDEX idx_leads_team ON leads(team_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);

CREATE INDEX idx_contacts_owner ON contacts(owner_id);
CREATE INDEX idx_contacts_team ON contacts(team_id);
CREATE INDEX idx_contacts_email ON contacts(email);

CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_team ON deals(team_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_pipeline ON deals(pipeline_id);

CREATE INDEX idx_interactions_owner ON interactions(owner_id);
CREATE INDEX idx_interactions_team ON interactions(team_id);
CREATE INDEX idx_interactions_entity ON interactions(entity_type, entity_id);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);

-- Full-text search indexes where needed
CREATE INDEX idx_leads_name_gin ON leads USING gin(to_tsvector('english', name));
CREATE INDEX idx_contacts_name_gin ON contacts USING gin(to_tsvector('english', first_name || ' ' || last_name));
```

## Migration Notes

- Schema is managed directly through Supabase dashboard SQL editor
- No Prisma migrations used - all changes done via raw SQL
- Use Supabase's migration feature if needed for version control
- Always test RLS policies after schema changes