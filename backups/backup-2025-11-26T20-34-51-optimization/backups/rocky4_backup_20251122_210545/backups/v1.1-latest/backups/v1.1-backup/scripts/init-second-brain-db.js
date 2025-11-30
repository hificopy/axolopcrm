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

async function initializeSecondBrainDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'second-brain-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing schema SQL...');
    await pool.query(schemaSql);

    console.log('✅ Second Brain database schema initialized successfully!');
    console.log('');
    console.log('📊 Created tables:');
    console.log('   Logic View:');
    console.log('     - second_brain_nodes');
    console.log('     - second_brain_connections');
    console.log('     - second_brain_crm_links');
    console.log('     - second_brain_activity');
    console.log('');
    console.log('   Maps View:');
    console.log('     - second_brain_maps');
    console.log('     - second_brain_map_objects');
    console.log('     - second_brain_map_connectors');
    console.log('');
    console.log('   Notes View:');
    console.log('     - second_brain_notes');
    console.log('     - second_brain_note_links');
    console.log('     - second_brain_note_comments');
    console.log('');
    console.log('   Collaboration:');
    console.log('     - second_brain_workspaces');
    console.log('     - second_brain_workspace_members');
    console.log('     - second_brain_presence');
    console.log('');
    console.log('🔒 RLS policies enabled for data isolation');
    console.log('🔍 Full-text search indexes created');
    console.log('⚡ Performance indexes optimized');
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
initializeSecondBrainDatabase();
