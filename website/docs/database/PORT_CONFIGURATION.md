# Axolop CRM - Port Configuration

This document defines the dedicated port assignments for the Axolop CRM system to prevent conflicts and ensure consistent operation.

## Port Configuration

For the current architecture with Vercel frontend and Docker backend services:

### Frontend
- **Vercel deployment** - No fixed local port (deployed to Vercel from main branch)

### Backend Services (Development)

| Port | Service | Purpose | Status |
|------|---------|---------|---------|
| 3000 | frontend dev server | Vite development server | Active |
| 3001 | backend API (dev) | Main API server for development | Active |
| 4001 | backend API (Docker) | Main API server when running in Docker | Active |
| 6379 | Redis | Caching and queue management | Active |
| 8001 | ChromaDB | Vector database for AI features | Active |

### Backend Services (Production)
- Backend API: Self-hosted on cloud server (port varies)
- ChromaDB: Self-hosted on cloud server (port varies)
- Redis: Self-hosted on cloud server (port varies)

## Port Usage Guidelines

### Development Environment
1. **Frontend (Vite)**: Uses port 3000 for development
2. **Backend API (dev)**: Uses port 3001 for development server
3. **Backend API (Docker)**: Uses port 4001 when running in Docker container
4. **ChromaDB**: Uses port 8001 for AI/ML features
5. **Redis**: Uses port 6379 for caching

### Production Environment
1. **Frontend**: Served from Vercel (no local port)
2. **Backend**: Self-hosted on cloud infrastructure
3. **Database**: Supabase PostgreSQL Cloud (no local port)
4. **ChromaDB**: Self-hosted for AI features

## Common Issues

### Port Already in Use
```bash
# Check what's using a port
lsof -ti:3001  # For development backend
lsof -ti:4001  # For Docker backend

# Kill process using port
kill -9 $(lsof -ti:3001)  # For development backend
kill -9 $(lsof -ti:4001)  # For Docker backend
```

### Docker Port Conflicts
```bash
# List running Docker containers
docker ps

# Stop specific container
docker stop container_name

# Check Docker ports
docker port container_name
```

## Architecture Notes

1. **Frontend Deployment**: Vercel handles frontend hosting with no fixed local port
2. **Backend Services**: 
   - Development: Runs on port 3001
   - Docker: Runs on port 4001 to avoid conflicts with development server
3. **Database**: Supabase PostgreSQL Cloud (no local port usage)
4. **Direct Supabase Client**: No ORM used, direct connection to Supabase