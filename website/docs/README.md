# Axolop CRM - Documentation

Welcome to the HiFiCopy CRM documentation. This CRM system is built with a modern tech stack designed for scalability and maintainability.

## 📁 Documentation Structure

### [api/](./api/)
- Authentication flows (Auth0 OAuth)
- API specifications
- Token management

### [architecture/](./architecture/)
- System architecture overview
- Tech stack details
- UI/UX design specifications

### [database/](./database/)
- Supabase PostgreSQL configuration

- Database schema details
- Port configuration

### [deployment/](./deployment/)
- Docker deployment guides
- Server setup instructions
- Deployment troubleshooting

### [development/](./development/)
- Installation guides
- Development workflows
- Feature specifications
- Project setup

## 🔧 Current Tech Stack

- **Frontend:** React 18.2, Vite 5, TailwindCSS 3.3
- **Backend:** Node.js 20+, Express 4.18
- **Database:** Supabase PostgreSQL Cloud + ChromaDB (AI/ML) - Direct Supabase client (no Prisma used)
- **Authentication:** Supabase Auth with optional Auth0 integration
- **Infrastructure:** Vercel (frontend) + Self-hosted Docker (backend services)
- **AI/ML:** OpenAI, Groq, ChromaDB for vector storage

## 🚀 Getting Started

For getting started with development, see:
- [Installation Guide](./development/INSTALLATION_GUIDE.md)
- [Project Setup](./development/START_HERE.md)
- [Database Configuration](./database/SUPABASE_CONFIGURATION.md)

For deployment information, see:
- [Deployment Guide](./deployment/DOCKER_DEPLOYMENT.md)