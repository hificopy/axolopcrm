#!/usr/bin/env node
/**
 * Database Status Check
 * Checks what tables exist vs what's needed
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkDatabaseStatus() {
  try {
    console.log("🔍 Checking current database status...\n");

    // Get all existing tables
    const { data: existingTables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_type", "BASE TABLE");

    if (tablesError) {
      console.error("❌ Error fetching existing tables:", tablesError);
      return;
    }

    const existingTableNames = existingTables.map((t) => t.table_name);
    console.log(`📊 Found ${existingTableNames.length} existing tables:`);
    existingTableNames.forEach((name) => console.log(`  ✅ ${name}`));

    // Critical tables that should exist
    const criticalTables = [
      "users",
      "user_profiles",
      "user_todos",
      "agencies",
      "agency_members",
      "leads",
      "contacts",
      "opportunities",
      "activities",
      "forms",
      "form_submissions",
      "workflows",
      "workflow_executions",
      "email_campaigns",
      "meetings",
      "calendar_events",
      "custom_fields",
      "dashboard_presets",
    ];

    console.log(`\n🎯 Checking ${criticalTables.length} critical tables:`);
    let missingCount = 0;
    let existingCount = 0;

    criticalTables.forEach((table) => {
      if (existingTableNames.includes(table)) {
        console.log(`  ✅ ${table} - EXISTS`);
        existingCount++;
      } else {
        console.log(`  ❌ ${table} - MISSING`);
        missingCount++;
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`  ✅ Existing critical tables: ${existingCount}`);
    console.log(`  ❌ Missing critical tables: ${missingCount}`);
    console.log(`  📊 Total existing tables: ${existingTableNames.length}`);

    // Check for specific problematic tables mentioned in errors
    console.log(`\n🔍 Checking specific error-prone tables:`);
    const problemTables = ["user_todos", "user_profiles", "agencies"];

    for (const table of problemTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count")
          .limit(1);

        if (error) {
          if (error.message.includes("does not exist")) {
            console.log(`  ❌ ${table} - Table does not exist`);
          } else {
            console.log(`  ⚠️  ${table} - Error: ${error.message}`);
          }
        } else {
          console.log(`  ✅ ${table} - Table accessible`);
        }
      } catch (err) {
        console.log(`  ❓ ${table} - Could not verify: ${err.message}`);
      }
    }

    // Provide next steps
    if (missingCount > 0) {
      console.log(`\n🚀 Next Steps:`);
      console.log(`1. Run the migration file created in scripts/ directory`);
      console.log(`2. Open Supabase SQL Editor`);
      console.log(`3. Copy contents of migration-*.sql file`);
      console.log(`4. Execute the SQL to create missing tables`);
      console.log(
        `\n⚠️  This will fix many "table does not exist" errors in the app`,
      );
    } else {
      console.log(`\n🎉 All critical tables exist! Database is in good shape.`);
    }
  } catch (error) {
    console.error("❌ Database check failed:", error.message);
  }
}

// Run the check
checkDatabaseStatus();
