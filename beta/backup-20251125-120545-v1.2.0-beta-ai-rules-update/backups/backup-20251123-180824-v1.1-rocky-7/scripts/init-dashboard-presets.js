#!/usr/bin/env node

/**
 * Initialize Dashboard Presets Table
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Use pooler connection
const connectionString = process.env.DATABASE_URL?.replace('?pgbouncer=true', '') ||
  'postgresql://postgres.fuclpfhitgwugxogxkmw:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({ connectionString });

async function initTable() {
  const client = await pool.connect();

  try {
    console.log('🚀 Initializing dashboard_presets table...\n');

    // Read the SQL file
    const schemaPath = path.join(__dirname, 'dashboard-presets-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the SQL
    await client.query(sql);

    console.log('✅ dashboard_presets table created successfully!');

    // Verify the table
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'dashboard_presets'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Table verified in database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initTable();
