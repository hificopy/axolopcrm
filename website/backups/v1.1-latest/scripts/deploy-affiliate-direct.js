// Deploy affiliate schema using DATABASE_URL from .env
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

async function deploySchema() {
  console.log('🚀 Deploying affiliate database schema...\n');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ Missing DATABASE_URL in .env file');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...\n');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
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

    await client.end();

    console.log('\n🎉 Affiliate system is ready to use!');
    console.log('✨ You can now join the affiliate program from the popup\n');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\nFull error:', error);
    await client.end();
    process.exit(1);
  }
}

deploySchema();
