// Debug script to check environment variables
console.log("=== ENVIRONMENT DEBUG ===");
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "VITE_SUPABASE_ANON_KEY:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
);
console.log("NODE_ENV:", import.meta.env.NODE_ENV);
console.log("MODE:", import.meta.env.MODE);

// Test Supabase connection
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log(
  "Supabase Key Length:",
  supabaseAnonKey ? supabaseAnonKey.length : 0,
);

if (supabaseUrl && supabaseAnonKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client created successfully");

    // Test connection
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("❌ Supabase session error:", error.message);
      } else {
        console.log("✅ Supabase connection working");
      }
    });
  } catch (err) {
    console.error("❌ Supabase client creation failed:", err.message);
  }
} else {
  console.error("❌ Environment variables not loaded");
}
