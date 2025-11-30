# Deploy Users Schema to Supabase

## Status: ⚠️ Schema Not Deployed

The verification script has confirmed that the users schema has **NOT** been deployed to your Supabase database yet.

## Quick Deployment (5 minutes)

### Step 1: Open Supabase SQL Editor

Click this link to open the SQL Editor:
```
https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
```

Or manually navigate to:
1. Go to https://supabase.com/dashboard
2. Select your project: **fuclpfhitgwugxogxkmw**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy the Schema SQL

Open the file: `backend/db/users-schema.sql`

Or use this command to view it:
```bash
cat backend/db/users-schema.sql
```

### Step 3: Paste and Run

1. **Copy** the entire contents of `users-schema.sql`
2. **Paste** into the Supabase SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 4: Verify Deployment

After running the SQL script, verify it worked:

```bash
node scripts/verify-users-schema.js
```

You should see:
```
✅ ALL TABLES EXIST
🎉 Users schema is deployed successfully!
```

## What This Schema Creates

### Tables (6 total)
1. **users** - Main user profiles (extended from auth.users)
2. **user_settings** - User preferences and settings
3. **user_activity** - Audit trail of user actions
4. **user_sessions** - Active session tracking
5. **teams** - Team/organization management
6. **team_members** - User-to-team relationships

### Security Features
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Service role can manage all data
- ✅ Secure policies for team access

### Automation
- ✅ Auto-sync trigger: Creates user profile when auth.users row is created
- ✅ Login tracking: Automatically logs user logins
- ✅ Updated_at triggers: Auto-updates timestamps

### Indexes
- ✅ Performance indexes on frequently queried fields
- ✅ Unique constraints on critical fields

## Troubleshooting

### Error: "permission denied"
**Solution:** Make sure you're logged into the correct Supabase account

### Error: "relation already exists"
**Solution:** Some tables may already exist. This is fine, the script uses `CREATE TABLE IF NOT EXISTS`

### Error: "function already exists"
**Solution:** The script uses `CREATE OR REPLACE FUNCTION`, so this should not happen. If it does, it's safe to ignore.

### Tables created but verification fails
**Solution:**
1. Wait 10-30 seconds for Supabase cache to refresh
2. Run verification again: `node scripts/verify-users-schema.js`

## After Deployment

Once the schema is deployed, you can:

1. ✅ Test the user API endpoints
2. ✅ Connect Profile page to API
3. ✅ Implement email verification banner
4. ✅ Add settings management UI

## Manual Verification (Optional)

If you want to manually verify the tables exist:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_settings', 'user_activity', 'user_sessions', 'teams', 'team_members')
ORDER BY table_name;
```

You should see all 6 tables listed.

## Next Steps

After successful deployment:

1. **Test Backend API**
   ```bash
   npm run backend
   ```

2. **Test User Endpoints** (in another terminal)
   ```bash
   # Get auth token from browser (sign in first)
   # Then test:
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3002/api/v1/users/me
   ```

3. **Connect Frontend**
   - Update Profile.jsx to fetch from `/api/v1/users/me`
   - Update Settings pages to use user API
   - Add email verification banner

---

**Need Help?** Check COMPLETE_AUTH_AUDIT.md for detailed recommendations and next steps.
