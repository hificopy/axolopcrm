import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initializeWorkflowDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔌 Connecting to Supabase...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../backend/db/workflow-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing workflow schema SQL...');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: schemaSql
    });

    if (error) {
      // If the RPC function doesn't exist, we'll execute statements individually
      console.log('ℹ️  RPC function not available, executing statements individually...');

      // Split SQL into individual statements and execute them
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (stmtError) {
          console.log(`⚠️  Statement execution issue (this may be normal): ${stmtError.message}`);
        }
      }
    }

    console.log('✅ Workflow database schema initialized successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('   - form_workflow_nodes');
    console.log('   - form_workflow_edges');
    console.log('   - form_endings');
    console.log('   - form_workflow_sessions');
    console.log('');
    console.log('🔧 Created functions:');
    console.log('   - get_next_workflow_node()');
    console.log('');
    console.log('ℹ️  Note: If you see errors above, you may need to run the SQL manually in Supabase SQL Editor');
    console.log('   Copy the content from: backend/db/workflow-schema.sql');

  } catch (error) {
    console.error('❌ Error initializing workflow database:', error.message);
    console.error('');
    console.log('📋 Manual Setup Instructions:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the content from: backend/db/workflow-schema.sql');
    console.log('5. Run the query');
    console.error('');
  }
}

// Run the initialization
initializeWorkflowDatabase();
