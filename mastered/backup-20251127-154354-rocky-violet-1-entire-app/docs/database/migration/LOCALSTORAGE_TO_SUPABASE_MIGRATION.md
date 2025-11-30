# LocalStorage to Supabase Migration Guide

## Overview

This migration moves all user-specific data from browser localStorage to Supabase for:

- ✅ Cross-device synchronization
- ✅ Data persistence and backup
- ✅ User-specific data isolation
- ✅ Better security and access control

## What's Being Migrated

### 1. **Theme Preferences**

- From: `localStorage.getItem('theme')`
- To: `user_settings.theme` table

### 2. **Todo Items**

- From: `localStorage.getItem('axolop-todos')`
- To: `user_todos` table

### 4. **Onboarding Responses**

- From: `localStorage.getItem('onboarding_responses')` and `localStorage.getItem('recommended_plan')`
- To: `user_preferences.preferences` JSONB field

### 5. **Affiliate Codes**

- From: `localStorage.getItem('ref_code')` and `localStorage.getItem('affiliate_code_${user.id}')`
- To: `user_preferences.preferences` JSONB field

## Database Schema

### New Tables Created

1. **user_todos** - Stores user personal todo items
2. **user_preferences** - Stores user preferences beyond basic settings

These tables complement the existing:

- **user_settings** - Already exists for theme, notifications, etc.
- **onboarding_data** - Already exists for onboarding responses

## Deployment Steps

### Step 1: Deploy Database Schema

**Option A: Manual Execution (Recommended)**

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new
2. Copy the entire contents of `scripts/user-preferences-schema.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute
5. Verify tables were created in the Table Editor

**Option B: Using Deploy Script**

```bash
cd website
node scripts/deploy-user-preferences.js
```

### Step 2: Restart Backend Server

The new routes need to be loaded:

```bash
cd website/backend
# Kill existing processes
pkill -f "node index.js"

# Start backend
node index.js
```

### Step 3: Test Migration

The migration will run automatically when users log in. To test manually:

```javascript
import { migrateAllLocalStorageData } from "./utils/localStorageMigration";

// After user logs in
const token = await supabase.auth
  .getSession()
  .then((s) => s.data.session.access_token);
const userId = user.id;

await migrateAllLocalStorageData(token, userId);
```

## API Endpoints

### User Preferences

- `GET /api/user-preferences` - Get user preferences
- `PUT /api/user-preferences` - Update a specific preference

### User Settings

- `GET /api/user-preferences/settings` - Get user settings (theme, etc.)
- `PUT /api/user-preferences/settings` - Update user settings

### Todos

- `GET /api/user-preferences/todos` - Get all todos
- `POST /api/user-preferences/todos` - Create a new todo
- `PUT /api/user-preferences/todos/:id` - Update a todo
- `DELETE /api/user-preferences/todos/:id` - Delete a todo
- `POST /api/user-preferences/todos/:id/toggle` - Toggle completion
- `PUT /api/user-preferences/todos/bulk` - Bulk update (reordering)

## Frontend Usage

### Using the Hooks

#### User Preferences

```javascript
import { useUserPreferences } from '@/hooks/useUserPreferences';

function MyComponent() {
  const {
    preferences,
    settings,
    loading,
    getTheme,
    setTheme,

    updatePreference
  } = useUserPreferences();

  // Get theme
  const theme = getTheme();

  // Set theme
  await setTheme('dark');



  // Update custom preference
  await updatePreference('my_custom_setting', true);
}
```

#### User Todos

```javascript
import { useUserTodos } from '@/hooks/useUserPreferences';

function TodoList() {
  const {
    todos,
    loading,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo
  } = useUserTodos();

  // Create todo
  await createTodo({
    title: 'My new todo',
    description: 'Description',
    priority: 'high'
  });

  // Toggle completion
  await toggleTodo(todo.id);

  // Update todo
  await updateTodo(todo.id, { title: 'Updated title' });

  // Delete todo
  await deleteTodo(todo.id);
}
```

## Components to Update

The following components need to be updated to use Supabase instead of localStorage:

1. ✅ **ThemeContext** (`frontend/contexts/ThemeContext.jsx`)
   - Replace localStorage theme with `useUserPreferences`

2. ✅ **TodoSlideOver** (`frontend/components/TodoSlideOver.jsx`)
   - Replace localStorage todos with `useUserTodos`

3. ✅ **TodoList** (`frontend/pages/TodoList.jsx`)
   - Replace localStorage todos with `useUserTodos`

4. ✅ **Onboarding** (`frontend/pages/Onboarding.jsx`)
   - Replace localStorage responses with Supabase storage

5. ✅ **ProtectedRoute** (`frontend/components/ProtectedRoute.jsx`)
   - Update Kate onboarding check

## Migration Behavior

- Migration runs automatically on first login after deployment
- Only migrates data if it exists in localStorage
- Clears localStorage after successful migration
- Sets a `migration_completed` flag to prevent re-running
- All migrations are non-destructive and safe

## Security

- All data is protected by Row Level Security (RLS)
- Users can only access their own data
- Service role key required for admin operations
- Auth token required for all API calls

## Testing Checklist

- [ ] Database schema deployed successfully
- [ ] Backend routes registered and responding
- [ ] Theme persists across browser sessions
- [ ] Todos sync across devices
- [ ] Kate onboarding state persists
- [ ] Migration runs without errors
- [ ] localStorage is cleared after migration
- [ ] RLS policies prevent unauthorized access

## Rollback Plan

If issues occur, you can temporarily revert by:

1. Commenting out the migration code in components
2. Reverting to localStorage usage
3. Keeping the database tables for when ready to retry

The database tables won't interfere with existing functionality.

## Support

For issues or questions:

- Check browser console for error messages
- Verify Supabase connection in Network tab
- Check backend logs for API errors
- Verify RLS policies in Supabase Dashboard
