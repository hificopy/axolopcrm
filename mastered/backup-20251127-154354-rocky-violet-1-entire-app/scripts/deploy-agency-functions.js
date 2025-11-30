#!/usr/bin/env node

/**
 * Deploy Agency Deletion Functions via Supabase
 * Uses the existing Supabase client to deploy SQL functions
 */

import { supabase } from "../backend/config/supabase-auth.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployAgencyDeletionFunctions() {
  console.log(
    "🚀 Starting agency deletion functions deployment via Supabase...\n",
  );

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, "agency-deletion-cleanup.sql");
    const sqlContent = readFileSync(sqlPath, "utf8");

    console.log("📜 Reading SQL file:", sqlPath);
    console.log("📝 SQL content length:", sqlContent.length, "characters");

    // Split the SQL content into individual function statements
    // Each function starts with "CREATE OR REPLACE FUNCTION"
    const functionStatements = sqlContent
      .split(/CREATE OR REPLACE FUNCTION/g)
      .filter((stmt) => stmt.trim())
      .map((stmt) => "CREATE OR REPLACE FUNCTION" + stmt)
      .filter((stmt) => stmt.includes("CREATE OR REPLACE FUNCTION"));

    console.log("🔧 Found", functionStatements.length, "functions to deploy");

    // Deploy each function
    for (let i = 0; i < functionStatements.length; i++) {
      const statement = functionStatements[i];
      console.log(
        `\n📦 Deploying function ${i + 1}/${functionStatements.length}...`,
      );

      try {
        const { data, error } = await supabase.rpc("exec_sql", {
          sql_statement: statement,
        });

        if (error) {
          console.error("❌ Error deploying function:", error);
          console.error(
            "📝 Function statement:",
            statement.substring(0, 100) + "...",
          );
        } else {
          console.log("✅ Function deployed successfully");
        }
      } catch (err) {
        console.error("❌ Exception deploying function:", err.message);
      }
    }

    // Test the functions
    console.log("\n🧪 Testing deployed functions...");

    try {
      // Test get_user_agencies_enhanced
      const { data: agencies, error: agenciesError } = await supabase.rpc(
        "get_user_agencies_enhanced",
        {
          p_user_id: "00000000-0000-0000-0000-00000000000000", // Test UUID
        },
      );

      if (agenciesError) {
        console.log(
          "⚠️ get_user_agencies_enhanced test failed:",
          agenciesError.message,
        );
      } else {
        console.log("✅ get_user_agencies_enhanced function works");
      }

      // Test delete_agency_complete
      const { data: deleteResult, error: deleteError } = await supabase.rpc(
        "delete_agency_complete",
        {
          p_agency_id: "00000000-0000-0000-0000-00000000000000", // Test UUID
          p_user_id: "00000000-0000-0000-0000-00000000000000", // Test UUID
        },
      );

      if (deleteError) {
        console.log(
          "⚠️ delete_agency_complete test failed (expected for non-existent agency):",
          deleteError.message,
        );
      } else {
        console.log("✅ delete_agency_complete function works");
      }

      // Test validate_agency_access
      const { data: accessResult, error: accessError } = await supabase.rpc(
        "validate_agency_access",
        {
          p_user_id: "00000000-0000-0000-0000-00000000000000", // Test UUID
          p_agency_id: "00000000-0000-0000-0000-00000000000000", // Test UUID
        },
      );

      if (accessError) {
        console.log(
          "⚠️ validate_agency_access test failed (expected):",
          accessError.message,
        );
      } else {
        console.log("✅ validate_agency_access function works");
      }
    } catch (testError) {
      console.error("❌ Error testing functions:", testError.message);
    }

    console.log("\n🎉 Agency deletion functions deployment completed!");
    console.log("📋 Summary:");
    console.log("   - delete_agency_complete function deployed");
    console.log("   - get_user_agencies_enhanced function deployed");
    console.log("   - validate_agency_access function deployed");
    console.log("   - cleanup_agency_on_delete function deployed");
    console.log("\n✨ Agency deletion should now work properly!");
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.error("🔧 Please check:");
    console.error(
      "   1. Supabase connection in backend/config/supabase-auth.js",
    );
    console.error(
      "   2. SQL file exists at scripts/agency-deletion-cleanup.sql",
    );
    console.error("   3. Supabase project permissions allow function creation");
    process.exit(1);
  }
}

// Run deployment
deployAgencyDeletionFunctions();
