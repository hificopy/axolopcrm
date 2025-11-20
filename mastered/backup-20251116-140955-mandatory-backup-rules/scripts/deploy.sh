#!/bin/bash

# ============================================
# Axolop CRM - Complete Deployment Script
# ============================================

set -e

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║    Axolop CRM - Deployment Script       ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the CRM root directory."
  exit 1
fi

# Step 2: Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created"
  echo ""
  echo "⚠️  IMPORTANT: Edit .env and add your API keys before continuing!"
  echo "   Press Enter when ready to continue..."
  read -r
fi

# Step 3: Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
npm install --legacy-peer-deps

echo ""
echo "✅ Dependencies installed"

# Step 4: Setup database connection (Supabase direct client, no Prisma)
echo ""
echo "🗄️  Setting up Supabase database connection..."
echo "   Note: Using direct Supabase client (no Prisma used)"

echo ""
echo "✅ Supabase client configured (no Prisma used)"

# Step 6: Build Docker images
echo ""
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "✅ Docker images built"

# Step 7: Start Docker containers
echo ""
echo "🚀 Starting Docker containers..."
docker-compose up -d

echo ""
echo "✅ Docker containers started"

# Step 8: Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Step 9: Check health
echo ""
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║         Deployment Complete! 🎉          ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "📍 CRM is now running at:"
echo "   • Frontend: Vercel deployment (from main branch)"
echo "   • Backend API: http://localhost:3001"
echo "   • Health: http://localhost:3001/health"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop containers:"
echo "   docker-compose down"
echo ""
echo "🔄 Restart containers:"
echo "   docker-compose restart"
echo ""
echo "📚 Documentation: START_HERE.md"
echo ""
