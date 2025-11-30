# Setting up Auth0 as an OAuth Provider in Supabase

## Supabase Configuration

1. **Go to your Supabase Dashboard**:
   - Navigate to your project: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/auth/external
   - Click on "Authentication" -> "External OAuth providers"

2. **Configure Auth0 as an External Provider**:
   - Enable the Auth0 provider
   - Set the following configuration:
     - **Client ID**: `your_auth0_client_id`
     - **Client Secret**: `your_auth0_client_secret`
     - **URL**: `your_auth0_url`
     - **Redirect URI**: `https://fuclpfhitgwugxogxkmw.supabase.co/auth/v1/callback`

3. **Update your Supabase Auth Settings**:
   - Go to Authentication Settings
   - Under "Site URL", add: `http://localhost:3000`
   - Under "Redirect URLs", add: 
     - `http://localhost:3000`
     - `http://localhost:3002`
     - `https://fuclpfhitgwugxogxkmw.supabase.co/auth/v1/callback`

## Auth0 Configuration

1. **In your Auth0 Dashboard** (https://manage.auth0.com):
   - Go to Applications -> Application
   - Select your application or create a new "Regular Web Application"
   - In the "Settings" tab, configure:
     - **Allowed Callback URLs**: `https://fuclpfhitgwugxogxkmw.supabase.co/auth/v1/callback`
     - **Allowed Logout URLs**: `http://localhost:3000, https://fuclpfhitgwugxogxkmw.supabase.co`
     - **Allowed Web Origins**: `http://localhost:3000, http://localhost:3002`
     - **Allowed Origins (CORS)**: `http://localhost:3000, http://localhost:3002`

2. **Create API in Auth0** (if needed):
   - Go to APIs -> Create API
   - Name: "Supabase CRM API"
   - Identifier: `https://fuclpfhitgwugxogxkmw.supabase.co`
   - Signing Algorithm: RS256

## Backend Configuration

The backend is already configured to work with Supabase Auth. Key components:

- `backend/config/supabase-auth.js` - Contains Supabase client configuration
- User profile synchronization between Supabase Auth and application users table
- Authentication middleware

## Frontend Configuration

The frontend is configured to use Supabase OAuth login:

- `frontend/context/SupabaseContext.js` - Main Supabase authentication context
- OAuth provider method: `signInWithOAuth('auth0')` can be used to initiate Auth0 login

Example usage in components:
```javascript
import { useSupabase } from '../context/SupabaseContext';

function LoginButton() {
  const { signInWithOAuth } = useSupabase();
  
  const handleLogin = () => {
    // This will use the configured external providers including Auth0
    signInWithOAuth('auth0'); 
  };
  
  return (
    <button onClick={handleLogin}>
      Sign in with Auth0
    </button>
  );
}
```

## Environment Variables

Make sure your `.env` file contains:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
```

## Testing the Integration

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Try logging in** using Auth0:
   - The application will redirect to Auth0 for authentication
   - After successful authentication, user will be redirected back to your app
   - User profile will be created in the Supabase `users` table

3. **Verify the user**:
   - Check that the user appears in both Supabase Auth and the `users` table
   - Confirm that RLS policies are working as expected

## Troubleshooting

### Common Issues:
- **Redirect URL mismatch**: Ensure callback URLs match in both Supabase and Auth0
- **CORS issues**: Check that all origins are properly configured
- **User synchronization**: Make sure the `handle_new_user` trigger is working

### Debugging:
- Check Supabase logs in the dashboard
- Verify Auth0 logs in the Auth0 dashboard
- Test the connection with the health check endpoint: `GET /health`

## Security Notes

- The Supabase RLS policies ensure users can only access their own data
- JWT tokens from Supabase Auth are validated automatically
- All database operations are secured through RLS policies