import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAuthToken() {
  try {
    // Try to sign in with existing test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "axolopcrm@gmail.com",
      password: "AxolopCRM2024!",
    });

    if (error) {
      console.error("❌ Sign in error:", error.message);
      return null;
    }

    console.log("✅ Successfully signed in");
    console.log("🔑 Access Token:", data.session.access_token);
    console.log("👤 User ID:", data.user.id);
    console.log("📧 Email:", data.user.email);

    return data.session.access_token;
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return null;
  }
}

getAuthToken();
