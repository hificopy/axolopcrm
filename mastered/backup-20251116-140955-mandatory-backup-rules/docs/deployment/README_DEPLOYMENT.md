# Axolop CRM - Deployment Guide

## Overview

Complete deployment guide for Axolop CRM with Vercel for frontend and Docker for backend services. This system replaces iClosed, HubSpot, and Close CRM with a unified platform optimized for Axolop (ECOMMERCE, B2B BUSINESS, REAL ESTATE) business operations.

### URLs

**Frontend:** Deployed to Vercel (from mastered branch)
**Backend API (dev):** http://localhost:3001 (development)
**Backend API (Docker):** http://localhost:4001 (when running in Docker container)
**ChromaDB:** http://localhost:8001 (in Docker) / self-hosted in production

## Architecture

### Primary Database: Supabase PostgreSQL Cloud
- **Purpose**: Main CRM data storage (leads, contacts, deals, activities)
- **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, etc.) integrated with Auth0 as external identity provider
- **Database Access**: Direct Supabase client (no ORM used)
- **Features**: ACID transactions, complex queries, real-time subscriptions

### Vector Database: ChromaDB
- **Purpose**: AI/ML vector storage for semantic search and embeddings
- **Integration**: Semantic search, document embeddings, AI chat memory
- **Access**: Direct API calls from backend services

### Authentication & Security
- **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, etc.) and integration with Auth0 as external provider
- **Database Security**: Supabase Row Level Security (RLS) policies
- **Token Management**: JWT-based with refresh tokens

### Infrastructure
- **Frontend:** Vercel (automatic from mastered branch)
- **Backend Infrastructure:** Docker containers for self-hosted services
- **Authentication:** Supabase Auth with optional Auth0 integration
- **Infrastructure:** Vercel (frontend) + Self-hosted Docker (backend services)

## Deployment Process

### Git Branch Strategy
- **`mastered` branch:** Production-ready code deployed to Vercel
- **`beta` branch:** Testing environment, deploy here first before `mastered`
- **`backup` branch:** Backup of important versions
- **Local `backups/` folder:** For version preservation of local files.
- **Local `beta/` folder:** For local testing environment files.
- **Local `mastered/` folder:** For local production-ready files.

### Deployment Workflow
1. **Development:** Local development server (npm run dev:vite)
2. **Beta Testing:** Deploy to beta branch for team review
3. **Production:** Deploy to mastered branch for Vercel production

## Backend Services (Docker)

### Required Services
1. **Backend API:** Node.js/Express server handling API requests
2. **ChromaDB:** Vector database for AI/ML features
3. **Redis:** Caching and session management
4. **n8n:** Automation platform

### Docker Configuration
The backend services run in Docker containers on self-hosted infrastructure:
- **Backend API:** http://localhost:4001 (when running in Docker container)
- **ChromaDB:** http://localhost:8001 (dev) / self-hosted (production)
- **Redis:** http://localhost:6379 (dev) / self-hosted (production)

## Frontend Deployment (Vercel)

### Setup Process
1. Create Vercel account at [vercel.com](https://vercel.com)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure the project with:
   - Framework: Create React App or Vite
   - Build Command: `npm run build`
   - Output Directory: `dist` (for Vite) or `build` (for CRA)

### Environment Variables
```
# Vercel Environment Variables
VITE_API_URL=https://your-backend-domain.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Emergency Maintenance

### Under Construction Mode
To temporarily show a login page for maintenance:
- Set `UNDER_CONSTRUCTION = true` in `/frontend/App.jsx`
- This redirects all users from `/` to `/password` page
- Use password "katewife" to access the app
- Set back to `false` when maintenance is complete

## Backup & Safety Procedures

### Before Major Changes
1. Create backup in `local/backups/` folder
2. Document the change: record what was changed and why
3. Version the backup: include date and description
4. Push backup to GitHub: under backup branch for safekeeping
5. Test the backup: ensure system works as expected

### Deployment Safety
- Always deploy to beta branch first
- Never directly push major changes to mastered
- Maintain proper backup procedures
- Test all functionality before production deployment