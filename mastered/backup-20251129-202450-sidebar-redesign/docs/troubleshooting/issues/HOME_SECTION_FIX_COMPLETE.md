# Home Section Fix Complete

## Summary

The Home section has been debugged and fixed to work properly with:
- Backend Docker container communication
- Supabase database storage (not localStorage)
- Real metrics from actual user data
- User-specific preset saving

## What Was Fixed

### 1. Database Migration Created
- **File**: `backend/db/migrations/006_home_dashboard_tables.sql`
- Creates all necessary tables for the Home page:
  - `dashboard_presets` - User custom layouts
  - `deals` - Revenue & sales metrics
  - `opportunities` - Pipeline data
  - `leads` - Conversion funnel
  - `form_submissions` - Form metrics
  - `email_campaigns` - Marketing metrics
  - `expenses` - Profit/Loss data
- All tables have RLS (Row Level Security) for user data isolation

### 2. Widget Data Mapping Fixed
- **File**: `frontend/pages/Home.jsx`
- Fixed EmailMarketingWidget data mapping:
  - `sent`, `delivered`, `opened`, `clicked`, `openRate`, `clickRate`
- Ensured proper data flow from dashboardDataService to widgets

### 3. Data Service Enhanced
- **File**: `frontend/services/dashboardDataService.js`
- Added missing fields:
  - `emailsDelivered`
  - `emailOpens`
  - `emailClicks`

## How to Complete Setup

### Step 1: Run Database Migration

Go to your Supabase Dashboard and run the migration:

1. Open Supabase Dashboard (https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the contents of `backend/db/migrations/006_home_dashboard_tables.sql`
6. Paste and click **Run**

### Step 2: Verify Backend is Running

```bash
# Check Docker container status
docker ps | grep backend

# Verify health endpoint
curl http://localhost:3002/health
```

### Step 3: Restart Frontend (if needed)

```bash
# Kill any existing process and restart
cd /Users/jdromeroherrera/Desktop/CODE/axolopcrm/website
npm run dev:vite
```

### Step 4: Test the Home Page

1. Go to http://localhost:3000
2. Log in with your account
3. Navigate to Home
4. Test features:
   - View real metrics (revenue, leads, deals, etc.)
   - Change time range (week, month, quarter, year)
   - Enter edit mode and customize layout
   - Add/remove widgets
   - Save custom presets (persisted to Supabase)

## Architecture Overview

```
User Action → Home.jsx
    ↓
dashboardDataService.js → Fetches real data from Supabase
    ↓
Widget Components → Display formatted data
    ↓
homePresetService.js → Saves/loads layouts to Supabase
    ↓
supabaseDashboardPresetService.js → Direct Supabase operations
```

## Files Modified

| File | Changes |
|------|---------|
| `frontend/pages/Home.jsx` | Fixed EmailMarketingWidget data mapping |
| `frontend/services/dashboardDataService.js` | Added missing email marketing fields |
| `backend/db/migrations/006_home_dashboard_tables.sql` | NEW: Database migration |
| `scripts/run-home-migration.js` | NEW: Migration runner script |

## Metrics Data Sources

| Widget | Data Source (Supabase Table) |
|--------|------------------------------|
| RevenueChart | `deals` (won deals with `amount` field) |
| FullSalesWidget | `deals`, `opportunities`, `leads` |
| ConversionFunnelWidget | `leads` (by status) |
| EmailMarketingWidget | `email_campaigns` |
| FormSubmissionsWidget | `form_submissions` |
| ProfitMarginWidget | `deals` (revenue) + `expenses` |
| MetricCard | Various tables based on metric type |

## Notes

- All data is user-isolated via Supabase RLS policies
- Preset layouts are saved per-user in `dashboard_presets`
- Real metrics update automatically when data changes
- Widgets handle empty/zero data gracefully with flatline charts

## Troubleshooting

### No data showing?
1. Run the database migration first
2. Check Supabase connection in browser console
3. Add some test data (deals, leads, etc.)

### Preset not saving?
1. Make sure you're logged in
2. Check browser console for errors
3. Verify `dashboard_presets` table exists

### Widget errors?
1. Check browser console for specific errors
2. Verify all required tables exist in Supabase
