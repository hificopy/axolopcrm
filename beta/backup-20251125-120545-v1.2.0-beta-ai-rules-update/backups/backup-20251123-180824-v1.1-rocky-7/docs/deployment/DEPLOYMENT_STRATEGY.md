# Axolop CRM Deployment Strategy v1.0

## Architecture Overview

### Frontend-Backend Split Architecture
- **Frontend**: Hosted on Vercel (https://axolop.com)
- **Backend**: Self-hosted on personal server via Docker (http://axolop.hopto.org:3002)
- **Communication**: Vercel proxies API requests to self-hosted backend

### Backend Infrastructure
- **OS**: macOS (hosting server)
- **Dynamic DNS**: axolop.hopto.org (No-IP service)
- **Router**: TP-Link AXE with port forwarding
- **Ports**:
  - Backend API: Port 3002 (internal and external)
  - ChromaDB: Port 8001
- **Services**:
  - Backend Node.js/Express API
  - Redis (caching and queues)
  - ChromaDB (AI/ML vector database)
  - Supabase Cloud (PostgreSQL database)

## Deployment Process

### Step 1: Dynamic DNS and Routing Setup
1. **No-IP Account**: Create account at noip.com
2. **Subdomain**: Set up axolop.hopto.org subdomain
3. **Router Configuration**: Configure TP-Link AXE router
   - Navigate to Advanced → Dynamic DNS
   - Select No-IP service
   - Enter credentials and subdomain
4. **Port Forwarding**: Configure port forwarding on router
   - External Port: 3002
   - Internal Port: 3002
   - IP Address: 192.168.0.204 (backend server)

### Step 2: Backend Docker Configuration
1. **Docker Services**:
   - backend: Node.js API server on port 3002
   - redis: Redis caching service
   - chromadb: ChromaDB vector database
2. **Environment Variables**: Properly configured for production
   - DATABASE_URL: Supabase connection
   - FRONTEND_URL: https://axolop.com (for CORS)
   - All other production environment variables

### Step 3: Vercel Configuration
1. **vercel.json**: API requests proxy to backend
   - `/api/(.*)` → `http://axolop.hopto.org:3002/api/$1`
   - `/health` → `http://axolop.hopto.org:3002/health`
2. **Environment Variables**: Set in Vercel dashboard
   - VITE_API_URL: http://axolop.hopto.org:3002/api/v1
   - VITE_SUPABASE_URL: Your Supabase URL
   - VITE_SUPABASE_ANON_KEY: Your Supabase anon key

## Git Branch Strategy (CRITICAL)

### Branch Hierarchy
- **`main`**: Development branch for ongoing work
- **`beta`**: Testing environment (deploy from here first)
- **`mastered`**: Production-ready code deployed to Vercel (LIVE)
- **Local Folders**: 
  - `backups/`: For version preservation
  - `beta/`: For local testing environment files
  - `mastered/`: For local production-ready files

### Deployment Flow (MANDATORY)
1. **Development**: Work on `main` branch
2. **Testing**: Deploy to `beta` branch
3. **Production**: Only after thorough testing, deploy to `mastered`
4. **NEVER** deploy directly to `mastered` without beta testing

## Release Management Process

### Pre-Release Requirements (MANDATORY)
1. **Backup Creation** (AI Assisted)
   - Create backup in `../mastered/` folder: `backup-YYYYMMDD-HHMMSS-description`
   - Document changes and version number

2. **Version Management** (Human Controlled)
   - Version format: V.X.Y (e.g., V1.0, V1.1, V1.2)
   - Next version is always one point above last release
   - Update package.json version appropriately

3. **Feature Documentation** (AI Assisted)
   - Generate changelog from last version
   - Document new features and changes
   - Create release notes

### Release Execution (HUMAN ONLY)
1. **Final Testing**: Manual testing on beta branch
2. **Developer Verification**: Juan manually tests all features
3. **Manual Push**: Only Juan performs `git push` to `mastered`
4. **Vercel Deployment**: Manual deployment to production (by Juan)

### AI Role in Deployment (LIMITED)
- **AI CAN**: Create backups, generate documentation, prepare release notes
- **AI CANNOT**: Commit to GitHub, push to Vercel, or make production releases
- **AI MUST**: Remind about backup process and documentation requirements

## Backup & Maintenance Rules

### Mandatory Backup Requirements
**CRITICAL: Before ANY commit to ANY branch OR deployment to GitHub:**
1. **ALWAYS create a local backup** in the appropriate folder:
   - Commits to `mastered` branch → backup to `../mastered/` folder
   - Commits to `beta` branch → backup to `../beta/` folder
   - Commits to `backup` branch → backup to `../backups/` folder
   - Commits to `main` or any other branch → backup to `../backups/` folder

2. **Backup naming convention:** `backup-YYYYMMDD-HHMMSS-description`
   - Example: `backup-20251119-235959-V1.0-release`
   - Description should be brief but clear about what changed

3. **What to include in backup:**
   - All project files EXCEPT: `.git`, `node_modules`, `dist`, `build`, `GEMINI.md`, `CLAUDE.md`, `QWEN.md`
   - Use rsync or similar tool to preserve file structure
   - Command template: `rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='GEMINI.md' --exclude='CLAUDE.md' --exclude='QWEN.md' . ../[folder]/backup-[timestamp]-[description]/`

### Backup Process
1. **Before any commit or deployment:** Create a backup in the appropriate local folder as specified above.
2. **Document the change:** Record what was changed and why, including a version label in the format `V.X.Y` (e.g., `V.1.0`, `V.1.1-beta`). For beta versions, clearly state what is different from the last stable version.
3. **Version the backup:** Include the date, time, and descriptive label in the backup's folder name.
4. **Push backup to GitHub:** Under the `backup` branch for safekeeping, ensuring the commit message reflects the version and changes.
5. **Test the backup:** Ensure the system works as expected after restoration.

## Emergency Maintenance

- **UNDER_CONSTRUCTION Mode:** Manual toggle for emergency maintenance
- **Purpose:** Show login page when site is under maintenance
- **Access:** Developer admin access through Supabase account
- **Password:** Currently "katewife" (change as needed)
- **Usage:** Only for emergency maintenance or before major launches

## Version Control & Release Notes

### Versioning Strategy
- **Major Releases**: V1.0, V2.0 - Complete feature sets
- **Minor Releases**: V1.1, V1.2 - Feature additions
- **Patch Releases**: V1.1.1, V1.1.2 - Bug fixes only

### Release Process Summary
1. **AI Assists With**: Backup creation, documentation preparation, changelog generation
2. **Human Controls**: All git pushes to `mastered`, all Vercel deployments
3. **AI Never Does**: Commit to GitHub, push to production, make live releases
4. **Human Always Does**: Final verification, production deployment

This ensures that all critical infrastructure and deployment process documentation is complete and accurate, while maintaining clear boundaries between AI-assisted preparation and human-controlled releases.