# Agency Migration Issue - FIXED ✅

## Problem

The original `add-agency-id-migration.sql` script tried to add `agency_id` columns to tables that don't exist in your Supabase database yet:

```
❌ form_submissions - doesn't exist (needs forms-schema.sql deployed first)
❌ workflows - doesn't exist (needs workflow-schema.sql deployed first)
❌ workflow_executions - doesn't exist
❌ email_campaigns - doesn't exist (needs email-workflow-schema.sql)
❌ email_templates - doesn't exist
❌ calendar_events - doesn't exist (needs calendar-schema.sql)
❌ tasks - doesn't exist (needs tasks-schema.sql)
❌ notes - doesn't exist
❌ activities - doesn't exist
❌ pipelines - doesn't exist
❌ custom_fields - doesn't exist
❌ booking_links - doesn't exist (needs booking-links-schema.sql)
```

## Solution

Created **ultra-minimal migration** for only the tables that definitely exist:

### 1. Minimal Migration (Deploy Now) ✅

**File:** `backend/db/add-agency-id-minimal-migration.sql`

**What it does:**
- Adds `agency_id` ONLY to the 3 core tables that exist in your database
- Updates RLS policies for agency-based data isolation
- Creates helper function `get_user_current_agency()`

**Tables included (ONLY 3):**
- ✅ leads
- ✅ contacts
- ✅ opportunities

**Deploy this now:**
1. Open Supabase SQL Editor
2. Copy contents of `backend/db/add-agency-id-minimal-migration.sql`
3. Paste and run
4. Verify success message

**Why so minimal?**
Your database only has leads, contacts, and opportunities tables deployed. Other tables like `emails`, `forms`, `workflows` need their schemas deployed first.

### 2. Feature-Specific Migrations (Deploy Later)

For optional features like forms, workflows, calendar, you need to:

**Step 1:** Deploy the feature schema first
**Step 2:** Then add agency_id to those tables

**Example for Forms:**
```bash
# Step 1: Deploy forms schema
Run backend/db/forms-schema.sql in Supabase

# Step 2: Add agency_id to forms tables
Run forms-agency-migration.sql (create this when needed)
```

## Current Database State

### ✅ Tables that EXIST in your database:
- public.leads ← Will get agency_id
- public.contacts ← Will get agency_id
- public.opportunities ← Will get agency_id

### ⏭️  Tables that DON'T EXIST (from supabase-schema.sql):
These are defined in `supabase-schema.sql` but not deployed yet:
- public.emails
- public.lead_import_presets
- public.identification_keywords
- public.gmail_tokens

### ⏭️  Tables that DON'T EXIST YET:
These need their schemas deployed first:

**Forms Feature:**
- forms (deploy `backend/db/forms-schema.sql`)
- form_submissions
- form_fields
- form_campaigns

**Workflows Feature:**
- workflows (deploy `backend/db/workflow-schema.sql`)
- workflow_executions
- workflow_triggers
- workflow_actions

**Email Campaigns:**
- email_campaigns (deploy `backend/db/email-workflow-schema.sql`)
- email_templates
- email_analytics

**Calendar Feature:**
- calendar_events (deploy `scripts/calendar-schema.sql`)
- calendar_availability
- calendar_presets

**Tasks Feature:**
- tasks (deploy `scripts/tasks-schema.sql`)

**Other Features:**
- notes
- activities
- pipelines
- custom_fields
- booking_links (deploy `scripts/booking-links-schema.sql`)

## Next Steps

### Immediate (Do This Now):

1. **Deploy minimal migration:**
   ```
   Run: backend/db/add-agency-id-minimal-migration.sql
   ```

2. **Update backend API endpoints:**
   - Lead routes (leadService.js, routes/leads.js)
   - Contact routes (contactService.js, routes/contacts.js)
   - Opportunity routes (opportunityService.js, routes/opportunities.js)
   - Add `agency_id` to INSERT queries
   - Add `agency_id` filter to SELECT queries

3. **Test agency isolation:**
   - Create two agencies
   - Add test data to each
   - Switch agencies and verify data isolation

### Later (Expand Your Database):

4. **Deploy additional schemas:**
   ```
   Run: supabase-schema.sql (for emails, lead_import_presets, etc.)
   ```

5. **Deploy feature schemas as needed:**
   - forms-schema.sql
   - workflow-schema.sql
   - calendar-schema.sql
   - etc.

6. **Add agency_id to those tables** with separate migrations

### Later (When Deploying Features):

When you want to enable a feature like Forms:

1. Deploy the feature schema (e.g., `forms-schema.sql`)
2. Create agency migration for that feature
3. Update API endpoints for that feature
4. Test agency isolation for that feature

## Example API Update

### Before (User-based):
```javascript
// OLD: Filter by user_id only
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('user_id', userId);
```

### After (Agency-based):
```javascript
// NEW: Filter by agency_id instead
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('agency_id', currentAgency.id);
```

## Testing Checklist

After deploying core migration:

- [ ] Can create agencies
- [ ] Can switch between agencies
- [ ] Leads are filtered by agency
- [ ] Contacts are filtered by agency
- [ ] Opportunities are filtered by agency
- [ ] Emails are filtered by agency
- [ ] Creating new records requires agency_id
- [ ] Cannot see other agency's data
- [ ] RLS policies enforce agency boundaries

## Important Notes

1. **Backward Compatibility:** Existing records will have `NULL` agency_id. You need to:
   - Assign existing records to a default agency, OR
   - Handle NULL agency_id in your queries

2. **New Records:** All new records MUST include `agency_id` or they'll be rejected by RLS policies.

3. **God Mode:** The user `axolopcrm@gmail.com` should bypass agency restrictions in your frontend code.

---

**Status:** ✅ Ready to deploy core migration
**Created:** 2025-11-24
**Next Action:** Run `add-agency-id-core-migration.sql` in Supabase
