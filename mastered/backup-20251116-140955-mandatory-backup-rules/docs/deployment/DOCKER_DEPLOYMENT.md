# Axolop CRM - Docker Deployment Guide

**Date:** 2025-11-13
**Docker Setup:** Multi-Container Development Environment (Backend Only)
**Database:** Supabase PostgreSQL (External)

---

## 🐳 Docker Architecture

This project uses a multi-container Docker setup for local development. It consists of two services:

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
│  │  ┌───────────┐                       │  │
│  │  │  backend  │                       │  │
│  │  │ (Node.js) │                       │  │
│  │  └─────┬─────┘                       │  │
│  │        │                             │  │
│  │        │                             │  │
│  │        ▼                             │  │
│  │  ┌───────────────────────────┐      │  │
│  │  │      Redis (redis:alpine) │      │  │
│  │  └───────────────────────────┘      │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Access Points (Local Development):         │
│  - Backend API: http://localhost:4001       │
│                                             │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

To get the application running with Docker, follow these steps:

1.  **Ensure Ports are Free:** Make sure ports `4001` and `6379` are not in use on your host machine. You can check and kill processes using these ports with:
    ```bash
    lsof -i :4001  # Docker backend port
    lsof -i :6379  # Redis port
    kill -9 <PID> # Replace <PID> with the process ID
    ```

2.  **Build and Run Docker Containers:**
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the `backend` Docker image.
    *   Create and start the `backend` and `redis` containers.
    *   Map container ports to your host machine (4001 for backend, 6379 for Redis).

3.  **Access the Application:**
    *   **Backend API:** The API will be available at `http://localhost:4001`

## 🛠️ Services Overview

### `backend` Service

*   **Image:** `node:20-alpine`
*   **Dockerfile:** `docker/backend/Dockerfile`
*   **Purpose:** Runs the Node.js Express API.
*   **Environment Variables:** Configured via `docker-compose.yml` to connect to Supabase, Redis, and other external services.
*   **Port Mapping:** Container port 3001 mapped to host port 4001.

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

*   **"Port is already allocated" error:** Ensure no other applications are using ports `4001` or `6379` on your host machine. The Docker backend now runs on port 4001 to avoid conflicts with the development server on port 3001.
*   **Container fails to start:** Check the logs for the specific service using `docker-compose logs -f <service_name>`.
*   **Development vs Docker:** The development server runs on port 3001 while Docker container runs on port 4001, allowing both to run simultaneously.

---

## 📚 Related Documentation

*   **Main Project README:** `README.md`
*   **Installation Guide:** `docs/development/INSTALLATION_GUIDE.md`
*   **Supabase Configuration:** `docs/database/SUPABASE_CONFIGURATION.md`
*   **Tech Stack:** `docs/architecture/TECH_STACK.md`

---

**Last Updated:** 2025-11-13