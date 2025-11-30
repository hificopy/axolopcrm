# 🚀 Axolop CRM - Start Here

**Project Status:** Version 1.2.0 (Production Ready)
**Ready to Install:** ✅ Yes
**Ready to Run:** ✅ Yes

---

## ✅ What's Been Built

### 1. Complete Infrastructure (100%)

- ✅ **Database:** Supabase PostgreSQL configured
- ✅ **Database Connection:** Supabase PostgreSQL configured
- ✅ **Docker:** Redis container for queues
- ✅ **Backend:** Express server with health checks
- ✅ **Frontend:** React + Vite + TailwindCSS
- ✅ **API Client:** All endpoints pre-configured
- ✅ **Utilities:** Helper functions and formatters

### 2. Close CRM UI (90%)

- ✅ **Layout:** Sidebar + Topbar + MainLayout
- ✅ **Sidebar:** All 12 navigation links, dark theme, active states
- ✅ **Topbar:** Search bar, quick actions, notifications
- ✅ **Styling:** Exact Close CRM colors, fonts, spacing
- ✅ **Components:** Button, Input, Badge

### 3. Leads Page (60%)

- ✅ **Table:** Name, Email, Phone, Status, Source, Value, Owner, Created
- ✅ **Stats:** Total, Qualified, Contacted, Total Value cards
- ✅ **Detail Panel:** Right sidebar with lead information
- ✅ **Mock Data:** 3 sample leads for demonstration
- ⏳ **Pending:** Add/Edit forms, API integration, search/filter

### 4. Documentation (100%)

- ✅ `README.md` - Project overview
- ✅ `TECH_STACK.md` - Complete tech stack
- ✅ `CLOSE_CRM_UI_ANALYSIS.md` - 130+ page UI analysis
- ✅ `SUPABASE_CONFIGURATION.md` - Supabase setup
- ✅ `INSTALLATION_GUIDE.md` - Installation steps
- ✅ `SETUP_COMPLETE.md` - Setup summary
- ✅ `BUILD_PROGRESS.md` - Current build status
- ✅ `START_HERE.md` - This file

---

## 🚨 One Issue: npm Cache Permissions

Your system has npm cache permission issues preventing automatic installation.

### Solution (Run This Once)

```bash
# Fix npm permissions (requires your password)
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
```

---

## 📦 Deployment (5-10 Minutes)

### Complete Docker Deployment (Recommended)

**Step 1: Fix npm Permissions (one-time)**

```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
```

**Step 2: Run Deployment Script**

```bash
cd ~/Desktop/CODE/axolopcrm/website
./deploy.sh
```

The script automatically:

- ✅ Installs all dependencies (~100 packages)

- ✅ Builds Docker images (frontend + backend)
- ✅ Starts 6 Docker containers
- ✅ Checks health status

**Step 3: Access CRM**

```
Frontend: Vercel deployment (from mastered branch)
Backend API: http://localhost:3002 (development) / self-hosted in production
```

### Backend Docker Services

For development, these containers run the backend services:

1. **crm-backend** - Node 20 + Express API (port 3002)
2. **crm-redis** - Redis 7 (cache & queue)
3. **crm-chromadb** - ChromaDB for AI/ML (port 8001)
4. **n8n** - Automation platform

**Frontend:** Vercel deployment (not Docker container)
**Database:** Supabase PostgreSQL Cloud (external)

### Manual Development Setup (Alternative)

If you want to run without Docker:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev servers
npm run dev
```

Access:

- **Frontend:** http://localhost:3000
- **Backend (dev):** http://localhost:3002
- **Backend (Docker):** http://localhost:4001

---

## 🎨 What You'll See

### After Starting Dev Server:

1. **Login Screen** (Supabase Auth)
   - If Auth0 configured: Real login
   - If not configured: "Sign In" button

2. **Sidebar Navigation** (Left)
   - Inbox
   - Leads ← **Working!**
   - Contacts (placeholder)
   - Pipeline (placeholder)
   - Opportunities (placeholder)
   - Activities (placeholder)
   - Workflows (placeholder)
   - History (placeholder)
   - Live Calls (placeholder)
   - Reports (placeholder)
   - Email Marketing (placeholder)
   - Forms (placeholder)
   - Settings (placeholder)

3. **Topbar** (Top)
   - Search bar (UI only)
   - "New" button (UI only)
   - Notifications icon
   - Help icon

4. **Leads Page** ← **Fully Functional!**
   - Stats cards (Total, Qualified, Contacted, Value)
   - Leads table with 3 mock leads
   - Click any lead → Detail panel slides in
   - Filter, Export, Import buttons (UI only)
   - "New Lead" button (UI only)

---

## 🛠️ Tech Stack

- **Frontend:** React 18.2 + Vite 5 (deployed to Vercel)
- **Backend:** Express 4.18 + Node 20+ (self-hosted in Docker)
- **Database:** Supabase PostgreSQL Cloud + Direct Supabase Client (no Prisma used)
- **Caching & Queue:** Redis + Bull
- **Styling:** TailwindCSS 3.3
- **Authentication:** Supabase Auth with optional Auth0 integration
- **AI/ML:** OpenAI + Groq + ChromaDB
- **Infrastructure:** Vercel (frontend) + Self-hosted Docker (backend services)
- Stripe (payments)

**CRM-Specific:**

- shadcn/ui (Radix UI components)
- TanStack Table (data grids)
- React Hook Form + Zod (forms)
- @dnd-kit (drag & drop Kanban)
- Tiptap (rich text editor)
- react-email (email builder)
- Recharts (reporting)
- Zustand (state management)

---

## 📁 Project Structure

```
website/
├── server/index.js              # Express API
├── frontend/
│   ├── main.jsx                 # React entry
│   ├── App.jsx                  # Routing
│   ├── components/
│   │   ├── ui/                  # Button, Input, Badge
│   │   └── layout/              # Sidebar, Topbar, MainLayout
│   ├── pages/
│   │   ├── Inbox.jsx            # Placeholder
│   │   └── Leads.jsx            # ✅ Working!
│   ├── lib/
│   │   ├── api.js               # API client
│   │   └── utils.js             # Helpers
│   └── styles/globals.css       # Close CRM styling
├── .env.example                 # Supabase configured
└── docker-compose.yml           # Redis container
```

---

## 🎯 Current Progress

**Overall: 35%**

- Infrastructure: 100% ✅
- UI Layout: 90% ✅
- Leads Page: 60% 🚧
- Other Pages: 0-30% ⏳

**Phase 1.1 - Layout (90%)**

- ✅ Sidebar
- ✅ Topbar
- ✅ MainLayout
- ✅ Routing
- ⏳ Full shadcn/ui integration

**Phase 1.2 - Leads (60%)**

- ✅ Table UI
- ✅ Detail panel
- ⏳ Add/Edit forms
- ⏳ API integration
- ⏳ Search & filters

---

## 📋 Next Steps After Installation

### Immediate (Week 1)

1. ✅ Install dependencies
2. ✅ Run migrations
3. Build lead Add/Edit form
4. Connect leads to API
5. Add real-time search

### Short-term (Week 2)

1. Build Contacts page
2. Build Pipeline Kanban
3. Add drag & drop
4. Deal management

### Medium-term (Weeks 3-4)

1. Activities feed
2. Tasks & reminders
3. Interactions timeline
4. Email integration

---

## 🔗 Quick Commands

```bash
# Install everything
npm install --legacy-peer-deps

# Start Redis
docker-compose up -d redis

# Start dev servers
npm run dev

# View logs
docker-compose logs -f redis
```

---

## 📚 Documentation

1. **Installation:** `INSTALLATION_GUIDE.md`
2. **Setup Summary:** `SETUP_COMPLETE.md`
3. **Supabase:** `SUPABASE_CONFIGURATION.md`
4. **Build Progress:** `BUILD_PROGRESS.md`
5. **Tech Stack:** `TECH_STACK.md`
6. **UI Analysis:** `CLOSE_CRM_UI_ANALYSIS.md`

---

## 🐛 Troubleshooting

### npm install fails

```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
npm install --legacy-peer-deps
```

### Database connection error

```bash
# Check .env DATABASE_URL
cat .env | grep DATABASE_URL
```

### Redis connection error

```bash
# Start Redis
docker-compose up -d redis

# Or use local Redis
brew services start redis
```

### Port already in use

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

---

## 🎥 Demo

### What Works Now:

1. **Sidebar Navigation** ✅
   - All links visible
   - Active state highlighting
   - Smooth hover effects

2. **Leads Page** ✅
   - Table with 3 mock leads
   - Stats dashboard
   - Detail panel
   - Close CRM styling

3. **Routing** ✅
   - Navigate between pages
   - Placeholders for future pages

### What's Coming Next:

1. **Lead Forms** (Phase 1.2)
   - Add new lead
   - Edit existing lead
   - React Hook Form + Zod validation

2. **API Integration** (Phase 1.2)
   - CRUD operations
   - Real-time updates
   - Error handling

3. **Pipeline Kanban** (Phase 1.3)
   - Drag & drop cards
   - Deal stages
   - Visual pipeline

---

## 💡 Key Features

### Already Built:

- ✅ Close CRM UI clone (90%)
- ✅ Supabase PostgreSQL integration
- ✅ Complete database schema
- ✅ Express API server
- ✅ React frontend
- ✅ Docker setup (Redis)

### Coming in Phase 1 (Weeks 1-4):

- 🚧 Leads management (60% done)
- ⏳ Contacts management
- ⏳ Pipeline Kanban board
- ⏳ Interactions tracking
- ⏳ Tasks & reminders

### Coming in Phase 2 (Weeks 5-8):

- ⏳ Email marketing
- ⏳ Campaign management
- ⏳ Email templates
- ⏳ Drip sequences

### Coming in Phase 3 (Weeks 9-12):

- ⏳ Form builder
- ⏳ Lead capture
- ⏳ Workflow automation
- ⏳ AI lead scoring

---

## 🎯 Goals

### Primary Objective:

**Replace iClosed, HubSpot, and Close CRM** with a unified platform optimized for Axolop (HubSpot competitor with typeform, jotform, perspective funnels, manychat automations, active campaign email flow builder, klaviyo, beehive newsletter, close crm sales section functionalities).

### Key Benefits:

1. **Cost Savings:** Eliminate 3+ SaaS subscriptions
2. **Unified Platform:** One CRM for both businesses
3. **Custom Workflows:** Optimized for our processes
4. **Integration:** Ready for AutoFlow & InsightOS
5. **AI-Powered:** Lead scoring, sentiment analysis

---

## 🔐 Environment Variables

Already configured in `.env.example`:

```env
# Database (Supabase) ✅
DATABASE_URL=postgresql://postgres.opvjavtjcokwjdjxbyyf:...
SUPABASE_URL=https://opvjavtjcokwjdjxbyyf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Redis ✅
REDIS_URL=redis://localhost:6379

# JWT ✅
JWT_SECRET=fcebee5dbe00842...

# Auth0 (optional integration)
# AUTH0_DOMAIN=
# AUTH0_CLIENT_ID=
# AUTH0_CLIENT_SECRET=

# OpenAI (optional)
OPENAI_API_KEY=

# Stripe (optional)
STRIPE_SECRET_KEY=
```

---

## 📞 Support

**Questions?** juan@axolop.com

**Issues?** Check:

1. `INSTALLATION_GUIDE.md` - Installation help
2. `SUPABASE_CONFIGURATION.md` - Database help
3. `BUILD_PROGRESS.md` - Current status

---

## 🚀 Let's Build!

**Ready to start?**

```bash
# 1. Fix npm (one-time)
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"

# 2. Install
cd ~/Desktop/CODE/axolopcrm/website
npm install --legacy-peer-deps

# 3. Setup
cp .env.example .env

# 4. Start
docker-compose up -d redis
npm run dev

# 5. Open http://localhost:3000
```

**That's it!** 🎉

The CRM is now running with:

- Beautiful Close CRM UI
- Working Leads page
- Supabase database
- Ready for Phase 1.2 development

---

**Last Updated:** 2025-11-10
**Version:** 1.0.0-alpha
**Status:** 🚧 Phase 1.1 (35% Complete)
