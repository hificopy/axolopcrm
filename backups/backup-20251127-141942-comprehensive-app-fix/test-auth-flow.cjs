const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Test authentication flow end-to-end
async function testAuthFlow() {
  console.log("🧪 Testing Authentication Flow End-to-End");
  console.log("=".repeat(50));

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Create clients
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Test 1: Anonymous client can connect
    console.log("1️⃣ Testing anonymous client connection...");
    const { data: anonData, error: anonError } = await anonClient
      .from("users")
      .select("count")
      .limit(1);
    if (anonError) {
      console.log("❌ Anonymous client error:", anonError.message);
    } else {
      console.log("✅ Anonymous client working");
    }

    // Test 2: Service role client can connect
    console.log("2️⃣ Testing service role client connection...");
    const { data: serviceData, error: serviceError } = await serviceClient
      .from("users")
      .select("count")
      .limit(1);
    if (serviceError) {
      console.log("❌ Service role client error:", serviceError.message);
    } else {
      console.log("✅ Service role client working");
    }

    // Test 3: Test JWT token validation
    console.log("3️⃣ Testing JWT token validation...");

    // Create a test user session
    const { data: signInData, error: signInError } =
      await anonClient.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpassword123",
      });

    if (signInError) {
      console.log(
        "⚠️ Test user sign-in failed (expected):",
        signInError.message,
      );
    } else {
      console.log("✅ Test user signed in");

      // Test token validation with service client
      const token = signInData.session.access_token;
      const { data: userData, error: userError } =
        await serviceClient.auth.getUser(token);

      if (userError) {
        console.log("❌ Token validation failed:", userError.message);
      } else {
        console.log("✅ Token validation working");
      }
    }

    // Test 4: Test database schema fixes
    console.log("4️⃣ Testing database schema...");

    // Check if campaign_emails table exists
    const { data: campaignEmails, error: campaignError } = await serviceClient
      .from("campaign_emails")
      .select("id")
      .limit(1);

    if (campaignError) {
      console.log("❌ campaign_emails table error:", campaignError.message);
    } else {
      console.log("✅ campaign_emails table exists");
    }

    // Check if workflow_executions function exists
    const { data: executionsData, error: executionsError } =
      await serviceClient.rpc("get_pending_workflow_executions", {
        p_limit: 1,
      });

    if (executionsError) {
      console.log(
        "❌ get_pending_workflow_executions function error:",
        executionsError.message,
      );
    } else {
      console.log("✅ get_pending_workflow_executions function exists");
    }

    // Test 5: Test API authentication
    console.log("5️⃣ Testing API authentication...");

    // Test without token
    const response1 = await fetch("http://localhost:3002/api/v1/users/me");
    if (response1.status === 401) {
      console.log("✅ API correctly rejects unauthenticated requests");
    } else {
      console.log("❌ API should reject unauthenticated requests");
    }

    // Test with invalid token
    const response2 = await fetch("http://localhost:3002/api/v1/users/me", {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });
    if (response2.status === 401) {
      console.log("✅ API correctly rejects invalid tokens");
    } else {
      console.log("❌ API should reject invalid tokens");
    }

    console.log("=".repeat(50));
    console.log("🎯 Authentication Flow Test Complete");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testAuthFlow();
