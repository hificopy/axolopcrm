# Agency Admin System - Complete Implementation Guide

## Overview

The Agency Admin System provides a complete multi-tenant architecture for Axolop CRM, allowing paying users to create agencies and invite team members with granular permissions.

**Last Updated:** 2025-01-23
**Version:** 1.0.0
**Status:** ✅ Fully Implemented

---

## Table of Contents

1. [User Types](#user-types)
2. [Seat Management](#seat-management)
3. [Permissions System](#permissions-system)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Testing Guide](#testing-guide)

---

## User Types

The system supports 5 distinct user types:

### 1. GOD MODE 👑
- **Who:** Hand-picked by Axolop (axolopcrm@gmail.com and whitelist)
- **Access:** Unlimited everything, all features, no restrictions
- **Use Case:** Internal team, testing, support

### 2. AGENCY ADMIN 🔑
- **Who:** Paying users who own an agency
- **Access:** Full control over their agency
- **Capabilities:**
  - Create/manage agencies
  - Invite and remove team members
  - Manage billing and seats
  - Full edit permissions
  - Configure agency settings

### 3. TRIAL USER 🆓
- **Who:** Users on 14-day free trial
- **Access:** Limited trial access
- **Capabilities:**
  - Same as Agency Admin but temporary
  - Limited to trial tier features
  - Must upgrade after trial expires

### 4. FREE USER 📦
- **Who:** Users without any agency membership
- **Access:** Personal workspace only
- **Capabilities:**
  - Access to free tier features
  - Cannot create agencies (unless paid)
  - Limited functionality

### 5. SEATED USER 👤
- **Who:** Team members invited to an agency
- **Access:** READ-ONLY (cannot edit, cannot manage)
- **Capabilities:**
  - View data within allowed sections
  - Cannot edit leads, contacts, tasks, etc.
  - Cannot invite/remove members
  - Cannot manage billing
  - Cannot access agency settings

---

## Seat Management

### Pricing Model

```
First 3 seats: FREE (included for all paying customers)
Additional seats: $12/month per seat
```

### Seat Allocation Examples

| Total Seats | Free Seats | Paid Seats | Monthly Cost |
|-------------|------------|------------|--------------|
| 1           | 1          | 0          | $0           |
| 3           | 3          | 0          | $0           |
| 5           | 3          | 2          | $24          |
| 10          | 3          | 7          | $84          |
| 20          | 3          | 17         | $204         |

### Seat Operations

#### Adding a Seat
- Admin invites user by email
- User must exist in system (have an account)
- System checks seat availability
- If available, adds member to agency
- Updates `current_users_count`
- Charges $12/mo if beyond 3rd seat

#### Removing a Seat
- Admin removes user from agency
- System prevents removing last admin
- Updates `current_users_count`
- Prorates billing if applicable
- User loses all access to agency data

#### Upgrading Seats
- Admin purchases additional seat capacity
- Increases `max_users`
- Billing adjusts automatically
- Takes effect immediately

---

## Permissions System

### Admin Permissions (FULL ACCESS)

Admins have full access to everything:

```json
{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": true,
  "can_delete_leads": true,
  "can_view_contacts": true,
  "can_edit_contacts": true,
  "can_delete_contacts": true,
  "can_view_opportunities": true,
  "can_edit_opportunities": true,
  "can_view_activities": true,
  "can_view_meetings": true,
  "can_manage_meetings": true,
  "can_view_forms": true,
  "can_manage_forms": true,
  "can_view_campaigns": true,
  "can_manage_campaigns": true,
  "can_view_workflows": true,
  "can_manage_workflows": true,
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_manage_team": true,
  "can_manage_billing": true,
  "can_manage_agency_settings": true,
  "can_access_api": true,
  "can_manage_white_label": true
}
```

### Seated User Permissions (READ-ONLY)

Seated users can ONLY view, never edit:

```json
{
  "can_view_dashboard": true,
  "can_view_leads": true,
  "can_edit_leads": false,  // ❌ Cannot edit
  "can_delete_leads": false,  // ❌ Cannot delete
  "can_view_contacts": true,
  "can_edit_contacts": false,  // ❌ Cannot edit
  "can_delete_contacts": false,  // ❌ Cannot delete
  "can_view_opportunities": true,
  "can_edit_opportunities": false,  // ❌ Cannot edit
  "can_view_activities": true,
  "can_view_meetings": true,
  "can_manage_meetings": false,  // ❌ Cannot manage
  "can_view_forms": true,
  "can_manage_forms": false,  // ❌ Cannot manage
  "can_view_campaigns": true,
  "can_manage_campaigns": false,  // ❌ Cannot manage
  "can_view_workflows": true,
  "can_manage_workflows": false,  // ❌ Cannot manage
  "can_view_calendar": true,
  "can_view_reports": true,
  "can_manage_team": false,  // ❌ Cannot manage team
  "can_manage_billing": false,  // ❌ Cannot manage billing
  "can_manage_agency_settings": false,  // ❌ Cannot manage settings
  "can_access_api": false,  // ❌ No API access
  "can_manage_white_label": false  // ❌ No white label access
}
```

---

## API Endpoints

### Base URL
```
http://localhost:3002/api/v1
```

### Authentication
All endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

### User Type & Profile

#### GET `/agencies/me/user-type`
Get current user's type, permissions, and agency access.

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "agency_admin",
    "isGodMode": false,
    "isAdmin": true,
    "isSeatedUser": false,
    "canManageAgency": true,
    "canManageBilling": true,
    "canEditAnything": true,
    "unlimited": false,
    "tier": "sales",
    "agencies": [
      {
        "id": "uuid",
        "name": "My Agency",
        "role": "admin",
        "tier": "sales",
        "status": "active",
        "maxUsers": 5,
        "currentUsers": 3
      }
    ]
  }
}
```

#### POST `/users/me/avatar`
Upload user profile picture.

**Request Body:**
```json
{
  "file_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "file_name": "avatar.jpg",
  "content_type": "image/jpeg"
}
```

**Or:**
```json
{
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "profile_picture": "https://supabase.co/storage/...",
    "user_id": "uuid"
  }
}
```

---

### Agency Management

#### GET `/agencies/:id`
Get agency details (requires membership).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Agency",
    "slug": "my-agency-xyz123",
    "logo_url": "https://...",
    "website": "https://myagency.com",
    "description": "...",
    "subscription_tier": "sales",
    "subscription_status": "active",
    "max_users": 5,
    "current_users_count": 3,
    "user_role": "admin",
    "user_permissions": {...}
  }
}
```

#### POST `/agencies/:id/logo`
Upload agency logo (admin only).

**Request Body:**
```json
{
  "file_data": "data:image/png;base64,iVBORw0KGgo...",
  "file_name": "logo.png",
  "content_type": "image/png"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agency logo updated successfully",
  "data": {
    "logo_url": "https://supabase.co/storage/...",
    "agency_id": "uuid"
  }
}
```

---

### Seat Management

#### GET `/agencies/:id/seats`
Get seat usage and pricing (admin only).

**Response:**
```json
{
  "success": true,
  "agency": {
    "id": "uuid",
    "name": "My Agency",
    "tier": "sales",
    "status": "active"
  },
  "seating": {
    "maxSeats": 5,
    "currentSeats": 3,
    "availableSeats": 2,
    "freeSeats": 3,
    "paidSeats": 2,
    "costPerSeat": 12
  },
  "pricing": {
    "totalSeats": 5,
    "freeSeats": 3,
    "paidSeats": 2,
    "costPerSeat": 12,
    "monthlyCost": 24,
    "breakdown": "3 free seats + 2 paid seats @ $12/mo = $24/mo"
  },
  "members": [...]
}
```

#### POST `/agencies/:id/seats`
Add a seat (invite member) - Admin only.

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"  // or "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member added successfully",
  "member": {
    "id": "uuid",
    "userId": "uuid",
    "email": "newmember@example.com",
    "role": "member",
    "invitedAt": "2025-01-23T..."
  },
  "seating": {
    "currentSeats": 4,
    "maxSeats": 5,
    "availableSeats": 1,
    "pricing": {
      "totalSeats": 4,
      "freeSeats": 3,
      "paidSeats": 1,
      "monthlyCost": 12
    }
  }
}
```

**Error Response (No Available Seats):**
```json
{
  "success": false,
  "error": "No available seats",
  "message": "Agency has reached maximum capacity (5 seats). Please upgrade to add more members.",
  "needsUpgrade": true,
  "currentSeats": 5,
  "maxSeats": 5
}
```

#### DELETE `/agencies/:id/seats/:userId`
Remove a seat (remove member) - Admin only.

**Response:**
```json
{
  "success": true,
  "message": "Member removed successfully",
  "seating": {
    "currentSeats": 3,
    "pricing": {
      "totalSeats": 3,
      "freeSeats": 3,
      "paidSeats": 0,
      "monthlyCost": 0
    }
  }
}
```

#### POST `/agencies/:id/seats/upgrade`
Upgrade seats (increase max_users) - Admin only.

**Request Body:**
```json
{
  "additionalSeats": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 5 seat(s)",
  "seating": {
    "previousMaxSeats": 5,
    "newMaxSeats": 10,
    "currentSeats": 3,
    "availableSeats": 7,
    "pricing": {
      "totalSeats": 10,
      "freeSeats": 3,
      "paidSeats": 7,
      "costPerSeat": 12,
      "monthlyCost": 84
    }
  }
}
```

#### POST `/agencies/:id/seats/downgrade`
Downgrade seats (decrease max_users) - Admin only.

**Request Body:**
```json
{
  "seatsToRemove": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully removed 2 seat(s)",
  "seating": {
    "previousMaxSeats": 10,
    "newMaxSeats": 8,
    "currentSeats": 3,
    "availableSeats": 5,
    "pricing": {
      "totalSeats": 8,
      "freeSeats": 3,
      "paidSeats": 5,
      "monthlyCost": 60
    }
  }
}
```

**Error Response (Would Exceed Current Usage):**
```json
{
  "success": false,
  "error": "Cannot downgrade below current usage",
  "message": "You currently have 8 members. Please remove members before downgrading.",
  "currentSeats": 8,
  "requestedMaxSeats": 7
}
```

#### PUT `/agencies/:id/seats/:userId/role`
Update member role - Admin only.

**Request Body:**
```json
{
  "role": "admin"  // or "member" or "viewer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "member": {
    "id": "uuid",
    "userId": "uuid",
    "role": "admin"
  }
}
```

---

## Middleware

### Available Middleware

#### `authenticateUser`
Basic authentication - verifies JWT token.

#### `requireAgencyAccess`
Checks if user has access to an agency.
Attaches: `req.agencyMembership`, `req.userType`, `req.permissions`

#### `requireAgencyAdmin`
Requires user to be admin of the agency.

#### `requireEditPermissions`
Blocks seated users from making edits.
Use on all PUT, POST, DELETE routes that modify agency data.

#### `attachAgencyContext`
Attaches user type and agencies to request (non-blocking).

---

## Usage Examples

### Example 1: Admin Inviting a New Member

```javascript
// POST /api/v1/agencies/abc123/seats
const response = await fetch('/api/v1/agencies/abc123/seats', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'johndoe@example.com',
    role: 'member'
  })
});

const result = await response.json();
console.log(result.message); // "Member added successfully"
console.log(result.seating.pricing); // Pricing breakdown
```

### Example 2: Seated User Trying to Edit (Blocked)

```javascript
// PUT /api/v1/leads/123 (with requireEditPermissions middleware)
const response = await fetch('/api/v1/leads/123', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${seatedUserToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Lead Name'
  })
});

// Response: 403 Forbidden
{
  "error": "Forbidden",
  "message": "You do not have permission to edit in this agency. Only agency admins can make changes.",
  "isReadOnly": true
}
```

### Example 3: Checking User Type

```javascript
// GET /api/v1/agencies/me/user-type
const response = await fetch('/api/v1/agencies/me/user-type', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();

if (data.isAdmin) {
  // Show admin UI
} else if (data.isSeatedUser) {
  // Show read-only UI
}
```

---

## Testing Guide

### Test Scenarios

#### 1. Test God Mode User
```bash
# Login as axolopcrm@gmail.com
# Verify unlimited access to all features
# Check that all limits are bypassed
```

#### 2. Test Agency Admin
```bash
# Create agency as paying user
# Verify can invite members
# Verify can manage seats
# Verify can edit all data
# Verify can upload logo
```

#### 3. Test Seated User (Read-Only)
```bash
# Invite user to agency as "member"
# Login as that user
# Verify can view data
# Try to edit lead - should be blocked with 403
# Try to add/remove members - should be blocked
# Try to manage billing - should be blocked
```

#### 4. Test Seat Limits
```bash
# Create agency with max_users=3
# Add 3 members successfully
# Try to add 4th member - should fail with "No available seats"
# Upgrade seats to 5
# Now add 4th and 5th members successfully
```

#### 5. Test Profile Picture Upload
```bash
# Upload avatar as user
# Verify it updates in auth.users metadata
# Verify it displays in top right UI
```

#### 6. Test Agency Logo Upload
```bash
# Upload logo as admin
# Verify it updates in agencies table
# Verify it displays in agency settings
```

---

## Database Tables

### `agencies`
Stores agency information.

Key fields:
- `max_users` - Maximum seats allowed
- `current_users_count` - Current number of members
- `subscription_tier` - sales, build, scale, god_mode
- `subscription_status` - trial, active, past_due, canceled

### `agency_members`
Stores agency memberships.

Key fields:
- `user_id` - User ID
- `agency_id` - Agency ID
- `role` - admin, member, viewer
- `permissions` - JSONB permissions object
- `invitation_status` - active, pending, suspended

---

## Services

### `user-type-service.js`
- `getUserType(userId, userEmail)` - Determine user type
- `isAgencyAdmin(userId, agencyId)` - Check if admin
- `canEditInAgency(userId, agencyId)` - Check edit permissions
- `getUserPermissions(userId, agencyId)` - Get full permissions

### `seat-management-service.js`
- `addSeat(agencyId, invitedByUserId, email, role)` - Add member
- `removeSeat(agencyId, memberUserId, removedByUserId)` - Remove member
- `upgradeSeats(agencyId, additionalSeats)` - Increase capacity
- `downgradeSeats(agencyId, seatsToRemove)` - Decrease capacity
- `getSeatInfo(agencyId)` - Get seat usage and pricing
- `updateMemberRole(agencyId, memberUserId, newRole)` - Change role

---

## Next Steps

### Integration with Frontend
1. Create agency admin dashboard UI
2. Add seat management interface
3. Implement invite member modal
4. Add role management dropdown
5. Show seat usage and pricing
6. Integrate profile picture upload
7. Integrate agency logo upload

### Stripe Integration
1. Create Stripe product for additional seats ($12/mo)
2. Handle seat billing in Stripe
3. Sync seat changes with Stripe subscriptions
4. Handle failed payments
5. Implement proration for mid-cycle changes

### Future Enhancements
1. Custom permission sets (beyond admin/member/viewer)
2. Department/team groupings within agencies
3. Audit logs for member changes
4. Email notifications for invitations
5. Bulk member import
6. Member activity tracking

---

## Support

For questions or issues:
- Review this documentation
- Check `/docs/features/AGENCY_SYSTEM.md`
- Contact: axolopcrm@gmail.com

---

**Status:** ✅ Backend fully implemented and ready for frontend integration
**Generated:** 2025-01-23
**Version:** 1.0.0
