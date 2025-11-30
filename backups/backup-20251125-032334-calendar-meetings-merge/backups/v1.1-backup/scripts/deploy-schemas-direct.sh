#!/bin/bash

###############################################################################
# Direct Schema Deployment Script
# Deploys all missing database schemas to Supabase via direct PostgreSQL connection
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in environment${NC}"
    echo "Please set DATABASE_URL in your .env file"
    exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Axolop CRM - Direct Schema Deployment Script        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

# Function to deploy a schema file
deploy_schema() {
    local file=$1
    local name=$2
    local critical=$3

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  Skipping $name - file not found: $file${NC}"
        return 1
    fi

    echo -e "\n${BLUE}🚀 Deploying: $name${NC}"
    echo -e "   File: $file"

    if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Successfully deployed: $name${NC}"
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}❌ CRITICAL: Failed to deploy $name${NC}"
            echo -e "${RED}   This feature will not work without this schema${NC}"
        else
            echo -e "${YELLOW}⚠️  Failed to deploy $name (non-critical)${NC}"
        fi
        return 1
    fi
}

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql is not installed${NC}"
    echo -e "${YELLOW}Installing PostgreSQL client...${NC}"

    # Try to install psql based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Detected macOS"
        if command -v brew &> /dev/null; then
            brew install postgresql
        else
            echo -e "${RED}Please install Homebrew first: https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y postgresql-client
    else
        echo -e "${RED}Unsupported OS. Please install PostgreSQL client manually.${NC}"
        exit 1
    fi
fi

# Deploy schemas in order
SUCCESS_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

echo -e "\n${BLUE}Starting schema deployment...${NC}\n"

# Email Marketing & Workflows (CRITICAL)
deploy_schema "../backend/db/email-workflow-schema.sql" "Email Marketing Workflows" "true" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))
deploy_schema "../backend/db/enhanced-workflow-schema.sql" "Enhanced Workflows" "true" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# Calls System (CRITICAL)
deploy_schema "./live-calls-schema.sql" "Live Calls & Call Queue" "true" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# Calendar System
deploy_schema "./calendar-schema.sql" "Calendar System" "false" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))
deploy_schema "./enhanced-calendar-schema.sql" "Enhanced Calendar" "false" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# Second Brain (CRITICAL)
deploy_schema "./second-brain-schema.sql" "Second Brain" "true" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# Affiliate System
deploy_schema "./affiliate-schema.sql" "Affiliate System" "false" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# SendGrid Integration
deploy_schema "./sendgrid-schema.sql" "SendGrid Integration" "false" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# Booking Links
deploy_schema "./booking-links-schema.sql" "Booking Links" "false" && ((SUCCESS_COUNT++)) || ((FAILED_COUNT++))

# Print summary
echo -e "\n${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    DEPLOYMENT SUMMARY                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ Successful: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Failed: $FAILED_COUNT${NC}"

if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Some schemas failed to deploy.${NC}"
    echo -e "${YELLOW}Check the error messages above for details.${NC}"
    echo -e "\n${BLUE}💡 TIP: You can also deploy manually via Supabase Dashboard:${NC}"
    echo -e "   1. Go to https://supabase.com/dashboard"
    echo -e "   2. Select your project"
    echo -e "   3. Go to SQL Editor"
    echo -e "   4. Copy and paste the SQL from the failed files"
    exit 1
else
    echo -e "\n${GREEN}🎉 All schemas deployed successfully!${NC}"
    echo -e "${GREEN}Your CRM features are now fully functional!${NC}"
    exit 0
fi
