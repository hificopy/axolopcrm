# Authentication Debugging Guide

Complete guide for debugging and verifying your Supabase authentication setup.

## Quick Test

### 1. Visit the Test Page
Navigate to: **http://localhost:3000/auth-test**

This page will automatically run tests and show you:
- ✅ Supabase client initialization status
- ✅ Environment variables configuration
- ✅ Active session status
- ✅ User authentication status
- ✅ Backend connection with auth token

All tests should show **Pass** (green) or **Warning** (yellow, if not signed in).

### 2. Check Browser Console

Open browser DevTools (F12) and look for:
- ✅ No red errors related to Supabase
- ✅ "✅ Redis connected" message
- ✅ "✅ ChromaDB initialized" message (if enabled)

## Common Issues & Solutions

### Issue 1: "Supabase environment variables are not set"

**Symptoms:**
- Test page shows "Environment Variables: Fail"
- Console warning: "Supabase environment variables are not set"

**Solution:**
```bash
# 1. Check your .env file exists
ls -la .env

# 2. Verify it contains:
cat .env | grep VITE_SUPABASE

# Should show:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 3. If missing, add them:
echo "VITE_SUPABASE_URL=your_url_here" >> .env
echo "VITE_SUPABASE_ANON_KEY=your_key_here" >> .env

# 4. Restart dev server
npm run dev
```

### Issue 2: "Authentication token is invalid or missing"

**Symptoms:**
- API requests fail with 401 Unauthorized
- Backend logs show "Authentication error"

**Solution:**

1. **Check if user is signed in:**
   ```javascript
   // In browser console
   const supabase = window.__SUPABASE_CLIENT__
   const session = await supabase.auth.getSession()
   console.log(session)
   ```

2. **Verify token is being sent:**
   - Open DevTools → Network tab
   - Make an API request
   - Click on the request
   - Check Headers → Authorization
   - Should see: `Bearer eyJ...`

3. **Test token manually:**
   ```bash
   # Get your access token from browser
   # Then test with curl:
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3002/health
   ```

### Issue 3: "Failed to sign in" / "Invalid credentials"

**Symptoms:**
- Sign in form shows error
- User exists but can't sign in

**Solutions:**

**A. Check Supabase Auth Settings:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Verify "Enable email provider" is ON
3. Check if "Confirm email" is enabled:
   - If YES: User must confirm email first
   - If NO: User can sign in immediately

**B. Check user exists:**
```sql
-- In Supabase SQL Editor
SELECT * FROM auth.users WHERE email = 'user@example.com';
SELECT * FROM public.users WHERE email = 'user@example.com';
```

**C. Reset password:**
1. User goes to /forgot-password
2. Enters email
3. Checks email for reset link
4. Sets new password

### Issue 4: OAuth (Google) not working

**Symptoms:**
- "OAuth redirect error"
- Stuck on Google OAuth page
- Redirected to error page

**Solutions:**

**A. Check Google OAuth Credentials:**
1. Go to Google Cloud Console
2. Check Authorized redirect URIs includes:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```

**B. Check Supabase OAuth Settings:**
1. Supabase Dashboard → Authentication → Providers
2. Google provider is enabled
3. Client ID and Secret are correct

**C. Check redirect URL:**
```javascript
// In SupabaseContext.jsx
options: {
  redirectTo: `${window.location.origin}/app/home`
}
```

### Issue 5: User signed in but API requests fail

**Symptoms:**
- User object exists
- Session is active
- But API calls return 401

**Solutions:**

**A. Check token in requests:**
```javascript
// In browser console
const token = localStorage.getItem('supabase.auth.token')
console.log(token)
```

**B. Verify backend middleware:**
```bash
# Check backend logs
# Should see: "Authentication error:" if token is invalid
```

**C. Test backend directly:**
```bash
# 1. Get your access token from browser (F12 → Application → Local Storage)
# 2. Test health endpoint:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3002/health
```

### Issue 6: Password reset not working

**Symptoms:**
- No email received
- Email received but link doesn't work

**Solutions:**

**A. Check SMTP Configuration:**
1. Supabase Dashboard → Settings → Auth
2. Check SMTP settings
3. For development, check spam folder

**B. Check redirect URL:**
```javascript
// Should be in SupabaseContext.jsx
redirectTo: `${window.location.origin}/update-password`
```

**C. Verify email template:**
1. Supabase Dashboard → Authentication → Email Templates
2. Check "Reset Password" template
3. Verify {{ .ConfirmationURL }} is present

### Issue 7: CORS Errors

**Symptoms:**
- Browser console shows CORS policy error
- Requests blocked from frontend to backend

**Solutions:**

**A. Check backend CORS config:**
```javascript
// In backend/index.js
app.use(cors({
  origin: config.frontendUrl, // Should be http://localhost:3000
  credentials: true,
}));
```

**B. Verify environment variables:**
```bash
# In backend .env
FRONTEND_URL=http://localhost:3000
```

**C. Restart backend:**
```bash
cd backend
npm run dev
```

## Verification Checklist

### Frontend Setup ✓

- [ ] `VITE_SUPABASE_URL` in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` in `.env`
- [ ] `VITE_API_URL` in `.env` (default: http://localhost:3002)
- [ ] SupabaseProvider wrapping App in `main.jsx`
- [ ] Auth routes accessible (/signin, /signup)
- [ ] Test page accessible (/auth-test)

### Backend Setup ✓

- [ ] `SUPABASE_URL` in `.env`
- [ ] `SUPABASE_ANON_KEY` in `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- [ ] Backend server running (port 3002)
- [ ] Health endpoint responding: http://localhost:3002/health
- [ ] Auth middleware imported and used on protected routes

### Supabase Setup ✓

- [ ] Email provider enabled
- [ ] Redirect URLs configured:
  - `http://localhost:3000/**`
  - `http://localhost:3000/update-password`
- [ ] Users table created with RLS policies
- [ ] `handle_new_user()` trigger created
- [ ] (Optional) Google OAuth configured

### Database Setup ✓

- [ ] `public.users` table exists
- [ ] RLS policies are active
- [ ] Trigger `on_auth_user_created` exists
- [ ] Test query works:
  ```sql
  SELECT * FROM public.users LIMIT 1;
  ```

## Testing Steps

### Test 1: Sign Up Flow

1. **Go to:** http://localhost:3000/signup
2. **Fill form:**
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123
3. **Submit**
4. **Expected:**
   - Success message appears
   - Redirected to /signin (if email confirmation required)
   - OR redirected to /app/home (if no confirmation)
5. **Verify in Supabase:**
   ```sql
   SELECT * FROM auth.users WHERE email = 'test@example.com';
   SELECT * FROM public.users WHERE email = 'test@example.com';
   ```

### Test 2: Sign In Flow

1. **Go to:** http://localhost:3000/signin
2. **Enter credentials**
3. **Submit**
4. **Expected:**
   - Redirected to /app/home
   - User menu shows in Topbar (top right)
   - User initials displayed
5. **Verify:**
   - Open DevTools → Application → Local Storage
   - Should see `supabase.auth.token`

### Test 3: Protected Route

1. **Sign out** (click user menu → Sign Out)
2. **Try to access:** http://localhost:3000/app/home
3. **Expected:**
   - Redirected to /signin
4. **Sign in again**
5. **Expected:**
   - Successfully access /app/home

### Test 4: API Request with Auth

1. **Sign in** at /signin
2. **Open browser console** (F12)
3. **Run:**
   ```javascript
   fetch('http://localhost:3002/health', {
     headers: {
       'Authorization': `Bearer ${(await window.__SUPABASE_CLIENT__.auth.getSession()).data.session.access_token}`
     }
   })
   .then(r => r.json())
   .then(console.log)
   ```
4. **Expected:**
   - Returns health status with database: "connected"

### Test 5: Password Reset

1. **Go to:** http://localhost:3000/forgot-password
2. **Enter email:** test@example.com
3. **Submit**
4. **Check email** (might be in spam)
5. **Click reset link**
6. **Expected:**
   - Redirected to /update-password
   - Can set new password
   - Redirected to /signin
   - Can sign in with new password

## Debug Commands

### Check Environment Variables
```bash
# Frontend
cat .env | grep VITE_SUPABASE

# Backend
cat .env | grep SUPABASE
```

### Check Supabase Connection
```bash
# In frontend/pages/AuthTest.jsx (or browser console)
const { supabase } = useSupabase();
const { data, error } = await supabase.auth.getSession();
console.log({ data, error });
```

### Check Backend Server
```bash
curl http://localhost:3002/health
```

### Check Database
```sql
-- Users table
SELECT * FROM public.users;

-- Auth users
SELECT * FROM auth.users;

-- Check trigger
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### View Logs
```bash
# Backend logs
cd backend
npm run dev
# Watch for errors in console

# Browser logs
# F12 → Console
# Look for red errors
```

## Getting Help

### 1. Check Test Page First
Always start with http://localhost:3000/auth-test

### 2. Check Logs
- **Browser Console:** F12 → Console
- **Backend Console:** Terminal where backend is running
- **Supabase Logs:** Dashboard → Logs

### 3. Common Log Messages

**Good (No Issues):**
```
✅ Redis connected
✅ ChromaDB initialized
Supabase client is properly initialized
```

**Bad (Needs Attention):**
```
❌ Redis error
Supabase environment variables are not set
Authentication error: Invalid JWT token
```

### 4. Reset Everything

If all else fails:
```bash
# 1. Stop servers
# 2. Clear browser data (F12 → Application → Clear storage)
# 3. Reset .env
# 4. Restart servers
npm run dev
```

## Advanced Debugging

### Enable Verbose Logging

**Frontend:**
```javascript
// In SupabaseContext.jsx
const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
    persistSession: true,
  }
});
```

**Backend:**
```javascript
// In middleware/auth.js
console.log('Auth header:', req.headers.authorization);
console.log('Token:', token);
console.log('User:', user);
```

### Network Tab Inspection

1. Open DevTools → Network
2. Filter: XHR
3. Make auth request
4. Click request
5. Check:
   - Headers → Authorization
   - Response → Error details

### SQL Debugging

```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Check if user profile exists
SELECT * FROM public.users WHERE email = 'user@example.com';

-- Check trigger is working
SELECT * FROM pg_trigger WHERE tgname LIKE '%user%';

-- Test trigger manually
SELECT public.handle_new_user();
```

---

**Need more help?** Check:
- `AUTH_IMPLEMENTATION_SUMMARY.md` for feature overview
- `SUPABASE_AUTH_SETUP.md` for setup instructions
- `QUICK_START_AUTH.md` for quick setup guide
