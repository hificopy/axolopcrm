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

async function checkSchema() {
  console.log('\n🔍 Checking existing Supabase schema...\n');

  // Check leads table
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);

  console.log('📋 LEADS table structure:');
  if (lead && lead.length > 0) {
    console.log('   Columns:', Object.keys(lead[0]).join(', '));
  } else if (leadError) {
    console.log('   Error:', leadError.message);
  } else {
    console.log('   (empty table)');
  }

  // Check contacts table
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .limit(1);

  console.log('\n📋 CONTACTS table structure:');
  if (contact && contact.length > 0) {
    console.log('   Columns:', Object.keys(contact[0]).join(', '));
  } else if (contactError) {
    console.log('   Error:', contactError.message);
  } else {
    console.log('   (empty table)');
  }

  // Check forms table
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .limit(1);

  console.log('\n📋 FORMS table structure:');
  if (form && form.length > 0) {
    console.log('   Columns:', Object.keys(form[0]).join(', '));
  } else if (formError) {
    console.log('   Error:', formError.message);
  } else {
    console.log('   (empty table)');
  }

  // Check form_responses table
  const { data: response, error: responseError } = await supabase
    .from('form_responses')
    .select('*')
    .limit(1);

  console.log('\n📋 FORM_RESPONSES table structure:');
  if (response && response.length > 0) {
    console.log('   Columns:', Object.keys(response[0]).join(', '));
  } else if (responseError) {
    console.log('   Error:', responseError.message);
  } else {
    console.log('   (empty table)');
  }

  // Try to insert test data
  console.log('\n\n🧪 Testing inserts...\n');

  // Test lead insert
  const { data: testLead, error: testLeadError } = await supabase
    .from('leads')
    .insert([{
      name: 'Test Company',
      email: `test-${Date.now()}@test.com`,
      status: 'NEW'
    }])
    .select();

  if (testLeadError) {
    console.log('❌ Lead insert failed:', testLeadError.message);
  } else {
    console.log('✅ Lead inserted:', testLead[0]?.id);
  }

  // Test contact insert
  const { data: testContact, error: testContactError } = await supabase
    .from('contacts')
    .insert([{
      first_name: 'Test',
      last_name: 'User',
      email: `testuser-${Date.now()}@test.com`
    }])
    .select();

  if (testContactError) {
    console.log('❌ Contact insert failed:', testContactError.message);
  } else {
    console.log('✅ Contact inserted:', testContact[0]?.id);
  }

  console.log('\n✨ Schema check complete!\n');
}

checkSchema();
