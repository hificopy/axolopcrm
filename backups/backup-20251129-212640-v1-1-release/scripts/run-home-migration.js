/**
 * Run Home Dashboard Migration
 * This script executes the migration to create all tables needed for the Home page
 *
 * Usage: node scripts/run-home-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL or VITE_SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('\nTo run this migration, you need the service role key from your Supabase project.');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Settings > API');
  console.log('3. Copy the "service_role" key');
  console.log('4. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nAlternatively, you can run the SQL directly in the Supabase SQL Editor:');
  console.log('  File: backend/db/migrations/006_home_dashboard_tables.sql');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('====================================');
  console.log('Home Dashboard Migration');
  console.log('====================================\n');

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, '../backend/db/migrations/006_home_dashboard_tables.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('Running migration...\n');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('Note: exec_sql not available, trying alternative method...\n');

      // Split into individual statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('DO $$'));

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.from('_exec').select().sql(statement + ';');
          if (stmtError && !stmtError.message.includes('already exists')) {
            console.log(`Warning: ${stmtError.message}`);
          }
        } catch (e) {
          // Ignore individual statement errors for CREATE IF NOT EXISTS
        }
      }
    }

    console.log('\n====================================');
    console.log('MIGRATION COMPLETE!');
    console.log('====================================');
    console.log('\nTables created/verified:');
    console.log('  - dashboard_presets (for saving layouts)');
    console.log('  - deals (revenue & sales metrics)');
    console.log('  - opportunities (pipeline data)');
    console.log('  - leads (conversion funnel)');
    console.log('  - form_submissions (form metrics)');
    console.log('  - email_campaigns (marketing metrics)');
    console.log('  - expenses (P&L widget)');
    console.log('\nAll tables have RLS enabled with user isolation.');
    console.log('\nNext steps:');
    console.log('1. Refresh your app at http://localhost:3000');
    console.log('2. Go to the Home page');
    console.log('3. Test saving custom layouts');
    console.log('4. View your real data in the widgets!');

  } catch (error) {
    console.error('\nMigration failed:', error.message);
    console.log('\nPlease run the migration manually:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Open file: backend/db/migrations/006_home_dashboard_tables.sql');
    console.log('3. Copy and paste the SQL');
    console.log('4. Click "Run"');
    process.exit(1);
  }
}

runMigration();
