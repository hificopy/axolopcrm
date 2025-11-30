#!/usr/bin/env node
/**
 * Script to help deploy database schema to Supabase
 * This script provides instructions for deploying the database schema manually via the Supabase dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(60));
console.log('AXOLOP CRM - DATABASE SCHEMA DEPLOYMENT INSTRUCTIONS');
console.log('='.repeat(60));

// Read the database schema files
const databaseFixSqlPath = path.join(__dirname, '../DATABASE_FIX.sql');
const supabaseCompleteSetupSqlPath = path.join(__dirname, '../supabase-complete-setup.sql');

try {
  const databaseFixSql = fs.readFileSync(databaseFixSqlPath, 'utf8');
  const supabaseCompleteSetupSql = fs.readFileSync(supabaseCompleteSetupSqlPath, 'utf8');

  console.log('\n📋 INSTRUCTIONS:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new');
  console.log('2. Copy the SQL content from one of the files below and paste it into the SQL editor');
  console.log('3. Click "Run" to execute the schema changes');
  console.log('');

  console.log('📄 DATABASE_FIX.SQL CONTENT:');
  console.log('-'.repeat(40));
  console.log(databaseFixSql);
  console.log('-'.repeat(40));
  
  console.log('\n📄 SUPABASE-COMPLETE-SETUP.SQL CONTENT:');
  console.log('-'.repeat(40));
  console.log(supabaseCompleteSetupSql);
  console.log('-'.repeat(40));

  console.log('\n✅ Once deployed, restart your backend server:');
  console.log('   npm run dev:backend');
  
  console.log('\n🔍 Verify the tables exist by checking these endpoints:');
  console.log('   - Health check: http://localhost:3002/health');
  console.log('   - Forms: http://localhost:3002/api/forms (should return empty array, not 404)');
  console.log('   - Campaigns: http://localhost:3002/api/email-marketing/campaigns');
  console.log('   - Workflows: http://localhost:3002/api/workflows');

} catch (error) {
  console.error('❌ Error reading SQL files:', error.message);
  process.exit(1);
}

console.log('');
console.log('='.repeat(60));
console.log('DATABASE SCHEMA DEPLOYMENT INSTRUCTIONS COMPLETE');
console.log('='.repeat(60));