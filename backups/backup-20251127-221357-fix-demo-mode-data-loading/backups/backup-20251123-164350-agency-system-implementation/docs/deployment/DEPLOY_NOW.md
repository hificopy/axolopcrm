# 🚀 Deploy Axolop CRM Now!

**Status:** ✅ Vercel + Docker Infrastructure Ready
**Deployment:** Frontend to Vercel, Backend Services in Docker
**Time:** 5-10 minutes for full setup

---

## ✅ What's Been Built

### Frontend Infrastructure (100%)
- ✅ **Vercel Deployment** - Frontend hosted on Vercel (automatic from mastered branch)
- ✅ **React 18.2** + Vite 5 + TailwindCSS 3.3
- ✅ **Close CRM UI** (Sidebar + Topbar + all pages)
- ✅ **Environment Configuration** - Vercel with proper API endpoints

### Backend Infrastructure (100%)
- ✅ **Self-Hosted Server** - Running on macOS with Docker Compose:
  - crm-backend (Node 20 + Express API on port 3002)
  - crm-redis (Redis 7 for caching)
  - crm-chromadb (Vector DB for AI features)
- ✅ **Dynamic DNS** - axolop.hopto.org via No-IP service
- ✅ **Router Configuration** - TP-Link AXE with port forwarding (port 3002)
- ✅ **Application configuration** - Backend services with proper Supabase integration
- ✅ **.env** - Environment variables (Supabase configured)
- ✅ **deploy.sh** - Backend deployment script

### Frontend-Backend Communication (100%)
- ✅ **API Proxy** - Vercel proxies /api/* requests to http://axolop.hopto.org:3002
- ✅ **CORS Configuration** - Backend allows requests from https://axolop.com
- ✅ **Secure Communication** - End-to-end HTTPS communication flow

### Database & Security (100%)
- ✅ **Supabase PostgreSQL Cloud** - Production database ready
- ✅ **Authentication** - Supabase Auth with optional Auth0 integration
- ✅ **Security** - Row Level Security (RLS) configured
- ✅ **API Security** - JWT tokens, rate limiting, CORS

### Application Features (100%)
- ✅ All CRM functionality (Leads, Contacts, Pipeline, etc.)
- ✅ Database schema (20+ models) - Direct Supabase client (no Prisma used)
- ✅ API endpoints (all configured)
- ✅ All documentation

---

## 🎯 Deployment Process

### 1. Frontend Deployment (Vercel)
```bash
# Connect repository to Vercel dashboard
# Configure:
# - Framework: Create React App or Vite
# - Build Command: `npm run build`
# - Output Directory: `dist` (for Vite) or `build` (for CRA)
# - Root Directory: `/website`

# Environment Variables:
VITE_API_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Backend Deployment (Self-hosted Docker)
```bash
# On your server
git clone your-repo
cd your-repo
cd website
docker-compose up -d
```

### URLs
- **Frontend:** Vercel deployment (from mastered branch)
- **Backend API (dev):** http://localhost:3002 (development)
- **Backend API (Docker):** http://localhost:3002 (when running in Docker container)
- **Backend API (Production):** http://axolop.hopto.org:3002 (dynamic DNS forwarding to Docker container)
- **ChromaDB:** http://localhost:8001 (in Docker) / self-hosted in production
- **Health Check:** http://localhost:3002/health (Docker) or http://localhost:3002/health (dev)

---

## 📋 Git Workflow

### Branch Strategy (CRITICAL - FOLLOW EXACTLY)
- **`mastered` branch:** Production-ready code deployed to Vercel (LIVE WEBSITE)
- **`beta` branch:** Testing environment, deploy here first before mastered
- **`backup` branch:** Backup of important versions
- **Local `backups/` folder:** For version preservation of local files.
- **Local `beta/` folder:** For local testing environment files.
- **Local `mastered/` folder:** For local production-ready files.

### Deployment Flow (MANDATORY)
1. **Development**: Work on `main` branch
2. **Testing**: Deploy to `beta` branch for testing
3. **Production**: Only after thorough testing, deploy to `mastered`
4. **NEVER** deploy directly to `mastered` without beta testing

### Release Management Process

#### Pre-Release Requirements (MANDATORY)
1. **Backup Creation** (AI Assisted)
   - Create backup in `../mastered/` folder: `backup-YYYYMMDD-HHMMSS-description`
   - Document changes and version number

2. **Version Management** (Human Controlled)
   - Version format: V.X.Y (e.g., V1.0, V1.1, V1.2)
   - Next version is always one point above last release

3. **Feature Documentation** (AI Assisted)
   - Generate changelog from last version
   - Document new features and changes

#### Release Execution (HUMAN ONLY)
1. **Final Testing**: Manual testing on beta branch
2. **Developer Verification**: Juan manually tests all features
3. **Manual Push**: Only Juan performs `git push` to `mastered`
4. **Vercel Deployment**: Manual deployment to production (by Juan)

#### AI Role in Deployment (LIMITED)
- **AI CAN**: Create backups, generate documentation, prepare release notes
- **AI CANNOT**: Commit to GitHub, push to Vercel, or make production releases
- **AI MUST**: Remind about backup process and documentation requirements

### Deployment Safety
1. **Always test on beta first** - Deploy to beta branch before mastered
2. **Create backups** - For major changes, backup and document changes
3. **Emergency maintenance** - Use UNDER_CONSTRUCTION toggle for maintenance
4. **Environment consistency** - Maintain same configs across environments

---

## ⚠️ Important Notes

### Tech Stack Confirmation
- **Frontend:** React 18.2 + Vite 5 + TailwindCSS 3.3 → Vercel
- **Deployment:** Vercel (frontend) + Self-hosted Docker (backend services)
- **Database:** Supabase PostgreSQL Cloud + Direct Supabase Client (no Prisma used)
- **Authentication:** Supabase Auth with optional Auth0 integration

### No Prisma Usage
- **Direct Supabase Client** used instead of Prisma ORM
- **Database operations** handled through Supabase client directly
- **Schema management** through Supabase dashboard (not Prisma migrations)

---

## 🧪 Health Checks

### Backend Health
```bash
# Check backend health (development)
curl http://localhost:3002/health
curl http://localhost:3002/api/health

# Check backend health (Docker)
curl http://localhost:4001/health
curl http://localhost:4001/api/health
```

### All Services Running
- ✅ Frontend loading at Vercel URL
- ✅ API endpoint responding at backend URL
- ✅ Supabase database connected
- ✅ Redis cache operational
- ✅ ChromaDB operational (for AI features)

---

## 🔄 Emergency Maintenance

### Under Construction Mode
To temporarily show a login page for maintenance:
```javascript
// In /frontend/App.jsx
UNDER_CONSTRUCTION = true;  // Redirects / to /password
```
- This shows login page to all users except developers
- Password is "katewife" (change as needed for production)
- Set back to `false` when maintenance is complete