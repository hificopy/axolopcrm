// Run affiliate database migration
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function runMigration() {
  console.log('🚀 Starting affiliate database migration...\n');

  // Extract database credentials from Supabase URL
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Parse Supabase URL to get database connection details
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  // Construct direct database URL
  const databaseUrl = `postgresql://postgres.${projectRef}:${supabaseServiceKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

  console.log(`📊 Project Reference: ${projectRef}`);
  console.log('🔗 Connecting to database...\n');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful\n');

    // Read SQL file
    const sqlFilePath = join(__dirname, 'affiliate-schema.sql');
    const sql = readFileSync(sqlFilePath, 'utf8');

    console.log('📝 Executing SQL migration...');
    console.log('=' .repeat(50));

    // Execute the SQL
    await client.query(sql);

    console.log('=' .repeat(50));
    console.log('\n✅ Migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE 'affiliate%'
      ORDER BY tablename
    `);

    if (result.rows.length > 0) {
      console.log('✅ Created tables:');
      result.rows.forEach(row => {
        console.log(`   - ${row.tablename}`);
      });
    }

    // Check for sample data
    const materialsCount = await client.query('SELECT COUNT(*) FROM affiliate_materials');
    console.log(`\n📚 Marketing materials loaded: ${materialsCount.rows[0].count}`);

    client.release();
    await pool.end();

    console.log('\n🎉 Affiliate system is ready to use!');
    console.log('✨ You can now join the affiliate program from the popup\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
