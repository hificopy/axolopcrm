# User Hierarchy & Permissions

**Last Updated**: 2025-01-24  
**Version**: 1.0

---

## 👥 User Types

Axolop CRM implements a multi-tiered user hierarchy designed for agency operations with different access levels and permissions.

### 1. God Mode Users

**Access**: axolopcrm@gmail.com + whitelisted accounts

**Capabilities:**

- ✅ Unlimited access to all features
- ✅ Can access beta features before public release
- ✅ Admin bypass for all permissions
- ✅ Can create unlimited agencies
- ✅ No subscription limits or restrictions
- ✅ Full system administration access

**Use Case**: Internal development, testing, and system administration

---

### 2. Agency Admins

**Access**: Paying users who own agencies

**Capabilities:**

- ✅ Full management permissions for their agency
- ✅ Can invite/remove team members
- ✅ Manage subscription and billing
- ✅ Configure agency settings and branding
- ✅ Access to all features included in their subscription tier
- ✅ Create and manage workflows, forms, campaigns
- ✅ View analytics and reports

**Limits by Subscription Tier:**

- **Sales Tier**: 1 agency, 3 team members
- **Build Tier**: 1 agency, 5 team members
- **Scale Tier**: Unlimited agencies, unlimited team members

**Use Case**: Agency owners and managers who run their business on Axolop CRM

---

### 3. Seated Users (Team Members)

**Access**: Invited team members within an agency

**Capabilities:**

- ✅ View-only access to most features
- ✅ Can view leads, contacts, and pipeline
- ✅ Can view forms and campaigns
- ✅ Can access calendar and meetings
- ❌ Cannot edit, delete, or manage settings
- ❌ Cannot invite other users
- ❌ Cannot access billing or subscription settings

**Limits:**

- Included in agency's subscription (3 free seats + $12/seat/month)
- Cannot perform administrative actions
- Read-only access to sensitive data

**Use Case**: Sales reps, account managers, and other team members who need access to data but not administrative control

---

### 4. Free Users

**Access**: Users without agency ownership

**Capabilities:**

- ✅ Limited feature access
- ✅ Basic contact management
- ✅ Can explore the platform
- ❌ No advanced features
- ❌ No team collaboration
- ❌ No custom branding

**Limits:**

- No agency ownership
- Limited to basic CRM features
- Cannot invite team members

**Use Case**: Individual users exploring the platform or using basic CRM functionality

---

### 5. Trial Users

**Access**: Agency admins on trial period

**Capabilities:**

- ✅ Temporary full access to Build tier features
- ✅ Full functionality during trial period
- ✅ Can invite team members
- ✅ Can test all features
- ❌ Trial period limitations (14 days)

**Limits:**

- 14-day trial period
- Must provide payment method to continue
- Automatic downgrade to Free tier if not upgraded

**Use Case**: Potential customers evaluating the platform before purchase

---

## 🔐 Permission Matrix

| Feature                    | God Mode | Agency Admin    | Seated User | Free User | Trial User |
| -------------------------- | -------- | --------------- | ----------- | --------- | ---------- |
| **Agency Management**      | ✅       | ✅              | ❌          | ❌        | ✅         |
| **User Management**        | ✅       | ✅              | ❌          | ❌        | ✅         |
| **Billing & Subscription** | ✅       | ✅              | ❌          | ❌        | ❌         |
| **Lead Management**        | ✅       | ✅              | ✅ (View)   | ✅        | ✅         |
| **Contact Management**     | ✅       | ✅              | ✅ (View)   | ✅        | ✅         |
| **Pipeline Management**    | ✅       | ✅              | ✅ (View)   | ❌        | ✅         |
| **Forms Builder**          | ✅       | ✅              | ✅ (View)   | ❌        | ✅         |
| **Email Campaigns**        | ✅       | ✅              | ✅ (View)   | ❌        | ✅         |
| **Workflows**              | ✅       | ✅              | ✅ (View)   | ❌        | ✅         |
| **Analytics & Reports**    | ✅       | ✅              | ✅ (View)   | ❌        | ✅         |
| **Calendar & Meetings**    | ✅       | ✅              | ✅          | ✅        | ✅         |
| **Custom Fields**          | ✅       | ✅              | ❌          | ❌        | ✅         |
| **API Access**             | ✅       | ✅ (Scale only) | ❌          | ❌        | ❌         |
| **White Labeling**         | ✅       | ✅ (Scale only) | ❌          | ❌        | ❌         |

---

## 🏢 Agency System

### Multi-Tenant Architecture

- **Complete Data Isolation** - Each agency's data is completely separated
- **Security Boundaries** - Users can only access their own agency's data
- **Resource Limits** - Each agency is limited by their subscription tier
- **Independent Configuration** - Each agency can configure their own settings

### Agency Limits by Tier

| Feature           | Sales Tier | Build Tier | Scale Tier |
| ----------------- | ---------- | ---------- | ---------- |
| **Agencies**      | 1          | 1          | Unlimited  |
| **Team Members**  | 3          | 5          | Unlimited  |
| **Leads/Month**   | 500        | 2,000      | Unlimited  |
| **Emails/Month**  | 1,000      | 5,000      | Unlimited  |
| **Storage**       | 5GB        | 50GB       | 500GB      |
| **Forms**         | 5          | 10         | Unlimited  |
| **Workflows**     | 5          | 10         | Unlimited  |
| **Custom Fields** | ✅         | ✅         | ✅         |
| **API Access**    | ❌         | ❌         | ✅         |
| **White Label**   | ❌         | ❌         | ✅         |

---

## 💳 Seat Management

### Free Seats

- **Sales Tier**: 3 free seats included
- **Build Tier**: 5 free seats included
- **Scale Tier**: Unlimited seats

### Additional Seats

- **Cost**: $12 per seat per month
- **Billing**: Pro-rated for partial months
- **Activation**: Immediate upon payment
- **Deactivation**: At end of billing period

### Seat Types

- **Admin Seats**: Full access (Agency Admins)
- **Member Seats**: Read-only access (Seated Users)

---

## 🔒 Security & Access Control

### Authentication

- **Supabase Auth** - Secure user authentication
- **JWT Tokens** - API authentication
- **Session Management** - Secure session handling
- **Password Security** - Strong password requirements

### Data Protection

- **User Isolation** - Users can only access their own data
- **Agency Isolation** - Complete data separation between agencies
- **Role-Based Access** - Permissions enforced by user role
- **API Security** - All API endpoints enforce permissions

### Audit Trail

- **User Activity Logging** - Track all user actions
- **Access Logs** - Monitor access patterns
- **Permission Changes** - Log all permission modifications
- **Data Access** - Track data access by users

---

## 🚀 Implementation Status

### ✅ Fully Implemented

- User authentication and authorization
- Agency creation and management
- User hierarchy and permissions
- Seat management system
- Role-based access control
- Multi-tenant data isolation
- Subscription tier enforcement

### 🚧 Partially Implemented

- Trial system (backend ready, frontend needs work)
- Billing management (mock data only)
- Subscription lifecycle (Stripe integration needed)

### ❌ Not Implemented

- Advanced permission granularity
- Custom role creation
- Permission templates
- Advanced audit reporting

---

## 📚 Related Documentation

- [Pricing Guide](../PRICING_GUIDE.md) - Subscription tiers and billing
- [Agency Setup](../user-guide/AGENCY_SETUP.md) - Setting up your agency
- [Authentication System](../authentication/AUTH_SYSTEM_STATUS.md) - Auth implementation details
- [Database Schema](../database/SCHEMA.md) - Database structure for users and agencies

---

## 🆘 Support

For questions about user hierarchy and permissions:

- **Documentation**: [docs/README.md](../README.md)
- **Authentication Issues**: [Authentication Troubleshooting](../troubleshooting/AUTHENTICATION_ISSUES.md)
- **Permission Problems**: [Permission Troubleshooting](../troubleshooting/PERMISSION_ISSUES.md)

---

**Last Updated**: 2025-01-24  
**Next Review**: 2025-02-24  
**Maintainer**: Development Team
