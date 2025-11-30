# Axolop CRM

**The New Age CRM with Local AI Second Brain**

Tired of juggling GoHighLevel, ClickUp, Notion, Miro, and 10+ disconnected tools?

Built with React, Node.js, PostgreSQL (Supabase), Redis, and ChromaDB.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL (via Supabase)
- Redis
- ChromaDB (optional, for AI features)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase and API credentials

# 3. Deploy database schemas (in Supabase SQL Editor)
# - Run: backend/db/users-schema.sql
# - Run: scripts/onboarding-schema.sql
# - Run: supabase-complete-setup.sql

# 4. Start Redis
redis-server

# 5. Start ChromaDB (optional)
chroma run --host localhost --port 8001

# 6. Start application
npm run dev              # Starts both frontend and backend
# OR run separately:
npm run dev:backend      # Backend API (port 3002)
npm run dev:vite         # Frontend (port 3000)
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3002
- **Health Check:** http://localhost:3002/health

### Quick Commands
```bash
npm run verify:schema    # Verify database schema deployment
npm run test:auth        # Test authentication system
npm run deploy:schema    # Get schema deployment instructions
```

---

## 📊 Current System Status

### ✅ Complete & Working
- **Authentication:** Sign in/up, Google OAuth, password reset
- **Onboarding:** 4-step user onboarding flow
- **User Management:** Profiles, settings, activity tracking
- **Backend API:** Express server with full CRUD operations
- **Frontend:** React 18 + Vite with TailwindCSS
- **Database:** PostgreSQL via Supabase
- **Cache:** Redis integration
- **Email:** SendGrid integration
- **Workflows:** Automation engine
- **Forms:** Form builder v2
- **Second Brain:** AI-powered knowledge management

### ⚠️ Deployment Required

**1. Database Schemas** (10 minutes)
```bash
# Deploy in Supabase SQL Editor:
# https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new

# Deploy these files in order:
1. backend/db/users-schema.sql         # User profiles and auth
2. scripts/onboarding-schema.sql       # Onboarding system
3. supabase-complete-setup.sql         # Complete CRM tables
```

**2. Environment Variables**
```bash
# Required in .env:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENDGRID_API_KEY=your_sendgrid_key
```

### 🧪 Health Check
```bash
node scripts/system-health-check.js
# OR
curl http://localhost:3002/health
```

---

## 📚 Documentation

### 🎯 Start Here

**For New Users:**
1. **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Quick start guide
2. **[docs/README.md](docs/README.md)** - Master documentation index
3. **[docs/authentication/AUTH_SYSTEM_STATUS.md](docs/authentication/AUTH_SYSTEM_STATUS.md)** - Auth setup

**For Developers:**
1. **[docs/development/START_HERE.md](docs/development/START_HERE.md)** - Dev setup
2. **[docs/development/INSTALLATION_GUIDE.md](docs/development/INSTALLATION_GUIDE.md)** - Detailed setup
3. **[docs/development/DEVELOPMENT_WORKFLOW.md](docs/development/DEVELOPMENT_WORKFLOW.md)** - Git workflow

**For Deployment:**
1. **[docs/deployment/DEPLOY_NOW.md](docs/deployment/DEPLOY_NOW.md)** - Production deployment
2. **[docs/deployment/DOCKER_DEPLOYMENT.md](docs/deployment/DOCKER_DEPLOYMENT.md)** - Docker setup

### 📁 Documentation Structure

- **[docs/](docs/)** - Master documentation index
- **[docs/authentication/](docs/authentication/)** - Auth & onboarding docs
- **[docs/api/](docs/api/)** - API endpoints and integration
- **[docs/architecture/](docs/architecture/)** - System design and tech stack
- **[docs/database/](docs/database/)** - Database schema and setup
- **[docs/deployment/](docs/deployment/)** - Deployment guides
- **[docs/development/](docs/development/)** - Development workflow
- **[docs/features/](docs/features/)** - Feature documentation
- **[docs/setup/](docs/setup/)** - Integration setup guides
- **[docs/sendgrid/](docs/sendgrid/)** - Email service docs
- **[docs/troubleshooting/](docs/troubleshooting/)** - Debugging guides
- **[docs/archive/](docs/archive/)** - Historical documentation

---

## 🔑 Key Features

### Core CRM
- ✅ **Lead Management** - Capture, track, and nurture leads
- ✅ **Contact Management** - Centralized contact database
- ✅ **Opportunities** - Sales pipeline and deal tracking
- ✅ **Activities & History** - Complete interaction timeline
- ✅ **Reports & Analytics** - Business intelligence

### Advanced Features
- ✅ **Second Brain** - AI-powered knowledge management
  - Logic View - Thought organization
  - Maps View - Visual mind mapping
  - Notes View - Rich text notes
- ✅ **Master Search** - Universal search across all data
- ✅ **Form Builder** - Drag-and-drop form creation
- ✅ **Workflow Automation** - Visual workflow builder
- ✅ **Email Marketing** - Campaign management
- ✅ **Calendar & Scheduling** - Meeting management
- ✅ **Inbox** - Gmail integration

### User Experience
- ✅ **4-Step Onboarding** - Personalized setup flow
- ✅ **Dark Mode** - Full dark theme support
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Keyboard Shortcuts** - Power user features
- ✅ **Drag & Drop** - Intuitive interfaces

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Component library
- **React Router** - Routing
- **Zustand** - State management
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Supabase** - PostgreSQL database
- **Redis** - Caching & queues
- **ChromaDB** - Vector database (optional)
- **SendGrid** - Email delivery
- **JWT** - Authentication

### Infrastructure
- **Supabase** - Database & Auth
- **Vercel** - Frontend hosting (recommended)
- **Railway** - Backend hosting (recommended)
- **Upstash** - Redis hosting
- **GitHub** - Version control

---

## 👥 User Accounts

### Admin Account
- **Email:** axolopcrm@gmail.com
- **Access:** Full system privileges
- **Onboarding:** Automatically bypassed

### Test Accounts
- **Kate Violet (Business Tier)**
  - Email: kate@kateviolet.com
  - Password: Katewife1
  - Purpose: Testimonials and demos
  - Features: Unlimited access to all features
  - Onboarding: Normal onboarding flow (special onboarding removed)

See [TESTIMONIALS_DATABASE.md](TESTIMONIALS_DATABASE.md) for details.

---

## 📝 Development

### Available Scripts

```bash
# Development
npm run dev                 # Start frontend + backend
npm run dev:vite            # Frontend only
npm run dev:backend         # Backend only

# Testing
npm run test:auth           # Test auth system
npm run verify:schema       # Verify database schema

# Deployment
npm run build               # Build for production
npm run preview             # Preview production build

# Database
npm run deploy:schema       # Get schema deployment instructions

# Utilities
npm run lint                # Lint code
npm run format              # Format code
```

### Project Structure

```
website/
├── frontend/              # React frontend
│   ├── components/        # Reusable components
│   ├── pages/             # Route pages
│   ├── context/           # React contexts
│   ├── lib/               # Utilities
│   └── styles/            # Global styles
├── backend/               # Express backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   ├── db/                # Database schemas
│   └── utils/             # Helper functions
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── public/                # Static assets
```

---

## 🔐 Environment Variables

See [.env.example](.env.example) for all required environment variables.

**Critical Variables:**
```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Frontend (Vite)
VITE_API_URL=http://localhost:3002
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# SendGrid (Email)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Redis
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# OpenAI (Optional)
OPENAI_API_KEY=
```

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Verify environment variables
cat .env | grep SUPABASE

# Check Supabase dashboard
https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw
```

**Redis Connection Failed**
```bash
# Start Redis server
redis-server

# Test connection
redis-cli ping  # Should return "PONG"
```

**Authentication Not Working**
```bash
# Verify schema deployment
npm run verify:schema

# Check auth system status
# Read: docs/authentication/AUTH_SYSTEM_STATUS.md
```

**Port Already in Use**
```bash
# Find process using port
lsof -ti:3002  # Backend
lsof -ti:3000  # Frontend

# Kill process
kill -9 $(lsof -ti:3002)
```

For more help, see [docs/troubleshooting/](docs/troubleshooting/).

---

## 📞 Support & Resources

- **Documentation:** [docs/README.md](docs/README.md)
- **Issues:** Check [docs/ISSUES_TO_FIX.md](docs/ISSUES_TO_FIX.md)
- **Updates:** See [docs/TECHNICAL_UPDATES.md](docs/TECHNICAL_UPDATES.md)
- **Changelog:** See [TO-DOS.md](TO-DOS.md)

---

## 📄 License

**PROPRIETARY** - Axolop LLC

Copyright © 2025 Axolop LLC. All rights reserved.

---

**Built with ❤️ by the Axolop team**

Last Updated: 2025-01-19
