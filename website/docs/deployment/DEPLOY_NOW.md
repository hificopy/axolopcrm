# 🚀 Deploy Axolop CRM Now!

**Status:** ✅ Vercel + Docker Infrastructure Ready
**Deployment:** Frontend to Vercel, Backend Services in Docker
**Time:** 5-10 minutes for full setup

---

## ✅ What's Been Built

### Frontend Infrastructure (100%)
- ✅ **Vercel Deployment** - Frontend hosted on Vercel (automatic from main branch)
- ✅ **React 18.2** + Vite 5 + TailwindCSS 3.3
- ✅ **Close CRM UI** (Sidebar + Topbar + all pages)
- ✅ **Environment Configuration** - Vercel with proper API endpoints

### Backend Infrastructure (100%)
- ✅ **Docker Compose** - Services for backend functionality:
  - crm-backend (Node 20 + Express API)
  - crm-redis (Redis 7 for caching)
  - crm-chromadb (Vector DB for AI features)
  - n8n (Automation platform)
- ✅ **Application configuration** - Backend services with proper Supabase integration
- ✅ **.env** - Environment variables (Supabase configured)
- ✅ **deploy.sh** - Backend deployment script

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
- **Frontend:** Vercel deployment (from main branch)
- **Backend API:** http://localhost:3001 (development) / self-hosted in production
- **ChromaDB:** http://localhost:8001 (in Docker) / self-hosted in production
- **Health Check:** http://localhost:3001/health

---

## 📋 Git Workflow

### Branch Strategy
- **`main` branch:** Production-ready code deployed to Vercel
- **`beta` branch:** Testing environment, deploy here first before main
- **`backup` branch:** Backup of important versions

### Deployment Safety
1. **Always test on beta first** - Deploy to beta branch before main
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
# Check backend health
curl http://localhost:3001/health
curl http://localhost:3001/api/health
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