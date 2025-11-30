import { createClient } from "@supabase/supabase-js";

// Use the same credentials as the backend service
const supabaseUrl =
  process.env.SUPABASE_URL || "https://fkjupzwgakgexqqhxdqa.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Set" : "Not set");
  console.log(
    "SUPABASE_SERVICE_KEY:",
    process.env.SUPABASE_SERVICE_KEY ? "Set" : "Not set",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTodosTable() {
  try {
    console.log("🔧 Testing current table structure...");

    // Try to select todos with sort_order to see if column exists
    const { data: testData, error: testError } = await supabase
      .from("user_todos")
      .select("id, sort_order")
      .limit(1);

    if (testError) {
      console.log("❌ Error testing sort_order column:", testError.message);

      if (testError.message.includes('column "sort_order" does not exist')) {
        console.log("🔨 Adding missing sort_order column...");

        // Since we can't use exec_sql, let's try a different approach
        // We'll create a new table with the correct structure and copy data
        console.log(
          "🔄 Attempting to recreate table with correct structure...",
        );

        // First, get existing data
        const { data: existingData, error: fetchError } = await supabase
          .from("user_todos")
          .select("*");

        if (fetchError && !fetchError.message.includes("does not exist")) {
          console.error("Error fetching existing data:", fetchError);
        } else if (existingData) {
          console.log(
            `Found ${existingData.length} existing todos to preserve`,
          );
        }

        // Try to add the column using a direct SQL approach through the REST API
        console.log("⚠️  Manual intervention required:");
        console.log("Please run this SQL in your Supabase SQL editor:");
        console.log(`
ALTER TABLE public.user_todos 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_todos_sort_order 
ON public.user_todos(user_id, sort_order);
        `);
      } else {
        console.error("Different error occurred:", testError);
      }
    } else {
      console.log("✅ sort_order column exists and is working!");
      console.log("Test data:", testData);
    }

    // Test the todos API endpoint
    console.log("\n🌐 Testing todos API endpoint...");
    try {
      const response = await fetch(
        "http://localhost:3002/api/user-preferences/todos",
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        console.log(
          "✅ Todos API endpoint is accessible (requires auth for data)",
        );
      } else {
        console.log(
          "📝 Todos API returned:",
          response.status,
          response.statusText,
        );
      }
    } catch (fetchError) {
      console.log("❌ Error testing API:", fetchError.message);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

fixTodosTable();
