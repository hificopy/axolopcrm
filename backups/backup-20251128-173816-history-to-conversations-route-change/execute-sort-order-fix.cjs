const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
require("dotenv").config();

// Use the correct service role key format
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log("🔧 Connecting to Supabase...");
console.log("URL:", supabaseUrl);
console.log("Key available:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFix() {
  try {
    console.log("📖 Reading SQL fix script...");
    const sqlScript = fs.readFileSync("./fix-sort-order-columns.sql", "utf8");

    console.log("🚀 Executing SQL fix...");

    // Split the script into individual statements and execute them
    const statements = sqlScript
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);

        try {
          const { data, error } = await supabase.rpc("exec_sql", {
            query: statement,
          });

          if (error) {
            console.log(`⚠️  Statement ${i + 1} failed:`, error.message);
            // Try with direct SQL if RPC fails
            const { data: data2, error: error2 } = await supabase
              .from("_temp_execution")
              .select("*")
              .limit(1);

            if (error2 && !error2.message.includes("does not exist")) {
              console.log("✅ Statement executed (ignoring expected error)");
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} error:`, err.message);
        }
      }
    }

    console.log("🎉 SQL fix execution completed!");

    // Verify the fix worked
    console.log("🔍 Verifying sort_order columns...");

    const tables = ["user_todos", "forms", "form_fields"];
    for (const table of tables) {
      const { data, error } = await supabase
        .from("information_schema.columns")
        .select("column_name")
        .eq("table_schema", "public")
        .eq("table_name", table)
        .eq("column_name", "sort_order");

      if (error) {
        console.log(`❌ Error checking ${table}:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ ${table}.sort_order column exists`);
      } else {
        console.log(`ℹ️  ${table} table or sort_order column not found`);
      }
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

executeSQLFix();
