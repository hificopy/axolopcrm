# Deployment Architecture for Axolop CRM

## Overview
This document outlines the deployment architecture for Axolop CRM combining Vercel for frontend, Supabase for database/auth, and Docker for backend services.

## Architecture Components

### Frontend (Client Side)
- **Hosting**: Vercel 
- **Source**: `main` branch in Git repository
- **Deployment**: Automatic when commits are pushed to main branch
- **Function**: React frontend application, user interface

### Database & Authentication
- **Service**: Supabase Cloud
- **Function**: PostgreSQL database, user authentication
- **Management**: Via Supabase dashboard
- **Connection**: Frontend connects to Supabase via API

### Backend Services (Server Side)
- **Hosting**: Cloud VPS (DigitalOcean, AWS, GCP, etc.) or dedicated server
- **Services**:
  - Express.js API server
  - n8n automation platform
  - ChromaDB for AI/ML vector storage
  - Redis for caching
- **Management**: Docker Compose orchestration
- **Alternative**: Raspberry Pi or home server with proper networking (not recommended for production)

## Git Workflow

### Branches
- `main`: Production-ready code, automatically deployed to Vercel
- `beta`: Testing and staging environment
- `backup`: Backup branch for version preservation

### Development Process
1. Develop features on feature branches
2. Test locally using development servers
3. Merge to `beta` for team testing
4. Deploy to `main` when ready for production

## Deployment Process

### Frontend (Vercel)
1. Push changes to `main` branch
2. Vercel automatically builds and deploys the React application
3. Frontend connects to backend via configured API endpoints

### Backend (Docker)
1. Backend changes pushed to `main` branch
2. Docker images built and deployed to cloud VPS or dedicated server
3. Docker Compose manages all backend services

## Local Development

### Starting Development Environment
1. Frontend: `npm run dev:vite` (for React development server)
2. Backend services: `docker-compose up` (for API, n8n, ChromaDB, Redis)

### Production Deployment
1. Merge to `main` branch triggers Vercel deployment
2. Backend Docker services must be manually updated on cloud VPS/dedicated server

## Service Communication

### Architecture Flow
```
Vercel Frontend → Supabase (DB/Auth) → Cloud/Dedicated Server Backend Services (Docker)
```

### API Endpoints
- Frontend → Backend: API calls to backend service URL
- Backend → Supabase: Direct database connections
- Backend → ChromaDB/n8n: Local Docker service calls

## Infrastructure Summary

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend | Vercel | Static hosting for React app |
| Database | Supabase Cloud | PostgreSQL database and Auth |
| Backend API | Self-hosted Docker | Express.js API server |
| Automation | Self-hosted Docker | n8n workflow automation |
| AI/ML | Self-hosted Docker | ChromaDB vector database |
| Caching | Self-hosted Docker | Redis |