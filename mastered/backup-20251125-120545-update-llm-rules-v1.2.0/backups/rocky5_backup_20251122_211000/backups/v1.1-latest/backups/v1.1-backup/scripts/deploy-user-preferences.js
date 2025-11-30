import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployUserPreferencesSchema() {
  console.log('🚀 Deploying user preferences schema to Supabase...\n');

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'user-preferences-schema.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📝 Executing SQL schema...');

    // Execute the SQL using Supabase RPC or direct query
    // Note: We need to split by statements and execute them one by one
    // because Supabase doesn't support multi-statement queries via the JS client

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, we need to use the REST API
      console.log('⚠️  exec_sql RPC not found, using direct SQL execution...');

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.rpc('query', {
            query: statement + ';'
          });

          if (stmtError) {
            console.error(`❌ Error executing statement: ${stmtError.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Error: ${err.message}`);
          errorCount++;
        }
      }

      console.log(`\n✅ Deployment complete: ${successCount} statements executed, ${errorCount} errors`);
    } else {
      console.log('✅ Schema deployed successfully!');
      console.log(data);
    }

    // Verify the tables were created
    console.log('\n🔍 Verifying tables...');

    const { data: tables, error: tablesError } = await supabase
      .from('user_todos')
      .select('id')
      .limit(1);

    if (tablesError && tablesError.code === '42P01') {
      console.log('⚠️  user_todos table not found. Manual SQL execution may be required.');
      console.log('\n📋 Please execute the SQL manually in Supabase SQL Editor:');
      console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
    } else {
      console.log('✅ user_todos table verified');
    }

    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);

    if (prefsError && prefsError.code === '42P01') {
      console.log('⚠️  user_preferences table not found. Manual SQL execution may be required.');
    } else {
      console.log('✅ user_preferences table verified');
    }

    console.log('\n✨ Deployment process complete!');
    console.log('\nNext steps:');
    console.log('1. Verify tables in Supabase Dashboard');
    console.log('2. Check RLS policies are enabled');
    console.log('3. Test with frontend application');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployUserPreferencesSchema();
