# Authentication & Routing - Quick Reference

## 🎯 User Types

| Type | Email | Subscription Status | Access Level |
|------|-------|-------------------|--------------|
| **God User** | `axolopcrm@gmail.com`<br>`kate@kateviolet.com` | Any | ✅ FULL - Bypasses everything |
| **Paid User** | Any | `active`, `trialing`, etc. | ✅ FULL - App access |
| **Free User** | Any | `none`, `free`, or undefined | ❌ LIMITED - Plan selection only |

---

## 🔑 God User Detection

```javascript
const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];
const isGodUser = GOD_EMAILS.includes(user.email?.toLowerCase());
```

**RULE:** Always check God users FIRST, before any other checks.

---

## 🛣️ Routing Rules

### God Users
- ✅ `/app/*` → Allow all app pages
- 🔀 `/select-plan` → Redirect to `/app/home`
- ✅ Full access to everything

### Paid Users
- ✅ `/app/*` → Allow all app pages
- 🔀 `/select-plan` → Redirect to `/app/home`
- ✅ Full app access

### Free Users
- 🔀 `/app/*` → Redirect to `/select-plan`
- ✅ `/select-plan` → Allow
- ❌ No app access until plan selected

---

## 📋 Component Checklist

### When Adding New Protected Routes

```jsx
// ✅ CORRECT - Use ProtectedRoute wrapper
<Route path="/new-page" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />

// ❌ WRONG - No protection
<Route path="/new-page" element={<NewPage />} />
```

### When Creating Redirect Logic

```javascript
// ✅ CORRECT - Check loading first
if (loading) return <LoadingSpinner />;

// ✅ CORRECT - Check God users first
if (isGodUser) return children;

// ✅ CORRECT - Use React Router
return <Navigate to="/path" replace />;

// ❌ WRONG - Use window.location
window.location.href = "/path"; // Creates loops!
```

---

## 🚫 Common Mistakes

### ❌ Don't Do This

```javascript
// 1. Using window.location instead of React Router
window.location.href = "/app/home"; // Causes loops!

// 2. Redirecting before loading completes
if (!user) {
  return <Navigate to="/signin" />; // May fire too early
}

// 3. Checking plan status before God status
if (!hasActivePlan) {
  return <Navigate to="/select-plan" />; // Catches God users!
}

// 4. Multiple redirect systems
// SupabaseContext redirects + ProtectedRoute redirects = LOOP
```

### ✅ Do This Instead

```javascript
// 1. Use React Router
return <Navigate to="/app/home" replace />;

// 2. Add loading guard
if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/signin" />;

// 3. Check God users first
if (isGodUser) return children;
if (!hasActivePlan) return <Navigate to="/select-plan" />;

// 4. Single redirect system
// All redirects in ProtectedRoute ONLY
```

---

## 🔧 Troubleshooting Checklist

### Infinite Redirect Loop

- [ ] Check if using `window.location.href` anywhere
- [ ] Verify only ProtectedRoute does redirects
- [ ] Add loading guards before all redirects
- [ ] Check for conflicting redirect logic

### God Users Seeing Plan Selection

- [ ] Verify email in `GOD_EMAILS` array
- [ ] Check email comparison is lowercase
- [ ] Ensure God check happens FIRST
- [ ] Remove plan checks for God users

### Infinite Loading Spinner

- [ ] Check if route renders component that redirects to itself
- [ ] Add loading guard in redirect components
- [ ] Verify dependency array in useEffect
- [ ] Check if component actually renders children

---

## 📍 File Locations

| Component | File |
|-----------|------|
| ProtectedRoute | `frontend/components/ProtectedRoute.jsx` |
| SupabaseContext | `frontend/context/SupabaseContext.jsx` |
| Supabase Singleton | `frontend/services/supabase-singleton.js` |
| SignIn | `frontend/pages/SignIn.jsx` |
| SelectPlan | `frontend/pages/SelectPlan.jsx` |
| App Routes | `frontend/App.jsx` |

---

## 🎨 ProtectedRoute Template

```javascript
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";

const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();

  // 1. Loading guard
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. Auth check
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // 3. God user bypass (CHECK FIRST!)
  const isGodUser = GOD_EMAILS.includes(user.email?.toLowerCase());
  if (isGodUser) {
    if (location.pathname === "/select-plan") {
      return <Navigate to="/app/home" replace />;
    }
    return children;
  }

  // 4. Paid user check
  const hasActivePlan =
    user.user_metadata?.subscription_status !== "none" &&
    user.user_metadata?.subscription_status !== "free";

  if (hasActivePlan) {
    if (location.pathname === "/select-plan") {
      return <Navigate to="/app/home" replace />;
    }
    return children;
  }

  // 5. Free user - force to select-plan
  if (location.pathname !== "/select-plan") {
    return <Navigate to="/select-plan" replace />;
  }

  // 6. Default - allow access
  return children;
};

export default ProtectedRoute;
```

---

## 🔍 Debug Logging

Add these logs to trace routing issues:

```javascript
console.log("[ProtectedRoute] Decision:", {
  email: user?.email,
  isGodUser,
  hasActivePlan,
  isFreeUser,
  path: location.pathname,
  timestamp: new Date().toISOString()
});
```

---

## 📊 Decision Matrix

| User Type | Current Route | Action |
|-----------|---------------|--------|
| God | `/signin` | → `/app/home` |
| God | `/select-plan` | → `/app/home` |
| God | `/app/*` | ✅ Allow |
| Paid | `/signin` | → `/app/home` |
| Paid | `/select-plan` | → `/app/home` |
| Paid | `/app/*` | ✅ Allow |
| Free | `/signin` | → `/select-plan` |
| Free | `/select-plan` | ✅ Allow |
| Free | `/app/*` | → `/select-plan` |
| None | Any | → `/signin` |

---

## ⚡ Quick Fixes

### Fix: Redirect Loop

```javascript
// Remove ALL redirects from SupabaseContext
// Keep ONLY in ProtectedRoute
```

### Fix: God User on Plan Selection

```javascript
// Add to ProtectedRoute - CHECK FIRST
if (isGodUser && location.pathname === "/select-plan") {
  return <Navigate to="/app/home" replace />;
}
```

### Fix: Infinite Loading

```javascript
// Replace HomeRedirect with actual component
<Route path="home" element={<Dashboard />} />
// NOT: <Route path="home" element={<HomeRedirect />} />
```

---

## 📚 Full Documentation

For comprehensive details, see [AUTHENTICATION_ROUTING_FLOW.md](./AUTHENTICATION_ROUTING_FLOW.md)

---

**Last Updated:** 2025-01-29
