# Supabase Configuration for Axolop CRM

## Overview

This document outlines how to configure Supabase for the Axolop CRM project using direct Supabase client (no ORM used). This system replaces iClosed, HubSpot, and Close CRM with a unified platform optimized for Axolop (ECOMMERCE, B2B BUSINESS, REAL ESTATE) business operations.

## Architecture

### Primary Database: Supabase PostgreSQL
- **Purpose**: Main CRM data storage (leads, contacts, deals, activities)
- **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, etc.) integrated with Auth0 as external identity provider
- **Database Access**: Direct Supabase client (no ORM used)
- **Features**: ACID transactions, complex queries, real-time subscriptions

### Authentication & Security
- **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, etc.) and integration with Auth0 as external provider
- **Database Security**: Supabase Row Level Security (RLS) policies
- **Token Management**: JWT-based with refresh tokens

## Setup Process

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and API keys
4. Configure authentication providers (Google, GitHub, etc.)

### 2. Environment Configuration
```env
# Database Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# For backend
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase Dashboard Configuration
1. Go to your Supabase project dashboard
2. Navigate to Database → SQL Editor
3. Run the CRM schema SQL to create tables
4. Configure Row Level Security (RLS) for each table

### 4. Configure Database Connection (Direct Supabase Client)
```javascript
// No Prisma used - using direct Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

## Database Schema Setup

Since we're using direct Supabase client (no Prisma), database schema is managed through:

1. **Supabase Dashboard**: Use the SQL Editor to create and modify tables
2. **SQL Scripts**: Create schema using raw SQL
3. **Real-time API**: For real-time data synchronization

### Example Table Creation
```sql
-- Example: Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own leads" ON leads
  FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);
```

## Authentication Setup

### Supabase Auth Configuration
1. Go to Authentication → Settings in Supabase dashboard
2. Configure OAuth providers (Google, GitHub, etc.)
3. Set redirect URLs for your application
4. Configure email templates if using email auth

### Example Auth Usage
```javascript
// Sign in with email and password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign in with OAuth provider
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin
  }
});
```

## Row Level Security (RLS)

### Enable RLS
```sql
-- Enable RLS on a table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### Create Security Policies
```sql
-- Users can only access their own records
CREATE POLICY "Users can view own leads" ON leads
  FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can update own leads" ON leads
  FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);
```

## Direct Supabase Client Usage

### Example Queries
```javascript
// Get user's leads
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('owner_id', currentUser.id);

// Insert a new lead
const { data, error } = await supabase
  .from('leads')
  .insert([{
    name: 'John Doe',
    email: 'john@example.com',
    owner_id: currentUser.id
  }]);

// Real-time subscription
const mySubscription = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'leads',
    },
    (payload) => {
      console.log('New lead created!', payload)
    }
  )
  .subscribe()
```

## Troubleshooting

### Common Issues

#### Issue: "Invalid API key"
**Cause**: Incorrect API keys in environment variables
**Solution**: 
1. Verify keys in Supabase dashboard → Project Settings → API
2. Check environment variables are properly loaded

#### Issue: "Auth session not found"
**Cause**: Authentication token expired or missing
**Solution**:
1. Ensure auth flow is properly implemented
2. Check for auto-refresh configuration

#### Issue: "RLS policies blocking access"
**Cause**: Row Level Security is enabled but policies are too strict
**Solution**:
1. Check policies in Supabase dashboard → Database → Policies  
2. Verify user ID matches record owner ID
3. Ensure user is properly authenticated

### Health Checks
```bash
# Verify Supabase connection
curl -H "apikey: YOUR_ANON_KEY" -H "Authorization: Bearer YOUR_ANON_KEY" YOUR_PROJECT.supabase.co/rest/v1/leads?select=*

# Check auth status
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." YOUR_PROJECT.supabase.co/auth/v1/user
```

## Security Best Practices

1. **Always use RLS**: Enable Row Level Security on all tables
2. **Minimal permissions**: Only grant necessary access
3. **Secure environment**: Never expose service role keys to frontend
4. **Validate inputs**: Always validate data on insert/update
5. **Audit access**: Monitor who has access to your Supabase project

## Migration from Other Systems

### If migrating from Prisma-based setup:
- Schema definitions need to be recreated in Supabase dashboard
- ORM queries need to be converted to direct Supabase client queries
- Migrations need to be applied manually through SQL

## Resources

- **Supabase Documentation:** https://supabase.com/docs
- **Authentication Guide:** https://supabase.com/docs/guides/auth
- **Database Guide:** https://supabase.com/docs/guides/database
- **Real-time Guide:** https://supabase.com/docs/guides/realtime