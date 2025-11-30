# Backend-Frontend Integration for Vercel Deployment

## Overview
This document explains how the Axolop CRM frontend and backend services are integrated when deployed with Vercel.

## Architecture
The Axolop CRM uses a decoupled architecture where:
- The frontend is deployed on Vercel as a static site
- The backend runs on a separate server (currently at `http://axolop.hopto.org:3002`)
- Vercel proxies API requests to the backend service

## Vercel Configuration
The integration is handled through the `vercel.json` configuration file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distPath": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/api/(.*)",
      "dest": "http://axolop.hopto.org:3002/api/$1"
    },
    {
      "src": "/health",
      "dest": "http://axolop.hopto.org:3002/health"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## How It Works
1. Frontend requests to `/api/*` are automatically forwarded to the backend server at `http://axolop.hopto.org:3002`
2. The frontend can make API calls as if the backend were on the same domain
3. Frontend environment variable `VITE_API_URL` can be left as `/api` (relative path) since Vercel handles proxying
4. The `/health` endpoint is also proxied to check backend server status

## Frontend Configuration
When developing locally, the frontend uses:
- `VITE_API_URL=http://localhost:3001` (for local backend)

For Vercel deployment, the proxy configuration makes it possible for the frontend to work without changing the API URL, as all `/api` requests are automatically forwarded to the backend service.

## Backend Configuration
The backend service is configured to:
- Run on port 3002
- Allow CORS requests from the Vercel frontend domain
- Handle health checks at the `/health` endpoint
- Support API versioning with `/api/v1` prefix

## Health Check
The backend provides a health check endpoint at:
- `http://axolop.hopto.org:3002/health` (direct access)
- `https://your-vercel-domain.com/health` (via Vercel proxy)

## Troubleshooting
- If API calls fail, ensure the backend server is running at `http://axolop.hopto.org:3002`
- Check the Vercel logs for routing issues
- Verify CORS settings if requests fail from browser
- Monitor the health endpoint to ensure backend availability