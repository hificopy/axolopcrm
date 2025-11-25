/**
 * Seed script for demo data
 * This script populates the database with demo data for development
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Seeding demo data...');

  // Create a demo user
  const { data: demoUser, error: userError } = await supabase
    .from('users')
    .insert({
      email: 'demo@axolop.com',
      name: 'Demo User',
      first_name: 'Demo',
      last_name: 'User',
      role: 'ADMIN',
      email_verified: true,
      is_active: true,
    })
    .select()
    .single();

  if (userError) {
    // If user already exists, fetch it
    if (userError.code === '23505') { // Unique violation error code
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'demo@axolop.com')
        .single();
        
      if (error) {
        console.error('Error fetching existing user:', error);
        throw error;
      }
      console.log(`Demo user already exists with ID: ${data.id}`);
    } else {
      console.error('Error creating user:', userError);
      throw userError;
    }
  } else {
    console.log(`Demo user created with ID: ${demoUser.id}`);
  }

  // Create demo leads
  const demoLeadsData = [
    {
      email: 'john.doe@company.com',
      name: 'John Doe',
      company: 'Company Inc.',
      title: 'CEO',
      phone: '+1234567890',
      status: 'NEW',
      qualification_level: 'HOT',
      source: 'website',
      owner_id: demoUser ? demoUser.id : null, // Use the ID from the created/fetched user
    },
    {
      email: 'jane.smith@business.com',
      name: 'Jane Smith',
      company: 'Business Corp',
      title: 'Marketing Director',
      phone: '+1987654321',
      status: 'CONTACTED',
      qualification_level: 'WARM',
      source: 'referral',
      owner_id: demoUser ? demoUser.id : null,
    },
  ];

  const { data: demoLeads, error: leadsError } = await supabase
    .from('leads')
    .insert(demoLeadsData)
    .select();

  if (leadsError) {
    console.error('Error creating leads:', leadsError);
    throw leadsError;
  }

  console.log(`Created ${demoLeads.length} demo leads`);

  console.log('Demo data seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  });