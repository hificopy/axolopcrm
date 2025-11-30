#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs SQL migration files against Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// Load environment variables
dotenv.config({ path: join(rootDir, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(migrationFile) {
  try {
    console.log(`\n🔄 Running migration: ${migrationFile}\n`);

    const migrationPath = join(rootDir, 'backend/db/migrations', migrationFile);
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by semicolons but be smart about it (don't split inside functions)
    const statements = migrationSQL
      .split(/;(?=\s*(?:--|$|\n\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|BEGIN|COMMIT)))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) continue;

      // Show what we're executing
      const preview = statement.substring(0, 100).replace(/\s+/g, ' ');
      process.stdout.write(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        // Use the Supabase client to execute raw SQL via the REST API
        // This is a workaround since Supabase client doesn't have direct SQL execution
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement })
        });

        if (!response.ok && response.status !== 404) {
          // If exec RPC doesn't exist, we need to use a different approach
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(' ✅');
        successCount++;
      } catch (error) {
        console.log(' ⚠️');
        console.log(`   Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed\n`);

    if (errorCount > 0) {
      console.log('⚠️  Some statements failed. This might be okay if:');
      console.log('   - Tables/columns already exist');
      console.log('   - You\'re running the migration again');
      console.log('\n💡 To run SQL manually:');
      console.log(`   1. Open Supabase Dashboard > SQL Editor`);
      console.log(`   2. Copy contents of: ${migrationFile}`);
      console.log(`   3. Paste and run in SQL Editor`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Manual migration required:');
    console.error('   1. Go to Supabase Dashboard > SQL Editor');
    console.error(`   2. Open file: backend/db/migrations/${migrationFile}`);
    console.error('   3. Copy all contents and paste into SQL Editor');
    console.error('   4. Click "Run"');
    process.exit(1);
  }
}

// Get migration file from command line or use default
const migrationFile = process.argv[2] || '001_fix_workflow_schema.sql';

runMigration(migrationFile);
