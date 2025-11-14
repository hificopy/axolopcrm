# Axolop CRM - Docker Deployment Guide

**Date:** 2025-11-12
**Docker Setup:** Multi-Container Development Environment
**Database:** Supabase PostgreSQL (External)

---

## 🐳 Docker Architecture

This project uses a multi-container Docker setup for local development. It consists of three services:

-   **frontend**: Nginx serving the React application.
-   **backend**: Node.js application for the API.
-   **redis**: Redis instance for caching and queues.

```
┌─────────────────────────────────────────────┐
│  Host Machine                               │
│  (Your Computer)                            │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Docker Network                       │  │
│  │                                       │  │
│  │  ┌───────────┐     ┌───────────┐     │  │
│  │  │ frontend  │     │  backend  │     │  │
│  │  │ (Nginx)   │     │ (Node.js) │     │  │
│  │  └─────┬─────┘     └─────┬─────┘     │  │
│  │        │               │             │  │
│  │        │               │             │  │
│  │        ▼               ▼             │  │
│  │  ┌───────────────────────────┐      │  │
│  │  │      Redis (redis:alpine) │      │  │
│  │  └───────────────────────────┘      │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Access Points:                             │
│  - Frontend: http://localhost:3000          │
│  - Backend API: http://localhost:3001       │
│                                             │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

To get the application running with Docker, follow these steps:

1.  **Ensure Ports are Free:** Make sure ports `3000`, `3001`, and `6379` are not in use on your host machine. You can check and kill processes using these ports with:
    ```bash
    lsof -i :3000
    lsof -i :3001
    lsof -i :6379
    kill -9 <PID> # Replace <PID> with the process ID
    ```

2.  **Build and Run Docker Containers:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the `frontend` and `backend` Docker images.
    *   Create and start the `frontend`, `backend`, and `redis` containers.
    *   Map container ports to your host machine (3000 for frontend, 3001 for backend, 6379 for Redis).

3.  **Access the Application:**
    *   **Frontend:** Open your web browser and navigate to `http://localhost:3000`
    *   **Backend API:** The API will be available at `http://localhost:3001`

## 🛠️ Services Overview

### `frontend` Service

*   **Image:** `nginx:alpine`
*   **Dockerfile:** `docker/frontend/Dockerfile`
*   **Purpose:** Serves the built React application.
*   **Configuration:** `docker/frontend/nginx.conf` handles serving static files and proxying API requests to the `backend` service.

### `backend` Service

*   **Image:** `node:20-alpine`
*   **Dockerfile:** `docker/backend/Dockerfile`
*   **Purpose:** Runs the Node.js Express API.
*   **Environment Variables:** Configured via `docker-compose.yml` to connect to Supabase, Redis, and other external services.

### `redis` Service

*   **Image:** `redis:alpine`
*   **Purpose:** Provides a Redis instance for caching, session management, and background job queues.

## 📊 Docker Commands

### Start/Stop/Restart
```bash
# Start all services in detached mode
docker-compose up -d

# Stop all running services
docker-compose down

# Restart all services
docker-compose restart

# Restart a specific service (e.g., backend)
docker-compose restart backend
```

### Build/Rebuild
```bash
# Build or rebuild all service images
docker-compose build

# Build and start services, rebuilding images if necessary
docker-compose up --build
```

### Monitoring
```bash
# View logs for all services in real-time
docker-compose logs -f

# View logs for a specific service (e.g., backend)
docker-compose logs -f backend

# List running containers
docker-compose ps

# View resource usage (CPU, memory)
docker stats
```

## 🚨 Troubleshooting

*   **"Port is already allocated" error:** Ensure no other applications are using ports `3000`, `3001`, or `6379` on your host machine. Stop them using `lsof -i :<port>` and `kill -9 <PID>`.
*   **Container fails to start:** Check the logs for the specific service using `docker-compose logs -f <service_name>`.
*   **Frontend not loading:** Verify the `frontend` service is running (`docker-compose ps`) and check its logs. Ensure the `backend` service is also running if the frontend relies on API calls.

---

## 📚 Related Documentation

*   **Main Project README:** `README.md`
*   **Installation Guide:** `docs/development/INSTALLATION_GUIDE.md`
*   **Supabase Configuration:** `docs/database/SUPABASE_CONFIGURATION.md`
*   **Tech Stack:** `docs/architecture/TECH_STACK.md`

---

**Last Updated:** 2025-11-12