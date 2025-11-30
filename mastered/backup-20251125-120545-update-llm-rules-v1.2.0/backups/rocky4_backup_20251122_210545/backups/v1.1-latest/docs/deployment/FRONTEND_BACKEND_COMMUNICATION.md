# Frontend-Backend Communication Setup

## Architecture Overview

The Axolop CRM is deployed with a split architecture:
- **Frontend**: Hosted on Vercel (https://axolop.com)
- **Backend**: Self-hosted on personal server via Docker (http://axolop.hopto.org:3002)

## Communication Flow

### 1. API Request Flow
1. User interacts with frontend at https://axolop.com
2. Frontend makes API requests (e.g., `/api/leads`, `/api/contacts`)
3. Vercel `vercel.json` proxies these requests to backend at `http://axolop.hopto.org:3002`
4. Backend processes the request and accesses Supabase database
5. Response is sent back through the same chain

### 2. Port Configuration
- **Frontend**: Runs on Vercel (port managed by Vercel)
- **Backend API**: Port 3002 (both development and production Docker)
- **ChromaDB**: Port 8001 (for AI/ML features)
- **Dynamic DNS**: axolop.hopto.org pointing to your server's IP

### 3. Environment Variables

#### Frontend (Vercel Environment Variables)
- `VITE_API_URL`: `http://axolop.hopto.org:3002/api/v1` (used during build)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

#### Backend (Server Environment Variables)
- `PORT`: 3002
- `FRONTEND_URL`: `https://axolop.com` (for CORS configuration)
- All other environment variables from your `.env` file

## Security Considerations

1. **CORS Configuration**: Backend configures CORS to allow requests from `https://axolop.com`
2. **Authentication**: Supabase authentication ensures secure user sessions
3. **Network Security**: Backend server should have proper firewall configuration
4. **SSL/TLS**: Use SSL for frontend (automatic with Vercel), consider for backend access

## Testing Communication

### Local Testing
```bash
# Test backend locally
curl http://localhost:3002/health
# Should return health status of all services

# Test API endpoints
curl http://localhost:3002/api/leads
# Should return leads data (with proper authentication)
```

### Production Testing
```bash
# Test backend from external network
curl http://axolop.hopto.org:3002/health
# Should return health status of all services
```

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure `FRONTEND_URL` in backend environment variables matches your Vercel domain
2. **Connection Timeout**: Check router port forwarding configuration
3. **SSL Certificate Issues**: Backend server may need SSL certificate for production use
4. **Authentication Failures**: Verify Supabase configuration

### Verification Steps:
1. Confirm backend is running and accessible: `curl http://axolop.hopto.org:3002/health`
2. Check port forwarding on router
3. Verify firewall settings on backend server
4. Confirm environment variables are correctly set in both frontend and backend