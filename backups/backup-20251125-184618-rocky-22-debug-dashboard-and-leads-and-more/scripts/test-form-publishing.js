/**
 * Form Publishing System Test Script
 *
 * This script tests the form publishing API endpoints
 * Usage: node scripts/test-form-publishing.js
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002/api/v1';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test user credentials (update these)
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

let authToken = null;
let testFormId = null;
let testAgencyAlias = null;
let testSlug = null;

/**
 * Helper: Make authenticated API request
 */
async function apiRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

/**
 * Test 1: Sign in and get auth token
 */
async function test1_SignIn() {
  console.log('\n📝 Test 1: Sign in...');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (error) {
    console.error('❌ Sign in failed:', error.message);
    return false;
  }

  authToken = data.session.access_token;
  console.log('✅ Sign in successful');
  return true;
}

/**
 * Test 2: Create a test form
 */
async function test2_CreateForm() {
  console.log('\n📝 Test 2: Creating test form...');

  const formData = {
    title: 'Test Form for Publishing',
    description: 'This is a test form to verify publishing functionality',
    questions: [
      {
        id: 'q1',
        type: 'short-text',
        title: 'What is your name?',
        required: true
      },
      {
        id: 'q2',
        type: 'email',
        title: 'What is your email?',
        required: true
      }
    ],
    settings: {
      mode: 'standard',
      branding: true
    }
  };

  const { status, data } = await apiRequest('POST', '/forms', formData);

  if (status !== 201) {
    console.error('❌ Create form failed:', data);
    return false;
  }

  testFormId = data.id;
  console.log(`✅ Form created with ID: ${testFormId}`);
  return true;
}

/**
 * Test 3: Get user's agency alias
 */
async function test3_GetAgencyAlias() {
  console.log('\n📝 Test 3: Getting agency alias...');

  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    console.error('❌ Get user failed:', error.message);
    return false;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('agency_alias')
    .eq('id', user.user.id)
    .single();

  if (userError) {
    console.error('❌ Get agency alias failed:', userError.message);
    return false;
  }

  testAgencyAlias = userData.agency_alias;
  console.log(`✅ Agency alias: ${testAgencyAlias}`);
  return true;
}

/**
 * Test 4: Publish form with auto-generated slug
 */
async function test4_PublishForm() {
  console.log('\n📝 Test 4: Publishing form...');

  const { status, data } = await apiRequest('POST', `/forms/${testFormId}/publish`);

  if (status !== 200 || !data.success) {
    console.error('❌ Publish failed:', data);
    return false;
  }

  testSlug = data.slug;
  console.log(`✅ Form published successfully!`);
  console.log(`   Version: ${data.version}`);
  console.log(`   Slug: ${data.slug}`);
  console.log(`   Public URL: ${data.publicUrl}`);
  return true;
}

/**
 * Test 5: Get publish history
 */
async function test5_GetPublishHistory() {
  console.log('\n📝 Test 5: Getting publish history...');

  const { status, data } = await apiRequest('GET', `/forms/${testFormId}/publish-history`);

  if (status !== 200 || !data.success) {
    console.error('❌ Get history failed:', data);
    return false;
  }

  console.log(`✅ Publish history retrieved`);
  console.log(`   Current version: ${data.currentVersion}`);
  console.log(`   History entries: ${data.history.length}`);

  if (data.history.length > 0) {
    console.log(`   Latest entry:`, {
      version: data.history[data.history.length - 1].version,
      publishedAt: data.history[data.history.length - 1].published_at
    });
  }

  return true;
}

/**
 * Test 6: Access published form (public endpoint)
 */
async function test6_GetPublicForm() {
  console.log('\n📝 Test 6: Accessing public form...');

  const response = await fetch(`${API_BASE_URL}/forms/public/${testAgencyAlias}/${testSlug}`);
  const data = await response.json();

  if (response.status !== 200 || !data.success) {
    console.error('❌ Get public form failed:', data);
    return false;
  }

  console.log(`✅ Public form retrieved successfully`);
  console.log(`   Form title: ${data.form.title}`);
  console.log(`   Questions: ${data.form.questions.length}`);
  console.log(`   Published version: ${data.form.published_version}`);
  return true;
}

/**
 * Test 7: Update form slug
 */
async function test7_UpdateSlug() {
  console.log('\n📝 Test 7: Updating form slug...');

  const newSlug = `test-form-${Date.now()}`;
  const { status, data } = await apiRequest('PUT', `/forms/${testFormId}/slug`, { slug: newSlug });

  if (status !== 200 || !data.success) {
    console.error('❌ Update slug failed:', data);
    return false;
  }

  testSlug = newSlug;
  console.log(`✅ Slug updated successfully`);
  console.log(`   New slug: ${data.slug}`);
  console.log(`   New public URL: ${data.publicUrl}`);
  return true;
}

/**
 * Test 8: Republish form (increment version)
 */
async function test8_RepublishForm() {
  console.log('\n📝 Test 8: Republishing form...');

  const { status, data } = await apiRequest('POST', `/forms/${testFormId}/publish`);

  if (status !== 200 || !data.success) {
    console.error('❌ Republish failed:', data);
    return false;
  }

  console.log(`✅ Form republished successfully`);
  console.log(`   New version: ${data.version}`);
  console.log(`   Published at: ${data.form.published_at}`);
  return true;
}

/**
 * Test 9: Unpublish form
 */
async function test9_UnpublishForm() {
  console.log('\n📝 Test 9: Unpublishing form...');

  const { status, data } = await apiRequest('POST', `/forms/${testFormId}/unpublish`);

  if (status !== 200 || !data.success) {
    console.error('❌ Unpublish failed:', data);
    return false;
  }

  console.log(`✅ Form unpublished successfully`);
  return true;
}

/**
 * Test 10: Verify form is inaccessible after unpublish
 */
async function test10_VerifyUnpublished() {
  console.log('\n📝 Test 10: Verifying form is inaccessible...');

  const response = await fetch(`${API_BASE_URL}/forms/public/${testAgencyAlias}/${testSlug}`);
  const data = await response.json();

  if (response.status === 404) {
    console.log(`✅ Form correctly returns 404 after unpublish`);
    return true;
  } else {
    console.error('❌ Form should not be accessible after unpublish');
    return false;
  }
}

/**
 * Cleanup: Delete test form
 */
async function cleanup() {
  console.log('\n🧹 Cleanup: Deleting test form...');

  const { status, data } = await apiRequest('DELETE', `/forms/${testFormId}`);

  if (status === 200) {
    console.log('✅ Test form deleted');
  } else {
    console.log('⚠️  Could not delete test form (may need manual cleanup)');
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Form Publishing System Tests');
  console.log('==========================================\n');

  const tests = [
    { name: 'Sign In', fn: test1_SignIn },
    { name: 'Create Form', fn: test2_CreateForm },
    { name: 'Get Agency Alias', fn: test3_GetAgencyAlias },
    { name: 'Publish Form', fn: test4_PublishForm },
    { name: 'Get Publish History', fn: test5_GetPublishHistory },
    { name: 'Get Public Form', fn: test6_GetPublicForm },
    { name: 'Update Slug', fn: test7_UpdateSlug },
    { name: 'Republish Form', fn: test8_RepublishForm },
    { name: 'Unpublish Form', fn: test9_UnpublishForm },
    { name: 'Verify Unpublished', fn: test10_VerifyUnpublished }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ Test "${test.name}" threw error:`, error.message);
      failed++;
    }
  }

  // Cleanup
  if (testFormId) {
    await cleanup();
  }

  // Summary
  console.log('\n==========================================');
  console.log('📊 Test Summary');
  console.log('==========================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
