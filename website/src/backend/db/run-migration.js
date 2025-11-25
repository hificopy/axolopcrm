import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(migrationFile) {
  console.log(`📂 Running migration: ${migrationFile}`);

  try {
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    // Note: Supabase client doesn't support raw SQL execution
    // We'll need to use the REST API or pg library
    console.log('⚠️  Migration file created. Please run it manually in Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql/new`);
    console.log('');
    console.log('Or run using psql:');
    console.log(`   psql "${process.env.DATABASE_URL}" < ${migrationFile}`);
    console.log('');
    console.log('Migration SQL saved to: ' + migrationFile);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
const migrationPath = path.join(__dirname, 'migrations', '001_fix_workflow_schema.sql');
runMigration(migrationPath);
