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

async function initializeBookingDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('📅 Initializing booking links database...\n');
    console.log('🔌 Connecting to database...');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'booking-links-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📝 Executing booking links schema SQL...');
    await pool.query(schemaSql);

    console.log('✅ Booking links database schema initialized successfully!\n');
    console.log('📊 Created tables:');
    console.log('   - booking_links');
    console.log('   - booking_link_hosts');
    console.log('   - booking_link_questions');
    console.log('   - booking_link_disqualification_rules');
    console.log('   - booking_link_routing_rules');
    console.log('   - bookings');
    console.log('   - booking_link_analytics');
    console.log('');
    console.log('🔧 Created functions and triggers:');
    console.log('   - update_booking_link_stats()');
    console.log('   - update_booking_link_updated_at()');
    console.log('   - trigger_update_booking_link_stats');
    console.log('   - trigger_booking_link_updated_at');
    console.log('');
    console.log('🔒 Enabled Row Level Security (RLS) policies');
    console.log('');
    console.log('🎉 Your booking system is ready to use!');
    console.log('   - Create booking links');
    console.log('   - Accept public bookings');
    console.log('   - Track analytics');
    console.log('   - Qualify and route leads');
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
initializeBookingDatabase();
