#!/bin/bash

# Test script to verify Archon services can start properly with the CRM
echo "Starting Axolop CRM with integrated Archon services..."
echo "This will start all services in the background."

# Start all services in detached mode
docker compose up -d --quiet-pull

echo ""
echo "Services started. Checking status..."
sleep 10  # Wait a moment for services to initialize

# Show running containers
docker compose ps

echo ""
echo "To access the services:"
echo "CRM Frontend: http://localhost:3000 (if running separately)"
echo "CRM Backend: http://localhost:3002"
echo "Archon UI: http://localhost:3737"
echo "Archon API: http://localhost:8181"
echo "Archon MCP: http://localhost:8051"

echo ""
echo "To stop all services, run: docker compose down"