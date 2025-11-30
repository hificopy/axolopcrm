// Verify if affiliate tables exist in Supabase
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTables() {
  console.log('🔍 Checking affiliate tables in Supabase...\n');

  try {
    // Try to query each table
    const tables = ['affiliates', 'affiliate_clicks', 'affiliate_referrals', 'affiliate_commissions', 'affiliate_payouts', 'affiliate_materials'];

    let allTablesExist = true;

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ Table "${table}" does NOT exist or is not accessible`);
        console.log(`   Error: ${error.message}\n`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }

    if (allTablesExist) {
      console.log('\n🎉 All affiliate tables exist! The affiliate system should work.\n');
    } else {
      console.log('\n⚠️  Some tables are missing. You need to run the affiliate schema SQL in Supabase.\n');
      console.log('📝 Steps to fix:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/fuclpfhitgwugxogxkmw/sql/new');
      console.log('   2. Copy the contents of scripts/affiliate-schema.sql');
      console.log('   3. Paste it into the SQL Editor and click "Run"\n');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

verifyTables();
