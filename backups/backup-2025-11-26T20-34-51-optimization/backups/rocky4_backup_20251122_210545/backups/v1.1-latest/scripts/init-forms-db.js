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

async function initializeFormsDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../backend/db/forms-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing schema SQL...');
    await pool.query(schemaSql);

    console.log('✅ Forms database schema initialized successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('   - forms');
    console.log('   - form_responses');
    console.log('   - form_analytics');
    console.log('   - question_analytics');
    console.log('   - form_integrations');
    console.log('');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeFormsDatabase();
