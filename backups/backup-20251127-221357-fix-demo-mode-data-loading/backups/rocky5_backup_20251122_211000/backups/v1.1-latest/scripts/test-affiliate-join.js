// Test affiliate join functionality
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import affiliateService from '../backend/services/affiliate-service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAffiliateJoin() {
  console.log('🧪 Testing affiliate join functionality...\n');

  try {
    // Get the first user from auth.users to test with
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No users found in the system. Please sign up first.');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.email} (${testUser.id})\n`);

    // Try to create an affiliate account
    console.log('🔄 Attempting to join affiliate program...');
    const result = await affiliateService.createAffiliate(testUser.id);

    console.log('\n✅ Success!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n🔍 Full error details:', error);
  }
}

testAffiliateJoin();
