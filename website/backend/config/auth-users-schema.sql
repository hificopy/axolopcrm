-- ========================================
-- AUTH USERS TABLE DEFINITION
-- ========================================
-- This file defines the auth.users table that is referenced throughout the schema
-- Fixes the missing auth.users table issue

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);