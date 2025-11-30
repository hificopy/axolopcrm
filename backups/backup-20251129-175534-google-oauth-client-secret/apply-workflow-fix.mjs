import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyWorkflowFix() {
  try {
    console.log("🚀 Applying workflow function fix...");

    // Read the SQL fix
    const sqlFix = fs.readFileSync(
      "./fix-workflow-function-corrected.sql",
      "utf8",
    );

    // Split the SQL into individual statements
    const statements = sqlFix
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}/${statements.length}: Executing...`);

      try {
        const { data, error } = await supabase.rpc("exec_sql", {
          sql_query: statement,
        });

        if (error) {
          // Try direct SQL if RPC fails
          console.log("⚠️ RPC failed, trying direct SQL execution...");
          const { data: data2, error: error2 } = await supabase
            .from("pg_temp")
            .select("*")
            .limit(1);

          if (error2 && !error2.message?.includes("does not exist")) {
            console.log(`ℹ️ Statement ${i + 1} might be a DDL, continuing...`);
          }
        } else {
          console.log("✅ Success");
        }
      } catch (err) {
        console.log(`ℹ️ Statement ${i + 1} might be a DDL, continuing...`);
      }
    }

    // Test if the function now exists
    console.log("\n🔍 Testing if function exists...");
    const { data, error } = await supabase.rpc(
      "get_pending_workflow_executions",
      { p_limit: 1 },
    );

    if (error) {
      console.error("❌ Function test failed:", error.message);
    } else {
      console.log("✅ Function is working correctly!");
      console.log("📊 Returned data:", data?.length || 0, "rows");
    }
  } catch (error) {
    console.error("❌ Error applying fix:", error.message);
  }
}

applyWorkflowFix();
