# Axolop CRM Documentation

**Complete documentation for Axolop CRM - The New Age CRM with Local AI Second Brain**

---

## 🚀 Quick Start

### New to Axolop CRM?
1. **[GETTING_STARTED.md](./GETTING_STARTED.md)** ⭐ START HERE
2. **[development/START_HERE.md](./development/START_HERE.md)** - Development setup
3. **[deployment/DEPLOY_NOW.md](./deployment/DEPLOY_NOW.md)** - Deploy to production

### Need Help?
- **[FEATURES_OVERVIEW.md](./FEATURES_OVERVIEW.md)** - All features explained
- **[troubleshooting/](./troubleshooting/)** - Common issues and solutions
- **[TECHNICAL_UPDATES.md](./TECHNICAL_UPDATES.md)** - Latest changes

---

## 📚 Documentation Sections

### 🔐 [Authentication & Onboarding](./authentication/)
Complete auth system documentation including sign in/up, password reset, and onboarding flow.

**Quick Links:**
- [Auth System Status](./authentication/AUTH_SYSTEM_STATUS.md) - Current status & next steps
- [Complete Audit](./authentication/COMPLETE_AUTH_AUDIT.md) - Full system analysis
- [Onboarding System](./authentication/ONBOARDING_SYSTEM.md) - User onboarding docs
- [Quick Reference](./authentication/QUICK_REFERENCE.md) - Common commands
- [Debugging Guide](./authentication/AUTH_DEBUGGING_GUIDE.md) - Troubleshooting

**Key Info:**
- ✅ Email/password + Google OAuth
- ✅ 4-step onboarding flow
- ⚠️ Database schema needs deployment
- 🔑 Admin: axolopcrm@gmail.com (bypasses onboarding)

---

### 🔌 [API Documentation](./api/)
API endpoints, authentication, and integration guides.

**Files:**
- [API Reference](./api/API_COMPLETE_REFERENCE.md) - All endpoints
- [Supabase Integration](./api/SUPABASE_AUTH0_INTEGRATION.md) - Auth integration
- [README](./api/README.md) - API overview

**Endpoints:**
- `/api/v1/users/*` - User management
- `/api/v1/leads/*` - Lead management
- `/api/v1/contacts/*` - Contact management
- `/api/v1/opportunities/*` - Opportunity management
- `/api/v1/forms/*` - Form management
- `/api/v1/email-marketing/*` - Email campaigns
- `/api/v1/workflows/*` - Workflow automation

---

### 🏗️ [Architecture](./architecture/)
System design, tech stack, and integration patterns.

**Files:**
- [Tech Stack](./architecture/TECH_STACK.md) - Technologies used
- [CRM Integration System](./architecture/CRM_INTEGRATION_SYSTEM.md) - Integration architecture
- [Branding](./architecture/BRANDING.md) - Brand guidelines
- [Category Structure](./architecture/CATEGORY_STRUCTURE.md) - Data organization

**Tech Stack:**
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Supabase)
- **Cache:** Redis
- **Vector DB:** ChromaDB (optional)
- **Auth:** Supabase Auth + JWT

---

### 💾 [Database](./database/)
Database schema, configuration, and setup guides.

**Files:**
- [Database Schema](./database/DATABASE_SCHEMA.md) - All tables and relationships
- [Supabase Configuration](./database/SUPABASE_CONFIGURATION.md) - Config guide
- [Supabase Setup](./database/SUPABASE_SETUP.md) - Initial setup
- [Port Configuration](./database/PORT_CONFIGURATION.md) - Connection details

**Key Tables:**
- `users` - User profiles and settings
- `onboarding_data` - Onboarding responses
- `leads` - Lead management
- `contacts` - Contact information
- `opportunities` - Sales pipeline
- `forms` - Form definitions
- `email_campaigns` - Email marketing

---

### 🚀 [Deployment](./deployment/)
Production deployment guides for frontend and backend.

**Files:**
- [Deploy Now](./deployment/DEPLOY_NOW.md) ⭐ Quick deployment
- [Docker Deployment](./deployment/DOCKER_DEPLOYMENT.md) - Containerized deployment
- [Backend Hosting Options](./deployment/BACKEND_HOSTING_OPTIONS.md) - Hosting comparison
- [Troubleshooting](./deployment/DEPLOYMENT_TROUBLESHOOTING.md) - Common issues
- [README](./deployment/README.md) - Deployment overview

**Deployment Options:**
- **Frontend:** Vercel (recommended), Netlify, AWS Amplify
- **Backend:** Railway, Render, DigitalOcean, AWS
- **Database:** Supabase (managed PostgreSQL)
- **Redis:** Upstash, Railway, self-hosted

---

### 💻 [Development](./development/)
Development setup, workflow, and feature implementation.

**Files:**
- [Start Here](./development/START_HERE.md) ⭐ Dev entry point
- [Installation Guide](./development/INSTALLATION_GUIDE.md) - Setup instructions
- [Development Workflow](./development/DEVELOPMENT_WORKFLOW.md) - Git workflow
- [Email Marketing Features](./development/EMAIL_MARKETING_FEATURES.md) - Email features
- [Forms Builder Features](./development/FORMS_BUILDER_FEATURES.md) - Form features

**Quick Commands:**
```bash
npm run dev              # Start frontend + backend
npm run dev:vite         # Frontend only
npm run dev:backend      # Backend only
npm run test:auth        # Test auth system
npm run verify:schema    # Verify database schema
```

---

### ✨ [Features](./features/)
Detailed documentation for all CRM features.

**Feature Categories:**
- **[Second Brain](./features/SECOND_BRAIN/)** - AI knowledge management
- **[Search](./features/SEARCH/)** - Universal search system
- **[Forms](./features/FORMS/)** - Form builder and analytics
- **[Workflows](./features/WORKFLOWS/)** - Automation system

**Other Features:**
- Email Marketing - Campaign management and automation
- Calendar - Scheduling and meeting management
- SendGrid Integration - Email delivery service
- Reports & Analytics - Business intelligence

---

### ⚙️ [Setup Guides](./setup/)
Step-by-step setup guides for integrations and features.

**Files:**
- [Calendar Setup](./setup/CALENDAR_SETUP_GUIDE.md) - Google Calendar integration
- [Integration Guide](./setup/INTEGRATION_GUIDE.md) - Third-party integrations
- [Supabase Auth Setup](./setup/SUPABASE_AUTH_SETUP.md) - Auth configuration
- [Supabase Setup Instructions](./setup/SUPABASE_SETUP_INSTRUCTIONS.md) - Database setup
- [Users Schema Deployment](./setup/USERS_SCHEMA_DEPLOYMENT.md) - Deploy user tables

---

### 📧 [SendGrid](./sendgrid/)
SendGrid email service integration.

**Files:**
- [SendGrid Setup](./sendgrid/SENDGRID_SETUP.md) - Initial configuration
- [SendGrid Implementation](./sendgrid/SENDGRID_IMPLEMENTATION.md) - Integration details
- [SendGrid Quick Reference](./sendgrid/SENDGRID_QUICK_REFERENCE.md) - Common tasks
- [SendGrid Final Checklist](./sendgrid/SENDGRID_FINAL_CHECKLIST.md) - Deployment checklist

---

### 🔧 [Troubleshooting](./troubleshooting/)
Common issues and debugging guides.

**Files:**
- [Frontend Debug Report](./troubleshooting/FRONTEND_DEBUG_REPORT.md) - UI issues

**Also See:**
- [Auth Debugging Guide](./authentication/AUTH_DEBUGGING_GUIDE.md) - Auth issues
- [Deployment Troubleshooting](./deployment/DEPLOYMENT_TROUBLESHOOTING.md) - Deploy issues

---

### 📦 [Archive](./archive/)
Historical documentation and old implementation notes.

**Contents:**
- Past implementation summaries
- Deprecated features
- Historical bug fixes
- Old setup guides

---

## 🎯 Common Tasks

### Setting Up Development Environment
1. Read [development/INSTALLATION_GUIDE.md](./development/INSTALLATION_GUIDE.md)
2. Follow [database/SUPABASE_SETUP.md](./database/SUPABASE_SETUP.md)
3. Configure auth: [authentication/AUTH_SYSTEM_STATUS.md](./authentication/AUTH_SYSTEM_STATUS.md)

### Deploying to Production
1. Read [deployment/DEPLOY_NOW.md](./deployment/DEPLOY_NOW.md)
2. Deploy database schema
3. Configure environment variables
4. Deploy frontend and backend

### Adding New Features
1. Check [architecture/TECH_STACK.md](./architecture/TECH_STACK.md)
2. Follow [development/DEVELOPMENT_WORKFLOW.md](./development/DEVELOPMENT_WORKFLOW.md)
3. Update relevant documentation

### Debugging Issues
1. Check [troubleshooting/](./troubleshooting/)
2. Review [authentication/AUTH_DEBUGGING_GUIDE.md](./authentication/AUTH_DEBUGGING_GUIDE.md)
3. Check [deployment/DEPLOYMENT_TROUBLESHOOTING.md](./deployment/DEPLOYMENT_TROUBLESHOOTING.md)

---

## 📊 Documentation Status

| Section | Status | Last Updated |
|---------|--------|--------------|
| Authentication | ✅ Complete | 2025-01-19 |
| API | ✅ Complete | 2025-01-16 |
| Architecture | ✅ Current | 2025-01-15 |
| Database | ⚠️ Needs Update | 2025-01-10 |
| Deployment | ✅ Current | 2025-01-18 |
| Development | ✅ Current | 2025-01-19 |
| Features | ⏳ Partial | 2025-01-17 |
| Setup | ✅ Current | 2025-01-18 |
| SendGrid | ✅ Complete | 2025-01-16 |
| Troubleshooting | ⏳ Minimal | 2025-01-15 |

---

## 🔗 External Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw
- **GitHub Repository:** (add your repo URL)
- **Production URL:** (add your production URL)
- **Staging URL:** (add your staging URL)

---

## 📝 Contributing to Docs

When updating documentation:
1. Keep docs up to date with code changes
2. Use clear, concise language
3. Include code examples where applicable
4. Update the "Last Updated" date
5. Cross-link related documentation
6. Test all commands and code samples

---

**Need help? Check [GETTING_STARTED.md](./GETTING_STARTED.md) or ask the team!**

**Last Updated:** 2025-01-19
