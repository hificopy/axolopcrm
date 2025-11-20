# Axolop CRM - Claude AI Assistant Guidelines & Project Rules

## Project Overview

### Core Identity
- **Project Name:** Axolop CRM
- **Purpose:** Premium all-in-one business management platform that REPLACES Slack, Monday.com, Typeform, Miro, Notion, and traditional CRM systems for ANY INDUSTRY
- **Core Value Proposition:** One unified platform for communication, project management, forms, knowledge management, visual collaboration, and customer relationship management
- **Target:** Universal solution for businesses of all sizes and industries (Ecommerce, B2B, Real Estate, Insurance, SaaS, Agencies, and more)
- **Replaces:**
  - **Slack** → Built-in team communication and chat
  - **Monday.com** → Project management, workflows, and automation
  - **Typeform/Jotform** → Advanced form builder with AI lead scoring
  - **Miro** → Visual collaboration, whiteboarding, and mind mapping
  - **Notion/Roam/Obsidian** → Second brain knowledge management and note-taking
  - **HubSpot/Salesforce** → CRM with sales, marketing, and service tools
  - **Close CRM** → Premium sales dialer and call management
  - **Klaviyo** → Email marketing and automation
  - **ActiveCampaign** → Marketing automation workflows
- **Status:** Active development with Live Calls feature complete
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
- **Backend API:** http://localhost:3002 (development) / http://axolop.hopto.org:3002 (production via dynamic DNS)
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
- **Backend API:** http://localhost:3002 (development) / http://axolop.hopto.org:3002 (production via dynamic DNS)
- **ChromaDB for AI:** http://localhost:8001 (in Docker) / http://axolop.hopto.org:8001 (production via dynamic DNS)
- **Database:** Supabase PostgreSQL Cloud
- **Always use:** Environment variables for these values

### Error Prevention
1. **NEVER** change the project directory structure
2. **NEVER** modify deployment configurations without considering Vercel/Docker setup
3. **NEVER** modify package.json dependencies without explicit instruction
4. **ALWAYS** maintain the current tech stack
5. **ALWAYS** validate changes against existing documentation

## Backup & Maintenance Rules

### Mandatory Backup Requirements
**CRITICAL: Before ANY commit to ANY branch OR deployment to GitHub:**
1. **ALWAYS create a local backup** in the appropriate folder:
   - Commits to `mastered` branch → backup to `../mastered/` folder
   - Commits to `beta` branch → backup to `../beta/` folder
   - Commits to `backup` branch → backup to `../backups/` folder
   - Commits to `main` or any other branch → backup to `../backups/` folder

2. **Backup naming convention:** `backup-YYYYMMDD-HHMMSS-description`
   - Example: `backup-20251116-140545-update-llm-rules`
   - Description should be brief but clear about what changed

3. **What to include in backup:**
   - All project files EXCEPT: `.git`, `node_modules`, `dist`, `build`
   - Use rsync or similar tool to preserve file structure
   - Command template: `rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='build' . ../[folder]/backup-[timestamp]-[description]/`

### Backup Process
1. **Before any commit or deployment:** Create a backup in the appropriate local folder as specified above.
2. **Document the change:** Record what was changed and why, including a version label in the format `V.X.Y` (e.g., `V.1.0`, `V.1.1-beta`). For beta versions, clearly state what is different from the last stable version.
3. **Version the backup:** Include the date, time, and descriptive label in the backup's folder name.
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

## Key Features Implemented

### Communication & Collaboration
- **Team Chat** - Slack-style messaging and collaboration (in development)
- **Live Calls** - Professional call dialer with AI assistance (✅ COMPLETE)
  - Full-featured WebRTC/Twilio integration
  - AI-powered call transcription and analysis
  - Real-time sales coaching
  - Call recording and playback
  - Smart call queue management
  - Sales script templates
  - Voicemail drops
  - Call analytics and performance tracking

### Project Management
- **Workflows** - Visual automation builder (Active Campaign style)
- **Tasks & Activities** - Track all customer interactions
- **Calendar Integration** - Google Calendar sync with booking links
- **Pipeline Management** - Visual deal stages and tracking

### Forms & Lead Generation
- **Form Builder** - Drag-and-drop form creator (Typeform/Jotform replacement)
- **AI Lead Scoring** - Automatic qualification based on responses
- **Form Analytics** - Detailed conversion tracking
- **Multi-step Forms** - Conditional logic and branching

### CRM Core
- **Leads Management** - Complete lead lifecycle tracking
- **Contacts** - Unlimited contact management
- **Deals/Opportunities** - Sales pipeline management
- **Important Dates** - Birthday tracking, policy renewals, follow-ups

### Marketing Automation
- **Email Campaigns** - SendGrid integration for bulk email
- **Email Sequences** - Automated drip campaigns
- **Workflow Automation** - Trigger-based actions
- **Analytics** - Campaign performance tracking

### Sales Tools
- **Call Queue** - Prioritized calling campaigns
- **Sales Scripts** - Dynamic template system
- **Lead Scoring** - AI-powered qualification
- **Performance Metrics** - Individual and team analytics

### Service & Support
- **Ticketing System** - Customer support management (in development)
- **Knowledge Base** - Self-service documentation
- **Customer Portal** - Client access to their data

### Knowledge Management & Collaboration (Miro + Notion Replacement)
- **Second Brain System** - Personal and team knowledge management (planned)
  - Hierarchical note organization
  - Bi-directional linking
  - Rich text editor with markdown support
  - AI-powered search and suggestions
  - Templates and databases
- **Visual Collaboration** - Whiteboarding and mind mapping (planned)
  - Infinite canvas for brainstorming
  - Real-time collaboration
  - Visual workflow mapping
  - Diagramming tools
  - Integration with CRM data

## Memory Anchors

### This Project Has:
- Reorganized into clean, maintainable structure with proper documentation
- Frontend deployed to Vercel, backend services in Docker containers
- Dedicated Supabase (not shared with other projects)
- ChromaDB as integral part of architecture for AI features
- Supabase Auth with optional Auth0 integration and Supabase RLS as the security model
- Luxurious and sexy design theme with #101010 and #7b1c14 brand colors
- Universal platform for ANY INDUSTRY (replaces Slack + Monday + Typeform + CRM)
- Complete Live Calls feature with AI-powered sales assistance
- Comprehensive API with validation and error handling
- Twilio webhook integration for real-time call management
- Advanced form builder with lead scoring and analytics
- Email marketing with SendGrid integration
- Workflow automation engine for complex business processes
- Content Calendar functionality is currently locked and will be unlocked in v1.5

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
Axolop CRM is built to be the ultimate all-in-one business management platform that REPLACES multiple expensive SaaS tools (Slack, Monday, Typeform, Miro, Notion, HubSpot, Close CRM, and more) for businesses across ALL INDUSTRIES. Every change should enhance this mission while maintaining the luxurious, professional, and sexy design aesthetic that sets it apart from competitors. The system should:
- Feel premium and luxurious at every touchpoint
- Perform reliably for business-critical operations
- Provide powerful functionality that replaces 5-10+ separate tools
- Work seamlessly across sales, marketing, service, project management, and collaboration
- Scale from solopreneurs to enterprise teams
- Deliver exceptional value by consolidating tool costs into one platform

## Critical Reminders
- This CRM system is actively used and maintained for high-stakes business operations
- Your role is to assist in development, not to redesign the architecture
- Maintain consistency, preserve structure, and enhance within established boundaries
- Always follow deployment rules and backup procedures
- Keep the luxurious branding and premium feel at the forefront
- Focus on the ECOMMERCE, SALES/MARKETING, REAL ESTATE business verticals
- When in doubt about any change, prioritize project stability and user experience

## LLM Rules
- **Synchronization:** When updating LLM rules, `GEMINI.md`, `QWEN.md`, and `CLAUDE.md` must be kept in sync. `GEMINI.md` is the source of truth.
- **Critical Sections to Sync:** Always ensure these sections are identical across all three files:
  - Mandatory Backup Requirements
  - Backup Process
  - Git Branch Strategy
  - Deployment Process
  - All deployment and version control rules

### Critical Port Configuration Instructions
- **NEVER CHANGE PORTS:** Under no circumstances should any AI model change localhost ports for frontend or backend applications
- **Manual Port Control:** All port changes must be manually controlled by the developer
- **Current Configuration:** Backend runs on port 3002, frontend on port 3000
- **Production Backend:** Available at http://axolop.hopto.org:3002 via dynamic DNS
- **Documentation:** All references to ports 3001 have been updated to 3002

### Critical Deployment Instructions
- **NEVER PUSH TO PRODUCTION:** Under no circumstances should any AI model commit changes to the `mastered` branch or deploy to Vercel
- **Human Controlled Releases:** Only the developer (Juan) performs git pushes to production and Vercel deployments
- **AI Role in Deployment:** AI may create backups and prepare documentation, but cannot make production changes
- **Backup Required:** Before any release, AI must create proper backups in the appropriate local folders
- **Version Management:** AI may assist with version documentation but deployment execution is human-only

## Sentry Error Tracking Rules
These examples should be used as guidance when configuring Sentry functionality within a project.

### Error / Exception Tracking

Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry.
Use this in try catch blocks or areas where exceptions are expected

### Tracing Examples

Spans should be created for meaningful actions within an applications like button clicks, API calls, and function calls
Ensure you are creating custom spans with meaningful names and operations
Use the `Sentry.startSpan` function to create a span
Child spans can exist within a parent span

#### Custom Span instrumentation in component actions

```javascript
function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        doSomething();
      },
    );
  };

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  );
}
```

#### Custom span instrumentation in API calls

```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
  );
}
```

### Logs

Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/react"`
Enable logging in Sentry using `Sentry.init({ enableLogs: true })`
Reference the logger using `const { logger } = Sentry`
Sentry offers a consoleLoggingIntegration that can be used to log specific console error types automatically without instrumenting the individual logger calls

#### Configuration

##### Baseline

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://c64f5e2f4e25f2edd658d2321af73cac@o4510394694696960.ingest.us.sentry.io/4510394870136832",

  enableLogs: true,
});
```

##### Logger Integration

```javascript
Sentry.init({
  dsn: "https://c64f5e2f4e25f2edd658d2321af73cac@o4510394694696960.ingest.us.sentry.io/4510394870136832",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```

#### Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the structured logs.

```javascript
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```

Last Updated: November 19, 2025
Project Maintainer: Juan D. Romero Herrera
Version: 1.2.0 - Live Calls Feature Complete