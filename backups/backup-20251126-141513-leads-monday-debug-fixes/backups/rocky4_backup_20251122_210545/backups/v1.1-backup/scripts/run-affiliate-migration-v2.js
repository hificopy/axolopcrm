// Run affiliate database migration using Supabase client
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function runMigration() {
  console.log('🚀 Starting affiliate database migration...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`📊 Supabase URL: ${supabaseUrl}`);
  console.log('🔗 Connecting to Supabase...\n');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read SQL file
    const sqlFilePath = join(__dirname, 'affiliate-schema.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');

    console.log('📝 SQL file loaded');
    console.log('⚠️  Note: Supabase JS client cannot execute raw SQL directly\n');
    console.log('📋 Here\'s what you need to do:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new');
    console.log('2. Copy the SQL below');
    console.log('3. Paste it into the Supabase SQL Editor');
    console.log('4. Click "Run"\n');
    console.log('=' .repeat(80));
    console.log('\n' + sqlContent + '\n');
    console.log('=' .repeat(80));
    console.log('\n✅ Copy the SQL above and run it in Supabase SQL Editor\n');
    console.log('🔗 Direct link: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
