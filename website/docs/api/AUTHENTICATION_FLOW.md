# Axolop CRM - OAuth Authentication Flow

## Overview

The Axolop CRM system uses **Supabase Auth** as the primary authentication system with built-in OAuth providers (Google, GitHub, etc.) and support for external identity providers like Auth0. The authentication system works with Supabase PostgreSQL for user data storage and Row Level Security.

## Architecture

```
┌─────────────────┐    OAuth Flow     ┌─────────────────┐
│     User        │ ────────────────▶ │  Supabase Auth  │
│   (Browser)     │                   │  Identity       │
└─────────┬───────┘                   │  Provider       │
          │                           └─────────┬───────┘
          │                                   │
          │ JWT Token                         │ User Info
          │                                   │
          ▼                                   ▼
┌─────────────────────────────────────────────────────────┐
│                CRM Application                          │
├─────────────────────────────────────────────────────────┤
│  Frontend (React)        │  Backend (Express)          │
│  ┌─────────────────────┐ │  ┌────────────────────────┐ │
│  │ Supabase Auth SDK   │ │  │ Token Verification     │ │
│  │ (useUser hook)      │ │  │ & Database Integration │ │
│  └─────────┬───────────┘ │  └─────────┬──────────────┘ │
│            │             │            │                │
│            │ API Calls   │            │ Database Ops   │
│            ▼             │            ▼                │
│  ┌─────────────────────┐ │  ┌────────────────────────┐ │
│  │ API requests with   │ │  │ Supabase queries with  │ │
│  │ Authorization header│ │  │ Row Level Security     │ │
│  └─────────────────────┘ │  └────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. User Login Process

1. **User visits CRM application**
   - If not authenticated, redirected to Supabase Auth login page (for built-in providers) or external IDP
   - Uses Supabase Auth methods for OAuth flow

2. **OAuth Authorization Code Flow**
   - User enters credentials on Supabase Auth-hosted login page or external IDP
   - Identity provider validates credentials and issues authorization code
   - Browser is redirected back to CRM with authorization code

3. **Token Exchange**
   - CRM exchanges authorization code for JWT tokens
   - Access token and ID token are stored securely

4. **Application Access**
   - User is redirected to requested page
   - Authenticated session begins

### 2. API Authentication

1. **Header Injection**
   - Frontend automatically adds `Authorization: Bearer <access_token>` header
   - Uses Supabase Auth SDK to manage token lifecycle

2. **Token Verification**
   - Backend receives request with authorization header
   - Verifies JWT signature and validity
   - Extracts user information from token

3. **Database Integration**
   - User ID from token is used for Row Level Security
   - Supabase queries respect user permissions
   - User can only access their own data

## Current Implementation

### Frontend (React)
- Uses `@supabase/supabase-js` SDK for authentication
- Supabase provider initialization with OAuth support
- `useUser` hook provides authentication state
- Protected routes check authentication state

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For external Auth0 integration
# AUTH0_DOMAIN=your-domain.auth0.com
# AUTH0_CLIENT_ID=your_client_id
# JWT_SECRET=your_jwt_secret_min_32_chars

# Frontend Vars
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Backend Considerations
- JWT verification middleware should validate tokens
- User roles and permissions extracted from token claims
- Supabase Row Level Security enforces data access rules
- Supabase queries include user ID as filter for security

## OAuth Integration with Supabase

### User Synchronization
1. When user authenticates via Supabase OAuth or external IDP, their profile information is retrieved
2. CRM system checks if user exists in Supabase PostgreSQL
3. If new user, creates record in `users` table with:
   - `id`: User's Supabase Auth ID
   - `email`: From OAuth provider profile
   - `name`: From OAuth provider profile
   - `role`: Default to USER
   - `isActive`: true

### Row Level Security Policies
Supabase RLS policies ensure users can only access:
- Their own user record
- Leads they own
- Deals they own
- Tasks assigned to them
- Interactions they recorded
- Their own notes, activities, etc.

### Example RLS Policy
```sql
-- Only allow users to access their own data
CREATE POLICY "Users can access own profile" ON users
  FOR ALL TO authenticated
  USING (auth.uid() = id);
```

## Google OAuth Integration

For Gmail integration, the system also supports:
- `@react-oauth/google` for Google OAuth
- Gmail API integration
- Email synchronization
- Calendar integration (planned)

## Security Features

### JWT Token Management
- Short-lived access tokens (typically 1 hour)
- Refresh tokens for seamless experience
- Secure storage in memory (not localStorage for sensitive apps)

### Row Level Security
- Database-level security ensures data isolation
- Even if application has bugs, database remains secure
- Fine-grained control over data access

### Session Management
- Auth0 manages session state
- Secure token refresh
- Automatic logout after inactivity

## Error Handling

### Authentication Errors
- Redirect to login on expired/invalid tokens
- Graceful error messages for users
- Proper logging for debugging

### Fallback Authentication
- Development mode bypass for testing
- Local authentication for offline development

## Future Enhancements

### Multi-Tenant Support
- Organization-based data isolation
- Team-based access controls

### Additional OAuth Providers
- Microsoft OAuth for Outlook integration
- Other CRM integrations

### Enhanced Authorization
- Role-based permissions beyond basic RLS
- Permission management UI

## Troubleshooting

### Common Issues
- Token expiration during long operations
- CORS configuration between frontend and Auth0
- Environment variable configuration

### Debugging
- Check Auth0 dashboard for authentication logs
- Verify environment variables are correctly set
- Test token verification independently