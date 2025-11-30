# Correct Agency System Deployment Order 🚀

## The Right Way: Fix Root Cause First

Instead of working around missing tables, let's deploy everything properly.

---

## Step 1: Deploy Complete CRM Schema ✅

**File:** `backend/db/complete-crm-schema.sql`

**What it creates:**
- ✅ Core CRM: leads, contacts, opportunities
- ✅ Email System: emails, email_campaigns, email_templates
- ✅ Forms: forms, form_submissions
- ✅ Workflows: workflows, workflow_executions
- ✅ Calendar: calendar_events
- ✅ Tasks: tasks
- ✅ Activities: activities, notes
- ✅ Pipelines: pipelines, custom_fields
- ✅ Booking: booking_links

**How to deploy:**
1. Open Supabase SQL Editor
2. Copy entire `backend/db/complete-crm-schema.sql`
3. Paste and run
4. Wait for completion (30-60 seconds)
5. Verify success message: ✅ COMPLETE CRM SCHEMA DEPLOYED!

---

## Step 2: Deploy Agency System Schema ✅

**File:** `backend/db/complete-schema.sql`

**What it creates:**
- ✅ users table
- ✅ user_settings table
- ✅ agencies table
- ✅ agency_members table
- ✅ user_agency_preferences table
- ✅ RPC functions (get_user_agencies, set_current_agency, etc.)

**How to deploy:**
1. In Supabase SQL Editor (new query)
2. Copy entire `backend/db/complete-schema.sql`
3. Paste and run
4. Verify success message

---

## Step 3: Deploy Full Agency Migration ✅

**File:** `backend/db/add-agency-id-migration.sql` (the original full one)

**What it does:**
- Adds `agency_id` column to ALL 16 CRM tables
- Creates indexes for performance
- Updates RLS policies for agency-based data isolation
- Creates helper function

**Tables that will get agency_id:**
1. leads
2. contacts
3. opportunities
4. forms
5. form_submissions
6. workflows
7. workflow_executions
8. email_campaigns
9. email_templates
10. calendar_events
11. tasks
12. notes
13. activities
14. pipelines
15. custom_fields
16. booking_links

**How to deploy:**
1. In Supabase SQL Editor (new query)
2. Copy entire `backend/db/add-agency-id-migration.sql`
3. Paste and run
4. Wait for completion (30-60 seconds)
5. Verify success message: ✅ AGENCY_ID MIGRATION COMPLETE!

---

## Step 4: Verify Deployment ✅

Run this query in Supabase to verify all tables exist with agency_id:

```sql
SELECT
  table_name,
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = t.table_name
    AND column_name = 'agency_id'
  ) as has_agency_id
FROM (
  VALUES
    ('leads'),
    ('contacts'),
    ('opportunities'),
    ('forms'),
    ('form_submissions'),
    ('workflows'),
    ('workflow_executions'),
    ('email_campaigns'),
    ('email_templates'),
    ('calendar_events'),
    ('tasks'),
    ('notes'),
    ('activities'),
    ('pipelines'),
    ('custom_fields'),
    ('booking_links')
) as t(table_name)
ORDER BY table_name;
```

Expected result: All tables should show `has_agency_id = true`

---

## Summary

**What we're doing:**
1. ✅ Create all CRM tables (Step 1)
2. ✅ Create agency system tables (Step 2)
3. ✅ Add agency_id to all CRM tables (Step 3)
4. ✅ Verify everything worked (Step 4)

**After completion:**
- All CRM data will be isolated by agency
- Users can switch agencies and see different data
- RLS policies enforce agency boundaries
- Ready for backend API updates

---

## Next Steps (After Database is Ready)

### Phase 1: Backend Updates
- Update all API endpoints to include `agency_id`
- Update all service functions to filter by `agency_id`
- Test API endpoints with Postman/curl

### Phase 2: Frontend Updates
- Update API calls to include `currentAgency.id`
- Test agency switching
- Verify data isolation in UI

### Phase 3: Data Migration
- Assign existing records to default agency
- Handle NULL agency_id in queries (if any)

### Phase 4: Testing
- Create multiple test agencies
- Add test data to each
- Switch agencies and verify isolation
- Test member roles and permissions

---

## Troubleshooting

**If Step 1 fails:**
- Check for existing tables with different schemas
- Drop conflicting tables if safe to do so
- Or modify script to use `CREATE TABLE IF NOT EXISTS`

**If Step 2 fails:**
- Check if users table already exists from auth
- Check if agency tables already exist
- Script should handle this with `IF NOT EXISTS`

**If Step 3 fails:**
- Verify Step 1 completed successfully
- Check that all 16 tables exist
- Check that agencies table exists

---

**Ready to deploy?** Start with Step 1! 🚀

**Estimated time:** 5-10 minutes total
**Difficulty:** Easy (just copy/paste SQL)
**Risk:** Low (can be rolled back if needed)
