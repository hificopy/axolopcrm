# Database Documentation

**Last Updated**: 2025-01-24  
**Version**: 1.0  
**Database**: PostgreSQL via Supabase

---

## 📊 Database Overview

Axolop CRM uses PostgreSQL as the primary database, hosted through Supabase. The database implements a multi-tenant architecture with complete data isolation between agencies.

### Key Architecture Features

- **Multi-Tenant Design** - Each agency's data is completely isolated
- **Row Level Security (RLS)** - Database-enforced access control
- **User Isolation** - Users can only access their own agency's data
- **Audit Trail** - Complete tracking of data changes
- **Soft Deletes** - Data recovery capabilities

---

## 📁 Documentation Contents

### Core Documentation

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete Supabase PostgreSQL schema documentation
- **[SCHEMA.md](./SCHEMA.md)** - Updated comprehensive schema documentation
- **[SUPABASE_CONFIGURATION.md](./SUPABASE_CONFIGURATION.md)** - Supabase configuration details
- **[MIGRATIONS.md](./MIGRATIONS.md)** - Database migration system

### Architecture & Security

- **[USER_ISOLATION.md](./USER_ISOLATION.md)** - Multi-tenant data isolation
- **[SECURITY.md](./SECURITY.md)** - Database security implementation
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Database optimization and indexing

---

## 🏗️ Database Philosophy

The CRM uses a dual-database approach:

- **Supabase PostgreSQL** - Primary data store for structured CRM data
- **ChromaDB** - Vector database for AI/ML features

### Key Principles

- **Row Level Security** for data isolation between agencies
- **Direct Supabase Client** for type-safe queries (no ORM used)
- **Connection Pooling** for performance optimization
- **Multi-Tenant Architecture** for agency data separation
- **Audit Logging** for complete data change tracking

---

## 🚀 Quick Start

### Development Setup

```bash
# Start local Supabase
npm run supabase:start

# Apply migrations
npm run deploy:schema

# Seed test data
npm run seed
```

### Database Connection

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);
```

---

## 📊 Schema Overview

### Core Tables

- **`users`** - User accounts and authentication
- **`agencies`** - Agency/organization management
- **`agency_members`** - User-agency relationships
- **`contacts`** - Contact and lead management
- **`opportunities`** - Sales pipeline tracking
- **`activities`** - Activity tracking and history

### Marketing Tables

- **`forms`** - Form builder and management
- **`form_submissions`** - Form submission data
- **`email_campaigns`** - Email marketing campaigns
- **`contact_lists`** - Email list management

### Customization Tables

- **`custom_fields`** - Dynamic field definitions
- **`custom_field_values`** - Custom field data storage

### System Tables

- **`user_preferences`** - User settings and preferences
- **`agency_settings`** - Agency-wide configuration

---

## 🔒 Security Features

### Row Level Security (RLS)

All tables implement RLS policies:

- **Agency Isolation** - Users only see their agency's data
- **Role-Based Access** - Different permissions by user role
- **Data Privacy** - Complete separation between agencies

### Access Control

- **User Authentication** via Supabase Auth
- **JWT Tokens** for API access
- **Permission Middleware** in backend
- **Database-Level Security** with RLS policies

---

## 📈 Performance Optimization

### Indexing Strategy

- **Primary Indexes** on all primary keys
- **Foreign Key Indexes** on all relationships
- **Query Optimization** for common access patterns
- **Partial Indexes** for filtered queries

### Connection Management

- **Connection Pooling** via Supabase
- **Query Caching** with Redis
- **Read Replicas** (planned for scaling)

---

## 🔄 Migration System

### Migration Files

Database migrations are stored in `/backend/db/migrations/`:

- `001_create_users_schema.sql` - User management tables
- `002_create_crm_schema.sql` - Core CRM tables
- `003_create_marketing_schema.sql` - Marketing tables
- `004_create_custom_fields_schema.sql` - Custom field system
- `005_create_agency_schema.sql` - Multi-tenant architecture

### Migration Commands

```bash
# Apply all migrations
npm run deploy:schema

# Apply specific migration
npm run deploy:schema -- --migration=003_create_marketing_schema.sql

# Rollback migration
npm run rollback:schema -- --migration=003_create_marketing_schema.sql
```

---

## 🧪 Testing & Development

### Test Database

- **Separate Test Environment** - Isolated test database
- **Seed Data** - Automated test data generation
- **Cleanup Procedures** - Automatic test data cleanup

### Development Workflow

1. **Local Development** - Use Supabase local development
2. **Migration Testing** - Test migrations on production copy
3. **Performance Testing** - Load testing with realistic data
4. **Security Testing** - Verify RLS policies

---

## 📚 Related Documentation

- [Authentication System](../authentication/AUTH_SYSTEM_STATUS.md) - User authentication
- [User Hierarchy](../authentication/USER_HIERARCHY.md) - User roles and permissions
- [API Documentation](../api/API_COMPLETE_REFERENCE.md) - Database API endpoints
- [Implementation Status](../implementation/IMPLEMENTATION_STATUS.md) - Current implementation state

---

## 🆘 Troubleshooting

### Common Issues

- **RLS Policy Errors** - Check user agency membership
- **Connection Issues** - Verify Supabase configuration
- **Migration Failures** - Check for syntax errors
- **Performance Issues** - Review query plans and indexes

### Debug Queries

```sql
-- Check user agency access
SELECT * FROM agency_members
WHERE user_id = auth.uid() AND status = 'active';

-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'contacts';

-- Analyze slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

**Last Updated**: 2025-01-24  
**Next Review**: 2025-02-24  
**Maintainer**: Development Team  
**Schema Version**: 1.0
