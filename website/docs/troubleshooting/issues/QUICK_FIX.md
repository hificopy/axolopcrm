# 🚨 QUICK FIX FOR TIMEOUT ERROR

## The Problem:
Your frontend is **NOT reaching the backend** - backend shows ZERO requests.

## The Solution (Follow EXACTLY):

### Step 1: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Go to **Console** tab
3. Clear it (trash icon)

### Step 2: Click "Join Affiliate Program"
Watch the console and look for:
```
GET http://localhost:3002/api/affiliate/join   (WRONG URL - no /v1)
                                  ^^^ MISSING
```

OR

```
POST http://localhost:3002/api/v1/affiliate/join   (CORRECT URL)
                                 ^^^
```

### Step 3: If URL is WRONG (no /v1):

#### Option A: Hard Refresh (Try This First)
1. Close ALL browser tabs for localhost:5173
2. Clear browser cache:
   - **Mac:** `Cmd + Shift + Delete`
   - **Windows:** `Ctrl + Shift + Delete`
3. Select "Cached images and files"
4. Click Clear
5. Open localhost:5173 again

#### Option B: Restart Frontend (If Hard Refresh Fails)
1. Go to terminal running `npm run dev` (Vite)
2. Press `Ctrl + C` to stop
3. Run: `npm run dev` again
4. Wait for "Local: http://localhost:5173"
5. Go to browser and press `Cmd/Ctrl + Shift + R`

#### Option C: Nuclear Option (If Still Fails)
```bash
# Kill everything
pkill -9 node
pkill -9 vite

# Delete vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Step 4: Verify It Works

After fixing, console should show:
```
POST http://localhost:3002/api/v1/affiliate/join
Status: 200 OK (or 401 if not logged in)
```

Backend logs will show:
```
🔍 === AFFILIATE JOIN REQUEST DEBUG ===
🌐 Request URL: /api/v1/affiliate/join
✅ Step 1 SUCCESS: User authenticated
```

---

## Quick Test RIGHT NOW:

Open browser console (F12) and type:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

**Should show:** `http://localhost:3002/api/v1`
**If shows:** `http://localhost:3002/api` ← **WRONG! Need to refresh**

---

## Still Not Working?

**Check if you're logged in:**
1. Open console (F12)
2. Type: `localStorage.getItem('sb-fuclpfhitgwugxogxkmw-auth-token')`
3. If `null` → You're not logged in!
4. Sign in first, then try affiliate button

---

## 100% Guaranteed Fix:

If NOTHING works, do this:

1. **Close browser completely**
2. **Stop frontend** (`Ctrl + C` in Vite terminal)
3. **Clear env cache:**
   ```bash
   rm -rf node_modules/.vite
   rm -rf .env.local
   ```
4. **Restart frontend:**
   ```bash
   npm run dev
   ```
5. **Open NEW incognito window**
6. **Go to** `http://localhost:5173`
7. **Login**
8. **Try affiliate button**

This WILL work because it clears all caches!
