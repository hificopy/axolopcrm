# Agency System Deployment Guide

## 🚀 Quick Start: Deploy Agency Schema to Supabase

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run the Complete Schema

1. Open the file: `backend/db/complete-schema.sql` (NOT agency-schema.sql!)
2. Copy the ENTIRE contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" button (or press Cmd/Ctrl + Enter)
5. Wait for execution to complete (should take 10-15 seconds)

**Note:** This file includes BOTH users tables AND agency tables in the correct order!

### Step 3: Verify Deployment

After running the SQL, you should see a success message at the bottom:
```
✅ AXOLOP CRM SCHEMA DEPLOYMENT COMPLETE!
```

Verify the following tables were created in Supabase Table Editor:

#### User Tables:
- ✅ `users` - User profiles
- ✅ `user_settings` - User preferences

#### Agency Tables:
- ✅ `agencies` - Core agency table
- ✅ `agency_members` - User-to-agency relationships
- ✅ `user_agency_preferences` - Stores current selected agency per user

#### Functions Created:
- ✅ `get_user_agencies(p_user_id)` - Returns all agencies for a user
- ✅ `get_current_agency(p_user_id)` - Gets currently selected agency
- ✅ `set_current_agency(p_user_id, p_agency_id)` - Sets current agency
- ✅ `is_agency_admin(p_user_id, p_agency_id)` - Checks if user is admin

### Step 4: Test Agency Creation

1. Go to your app: http://localhost:3000
2. Log in
3. Click on the agency selector in the sidebar
4. Click the "+" button to create a new agency
5. Fill in the form:
   - Agency Name: "Your Agency Name"
   - Website (optional)
   - Description (optional)
6. Click "Create Agency"
7. You should see success! The agency will appear in the selector

---

## 🔍 Troubleshooting

### Error: "relation 'agencies' already exists"
This is OK! It means the table was already created. You can ignore this error.

### Error: "function get_user_agencies already exists"
This is OK! The functions were already created.

### Error: "permission denied"
Make sure you're using the correct Supabase project and have admin access.

### Agency Creation Still Failing?

1. **Check Browser Console** (F12 > Console tab)
   - Look for any JavaScript errors
   - Check the network tab for API call details

2. **Verify Tables in Supabase**
   - Go to "Table Editor" in Supabase
   - Check that `agencies` and `agency_members` tables exist
   - Verify they have the correct columns

3. **Check RLS Policies**
   - Go to "Authentication" > "Policies" in Supabase
   - Verify policies exist for `agencies` and `agency_members`
   - Policies should allow INSERT for authenticated users

4. **Test Direct Insert**
   Run this in SQL Editor to test:
   ```sql
   SELECT get_user_agencies(auth.uid());
   ```

---

## 📊 Understanding the Agency System

### Agency Roles
- **Admin**: Can create/edit/delete agency, manage members, full access
- **Member**: Can use the CRM, invited by admin, read-write access
- **Viewer**: Read-only access, invited by admin

### Subscription Tiers
- **free**: Basic features
- **sales**: Sales CRM features
- **build**: Advanced features + forms
- **scale**: All features + multiple agencies
- **god_mode**: Unlimited (for axolopcrm@gmail.com)

### How Agency Isolation Works

1. **User creates agency** → Automatically becomes admin
2. **User switches agency** → All CRM data filters by `agency_id`
3. **User invites member** → Member joins with assigned role
4. **Member switches agency** → Sees only data for that agency

All CRM data (leads, contacts, opportunities) will be filtered by the currently selected `agency_id`.

---

## 🎯 Next Steps After Deployment

1. ✅ Deploy agency schema (you're doing this now!)
2. ⏭️  Add `agency_id` to all CRM tables
3. ⏭️  Update all API endpoints to filter by `agency_id`
4. ⏭️  Implement agency switching with data refresh
5. ⏭️  Add member invitation system
6. ⏭️  Create agency settings page

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs
3. Verify your `.env` file has correct Supabase URL and keys
4. Make sure you're logged in when testing

---

**Created:** 2025-11-24
**Version:** 1.0
**Status:** Ready to deploy
