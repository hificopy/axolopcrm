# Docker Setup

This project uses a multi-container Docker setup for production. The setup consists of three services:

- `frontend`: A Nginx container that serves the React application.
- `backend`: A Node.js container that runs the backend API.
- `redis`: A Redis container for caching and queues.

## Prerequisites

- Docker
- Docker Compose

## Usage

To start the application, run the following command from the root of the project:

```bash
docker-compose up -d
```

This will build the Docker images and start the containers in detached mode.

The application will be available at `http://localhost:3000`.

## Services

### `frontend`

- **Dockerfile:** `docker/frontend/Dockerfile`
- **Image:** `nginx:alpine`
- **Port:** `3000`

This service builds the React application and serves it with Nginx. The Nginx configuration is located in `docker/frontend/nginx.conf`.

### `backend`

- **Dockerfile:** `docker/backend/Dockerfile`
- **Image:** `node:20-alpine`
- **Port:** `3001`

This service runs the Node.js backend application.

### `redis`

- **Image:** `redis:alpine`
- **Port:** `6379` (configurable via `REDIS_PORT` environment variable)

This service provides a Redis instance for caching and queues. If port `6379` is already in use on your host machine, you can specify a different port by setting the `REDIS_PORT` environment variable in your shell *before* running `docker-compose up`. For example:

```bash
export REDIS_PORT=6380
docker-compose up -d
```
