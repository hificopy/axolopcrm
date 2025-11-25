-- ========================================
-- AXOLOP CRM - DATABASE SCHEMA FIXES
-- ========================================
-- This file adds missing tables and columns to align with backend services
-- Run this in Supabase SQL Editor AFTER running supabase-complete-setup.sql
-- ========================================

-- ========================================
-- 1. CREATE USERS TABLE FOR AUTHENTICATION
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_picture TEXT,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. CREATE PIPELINE_STAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    color VARCHAR(7) DEFAULT '#4C7FFF',
    pipeline_type VARCHAR(50) DEFAULT 'SALES',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. CREATE USER_PROFILES TABLE (ALTERNATIVE TO USERS)
-- ========================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. ADD MISSING COLUMNS TO LEADS TABLE
-- ========================================

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'leads' AND column_name = 'user_id') THEN
        ALTER TABLE leads ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_leads_user_id ON leads(user_id);
    END IF;
END $$;

-- Add stage column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'leads' AND column_name = 'stage') THEN
        ALTER TABLE leads ADD COLUMN stage VARCHAR(50);
    END IF;
END $$;

-- Add owner_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'leads' AND column_name = 'owner_id') THEN
        ALTER TABLE leads ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ========================================
-- 5. ADD MISSING COLUMNS TO CONTACTS TABLE
-- ========================================

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'contacts' AND column_name = 'user_id') THEN
        ALTER TABLE contacts ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_contacts_user_id ON contacts(user_id);
    END IF;
END $$;

-- Add lead_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'contacts' AND column_name = 'lead_id') THEN
        ALTER TABLE contacts ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
        CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
    END IF;
END $$;

-- Add is_primary_contact column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'contacts' AND column_name = 'is_primary_contact') THEN
        ALTER TABLE contacts ADD COLUMN is_primary_contact BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ========================================
-- 6. ADD MISSING COLUMNS TO OPPORTUNITIES TABLE
-- ========================================

-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'opportunities' AND column_name = 'user_id') THEN
        ALTER TABLE opportunities ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX idx_opportunities_user_id ON opportunities(user_id);
    END IF;
END $$;

-- Add contact_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'opportunities' AND column_name = 'contact_id') THEN
        ALTER TABLE opportunities ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ========================================
-- 7. CREATE TRIGGERS FOR NEW TABLES
-- ========================================

-- Trigger for users table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger for user_profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger for pipeline_stages table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pipeline_stages_updated_at') THEN
        CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ========================================
-- 8. ENABLE RLS ON NEW TABLES
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. CREATE RLS POLICIES FOR NEW TABLES
-- ========================================

-- Users table policies
DROP POLICY IF EXISTS "Allow all for service role" ON users;
CREATE POLICY "Allow all for service role" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- User profiles table policies
DROP POLICY IF EXISTS "Allow all for service role" ON user_profiles;
CREATE POLICY "Allow all for service role" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Pipeline stages table policies
DROP POLICY IF EXISTS "Allow all for service role" ON pipeline_stages;
CREATE POLICY "Allow all for service role" ON pipeline_stages
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 10. INSERT DEFAULT PIPELINE STAGES
-- ========================================

INSERT INTO pipeline_stages (name, description, order_index, color, pipeline_type) VALUES
    ('New', 'Newly created leads', 1, '#4C7FFF', 'SALES'),
    ('Contacted', 'Initial contact made', 2, '#00D084', 'SALES'),
    ('Qualified', 'Lead has been qualified', 3, '#FFB800', 'SALES'),
    ('Proposal', 'Proposal sent', 4, '#FF6B6B', 'SALES'),
    ('Negotiation', 'In negotiation', 5, '#9C27B0', 'SALES'),
    ('Closed Won', 'Deal closed successfully', 6, '#4CAF50', 'SALES'),
    ('Closed Lost', 'Deal lost', 7, '#757575', 'SALES')
ON CONFLICT DO NOTHING;

-- ========================================
-- FIXES COMPLETE!
-- ========================================
-- All missing tables, columns, triggers, and policies created successfully.
-- Your database schema now matches what the backend services expect!
-- ========================================
