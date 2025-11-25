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

async function seedV1Data() {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     Axolop CRM V1 - Creating Demo Data        ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Clear existing test data
    console.log('🧹 Clearing old test data...');
    await supabase.from('leads').delete().ilike('email', '%test%');
    await supabase.from('contacts').delete().ilike('email', '%test%');

    // Seed Leads
    console.log('📊 Creating sample leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert([
        {
          name: 'Tech Innovations LLC',
          email: 'contact@techinnovations.com',
          phone: '+1-555-0101',
          status: 'QUALIFIED',
          value: 50000,
          type: 'B2B_COMPANY',
          website: 'https://techinnovations.com'
        },
        {
          name: 'E-Commerce Giants',
          email: 'hello@ecommerce-giants.com',
          phone: '+1-555-0102',
          status: 'NEW',
          value: 75000,
          type: 'B2B_COMPANY',
          website: 'https://ecommerce-giants.com'
        },
        {
          name: 'Premier Real Estate Group',
          email: 'info@premierrealestate.com',
          phone: '+1-555-0103',
          status: 'QUALIFIED',
          value: 120000,
          type: 'B2B_COMPANY',
          website: 'https://premierrealestate.com'
        },
        {
          name: 'Digital Marketing Pro',
          email: 'team@digitalmarketingpro.com',
          phone: '+1-555-0104',
          status: 'NEW',
          value: 35000,
          type: 'B2B_COMPANY'
        },
        {
          name: 'SaaS Startup Inc',
          email: 'founders@saasstartup.io',
          phone: '+1-555-0105',
          status: 'QUALIFIED',
          value: 95000,
          type: 'B2B_COMPANY',
          website: 'https://saasstartup.io'
        }
      ])
      .select();

    if (leadsError) {
      console.log('⚠️  Leads error:', leadsError.message);
      return;
    } else {
      console.log(`✅ Created ${leads.length} leads`);
    }

    // Seed Contacts
    console.log('👥 Creating sample contacts...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .insert([
        {
          first_name: 'John',
          last_name: 'Anderson',
          email: 'john.anderson@techinnovations.com',
          phone: '+1-555-1001',
          title: 'CEO'
        },
        {
          first_name: 'Sarah',
          last_name: 'Mitchell',
          email: 'sarah.m@ecommerce-giants.com',
          phone: '+1-555-1002',
          title: 'Head of Marketing'
        },
        {
          first_name: 'Michael',
          last_name: 'Rodriguez',
          email: 'mrodriguez@premierrealestate.com',
          phone: '+1-555-1003',
          title: 'Managing Partner'
        },
        {
          first_name: 'Emily',
          last_name: 'Chen',
          email: 'emily.chen@digitalmarketingpro.com',
          phone: '+1-555-1004',
          title: 'Director of Operations'
        },
        {
          first_name: 'David',
          last_name: 'Thompson',
          email: 'david.t@saasstartup.io',
          phone: '+1-555-1005',
          title: 'Co-Founder & CTO'
        }
      ])
      .select();

    if (contactsError) {
      console.log('⚠️  Contacts error:', contactsError.message);
    } else {
      console.log(`✅ Created ${contacts?.length || 0} contacts`);
    }

    // Seed Forms
    console.log('📝 Creating sample forms...');
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .insert([
        {
          title: 'Contact Us - General Inquiry',
          description: 'Get in touch with our sales team',
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
              placeholder: 'your@company.com'
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
              type: 'single-choice',
              title: 'Company size?',
              required: true,
              choices: ['1-10 employees', '11-50 employees', '51-200 employees', '201+ employees'],
              lead_scoring_enabled: true,
              lead_scoring: {
                '1-10 employees': 5,
                '11-50 employees': 10,
                '51-200 employees': 15,
                '201+ employees': 20
              }
            },
            {
              id: 'q5',
              type: 'long-text',
              title: 'How can we help you?',
              required: true,
              placeholder: 'Describe your needs or questions...'
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
        },
        {
          title: 'Enterprise Demo Request',
          description: 'Schedule a personalized demo of Axolop CRM',
          questions: [
            {
              id: 'q1',
              type: 'short-text',
              title: 'Full Name',
              required: true
            },
            {
              id: 'q2',
              type: 'email',
              title: 'Work Email',
              required: true
            },
            {
              id: 'q3',
              type: 'short-text',
              title: 'Company Name',
              required: true
            },
            {
              id: 'q4',
              type: 'single-choice',
              title: 'Industry',
              required: true,
              choices: ['E-commerce', 'Real Estate', 'B2B SaaS', 'Marketing Agency', 'Other']
            },
            {
              id: 'q5',
              type: 'long-text',
              title: 'What are your main CRM challenges?',
              required: true
            }
          ],
          settings: {
            branding: true,
            analytics: true,
            create_contact: true
          },
          is_active: true,
          is_published: true
        }
      ])
      .select();

    if (formsError) {
      console.log('⚠️  Forms error:', formsError.message);
    } else {
      console.log(`✅ Created ${forms.length} forms`);
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Demo data created successfully!               ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('✨ Your Axolop CRM now has:');
    console.log(`   • ${leads?.length || 0} Sample leads`);
    console.log(`   • ${contacts?.length || 0} Sample contacts`);
    console.log(`   • ${forms?.length || 0} Sample forms`);
    console.log('   • Ready to test!');
    console.log('');
    console.log('🚀 Next: Open http://localhost:3001 in your browser');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedV1Data();
