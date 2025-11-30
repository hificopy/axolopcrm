# Agency System Implementation - Complete Guide

**Date**: 2025-01-23
**Status**: ✅ Implementation Complete | ⚠️ Deployment Required
**Backup Created**: `backups/backup-20251123-164350-agency-system-implementation/`

---

## 📋 Executive Summary

A fully functional multi-tenant agency system has been implemented for Axolop CRM with the following capabilities:

- **Multi-tenant architecture**: Each paid account = 1 agency with up to 3 users
- **Role-based access control**: Admin, Member, and Viewer roles with granular permissions
- **Agency management**: Full CRUD operations for agencies, members, and settings
- **God mode**: `axolopcrm@gmail.com` has unlimited access to all features
- **UI integration**: Agency selector, settings pages, and permission-based UI filtering
- **Subscription tiers**: Free, Starter, Professional, Enterprise, and God Mode

---

## 🗂️ What Was Created

### 1. Database Schema (`docs/database/sql/agencies-schema.sql`)

**Tables Created:**
- `agencies` - Stores agency information, subscription tier, and settings
- `agency_members` - Links users to agencies with roles and permissions
- `agency_settings` - Additional agency configuration

**Key Features:**
- Row Level Security (RLS) policies for data isolation
- Automatic user count tracking
- Subscription tier management
- Helper functions for permission checking
- Auto-creation of default agency for new users

**Enum Types:**
- `agency_role`: admin, member, viewer
- `subscription_tier`: free, starter, professional, enterprise, god_mode

### 2. Backend API Routes

**Agency Management (`backend/routes/agencies.js`):**
- `GET /api/v1/agencies` - Get user's agencies
- `GET /api/v1/agencies/:id` - Get specific agency
- `POST /api/v1/agencies` - Create new agency
- `PUT /api/v1/agencies/:id` - Update agency (admin only)
- `DELETE /api/v1/agencies/:id` - Soft delete agency (admin only)
- `GET /api/v1/agencies/:id/settings` - Get agency settings
- `PUT /api/v1/agencies/:id/settings` - Update settings (admin only)

**Member Management (`backend/routes/agency-members.js`):**
- `GET /api/v1/agencies/:agencyId/members` - Get agency members
- `POST /api/v1/agencies/:agencyId/members` - Invite member (admin only)
- `PUT /api/v1/agencies/:agencyId/members/:memberId` - Update member role/permissions
- `DELETE /api/v1/agencies/:agencyId/members/:memberId` - Remove member
- `GET /api/v1/agencies/:agencyId/members/me/permissions` - Get current user's permissions

### 3. Backend Middleware (`backend/middleware/agency-access.js`)

**Access Control Functions:**
- `requireAgencyAccess` - Verify user is a member of agency
- `requireAgencyAdmin` - Verify user is admin of agency
- `requirePermission(permission)` - Check specific permission
- `attachAgencyContext` - Attach agency context to request
- `requireSubscriptionTier(tier)` - Check subscription level

### 4. Frontend Context (`frontend/context/AgencyContext.jsx`)

**State Management:**
- `agencies` - User's agencies list
- `currentAgency` - Active agency
- `currentMembership` - User's membership details
- `permissions` - User's permissions in current agency

**Actions:**
- `selectAgency(id)` - Switch to agency
- `switchAgency(id)` - Same as selectAgency
- `createAgency(data)` - Create new agency
- `refreshAgency()` - Reload current agency
- `refreshAgencies()` - Reload agencies list

**Helper Functions:**
- `hasPermission(permission)` - Check if user has permission
- `isAdmin()` - Check if user is admin
- `isGodMode()` - Check if user is god mode
- `getSubscriptionTier()` - Get current subscription tier
- `isFeatureEnabled(feature)` - Check if feature is enabled

### 5. Frontend Components

**Updated Components:**
- `frontend/components/layout/AgenciesSelector.jsx`
  - Shows real agencies from database
  - Agency switching with live updates
  - Create new agency modal
  - Shows user role and agency logo

**New Pages:**
- `frontend/pages/AgencySettings.jsx`
  - General settings (name, logo, website, description)
  - Team members management (view, add, remove)
  - Permissions configuration (sections and features)
  - Admin-only access

**Updated Files:**
- `frontend/main.jsx` - Added AgencyProvider wrapper
- `backend/index.js` - Registered agency routes

---

## 🚀 Deployment Steps

### Step 1: Deploy Database Schema (CRITICAL)

**Using Supabase SQL Editor:**

1. Open Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
   ```

2. Copy the schema:
   ```bash
   cat docs/database/sql/agencies-schema.sql
   ```

3. Paste in SQL Editor and click "Run"

4. Verify deployment - check that these tables exist:
   - agencies
   - agency_members
   - agency_settings

**Expected Result:**
- 3 new tables created
- 8 indexes created
- 6 RLS policies created
- 5 triggers created
- 5 helper functions created

### Step 2: Update App Routes (if needed)

Add the Agency Settings page to your routes in `App.jsx`:

```jsx
import AgencySettings from './pages/AgencySettings';

// In your routes:
<Route path="/app/agency-settings" element={<AgencySettings />} />
```

### Step 3: Test the Implementation

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Sign in with existing user**

3. **Check Agency Selector:**
   - Should show your agencies in the sidebar
   - Click to switch between agencies
   - Click + button to create new agency

4. **Access Agency Settings:**
   - Navigate to `/app/agency-settings`
   - Should see General, Team Members, and Permissions tabs
   - Try updating agency name, logo, etc.

5. **Test God Mode:**
   - Sign in as `axolopcrm@gmail.com`
   - Should have access to all features
   - Subscription tier should show "god_mode"

---

## 📊 Features Implemented

### ✅ Core Features

- [x] Multi-tenant agency system
- [x] Agency CRUD operations
- [x] Member management (invite, remove, update roles)
- [x] Role-based access control (Admin, Member, Viewer)
- [x] Granular permissions system
- [x] Agency selector with switching
- [x] Agency settings page
- [x] Subscription tier management
- [x] God mode for axolopcrm@gmail.com
- [x] User limit enforcement (3 users per agency)
- [x] RLS policies for data isolation
- [x] Auto-creation of default agency for new users

### ⏳ TODO (Future Enhancements)

- [ ] User settings page with profile picture upload
- [ ] Email notifications for member invitations
- [ ] Agency logo upload to Supabase Storage
- [ ] Bulk member import
- [ ] Activity log for agency changes
- [ ] Advanced permission templates
- [ ] Subscription billing integration
- [ ] Agency transfer/ownership change
- [ ] Agency deletion with data archival

---

## 🔑 Key Implementation Details

### Subscription Tiers

| Tier | Max Users | Features | Price |
|------|-----------|----------|-------|
| Free | 3 | Basic CRM | $0 |
| Starter | 3 | + Email marketing | $97/mo |
| Professional | 3 | + AI features | $197/mo |
| Enterprise | 3 | + Custom integrations | $497/mo |
| God Mode | ∞ | Everything | Axolop only |

### Default Permissions by Role

**Admin:**
- Full access to everything
- Can manage team members
- Can update agency settings
- Can manage billing

**Member:**
- Can view and edit leads, contacts, opportunities
- Can manage meetings
- Can view reports
- Cannot manage team or billing

**Viewer:**
- Read-only access to most data
- Cannot edit or delete
- Cannot access settings

### Permission Keys

**Data Permissions:**
- `can_view_leads`, `can_edit_leads`, `can_delete_leads`
- `can_view_contacts`, `can_edit_contacts`, `can_delete_contacts`
- `can_view_opportunities`, `can_edit_opportunities`
- `can_view_activities`, `can_view_meetings`, `can_manage_meetings`

**Feature Permissions:**
- `can_view_forms`, `can_manage_forms`
- `can_view_campaigns`, `can_manage_campaigns`
- `can_view_workflows`, `can_manage_workflows`

**Administrative Permissions:**
- `can_manage_team`
- `can_manage_billing`
- `can_manage_agency_settings`

---

## 🧪 Testing Checklist

### Database Testing

- [ ] Deploy schema to Supabase
- [ ] Verify all tables created
- [ ] Test RLS policies (try accessing another user's agency data)
- [ ] Test helper functions (`is_agency_admin`, `get_user_agencies`)

### Backend API Testing

Using curl or Postman:

```bash
# Get user's agencies
curl http://localhost:3002/api/v1/agencies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create new agency
curl -X POST http://localhost:3002/api/v1/agencies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Agency", "website": "https://test.com"}'

# Get agency members
curl http://localhost:3002/api/v1/agencies/AGENCY_ID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing

- [ ] Agency selector loads agencies
- [ ] Agency switching updates the UI
- [ ] Create new agency modal works
- [ ] Agency settings page loads
- [ ] Admin can update agency details
- [ ] Admin can add/remove members
- [ ] Admin can configure permissions
- [ ] Non-admins cannot access agency settings
- [ ] God mode user has full access

### Permission Testing

- [ ] Admin can access all features
- [ ] Member has limited access
- [ ] Viewer has read-only access
- [ ] Disabled sections are hidden from UI
- [ ] API blocks unauthorized actions

---

## 🐛 Troubleshooting

### Issue: "agencies table does not exist"

**Solution**: Deploy the database schema first

```bash
# Verify schema is deployed
cat docs/database/sql/agencies-schema.sql | pbcopy
# Paste in Supabase SQL Editor and run
```

### Issue: "User does not have access to this agency"

**Possible causes:**
1. User not added to agency_members table
2. invitation_status is not 'active'
3. Agency is_active is false

**Solution**: Check database:
```sql
SELECT * FROM agency_members WHERE user_id = 'YOUR_USER_ID';
```

### Issue: "Agency selector shows 'No agency'"

**Possible causes:**
1. User has no agencies
2. Database schema not deployed
3. RPC function `get_user_agencies` doesn't exist

**Solution**: Create default agency:
```sql
SELECT create_default_agency_for_user(
  'USER_ID',
  'user@example.com'
);
```

### Issue: "Cannot switch agencies"

**Check:**
1. Console for errors
2. Network tab for failed API calls
3. Supabase logs for RLS policy violations

---

## 📚 Database Schema Reference

### Helper Functions

**Check if user is admin:**
```sql
SELECT is_agency_admin('USER_ID', 'AGENCY_ID');
```

**Get user's agencies:**
```sql
SELECT * FROM get_user_agencies('USER_ID');
```

**Check user permission:**
```sql
SELECT user_has_permission('USER_ID', 'AGENCY_ID', 'can_manage_leads');
```

**Create default agency:**
```sql
SELECT create_default_agency_for_user('USER_ID', 'user@example.com');
```

---

## 🔐 Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled to ensure:
- Users can only see agencies they're members of
- Only admins can update agency settings
- Only admins can manage members
- Data is isolated between agencies

### API Security

- All routes require authentication (`authenticateUser` middleware)
- Admin routes check `is_agency_admin()`
- Permission routes check specific permissions
- God mode bypasses restrictions only for `axolopcrm@gmail.com`

### Frontend Security

- AgencyContext checks permissions before showing UI
- Settings pages hidden from non-admins
- Form submissions validated on backend
- JWT tokens required for all API calls

---

## 📈 Next Steps

### Immediate (This Week)

1. **Deploy database schema** - CRITICAL
2. **Test agency creation** - Create test agency
3. **Test member management** - Invite and remove users
4. **Test permissions** - Verify role-based access

### Short-term (This Month)

1. **Add User Settings page** - Profile picture, personal preferences
2. **Implement file upload** - Agency logo upload to Supabase Storage
3. **Add email notifications** - Member invitation emails
4. **Create onboarding flow** - Guide new agencies through setup

### Long-term (Next Quarter)

1. **Billing integration** - Stripe subscription management
2. **Advanced permissions** - Custom permission templates
3. **Activity logging** - Track agency changes
4. **Agency analytics** - Usage metrics and insights

---

## 💡 Usage Examples

### Check if User is Admin

```jsx
import { useAgency } from '@/context/AgencyContext';

function MyComponent() {
  const { isAdmin } = useAgency();

  if (isAdmin()) {
    return <AdminControls />;
  }

  return <MemberView />;
}
```

### Check Specific Permission

```jsx
import { useAgency } from '@/context/AgencyContext';

function LeadsPage() {
  const { hasPermission } = useAgency();

  const canEdit = hasPermission('can_edit_leads');
  const canDelete = hasPermission('can_delete_leads');

  return (
    <div>
      <LeadsList editable={canEdit} deletable={canDelete} />
    </div>
  );
}
```

### Check if Feature is Enabled

```jsx
import { useAgency } from '@/context/AgencyContext';

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

### Switch Agency

```jsx
import { useAgency } from '@/context/AgencyContext';

function AgencySwitcher() {
  const { agencies, currentAgency, switchAgency } = useAgency();

  return (
    <select
      value={currentAgency?.id}
      onChange={(e) => switchAgency(e.target.value)}
    >
      {agencies.map(agency => (
        <option key={agency.agency_id} value={agency.agency_id}>
          {agency.agency_name}
        </option>
      ))}
    </select>
  );
}
```

---

## 📝 Summary

**Implementation Status**: ✅ Complete
**Backend**: ✅ Routes, Middleware, Database Schema
**Frontend**: ✅ Context, Components, Pages
**Deployment Status**: ⚠️ Schema deployment required

**Total Files Created/Modified**: 10+
**Estimated Implementation Time**: 8-10 hours
**Testing Time Required**: 2-3 hours

**God Mode User**: `axolopcrm@gmail.com`
**Default Tier**: Free (3 users)
**Backup Location**: `backups/backup-20251123-164350-agency-system-implementation/`

---

**Next Action**: Deploy the database schema to Supabase and test the agency creation flow!
