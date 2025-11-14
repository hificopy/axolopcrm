# Axolop CRM - Installation Guide

**Date:** 2025-11-10
**Status:** Ready for Installation

---

## 🚨 npm Cache Permission Issue

Your system has npm cache permission issues that prevent automatic installation. This is a common macOS issue.

### Solution: Manual Fix Required

You'll need to run this command **manually in your terminal** to fix the permissions:

```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
```

This will prompt for your password and fix the npm cache ownership.

---

## Complete Installation Steps

### Step 1: Fix npm Cache (One-Time Setup)
```bash
# Run this ONCE to fix permissions
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
```

### Step 2: Navigate to CRM Directory
```bash
cd ~/Desktop/CODE/axolopcrm/website
```

### Step 3: Install Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

This will install:
- **Core dependencies:** React, Express, Supabase client, Redis, etc.
- **CRM-specific:** shadcn/ui, TanStack Table, React Hook Form, @dnd-kit, Tiptap, etc.
- **Total:** 100+ packages (~500MB)

### Step 4: Setup Environment
```bash
# Copy environment file
cp .env.example .env

# .env is already configured with:
# - Supabase PostgreSQL connection
# - Supabase API keys
# - JWT secret

# You may need to add:
# - AUTH0_DOMAIN, AUTH0_CLIENT_ID (if using Auth0)
# - OPENAI_API_KEY, GROQ_API_KEY (for AI features)
# - STRIPE_SECRET_KEY (for payments)
```

### Step 5: Setup Supabase Client
```bash
# No Prisma needed - using direct Supabase client
# Ensure your .env file has proper Supabase configuration
```

### Step 6: Start Redis
```bash
# Option A: Docker (recommended)
docker-compose up -d redis

# Option B: Local Redis
brew install redis
brew services start redis
```

### Step 7: Setup Database Connection
```bash
# Database schema managed through Supabase dashboard (no Prisma used)
# Visit your Supabase project dashboard to configure tables
```

Database schema is configured using Supabase dashboard:
- User, Lead, Contact, Deal
- Interaction, Task, Note, Activity
- EmailCampaign, EmailTemplate, EmailSequence
- Form, FormSubmission
- Workflow, SmartView, Integration
- PipelineStage

### Step 8: Verify Setup
```bash
# Test database connection
# Use Supabase dashboard to verify connection
# Visit: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### Step 9: Start Development Servers
```bash
npm run dev
```

This starts:
- **Frontend (Vite):** http://localhost:3000
- **Backend (Express dev):** http://localhost:3001
- **Backend (Docker):** http://localhost:4001

### Step 10: Test Health Check
```bash
# Development server
curl http://localhost:3001/health

# Docker container
curl http://localhost:4001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## Alternative: Install shadcn/ui Components

After npm install completes, install UI components:

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add command
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add card
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add sheet
```

Or install all at once:
```bash
npx shadcn-ui@latest add button input select dialog dropdown-menu table tabs badge avatar popover command separator toast card checkbox radio-group switch textarea calendar sheet
```

---

## Troubleshooting

### Issue: "Cannot find database client"
```bash
# No Prisma used - using direct Supabase client
# Ensure your .env file has proper Supabase configuration
```

### Issue: "Redis connection error"
```bash
# Check Redis is running
docker-compose ps

# Or check local Redis
brew services list | grep redis

# Start Redis
docker-compose up -d redis
# OR
brew services start redis
```

### Issue: "Database connection error"
```bash
# Check .env for Supabase connection details.
# See .env.example for required variables.
```

### Issue: "Port 3000 or 3001 already in use"
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or use different ports
PORT=3002 npm run dev:backend
```

### Issue: npm install fails with EACCES
```bash
# Fix npm permissions
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"

# Try install again
npm install --legacy-peer-deps
```

---

## Project Structure After Installation

```
website/
├── node_modules/             ✅ After npm install
├── database/
│   └── schema.sql            ✅ Database schema (managed via Supabase dashboard)
├── server/
│   ├── index.js             ✅ Express server ready
│   └── ...                  ⏭️ To be built
├── frontend/
│   ├── main.jsx             ✅ React entry
│   ├── App.jsx              ✅ Main app
│   ├── components/          ⏭️ To be built
│   ├── pages/               ⏭️ To be built
│   └── ...
├── package.json             ✅ All dependencies listed
├── .env                     ✅ After cp .env.example .env
├── docker-compose.yml       ✅ Redis container config
└── ...
```

---

## Next Steps After Installation

Once installation is complete, you can start building the CRM:

### Phase 1.1: Layout & Navigation (Week 1-2)
- [ ] Build sidebar (Close CRM style)
- [ ] Build topbar with search
- [ ] Create main layout component
- [ ] Setup React Router routes

### Phase 1.2: Leads Management (Week 2-3)
- [ ] Leads table component (TanStack Table)
- [ ] Lead detail panel
- [ ] Lead creation form (React Hook Form + Zod)
- [ ] Lead status updates
- [ ] Lead to contact conversion

### Phase 1.3: Pipeline (Week 3-4)
- [ ] Kanban board (@dnd-kit)
- [ ] Deal cards
- [ ] Drag & drop between stages
- [ ] Deal detail panel
- [ ] Deal creation/editing

### Phase 1.4: Contacts & Interactions (Week 4)
- [ ] Contacts table
- [ ] Contact detail panel
- [ ] Interactions timeline
- [ ] Email/call/note creation

---

## Development Workflow

### Daily Development
```bash
# 1. Start Redis (if not running)
docker-compose up -d redis

# 2. Start dev servers
npm run dev

# 3. Open browser
# - Frontend: http://localhost:3000
# - API: http://localhost:3001/health

# 4. Make changes (hot reload enabled)

# 5. View logs in terminal
```

### Supabase Database Setup
```bash
# 1. Create new Supabase project named "CRM" at https://supabase.com/dashboard

# 2. Update environment variables in .env:
#    SUPABASE_URL=https://PROJECT_REF.supabase.co
#    SUPABASE_ANON_KEY=your_anon_key
#    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 3. Run database schema
# The database schema is managed through the Supabase dashboard.
# See `supabase-schema.sql` for the table structure.
# Database changes managed through Supabase dashboard (no Prisma used)
# 4. Configure Row Level Security (RLS) in Supabase Dashboard:
#    - Enable RLS on all tables
#    - Create policies to restrict access by user ID
#    - Allow authenticated users appropriate access levels
```

### Database Changes
```bash
# Database schema managed through Supabase dashboard
# Make changes in Supabase dashboard UI

# 3. Verify in Supabase Dashboard
# Visit: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### Code Quality
```bash
# Run linter
npm run lint

# Format code
npm run format
```

---

## Quick Reference

### npm Commands
```bash
npm run dev              # Start frontend + backend
npm run dev:vite         # Frontend only
npm run dev:backend      # Backend only
npm run build            # Build for production
# Database operations are handled directly through the Supabase dashboard, not via npm commands.
```

### Docker Commands
```bash
docker-compose up -d redis       # Start Redis
docker-compose down              # Stop all
docker-compose logs -f redis     # View Redis logs
docker-compose ps                # Check status
```

### Supabase
- **Dashboard:** https://supabase.com/dashboard/project/opvjavtjcokwjdjxbyyf
- **Table Editor:** View/edit CRM tables
- **SQL Editor:** Run custom queries

---

## Support

**Issue:** npm cache permissions → Run: `sudo chown -R $(id -u):$(id -g) "$HOME/.npm"`

**Issue:** Database connection → Check `.env` for Supabase connection details.

**Issue:** Redis connection → Check `docker-compose ps` or `brew services list | grep redis`

**Questions:** juan@axolop.com

---

**Status:** ⏳ Awaiting Manual Permission Fix
**Next Action:** Run `sudo chown -R $(id -u):$(id -g) "$HOME/.npm"` in terminal
**Last Updated:** 2025-11-10
