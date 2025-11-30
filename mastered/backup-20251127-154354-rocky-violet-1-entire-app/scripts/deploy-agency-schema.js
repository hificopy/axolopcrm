#!/usr/bin/env node

/**
 * Deploy Agency Schema to Supabase
 * This script creates the agencies, agency_members, and user_agency_preferences tables
 * along with all RLS policies and RPC functions
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('   Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deploySchema() {
  console.log('🚀 Starting agency schema deployment...\n');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../backend/db/agency-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema file loaded');
    console.log(`   File: ${schemaPath}\n`);

    // Split schema into individual statements (basic splitting)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comment-only statements
      if (statement.trim().startsWith('--')) {
        continue;
      }

      try {
        // Extract a brief description from the statement
        const firstLine = statement.split('\n')[0].substring(0, 80);
        process.stdout.write(`[${i + 1}/${statements.length}] Executing: ${firstLine}...`);

        const { data, error } = await supabase.rpc('exec_sql', { query: statement });

        if (error) {
          // Some errors are acceptable (like "already exists")
          if (
            error.message.includes('already exists') ||
            error.message.includes('does not exist')
          ) {
            console.log(' ⚠️  (skipped - already exists)');
          } else {
            console.log(` ❌`);
            console.error(`   Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(' ✅');
          successCount++;
        }
      } catch (err) {
        console.log(` ❌`);
        console.error(`   Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✨ Deployment complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    if (errorCount === 0) {
      console.log('🎉 All agency tables and functions created successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Verify tables in Supabase dashboard');
      console.log('   2. Test agency creation in the app');
      console.log('   3. Check RLS policies are working\n');
    } else {
      console.log('⚠️  Some errors occurred. Please check the Supabase dashboard');
      console.log('   and verify that all tables and functions were created.\n');
    }

  } catch (error) {
    console.error('❌ Fatal error during deployment:');
    console.error(error);
    process.exit(1);
  }
}

// Alternative: Use Supabase Management API directly
async function deploySchemaDirectly() {
  console.log('🚀 Deploying agency schema directly to Supabase...\n');

  try {
    const schemaPath = path.join(__dirname, '../backend/db/agency-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing SQL schema...');

    // For direct execution, we'll use a different approach
    // Split by statement and execute each one
    const statements = schema
      .split(/;\s*$/gm)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Execute using raw SQL via Supabase
          await supabase
            .from('_exec') // This won't work - just a placeholder
            .select('*')
            .single();
        } catch (err) {
          // Expected to fail - we need to use management API
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run deployment
console.log('🏗️  Axolop CRM - Agency Schema Deployment\n');
console.log('⚠️  NOTE: This script requires direct database access.');
console.log('   If this fails, please run the SQL file directly in Supabase SQL Editor.\n');

deploySchema()
  .then(() => {
    console.log('✅ Deployment script finished');
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
