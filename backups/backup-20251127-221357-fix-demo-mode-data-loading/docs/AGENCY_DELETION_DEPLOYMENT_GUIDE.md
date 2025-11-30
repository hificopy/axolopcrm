# Agency Deletion Cleanup - Manual Deployment Guide

## Overview

This guide will help you manually deploy the enhanced agency deletion functionality to your Supabase database.

## Prerequisites

- Access to your Supabase dashboard
- Database SQL editor permissions

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project (fuclpfhitgwugxogxkmw)
3. Navigate to the **SQL Editor** in the left sidebar

## Step 2: Execute the Migration SQL

1. Click on **New query** in the SQL Editor
2. Copy the entire contents of `scripts/agency-deletion-cleanup.sql`
3. Paste the SQL into the editor
4. Click **Run** to execute the migration

## Step 3: Verify Deployment

After running the migration, you should see output indicating that:

- 5 new functions were created
- 3 new indexes were created
- Any existing functions were updated

## Step 4: Test the Deployment

Run the test script to verify everything works:

```bash
node scripts/test-agency-deletion.js
```

You should see all tests passing with a 100% success rate.

## What Gets Deployed

### Database Functions

1. **cleanup_agency_on_delete()** - Comprehensive cleanup when agency is deleted
2. **delete_agency_complete()** - Enhanced deletion with validation and cleanup
3. **get_user_agencies_enhanced()** - Filters out deleted agencies
4. **validate_agency_access()** - Validates user access with detailed errors
5. **log_agency_deletion()** - Audit logging for deletions

### Database Indexes

1. **idx_agencies_deleted_at** - Improves queries filtering by deleted_at
2. **idx_agencies_active_not_deleted** - Optimizes active agency queries
3. **idx_user_agency_preferences_current_agency** - Speeds up preference queries

### Backend Changes

- Enhanced agency deletion endpoint in `backend/routes/agencies.js`
- Improved agency validation and filtering
- Better error handling and logging

### Frontend Changes

- Enhanced deletion logic in `frontend/context/AgencyContext.jsx`
- Optimistic state updates with rollback on error
- Improved user preference handling

## Troubleshooting

### If Functions Already Exist

The migration includes `DROP FUNCTION IF EXISTS` statements, so it will safely replace existing functions.

### If You Get Permission Errors

Ensure you're using the service role key or have sufficient database permissions.

### If Tests Still Fail

1. Check that all functions were created in the SQL Editor
2. Verify the indexes were created
3. Run the test script again to see specific error messages

## Next Steps After Deployment

1. **Test in UI**: Try deleting an agency in the frontend interface
2. **Verify Cleanup**: Check that:
   - Agency members are deactivated (not deleted)
   - Agency invites are deactivated
   - User preferences are cleared
   - The agency no longer appears in agency lists
3. **Monitor Logs**: Check that deletion events are properly logged

## Rollback Plan

If you need to rollback, you can:

1. Restore from a backup (you created one before starting, right?)
2. Manually update agencies to set `deleted_at = NULL` and `is_active = true`
3. Reactivate members and invites as needed

## Support

If you encounter any issues:

1. Check the error messages in the test script output
2. Verify the SQL executed without errors in Supabase
3. Ensure your environment variables are correctly configured
