import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Create Supabase client with authentication capabilities
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not configured properly.');
  console.error('   Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}

// Create two clients:
// 1. Public client (anon key) - for client-side auth operations
// 2. Server client (service role) - for server-side operations with full access
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const supabaseServer = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Function to get user from request (for middleware)
const getUserFromRequest = async (req) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Get user using server client (with service role key)
    if (supabaseServer) {
      const { data: { user }, error } = await supabaseServer.auth.getUser(token);
      if (error) {
        console.error('Error getting user from token:', error);
        return null;
      }
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getUserFromRequest:', error);
    return null;
  }
};

// Function to create or update user profile in our database
const syncUserProfile = async (supabaseUser) => {
  if (!supabaseUser) return null;

  try {
    // Try to find existing user first
    let { data: user, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (user) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabaseServer
        .from('users')
        .update({
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          first_name: supabaseUser.user_metadata?.first_name,
          last_name: supabaseUser.user_metadata?.last_name,
          profile_picture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          email_verified: supabaseUser.email_confirmed_at ? true : false,
          updated_at: new Date(),
        })
        .eq('id', supabaseUser.id)
        .single();
        
      if (updateError) throw updateError;
      return updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseServer
        .from('users')
        .insert([{
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          first_name: supabaseUser.user_metadata?.first_name,
          last_name: supabaseUser.user_metadata?.last_name,
          profile_picture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
          email_verified: supabaseUser.email_confirmed_at ? true : false,
          role: 'USER', // Default role
          is_active: true,
        }])
        .single();
        
      if (createError) throw createError;
      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user profile:', error);
    throw error;
  }
};

export { 
  supabase, 
  supabaseServer, 
  getUserFromRequest, 
  syncUserProfile 
};