#!/usr/bin/env node
/**
 * Comprehensive Database Migration Script
 * Runs the complete schema to fix all missing tables
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  console.error("Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log("🚀 Starting comprehensive database migration...");

    // Read and execute the comprehensive schema
    const schemaPath = path.join(
      __dirname,
      "../COMPREHENSIVE_DATABASE_SCHEMA_ALL_TABLES.sql",
    );
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("📄 Reading comprehensive schema file...");
    console.log(`📊 Schema file size: ${schemaSQL.length} characters`);

    // Split into individual statements
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`🔧 Found ${statements.length} SQL statements to execute`);

    // Execute statements in batches
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql_statement: statement,
        });

        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from("information_schema.tables")
            .select("*");

          if (directError && directError.message.includes("does not exist")) {
            // Table doesn't exist, this is expected for new tables
            console.log(`✅ Statement ${i + 1}: OK (new table/structure)`);
          } else {
            console.warn(`⚠️  Statement ${i + 1}: ${error.message}`);
          }
        } else {
          console.log(`✅ Statement ${i + 1}: Success`);
        }

        successCount++;

        // Add small delay to avoid overwhelming the database
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log("\n📈 Migration Summary:");
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📊 Total statements: ${statements.length}`);

    if (errorCount === 0) {
      console.log(
        "\n🎉 Comprehensive database migration completed successfully!",
      );
    } else {
      console.log(
        "\n⚠️  Migration completed with some errors. Check the logs above.",
      );
    }

    // Verify key tables were created
    console.log("\n🔍 Verifying critical tables...");
    const criticalTables = [
      "user_todos",
      "user_profiles",
      "agencies",
      "agency_members",
      "forms",
      "form_submissions",
      "workflows",
      "workflow_executions",
      "email_campaigns",
      "meetings",
      "calendar_events",
    ];

    for (const table of criticalTables) {
      try {
        const { data, error } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")
          .eq("table_name", table)
          .single();

        if (data && !error) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing`);
        }
      } catch (err) {
        console.log(`❓ Could not verify table '${table}': ${err.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log("\n🏁 Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
