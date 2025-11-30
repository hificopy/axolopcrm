# Axolop CRM - System Status & Complete Setup Guide

**Generated:** 2025-01-17
**Status:** Backend Running, Configuration Required

---

## 🎯 Executive Summary

The Axolop CRM backend is **running successfully** with the following status:

### ✅ Working Components
- **Express Server**: Running on port 3002
- **Redis**: Connected and operational
- **ChromaDB**: Connected to http://localhost:8001
- **Supabase**: Connected (PostgreSQL database)
- **Workflow Automation Engine**: Started and watching for triggers
- **Email Trigger Watchers**: All active (opens, clicks, lead creation, status changes, form submissions)

### ⚠️ Configuration Required

#### **Critical Issues**
1. **SendGrid API Key**: Set to placeholder `your_sendgrid_api_key` (must start with `SG.`)
2. **Database Tables**: Several tables missing or not initialized
3. **API Routes**: Some endpoints returning 404 due to authentication requirements

#### **Missing/Incomplete Configuration**
- Supabase Service Role Key
- Auth0 credentials
- Google OAuth credentials
- Gmail refresh token
- OpenAI/Groq API keys (optional for AI features)
- Stripe keys (optional for payments)

---

## 🔍 Detailed Error Analysis

### 1. SendGrid Configuration Error

**Error:**
```
API key does not start with "SG.".
```

**Current Setting in `.env`:**
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
```

**Solution:**
1. Sign up for SendGrid: https://signup.sendgrid.com/
2. Create API key: https://app.sendgrid.com/settings/api_keys
3. Click "Create API Key" → Choose "Full Access" → Copy the key
4. Update `.env`:
```bash
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com  # Must be verified in SendGrid
SENDGRID_FROM_NAME=Axolop CRM
```
5. Verify your sender email/domain in SendGrid dashboard

**Reference Documentation:**
- `SENDGRID_QUICK_REFERENCE.md` - Quick start guide
- `SENDGRID_INTEGRATION_COMPLETE.md` - Full implementation details
- `docs/SENDGRID_SETUP.md` - Detailed setup instructions

---

### 2. Missing Database Tables

**Errors:**
```
Could not find the table 'public.forms' in the schema cache
Could not find the table 'public.email_campaigns' in the schema cache
Could not find the table 'public.campaign_performance' in the schema cache
Could not find the table 'public.email_templates' in the schema cache
Could not find the table 'public.automation_workflows' in the schema cache
```

**Solution - Run Database Initialization:**

#### Option 1: Complete Setup (Recommended)
```bash
# Run the complete Supabase setup script
psql $DATABASE_URL -f supabase-complete-setup.sql
```

#### Option 2: Individual Component Setup
```bash
# 1. Forms & Form Builder
node scripts/init-forms-db.js

# 2. Workflows & Automation
node scripts/init-workflow-db.js
# OR use Supabase directly:
node scripts/init-workflow-supabase.js

# 3. SendGrid Email Marketing
psql $DATABASE_URL -f scripts/sendgrid-schema.sql

# 4. Calendar & Events
psql $DATABASE_URL -f scripts/calendar-schema.sql
psql $DATABASE_URL -f scripts/enhanced-calendar-schema.sql

# 5. Live Calls
psql $DATABASE_URL -f scripts/live-calls-schema.sql

# 6. Dashboard
psql $DATABASE_URL -f scripts/dashboard-schema.sql
```

**Available Schema Files:**
- `supabase-complete-setup.sql` - Complete database schema
- `scripts/sendgrid-schema.sql` - Email marketing tables
- `scripts/calendar-schema.sql` - Calendar base tables
- `scripts/enhanced-calendar-schema.sql` - Advanced calendar features
- `scripts/dashboard-schema.sql` - Dashboard configuration
- `scripts/live-calls-schema.sql` - Live call recording & analysis

---

### 3. Database Relationship Errors

**Error:**
```
Could not find a relationship between 'campaign_emails' and 'email_campaigns'
Could not find a relationship between 'automation_executions' and 'automation_workflows'
```

**Cause:** These tables have foreign key relationships that need to be created together.

**Solution:** Run the complete setup SQL which includes proper foreign keys and relationships.

---

### 4. API Routes Returning 404

**Observed 404s:**
```
GET /api/leads 404
GET /api/contacts 404
GET /api/opportunities 404
GET /api/calendar/presets 404
GET /api/calendar/google/status 404
GET /api/inbox 404
GET /api/gmail/profile 404
GET /api/email-marketing/campaigns 404
GET /api/email-marketing/workflows 404
GET /api/email-marketing/templates 404
```

**Root Cause:** These routes require **authentication** (they use `protect` middleware).

**Solutions:**

#### A. For Development/Testing
Add a public test endpoint or temporarily disable auth:
```javascript
// In backend/routes/leads.js (example)
router.get('/test', async (req, res) => {
  res.json({ message: 'Leads route working!' });
});
```

#### B. Proper Authentication Flow
1. User must sign up/login through Supabase Auth
2. Frontend gets authentication token
3. Frontend includes token in API requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

#### C. Check Authenticated Routes
```bash
# Health check (public)
curl http://localhost:3002/health

# SendGrid health (may be public)
curl http://localhost:3002/api/sendgrid/health
```

---

## 📋 Complete Setup Checklist

### Phase 1: Essential Configuration

- [ ] **1. Clone/Navigate to Project**
  ```bash
  cd /Users/jdromeroherrera/Desktop/CODE/axolopcrm/website
  ```

- [ ] **2. Install Dependencies**
  ```bash
  npm install
  ```

- [ ] **3. Set Up Environment Variables**
  ```bash
  cp .env.example .env
  # Then edit .env with your actual values
  ```

### Phase 2: External Services

- [ ] **4. Supabase Setup**
  - [ ] Create project at https://supabase.com/dashboard
  - [ ] Get Service Role Key: Project Settings → API → service_role key
  - [ ] Update `.env`:
    ```bash
    SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-key-here
    ```

- [ ] **5. SendGrid Setup**
  - [ ] Sign up: https://signup.sendgrid.com/
  - [ ] Create API key (Full Access): https://app.sendgrid.com/settings/api_keys
  - [ ] Verify sender email/domain: https://app.sendgrid.com/settings/sender_auth
  - [ ] Update `.env`:
    ```bash
    SENDGRID_API_KEY=SG.your-key-here
    SENDGRID_FROM_EMAIL=noreply@yourdomain.com
    ```

- [ ] **6. Redis Setup**
  ```bash
  # Install Redis (macOS)
  brew install redis

  # Start Redis
  brew services start redis

  # Or start manually
  redis-server
  ```

- [ ] **7. ChromaDB Setup**
  ```bash
  # Install ChromaDB
  pip install chromadb

  # Start ChromaDB server
  chroma run --host localhost --port 8001
  ```

### Phase 3: Database Initialization

- [ ] **8. Run Complete Database Schema**
  ```bash
  # Using psql
  psql $DATABASE_URL -f supabase-complete-setup.sql

  # Or through Supabase Dashboard:
  # https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
  # Copy and paste the contents of supabase-complete-setup.sql
  ```

- [ ] **9. Initialize Forms & Workflows**
  ```bash
  node scripts/init-forms-db.js
  node scripts/init-workflow-supabase.js
  ```

- [ ] **10. Seed Demo Data (Optional)**
  ```bash
  node scripts/seed-demo-data.js
  ```

### Phase 4: Start Services

- [ ] **11. Start Backend**
  ```bash
  npm run dev:backend
  # Should see: "Axolop CRM API Server Running"
  ```

- [ ] **12. Start Frontend**
  ```bash
  # In a new terminal
  npm run dev:vite
  # Access at: http://localhost:3000
  ```

- [ ] **13. Verify Health**
  ```bash
  curl http://localhost:3002/health
  # Should return: { "status": "healthy", "services": { ... } }
  ```

### Phase 5: Optional Features

- [ ] **14. Google OAuth (Gmail Integration)**
  - [ ] Create project: https://console.cloud.google.com/
  - [ ] Enable Gmail API
  - [ ] Create OAuth credentials
  - [ ] Update `.env` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

- [ ] **15. Auth0 Authentication**
  - [ ] Sign up: https://auth0.com/
  - [ ] Create application
  - [ ] Update `.env` with Auth0 credentials

- [ ] **16. AI Features (OpenAI/Groq)**
  - [ ] OpenAI: https://platform.openai.com/api-keys
  - [ ] Groq: https://console.groq.com/
  - [ ] Update `.env` with API keys

- [ ] **17. SendGrid Webhooks (Event Tracking)**
  - [ ] Use ngrok for local testing: `ngrok http 3002`
  - [ ] Configure in SendGrid: Settings → Mail Settings → Event Webhook
  - [ ] Webhook URL: `https://your-ngrok-url.ngrok.io/api/sendgrid/webhook`
  - [ ] Enable events: Delivered, Opened, Clicked, Bounced, Unsubscribe

---

## 🧪 Testing the System

### 1. Test Backend Health
```bash
curl http://localhost:3002/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T...",
  "services": {
    "database": "connected",
    "redis": "connected",
    "supabase": "connected (auth)",
    "chromadb": "connected"
  }
}
```

### 2. Test SendGrid Integration
```bash
curl http://localhost:3002/api/sendgrid/health
```

**Expected Response:**
```json
{
  "success": true,
  "configured": true
}
```

### 3. Test Database Tables
```sql
-- Connect to Supabase and run:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables:**
- `activities`
- `automation_executions`
- `automation_workflows`
- `calendar_events`
- `campaign_emails`
- `campaign_performance`
- `contacts`
- `dashboard_layouts`
- `email_campaigns`
- `email_events`
- `email_performance_summary`
- `email_suppressions`
- `email_templates`
- `form_integrations`
- `form_responses`
- `form_submissions`
- `forms`
- `history`
- `leads`
- `opportunities`
- And more...

### 4. Test Authentication Flow
```bash
# This will fail with 401 if auth is not set up - this is expected
curl http://localhost:3002/api/leads

# Response: { "error": "No token provided" } or 404
```

---

## 🐛 Common Issues & Solutions

### Issue: "Redis connection refused"
**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis
brew services start redis
# OR
redis-server
```

### Issue: "ChromaDB connection failed"
**Solution:**
```bash
# Start ChromaDB
chroma run --host localhost --port 8001
```

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# If fails, check .env DATABASE_URL and Supabase status
```

### Issue: "SendGrid from email not verified"
**Solution:**
1. Go to https://app.sendgrid.com/settings/sender_auth
2. Verify your domain OR single sender email
3. Use the verified email in `SENDGRID_FROM_EMAIL`

### Issue: "Forms/Campaigns/Workflows returning empty"
**Solution:**
- Tables exist but are empty
- Either seed demo data OR create items through the UI
- Check that database initialization scripts ran successfully

---

## 📊 System Architecture

### Backend Services Running
```
Port 3002 - Express API Server
├── Redis (localhost:6379) - Queue & Cache
├── PostgreSQL/Supabase - Main Database
├── ChromaDB (localhost:8001) - Vector DB for RAG
├── Automation Engine - Workflow triggers
├── Workflow Execution Engine - Workflow processing
└── Email Trigger Watchers - Email event monitoring
```

### Key Routes
```
/health                                    - Health check (public)
/api/sendgrid/*                           - SendGrid integration
/api/forms/*                              - Form builder & submissions
/api/leads/*                              - Lead management (auth required)
/api/contacts/*                           - Contact management (auth required)
/api/opportunities/*                      - Opportunity management (auth required)
/api/calendar/*                           - Calendar & events (auth required)
/api/inbox/*                              - Email inbox (auth required)
/api/gmail/*                              - Gmail integration (auth required)
/api/email-marketing/*                    - Campaigns & templates (auth required)
/api/workflows/*                          - Workflow automation (auth required)
```

---

## 📚 Additional Documentation

### SendGrid Integration
- `SENDGRID_QUICK_REFERENCE.md` - Quick start guide
- `SENDGRID_INTEGRATION_COMPLETE.md` - Complete implementation
- `SENDGRID_FINAL_CHECKLIST.md` - Pre-launch checklist
- `docs/SENDGRID_SETUP.md` - Detailed setup guide

### Calendar Features
- `CALENDAR_SETUP_GUIDE.md` - Calendar integration
- `ENHANCED_CALENDAR_IMPLEMENTATION.md` - Advanced features
- `CALENDAR_IMPLEMENTATION_COMPLETE.md` - Implementation summary

### Workflows & Automation
- `FORM_BUILDER_WORKFLOW_IMPLEMENTATION.md` - Form workflows
- Check `backend/services/automation-engine.js` for trigger types

### Database
- `SUPABASE_SETUP_INSTRUCTIONS.md` - Supabase configuration
- `database-fixes.sql` - Common database fixes

---

## ✅ System Ready Checklist

Before considering the system "fully functional":

### Critical (Must Have)
- [ ] SendGrid API key configured and verified
- [ ] All database tables created
- [ ] Redis running
- [ ] ChromaDB running
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can send test email via SendGrid

### Important (Should Have)
- [ ] Supabase Service Role Key configured
- [ ] Authentication working (can login/signup)
- [ ] Forms can be created and submitted
- [ ] Workflows can be created and triggered
- [ ] Calendar events can be created
- [ ] Contacts/Leads can be managed

### Optional (Nice to Have)
- [ ] Gmail integration configured
- [ ] Google Calendar sync working
- [ ] AI features configured (OpenAI/Groq)
- [ ] SendGrid webhooks configured and receiving events
- [ ] Demo data seeded

---

## 🚀 Quick Start Commands

```bash
# Start all services (in separate terminals)

# Terminal 1: Redis
redis-server

# Terminal 2: ChromaDB
chroma run --host localhost --port 8001

# Terminal 3: Backend
cd /Users/jdromeroherrera/Desktop/CODE/axolopcrm/website
npm run dev:backend

# Terminal 4: Frontend
npm run dev:vite

# Terminal 5: Testing
curl http://localhost:3002/health
curl http://localhost:3002/api/sendgrid/health
```

---

## 📞 Need Help?

1. Check logs in backend terminal for specific errors
2. Review relevant documentation files in `/docs` and root directory
3. Verify all environment variables are set correctly
4. Ensure all external services (Redis, ChromaDB, Supabase) are running
5. Check Supabase dashboard for database issues
6. Review SendGrid dashboard for email sending issues

---

**Last Updated:** 2025-01-17
**Backend Status:** ✅ Running (Configuration Required)
**Database Status:** ⚠️ Tables Missing
**SendGrid Status:** ⚠️ API Key Invalid
**Redis Status:** ✅ Connected
**ChromaDB Status:** ✅ Connected
