// Test script to check environment variables
console.log("Testing environment variables...");

console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "VITE_SUPABASE_ANON_KEY exists:",
  !!import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// List all VITE_ env vars
const viteVars = Object.keys(import.meta.env).filter((key) =>
  key.startsWith("VITE_"),
);
console.log("All VITE_ variables:", viteVars);

// Test Supabase import
import { createClient } from "@supabase/supabase-js";
console.log("createClient imported:", typeof createClient);

if (
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.log("Environment variables look good, attempting client creation...");
  try {
    const client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
    console.log("Client created successfully:", !!client);
  } catch (error) {
    console.error("Client creation failed:", error);
  }
} else {
  console.error("Missing environment variables");
}
