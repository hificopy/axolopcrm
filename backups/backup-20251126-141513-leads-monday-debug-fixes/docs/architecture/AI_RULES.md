# AI Rules for Axolop CRM Development

**Version:** 1.0  
**Last Updated:** 2025-01-24  
**Sync Status:** Aligned with CLAUDE.md and QWEN.md

---

## 🎯 Core Mission

**Axolop CRM** is "The New Age CRM with Local AI Second Brain" - an all-in-one platform that replaces 10+ tools for agency owners, saving them $1,375/month and raising profit margins by 20%.

**Target Customer (ICP):** Agency owners with high OPEX juggling multiple tools

**Value Proposition:** Replace GoHighLevel, Typeform, ClickUp, Notion, Miro, iClosed, ActiveCampaign, and 5+ other tools with ONE unified platform.

---

## 🚨 CRITICAL RULES - READ FIRST

### 1. Backup & Deployment Rules
**MANDATORY BEFORE ANY CHANGES:**
- **ALWAYS create local backup** in appropriate folder (`../backups/`, `../beta/`, or `../mastered/`)
- **NEVER push to production** (`mastered` branch) - human-controlled only
- **NEVER change ports** - Frontend: 3000, Backend: 3002 (Docker)
- **ALWAYS rebuild Docker** after backend code changes

### 2. Server Architecture - CRITICAL
```
Frontend (Vite):   http://localhost:3000
   ↓ (proxies API calls)
Backend (Docker):  http://localhost:3002 (website-backend-1)
   ↓ (depends on)
Redis:             port 6379 (website-redis-1)
ChromaDB:          port 8001 (website-chromadb-1)
```

**DO NOT** start backend with `npm run` commands - use Docker only!

### 3. Tech Stack Compliance
**Frontend:** React 18 (functional), Vite 5, TailwindCSS 3, Zustand, React Router v7  
**Backend:** Node.js (ES Modules), Express 4, PostgreSQL (Supabase), Redis, ChromaDB  
**NO TypeScript** - JavaScript only  
**NO class components** - Functional components with hooks only  

---

## 📋 Development Workflow

### Before ANY Implementation
1. **Read Documentation First:**
   - `docs/README.md` - Documentation hub
   - `docs/FEATURES_OVERVIEW.md` - Complete feature list
   - `V1.1_TODO_LIST.md` - Current priorities
   - Feature-specific docs in `docs/features/`

2. **Check Current Architecture:**
   - Understand existing components and patterns
   - Follow established naming conventions
   - Use existing libraries and utilities

3. **Create Backup if Needed:**
   - Major changes → backup to `../backups/backup-YYYYMMDD-HHMMSS-description/`
   - Use rsync to preserve structure

### Implementation Guidelines
1. **Follow Existing Patterns:**
   - Copy similar components' structure
   - Use established UI patterns
   - Maintain consistent styling

2. **Code Standards:**
   - ES6+ syntax (async/await, destructuring)
   - ES Modules (`import/export`) - NO CommonJS
   - Functional components with hooks
   - JSDoc comments for complex functions

3. **Security & Best Practices:**
   - User isolation (filter by `user_id`)
   - Parameterized queries (SQL injection prevention)
   - Proper error handling with try-catch
   - Authentication middleware on all API routes

---

## 🎨 UI/UX Guidelines

### Design System
- **Colors:** Primary green/blue/yellow for categories, glassmorphic effects
- **Icons:** Lucide React icons only
- **Components:** Radix UI + custom components
- **Styling:** TailwindCSS with consistent spacing/typography

### Component Patterns
```jsx
// ✅ Good - Functional component with hooks
import { useState, useEffect } from 'react';

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState([]);
  
  useEffect(() => {
    // Side effects
  }, [prop1]);

  return <div>{/* JSX */}</div>;
}
```

### File Naming
- Components: `PascalCase.jsx`
- Utilities: `kebab-case.js`
- Hooks: `useCamelCase.js`
- Constants: `UPPER_SNAKE_CASE.js`

---

## 🔧 Feature Implementation Rules

### 1. CRM Features
- **Leads/Contacts:** User isolation, custom fields, activity tracking
- **Opportunities:** Kanban view, pipeline stages, revenue tracking
- **Activities:** Automatic logging, manual entry, timeline view

### 2. Marketing Features
- **Email Marketing:** SendGrid integration, campaigns, automation
- **Forms:** Drag-and-drop builder, conditional logic, analytics
- **Meetings:** Google Calendar sync, booking links, reminders

### 3. AI Features
- **Local AI Second Brain:** Privacy-focused, ChromaDB integration
- **Meeting Intelligence:** Transcription, sentiment analysis
- **Lead Scoring:** Engagement-based, predictive analytics

### 4. Coming Soon Features
- **Second Brain:** Notion replacement (Q2 2025)
- **Mind Maps:** Miro replacement (Q3 2025)
- **Team Chat:** Slack alternative (Q4 2025)

---

## 🚀 Agency Owner Focus

### Pain Points to Solve
1. **Tool Overload:** Replace 10+ tools with 1 platform
2. **High OPEX:** Save $1,375/month on software subscriptions
3. **Context Switching:** Unified interface for all operations
4. **Data Silos:** Connected data across all features
5. **Complexity:** Simple yet powerful automation

### Feature Priorities for V1.1
1. **Forms Module** - Fix bugs, clean UI, optimize performance
2. **Sales CRM Module** - Fix lead management, improve UI
3. **Meetings Module** - Fix scheduling bugs, enhance calendar integration
4. **Master Search** - Update to lead to all relevant pages
5. **Stripe Integration** - Implement payment processing
6. **ICP Documentation** - Update docs for agency owners

---

## 🔄 Personalize Menu Enhancement

### Available Quick Actions
Current menu items should include:
- **Quick Search** (⌘+K) - Universal search across all modules
- **Invite Team Member** - Send team invitations
- **Template Center** - Access templates for forms, emails, workflows
- **Autopilot Hub** - AI automation and workflows
- **Help Center** - Documentation and support
- **Notifications** - Activity notifications and alerts

### Enhanced Menu Items (To Add)
- **Quick Lead** - Fast lead creation shortcut
- **Call Dialer** - Quick access to sales dialer
- **Email Templates** - Quick template insertion
- **Meeting Scheduler** - Fast meeting booking
- **Reports Dashboard** - Quick analytics access
- **API Keys** - Developer access
- **Import/Export** - Data management
- **Backup & Restore** - Data protection
- **Integrations** - Third-party connections
- **Custom Fields** - Field management
- **Workflow Builder** - Automation creation
- **Second Brain** - AI knowledge base

---

## 📊 Common Commands

### Development
```bash
npm run dev                 # Start frontend + backend
npm run dev:vite           # Frontend only (port 3000)
npm run build              # Build for production
npm run test:auth          # Test authentication
npm run verify:schema      # Verify database schema
```

### Docker (Backend Changes)
```bash
docker-compose build backend    # Rebuild with new code
docker-compose up -d backend    # Restart container
docker logs website-backend-1   # Check logs
```

### Database
```bash
npm run deploy:schema      # Deploy schema changes
npm run seed               # Seed demo data
```

---

## 🔒 Security Rules

### Authentication
- Supabase Auth + JWT tokens only
- User isolation on ALL data queries
- Admin bypass: `axolopcrm@gmail.com`

### API Security
- Rate limiting enabled
- CORS with specific origins
- Input sanitization
- HTTPS in production

### Data Protection
- Environment variables for secrets
- User data isolation
- GDPR compliance
- No sensitive data in logs

---

## 🚫 What NOT to Do

1. **NEVER change ports** (3000 frontend, 3002 backend)
2. **NEVER skip backups** before major changes
3. **NEVER use TypeScript** - JavaScript only
4. **NEVER use class components** - Functional only
5. **NEVER use CommonJS** - ES Modules only
6. **NEVER bypass authentication** middleware
7. **NEVER commit secrets** or `.env` files
8. **NEVER break user isolation** (filter by user_id)
9. **NEVER skip error handling** in async operations
10. **NEVER push to production** without human approval

---

## ✅ Pre-Implementation Checklist

Before starting any implementation:

- [ ] Read relevant documentation?
- [ ] Understand current architecture?
- [ ] Created backup if needed?
- [ ] Following tech stack requirements?
- [ ] NOT changing port configurations?
- [ ] Checked V1.1_TODO_LIST.md for priorities?
- [ ] Maintaining backward compatibility?
- [ ] Considered security implications?
- [ ] Will work with existing authentication?

---

## 🎯 Success Metrics

Every feature should:
1. **Reduce tool overload** - Replace external tools
2. **Save money** - Reduce subscription costs
3. **Increase efficiency** - Streamline workflows
4. **Maintain simplicity** - Easy to use yet powerful
5. **Protect data** - Privacy-first approach
6. **Enable growth** - Scale with agency needs

---

## 📞 Getting Help

**Documentation:** Start with `docs/README.md`  
**System Health:** `npm run dev` and check both services  
**API Health:** `curl http://localhost:3002/health`  
**Auth Issues:** `npm run test:auth`  
**Database Issues:** `npm run verify:schema`

---

**Remember:** Every change should help agency owners save $1,375/month by replacing 10+ disconnected tools with one unified platform. Focus on simplicity, power, and privacy.

**Sync Status:** This file is kept in sync with CLAUDE.md and QWEN.md. All three files contain the same core rules and guidelines.