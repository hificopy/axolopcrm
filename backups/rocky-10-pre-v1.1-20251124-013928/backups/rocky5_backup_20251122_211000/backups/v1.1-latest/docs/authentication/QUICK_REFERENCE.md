# Authentication System - Quick Reference

## 🚀 Quick Commands

```bash
# Verify schema deployment
npm run verify:schema

# Test authentication system
npm run test:auth

# Start development
npm run dev

# Start backend only
npm run backend
```

## 📝 Deployment Checklist

### Step 1: Deploy Database Schema ⚠️ CRITICAL
1. Open: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
2. Copy: `backend/db/users-schema.sql`
3. Paste and Run in SQL Editor
4. Verify: `npm run verify:schema`

### Step 2: Test System
```bash
# Start backend
npm run backend

# In another terminal, test
npm run test:auth
```

### Step 3: Implement UI Features
- [ ] Email verification banner → `frontend/components/EmailVerificationBanner.jsx`
- [ ] Connect Profile page → `frontend/pages/Profile.jsx`
- [ ] Connect Settings page → `frontend/pages/AccountSettings.jsx`

## 🔗 API Endpoints

All endpoints require authentication (Bearer token in header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update profile |
| GET | `/api/v1/users/me/settings` | Get user settings |
| PUT | `/api/v1/users/me/settings` | Update settings |
| POST | `/api/v1/users/me/avatar` | Upload avatar |
| DELETE | `/api/v1/users/me` | Delete account |
| GET | `/api/v1/users/me/activity` | Get activity log |
| POST | `/api/v1/users/me/verify-email` | Request verification |

## 📦 Files Created

### Backend
- ✅ `backend/routes/users.js` - User API routes
- ✅ `backend/db/users-schema.sql` - Database schema

### Frontend
- ✅ `frontend/pages/SignIn.jsx` - Sign in page
- ✅ `frontend/pages/SignUp.jsx` - Sign up page
- ✅ `frontend/pages/ForgotPassword.jsx` - Password reset
- ✅ `frontend/pages/UpdatePassword.jsx` - Reset completion
- ✅ `frontend/pages/AuthTest.jsx` - Testing page

### Documentation
- ✅ `COMPLETE_AUTH_AUDIT.md` - Full audit
- ✅ `AUTH_SYSTEM_STATUS.md` - Current status
- ✅ `DEPLOY_USERS_SCHEMA.md` - Deployment guide
- ✅ `QUICK_REFERENCE_AUTH.md` - This file

### Scripts
- ✅ `scripts/verify-users-schema.js` - Schema verification
- ✅ `scripts/test-auth-system.js` - Integration tests

## 🔧 Common Tasks

### Test User API
```bash
# 1. Sign in to get token
# 2. Copy token from browser localStorage
# 3. Test endpoint:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3002/api/v1/users/me
```

### Update User Profile (Frontend)
```jsx
import api from '@/lib/api';

// Get profile
const { data } = await api.get('/users/me');

// Update profile
await api.put('/users/me', {
  name: 'New Name',
  phone: '+1234567890',
  company: 'My Company'
});
```

### Update User Settings (Frontend)
```jsx
// Get settings
const { data } = await api.get('/users/me/settings');

// Update settings
await api.put('/users/me/settings', {
  theme: 'dark',
  email_notifications: true,
  language: 'en'
});
```

## ⚡ Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Auth Pages | ✅ Complete | Sign in, sign up, reset working |
| Backend API Routes | ✅ Complete | 8 endpoints ready |
| Database Schema | ⚠️ Not Deployed | Run SQL in Supabase |
| Email Verification | ⏳ Pending | UI components needed |
| Profile Page Integration | ⏳ Pending | Connect to API |
| Settings Integration | ⏳ Pending | Connect to API |

## 📚 Documentation Links

- **Full Audit:** `COMPLETE_AUTH_AUDIT.md`
- **Current Status:** `AUTH_SYSTEM_STATUS.md`
- **Deployment Guide:** `DEPLOY_USERS_SCHEMA.md`
- **Setup Guide:** `QUICK_START_AUTH.md`
- **Debugging:** `AUTH_DEBUGGING_GUIDE.md`

## 🎯 Next Actions

1. **Deploy Schema** (5 min) → Follow `DEPLOY_USERS_SCHEMA.md`
2. **Verify** (1 min) → `npm run verify:schema`
3. **Test** (2 min) → `npm run test:auth`
4. **Implement UI** (3-4 hours) → See `AUTH_SYSTEM_STATUS.md`

---

**Questions?** Check `COMPLETE_AUTH_AUDIT.md` for detailed guidance.
