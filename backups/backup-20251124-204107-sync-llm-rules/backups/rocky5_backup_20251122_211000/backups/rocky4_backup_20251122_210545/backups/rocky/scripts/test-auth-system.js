#!/usr/bin/env node

/**
 * Authentication System Integration Test
 *
 * This script tests the complete authentication system including:
 * - Database schema deployment
 * - Backend API endpoints
 * - User creation and management
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0
};

function logTest(name, status, message = '') {
  const icons = {
    pass: '✅',
    fail: '❌',
    skip: '⏭️',
    info: 'ℹ️'
  };

  console.log(`${icons[status]} ${name}${message ? ': ' + message : ''}`);

  if (status === 'pass') testResults.passed++;
  if (status === 'fail') testResults.failed++;
  if (status === 'skip') testResults.skipped++;
}

async function runTests() {
  console.log('🧪 Authentication System Integration Tests\n');
  console.log('='.repeat(60));

  // Test 1: Database Schema
  console.log('\n📊 Test Suite 1: Database Schema');
  console.log('─'.repeat(60));

  const tables = ['users', 'user_settings', 'user_activity', 'user_sessions', 'teams', 'team_members'];

  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(0);

      if (!error) {
        logTest(`Table: ${table}`, 'pass', 'exists');
      } else {
        logTest(`Table: ${table}`, 'fail', error.message);
      }
    } catch (err) {
      logTest(`Table: ${table}`, 'fail', err.message);
    }
  }

  // Test 2: Backend Health
  console.log('\n🏥 Test Suite 2: Backend API');
  console.log('─'.repeat(60));

  try {
    const response = await fetch('http://localhost:3002/health');
    if (response.ok) {
      const health = await response.json();
      logTest('Backend health endpoint', 'pass', `Status: ${health.status}`);

      // Check service statuses
      if (health.services) {
        logTest('Redis connection', health.services.redis === 'connected' ? 'pass' : 'fail');
        logTest('Database connection', health.services.database === 'connected' ? 'pass' : 'fail');
      }
    } else {
      logTest('Backend health endpoint', 'fail', `HTTP ${response.status}`);
    }
  } catch (err) {
    logTest('Backend health endpoint', 'fail', 'Backend not running. Start with: npm run backend');
  }

  // Test 3: User Registration
  console.log('\n👤 Test Suite 3: User Authentication');
  console.log('─'.repeat(60));

  const testEmail = `test-${Date.now()}@axolopcrm.test`;
  const testPassword = 'Test123!@#Test123';

  console.log(`   Test user: ${testEmail}`);

  try {
    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (signUpError) {
      // Check if it's a "user already exists" error (which is ok for testing)
      if (signUpError.message.includes('already registered')) {
        logTest('User signup', 'skip', 'User already exists (ok for testing)');
      } else {
        logTest('User signup', 'fail', signUpError.message);
      }
    } else if (signUpData.user) {
      logTest('User signup', 'pass', `User ID: ${signUpData.user.id}`);

      // Check if user profile was created automatically
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        logTest('Auto-create user profile', 'fail', profileError.message);
      } else if (profile) {
        logTest('Auto-create user profile', 'pass', 'Trigger working correctly');
      } else {
        logTest('Auto-create user profile', 'fail', 'Profile not created');
      }

      // Clean up test user
      try {
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
        logTest('Cleanup test user', 'pass');
      } catch (cleanupErr) {
        logTest('Cleanup test user', 'fail', cleanupErr.message);
      }
    }
  } catch (err) {
    logTest('User signup', 'fail', err.message);
  }

  // Test 4: RLS Policies
  console.log('\n🔒 Test Suite 4: Row Level Security');
  console.log('─'.repeat(60));

  try {
    // Try to query users table without auth (should fail or return empty)
    const { data, error } = await supabaseClient
      .from('users')
      .select('*');

    if (error) {
      logTest('RLS policies enforced', 'pass', 'Unauthenticated access blocked');
    } else if (!data || data.length === 0) {
      logTest('RLS policies enforced', 'pass', 'No data without auth');
    } else {
      logTest('RLS policies enforced', 'fail', 'Data accessible without auth');
    }
  } catch (err) {
    logTest('RLS policies', 'fail', err.message);
  }

  // Test 5: User API Endpoints
  console.log('\n🔌 Test Suite 5: User API Endpoints');
  console.log('─'.repeat(60));

  const endpoints = [
    '/api/v1/users/me',
    '/api/v1/users/me/settings',
    '/api/v1/users/me/activity'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3002${endpoint}`);

      if (response.status === 401) {
        logTest(`Endpoint: ${endpoint}`, 'pass', 'Requires authentication');
      } else if (response.status === 404) {
        logTest(`Endpoint: ${endpoint}`, 'fail', 'Route not found');
      } else {
        logTest(`Endpoint: ${endpoint}`, 'info', `HTTP ${response.status}`);
      }
    } catch (err) {
      logTest(`Endpoint: ${endpoint}`, 'fail', 'Backend not responding');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed:  ${testResults.passed}`);
  console.log(`❌ Failed:  ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📈 Total:   ${testResults.passed + testResults.failed + testResults.skipped}`);

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    console.log('\n✨ Next Steps:');
    console.log('   1. Connect Profile page to /api/v1/users/me');
    console.log('   2. Add email verification banner');
    console.log('   3. Connect Settings page to API');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('\n🔍 Common Issues:');
    console.log('   • Database schema not deployed → Run SQL in Supabase Editor');
    console.log('   • Backend not running → Start with: npm run backend');
    console.log('   • Missing env vars → Check .env file');
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
