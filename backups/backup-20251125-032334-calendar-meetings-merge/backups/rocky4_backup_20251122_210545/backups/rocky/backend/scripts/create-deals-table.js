import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDealsTable() {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     Creating Deals Table in Supabase          ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Check if deals table exists
    console.log('🔍 Checking for existing deals table...');
    const { data: existingDeals, error: checkError } = await supabase
      .from('deals')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Deals table already exists!');
      console.log('');
      return;
    }

    console.log('⚠️  Deals table does not exist. Creating it now...');
    console.log('');
    console.log('📋 Note: The table creation must be done via Supabase SQL Editor.');
    console.log('');
    console.log('Please follow these steps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of create-deals-table.sql');
    console.log('4. Execute the SQL');
    console.log('');
    console.log('SQL file location:');
    console.log('   ' + path.join(__dirname, '..', '..', 'create-deals-table.sql'));
    console.log('');

    // Read the SQL file and display it
    const sqlPath = path.join(__dirname, '..', '..', 'create-deals-table.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║  SQL to Execute:                               ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log('');
      console.log(sqlContent);
      console.log('');
    }

    console.log('After creating the table, run this script again to verify.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDealsTable();
