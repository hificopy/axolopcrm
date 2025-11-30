#!/usr/bin/env node

// Comprehensive Forms Debug Test
// Tests forms functionality without authentication requirements

import { createClient } from "@supabase/supabase-js";

// Configuration - using environment variables
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://fuclpfhitgwugxogxkmw.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "your_supabase_service_role_key_here";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testFormsDatabase() {
  console.log("🔍 TESTING FORMS DATABASE SCHEMA...\n");

  try {
    // Test 1: Check if forms table exists and get schema
    console.log("1. Checking forms table structure...");
    const { data: formsData, error: formsError } = await supabase
      .from("forms")
      .select("*")
      .limit(1);

    if (formsError) {
      console.log("❌ Forms table error:", formsError.message);
      console.log("   Details:", formsError);
      return false;
    } else {
      console.log("✅ Forms table accessible");
      if (formsData.length > 0) {
        console.log("   Sample columns:", Object.keys(formsData[0]));
      }
    }

    // Test 2: Check if user_id column exists
    console.log("\n2. Checking user_id column...");
    const { data: columnData, error: columnError } = await supabase
      .from("forms")
      .select("id, title, user_id, created_by")
      .limit(1);

    if (columnError) {
      if (columnError.message.includes('column "user_id" does not exist')) {
        console.log("❌ user_id column missing - need to run migration");
        return false;
      } else {
        console.log("❌ Column check error:", columnError.message);
        return false;
      }
    } else {
      console.log("✅ user_id column exists");
    }

    // Test 3: Check form_responses table
    console.log("\n3. Checking form_responses table...");
    const { data: responsesData, error: responsesError } = await supabase
      .from("form_responses")
      .select("*")
      .limit(1);

    if (responsesError) {
      console.log("❌ Form responses table error:", responsesError.message);
      return false;
    } else {
      console.log("✅ Form responses table accessible");
      if (responsesData.length > 0) {
        console.log("   Sample columns:", Object.keys(responsesData[0]));
      }
    }

    // Test 4: Check existing forms count
    console.log("\n4. Counting existing forms...");
    const { count, error: countError } = await supabase
      .from("forms")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.log("❌ Count error:", countError.message);
      return false;
    } else {
      console.log(`✅ Found ${count} forms in database`);
    }

    return true;
  } catch (error) {
    console.log("❌ Database test failed:", error.message);
    return false;
  }
}

async function testFormCreation() {
  console.log("\n🔧 TESTING FORM CREATION...\n");

  try {
    // Create a test user first (if needed)
    const testUserId = "00000000-0000-0000-0000-000000000001"; // Mock user ID for testing

    console.log("1. Creating test form...");
    const testForm = {
      user_id: testUserId,
      title: "Debug Test Form",
      description: "This is a test form for debugging",
      questions: [
        {
          id: "1",
          type: "short-text",
          title: "What is your name?",
          required: true,
          options: [],
          settings: { placeholder: "Enter your name" },
        },
        {
          id: "2",
          type: "email",
          title: "What is your email?",
          required: true,
          options: [],
          settings: { placeholder: "your@email.com" },
        },
      ],
      settings: {
        branding: true,
        analytics: true,
        notifications: true,
        mode: "standard",
        theme: "default",
        create_contact: true,
      },
      is_active: true,
      is_published: false,
    };

    const { data: createdForm, error: createError } = await supabase
      .from("forms")
      .insert([testForm])
      .select()
      .single();

    if (createError) {
      console.log("❌ Form creation error:", createError.message);
      console.log("   Details:", createError);
      return null;
    } else {
      console.log("✅ Form created successfully");
      console.log(`   Form ID: ${createdForm.id}`);
      console.log(`   Title: ${createdForm.title}`);
      return createdForm;
    }
  } catch (error) {
    console.log("❌ Form creation failed:", error.message);
    return null;
  }
}

async function testFormSubmission(formId) {
  console.log("\n📝 TESTING FORM SUBMISSION...\n");

  if (!formId) {
    console.log("❌ No form ID provided for submission test");
    return false;
  }

  try {
    console.log("1. Submitting test response...");
    const testResponse = {
      form_id: formId,
      responses: {
        1: "Test User",
        2: "test@example.com",
      },
      lead_score: 0,
      lead_score_breakdown: {},
      is_qualified: false,
      contact_email: "test@example.com",
      contact_name: "Test User",
      contact_phone: null,
      ip_address: "127.0.0.1",
      user_agent: "Debug Test Script",
      referrer: "localhost",
    };

    const { data: submittedResponse, error: submitError } = await supabase
      .from("form_responses")
      .insert([testResponse])
      .select()
      .single();

    if (submitError) {
      console.log("❌ Form submission error:", submitError.message);
      console.log("   Details:", submitError);
      return false;
    } else {
      console.log("✅ Form response submitted successfully");
      console.log(`   Response ID: ${submittedResponse.id}`);
      console.log(`   Contact Email: ${submittedResponse.contact_email}`);
      return true;
    }
  } catch (error) {
    console.log("❌ Form submission failed:", error.message);
    return false;
  }
}

async function testFormRetrieval(formId) {
  console.log("\n📖 TESTING FORM RETRIEVAL...\n");

  if (!formId) {
    console.log("❌ No form ID provided for retrieval test");
    return false;
  }

  try {
    console.log("1. Retrieving form by ID...");
    const { data: retrievedForm, error: retrieveError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .single();

    if (retrieveError) {
      console.log("❌ Form retrieval error:", retrieveError.message);
      return false;
    } else {
      console.log("✅ Form retrieved successfully");
      console.log(`   Title: ${retrievedForm.title}`);
      console.log(`   Questions: ${retrievedForm.questions.length} items`);
      return true;
    }
  } catch (error) {
    console.log("❌ Form retrieval failed:", error.message);
    return false;
  }
}

async function cleanupTestData(formId) {
  console.log("\n🧹 CLEANING UP TEST DATA...\n");

  if (!formId) {
    console.log("❌ No form ID provided for cleanup");
    return;
  }

  try {
    // Delete form responses first (foreign key constraint)
    const { error: responseDeleteError } = await supabase
      .from("form_responses")
      .delete()
      .eq("form_id", formId);

    if (responseDeleteError) {
      console.log(
        "⚠️  Warning: Could not delete form responses:",
        responseDeleteError.message,
      );
    } else {
      console.log("✅ Test form responses deleted");
    }

    // Delete the form
    const { error: formDeleteError } = await supabase
      .from("forms")
      .delete()
      .eq("id", formId);

    if (formDeleteError) {
      console.log("❌ Could not delete test form:", formDeleteError.message);
    } else {
      console.log("✅ Test form deleted");
    }
  } catch (error) {
    console.log("❌ Cleanup failed:", error.message);
  }
}

async function runComprehensiveTest() {
  console.log("🚀 COMPREHENSIVE FORMS DEBUG TEST\n");
  console.log("=====================================\n");

  // Test 1: Database schema
  const dbOk = await testFormsDatabase();
  if (!dbOk) {
    console.log("\n❌ DATABASE TESTS FAILED - Cannot continue");
    console.log("   Please run the database migrations first:");
    console.log(
      "   psql -d your_database -f src/backend/db/migrations/002_ensure_user_isolation.sql",
    );
    return;
  }

  // Test 2: Form creation
  const testForm = await testFormCreation();
  if (!testForm) {
    console.log("\n❌ FORM CREATION FAILED - Cannot continue");
    return;
  }

  // Test 3: Form retrieval
  const retrieveOk = await testFormRetrieval(testForm.id);
  if (!retrieveOk) {
    console.log("\n❌ FORM RETRIEVAL FAILED");
  }

  // Test 4: Form submission
  const submitOk = await testFormSubmission(testForm.id);
  if (!submitOk) {
    console.log("\n❌ FORM SUBMISSION FAILED");
  }

  // Cleanup
  await cleanupTestData(testForm.id);

  console.log("\n🎯 TEST SUMMARY");
  console.log("================");
  console.log(`Database Schema: ${dbOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Form Creation: ${testForm ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Form Retrieval: ${retrieveOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Form Submission: ${submitOk ? "✅ PASS" : "❌ FAIL"}`);

  if (dbOk && testForm && retrieveOk && submitOk) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Forms functionality is working correctly.",
    );
  } else {
    console.log("\n⚠️  SOME TESTS FAILED! Please check the errors above.");
  }
}

// Run the test
runComprehensiveTest().catch(console.error);
