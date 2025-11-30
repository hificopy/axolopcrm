# SSL Certificate Setup for Axolop CRM

This document explains how to set up SSL certificates to enable HTTPS access to the backend API.

## Current Architecture

- Frontend: Hosted on Vercel (https://axolop.com)
- Backend: Self-hosted on personal server (originally http://axolop.hopto.org:3002)
- SSL is now terminated at the nginx reverse proxy level

## Setup Instructions

### Option 1: Self-signed certificates (for testing/development)

1. Generate SSL certificates:
   ```bash
   ./generate-ssl-certs.sh
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

### Option 2: Production certificates (recommended)

1. Obtain SSL certificates from a Certificate Authority (CA) like Let's Encrypt:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx  # On Ubuntu/Debian
   sudo certbot --nginx -d axolop.hopto.org
   ```

2. Copy the certificates to the ssl directory:
   ```bash
   mkdir -p ssl
   sudo cp /etc/letsencrypt/live/axolop.hopto.org/fullchain.pem ssl/axolop.hopto.org.crt
   sudo cp /etc/letsencrypt/live/axolop.hopto.org/privkey.pem ssl/axolop.hopto.org.key
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

## Updated Architecture

With this setup:
- Port 3002 is now handled by the nginx reverse proxy with SSL termination
- The backend service still runs on HTTP internally (accessible via http://backend:3002 inside Docker)
- External HTTPS requests are decrypted at nginx and forwarded as HTTP to the backend
- This allows access to https://axolop.hopto.org:3002/health directly with SSL

## Migration from old setup

If you had the old setup running, you need to:
1. Stop the current services: `docker-compose down`
2. Generate certificates using the script above
3. Start the new services: `docker-compose up -d`

## Verification

After setup, you can test:
- HTTPS health check: `curl -k https://axolop.hopto.org:3002/health`
- HTTP will redirect to HTTPS: `curl -I http://axolop.hopto.org:3002/health`

The system will now properly handle HTTPS requests at https://axolop.hopto.org:3002 while maintaining the internal HTTP communication between services.