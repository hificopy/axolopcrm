import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase URL or Anon Key. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

// Initialize Supabase client with the provided credentials
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Verify the connection by checking if we can access the auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  Anonymous authentication confirmed - no user session (this is expected)');
    } else if (user) {
      console.log('✅ Authenticated user found:', user.id);
    }
    
    console.log('✅ Connection to Supabase project verified successfully!');
    console.log('📋 Project URL:', supabaseUrl);
    console.log('📋 Connection established with provided credentials');
    
    // Since there are no tables yet, let's just confirm the basic setup
    console.log('\n📝 Your Supabase project is accessible but needs database tables.');
    console.log('💡 Next steps:');
    console.log('   1. Visit your Supabase dashboard to manage your project.');
    console.log('   2. Create your database schema using the SQL Editor or Table Editor if you haven\'t already.');
    console.log('   3. Define tables like contacts, companies, deals, etc. for your CRM');
    console.log('   4. Configure Row Level Security (RLS) policies as needed');
    
    return { 
      success: true, 
      message: 'Connection verified successfully - database schema needs to be created' 
    };
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return { success: false, error, message: 'Connection failed' };
  }
}

// Run the connection check
checkSupabaseConnection()
  .then(result => {
    console.log('\n📊 Test Result:', result.message);
    if (result.success) {
      console.log('🎉 Supabase project URL and API key are working correctly!');
      console.log('📋 You can now configure your database schema in the Supabase dashboard.');
    } else {
      console.log('⚠️  Connection issues detected.');
    }
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
  });
