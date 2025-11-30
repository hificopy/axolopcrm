import SupabaseContactService from './backend/services/supabase-contact-service.js';

async function sendTestData() {
  console.log('🚀 Starting Supabase test data insertion...');
  
  const contactService = new SupabaseContactService();
  
  // Sample test data
  const testData = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      company: 'Example Corp',
      position: 'Software Engineer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0102',
      company: 'Acme Inc',
      position: 'Product Manager',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1-555-0103',
      company: 'Tech Solutions',
      position: 'CTO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  try {
    console.log('📝 Attempting to insert test contacts...');
    
    for (const contact of testData) {
      try {
        // Remove the ID field if it exists since Supabase will auto-generate it
        const { id, ...contactWithoutId } = contact;
        
        console.log(`   Adding: ${contactWithoutId.name}`);
        const createdContact = await contactService.createContact(contactWithoutId);
        console.log(`   ✅ Created contact with ID: ${createdContact.id}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to create contact "${contact.name}":`, error.message);
        console.log('      (This is expected if the "contacts" table does not exist)');
      }
    }
    
    console.log('\n📊 Test data insertion process completed.');
    console.log('\n💡 Note: If insertion failed, you need to:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Create a "contacts" table with appropriate columns');
    console.log('   3. Set proper Row Level Security (RLS) policies');
    console.log('   4. Run this script again');
    
    // Try to read back any existing contacts
    console.log('\n🔍 Attempting to read contacts...');
    try {
      const contacts = await contactService.getContacts(5);
      if (contacts && contacts.length > 0) {
        console.log('✅ Successfully retrieved contacts:');
        contacts.forEach(contact => {
          console.log(`   - ${contact.name} (${contact.email})`);
        });
      } else {
        console.log('ℹ️  No contacts found (expected if table is empty or does not exist)');
      }
    } catch (readError) {
      console.log('⚠️  Could not retrieve contacts:', readError.message);
    }
  } catch (error) {
    console.error('❌ Error during test data insertion:', error);
  }
}

// Run the test
sendTestData()
  .then(() => {
    console.log('\n🏁 Test completed!');
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
  });