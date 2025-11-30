import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedForUser(email) {
  try {
    console.log(`\n🔍 Looking up user: ${email}`);

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    console.log(`✅ Found user: ${user.id}`);

    // Call the seed endpoint
    console.log('\n📦 Seeding demo data...');

    const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:3002'}/api/demo-data/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Create a mock JWT-like header with user ID
        'x-user-id': user.id
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Seed failed:', error);
      return;
    }

    const result = await response.json();
    console.log('\n✅ Demo data seeded successfully!');
    console.log('📊 Data created:');
    console.log(`   - ${result.data.leads} leads`);
    console.log(`   - ${result.data.contacts} contacts`);
    console.log(`   - ${result.data.opportunities} opportunities`);
    console.log(`   - ${result.data.forms} forms`);
    console.log(`   - ${result.data.workflows} workflows`);
    console.log('\n🎉 Done! The "Clear Placeholder Data" button will now appear in the sidebar.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line argument
const email = process.argv[2] || 'axolopcrm@gmail.com';
seedForUser(email);
