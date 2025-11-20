# Development Workflow for Axolop CRM

## Overview
This document clarifies the development workflow to eliminate confusion about toggles, environments, and deployment processes.

## Environment Configuration Toggles

### UNDER_CONSTRUCTION Toggle
- **File:** `/frontend/App.jsx`
- **Variable:** `UNDER_CONSTRUCTION = true/false`
- **Purpose:** Shows/hides the beta login page for the main site
- **When TRUE:** All users redirected from `/` to `/password` page
- **When FALSE:** Normal application flow without login requirement
- **Usage:** For "under construction" mode during development

### DEV_MODE Toggle (Development Only)
- **File:** `/frontend/App.jsx`
- **Variable:** `DEV_MODE = true/false`
- **Purpose:** Bypasses all authentication for local development
- **When TRUE:** App loads directly without any auth checks
- **When FALSE:** Normal authentication flow (including under construction redirect)
- **Usage:** For local development without needing to authenticate
- **Never use in production:** Always keep `DEV_MODE = false` in production

## Development vs Production Workflow

### Local Development
1. **Start Development Environment:**
   ```bash
   # Stop any Docker containers that might conflict
   docker stop crm-frontend-1  # if running
   
   # Start frontend development server
   npm run dev:vite
   ```

2. **Start Backend Services (if needed):**
   ```bash
   docker-compose up
   ```

3. **Working with Toggles:**
   - Set `UNDER_CONSTRUCTION = true/false` based on whether you want the under construction page
   - Set `DEV_MODE = true` to bypass all auth during development
   - Set `DEV_MODE = false` to test the actual user flow

### Production Deployment
1. **Frontend:** Automatically deployed to Vercel from `mastered` branch
2. **Backend:** Self-hosted Docker containers on cloud server
3. **Toggles in Production:**
   - `DEV_MODE` should always be `false`
   - `UNDER_CONSTRUCTION` can be `true` or `false` based on launch status

## Git Workflow (Three Branches)

### Branch Purpose
- **`main`**: General development branch for ongoing work. (Note: Production deployments are from `mastered` branch)
- **`backups`**: Backup of important versions
- **`beta`**: Testing branch, can be deployed to staging environment
- **`mastered`**: Production-ready code deployed to Vercel
- **Local `backups/` folder:** For version preservation of local files.
- **Local `beta/` folder:** For local testing environment files.
- **Local `mastered/` folder:** For local production-ready files.

### Development Process
1. **Feature Development:** Create feature branches from `main`
2. **Testing:** Merge to `beta` for team testing
3. **Production:** Merge to `mastered` when ready for production

### Toggle Settings for Each Branch
- **`mastered` branch:** `DEV_MODE = false`, `UNDER_CONSTRUCTION` based on launch status
- **`beta` branch:** `DEV_MODE = false` (to test auth flows), `UNDER_CONSTRUCTION` as needed
- **Feature branches:** Usually same as `beta` or `main` depending on purpose

## Common Confusion Points & Solutions

### 1. Docker vs Development Server
- **Docker** runs built production version of the app
- **Development server** runs live source code with hot reloading
- **Never run both simultaneously** - Docker on port 3000 will block development server
- **To develop:** Stop Docker containers, use development server
- **To test production build:** Use Docker containers

### 2. Toggle Combinations
| DEV_MODE | UNDER_CONSTRUCTION | Result |
|----------|-------------------|---------|
| `true` | `any` | Bypass all auth, show app directly |
| `false` | `true` | Redirect `/` to `/password`, require login |
| `false` | `false` | Normal auth flow (Supabase login) |

### 3. Testing the Under Construction Page
1. Set `DEV_MODE = false` to disable bypass
2. Set `UNDER_CONSTRUCTION = true` to enable redirect
3. Clear browser cache/sessionStorage
4. Visit `/` to see the password page
5. Use password `katewife` to access the app

### 4. Backend Services Requirements
- **Frontend only:** For UI development, Vercel serves static files
- **Full stack development:** Need Docker containers for API, n8n, ChromaDB, Redis
- **Database access:** Always goes through Supabase Cloud
- **API calls:** Frontend → Backend API (via environment variables)

## Environment Variables

### Frontend Environment Variables
```
# In .env or Vercel environment
VITE_API_URL=https://your-backend-domain.com/api  # Backend API endpoint
VITE_SUPABASE_URL=your_supabase_url              # Supabase endpoint
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key   # Supabase key
```

### Branch-Specific Settings
- **Development:** Use local backend (http://localhost:3002) 
- **Production:** Use deployed backend (https://api.yourdomain.com)
- **Beta/Staging:** Use staging backend (https://staging-api.yourdomain.com)

## Troubleshooting Common Issues

### Issue: Changes not showing in browser
- **Cause:** Docker container running on port 3000
- **Solution:** Stop Docker container and restart dev server

### Issue: Still seeing old version after code changes  
- **Cause:** Browser cache or development server not restarting
- **Solution:** Clear browser cache and restart development server

### Issue: Can't access password page when UNDER_CONSTRUCTION = true
- **Cause:** DEV_MODE = true (bypassing all auth)
- **Solution:** Set DEV_MODE = false

### Issue: API calls failing in development
- **Cause:** Backend services not running
- **Solution:** Start Docker containers with `docker-compose up`

## Quick Setup Commands

### For UI Development Only
```bash
# Stop any conflicting containers
docker stop crm-frontend-1

# Start development server  
npm run dev:vite
```

### For Full Stack Development
```bash
# Start backend services
docker-compose up

# Stop any frontend containers
docker stop crm-frontend-1

# Start development server
npm run dev:vite
```

### For Testing Production Build
```bash
# Build the frontend
npm run build

# Stop conflicting containers and run Docker
docker stop crm-frontend-1
docker-compose up
```