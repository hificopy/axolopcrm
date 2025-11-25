# Deployment Troubleshooting for Axolop CRM

## Overview
This document provides troubleshooting steps for common deployment issues with the Axolop CRM system, which uses Vercel for frontend and Docker for backend services.

## Frontend Deployment Issues (Vercel)

### 1. Build Failures on Vercel
**Problem:** Vercel deployment fails during build process
```
Error: Build failed with 12 errors
```

**Solution:**
```bash
# 1. Check local build
npm run build

# 2. Verify environment variables in Vercel dashboard
# - VITE_API_URL
# - VITE_SUPABASE_URL  
# - VITE_SUPABASE_ANON_KEY

# 3. Clear Vercel build cache if needed
# In Vercel dashboard → Settings → Clear cache
```

### 2. Environment Variables Not Loading
**Problem:** Frontend can't connect to backend API
```
Failed to load resource: the server responded with a status of 400
```

**Solution:**
1. Verify environment variables are set in Vercel project settings
2. Ensure variables have `VITE_` prefix to be available to frontend
3. Check that API endpoints are correct

## Backend Deployment Issues (Docker)

### 1. Port Conflicts
**Problem:** "port is already allocated" error
```
Error: Bind for 0.0.0.0:3001 failed: port is already allocated
```

**Solution:**
```bash
# Check what's using the port
lsof -ti:3002

# Kill process using the port
kill -9 $(lsof -ti:3002)

# Or stop Docker containers that may be using the port
docker-compose down
```

### 2. Database Connection Issues
**Problem:** Cannot connect to Supabase database
```
error: connection error: failed to lookup address information
```

**Solution:**
```bash
# 1. Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 2. Test connection manually
docker-compose exec crm-backend env | grep SUPABASE

# 3. Check that Supabase project is active
# Visit: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### 3. Redis Connection Issues
**Problem:** Redis cache not accessible
```
Redis connection error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# Check Redis container status
docker-compose ps | grep redis

# Restart Redis container
docker-compose restart crm-redis

# Test connection
docker-compose exec crm-redis redis-cli ping
```

### 4. Backend Service Not Starting
**Problem:** API server fails to start
```
npm run dev:backend
# Server exits with error
```

**Solution:**
```bash
# 1. Check logs 
docker-compose logs crm-backend

# 2. Verify all required environment variables
# SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Check package dependencies
npm install
```

## Docker-Specific Issues

### 1. Container Won't Start
**Problem:** Docker container exits immediately
```
CONTAINER ID   IMAGE          COMMAND       CREATED        STATUS                      PORTS
abc123def456   crm-backend    "npm run..."  5 seconds ago  Exited (1) 3 seconds ago
```

**Solution:**
```bash
# Check detailed logs
docker-compose logs crm-backend --tail 50

# Verify Dockerfile build
docker build -t crm-backend .

# Check docker-compose.yml configuration
docker-compose config
```

### 2. Docker Build Failures
**Problem:** Docker image build fails
```
ERROR [internal] load metadata for docker.io/library/node:20-alpine
```

**Solution:**
```bash
# 1. Check Docker daemon status
docker info

# 2. Clear Docker build cache
docker builder prune

# 3. Try building with no cache
docker build --no-cache -t crm-backend .
```

## Health Checks

### Backend Health
```bash
# Check if backend is running
curl http://localhost:3002/health
curl http://localhost:3002/api/health

# Check all services
docker-compose ps
```

### Frontend Health
```bash
# Vercel deployment status
# Check in Vercel dashboard
# Or test deployed URL
curl https://your-project-name.vercel.app
```

## Checklist for Deployment

### Before Deploying to Production
- [ ] Environment variables set correctly in Vercel
- [ ] Supabase project configured and accessible
- [ ] Backend services tested locally
- [ ] Port 3001 available for backend API
- [ ] Redis container operational
- [ ] ChromaDB container operational
- [ ] All tests passing

### After Deployment
- [ ] Frontend loads at Vercel URL
- [ ] API endpoint responding at backend URL
- [ ] Database connection working
- [ ] Authentication flow functional
- [ ] All features working as expected

## Emergency Procedures

### Rollback Process
1. **Frontend:** In Vercel dashboard, go to deployments → select previous successful deployment → promote to production
2. **Backend:** Use previous Docker image tag or rebuild from previous commit

### Under Construction Mode
If emergency maintenance is needed:
1. Set `UNDER_CONSTRUCTION = true` in `/frontend/App.jsx`
2. This redirects all users from `/` to `/password` page
3. Use password "katewife" to access the app
4. Set back to `false` when maintenance is complete

## Common Misconfigurations

### 1. Mixed Environment Variables
**Issue:** Using local dev variables in production
**Solution:** Maintain separate .env files for each environment

### 2. CORS Issues
**Issue:** Cross-origin requests blocked
**Solution:** Configure CORS in backend to allow Vercel domain

### 3. Authentication Mismatches
**Issue:** Auth0/Supabase configuration differences
**Solution:** Ensure consistent configuration across environments

## Contact Support
If issues persist:
- Check logs in Docker and Vercel dashboards
- Verify all configurations match documentation
- Contact juan@axolop.com with specific error messages