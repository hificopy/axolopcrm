import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initializeWorkflowDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../backend/db/workflow-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing workflow schema SQL...');
    await pool.query(schemaSql);

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

  } catch (error) {
    console.error('❌ Error initializing workflow database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeWorkflowDatabase();
