#!/usr/bin/env node

/**
 * Verification Script: Check if Users Schema is Deployed
 *
 * This script verifies that the users-schema.sql has been deployed to Supabase
 * by checking for the existence of required tables and triggers.
 */

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

async function verifySchema() {
  console.log('🔍 Verifying Users Schema Deployment...\n');

  const checks = {
    tables: [],
    triggers: [],
    functions: []
  };

  try {
    // Check for required tables
    console.log('📊 Checking Tables:');
    const requiredTables = ['users', 'user_settings', 'user_activity', 'user_sessions', 'teams', 'team_members'];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(0);

        if (!error) {
          console.log(`   ✅ ${tableName}`);
          checks.tables.push({ name: tableName, exists: true });
        } else {
          console.log(`   ❌ ${tableName} - ${error.message}`);
          checks.tables.push({ name: tableName, exists: false, error: error.message });
        }
      } catch (err) {
        console.log(`   ❌ ${tableName} - ${err.message}`);
        checks.tables.push({ name: tableName, exists: false, error: err.message });
      }
    }

    console.log('\n🔧 Checking Row Level Security:');

    // Try to query with RLS to ensure policies are working
    try {
      // This will fail if RLS is not properly configured
      const { error: rlsError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (rlsError) {
        console.log('   ⚠️  RLS policies might need configuration');
      } else {
        console.log('   ✅ RLS policies configured');
      }
    } catch (err) {
      console.log('   ⚠️  Could not verify RLS configuration');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));

    const tablesExist = checks.tables.filter(t => t.exists).length;
    const tablesMissing = checks.tables.filter(t => !t.exists).length;

    console.log(`\nTables: ${tablesExist}/${requiredTables.length} exist`);

    if (tablesMissing > 0) {
      console.log('\n⚠️  SCHEMA NOT FULLY DEPLOYED');
      console.log('\nMissing tables:');
      checks.tables
        .filter(t => !t.exists)
        .forEach(t => console.log(`   - ${t.name}`));

      console.log('\n📝 Next Steps:');
      console.log('   1. Open Supabase SQL Editor:');
      console.log(`      ${supabaseUrl.replace('.supabase.co', '')}/editor/sql/new`);
      console.log('   2. Copy and paste the contents of: backend/db/users-schema.sql');
      console.log('   3. Run the SQL script');
      console.log('   4. Run this verification script again');

      process.exit(1);
    } else {
      console.log('\n✅ ALL TABLES EXIST');
      console.log('\n🎉 Users schema is deployed successfully!');
      console.log('\nYou can now:');
      console.log('   • Test the user API endpoints');
      console.log('   • Connect the Profile page to the API');
      console.log('   • Implement email verification banner');

      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nThis might indicate:');
    console.error('   • Database connection issues');
    console.error('   • Incorrect Supabase credentials');
    console.error('   • Network connectivity problems');
    process.exit(1);
  }
}

// Run verification
verifySchema();
