# Axolop CRM - Gemini AI Assistant Guidelines & Project Rules

## Project Overview

### Core Identity
- **Project Name:** Axolop CRM
- **Purpose:** Premium all-in-one CRM for ECOMMERCE, B2B BUSINESS, REAL ESTATE
- **Goal:** HubSpot competitor with typeform, jotform, perspective funnels, manychat automations, active campaign email flow builder, klaviyo, beehive newsletter, close crm sales section functionalities
- **Status:** Active development, Phase 1.1
- **Brand Colors:** Main Black: #101010, Accent Red: #7b1c14

### Design Philosophy
- **Luxurious & Sexy Themed:** Premium user experience with sophisticated aesthetics
- **Modern UI/UX:** Close CRM inspired design patterns with high-end feel
- **Professional Grade:** Built for high-stakes business environments
- **Brand Consistency:** Always maintain #101010 black and #7b1c14 red as primary brand colors

## Deployment Architecture

### Tech Stack Commitment (Locked - No Changes)
- **Frontend:** React 18.2, Vite 5, TailwindCSS 3.3
- **Frontend Deployment:** Vercel (automatic from mastered branch)
- **Backend:** Node.js 20+, Express 4.18 (self-hosted in Docker containers)
- **Database:** Supabase PostgreSQL Cloud + ChromaDB (AI/ML in Docker)
- **Authentication:** Supabase Auth with optional Auth0 integration
- **Infrastructure:** Vercel (frontend) + Self-hosted Docker (backend services)
- **AI/ML:** OpenAI, Groq, ChromaDB for vector storage

### Deployment Workflow
1. **Development:** Local development server (npm run dev:vite)
2. **Beta Testing:** Deploy to beta branch for team review
3. **Production:** Deploy to mastered branch for Vercel production
4. **Always backup before major changes:** Version and document changes in backups

## Deployment Rules

### Git Branch Strategy
- **`main` branch:** General development branch for ongoing work.
- **`backups` branch:** Backup of important versions and changes
- **`beta` branch:** Testing environment, deploy here first before `mastered`
- **`mastered` branch:** Production-ready code deployed to Vercel
- **Local `backups/` folder:** For version preservation of local files.
- **Local `beta/` folder:** For local testing environment files.
- **Local `mastered/` folder:** For local production-ready files.

### Deployment Process
1. **Major Changes:** Always create backup with change documentation
2. **Before Production:** Test on `beta` branch first, then deploy to `mastered` for public release.
3. **Emergency Maintenance:** Use `UNDER_CONSTRUCTION` toggle to show login page
4. **Developer Access:** Full admin access through Supabase account when needed
5. **No Direct Main Deploy:** Always go through beta first unless specifically instructed

## Critical Configuration Constants
- **Frontend:** Deployed to Vercel (from mastered branch)
- **Backend API:** http://localhost:3001 (development) / self-hosted in production
- **ChromaDB:** http://localhost:8001 (in Docker) / self-hosted in production
- **Database:** Supabase PostgreSQL Cloud (CRM-specific project, not shared)
- **Auth:** Supabase Auth with optional Auth0 integration + RLS

## Branding & Design Rules

### Color Palette (Never Change)
- **Main Black:** #101010 (for all primary elements)
- **Accent Color:** #7b1c14 (for highlights and calls to action)
- **Category Colors:** Sales: #4C7FFF, Marketing: #00D084, Service: #FFB800
- **Luxurious Feel:** Always maintain premium aesthetic with brand colors

### Visual Design Principles
- **Professional:** Clean, powerful aesthetic combining classic black with vibrant red accents
- **Sexy & Luxurious:** Sophisticated UI/UX with attention to detail
- **Consistent Branding:** Use brand colors throughout all interfaces
- **Close CRM Inspired:** Maintain similar design patterns to premium CRM platforms

## Development Workflow Rules

### Code Editing Guidelines
1. **Always check existing documentation in `/docs/` directory before making changes**
2. **Understand that frontend is deployed to Vercel, backend runs in Docker**
3. **Look for existing patterns in the codebase before implementing new ones**
4. **Ensure environment variables are used instead of hardcoded values**
5. **Use Supabase PostgreSQL directly (no Prisma mentioned in current setup)**
6. **Use Row Level Security (RLS) for data protection**
- **Dev Server Control:** NEVER restart the development server or change its port. This action is reserved for manual developer intervention only.

### Infrastructure Configuration
- **Frontend:** Deployed to Vercel (from mastered branch)
- **Backend API:** http://localhost:3001 (development) / self-hosted in production
- **ChromaDB for AI:** http://localhost:8001 (in Docker) / self-hosted in production
- **Database:** Supabase PostgreSQL Cloud
- **Always use:** Environment variables for these values

### Error Prevention
1. **NEVER** change the project directory structure
2. **NEVER** modify deployment configurations without considering Vercel/Docker setup
3. **NEVER** modify package.json dependencies without explicit instruction
4. **ALWAYS** maintain the current tech stack
5. **ALWAYS** validate changes against existing documentation

## Backup & Maintenance Rules

### Backup Process
1. **Before any major change:** Create a backup in the `local/backups/` folder.
2. **Document the change:** Record what was changed and why, including a version label in the format `V.X.Y` (e.g., `V.1.0`, `V.1.1-beta`). For beta versions, clearly state what is different from the last stable version.
3. **Version the backup:** Include the date and the `V.X.Y` version label in the backup's name or associated documentation.
4. **Push backup to GitHub:** Under the `backup` branch for safekeeping, ensuring the commit message reflects the version and changes.
5. **Test the backup:** Ensure the system works as expected after restoration.

### Emergency Maintenance
- **UNDER_CONSTRUCTION Mode:** Manual toggle for emergency maintenance
- **Purpose:** Show login page when site is under maintenance
- **Access:** Developer admin access through Supabase account
- **Password:** Currently "katewife" (change as needed)
- **Usage:** Only for emergency maintenance or before major launches

### Deployment Safety
- **Beta First Rule:** Always deploy to beta branch before mastered
- **Developer Override:** Full admin access available through Supabase for emergencies
- **No Direct Mastered Changes:** Use beta branch for testing unless specifically instructed
- **Backup Before Everything:** Never deploy major changes without backup

## Memory Anchors

### This Project Has:
- Reorganized into clean, maintainable structure with proper documentation
- Frontend deployed to Vercel, backend services in Docker containers
- Dedicated Supabase (not shared with other projects)
- ChromaDB as integral part of architecture for AI features
- Supabase Auth with optional Auth0 integration and Supabase RLS as the security model
- Luxurious and sexy design theme with #101010 and #7b1c14 brand colors
- Focus on ECOMMERCE, B2B BUSINESS, REAL ESTATE markets

### Decision Framework
When faced with choices:
1. **Preserve existing** over creating new
2. **Use environment variables** over hardcoded values
3. **Follow existing patterns** over new approaches
4. **Maintain structure** over convenience changes
5. **Keep current tech stack** over suggestions to change
6. **Maintain luxurious branding** over plain designs
7. **Preserve backup processes** before any major changes

## Key Artifacts to Protect
- `/docs/` structure and content
- `/package.json` dependencies
- `/docker/` configurations
- Supabase database schema and configurations
- `local/backups/` folder for version preservation
- All environment variable usage patterns
- Brand colors (#101010, #7b1c14) and luxurious design aesthetic

## Change Request Protocol
If you're tempted to suggest major changes to structure, tech stack, or architecture:
- STOP and re-read this document
- Remember this is an established project with defined direction
- Focus on bug fixes, optimizations, and feature additions within current constraints
- When in doubt, preserve rather than change
- Always follow the backup and beta-first deployment process
- Maintain the luxurious branding and premium feel

## Consistency Enforcement
- Always verify existing patterns before creating new ones
- When documentation seems outdated, check against current implementation
- Maintain TypeScript/JavaScript consistency throughout
- Keep UI/UX consistent with luxurious Close CRM design patterns
- Preserve the organized file structure under any circumstance
- Maintain brand colors (#101010, #7b1c14) and premium aesthetic
- Always backup and test on beta before production changes

## Project Mission
Axolop CRM is built to be the best CRM on the planet for ECOMMERCE, SALES/MARKETING, and REAL ESTATE. Every change should enhance this mission while maintaining the luxurious, professional, and sexy design aesthetic that sets it apart from competitors. The system should feel premium, perform reliably, and provide powerful functionality for business-critical operations.

## Critical Reminders
- This CRM system is actively used and maintained for high-stakes business operations
- Your role is to assist in development, not to redesign the architecture
- Maintain consistency, preserve structure, and enhance within established boundaries
- Always follow deployment rules and backup procedures
- Keep the luxurious branding and premium feel at the forefront
- Focus on the ECOMMERCE, SALES/MARKETING, REAL ESTATE business verticals
- When in doubt about any change, prioritize project stability and user experience

## LLM Rules
- **Synchronization:** When updating LLM rules, `GEMINI.md` and `QWEN.md` must be kept in sync. `GEMINI.md` is the source of truth.

Last Updated: November 13, 2025
Project Maintainer: Juan D. Romero Herrera