#!/usr/bin/env node

/**
 * Create Kate's Business Tier Account
 * Email: kate@kateviolet.com
 * Password: Katewife1
 * Tier: Business (Unlimited Access)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createKateAccount() {
  console.log('🚀 Creating Kate\'s Business Tier Account...\n');

  const email = 'kate@kateviolet.com';
  const password = 'Katewife1';

  try {
    // Create auth user
    console.log('👤 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Kate Violet',
        first_name: 'Kate',
        last_name: 'Violet',
        tier: 'business',
        plan: 'business'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists. Updating to business tier...');

        // Get existing user
        const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === email);

        if (existingUser) {
          // Update user metadata
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                full_name: 'Kate Violet',
                first_name: 'Kate',
                last_name: 'Violet',
                tier: 'business',
                plan: 'business'
              }
            }
          );

          if (!updateError) {
            console.log('✅ Updated existing user to business tier');

            // Update user profile in database
            await updateUserProfile(existingUser.id);
          }
        }
      } else {
        throw authError;
      }
    } else if (authData.user) {
      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Update user profile in database
      await updateUserProfile(authData.user.id);
    }

    console.log('\n✅ Kate\'s account is ready!');
    console.log('\n📧 Email: kate@kateviolet.com');
    console.log('🔑 Password: Katewife1');
    console.log('💼 Tier: Business (Unlimited Access)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function updateUserProfile(userId) {
  console.log('📝 Updating user profile in database...');

  try {
    // Check if users table exists
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'kate@kateviolet.com',
          name: 'Kate Violet',
          first_name: 'Kate',
          last_name: 'Violet',
          role: 'USER',
          email_verified: true,
          is_active: true
        });

      if (insertError) {
        console.log('⚠️  Could not create user profile:', insertError.message);
        console.log('   (This is OK if the users table doesn\'t exist yet)');
      } else {
        console.log('✅ User profile created');
      }
    } else {
      // User exists, update
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: 'Kate Violet',
          first_name: 'Kate',
          last_name: 'Violet',
          email_verified: true,
          is_active: true
        })
        .eq('id', userId);

      if (updateError) {
        console.log('⚠️  Could not update user profile:', updateError.message);
      } else {
        console.log('✅ User profile updated');
      }
    }

    // Create user settings with business tier
    const { error: settingsError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        theme: 'system',
        email_notifications: true,
        push_notifications: true
      });

    if (settingsError) {
      console.log('⚠️  Could not create user settings:', settingsError.message);
      console.log('   (This is OK if the user_settings table doesn\'t exist yet)');
    } else {
      console.log('✅ User settings created');
    }

  } catch (error) {
    console.log('⚠️  Database update error:', error.message);
    console.log('   (This is OK if the schema hasn\'t been deployed yet)');
  }
}

createKateAccount();
