# Database Documentation

This directory contains documentation about the database architecture and configuration.

## Contents

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete Supabase PostgreSQL schema documentation (direct client, no ORM)
- **[SUPABASE_CONFIGURATION.md](./SUPABASE_CONFIGURATION.md)** - Direct Supabase configuration (no ORM used)
- **[PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md)** - Database port assignments

## Database Philosophy

The CRM uses a dual-database approach:
- **Supabase PostgreSQL** - Primary data store for structured CRM data
- **ChromaDB** - Vector database for AI/ML features

Key principles:
- Row Level Security for data isolation
- OAuth integration with Auth0
- Direct Supabase client for type-safe queries (no ORM used)
- Connection pooling for performance