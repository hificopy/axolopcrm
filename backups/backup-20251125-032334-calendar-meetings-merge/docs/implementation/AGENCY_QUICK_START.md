# Agency System - Quick Start Guide

**Last Updated**: 2025-01-23
**Status**: Ready for Deployment

---

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Deploy Database Schema

1. **Copy the SQL schema:**
   ```bash
   cat docs/database/sql/agencies-schema.sql | pbcopy
   ```

2. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
   ```

3. **Paste and Run** (Cmd/Ctrl + Enter)

4. **Verify**: You should see:
   - ✅ "Success. No rows returned"
   - Check that tables `agencies`, `agency_members`, `agency_settings` exist in Table Editor

### Step 2: Start the Application

```bash
# Start both frontend and backend
npm run dev
```

### Step 3: Test the System

1. **Sign in** with any account
2. **Check the sidebar** - You should see "Agencies" section
3. **Click the agency selector** - Should show your default agency
4. **Access Agency Settings**: Navigate to `/app/settings/agency` or use the profile menu

---

## 📝 What You Get

### ✅ Database Tables
- **agencies** - Store agency info (name, logo, subscription tier)
- **agency_members** - Link users to agencies with roles
- **agency_settings** - Additional agency configuration

### ✅ Backend API
All routes are at `/api/v1/agencies`:
- `GET /agencies` - Get user's agencies
- `GET /agencies/:id` - Get specific agency
- `POST /agencies` - Create new agency
- `PUT /agencies/:id` - Update agency
- `GET /agencies/:id/members` - Get team members
- `POST /agencies/:id/members` - Invite member
- And more...

### ✅ Frontend Features
- **Agency Selector** - Switch between agencies in sidebar
- **Agency Settings** - Full management UI at `/app/settings/agency`
- **Profile Menu** - Shows user avatar and agency name
- **Context Provider** - `useAgency()` hook for state management

---

## 🎯 Key Features

### 1. Multi-Tenant System
- Each user can have multiple agencies
- Each agency can have up to 3 users (configurable)
- Perfect data isolation between agencies

### 2. Role-Based Access
Three roles:
- **Admin**: Full access, can manage team and settings
- **Member**: Can view and edit data, limited admin access
- **Viewer**: Read-only access

### 3. God Mode
`axolopcrm@gmail.com` has:
- Unlimited users
- All features enabled
- God Mode subscription tier
- Bypasses all restrictions

### 4. Subscription Tiers
- **Free**: 3 users, basic features
- **Starter**: 3 users, email marketing
- **Professional**: 3 users, AI features
- **Enterprise**: 3 users, custom integrations
- **God Mode**: Unlimited everything (Axolop only)

---

## 🔍 Testing Checklist

### Basic Tests
- [ ] Agency selector shows your agencies
- [ ] Can create a new agency
- [ ] Can switch between agencies
- [ ] Agency name appears in profile menu
- [ ] Agency Settings page loads

### Admin Tests
- [ ] Can update agency name
- [ ] Can upload agency logo
- [ ] Can view team members
- [ ] Can invite new members (if under limit)
- [ ] Can remove members
- [ ] Can configure permissions

### Permission Tests
- [ ] Non-admins cannot access Agency Settings
- [ ] Disabled sections are hidden from UI
- [ ] Members have correct permissions

### God Mode Tests (axolopcrm@gmail.com)
- [ ] Can create unlimited agencies
- [ ] Has access to all features
- [ ] Subscription shows "god_mode"
- [ ] Can bypass all restrictions

---

## 💡 Usage Examples

### Access Agency Context

```jsx
import { useAgency } from '@/context/AgencyContext';

function MyComponent() {
  const {
    currentAgency,      // Current agency object
    agencies,           // All user's agencies
    isAdmin,           // Check if admin function
    hasPermission,     // Check permission function
    switchAgency,      // Switch agency function
  } = useAgency();

  return (
    <div>
      <h1>{currentAgency?.name}</h1>
      {isAdmin() && <AdminControls />}
    </div>
  );
}
```

### Check Permissions

```jsx
function LeadsPage() {
  const { hasPermission } = useAgency();

  return (
    <div>
      {hasPermission('can_edit_leads') && <EditButton />}
      {hasPermission('can_delete_leads') && <DeleteButton />}
    </div>
  );
}
```

### Check if Feature is Enabled

```jsx
function Sidebar() {
  const { isFeatureEnabled } = useAgency();

  return (
    <nav>
      {isFeatureEnabled('leads') && <LeadsLink />}
      {isFeatureEnabled('forms') && <FormsLink />}
      {isFeatureEnabled('second_brain') && <SecondBrainLink />}
    </nav>
  );
}
```

---

## 🐛 Common Issues

### "No agency" shown in selector

**Solution**: Create a default agency

```sql
-- In Supabase SQL Editor:
SELECT create_default_agency_for_user(
  'YOUR_USER_ID',
  'your@email.com'
);
```

### "Permission denied" errors

**Cause**: RLS policies blocking access

**Solution**: Check that user is member of agency:
```sql
SELECT * FROM agency_members
WHERE user_id = 'YOUR_USER_ID';
```

### Agency selector not updating

**Solution**: Clear localStorage and refresh:
```js
localStorage.removeItem('currentAgencyId');
window.location.reload();
```

---

## 📚 Next Steps

1. **Deploy schema** ⚠️ CRITICAL
2. **Test agency creation**
3. **Invite team members**
4. **Configure permissions**
5. **Customize agency settings**

---

## 🆘 Need Help?

**Documentation**: See `docs/implementation/AGENCY_SYSTEM_IMPLEMENTATION.md`

**Database Issues**: Check Supabase logs
**API Issues**: Check backend logs (`npm run dev:backend`)
**Frontend Issues**: Check browser console (F12)

**Backup Location**: `backups/backup-20251123-164350-agency-system-implementation/`

---

## ✨ Summary

- ✅ **Database**: 3 tables, RLS policies, helper functions
- ✅ **Backend**: 15+ API endpoints with middleware
- ✅ **Frontend**: Context provider, components, pages
- ⚠️ **Status**: Ready to deploy schema
- 📍 **Next**: Run the SQL in Supabase

**Deploy Now**: Copy `docs/database/sql/agencies-schema.sql` to Supabase SQL Editor and run!
