# Supabase Database Setup Instructions

## ⚠️ IMPORTANT: Manual Setup Required

Due to connection restrictions with Supabase's direct PostgreSQL access, the database tables need to be created manually through the Supabase SQL Editor.

---

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Navigate to: **https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new**
2. Log in with your Supabase credentials

### Step 2: Execute the SQL Schema

1. Open the file: `supabase-complete-setup.sql` (located in the project root)
2. **Copy the ENTIRE contents** of the file
3. **Paste** into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl/Cmd + Enter)
5. Wait for execution to complete (should take 5-10 seconds)

### Step 3: Verify Tables Were Created

After execution, you should see a success message. To verify:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these new tables:
   - ✅ `forms`
   - ✅ `form_responses`
   - ✅ `form_analytics`
   - ✅ `question_analytics`
   - ✅ `form_integrations`
   - ✅ `form_campaign_triggers`
   - ✅ `leads`
   - ✅ `contacts`
   - ✅ `opportunities`
   - ✅ `campaigns`
   - ✅ `campaign_emails`
   - ✅ `automation_executions`

### Step 4: Check Sample Data

1. Click on the **`forms`** table in the Table Editor
2. You should see 2 sample forms:
   - "Customer Inquiry Form"
   - "Product Demo Request"

---

## What the SQL File Contains

The `supabase-complete-setup.sql` file includes:

- **12 Database Tables**: All tables needed for Forms, Leads, Contacts, Email Marketing
- **30+ Indexes**: Performance optimizations for common queries
- **Automatic Triggers**: Update timestamps automatically on all tables
- **Row Level Security (RLS)**: Security policies for all tables
- **Sample Data**: 2 test forms ready to use immediately
- **Foreign Key Constraints**: Ensures data integrity across tables

---

## After Setup is Complete

### Test 1: Verify Backend Connection

Run this command in your terminal:

```bash
curl http://localhost:3002/api/forms
```

**Expected Response**: Should return JSON with the 2 sample forms

**If Backend is Not Running**: Start it first with:
```bash
npm run dev
```

### Test 2: Check Forms Page

1. Open your application in the browser
2. Navigate to the **Forms** page
3. You should now see the 2 sample forms displayed
4. The "Create Form" button should work

### Test 3: Create a New Form

1. Click **"Create Form"** button
2. Fill out the form builder
3. Save the form
4. Verify it appears in the forms list

---

## Troubleshooting

### Problem: "Table already exists" error

**Solution**: This is normal if you're running the SQL file again. The SQL uses `CREATE TABLE IF NOT EXISTS`, so it won't break existing tables.

### Problem: Forms page still shows "Database Not Initialized"

**Solutions**:
1. **Hard refresh** the page (Ctrl/Cmd + Shift + R)
2. **Restart the backend** server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. **Clear browser cache** and reload

### Problem: Backend returns "Could not find the table 'public.forms'"

**Solutions**:
1. Verify the SQL was executed successfully in Supabase
2. Check the Table Editor to confirm tables exist
3. Restart your backend server
4. Check your `.env` file has the correct Supabase credentials:
   ```
   SUPABASE_URL=https://fuclpfhitgwugxogxkmw.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_b0z-8BN9ac5Bf1JjlH4GOA__qFXR2ld
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_Y0pdE6KRUTcbDmFe1lqWFw_JapIHko3
   ```

### Problem: RLS (Row Level Security) blocking queries

**Solution**: The SQL file includes RLS policies that allow all operations for authenticated users. If you're having issues:

1. Check if you're properly authenticated
2. Or temporarily disable RLS for testing:
   ```sql
   ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
   ```

---

## Database Schema Overview

### Forms System

```
forms (main table)
├── form_responses (user submissions)
├── form_analytics (performance metrics)
├── question_analytics (per-question stats)
├── form_integrations (connected services)
└── form_campaign_triggers (email automation)
```

### CRM System

```
leads (potential customers)
├── contacts (converted leads)
└── opportunities (sales opportunities)
```

### Email Marketing

```
campaigns (email campaigns)
├── campaign_emails (individual emails)
└── automation_executions (workflow runs)
```

---

## Next Steps After Setup

1. ✅ Execute SQL in Supabase (follow steps above)
2. ✅ Verify tables created
3. ✅ Test backend API connection
4. ✅ Test Forms page loads correctly
5. ✅ Create your first custom form
6. 🚀 Start using the CRM!

---

## Support

If you encounter any issues during setup:

1. Check the **Supabase Logs**: Dashboard → Logs → API Logs
2. Check the **Browser Console**: F12 → Console tab
3. Check the **Backend Logs**: Terminal where `npm run dev` is running
4. Verify all environment variables are correct in `.env` file

---

## Summary

**You need to**:
1. Copy all contents from `supabase-complete-setup.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Refresh your application

**Time Required**: ~2 minutes

**Difficulty**: Easy - just copy/paste and click run!
