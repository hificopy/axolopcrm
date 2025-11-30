-- Initialize Axolop CRM Database
-- This script is automatically run when Docker PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Database is already created by docker-compose (POSTGRES_DB)
-- This file is for any additional initialization

-- Create custom types or functions here if needed

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Axolop CRM database initialized successfully';
END $$;
