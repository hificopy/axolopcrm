# Supabase Authentication Setup Guide

This guide will help you configure Supabase authentication for Axolop CRM.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Project URL and API keys from Supabase Dashboard

## Step 1: Configure Environment Variables

Add the following to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend Environment Variables (Vite)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Where to Find These Values:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → SUPABASE_URL
   - **anon/public key** → SUPABASE_ANON_KEY
   - **service_role key** → SUPABASE_SERVICE_ROLE_KEY (⚠️ Keep this secret!)

## Step 2: Configure Supabase Auth Settings

### 2.1 Enable Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase Dashboard
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable email provider
   - ✅ Confirm email (recommended for production)
   - Set **Secure email change** to enabled

### 2.2 Configure Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (development) or your production URL
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://yourdomain.com/**`
   - `http://localhost:3000/update-password`
   - `https://yourdomain.com/update-password`

### 2.3 Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup**: Welcome email with confirmation link
   - **Reset password**: Password reset email
   - **Magic link**: Magic link login email (if using)

## Step 3: Enable Google OAuth (Optional)

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: Axolop CRM
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://yourdomain.com`
   - **Authorized redirect URIs**:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
7. Save and copy **Client ID** and **Client Secret**

### 3.2 Configure in Supabase

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Find and enable **Google** provider
3. Enter:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Save changes

## Step 4: Set Up Database Schema

### 4.1 Create Users Table (if not exists)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  role TEXT DEFAULT 'USER',
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    first_name,
    last_name,
    profile_picture,
    email_verified,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END,
    'USER'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name),
    profile_picture = COALESCE(EXCLUDED.profile_picture, users.profile_picture),
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Step 5: Test Authentication Flow

### 5.1 Test Email/Password Sign Up

1. Navigate to `http://localhost:3000/signup`
2. Fill in the form with:
   - Full Name
   - Email
   - Password (min 8 characters)
3. Click "Create Account"
4. Check your email for confirmation link (if email confirmation is enabled)
5. Confirm your email and sign in

### 5.2 Test Email/Password Sign In

1. Navigate to `http://localhost:3000/signin`
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to `/app/dashboard`

### 5.3 Test Google OAuth (if configured)

1. Navigate to `http://localhost:3000/signin`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. You should be redirected back to your app

### 5.4 Test Password Reset

1. Navigate to `http://localhost:3000/forgot-password`
2. Enter your email
3. Check your email for reset link
4. Click the link and set a new password
5. Sign in with your new password

## Step 6: Production Deployment

### Before Going to Production:

1. **Enable Email Confirmation**:
   - Go to **Authentication** → **Providers** → **Email**
   - Enable "Confirm email"

2. **Update Redirect URLs**:
   - Replace localhost URLs with your production domain
   - Example: `https://yourdomain.com/**`

3. **Secure Your Service Role Key**:
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend
   - Only use it on the backend/server

4. **Configure Email Rate Limiting**:
   - Go to **Authentication** → **Rate Limits**
   - Set appropriate limits for your use case

5. **Set Up Custom SMTP** (Recommended):
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Configure your own email service (SendGrid, AWS SES, etc.)
   - This ensures better deliverability and removes Supabase branding

## Troubleshooting

### Issue: "Invalid Redirect URL"

**Solution**: Make sure your redirect URL is added to the allowed list in:
- **Authentication** → **URL Configuration** → **Redirect URLs**

### Issue: "User not confirmed"

**Solution**:
- Check if email confirmation is enabled
- If yes, confirm the email address via the link sent
- Or disable email confirmation in development

### Issue: "Failed to create user in database"

**Solution**:
- Check that the `handle_new_user()` trigger is properly set up
- Verify RLS policies are configured correctly
- Check Supabase logs for detailed error messages

### Issue: OAuth redirect not working

**Solution**:
- Verify Google OAuth credentials are correct
- Check that redirect URIs match exactly in Google Console
- Ensure Supabase project URL is correct

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Enable email confirmation for production
3. ✅ Use strong password requirements
4. ✅ Keep service role key secret (never expose to frontend)
5. ✅ Set up appropriate RLS policies
6. ✅ Enable rate limiting
7. ✅ Monitor auth logs regularly
8. ✅ Use custom SMTP for email delivery

---

**Need Help?** Check the [main documentation](/docs/README.md) or reach out to the team.
