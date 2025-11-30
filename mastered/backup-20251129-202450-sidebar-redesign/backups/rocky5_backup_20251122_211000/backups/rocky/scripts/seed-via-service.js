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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const EMAIL = 'axolopcrm@gmail.com';

async function seedDemoData() {
  try {
    console.log(`\n🔍 Looking up user: ${EMAIL}`);

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    const user = users.find(u => u.email === EMAIL);

    if (!user) {
      console.error(`❌ User not found: ${EMAIL}`);
      return;
    }

    const userId = user.id;
    console.log(`✅ Found user: ${userId}`);

    // Check if user already has placeholder data (RLS filters by user automatically)
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('is_placeholder_data', true)
      .limit(1);

    if (existingLeads && existingLeads.length > 0) {
      console.log('\n⚠️  User already has placeholder data!');
      console.log('   Use the "Clear Placeholder Data" button to remove it first.');
      return;
    }

    console.log('\n📦 Seeding demo data...\n');

    // Create demo leads - RLS will handle user association
    const demoLeads = [
      {
        name: 'Acme Corporation',
        email: 'contact@acmecorp.demo',
        phone: '+1 (555) 123-4567',
        status: 'QUALIFIED',
        is_placeholder_data: true
      },
      {
        name: 'TechStart Inc',
        email: 'hello@techstart.demo',
        phone: '+1 (555) 234-5678',
        status: 'NEW',
        is_placeholder_data: true
      },
      {
        name: 'Global Solutions Ltd',
        email: 'info@globalsolutions.demo',
        phone: '+1 (555) 345-6789',
        status: 'NURTURE',
        is_placeholder_data: true
      },
      {
        name: 'InnovateCo',
        email: 'sales@innovateco.demo',
        phone: '+1 (555) 456-7890',
        status: 'CONTACTED',
        is_placeholder_data: true
      },
      {
        name: 'StartupXYZ',
        email: 'team@startupxyz.demo',
        phone: '+1 (555) 567-8901',
        status: 'NEW',
        is_placeholder_data: true
      }
    ];

    const { data: createdLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(demoLeads)
      .select();

    if (leadsError) {
      console.error('❌ Error creating leads:', leadsError);
      return;
    }

    console.log(`✅ Created ${createdLeads.length} leads`);

    // Create demo contacts - RLS will handle user association
    const demoContacts = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@acmecorp.demo',
        phone: '+1 (555) 123-4567',
        company: 'Acme Corporation',
        title: 'CEO',
        is_placeholder_data: true
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.j@techstart.demo',
        phone: '+1 (555) 234-5678',
        company: 'TechStart Inc',
        title: 'CTO',
        is_placeholder_data: true
      },
      {
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'mchen@globalsolutions.demo',
        phone: '+1 (555) 345-6789',
        company: 'Global Solutions Ltd',
        title: 'VP of Sales',
        is_placeholder_data: true
      },
      {
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily@innovateco.demo',
        phone: '+1 (555) 456-7890',
        company: 'InnovateCo',
        title: 'Marketing Director',
        is_placeholder_data: true
      }
    ];

    const { data: createdContacts, error: contactsError } = await supabase
      .from('contacts')
      .insert(demoContacts)
      .select();

    if (contactsError) {
      console.error('❌ Error creating contacts:', contactsError);
      // Continue even if contacts fail
      console.log('   Continuing with opportunities...');
    } else {
      console.log(`✅ Created ${createdContacts.length} contacts`);
    }

    // Create demo opportunities - RLS will handle user association
    const demoOpportunities = [
      {
        name: 'Acme Enterprise Deal',
        lead_id: createdLeads[0]?.id,
        value: 15000,
        stage: 'PROPOSAL',
        probability: 75,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_placeholder_data: true
      },
      {
        name: 'TechStart Basic Plan',
        lead_id: createdLeads[1]?.id,
        value: 8000,
        stage: 'QUALIFICATION',
        probability: 25,
        expected_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_placeholder_data: true
      },
      {
        name: 'Global Solutions Consulting',
        lead_id: createdLeads[2]?.id,
        value: 25000,
        stage: 'NEGOTIATION',
        probability: 60,
        expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        is_placeholder_data: true
      }
    ];

    const { data: createdOpportunities, error: opportunitiesError } = await supabase
      .from('opportunities')
      .insert(demoOpportunities)
      .select();

    if (opportunitiesError) {
      console.error('❌ Error creating opportunities:', opportunitiesError);
      console.log('   Continuing anyway...');
    } else {
      console.log(`✅ Created ${createdOpportunities?.length || 0} opportunities`);
    }

    console.log('\n🎉 Demo data seeded successfully for axolopcrm@gmail.com!');
    console.log('\n📋 Summary:');
    console.log(`   - ${createdLeads.length} leads`);
    console.log(`   - ${createdContacts?.length || 0} contacts`);
    console.log(`   - ${createdOpportunities?.length || 0} opportunities`);
    console.log('\n✨ The "Clear Placeholder Data" button will now appear in the sidebar!');
    console.log('💡 Tip: Refresh your browser to see the button.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

seedDemoData();
