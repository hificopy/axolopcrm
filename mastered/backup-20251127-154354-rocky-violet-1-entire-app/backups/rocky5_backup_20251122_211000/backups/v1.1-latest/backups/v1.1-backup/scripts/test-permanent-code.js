// Test that users get permanent referral codes that never change
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import affiliateService from '../backend/services/affiliate-service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPermanentCode() {
  console.log('🧪 Testing permanent referral code generation...\n');

  try {
    const { data: { users } } = await supabase.auth.admin.listUsers();

    if (!users || users.length === 0) {
      console.error('❌ No users found');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Test User: ${testUser.email} (${testUser.id})\n`);

    // First call - should create new code
    console.log('📞 FIRST CALL - Creating affiliate account...');
    const result1 = await affiliateService.createAffiliate(testUser.id);
    console.log('✅ Result 1:', {
      success: result1.success,
      referral_code: result1.data?.referral_code,
      message: result1.message
    });

    const firstCode = result1.data?.referral_code;
    console.log(`\n🔑 First Code: ${firstCode}\n`);

    // Second call - should return SAME code
    console.log('📞 SECOND CALL - Trying to join again...');
    const result2 = await affiliateService.createAffiliate(testUser.id);
    console.log('✅ Result 2:', {
      success: result2.success,
      referral_code: result2.data?.referral_code,
      message: result2.message
    });

    const secondCode = result2.data?.referral_code;
    console.log(`\n🔑 Second Code: ${secondCode}\n`);

    // Third call - should STILL return SAME code
    console.log('📞 THIRD CALL - Trying one more time...');
    const result3 = await affiliateService.createAffiliate(testUser.id);
    console.log('✅ Result 3:', {
      success: result3.success,
      referral_code: result3.data?.referral_code,
      message: result3.message
    });

    const thirdCode = result3.data?.referral_code;
    console.log(`\n🔑 Third Code: ${thirdCode}\n`);

    // Verify all codes are the same
    console.log('=' .repeat(60));
    if (firstCode === secondCode && secondCode === thirdCode) {
      console.log('✅ ✅ ✅ SUCCESS! All codes are IDENTICAL!');
      console.log(`\n🎉 Referral code is PERMANENT: ${firstCode}`);
      console.log(`\n✅ URL will always be: https://axolop.com/?ref=${firstCode}`);
    } else {
      console.log('❌ FAILED! Codes are different:');
      console.log(`   First:  ${firstCode}`);
      console.log(`   Second: ${secondCode}`);
      console.log(`   Third:  ${thirdCode}`);
    }
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testPermanentCode();
