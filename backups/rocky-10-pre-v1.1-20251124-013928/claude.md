# Claude Code Rules for Axolop CRM

## 🚨 CRITICAL RULES - READ FIRST

### 1. ALWAYS CREATE BACKUPS BEFORE BIG CHANGES
**MANDATORY**: Before making any significant code changes, you MUST create a timestamped backup:

```bash
# Create backup before major changes
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-$TIMESTAMP-[brief-description]"
mkdir -p backups/$BACKUP_NAME
cp -r frontend backend docs package.json backups/$BACKUP_NAME/
echo "Backup created: backups/$BACKUP_NAME"
```

**What qualifies as "big changes":**
- Modifying core architecture or infrastructure
- Changing authentication/authorization logic
- Updating database schema or migrations
- Refactoring major components (Sidebar, Layout, Auth flow)
- Upgrading dependencies that could break functionality
- Changing API routes or endpoints
- Modifying build configuration (vite.config.js, package.json)

**Existing backups location:** `/Users/jdromeroherrera/Desktop/CODE/axolopcrm/backups/`

### 2. NEVER CHANGE PORT CONFIGURATION
**ABSOLUTE RULE**: Port configuration is LOCKED and must NEVER be changed:

```
Frontend (Vite):  PORT 3000  (vite.config.js line 15)
Backend (API):    PORT 3002  (via env PORT or API_PORT, proxied from frontend)
Redis:            PORT 6379  (default)
ChromaDB:         PORT 8001  (optional)
```

**Files containing port config (DO NOT MODIFY PORTS):**
- `vite.config.js` - Frontend port and proxy config
- `backend/config/app.config.js` - Backend port configuration
- `.env` - Environment variable overrides

**If you see port conflicts or port-related issues:**
- DO NOT change the port numbers
- Instead, check if services are already running on those ports
- Ask the user before suggesting any port-related changes

### 3. SERVER ARCHITECTURE - CRITICAL
**ABSOLUTE RULE**: Understanding the server architecture is CRITICAL to avoid wasting time.

#### Development Server Setup
```
Frontend (Vite):   http://localhost:3000
   ↓ (proxies API calls via vite.config.js)
Backend (Docker):  http://localhost:3002 (Docker container: website-backend-1)
   ↓ (depends on)
Redis:             port 6379 (Docker container: website-redis-1)
ChromaDB:          port 8001 (Docker container: website-chromadb-1)
```

#### How Frontend Connects to Backend
- Frontend runs via `npm run dev` (starts Vite on port 3000)
- Vite proxies all `/api/*` requests to `http://localhost:3002` (see vite.config.js)
- Backend runs in Docker container, NOT as local Node process
- Docker Compose file: `docker-compose.yml`

#### CRITICAL: Backend Code Changes Require Docker Rebuild
**DO NOT start backend with `npm run` commands or `node index.js`** - it will conflict with Docker!

When you edit backend code, you MUST rebuild the Docker container:
```bash
# Step 1: Rebuild the backend image with updated code
docker-compose build backend

# Step 2: Restart the container
docker-compose up -d backend

# Step 3: Verify it's running
docker ps | grep backend
curl http://localhost:3002/health
```

#### Checking Container Status
```bash
# View running containers
docker ps

# Check backend logs
docker logs website-backend-1 -f

# Restart backend if needed
docker restart website-backend-1

# Full rebuild (if dependencies changed)
docker-compose build backend && docker-compose up -d backend
```

#### Common Mistakes to AVOID
❌ **DO NOT** run `cd backend && node index.js` - conflicts with Docker
❌ **DO NOT** run `npm run dev:backend` - backend is in Docker
❌ **DO NOT** assume code changes take effect immediately - rebuild Docker
❌ **DO NOT** try to start multiple backend servers

✅ **DO** rebuild Docker after backend code changes
✅ **DO** check Docker logs for backend errors
✅ **DO** verify health endpoint after changes

### 4. ALWAYS READ PROJECT DOCUMENTATION
Before making ANY changes, you MUST familiarize yourself with:

**Core Documentation:**
- `docs/README.md` - Main documentation index
- `docs/GETTING_STARTED.md` - Project overview and setup
- `docs/FEATURES_OVERVIEW.md` - Complete feature list
- `docs/architecture/TECH_STACK.md` - Technology stack details
- `docs/development/START_HERE.md` - Development workflow
- `V1.1_TODO_LIST.md` - Current roadmap and priorities

**When working on specific features, read:**
- Authentication: `docs/authentication/`
- Database: `docs/database/`
- API: `docs/api/`
- Deployment: `docs/deployment/`

---

## 📋 Project Overview

### What is Axolop CRM?

**Axolop CRM** is "The New Age CRM with Local AI Second Brain" - an all-in-one platform that replaces 10+ tools for agency owners.

**Replaces these tools:**
- GoHighLevel ($497/month) - CRM & automation
- Typeform/Jotform ($100/month) - Forms
- ClickUp/Asana ($50/month) - Project management
- Notion/Coda ($30/month) - Knowledge base
- Miro/Lucidchart ($50/month) - Visual planning
- iClosed/Calendly ($97/month) - Meeting scheduling
- ActiveCampaign ($500/month) - Email marketing
- Klaviyo, ManyChat, and more

**Value Proposition:** Save $1,375/month by using one platform instead of 10+ disconnected tools. Raise profit margins by 20%.

**Target Customer (ICP):** Agency owners with high OPEX juggling multiple tools

### Core Features

**CRM Features:**
- Lead & Contact Management with AI scoring
- Opportunity Pipeline with visual Kanban boards
- Activity Tracking (calls, emails, meetings)
- Dashboard & Analytics with customizable widgets

**Communication:**
- Live Calls (Sales Dialer) with AI transcription
- Email Integration (Gmail sync)
- Calendar & Scheduling (replaces Calendly)

**Marketing:**
- Email Campaigns with drag-and-drop builder
- Email Automation & sequences
- Form Builder (replaces Typeform)
- Workflow Automation (replaces Zapier)

**AI Features:**
- Local AI Second Brain (privacy-focused)
- AI Meeting Intelligence (call transcription & analysis)
- AI Lead Scoring
- RAG with ChromaDB for semantic search

**Coming Soon:**
- Second Brain (Notion replacement)
- Mind Maps (Miro replacement)
- Team Chat (Slack alternative)

---

## 🛠️ Tech Stack

**ALWAYS follow this stack** - do not introduce new technologies without explicit user approval.

### Frontend
```
Framework:      React 18 (functional components, hooks)
Build Tool:     Vite 5
Styling:        TailwindCSS 3
UI Components:  Radix UI, Lucide React icons
State:          Zustand, React Context
Routing:        React Router DOM v7
Forms:          React Hook Form + Zod validation
Tables:         TanStack React Table
Animation:      Framer Motion, GSAP
Email Builder:  React Email
Rich Text:      TipTap
Charts:         Recharts
DnD:            @dnd-kit, React Grid Layout
```

### Backend
```
Runtime:        Node.js (ES Modules)
Framework:      Express 4
Language:       JavaScript (not TypeScript)
Database:       PostgreSQL (via Supabase)
Cache:          Redis (ioredis)
Vector DB:      ChromaDB (optional, for AI features)
Auth:           Supabase Auth + JWT
Validation:     Zod
Logging:        Winston
Jobs:           Bull (Redis-based queues)
Cron:           node-cron
```

### Integrations & Services
```
Auth:           Supabase Auth, Google OAuth
Email:          SendGrid (campaigns), Nodemailer
Calls/SMS:      Twilio
AI:             OpenAI, Groq
Storage:        Supabase Storage
Analytics:      PostHog
Error Tracking: Sentry
Calendar:       Google Calendar API
Payment:        Stripe (planned for v1.1)
```

### DevOps & Tools
```
Package Mgr:    npm
Process Mgr:    PM2, nodemon (dev)
Linting:        ESLint
Formatting:     Prettier
Containerization: Docker (optional)
Deployment:     Vercel (frontend), Railway/Render (backend)
```

### File Structure
```
/frontend/          React application
/backend/           Express API server
  /config/          Configuration files
  /middleware/      Express middleware
  /routes/          API route handlers
  /services/        Business logic
  /utils/           Utility functions
/docs/              Documentation
/scripts/           Utility scripts
/backups/           Timestamped backups (IMPORTANT!)
```

---

## 🎯 Development Guidelines

### Code Style
- Use ES6+ syntax (async/await, destructuring, arrow functions)
- Use ES Modules (`import/export`), NOT CommonJS (`require`)
- Functional React components with hooks, NOT class components
- Use Zustand or Context for state, NOT Redux
- Prefer composition over inheritance
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Component Patterns
```jsx
// ✅ Good - Functional component with hooks
import { useState, useEffect } from 'react';

export default function ContactList({ filters }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Fetch contacts
  }, [filters]);

  return <div>{/* ... */}</div>;
}

// ❌ Bad - Class component
class ContactList extends React.Component {
  // Don't use class components
}
```

### File Naming
- React components: `PascalCase.jsx` (e.g., `ContactList.jsx`)
- Utilities: `kebab-case.js` (e.g., `api-client.js`)
- Constants: `UPPER_SNAKE_CASE.js` (e.g., `API_CONSTANTS.js`)
- Hooks: `useCamelCase.js` (e.g., `useAuth.js`)

### API Route Patterns
```javascript
// ✅ Good - Versioned API routes with proper error handling
app.get('/api/v1/contacts', authenticate, async (req, res) => {
  try {
    const contacts = await getContacts(req.user.id);
    res.json({ success: true, data: contacts });
  } catch (error) {
    logger.error('Error fetching contacts', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
});
```

### Database Queries
- Always use parameterized queries to prevent SQL injection
- Use Supabase client for database operations
- Implement proper error handling
- Add user isolation (filter by `user_id`)

```javascript
// ✅ Good - Parameterized, user-isolated query
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// ❌ Bad - SQL injection risk
const query = `SELECT * FROM contacts WHERE user_id = '${userId}'`; // DON'T DO THIS
```

### Authentication & Authorization
- ALWAYS verify user authentication on API routes
- Use the `authenticate` middleware from `backend/middleware/auth.js`
- Implement user isolation - users should only see their own data
- Respect admin bypass for `axolopcrm@gmail.com`

### Error Handling
- Use try-catch blocks for async operations
- Log errors with Winston logger
- Return user-friendly error messages
- Don't expose sensitive info in error responses

```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    userId: req.user?.id
  });
  throw new Error('User-friendly error message');
}
```

### Environment Variables
- Never commit `.env` files
- Always provide `.env.example` with placeholder values
- Use `config/app.config.js` to centralize configuration
- Validate required env vars on startup

---

## 📦 Common Commands

### Development
```bash
npm run dev                 # Start frontend + backend concurrently
npm run dev:vite           # Frontend only (port 3000)
npm run dev:backend        # Backend only (port 3002)
npm run build              # Build for production
npm run preview            # Preview production build
```

### Testing & Validation
```bash
npm run test:auth          # Test authentication system
npm run verify:schema      # Verify database schema
npm run validate:config    # Validate configuration
npm run check-typos        # Check for component typos
```

### Production
```bash
npm run start              # Start production server
npm run pm2:start          # Start with PM2
npm run pm2:logs           # View PM2 logs
npm run pm2:restart        # Restart PM2 process
```

### Database
```bash
npm run seed               # Seed demo data
npm run deploy:schema      # Deploy users schema
```

### Docker
```bash
npm run docker:up          # Start Docker containers
npm run docker:down        # Stop Docker containers
npm run docker:rebuild     # Rebuild containers
```

---

## 🔒 Security Best Practices

### Authentication
- Use Supabase Auth for user management
- Validate JWT tokens on every API request
- Implement proper session management
- Never store passwords in plain text

### API Security
- Enable CORS with specific origins (not `*`)
- Use Helmet.js for security headers
- Implement rate limiting (already configured)
- Sanitize all user inputs
- Use HTTPS in production

### Data Protection
- Encrypt sensitive data at rest
- Use environment variables for secrets
- Implement user data isolation
- Follow GDPR compliance guidelines

---

## 🐛 Debugging & Troubleshooting

### Check System Health
```bash
# Check if all services are running
npm run dev

# Verify API health
curl http://localhost:3002/health

# Check authentication
npm run test:auth

# Validate database schema
npm run verify:schema
```

### Common Issues
1. **Port already in use**: Check if services are running on ports 3000 or 3002
2. **Database connection failed**: Verify Supabase credentials in `.env`
3. **Redis connection error**: Ensure Redis is running on port 6379
4. **Auth errors**: Check JWT secret and Supabase config

### Logs
- Backend logs: Terminal where `npm run dev:backend` is running
- Frontend logs: Browser console (F12)
- PM2 logs: `npm run pm2:logs`
- System logs: Check `/logs` directory if configured

---

## 📚 Key Documentation Files

Always reference these before making changes:

**Must Read Before ANY Changes:**
- `docs/README.md` - Documentation hub
- `docs/GETTING_STARTED.md` - Project overview
- `docs/FEATURES_OVERVIEW.md` - Feature list
- `docs/architecture/TECH_STACK.md` - Tech stack details

**For Specific Features:**
- Auth: `docs/authentication/AUTH_SYSTEM_STATUS.md`
- Forms: `docs/features/FORMS/`
- Workflows: `docs/features/WORKFLOWS/`
- Email: `docs/sendgrid/SENDGRID_QUICK_REFERENCE.md`
- Calendar: `docs/setup/CALENDAR_SETUP_GUIDE.md`

**For Development:**
- `docs/development/START_HERE.md`
- `docs/development/DEVELOPMENT_WORKFLOW.md`
- `V1.1_TODO_LIST.md` - Current priorities

**For Deployment:**
- `docs/deployment/DEPLOY_NOW.md`
- `docs/deployment/DOCKER_DEPLOYMENT.md`

---

## ✅ Pre-Implementation Checklist

Before starting ANY implementation, verify:

- [ ] Have you read the relevant documentation?
- [ ] Do you understand the current architecture?
- [ ] Is this a big change that requires a backup?
- [ ] Have you created a backup if needed?
- [ ] Are you following the tech stack?
- [ ] Are you NOT changing any port configurations?
- [ ] Have you checked V1.1_TODO_LIST.md for priorities?
- [ ] Will this change maintain backward compatibility?
- [ ] Have you considered security implications?
- [ ] Will this work with the existing authentication system?

---

## 🎯 Current Priorities (V1.1)

Focus on these areas per `V1.1_TODO_LIST.md`:

1. **Forms Module** - Fix bugs, clean UI, optimize performance
2. **Sales CRM Module** - Fix lead management, improve UI
3. **Meetings Module** - Fix scheduling bugs, enhance calendar integration
4. **Master Search** - Update to lead to all relevant pages
5. **Stripe Integration** - Implement payment processing
6. **ICP Documentation** - Update docs to reflect agency owner focus

---

## 🚫 What NOT to Do

1. **NEVER change port configurations** (3000 for frontend, 3002 for backend)
2. **NEVER skip creating backups before major changes**
3. **NEVER introduce new dependencies without reading docs first**
4. **NEVER modify authentication without understanding the current system**
5. **NEVER commit secrets or `.env` files**
6. **NEVER break user data isolation**
7. **NEVER skip error handling in API routes**
8. **NEVER use CommonJS (require) - always use ES Modules (import)**
9. **NEVER use class components - always use functional components**
10. **NEVER bypass authentication middleware on API routes**

---

## 💡 Best Practices Summary

1. **Read docs first** - Understand before you change
2. **Create backups** - Always backup before big changes
3. **Follow the stack** - Use established technologies
4. **Respect ports** - Never change port configuration
5. **Test thoroughly** - Use provided test scripts
6. **Log everything** - Use Winston logger for backend logs
7. **Secure by default** - Implement auth, validation, and sanitization
8. **User isolation** - Always filter by user_id
9. **Error handling** - Wrap async operations in try-catch
10. **Keep it simple** - Don't over-engineer solutions

---

## 📞 Need Help?

**Documentation:** Start with `docs/README.md`
**System Health:** Run `npm run dev` and check both services
**API Health:** `curl http://localhost:3002/health`
**Auth Issues:** `npm run test:auth`
**Database Issues:** `npm run verify:schema`

---

**Version:** 1.0
**Last Updated:** 2025-01-23
**Project Version:** v1.2.0

Remember: Axolop CRM is helping agency owners save $1,375/month by replacing 10+ tools with one unified platform. Every change should align with this mission.
