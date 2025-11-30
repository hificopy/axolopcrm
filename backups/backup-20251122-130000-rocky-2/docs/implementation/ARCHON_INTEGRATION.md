# Archon Integration for Axolop CRM

This document describes the integration of Archon (AI coding assistant) into the Axolop CRM system.

## Overview

Archon is integrated into the Axolop CRM project to provide AI-powered coding assistance, knowledge management, and task management capabilities. Archon runs as a set of microservices alongside the main CRM application.

## Supabase Configuration

Archon is configured to use the same Supabase project as the Axolop CRM to ensure seamless data integration:

- **SUPABASE_URL**: https://fuclpfhitgwugxogxkmw.supabase.co
- **SUPABASE_SERVICE_KEY**: sb_secret_Y0pdE6KRUTcbDmFe1lqWFw_JapIHko3
- **SUPABASE_ANON_KEY**: sb_publishable_b0z-8BN9ac5Bf1JjlH4GOA__qFXR2ld
- **SUPABASE_JWT_SECRET**: KXv2gdb7KZVu7iDPukbfFVyNr62t4a61qEytUtlXnkZYxZP9qoINZD/uM/qnYRgFULb6JBd+y9XrMk4sxK4oXA==

All services share the same Supabase database, allowing for unified data management between CRM and AI coding assistance features.

## Services

The following Archon services are integrated into the docker-compose.yml:

- **archon-server** (Port 8181): Core API and business logic
- **archon-mcp** (Port 8051): Model Context Protocol interface
- **archon-agents** (Port 8052): AI/ML operations, reranking (optional)
- **archon-agent-work-orders** (Port 8053): Workflow execution with Claude Code CLI (optional)
- **archon-frontend** (Port 3737): Web interface

## Configuration

All Archon configuration is handled through environment variables in the main `.env` file.

### Required Configuration

1. **Database Setup**: Before starting Archon, you need to run the migration in your Supabase SQL Editor:
   - Execute the contents of `archon-migration/complete_setup.sql`

2. **API Keys**: After starting the services, configure your API keys in the Archon UI at http://localhost:3737

## Starting the Services

To start all services including Archon:

```bash
docker compose up --build -d
```

To start Archon agents (optional):

```bash
docker compose --profile agents up --build -d
```

To start agent work orders (optional):

```bash
docker compose --profile work-orders up --build -d
```

## Accessing Archon

- Archon UI: http://localhost:3737
- Archon API: http://localhost:8181
- MCP Server: http://localhost:8051

## Troubleshooting

1. **Database Connection Issues**: Ensure you've run the complete_setup.sql migration in your Supabase project
2. **Service Dependencies**: Archon services depend on Supabase, Redis, and ChromaDB, so ensure these are running
3. **Port Conflicts**: Check that the required ports (3737, 8051, 8052, 8053, 8181) are available

## Security Notes

- The Docker socket mounting (which provides elevated security risks) has been disabled by default
- MCP status is monitored via secure HTTP health checks instead
- All sensitive API keys should be stored in your Supabase database using the credentials table