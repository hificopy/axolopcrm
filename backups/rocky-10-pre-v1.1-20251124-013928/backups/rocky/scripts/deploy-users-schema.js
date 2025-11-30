#!/usr/bin/env node

/**
 * Automated Schema Deployment Script
 *
 * This script automatically deploys the users-schema.sql to Supabase
 * using the Supabase Management API.
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deploySchema() {
  console.log('🚀 Starting Users Schema Deployment...\n');

  try {
    // Read the SQL schema file
    const schemaPath = join(__dirname, '../backend/db/users-schema.sql');
    console.log('📄 Reading schema file:', schemaPath);

    const schemaSQL = readFileSync(schemaPath, 'utf-8');
    console.log(`   ✅ Schema file loaded (${schemaSQL.length} characters)\n`);

    // Note: Supabase JS client doesn't support executing raw SQL directly
    // We need to use the REST API or execute via the SQL Editor
    console.log('⚠️  MANUAL DEPLOYMENT REQUIRED\n');
    console.log('The Supabase JavaScript client does not support executing raw SQL files.');
    console.log('You need to deploy the schema manually using the Supabase SQL Editor.\n');

    console.log('📋 DEPLOYMENT INSTRUCTIONS:');
    console.log('='.repeat(60));
    console.log('\n1. Open Supabase SQL Editor:');
    console.log(`   ${supabaseUrl.replace('.supabase.co', '')}/editor/sql/new`);
    console.log('\n2. Copy the SQL from:');
    console.log('   backend/db/users-schema.sql');
    console.log('\n3. Paste into SQL Editor and click Run');
    console.log('\n4. Verify deployment:');
    console.log('   node scripts/verify-users-schema.js');
    console.log('\n' + '='.repeat(60));

    // Offer to open the file for easy copying
    console.log('\n📝 SQL Schema Preview (first 500 chars):');
    console.log('─'.repeat(60));
    console.log(schemaSQL.substring(0, 500) + '...');
    console.log('─'.repeat(60));

    console.log('\n💡 TIP: You can copy the entire schema with:');
    console.log('   cat backend/db/users-schema.sql | pbcopy  # macOS');
    console.log('   cat backend/db/users-schema.sql | xclip   # Linux');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
deploySchema();
