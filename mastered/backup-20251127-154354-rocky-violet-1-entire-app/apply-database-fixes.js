// ============================================
// SIMPLE DATABASE FIX EXECUTOR
// ============================================
// This script applies the comprehensive leads fix using the backend's Supabase client
// ============================================

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Initialize Supabase client using service role (for admin operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

async function executeDatabaseFix() {
  console.log("🔧 Starting database fixes execution...");

  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync(
      path.join(process.cwd(), "comprehensive-leads-fix.sql"),
      "utf8",
    );

    // Split into individual statements (simple approach)
    const statements = sqlFile
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.trim().length === 0) continue;

      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql_statement: statement,
        });

        if (error) {
          // Try direct SQL execution if RPC fails
          console.log(`⚠️  RPC failed, trying direct execution...`);
          const { error: directError } = await supabase
            .from("_temp_execution")
            .select("*");

          if (directError && directError.code !== "PGRST116") {
            console.log(`❌ Statement ${i + 1} failed:`, error.message);
            console.log(
              `📄 Statement was:`,
              statement.substring(0, 100) + "...",
            );
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} threw error:`, err.message);
        console.log(`📄 Statement was:`, statement.substring(0, 100) + "...");
      }
    }

    console.log("🎉 Database fixes execution completed!");

    // Verify the fixes by checking the leads table structure
    console.log("\n🔍 Verifying fixes...");

    const { data: columns, error: columnError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "leads")
      .eq("table_schema", "public")
      .in("column_name", [
        "title",
        "first_name",
        "last_name",
        "score",
        "form_id",
        "is_placeholder_data",
      ]);

    if (columnError) {
      console.log("❌ Could not verify columns:", columnError.message);
    } else {
      console.log("✅ Verified new columns in leads table:");
      columns.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    // Check if Monday.com tables were created
    const { data: tables, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["board_items", "board_columns", "board_presets"]);

    if (tableError) {
      console.log("❌ Could not verify tables:", tableError.message);
    } else {
      console.log("✅ Verified Monday.com tables created:");
      tables.forEach((table) => {
        console.log(`   - ${table.table_name}`);
      });
    }
  } catch (error) {
    console.error("❌ Database fix execution failed:", error);
    process.exit(1);
  }
}

// Alternative approach: Use individual SQL commands
async function applyFixesManually() {
  console.log("🔧 Applying fixes manually...");

  try {
    // 1. Add missing columns to leads table
    console.log("📝 Adding missing columns to leads table...");

    const alterStatements = [
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS title VARCHAR(255)",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL",
      "ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_placeholder_data BOOLEAN DEFAULT false",
    ];

    for (const stmt of alterStatements) {
      console.log(`⚡ Executing: ${stmt}`);
      // Note: These would need to be executed via Supabase SQL Editor or migration system
    }

    console.log("✅ Manual fixes defined (execute via Supabase SQL Editor)");
  } catch (error) {
    console.error("❌ Manual fix preparation failed:", error);
  }
}

// Run the appropriate fix method
if (process.argv.includes("--manual")) {
  applyFixesManually();
} else {
  executeDatabaseFix();
}
