# Roles and Hierarchy System

## Overview

Axolop CRM uses a Discord-style roles and permissions system that provides granular access control for agencies. This document explains the hierarchy, permission resolution, and how to manage roles.

## User Hierarchy

The system has three levels of users within an agency:

### 1. Agency Owner
- **One per agency** - Cannot be transferred easily
- **Full control** over all agency settings
- **Only person** who can manage billing/subscription
- Can manage team members (invite, remove, change roles)
- Can create, edit, delete custom roles
- Can access all features regardless of subscription tier
- Cannot be removed from the agency

### 2. Agency Admin
- **Multiple per agency** - Appointed by Owner
- Can manage team members (invite, remove, assign roles)
- Can create and manage custom roles
- Can manage agency settings (except billing)
- **Cannot access billing** - This is owner-only
- Has all permissions except `can_manage_billing`

### 3. Seated User
- **Invited via invite link** by Owner or Admin
- Permissions determined by assigned roles
- Can have multiple roles (permissions stack)
- Can have individual permission overrides
- Read-only by default until roles are assigned

## Permission Resolution (Discord-Style)

Permissions are resolved in the following order:

1. **Owner Check**: If user is owner, grant all permissions
2. **Admin Check**: If user is admin, grant all except billing
3. **Role Merge**: Combine all assigned role permissions (most permissive wins)
4. **Override Application**: Apply individual permission overrides

### Example Resolution
```
User has roles: [Sales Rep, Marketing Lead]

Sales Rep permissions:
- can_view_leads: true
- can_edit_leads: true
- can_view_contacts: true

Marketing Lead permissions:
- can_view_leads: true
- can_view_campaigns: true
- can_manage_campaigns: true

User override:
- can_delete_leads: true (explicitly granted)
- can_edit_leads: false (explicitly denied)

Final permissions:
- can_view_leads: true (from both roles)
- can_edit_leads: false (override wins)
- can_view_contacts: true (from Sales Rep)
- can_view_campaigns: true (from Marketing Lead)
- can_manage_campaigns: true (from Marketing Lead)
- can_delete_leads: true (from override)
```

## Role Templates

Axolop provides 200+ pre-built role templates organized by category:

### Categories

| Category | Description | Example Roles |
|----------|-------------|---------------|
| **Sales** | Revenue-focused roles | Account Executive, Sales Manager, BDR |
| **Marketing** | Marketing team roles | Content Creator, SEO Specialist, Email Marketer |
| **Operations** | Ops and admin roles | Project Manager, Operations Analyst |
| **Finance** | Finance and billing | Financial Analyst, AR Specialist |
| **Client Success** | Customer-facing | Account Manager, Customer Success Rep |
| **Creative** | Design and content | Graphic Designer, Video Producer |
| **Technology** | Tech and development | Developer, Technical Lead, DevOps |
| **Leadership** | Management roles | Team Lead, Director, VP |
| **Agency-Specific** | Agency operations | Media Buyer, Copywriter, Strategist |
| **Support** | Customer support | Support Agent, Support Lead |

### Using Templates

1. Go to **Settings > Roles**
2. Browse the **Role Templates** tab
3. Filter by category or search
4. Click **Copy to Agency** to create a custom version
5. Edit the copied role to customize permissions

## Permission Categories

Permissions are organized into these categories:

### CRM
- `can_view_dashboard` - View the main dashboard
- `can_view_leads` / `can_create_leads` / `can_edit_leads` / `can_delete_leads`
- `can_view_contacts` / `can_create_contacts` / `can_edit_contacts` / `can_delete_contacts`
- `can_view_opportunities` / `can_create_opportunities` / `can_edit_opportunities` / `can_delete_opportunities`
- `can_view_activities` / `can_create_activities` / `can_edit_activities`

### Calendar
- `can_view_calendar` - View calendar events
- `can_manage_calendar` - Create/edit/delete calendar events
- `can_view_meetings` - View scheduled meetings
- `can_manage_meetings` - Schedule and manage meetings

### Marketing
- `can_view_forms` / `can_manage_forms`
- `can_view_campaigns` / `can_manage_campaigns`
- `can_view_workflows` / `can_manage_workflows`

### Data
- `can_view_reports` - Access analytics and reports
- `can_export_data` - Export data from the system
- `can_import_data` - Import data into the system

### Administration
- `can_manage_team` - Invite/remove team members
- `can_manage_roles` - Create/edit custom roles
- `can_manage_billing` - **Owner only** - Manage subscription
- `can_manage_agency_settings` - Change agency settings
- `can_access_api` - Use API integrations
- `can_manage_integrations` - Set up third-party integrations

### AI Features
- `can_view_second_brain` - Access Second Brain
- `can_manage_second_brain` - Manage Second Brain content

## Section Access

Beyond permissions, roles can control which sections of the app are visible:

- dashboard
- leads
- contacts
- opportunities
- activities
- meetings
- forms
- email_campaigns
- workflows
- calendar
- second_brain
- mind_maps
- team_chat

If a user doesn't have section access, the navigation item is hidden.

## API Endpoints

### Role Templates
- `GET /api/v1/roles/templates` - List all templates
- `GET /api/v1/roles/templates/categories` - List categories
- `GET /api/v1/roles/templates/:id` - Get template details

### Agency Roles
- `GET /api/v1/roles/agency` - List agency's custom roles
- `POST /api/v1/roles/agency` - Create custom role
- `PUT /api/v1/roles/agency/:id` - Update role
- `DELETE /api/v1/roles/agency/:id` - Delete role
- `POST /api/v1/roles/agency/copy-template` - Copy template to agency

### Member Roles
- `GET /api/v1/roles/member/:memberId` - Get member's roles
- `POST /api/v1/roles/member/:memberId/assign` - Assign role to member
- `DELETE /api/v1/roles/member/:memberId/roles/:roleId` - Remove role
- `PUT /api/v1/roles/member/:memberId/roles` - Set all member roles

### Permission Overrides
- `GET /api/v1/roles/member/:memberId/overrides` - Get overrides
- `POST /api/v1/roles/member/:memberId/overrides` - Set override
- `DELETE /api/v1/roles/member/:memberId/overrides/:permissionKey` - Remove override

### Permission Resolution
- `GET /api/v1/roles/my-permissions` - Get current user's resolved permissions

## Frontend Components

### Hooks
```jsx
import { usePermission, useIsOwner, useIsAdmin } from '@/hooks/usePermission';

// Check single permission
const canEdit = usePermission('can_edit_leads');

// Check any of multiple permissions
const canManage = usePermission(['can_manage_team', 'can_manage_roles'], 'any');

// Check all permissions
const hasAll = usePermission(['can_view_leads', 'can_edit_leads'], 'all');

// Check user type
const isOwner = useIsOwner();
const isAdmin = useIsAdmin();
```

### Gate Components
```jsx
import { PermissionGate, OwnerOnly, AdminOnly } from '@/hooks/usePermission';

// Only show if user has permission
<PermissionGate permission="can_edit_leads">
  <EditButton />
</PermissionGate>

// Only show to owner
<OwnerOnly>
  <BillingSettings />
</OwnerOnly>

// Only show to admin or owner
<AdminOnly>
  <TeamSettings />
</AdminOnly>
```

### Context
```jsx
import { useRoles } from '@/context/RolesContext';

const {
  roleTemplates,      // All available templates
  agencyRoles,        // This agency's custom roles
  myPermissions,      // Current user's resolved permissions
  hasPermission,      // Check permission function
  isOwner,           // Boolean
  isAdmin,           // Boolean (owner or admin)
  copyTemplateToAgency,
  createAgencyRole,
  updateAgencyRole,
  deleteAgencyRole
} = useRoles();
```

## Database Schema

### Tables

1. **role_templates** - Global template library
2. **agency_roles** - Per-agency custom roles
3. **member_roles** - Junction table for role assignments
4. **member_permission_overrides** - Individual overrides

### Key Fields

```sql
-- agency_members additions
member_type ENUM('owner', 'admin', 'seated_user')

-- agencies additions
owner_id UUID REFERENCES auth.users(id)
```

## Best Practices

1. **Start with templates** - Copy and customize rather than building from scratch
2. **Use roles, not overrides** - Overrides should be exceptions, not the rule
3. **Keep roles focused** - One role per job function, combine for complex needs
4. **Review regularly** - Audit permissions quarterly
5. **Document custom roles** - Add descriptions explaining the role's purpose

## Troubleshooting

### User can't see a section
1. Check if user has the view permission for that section
2. Check if the section is in the role's `section_access`
3. Check for any negative overrides

### User has too many permissions
1. Review assigned roles - remove unnecessary ones
2. Check for overly permissive custom roles
3. Add explicit deny overrides if needed

### Can't access billing
1. Verify you are the agency owner (not just admin)
2. Check `member_type` in `agency_members` table
3. Contact support if ownership needs to be transferred

---

**Version:** 1.0
**Last Updated:** 2025-01-25
