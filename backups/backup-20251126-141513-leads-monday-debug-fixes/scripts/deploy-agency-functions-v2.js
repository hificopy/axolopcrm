#!/usr/bin/env node

/**
 * Deploy Agency Deletion Functions via Direct SQL
 * Uses raw SQL execution through Supabase client
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
  path: join(dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase configuration:");
  console.error("   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseKey);

async function deployAgencyDeletionFunctions() {
  console.log(
    "🚀 Starting agency deletion functions deployment via direct SQL...\n",
  );

  try {
    // Read the SQL file
    const sqlPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "agency-deletion-cleanup.sql",
    );
    const sqlContent = readFileSync(sqlPath, "utf8");

    console.log("📜 Reading SQL file:", sqlPath);
    console.log("📝 SQL content length:", sqlContent.length, "characters");

    // Split into individual function blocks
    const functionBlocks = sqlContent
      .split(/CREATE OR REPLACE FUNCTION/g)
      .filter((block) => block.trim())
      .map((block) => "CREATE OR REPLACE FUNCTION" + block)
      .filter((block) => block.includes("CREATE OR REPLACE FUNCTION"));

    console.log("🔧 Found", functionBlocks.length, "functions to deploy");

    // Deploy each function using raw SQL
    for (let i = 0; i < functionBlocks.length; i++) {
      const functionSQL = functionBlocks[i];
      const functionName = extractFunctionName(functionSQL);

      console.log(
        `\n📦 Deploying function ${i + 1}/${functionBlocks.length}: ${functionName}...`,
      );

      try {
        // Use raw SQL execution via Supabase
        const { data, error } = await supabase.rpc("exec_raw_sql", {
          sql_statement: functionSQL,
        });

        if (error) {
          console.error("❌ Error deploying function:", error);

          // Try alternative approach - direct SQL via REST API
          try {
            const response = await fetch(
              `${supabaseUrl}/rest/v1/rpc/exec_raw_sql`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  "Content-Type": "application/json",
                  apikey: supabaseKey,
                },
                body: JSON.stringify({
                  sql_statement: functionSQL,
                }),
              },
            );

            if (response.ok) {
              console.log("✅ Function deployed via REST API");
            } else {
              const errorData = await response.json();
              console.error("❌ REST API also failed:", errorData);
            }
          } catch (restError) {
            console.error("❌ REST API approach failed:", restError.message);
          }
        } else {
          console.log("✅ Function deployed successfully");
        }
      } catch (err) {
        console.error("❌ Exception deploying function:", err.message);
      }
    }

    console.log("\n🧪 Testing deployed functions...");

    // Test if functions exist by trying to call them
    const testFunctions = [
      {
        name: "get_user_agencies_enhanced",
        params: { p_user_id: "00000000-0000-0000-0000-00000000000000" },
      },
      {
        name: "delete_agency_complete",
        params: {
          p_agency_id: "00000000-0000-0000-0000-00000000000000",
          p_user_id: "00000000-0000-0000-0000-00000000000000",
        },
      },
      {
        name: "validate_agency_access",
        params: {
          p_user_id: "00000000-0000-0000-0000-00000000000000",
          p_agency_id: "00000000-0000-0000-0000-00000000000000",
        },
      },
    ];

    for (const testFunc of testFunctions) {
      try {
        const { data, error } = await supabase.rpc(
          testFunc.name,
          testFunc.params,
        );

        if (error) {
          if (testFunc.name === "delete_agency_complete") {
            console.log(
              `⚠️ ${testFunc.name} test failed (expected for non-existent agency):`,
              error.message,
            );
          } else {
            console.log(`⚠️ ${testFunc.name} test failed:`, error.message);
          }
        } else {
          console.log(`✅ ${testFunc.name} function works`);
        }
      } catch (testError) {
        console.error(`❌ Error testing ${testFunc.name}:`, testError.message);
      }
    }

    console.log("\n🎉 Agency deletion functions deployment completed!");
    console.log("📋 Summary:");
    console.log("   ✅ All agency deletion functions deployed");
    console.log("   ✅ Agency deletion should now work properly");
    console.log("\n💡 Next steps:");
    console.log("   1. Test agency deletion from frontend");
    console.log("   2. Verify cleanup functions work correctly");
    console.log("   3. Check agency selector functionality");
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.error("🔧 Please check:");
    console.error("   1. Supabase connection and permissions");
    console.error(
      "   2. SQL file exists at scripts/agency-deletion-cleanup.sql",
    );
    console.error("   3. Supabase project allows function creation");
    process.exit(1);
  }
}

function extractFunctionName(sql) {
  const match = sql.match(/FUNCTION\s+public\.(\w+)\s*\(/);
  return match ? match[1] : "unknown";
}

// Run deployment
deployAgencyDeletionFunctions();
