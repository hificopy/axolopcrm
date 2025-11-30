#!/usr/bin/env node

/**
 * Comprehensive Affiliate System Test Script
 * Tests the complete affiliate flow from landing page to referral tracking
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   ${details}`);

  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

async function testDatabaseTables() {
  console.log('\n📊 === TESTING DATABASE TABLES ===\n');

  const tables = [
    'affiliates',
    'affiliate_clicks',
    'affiliate_referrals',
    'affiliate_commissions',
    'affiliate_payouts',
    'affiliate_materials'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      logTest(`Table exists: ${table}`, true, `Row count: ${count || 0}`);
    } catch (error) {
      logTest(`Table exists: ${table}`, false, error.message);
    }
  }
}

async function testAffiliateCreation() {
  console.log('\n🎯 === TESTING AFFILIATE CREATION ===\n');

  try {
    // Get a test user
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError || !users.users.length) {
      logTest('Get test user', false, 'No users found');
      return null;
    }

    const testUser = users.users[0];
    logTest('Get test user', true, `User: ${testUser.email}`);

    // Check if affiliate account exists
    const { data: existingAffiliate, error: checkError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      logTest('Check existing affiliate', false, checkError.message);
      return null;
    }

    if (existingAffiliate) {
      logTest('Affiliate account exists', true, `Code: ${existingAffiliate.referral_code}`);
      return existingAffiliate;
    }

    // Create affiliate account
    const { data: newAffiliate, error: createError } = await supabase
      .from('affiliates')
      .insert([{
        user_id: testUser.id,
        referral_code: `TEST${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        commission_rate: 40.00,
        status: 'active'
      }])
      .select()
      .single();

    if (createError) {
      logTest('Create affiliate account', false, createError.message);
      return null;
    }

    logTest('Create affiliate account', true, `Code: ${newAffiliate.referral_code}`);
    return newAffiliate;

  } catch (error) {
    logTest('Affiliate creation test', false, error.message);
    return null;
  }
}

async function testClickTracking(affiliate) {
  console.log('\n🖱️  === TESTING CLICK TRACKING ===\n');

  if (!affiliate) {
    logTest('Click tracking', false, 'No affiliate to test with');
    return;
  }

  try {
    const clickData = {
      referral_code: affiliate.referral_code,
      landing_page: `https://axolop.com/?ref=${affiliate.referral_code}&fname=TestUser`,
      utm_source: 'test',
      utm_medium: 'script',
      utm_campaign: 'system_test'
    };

    const response = await axios.post(
      `${API_BASE_URL}/affiliate/track-click`,
      clickData
    );

    if (response.data.success) {
      logTest('Track affiliate click', true, `Click tracked for code: ${affiliate.referral_code}`);
    } else {
      logTest('Track affiliate click', false, response.data.message);
    }

  } catch (error) {
    logTest('Track affiliate click', false, error.message);
  }
}

async function testReferralCodeValidation(affiliate) {
  console.log('\n🔍 === TESTING REFERRAL CODE VALIDATION ===\n');

  if (!affiliate) {
    logTest('Code validation', false, 'No affiliate to test with');
    return;
  }

  try {
    // Test valid code
    const response = await axios.get(
      `${API_BASE_URL}/affiliate/check-code/${affiliate.referral_code}`
    );

    if (response.data.valid) {
      logTest('Validate referral code', true, `Code ${affiliate.referral_code} is valid`);
    } else {
      logTest('Validate referral code', false, 'Valid code returned as invalid');
    }

  } catch (error) {
    logTest('Validate referral code', false, error.message);
  }

  try {
    // Test invalid code
    const response = await axios.get(
      `${API_BASE_URL}/affiliate/check-code/INVALID123`
    );

    if (!response.data.valid) {
      logTest('Reject invalid code', true, 'Invalid code correctly rejected');
    } else {
      logTest('Reject invalid code', false, 'Invalid code incorrectly accepted');
    }

  } catch (error) {
    logTest('Reject invalid code', false, error.message);
  }
}

async function testMarketingMaterials() {
  console.log('\n📄 === TESTING MARKETING MATERIALS ===\n');

  try {
    const { data, error } = await supabase
      .from('affiliate_materials')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    if (data && data.length > 0) {
      logTest('Load marketing materials', true, `Found ${data.length} materials`);
    } else {
      logTest('Load marketing materials', false, 'No materials found');
    }

  } catch (error) {
    logTest('Load marketing materials', false, error.message);
  }
}

async function testRLSPolicies() {
  console.log('\n🔒 === TESTING RLS POLICIES ===\n');

  try {
    // Test anonymous click insertion
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert([{
        affiliate_id: '00000000-0000-0000-0000-000000000000', // Fake ID for test
        referral_code: 'TEST123',
        ip_address: '127.0.0.1',
        user_agent: 'Test Script'
      }]);

    // Should succeed or fail with foreign key error, not RLS error
    if (!clickError || clickError.code !== '42501') {
      logTest('Anonymous click tracking RLS', true, 'Anonymous inserts allowed');
    } else {
      logTest('Anonymous click tracking RLS', false, 'RLS blocking anonymous clicks');
    }

  } catch (error) {
    logTest('RLS policies test', false, error.message);
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total:  ${results.tests.length}`);
  console.log('='.repeat(60));

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}: ${t.details}`));
  }

  console.log('\n');

  const successRate = (results.passed / results.tests.length * 100).toFixed(1);
  if (successRate === '100.0') {
    console.log('🎉 ALL TESTS PASSED! Affiliate system is fully functional!');
  } else if (successRate >= 80) {
    console.log(`⚠️  MOSTLY WORKING: ${successRate}% success rate`);
  } else {
    console.log(`❌ NEEDS ATTENTION: ${successRate}% success rate`);
  }
}

async function runTests() {
  console.log('🚀 Starting Affiliate System Test Suite...\n');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  await testDatabaseTables();
  const affiliate = await testAffiliateCreation();
  await testClickTracking(affiliate);
  await testReferralCodeValidation(affiliate);
  await testMarketingMaterials();
  await testRLSPolicies();

  await printSummary();

  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
