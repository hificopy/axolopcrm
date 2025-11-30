# ========================================

# SUPABASE CREDENTIALS - AXOLOP CRM

# ========================================

# ⚠️ IMPORTANT: KEEP THESE SECURE ⚠️

# Never commit to git, never share publicly

## Supabase Project Details

- **Project URL**: https://fuclpfhitgwugxogxkmw.supabase.co
- **Project Reference**: fuclpfhitgwugxogxkmw
- **Dashboard**: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw

## API Keys

### Public (Anon) Key

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA
```

### Service Role Key (Backend Only)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg5MjgwMSwiZXhwIjoyMDc4NDY4ODAxfQ.Izu9oxlV2BVjsCczMTvcORGnOuQs__Y0wAzKKclpmyQ
```

## Environment Variables Configuration

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://fuclpfhitgwugxogxkmw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA
```

### Backend (.env)

```env
SUPABASE_URL=https://fuclpfhitgwugxogxkmw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg5MjgwMSwiZXhwIjoyMDc4NDY4ODAxfQ.Izu9oxlV2BVjsCczMTvcORGnOuQs__Y0wAzKKclpmyQ
```

## Database Connection

```env
DATABASE_URL=postgresql://postgres.fuclpfhitgwugxogxkmw:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Testing Configuration

### Test Frontend Connection

```bash
curl -s http://localhost:3000
# Should show Axolop CRM page without errors
```

### Test Supabase API

```bash
curl -s "https://fuclpfhitgwugxogxkmw.supabase.co/rest/v1/"
# Should return: {"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

### Test Authentication

```bash
# In browser console:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://fuclpfhitgwugxogxkmw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA')
```

## Security Notes

- ✅ Anon key is safe for frontend use
- ⚠️ Service role key must NEVER be exposed in frontend
- ✅ Both keys are properly configured in environment
- ✅ Project URL is correct and accessible

## Last Updated

2025-11-29 by Claude AI Assistant
Status: ✅ Configured and Tested
