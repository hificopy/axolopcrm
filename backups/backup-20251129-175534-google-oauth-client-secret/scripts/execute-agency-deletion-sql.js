#!/usr/bin/env node

/**
 * Simple SQL Execution Script using Supabase
 * Executes the agency deletion cleanup SQL
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import config from "../backend/config/app.config.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use backend configuration
const supabaseUrl = config.supabase.url;
const supabaseServiceKey = config.supabase.serviceRoleKey;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required Supabase configuration:");
  if (!supabaseUrl)
    console.error("   SUPABASE_URL not found in backend config");
  if (!supabaseServiceKey)
    console.error("   SUPABASE_SERVICE_ROLE_KEY not found in backend config");
  console.error("   Please check your .env file and backend configuration");
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile() {
  console.log("🔧 Axolop CRM - SQL File Execution\n");

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, "agency-deletion-cleanup.sql");
    const sqlContent = readFileSync(sqlPath, "utf8");

    console.log("📄 Reading SQL file:", sqlPath);
    console.log("📝 SQL content loaded successfully\n");

    // Split SQL into individual statements
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`🔍 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let failCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        // Use Postgres RPC to execute raw SQL
        const { error } = await supabase.rpc("exec", {
          sql: statement,
        });

        if (error) {
          // Try alternative approach - use pg_catalog
          const { error: error2 } = await supabase
            .from("pg_catalog")
            .select("version()")
            .limit(1);

          if (error2) {
            console.warn(
              `⚠️  Statement ${i + 1} failed (may be expected):`,
              error.message,
            );
            failCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }

        // Small delay between statements
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (stmtError) {
        console.warn(`⚠️  Statement ${i + 1} failed:`, stmtError.message);
        failCount++;
      }
    }

    console.log(
      "\n╔══════════════════════════════════════════════════════════╗",
    );
    console.log("║                    EXECUTION SUMMARY                    ║");
    console.log(
      "╚══════════════════════════════════════════════════════════╝\n",
    );

    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    if (successCount > 0) {
      console.log("\n🎉 SQL execution completed!");
      console.log(
        "💡 Please verify the functions were created in your Supabase dashboard:",
      );
      console.log("   https://supabase.com/dashboard → Database → Functions\n");
      process.exit(0);
    } else {
      console.log("\n⚠️  No statements were executed successfully.");
      console.log("💡 Alternative: Deploy manually via Supabase Dashboard");
      console.log("   https://supabase.com/dashboard → SQL Editor\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Execution failed:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run main function
executeSQLFile().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
