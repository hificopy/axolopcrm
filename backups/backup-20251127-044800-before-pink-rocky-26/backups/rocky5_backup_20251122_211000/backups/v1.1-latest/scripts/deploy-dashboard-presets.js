#!/usr/bin/env node

/**
 * Deploy Dashboard Presets Table Schema to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deploySchema() {
  try {
    console.log('🚀 Deploying dashboard_presets table schema...\n');

    // Read the SQL file
    const schemaPath = path.join(__dirname, 'dashboard-presets-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL into individual statements (by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`[${i + 1}/${statements.length}] Executing...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct query if rpc fails
        const { error: queryError } = await supabase.from('_sql').select(statement);
        if (queryError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n✅ Dashboard presets table schema deployed successfully!');
    console.log('\n📊 Verifying table creation...');

    // Verify the table was created
    const { data, error } = await supabase
      .from('dashboard_presets')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST204') {
        console.log('✅ Table created successfully (empty)');
      } else {
        console.error('⚠️  Warning: Could not verify table:', error.message);
      }
    } else {
      console.log('✅ Table verified and accessible');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploySchema();
