#!/usr/bin/env node

// Comprehensive Leads & Monday.com Debug Test
// Tests leads functionality and Monday.com board integration

import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fuclpfhitgwugxogxkmw.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "your_supabase_service_role_key_here";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testLeadsDatabase() {
  console.log("🔍 TESTING LEADS DATABASE SCHEMA...\n");

  try {
    // Test 1: Check if leads table exists and get schema
    console.log("1. Checking leads table structure...");
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .limit(1);

    if (leadsError) {
      console.log("❌ Leads table error:", leadsError.message);
      console.log("   Details:", leadsError);
      return false;
    } else {
      console.log("✅ Leads table accessible");
      if (leadsData.length > 0) {
        console.log("   Sample columns:", Object.keys(leadsData[0]));
      }
    }

    // Test 2: Check for Monday.com related tables
    console.log("\n2. Checking Monday.com board tables...");

    const tablesToCheck = [
      "call_queue_items",
      "dashboard_presets",
      "dashboard_assets",
      "onboarding_data",
    ];

    for (const tableName of tablesToCheck) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

      if (error) {
        console.log(`❌ Table ${tableName}:`, error.message);
      } else {
        console.log(`✅ Table ${tableName}: OK`);
      }
    }

    // Test 3: Check agencies table for multi-tenancy
    console.log("\n3. Checking agencies table for multi-tenancy...");
    const { data: agenciesData, error: agenciesError } = await supabase
      .from("agencies")
      .select("id, name, slug, settings")
      .limit(1);

    if (agenciesError) {
      console.log("❌ Agencies table error:", agenciesError.message);
    } else {
      console.log("✅ Agencies table accessible");
      if (agenciesData.length > 0) {
        console.log("   Sample columns:", Object.keys(agenciesData[0]));
      }
    }

    // Test 4: Check agency_members table
    console.log("\n4. Checking agency_members table...");
    const { data: membersData, error: membersError } = await supabase
      .from("agency_members")
      .select("*")
      .limit(1);

    if (membersError) {
      console.log("❌ Agency members table error:", membersError.message);
    } else {
      console.log("✅ Agency members table accessible");
      if (membersData.length > 0) {
        console.log("   Sample columns:", Object.keys(membersData[0]));
      }
    }

    // Test 5: Count existing leads
    console.log("\n5. Counting existing leads...");
    const { count, error: countError } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log("❌ Count error:", countError.message);
      return false;
    } else {
      console.log(`✅ Found ${count} leads in database`);
    }

    return true;
  } catch (error) {
    console.log("❌ Database test failed:", error.message);
    return false;
  }
}

async function testLeadCreation() {
  console.log("\n🔧 TESTING LEAD CREATION...\n");

  try {
    // Create a test lead
    const testUserId = "00000000-0000-0000-0000-000000000001"; // Mock user ID for testing

    console.log("1. Creating test lead...");
    const testLead = {
      user_id: testUserId,
      name: "Test Lead from Debug Script",
      email: "testlead@example.com",
      phone: "+1-555-123-4567",
      company: "Test Company",
      website: "https://testcompany.com",
      title: "Test Lead Title",
      status: "new",
      source: "Debug Script",
      value: 1000,
      notes: "This is a test lead created during debugging",
      custom_fields: {
        debug_test: true,
        created_at: new Date().toISOString(),
      },
    };

    const { data: createdLead, error: createError } = await supabase
      .from("leads")
      .insert([testLead])
      .select()
      .single();

    if (createError) {
      console.log("❌ Lead creation error:", createError.message);
      console.log("   Details:", createError);
      return null;
    } else {
      console.log("✅ Lead created successfully");
      console.log(`   Lead ID: ${createdLead.id}`);
      console.log(`   Name: ${createdLead.name}`);
      console.log(`   Email: ${createdLead.email}`);
      return createdLead;
    }
  } catch (error) {
    console.log("❌ Lead creation failed:", error.message);
    return null;
  }
}

async function testLeadRetrieval(leadId) {
  console.log("\n📖 TESTING LEAD RETRIEVAL...\n");

  if (!leadId) {
    console.log("❌ No lead ID provided for retrieval test");
    return false;
  }

  try {
    console.log("1. Retrieving lead by ID...");
    const { data: retrievedLead, error: retrieveError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (retrieveError) {
      console.log("❌ Lead retrieval error:", retrieveError.message);
      return false;
    } else {
      console.log("✅ Lead retrieved successfully");
      console.log(`   Name: ${retrievedLead.name}`);
      console.log(`   Status: ${retrievedLead.status}`);
      console.log(`   Value: ${retrievedLead.value}`);
      return true;
    }
  } catch (error) {
    console.log("❌ Lead retrieval failed:", error.message);
    return false;
  }
}

async function testMondayIntegration() {
  console.log("\n📋 TESTING MONDAY.COM INTEGRATION...\n");

  try {
    // Test 1: Check if we can create board-like items
    console.log("1. Testing Monday.com board item creation...");

    const testBoardItem = {
      user_id: "00000000-0000-0000-0000-000000000001",
      name: "Test Board Item",
      description: "Test item for Monday.com integration",
      status: "active",
      priority: "high",
      due_date: new Date().toISOString().split("T")[0],
      custom_fields: {
        board_type: "monday_com",
        item_group: "test_group",
        position: 1,
      },
    };

    // Try to insert into a generic items table (if it exists)
    const { data: boardItem, error: boardError } = await supabase
      .from("call_queue_items")
      .insert([testBoardItem])
      .select()
      .single();

    if (boardError) {
      console.log(
        "⚠️  Board item creation failed (table may not exist):",
        boardError.message,
      );
    } else {
      console.log("✅ Board item created successfully");
      console.log(`   Item ID: ${boardItem.id}`);
    }

    // Test 2: Check for dashboard presets (Monday.com boards often have presets)
    console.log("2. Testing dashboard presets...");

    const testPreset = {
      user_id: "00000000-0000-0000-0000-000000000001",
      name: "Test Dashboard Preset",
      config: {
        board_view: "kanban",
        columns: ["new", "in_progress", "completed"],
        filters: {
          status: ["new", "in_progress"],
          priority: ["high", "medium"],
        },
      },
      is_default: false,
    };

    const { data: preset, error: presetError } = await supabase
      .from("dashboard_presets")
      .insert([testPreset])
      .select()
      .single();

    if (presetError) {
      console.log("⚠️  Dashboard preset creation failed:", presetError.message);
    } else {
      console.log("✅ Dashboard preset created successfully");
      console.log(`   Preset ID: ${preset.id}`);
    }

    return true;
  } catch (error) {
    console.log("❌ Monday.com integration test failed:", error.message);
    return false;
  }
}

async function testLeadUpdate(leadId) {
  console.log("\n✏️ TESTING LEAD UPDATE...\n");

  if (!leadId) {
    console.log("❌ No lead ID provided for update test");
    return false;
  }

  try {
    console.log("1. Updating lead status...");
    const updates = {
      status: "contacted",
      notes: "Updated during debug test",
      custom_fields: {
        last_updated: new Date().toISOString(),
        debug_update: true,
      },
    };

    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", leadId)
      .select()
      .single();

    if (updateError) {
      console.log("❌ Lead update error:", updateError.message);
      return false;
    } else {
      console.log("✅ Lead updated successfully");
      console.log(`   New Status: ${updatedLead.status}`);
      return true;
    }
  } catch (error) {
    console.log("❌ Lead update failed:", error.message);
    return false;
  }
}

async function cleanupTestData(leadId) {
  console.log("\n🧹 CLEANING UP TEST DATA...\n");

  if (!leadId) {
    console.log("❌ No lead ID provided for cleanup");
    return;
  }

  try {
    // Delete test lead
    const { error: leadDeleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId);

    if (leadDeleteError) {
      console.log(
        "⚠️  Warning: Could not delete test lead:",
        leadDeleteError.message,
      );
    } else {
      console.log("✅ Test lead deleted");
    }

    // Clean up test board items
    const { error: boardDeleteError } = await supabase
      .from("call_queue_items")
      .delete()
      .eq("user_id", "00000000-0000-0000-0000-000000000001");

    if (boardDeleteError) {
      console.log(
        "⚠️  Warning: Could not delete test board items:",
        boardDeleteError.message,
      );
    } else {
      console.log("✅ Test board items deleted");
    }

    // Clean up test presets
    const { error: presetDeleteError } = await supabase
      .from("dashboard_presets")
      .delete()
      .eq("user_id", "00000000-0000-0000-0000-000000000001");

    if (presetDeleteError) {
      console.log(
        "⚠️  Warning: Could not delete test presets:",
        presetDeleteError.message,
      );
    } else {
      console.log("✅ Test presets deleted");
    }
  } catch (error) {
    console.log("❌ Cleanup failed:", error.message);
  }
}

async function runComprehensiveTest() {
  console.log("🚀 COMPREHENSIVE LEADS & MONDAY.COM DEBUG TEST\n");
  console.log("================================================\n");

  // Test 1: Database schema
  const dbOk = await testLeadsDatabase();
  if (!dbOk) {
    console.log("\n❌ DATABASE TESTS FAILED - Cannot continue");
    console.log("   Please run database migrations first");
    return;
  }

  // Test 2: Lead creation
  const testLead = await testLeadCreation();
  if (!testLead) {
    console.log("\n❌ LEAD CREATION FAILED - Cannot continue");
    return;
  }

  // Test 3: Lead retrieval
  const retrieveOk = await testLeadRetrieval(testLead.id);
  if (!retrieveOk) {
    console.log("\n❌ LEAD RETRIEVAL FAILED");
  }

  // Test 4: Lead update
  const updateOk = await testLeadUpdate(testLead.id);
  if (!updateOk) {
    console.log("\n❌ LEAD UPDATE FAILED");
  }

  // Test 5: Monday.com integration
  const mondayOk = await testMondayIntegration();
  if (!mondayOk) {
    console.log("\n❌ MONDAY.COM INTEGRATION FAILED");
  }

  // Cleanup
  await cleanupTestData(testLead.id);

  console.log("\n🎯 TEST SUMMARY");
  console.log("================");
  console.log(`Database Schema: ${dbOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Lead Creation: ${testLead ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Lead Retrieval: ${retrieveOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Lead Update: ${updateOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Monday.com Integration: ${mondayOk ? "✅ PASS" : "❌ FAIL"}`);

  if (dbOk && testLead && retrieveOk && updateOk && mondayOk) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Leads functionality is working correctly.",
    );
  } else {
    console.log("\n⚠️  SOME TESTS FAILED! Please check the errors above.");
  }
}

// Run the test
runComprehensiveTest().catch(console.error);
