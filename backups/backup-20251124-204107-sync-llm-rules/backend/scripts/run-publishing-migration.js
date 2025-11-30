import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the root of the project
dotenv.config({ path: join(__dirname, '../../.env') });

// Create Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running form publishing migration...');

    // Read migration file
    const migrationPath = join(__dirname, '../db/migrations/004_add_form_publishing.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration file loaded successfully');
    console.log('⚠️  Note: This migration will be executed via Supabase SQL Editor or direct database access');
    console.log('\n' + '='.repeat(80));
    console.log('MIGRATION SQL:');
    console.log('='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\n📋 To run this migration:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to your Supabase project dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and run the SQL');
    console.log('\nOR run directly using psql if you have database access.\n');

    // Try to verify if columns exist
    console.log('🔍 Checking if migration is needed...');

    const { data: formsCheck, error: formsError } = await supabase
      .from('forms')
      .select('published_at, published_version, published_slug, publish_history')
      .limit(0);

    if (formsError && formsError.message.includes('column')) {
      console.log('✅ Migration needed - columns do not exist yet');
      console.log('\nPlease run the SQL migration via Supabase dashboard.');
    } else if (!formsError) {
      console.log('✅ Migration may already be applied - columns are accessible');
    } else {
      console.log('⚠️  Could not verify migration status:', formsError.message);
    }

    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('agency_alias')
      .limit(0);

    if (usersError && usersError.message.includes('column')) {
      console.log('✅ User migration needed - agency_alias column does not exist yet');
    } else if (!usersError) {
      console.log('✅ User migration may already be applied - agency_alias column is accessible');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
