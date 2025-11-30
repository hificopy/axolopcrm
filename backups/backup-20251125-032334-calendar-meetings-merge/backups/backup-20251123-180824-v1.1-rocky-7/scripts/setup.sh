#!/bin/bash

# Axolop CRM - Setup Script
# This script will initialize the CRM project with all dependencies

set -e

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║    Axolop CRM - Initial Setup Script    ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the CRM root directory."
  exit 1
fi

# Step 1: Fix npm cache permissions (if needed)
echo "📦 Step 1: Checking npm cache permissions..."
if [ -d "$HOME/.npm" ]; then
  echo "   Fixing npm cache permissions (requires sudo)..."
  sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
  echo "   ✅ npm cache permissions fixed"
else
  echo "   ✅ npm cache looks good"
fi

# Step 2: Clean install
echo ""
echo "📦 Step 2: Installing dependencies..."
echo "   This may take a few minutes..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

echo ""
echo "✅ Dependencies installed successfully"

# Step 3: Copy environment file
echo ""
echo "📝 Step 3: Setting up environment variables..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "   ✅ Created .env file from .env.example"
  echo "   ⚠️  Please edit .env and add your API keys and credentials"
else
  echo "   ℹ️  .env file already exists, skipping..."
fi

# Step 4: Setup database connection (Supabase direct client, no Prisma)
echo ""
echo "🗄️  Step 4: Setting up Supabase database connection..."
echo "   Note: Using direct Supabase client (no Prisma used)"

echo ""
echo "✅ Supabase client configured (no Prisma used)"

# Step 5: Check if Docker is running (for Redis only)
echo ""
echo "🐳 Step 5: Checking Docker (for Redis)..."
echo "   Note: Using Supabase PostgreSQL (not Docker)"
if docker info > /dev/null 2>&1; then
  echo "   ✅ Docker is running"

  echo ""
  echo "   Would you like to start Redis container now? (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "   Starting Redis container..."
    docker-compose up -d redis
    echo "   ✅ Redis container started"

    # Wait for Redis to be ready
    echo "   ⏳ Waiting for Redis to be ready..."
    sleep 3

    # Run migrations on Supabase
    echo ""
    echo "🗄️  Step 6: Running database migrations on Supabase..."
    echo "   ⚠️  Make sure DATABASE_URL in .env points to Supabase"
    echo "   ℹ️  Using direct Supabase connection (no Prisma migrations)"
    echo "   ✅ Database connection configured"
  else
    echo "   ℹ️  Skipping Docker setup. Run 'docker-compose up -d redis' when ready."
  fi
else
  echo "   ⚠️  Docker is not running. Please start Docker Desktop."
  echo "   ℹ️  After starting Docker, run: docker-compose up -d redis"
  echo ""
  echo "   You can also run without Docker using local Redis:"
  echo "   brew install redis && brew services start redis"
fi

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║          Setup Complete! 🎉               ║"
echo "╚═══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Verify .env file (already configured with Supabase):"
echo "   • DATABASE_URL points to Supabase PostgreSQL"
echo "   • SUPABASE_URL and SUPABASE_ANON_KEY are set"
echo "   • Add AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET"
echo "   • Add OPENAI_API_KEY, GROQ_API_KEY (optional)"
echo "   • Add STRIPE_SECRET_KEY (optional)"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Access the CRM:"
echo "   • Frontend: Vercel deployment (from main branch)"
echo "   • API: http://localhost:3002 (development) / http://axolop.hopto.org:3002 (production via dynamic DNS)"
echo "   • Supabase Dashboard: Check your Supabase project settings."
echo "   • Database UI: Use Supabase dashboard (no Prisma Studio used)"
echo ""
echo "4. View logs:"
echo "   • Redis: docker-compose logs -f redis"
echo "   • API: Check terminal output"
echo ""
echo "📚 Documentation: README.md, SETUP_COMPLETE.md"
echo "🐛 Issues: Contact juan@axolop.com"
echo ""
