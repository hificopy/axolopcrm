# Authentication & Routing Flow - Complete Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Types](#user-types)
3. [Authentication Architecture](#authentication-architecture)
4. [Routing System](#routing-system)
5. [Component Responsibilities](#component-responsibilities)
6. [Flow Diagrams](#flow-diagrams)
7. [Common Scenarios](#common-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Axolop CRM uses a sophisticated authentication and routing system that handles three types of users:
- **God Users** (Admin emails with unlimited access)
- **Paid Users** (Active subscriptions)
- **Free Users** (No subscription, limited to plan selection)

The system is designed to prevent redirect loops, provide seamless authentication, and ensure proper user isolation.

---

## User Types

### 1. God Users (Admin/Super Users)

**Definition:**
- Hardcoded admin email addresses with unlimited access
- Bypass ALL payment and plan restrictions
- Never see plan selection screens

**Hardcoded Emails:**
```javascript
const GOD_EMAILS = [
  "axolopcrm@gmail.com",
  "kate@kateviolet.com"
];
```

**Characteristics:**
- ✅ Full app access immediately upon authentication
- ✅ No subscription status checks
- ✅ No plan selection required
- ✅ Bypass onboarding restrictions
- ✅ Never redirected to `/select-plan`

**Detection Logic:**
```javascript
const userEmail = user.email?.toLowerCase() || "";
const isGodUser = GOD_EMAILS.includes(userEmail);

if (isGodUser) {
  // Immediate bypass - full access granted
  return children; // or redirect to /app/home
}
```

---

### 2. Paid Users

**Definition:**
- Users with active subscriptions or trials
- Full app access after payment
- Can use all features

**Detection Logic:**
```javascript
const subscriptionStatus = user?.user_metadata?.subscription_status || "none";
const hasActivePlan =
  subscriptionStatus !== "none" &&
  subscriptionStatus !== "free";

if (hasActivePlan) {
  // Full app access
  return children;
}
```

**Valid Subscription Statuses:**
- `"active"` - Active paid subscription
- `"trialing"` - Trial period active
- `"pro"`, `"enterprise"`, etc. - Any non-free plan

**Characteristics:**
- ✅ Full app access
- ✅ Redirected from `/select-plan` to `/app/home`
- ✅ All features unlocked
- ❌ Cannot access `/select-plan` (already has plan)

---

### 3. Free Users

**Definition:**
- Users without active subscriptions
- Must select a plan before accessing app
- Restricted to plan selection page

**Detection Logic:**
```javascript
const isFreeUser = !isGodUser && !hasActivePlan;

if (isFreeUser && location.pathname !== "/select-plan") {
  // Force redirect to plan selection
  return <Navigate to="/select-plan" replace />;
}
```

**Valid Free Statuses:**
- `"none"` - No subscription
- `"free"` - Free tier
- `undefined` - No status set

**Characteristics:**
- ❌ Cannot access app pages
- ✅ Must visit `/select-plan`
- ✅ Redirected to `/select-plan` from any app page
- ✅ Can sign in and sign up

---

## Authentication Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Stack                      │
├─────────────────────────────────────────────────────────────┤
│  1. SupabaseContext (State Management)                      │
│  2. Supabase Singleton (Client Management)                  │
│  3. ProtectedRoute (Route Guard)                            │
│  4. React Router (Navigation)                               │
└─────────────────────────────────────────────────────────────┘
```

### 1. SupabaseContext

**File:** `frontend/context/SupabaseContext.jsx`

**Responsibilities:**
- Initialize Supabase client
- Manage user session state
- Provide authentication methods
- Handle session persistence

**Key State:**
```javascript
const [user, setUser] = useState(null);
const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);
const [isInitialized, setIsInitialized] = useState(false);
const [supabase, setSupabase] = useState(null);
```

**Critical Rule:**
⚠️ **NO AUTO-REDIRECTS IN CONTEXT** - All redirects are handled by `ProtectedRoute` to prevent conflicts with React Router.

**Why No Auto-Redirects?**
- Using `window.location.href` in context causes page reloads
- Conflicts with React Router's `<Navigate />` components
- Creates redirect loops between competing systems
- Resets app state on every redirect

---

### 2. Supabase Singleton

**File:** `frontend/services/supabase-singleton.js`

**Purpose:**
- Single Supabase client instance across entire app
- Prevents multiple client initialization
- Manages cross-tab authentication sync

**Key Features:**
```javascript
class SupabaseSingleton {
  static instance = null;
  client = null;
  isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      return this.client; // Return existing client
    }

    // Create client once
    this.client = createClient(url, key);
    this.isInitialized = true;
    return this.client;
  }
}
```

**Benefits:**
- Zero-latency client access after first initialization
- Consistent authentication state across tabs
- No duplicate subscriptions to auth changes

---

### 3. ProtectedRoute

**File:** `frontend/components/ProtectedRoute.jsx`

**Purpose:**
- Route guard for protected pages
- Enforce authentication requirements
- Handle user type-based routing

**Decision Tree:**

```
┌─────────────────────────────────────────────────────────────┐
│                     ProtectedRoute Logic                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Auth Loading?    │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
                   YES                NO
                    │                  │
                    ▼                  ▼
            ┌──────────────┐   ┌──────────────┐
            │ Show Loading │   │ User Exists? │
            └──────────────┘   └──────┬───────┘
                                      │
                             ┌────────┴─────────┐
                             │                  │
                            NO                 YES
                             │                  │
                             ▼                  ▼
                    ┌──────────────┐   ┌──────────────┐
                    │ → /signin    │   │ God User?    │
                    └──────────────┘   └──────┬───────┘
                                              │
                                     ┌────────┴─────────┐
                                     │                  │
                                    YES                NO
                                     │                  │
                                     ▼                  ▼
                            ┌──────────────┐   ┌──────────────┐
                            │ FULL ACCESS  │   │ Paid User?   │
                            │ → /app/home  │   └──────┬───────┘
                            └──────────────┘          │
                                             ┌────────┴─────────┐
                                             │                  │
                                            YES                NO
                                             │                  │
                                             ▼                  ▼
                                    ┌──────────────┐   ┌──────────────┐
                                    │ FULL ACCESS  │   │ Free User    │
                                    │ → /app/home  │   │ → /select-   │
                                    └──────────────┘   │    plan      │
                                                       └──────────────┘
```

**Code Flow:**

```javascript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();

  // 1. LOADING GUARD - Prevent premature redirects
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. AUTHENTICATION CHECK
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // 3. GOD USER BYPASS - The Golden Rule
  const userEmail = user.email?.toLowerCase() || "";
  const isGodUser = GOD_EMAILS.includes(userEmail);

  if (isGodUser) {
    // Redirect from select-plan to app/home
    if (location.pathname === "/select-plan") {
      return <Navigate to="/app/home" replace />;
    }
    // Otherwise, allow full access
    return children;
  }

  // 4. PAID USER CHECK
  const subscriptionStatus = user?.user_metadata?.subscription_status || "none";
  const hasActivePlan =
    subscriptionStatus !== "none" &&
    subscriptionStatus !== "free";

  if (hasActivePlan) {
    // Redirect from select-plan to app/home
    if (location.pathname === "/select-plan") {
      return <Navigate to="/app/home" replace />;
    }
    return children;
  }

  // 5. FREE USER - Must be on select-plan
  const isFreeUser = !isGodUser && !hasActivePlan;

  if (isFreeUser && location.pathname !== "/select-plan") {
    return <Navigate to="/select-plan" replace />;
  }

  // 6. DEFAULT - Allow access
  return children;
};
```

---

## Routing System

### Route Structure

```
/
├── /signin                    (Public - Auth page)
├── /signup                    (Public - Auth page)
├── /select-plan               (Protected - Free users only)
└── /app                       (Protected - MainLayout wrapper)
    ├── /home                  (Dashboard)
    ├── /leads                 (Leads page)
    ├── /contacts              (Contacts page)
    ├── /opportunities         (Opportunities page)
    ├── /email-marketing       (Email campaigns)
    ├── /forms                 (Form builder)
    ├── /workflows             (Automation)
    └── ...                    (Other app pages)
```

### Route Configuration

**File:** `frontend/App.jsx`

```jsx
<Routes>
  {/* Public Routes */}
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />

  {/* Protected Routes */}
  <Route path="/select-plan" element={
    <ProtectedRoute>
      <SelectPlan />
    </ProtectedRoute>
  } />

  {/* App Routes with MainLayout */}
  <Route path="/app" element={<MainLayout />}>
    <Route index element={<Navigate to="/app/home" replace />} />

    {/* Dashboard */}
    <Route path="home" element={withSuspense(LazyDashboard)} />

    {/* Other app pages */}
    <Route path="leads" element={withSuspense(LazyLeads)} />
    <Route path="contacts" element={withSuspense(LazyContacts)} />
    {/* ... more routes ... */}
  </Route>
</Routes>
```

**Important Notes:**

1. **No ProtectedRoute on `/app/home` in localhost mode** - For faster development
2. **ProtectedRoute wraps `/select-plan`** - To ensure only authenticated users access it
3. **MainLayout provides app shell** - Sidebar, topbar, etc.

---

## Component Responsibilities

### 1. SignIn Component

**File:** `frontend/pages/SignIn.jsx`

**Responsibilities:**
- Handle email/password authentication
- Display loading states during sign-in
- Show error messages
- Navigate to `/app/home` after successful sign-in

**Key Logic:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Wait for Supabase to initialize
  if (!isInitialized || authLoading) {
    setError("Authentication system is initializing...");
    return;
  }

  setLoading(true);

  try {
    await signInWithEmail(email, password);

    // ProtectedRoute will handle routing based on user type
    navigate("/app/home");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Flow:**
1. User enters credentials
2. SignIn calls `signInWithEmail()`
3. SupabaseContext updates user state
4. Navigate to `/app/home`
5. ProtectedRoute intercepts and routes correctly:
   - God users → Stay on `/app/home`
   - Paid users → Stay on `/app/home`
   - Free users → Redirect to `/select-plan`

---

### 2. ProtectedRoute Component

**Already covered above** - See [ProtectedRoute section](#3-protectedroute)

---

### 3. MainLayout Component

**File:** `frontend/components/layout/MainLayout.jsx`

**Responsibilities:**
- Provide app shell (sidebar, topbar)
- Render child routes via `<Outlet />`
- Handle responsive layout

**Structure:**
```jsx
<div className="flex h-screen">
  <Sidebar />
  <div className="flex flex-1 flex-col">
    <Topbar />
    <main className="flex-1 overflow-auto">
      <Outlet /> {/* Child routes render here */}
    </main>
  </div>
</div>
```

---

### 4. AppBootstrap Component

**File:** `frontend/components/AppBootstrap.jsx`

**Responsibilities:**
- Initialize app-level services
- Preload critical resources
- Set up global event listeners

**What it does:**
- Preloads critical components (Dashboard, Leads, Contacts)
- Initializes analytics (PostHog)
- Sets up error tracking (Sentry)

---

## Flow Diagrams

### First-Time Sign-In Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   First-Time Sign-In Flow                    │
└─────────────────────────────────────────────────────────────┘

User visits /signin
       │
       ▼
┌──────────────────┐
│ SignIn Component │
│                  │
│ 1. Render form   │
│ 2. Wait for      │
│    Supabase init │
└────────┬─────────┘
         │
         ▼ User enters credentials
┌──────────────────┐
│ Submit form      │
│                  │
│ Call:            │
│ signInWithEmail()│
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ SupabaseContext      │
│                      │
│ 1. Authenticate      │
│ 2. Get user session  │
│ 3. Save to state     │
│ 4. Persist session   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────┐
│ Navigate to      │
│ /app/home        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ ProtectedRoute intercepts            │
│                                      │
│ Checks user type:                    │
│                                      │
│ ┌──────────────────────────────────┐│
│ │ God User?                        ││
│ │ → Allow /app/home                ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Paid User?                       ││
│ │ → Allow /app/home                ││
│ └──────────────────────────────────┘│
│ ┌──────────────────────────────────┐│
│ │ Free User?                       ││
│ │ → Redirect to /select-plan       ││
│ └──────────────────────────────────┘│
└──────────────────┬───────────────────┘
                   │
                   ▼
         ┌─────────┴─────────┐
         │                   │
    God/Paid User        Free User
         │                   │
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│ Render Dashboard │ │ Render SelectPlan│
└──────────────────┘ └──────────────────┘
```

---

### Returning User Flow (Session Persistence)

```
┌─────────────────────────────────────────────────────────────┐
│              Returning User Flow (Has Session)               │
└─────────────────────────────────────────────────────────────┘

User opens app
       │
       ▼
┌──────────────────────┐
│ App.jsx loads        │
│                      │
│ SupabaseContext init │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Check localStorage for session   │
│                                  │
│ Key: "supabase.auth.token"       │
└────────┬─────────────────────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│ Parse  │ │ No session │
│ session│ │ → /signin  │
└───┬────┘ └────────────┘
    │
    ▼
┌──────────────────────┐
│ Initialize Supabase  │
│ client               │
│                      │
│ Set user state       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ User navigates to    │
│ /app/home            │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ ProtectedRoute checks user type      │
│                                      │
│ Route to appropriate destination     │
└──────────────────┬───────────────────┘
                   │
                   ▼
         ┌─────────┴─────────┐
         │                   │
    God/Paid User        Free User
         │                   │
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│ Stay on          │ │ Redirect to      │
│ /app/home        │ │ /select-plan     │
└──────────────────┘ └──────────────────┘
```

---

### God User Special Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    God User Special Flow                     │
└─────────────────────────────────────────────────────────────┘

God user signs in
(axolopcrm@gmail.com or kate@kateviolet.com)
       │
       ▼
┌──────────────────────┐
│ SupabaseContext      │
│ sets user state      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Navigate to          │
│ /app/home            │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ ProtectedRoute                       │
│                                      │
│ const isGodUser =                    │
│   GOD_EMAILS.includes(user.email)    │
│                                      │
│ if (isGodUser) {                     │
│   return children; // FULL ACCESS    │
│ }                                    │
└──────────────────┬───────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ BYPASS ALL CHECKS   │
         │                     │
         │ ✅ No subscription  │
         │    check            │
         │                     │
         │ ✅ No plan          │
         │    selection        │
         │                     │
         │ ✅ No payment       │
         │    required         │
         │                     │
         │ ✅ Full app access  │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Render Dashboard    │
         │ with full features  │
         └─────────────────────┘

CRITICAL: God users NEVER see /select-plan
         If they land on /select-plan, they are
         immediately redirected to /app/home
```

---

## Common Scenarios

### Scenario 1: God User Tries to Access /select-plan

```javascript
// User: axolopcrm@gmail.com
// Current URL: /select-plan

// ProtectedRoute logic:
const isGodUser = GOD_EMAILS.includes("axolopcrm@gmail.com"); // true

if (isGodUser) {
  if (location.pathname === "/select-plan") {
    // Immediate redirect
    return <Navigate to="/app/home" replace />;
  }
}

// Result: User lands on /app/home (Dashboard)
```

---

### Scenario 2: Free User Tries to Access /app/leads

```javascript
// User: freeuser@example.com
// Subscription: "none"
// Current URL: /app/leads

// ProtectedRoute logic:
const isGodUser = false; // Not admin email
const hasActivePlan = false; // subscription = "none"
const isFreeUser = true; // !isGodUser && !hasActivePlan

if (isFreeUser && location.pathname !== "/select-plan") {
  // Force redirect to plan selection
  return <Navigate to="/select-plan" replace />;
}

// Result: User redirected to /select-plan
```

---

### Scenario 3: Paid User Returns After Payment

```javascript
// User: paiduser@example.com
// Subscription: "active"
// Current URL: /select-plan (from payment flow)

// ProtectedRoute logic:
const hasActivePlan = true; // subscription = "active"

if (hasActivePlan && location.pathname === "/select-plan") {
  // They already have a plan, no need to select
  return <Navigate to="/app/home" replace />;
}

// Result: User redirected to /app/home
```

---

### Scenario 4: User Refreshes Page While Authenticated

```javascript
// User: any authenticated user
// Session: Stored in localStorage
// Current URL: /app/opportunities

// Flow:
// 1. App loads
// 2. SupabaseContext reads localStorage
// 3. Finds persisted session
// 4. Restores user state
// 5. ProtectedRoute checks user type
// 6. Allows access to /app/opportunities

// Result: User stays on /app/opportunities (no redirect)
```

---

## Troubleshooting

### Issue 1: Infinite Redirect Loop

**Symptoms:**
- Browser console shows constant redirects
- URL keeps changing between `/app/home` and `/select-plan`
- Page never loads

**Causes:**
1. Multiple redirect systems competing (SupabaseContext + ProtectedRoute)
2. Using `window.location.href` instead of React Router `<Navigate />`
3. Missing loading guards (redirecting during auth state loading)

**Solution:**
```javascript
// ✅ CORRECT: Use React Router
if (isGodUser && location.pathname === "/select-plan") {
  return <Navigate to="/app/home" replace />;
}

// ❌ WRONG: Don't use window.location
if (isGodUser) {
  window.location.href = "/app/home"; // Causes loops!
}

// ✅ CORRECT: Add loading guard
if (loading) {
  return <LoadingSpinner />;
}

// ❌ WRONG: No loading guard
if (!user) {
  return <Navigate to="/signin" />; // May redirect prematurely
}
```

---

### Issue 2: God Users Seeing Plan Selection

**Symptoms:**
- Admin emails land on `/select-plan`
- God users redirected to plan selection
- God users don't have immediate access

**Causes:**
1. God user email not in `GOD_EMAILS` array
2. Case sensitivity in email comparison
3. God user check happens AFTER plan check

**Solution:**
```javascript
// ✅ CORRECT: Check God users FIRST
const isGodUser = GOD_EMAILS.includes(user.email?.toLowerCase());

if (isGodUser) {
  // Handle God users first, before any other checks
  return children;
}

// Now check paid/free users
const hasActivePlan = ...;

// ❌ WRONG: Checking plan status before God status
const hasActivePlan = ...;
if (!hasActivePlan) {
  return <Navigate to="/select-plan" />; // God users caught here!
}
```

---

### Issue 3: Infinite "Setting up your workspace..." Loading

**Symptoms:**
- Loading spinner shows forever
- User never reaches dashboard
- Console shows no errors

**Causes:**
1. Component redirecting to itself (e.g., HomeRedirect redirecting to /app/home which renders HomeRedirect)
2. Missing loading guard in redirect component
3. Dependency array missing in useEffect

**Solution:**
```javascript
// ✅ CORRECT: Don't use HomeRedirect on /app/home
<Route path="home" element={<Dashboard />} />

// ❌ WRONG: Creates infinite loop
<Route path="home" element={<HomeRedirect />} />
// HomeRedirect redirects to /app/home, which renders HomeRedirect again!

// ✅ CORRECT: Add loading guard in redirect components
const { user, loading } = useSupabase();

if (loading) {
  return; // Wait for auth to finish
}

// ❌ WRONG: No loading guard
const { user } = useSupabase();
// May redirect before user state is fully loaded
```

---

### Issue 4: Backend 500 Errors Breaking App

**Symptoms:**
- App shows errors when sidebar loads
- 500 errors in network tab
- Some components don't render

**Causes:**
1. Backend endpoints returning 500 instead of graceful fallbacks
2. Missing error handling in frontend
3. Database queries failing on missing data

**Solution:**
```javascript
// ✅ CORRECT: Return empty object on error
try {
  const { data, error } = await supabase.from("table").select();

  if (error && error.code !== "PGRST116") {
    // Return empty instead of 500
    return res.json({ success: true, data: {} });
  }
} catch (err) {
  // Return empty instead of 500
  return res.json({ success: true, data: {} });
}

// ❌ WRONG: Return 500 error
if (error) {
  return res.status(500).json({ error: "Failed" });
}
```

---

### Issue 5: Users Not Redirected After Sign-In

**Symptoms:**
- Users sign in but stay on `/signin`
- No automatic redirect to app
- Must manually navigate to `/app/home`

**Causes:**
1. Missing navigation after successful sign-in
2. ProtectedRoute not checking auth pages
3. Session not persisted correctly

**Solution:**
```javascript
// ✅ CORRECT: Navigate after sign-in
try {
  await signInWithEmail(email, password);

  // Let ProtectedRoute handle routing based on user type
  navigate("/app/home");
} catch (err) {
  setError(err.message);
}

// ✅ CORRECT: ProtectedRoute redirects authenticated users from auth pages
if (user && ["/signin", "/signup"].includes(location.pathname)) {
  if (isGodUser || hasActivePlan) {
    return <Navigate to="/app/home" replace />;
  } else {
    return <Navigate to="/select-plan" replace />;
  }
}
```

---

## Best Practices

### 1. Single Source of Truth for Redirects

✅ **DO:** Use only `ProtectedRoute` for navigation logic
```javascript
// All redirect logic in ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  // All routing decisions here
};
```

❌ **DON'T:** Mix redirect systems
```javascript
// SupabaseContext.jsx
window.location.href = "/app/home"; // DON'T DO THIS

// HomeRedirect.jsx
navigate("/app/home"); // Conflicts with ProtectedRoute

// SignIn.jsx
navigate("/select-plan"); // Let ProtectedRoute decide
```

---

### 2. Always Check Loading State

✅ **DO:** Guard against premature redirects
```javascript
if (loading) {
  return <LoadingSpinner />;
}
```

❌ **DON'T:** Redirect while loading
```javascript
if (!user) {
  return <Navigate to="/signin" />; // May redirect during loading!
}
```

---

### 3. God Users Always First

✅ **DO:** Check God status before any other checks
```javascript
if (isGodUser) {
  return children; // Exit early
}

// Now check paid/free users
```

❌ **DON'T:** Check God users after plan checks
```javascript
if (!hasActivePlan) {
  return <Navigate to="/select-plan" />; // God users caught here!
}

if (isGodUser) {
  // Too late - already redirected
}
```

---

### 4. Hardcode God Emails for Zero Latency

✅ **DO:** Define God emails as constants
```javascript
const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];
const isGodUser = GOD_EMAILS.includes(user.email?.toLowerCase());
```

❌ **DON'T:** Fetch from database
```javascript
// Causes delay and potential loops
const { data } = await supabase.from("admins").select();
const isGodUser = data.includes(user.email);
```

---

### 5. Use React Router Navigation

✅ **DO:** Use `<Navigate />` or `navigate()`
```javascript
// Component-based
return <Navigate to="/app/home" replace />;

// Hook-based
const navigate = useNavigate();
navigate("/app/home");
```

❌ **DON'T:** Use `window.location`
```javascript
window.location.href = "/app/home"; // Resets app state!
```

---

## Security Considerations

### 1. Never Trust Client-Side Checks

⚠️ **Important:** Client-side routing is for UX only. Always enforce authorization on the backend.

```javascript
// ✅ Backend route protection
router.get("/api/admin/users", authenticateUser, requireAdmin, async (req, res) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Proceed with admin-only logic
});
```

### 2. God User Detection on Backend

God user emails should also be checked on the backend for sensitive operations:

```javascript
const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];

function isGodUser(email) {
  return GOD_EMAILS.includes(email?.toLowerCase());
}

// Use in middleware
const requireAdmin = (req, res, next) => {
  if (!isGodUser(req.user.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
```

### 3. Row Level Security (RLS)

Enable RLS on all Supabase tables to ensure users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own contacts
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  USING (user_id = auth.uid());

-- God users can see everything
CREATE POLICY "God users can view all contacts"
  ON contacts FOR SELECT
  USING (
    auth.email() IN ('axolopcrm@gmail.com', 'kate@kateviolet.com')
  );
```

---

## Performance Optimization

### 1. Lazy Loading Routes

Use lazy loading for heavy components:

```javascript
// ✅ Good - Lazy load heavy components
const LazyDashboard = lazy(() => import("./pages/Dashboard"));
const LazyLeads = lazy(() => import("./pages/Leads"));

<Route path="home" element={
  <Suspense fallback={<LoadingSpinner />}>
    <LazyDashboard />
  </Suspense>
} />
```

### 2. Preload Critical Components

Preload components users are likely to visit:

```javascript
// In AppBootstrap.jsx
useEffect(() => {
  // Preload critical components after initial render
  const preloadTimer = setTimeout(() => {
    import("./pages/Dashboard");
    import("./pages/Leads");
    import("./pages/Contacts");
  }, 1000);

  return () => clearTimeout(preloadTimer);
}, []);
```

### 3. Memoize User Type Calculations

```javascript
const userType = useMemo(() => {
  if (!user) return "unauthenticated";

  const isGodUser = GOD_EMAILS.includes(user.email?.toLowerCase());
  if (isGodUser) return "god";

  const hasActivePlan =
    user.user_metadata?.subscription_status !== "none" &&
    user.user_metadata?.subscription_status !== "free";

  return hasActivePlan ? "paid" : "free";
}, [user]);
```

---

## Summary

### Key Takeaways

1. **Three User Types:**
   - God Users: Hardcoded admin emails, unlimited access
   - Paid Users: Active subscriptions, full app access
   - Free Users: No subscription, limited to plan selection

2. **Single Source of Truth:**
   - All routing logic in `ProtectedRoute`
   - No redirects in `SupabaseContext`
   - Use React Router only

3. **God Users First:**
   - Always check God status before other checks
   - Hardcode emails for instant detection
   - Complete bypass of all restrictions

4. **Loading Guards:**
   - Always check `loading` state before redirecting
   - Show loading spinner during auth initialization
   - Prevent premature redirects

5. **Security:**
   - Client-side checks are for UX only
   - Enforce all restrictions on backend
   - Use Row Level Security (RLS)

---

## Version History

- **v1.0** (2025-01-29) - Initial documentation
  - Comprehensive authentication flow
  - Routing system documentation
  - Troubleshooting guide

---

## Related Documentation

- [Authentication System Status](./AUTH_SYSTEM_STATUS.md)
- [Quick Reference Guide](./QUICK_REFERENCE.md)
- [Supabase Configuration](../database/SUPABASE_CONFIGURATION.md)
- [API Documentation](../api/API_COMPLETE_REFERENCE.md)

---

**Last Updated:** 2025-01-29
**Maintained By:** Development Team
**Version:** 1.0
