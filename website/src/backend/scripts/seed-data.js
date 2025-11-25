import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     Axolop CRM V1 - Seed Data                  ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Seed Leads
    console.log('📊 Creating sample leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .upsert([
        {
          name: 'Tech Startup Inc',
          email: 'contact@techstartup.com',
          phone: '+1-555-0101',
          status: 'QUALIFIED',
          value: 50000,
          type: 'B2B_COMPANY'
        },
        {
          name: 'E-Commerce Solutions',
          email: 'info@ecommerce-sol.com',
          phone: '+1-555-0102',
          status: 'NEW',
          value: 75000,
          type: 'B2B_COMPANY'
        },
        {
          name: 'Real Estate Group',
          email: 'hello@realestate.com',
          phone: '+1-555-0103',
          status: 'QUALIFIED',
          value: 120000,
          type: 'B2B_COMPANY'
        }
      ], {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select();

    if (leadsError) {
      console.log('⚠️  Leads:', leadsError.message);
    } else {
      console.log(`✅ Created ${leads?.length || 0} leads`);
    }

    // Seed Contacts
    console.log('👥 Creating sample contacts...');
    const leadIds = leads?.map(l => l.id) || [];

    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .upsert([
        {
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@techstartup.com',
          phone: '+1-555-1001',
          title: 'CEO',
          lead_id: leadIds[0] || null,
          is_primary_contact: true
        },
        {
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.j@ecommerce-sol.com',
          phone: '+1-555-1002',
          title: 'Marketing Director',
          lead_id: leadIds[1] || null,
          is_primary_contact: true
        },
        {
          first_name: 'Michael',
          last_name: 'Brown',
          email: 'mbrown@realestate.com',
          phone: '+1-555-1003',
          title: 'Partner',
          lead_id: leadIds[2] || null,
          is_primary_contact: true
        }
      ], {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select();

    if (contactsError) {
      console.log('⚠️  Contacts:', contactsError.message);
    } else {
      console.log(`✅ Created ${contacts?.length || 0} contacts`);
    }

    // Seed Forms
    console.log('📝 Creating sample form...');
    const { data: form, error: formError } = await supabase
      .from('forms')
      .upsert([
        {
          title: 'Contact Us Form',
          description: 'Get in touch with our team',
          questions: [
            {
              id: 'q1',
              type: 'short-text',
              title: 'What is your name?',
              required: true,
              placeholder: 'Enter your full name'
            },
            {
              id: 'q2',
              type: 'email',
              title: 'What is your email address?',
              required: true,
              placeholder: 'your@email.com'
            },
            {
              id: 'q3',
              type: 'phone',
              title: 'Phone number',
              required: false,
              placeholder: '+1-555-0000'
            },
            {
              id: 'q4',
              type: 'long-text',
              title: 'How can we help you?',
              required: true,
              placeholder: 'Describe your needs...'
            }
          ],
          settings: {
            branding: true,
            analytics: true,
            notifications: true,
            mode: 'standard',
            theme: 'default',
            create_contact: true
          },
          is_active: true,
          is_published: true
        }
      ], {
        onConflict: 'title',
        ignoreDuplicates: false
      })
      .select();

    if (formError) {
      console.log('⚠️  Forms:', formError.message);
    } else {
      console.log(`✅ Created ${form?.length || 0} forms`);
    }

    // Try to seed opportunities/deals if table exists
    console.log('💰 Creating sample deals...');
    try {
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .upsert([
          {
            name: 'Enterprise CRM License',
            lead_id: leadIds[0] || null,
            stage: 'QUALIFIED',
            amount: 50000,
            currency: 'USD',
            probability: 70,
            status: 'OPEN',
            expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            name: 'E-Commerce Integration',
            lead_id: leadIds[1] || null,
            stage: 'PROPOSAL',
            amount: 75000,
            currency: 'USD',
            probability: 85,
            status: 'OPEN',
            expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            name: 'Property Management System',
            lead_id: leadIds[2] || null,
            stage: 'NEGOTIATION',
            amount: 120000,
            currency: 'USD',
            probability: 90,
            status: 'OPEN',
            expected_close_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ], {
          ignoreDuplicates: false
        })
        .select();

      if (dealsError) {
        console.log('⚠️  Deals table doesn\'t exist yet. Run create-deals-table.sql first.');
      } else {
        console.log(`✅ Created ${deals?.length || 0} deals`);
      }
    } catch (e) {
      console.log('⚠️  Deals table not available');
    }

    // Try opportunities table as fallback
    try {
      const { data: opps, error: oppsError } = await supabase
        .from('opportunities')
        .upsert([
          {
            name: 'Enterprise CRM License',
            lead_id: leadIds[0] || null,
            stage: 'QUALIFIED',
            amount: 50000,
            status: 'OPEN'
          }
        ], {
          ignoreDuplicates: false
        })
        .select();

      if (!oppsError && opps) {
        console.log(`✅ Created opportunities in opportunities table`);
      }
    } catch (e) {
      // Silently fail if opportunities table doesn't exist
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Seed data complete!                           ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('✨ Your CRM now has:');
    console.log(`   • ${leads?.length || 0} Sample leads`);
    console.log(`   • ${contacts?.length || 0} Sample contacts`);
    console.log(`   • ${form?.length || 0} Sample form`);
    console.log('   • Ready for testing!');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
