# Axolop CRM - Custom All-in-One CRM

**Version:** 1.0.0-alpha
**Status:** Development
**Built For:** Axolop LLC & Axolop (ECOMMERCE, B2B BUSINESS, REAL ESTATE)

---

## Overview

Custom CRM system built to replace iClosed, HubSpot, and Close CRM with a unified platform optimized for Axolop (hubspot competitor with typeform, jotform, perspective funnels, manychat automations, active campaign email flow builder, klaviyo, beehive newsletter, close crm sales section functionalities) business operations.

**Goals:**
- Reduce OPEX by eliminating 3+ SaaS subscriptions
- Clone Close CRM UI/UX exactly
- Add HubSpot-level email marketing features
- Optimize for Axolop (ECOMMERCE, B2B BUSINESS, REAL ESTATE) client onboarding workflows
- Integrate with AutoFlow (automation) and InsightOS (analytics)

---

## Database Architecture

### Primary Database: Supabase PostgreSQL
- **Purpose**: Main CRM data storage (leads, contacts, deals, activities)
- **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, etc.) integrated with Auth0 as external identity provider
- **Database Access**: Direct Supabase client with TypeScript support
- **Features**: ACID transactions, complex queries, real-time subscriptions

### Vector Database: ChromaDB  
- **Purpose**: AI/ML vector storage for semantic search and embeddings
- **Integration**: Semantic search, document embeddings, AI chat memory
- **Access**: Direct API calls from backend services

### Authentication & Security
- **Authentication**: Supabase Auth with OAuth providers (Google, GitHub, etc.) and integration with Auth0 as external provider
- **Database Security**: Supabase Row Level Security (RLS) policies
- **Token Management**: JWT-based with refresh tokens

---

## Current Tech Stack

### Core Technologies
- **Frontend:** React 18.2, Vite 5, TailwindCSS 3.3
- **Deployment:** Vercel (frontend), Docker containers (backend services)
- **Database:** Supabase PostgreSQL Cloud + ChromaDB (AI/ML) in Docker
- **Authentication:** Supabase Auth with OAuth providers (Google, GitHub, etc.) and optional Auth0 integration as external provider
- **Infrastructure:** Docker containers for backend services (API, n8n, Redis, ChromaDB)

### Development & Productivity
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod validation
- **Data Tables:** TanStack Table with virtualization
- **Rich Text:** Tiptap editor
- **Drag & Drop:** @dnd-kit
- **Email Builder:** react-email
- **Charts & Analytics:** Recharts
- **AI/ML:** OpenAI, Groq, Xenova Transformers, ChromaDB
- **Email Integration:** Gmail API, Nodemailer, SendGrid
- **Queue System:** Bull + Redis
- **Analytics:** PostHog, Sentry
- **Payments:** Stripe

### Infrastructure & Security
- **Database Host:** Supabase PostgreSQL (CRM-specific project)
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime subscriptions
- **Authentication:** Supabase Auth with JWT tokens from OAuth providers and optional Auth0 integration
- **Security:** Helmet.js, CORS, Rate limiting
- **Caching:** Redis with ioredis
- **Monitoring:** Autoheal, Watchtower for auto-updates

See: [TECH_STACK.md](./docs/architecture/TECH_STACK.md) for complete technology overview.

## Branding & Color Scheme

### Primary Colors
- **Main Black:** #101010 (for all black elements)
- **Accent Color:** #7b1c14 (for highlights and calls to action)

### Visual Design Principles
The three-category CRM implements a sophisticated visual design with:

- **Color-Coded Categories**: Each category has a distinct visual identity
  - Sales: Blue theme (#4C7FFF primary blue)
  - Marketing: Green theme (#00D084 primary green)
  - Service: Yellow theme (#FFB800 primary yellow)
- **Gradient Backgrounds**: Smooth gradient transitions for depth
- **Smooth Animations**: 300ms transitions for polished interactions
- **Interactive Elements**: Hover effects, border transitions, and visual feedback
- **Visual Hierarchy**: Clear distinction between category headers and items
- **Consistent Styling**: Uniform design patterns across all categories

## 📁 Project Structure

```
crm/                        # Root project directory
├── backend/                # Server-side code, API routes, services
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication, validation
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── frontend/               # Client-side React application
│   ├── components/         # React components
│   ├── pages/              # Route components
│   ├── lib/                # API clients and utilities
│   └── styles/             # CSS and styling
├── config/                 # Configuration files
├── docker/                 # Docker configurations
├── docs/                   # Comprehensive documentation
│   ├── api/                # Authentication and API docs
│   ├── architecture/       # System design and tech stack
│   ├── database/           # Database configuration
│   ├── deployment/         # Deployment guides
│   └── development/        # Development guides
├── config/                 # Configuration files for Supabase
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
└── tests/                  # Unit and integration tests
```

---

## 📚 Documentation

Comprehensive documentation is organized in the `/docs/` directory:

- [Getting Started](./docs/development/START_HERE.md) - Initial setup and project overview
- [Development Workflow](./docs/development/DEVELOPMENT_WORKFLOW.md) - Development process and toggle explanations
- [Database Configuration](./docs/database/SUPABASE_CONFIGURATION.md) - Supabase setup
- [API Documentation](./docs/api/AUTHENTICATION_FLOW.md) - Authentication and API specs
- [Deployment Guide](./docs/deployment/README.md) - Docker and production setup
- [Deployment Methodology](./docs/deployment/DEPLOYMENT_METHODOLOGY.md) - Best practices and prevention strategies
- [Deployment Architecture](./docs/deployment/DEPLOYMENT_ARCHITECTURE.md) - Frontend/Backend hosting architecture
- [Backend Hosting Options](./docs/deployment/BACKEND_HOSTING_OPTIONS.md) - Self-hosting solutions for Docker containers
- [Frontend Hosting Process](./docs/deployment/FRONTEND_HOSTING_PROCESS.md) - Vercel deployment process
- [Under Construction Page](./docs/deployment/UNDER_CONSTRUCTION_PAGE.md) - Beta login and construction mode setup
- [Architecture](./docs/architecture/TECH_STACK.md) - Technical architecture overview

---

## Current Features

### Core CRM Functionality
- ✅ **Leads Management** - Complete lead tracking with qualification levels
- ✅ **Contacts Management** - Full contact details and relationship mapping  
- ✅ **Deals & Pipeline** - Opportunity tracking with customizable stages
- ✅ **Activity Tracking** - Complete activity timeline for all entities
- ✅ **Task Management** - To-dos with assignments and due dates
- ✅ **Interaction Logging** - Email, call, and meeting tracking
- ✅ **User Management** - Team member roles and permissions
- **Visual Design**: Category-specific color coding (Sales: Blue, Marketing: Green, Service: Yellow)

### Phase 2: Email Marketing (Next)
- Email campaigns
- Email templates builder
- Drip campaigns / sequences
- A/B testing
- Email analytics

### Phase 3: Forms & Landing Pages
- Form builder (drag & drop)
- Lead capture forms
- Embedded forms
- Landing page builder
- Form submissions tracking

### Phase 4: Advanced Features
- Workflows automation
- Lead scoring (AI)
- Client health monitoring (AI)
- Custom fields
- API & webhooks
- Mobile app

---

## UI/UX Theming

### Visual Design Principles
The three-category CRM implements a sophisticated visual design with:

- **Color-Coded Categories**: Each category has a distinct visual identity
  - Sales: Blue theme (#4C7FFF primary blue)
  - Marketing: Green theme (#00D084 primary green) 
  - Service: Yellow theme (#FFB800 primary yellow)
- **Gradient Backgrounds**: Smooth gradient transitions for depth
- **Smooth Animations**: 300ms transitions for polished interactions
- **Interactive Elements**: Hover effects, border transitions, and visual feedback
- **Visual Hierarchy**: Clear distinction between category headers and items
- **Consistent Styling**: Uniform design patterns across all categories

### Design Features
- **Collapsible Categories**: Animated chevron indicators with rotation
- **Dynamic Color Accents**: Background colors that match category themes
- **Shadow Effects**: Subtle shadows for depth and focus states
- **Hover Transitions**: Smooth state changes with movement effects
- **Gradient Accents**: Enhanced visual appeal with gradient backgrounds

## Project Status

### Current Phase: Core CRM Development
- **Status**: Active development, Phase 1.1
- **Focus**: Completing core sales CRM features
- **Progress**: Approximately 45% complete

### Completed Features
- ✅ Complete database schema with 20+ models
- ✅ Supabase PostgreSQL integration with Row Level Security
- ✅ Auth0 OAuth authentication system
- ✅ Docker containerization with direct application serving
- ✅ React frontend with Close CRM UI styling
- ✅ Supabase Client with PostgreSQL
- ✅ Redis for caching and queues
- ✅ Lead management system
- ✅ Contact management system
- ✅ Deal/opportunity tracking
- ✅ Activity and interaction logging
- ✅ Task management system
- ✅ User role management
- ✅ Basic reporting capabilities
- ✅ ChromaDB integration for AI features

### In Development
- 🔄 Email marketing features
- 🔄 Forms builder functionality
- 🔄 Advanced workflow automation
- 🔄 AI-powered lead scoring
- 🔄 Complete reporting dashboard
- 🔄 Customer support ticket system

### Upcoming Features
- 📋 Advanced analytics and insights
- 📋 Customer portal
- 📋 Mobile application
- 📋 API webhooks
- 📋 Custom field management
- 📋 Advanced workflow builder

For complete development progress, see [Build Progress](./docs/development/BUILD_PROGRESS.md) and [Setup Complete](./docs/development/SETUP_COMPLETE.md).

---

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase account (PostgreSQL database - already configured)
- Docker Desktop (required for production deployment)
- Git

### Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Update with your Supabase credentials and other API keys
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase database:**
   ```bash
   # Supabase database is configured via dashboard and environment variables
   # No local migration needed - managed through Supabase dashboard
   ```

4. **Start the application:**
   ```bash
   # Development mode
   npm run dev
   
   # Or with Docker
   docker-compose up --build
   ```

**Access:**
- **Development:** http://localhost:3000 (frontend), http://localhost:3001 (backend)
- **Docker Production:** http://localhost:3001

### Running Services:
- **crm-app** - Express.js backend API server (handles port 3001)
- **crm-redis** - Redis for caching and queues  
- **crm-chromadb** - ChromaDB vector database for AI features
- **watchtower-crm** - Automatic Docker image updates
- **autoheal-crm** - Container health monitoring

---

## Development Commands

### Application Management
```bash
# Development mode (frontend + backend)
npm run dev

# Individual services
npm run dev:vite         # Frontend only
npm run dev:backend      # Backend only

# Production build
npm run build            # Build for production
npm run preview          # Preview production build locally
```

### Supabase Management
```bash
# Supabase operations
# Database schema managed through Supabase dashboard
# Use Supabase SQL Editor for direct database operations
```

### Code Quality
```bash
npm run lint             # Lint code with ESLint
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking
```

### Docker Operations
```bash
# Docker services
docker-compose up -d                 # Start all services in background
docker-compose down                  # Stop all services
docker-compose logs -f               # Follow logs from all services
docker-compose logs -f crm-app       # View backend logs
docker-compose restart               # Restart all services

# Rebuild when Dockerfile changes
docker-compose up -d --build         # Rebuild and start services
```

---

## Environment Variables

See `.env.example` for complete configuration. Required variables include:

```env
# Database (Supabase PostgreSQL - CRM-specific project)
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_crm_project_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_crm_project_service_role_key

# Authentication (Supabase with OAuth providers, optionally with Auth0)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For external Auth0 integration (optional):
# AUTH0_DOMAIN=your-domain.auth0.com
# AUTH0_CLIENT_ID=your_client_id
# JWT_SECRET=your_jwt_secret_min_32_chars

# Email Integration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
SENDGRID_API_KEY=your_sendgrid_api_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key

# Redis (for caching and queues)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=crm_redis_password

# Application
NODE_ENV=development
API_PORT=3001
FRONTEND_URL=http://localhost:3000
CRM_PORT=3001
```

For detailed setup instructions, see [Supabase Configuration](./docs/database/SUPABASE_CONFIGURATION.md) and [Installation Guide](./docs/development/INSTALLATION_GUIDE.md).

---

## Integration with AutoFlow & InsightOS

### AutoFlow Integration
CRM emits events to AutoFlow for automation:
```javascript
// Example: New lead created
crm.events.emit('lead.created', {
  lead_id: 'lead_123',
  source: 'website_form',
  qualification: 'hot'
});

// AutoFlow responds with workflow
```

### InsightOS Integration
CRM provides data to InsightOS for analytics:
```javascript
// Example: Lead scoring
const score = await insightOS.calculateLeadScore({
  lead_id: 'lead_123',
  interactions: [...],
  context: {...}
});
```

See: [CRM_INTEGRATION_ARCHITECTURE.md](../CRM_INTEGRATION_ARCHITECTURE.md)

---

## Roadmap

### Phase 1: Core CRM - Sales Category (Weeks 1-4) - CURRENT
- [x] Tech stack setup
- [x] Close CRM UI analysis
- [x] Database schema design
- [x] Basic layout (sidebar + main content) with Sales, Marketing, Service categories
- [x] Leads management
- [ ] Contacts management
- [ ] Pipeline (Kanban board)
- [ ] Basic interactions tracking

### Phase 2: Marketing Category (Weeks 5-8)
- [ ] Email template builder
- [ ] Campaign management
- [ ] Email sequences/drips
- [ ] A/B testing
- [ ] Email analytics
- [ ] Form builder
- [ ] Lead capture forms
- [ ] Workflow automation

### Phase 3: Service Category (Weeks 9-12)
- [ ] Customer support tickets
- [ ] Knowledge base management
- [ ] Customer self-service portal
- [ ] Support analytics and reporting
- [ ] Client health monitoring (AI)

### Phase 4: Enhanced Features (Weeks 13-16)
- [ ] Activities feed
- [ ] Tasks & reminders
- [ ] Email integration (Gmail)
- [ ] Call logging
- [ ] Reports & dashboards
- [ ] Search & filters

### Phase 5: Migration & Launch (Weeks 17-18)
- [ ] Data migration from iClosed/HubSpot/Close
- [ ] Testing & QA
- [ ] Documentation
- [ ] Training
- [ ] Production deployment
- [ ] Old CRM cancellation

**Total: 18 weeks (4.5 months)**

---

## Contributing

This is a private project for Axolop LLC & Axolop. Internal contributors only.

---

## 🚀 Quick Start

1. **Clone and setup environment**:
   ```bash
   # Copy environment template
   cp .env.example .env
   # Update with your Supabase credentials
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Access the CRM**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

## License

Proprietary - Axolop LLC & Axolop
All rights reserved.

---

## Reference Projects

- **AutoFlow:** `/Users/jdromeroherrera/Desktop/CODE/macos-ai/AUTOFLOW_COMPLETE_SPEC.md`
- **InsightOS:** `/Users/jdromeroherrera/Desktop/CODE/macos-ai/INSIGHTOS_COMPLETE_SPEC.md`

---

**Last Updated:** 2025-11-14
**Maintained By:** Juan D. Romero Herrera (CEO)

---

## Deployment Information

**Latest Deployment Fix:** Vite build command issue on Vercel resolved with proper configuration in vercel.json
