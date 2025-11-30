#!/usr/bin/env node
/**
 * Master Schema Deployment Script
 * Deploys all missing database schemas to Supabase to fix half-baked features
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Schema files to deploy in order (dependencies matter!)
const schemaFiles = [
  // Core workflow schemas first
  { file: '../backend/db/email-workflow-schema.sql', name: 'Email Marketing Workflows', critical: true },
  { file: '../backend/db/enhanced-workflow-schema.sql', name: 'Enhanced Workflows', critical: true },

  // Feature schemas
  { file: './live-calls-schema.sql', name: 'Live Calls & Call Queue', critical: true },
  { file: './calendar-schema.sql', name: 'Calendar System', critical: false },
  { file: './enhanced-calendar-schema.sql', name: 'Enhanced Calendar', critical: false },
  { file: './second-brain-schema.sql', name: 'Second Brain', critical: true },
  { file: './affiliate-schema.sql', name: 'Affiliate System', critical: false },
  { file: './sendgrid-schema.sql', name: 'SendGrid Integration', critical: false },
  { file: './booking-links-schema.sql', name: 'Booking Links', critical: false },
];

/**
 * Execute SQL file
 */
async function executeSQLFile(filePath, schemaName) {
  try {
    const fullPath = path.join(__dirname, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Schema file not found: ${schemaName} (${filePath})`);
      return { success: false, skipped: true };
    }

    const sql = fs.readFileSync(fullPath, 'utf8');

    console.log(`\n🚀 Deploying: ${schemaName}...`);
    console.log(`   File: ${filePath}`);

    // Execute SQL using Supabase's RPC or direct query
    // Note: Supabase REST API doesn't support raw SQL execution directly
    // We need to use the SQL editor or PostgREST

    // For now, we'll use a workaround by executing via rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(err => ({
      error: err
    }));

    if (error) {
      // If exec_sql doesn't exist, we need to execute manually
      // This is a limitation - we'll print instructions instead
      console.log(`⚠️  Cannot execute directly via API: ${schemaName}`);
      console.log(`   You need to run this SQL in Supabase SQL Editor:`);
      console.log(`   Dashboard → SQL Editor → New Query`);
      console.log(`   File location: ${fullPath}\n`);
      return { success: false, manual: true, filePath: fullPath };
    }

    console.log(`✅ Successfully deployed: ${schemaName}`);
    return { success: true };

  } catch (error) {
    console.error(`❌ Error deploying ${schemaName}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main deployment function
 */
async function deployAllSchemas() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Axolop CRM - Master Schema Deployment Script        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const results = [];
  const manualDeploymentNeeded = [];

  for (const schema of schemaFiles) {
    const result = await executeSQLFile(schema.file, schema.name);
    results.push({ ...schema, ...result });

    if (result.manual) {
      manualDeploymentNeeded.push({
        name: schema.name,
        path: result.filePath,
        critical: schema.critical
      });
    }

    // Small delay between deployments
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    DEPLOYMENT SUMMARY                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && !r.manual && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const manual = results.filter(r => r.manual).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`📝 Manual Required: ${manual}`);

  if (manualDeploymentNeeded.length > 0) {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║              MANUAL DEPLOYMENT REQUIRED                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log('Due to Supabase API limitations, these schemas need to be');
    console.log('deployed manually via the Supabase Dashboard:\n');
    console.log('Steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Click "New Query"');
    console.log('5. Copy and paste the SQL from each file below:\n');

    manualDeploymentNeeded.forEach((item, index) => {
      console.log(`${index + 1}. ${item.critical ? '🔴 CRITICAL' : '🟡 Optional'}: ${item.name}`);
      console.log(`   File: ${item.path}\n`);
    });

    console.log('\n💡 TIP: You can also use the deployment helper script:');
    console.log('   node scripts/deploy-schema-to-supabase.js\n');
  }

  return { successful, failed, skipped, manual: manualDeploymentNeeded };
}

// Run deployment
deployAllSchemas()
  .then((summary) => {
    if (summary.manual.length > 0) {
      console.log('\n⚠️  Manual deployment required. See instructions above.');
      process.exit(0);
    } else if (summary.failed > 0) {
      console.log('\n❌ Some deployments failed.');
      process.exit(1);
    } else {
      console.log('\n✅ All schemas deployed successfully!');
      console.log('\n🎉 Your CRM features are now fully functional!');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n❌ Fatal error during deployment:', error);
    process.exit(1);
  });
