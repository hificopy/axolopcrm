#!/usr/bin/env node
/**
 * Comprehensive Schema Deployment Script
 * Uses Supabase connection pooler to deploy schemas
 */

import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment');
  console.error('Please ensure your .env file contains DATABASE_URL');
  process.exit(1);
}

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║     Axolop CRM - Schema Deployment via PostgreSQL       ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Schema files to deploy
const schemas = [
  { file: '../backend/db/email-workflow-schema.sql', name: 'Email Marketing Workflows', critical: true },
  { file: '../backend/db/enhanced-workflow-schema.sql', name: 'Enhanced Workflows', critical: true },
  { file: './live-calls-schema.sql', name: 'Live Calls System', critical: true },
  { file: './calendar-schema.sql', name: 'Calendar System', critical: false },
  { file: './enhanced-calendar-schema.sql', name: 'Enhanced Calendar', critical: false },
  { file: './second-brain-schema.sql', name: 'Second Brain', critical: true },
  { file: './affiliate-schema.sql', name: 'Affiliate System', critical: false },
  { file: './sendgrid-schema.sql', name: 'SendGrid Integration', critical: false },
  { file: './booking-links-schema.sql', name: 'Booking Links', critical: false },
];

async function deploySchema(client, schemaPath, schemaName, critical) {
  try {
    const fullPath = path.join(__dirname, schemaPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Skipping ${schemaName} - file not found`);
      return { success: false, skipped: true };
    }

    const sql = fs.readFileSync(fullPath, 'utf8');

    console.log(`\n🚀 Deploying: ${schemaName}`);
    console.log(`   File: ${schemaPath}`);

    await client.query(sql);

    console.log(`✅ Successfully deployed: ${schemaName}`);
    return { success: true };

  } catch (error) {
    if (critical) {
      console.error(`❌ CRITICAL: Failed to deploy ${schemaName}`);
    } else {
      console.error(`⚠️  Failed to deploy ${schemaName} (non-critical)`);
    }
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (const schema of schemas) {
      const result = await deploySchema(client, schema.file, schema.name, schema.critical);

      if (result.success) {
        successful++;
      } else if (result.skipped) {
        skipped++;
      } else {
        failed++;
      }

      // Small delay between deployments
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    DEPLOYMENT SUMMARY                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Skipped: ${skipped}`);

    if (failed > 0) {
      console.log('\n⚠️  Some schemas failed to deploy.');
      console.log('Check the error messages above for details.');
      console.log('\n💡 Alternative: Deploy manually via Supabase Dashboard');
      console.log('   https://supabase.com/dashboard → SQL Editor\n');
      process.exit(1);
    } else {
      console.log('\n🎉 All schemas deployed successfully!');
      console.log('✅ Your CRM features are now fully functional!\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('\nPlease check your DATABASE_URL in the .env file');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
