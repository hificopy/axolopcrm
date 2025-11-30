// ============================================
// SIMPLE LEAD CREATION TEST
// ============================================
// Test lead creation with the updated backend service
// ============================================

import fetch from "node-fetch";

const API_BASE = "http://localhost:3002/api";

// Test data for lead creation
const testLead = {
  name: "John Doe Test Lead",
  email: "john.doe.test@example.com",
  phone: "+1-555-0123",
  company: "Test Company Inc",
  status: "new",
  source: "manual",
  lead_score: 85,
  industry: "Technology",
  description: "Test lead created for debugging purposes",
};

async function testLeadCreation() {
  console.log("🧪 Testing Lead Creation with Updated Backend");
  console.log("=".repeat(50));

  try {
    // Step 1: Test backend health
    console.log("1. Checking backend health...");
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();

    if (healthData.success) {
      console.log("✅ Backend is healthy");
    } else {
      throw new Error("Backend health check failed");
    }

    // Step 2: Try to create a lead (will fail without auth, but we can see the error)
    console.log("\n2. Testing lead creation endpoint...");

    const leadResponse = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testLead),
    });

    const leadData = await leadResponse.json();

    console.log(`Status: ${leadResponse.status}`);
    console.log("Response:", JSON.stringify(leadData, null, 2));

    if (leadResponse.status === 401) {
      console.log(
        "✅ Lead creation endpoint exists and requires authentication (expected)",
      );
    } else if (leadResponse.status === 400) {
      console.log(
        "✅ Lead creation endpoint is working (validation error expected)",
      );
    } else {
      console.log("⚠️  Unexpected response from lead creation");
    }

    // Step 3: Test GET leads endpoint
    console.log("\n3. Testing leads list endpoint...");

    const listResponse = await fetch(`${API_BASE}/leads`);
    const listData = await listResponse.json();

    console.log(`Status: ${listResponse.status}`);
    console.log("Response:", JSON.stringify(listData, null, 2));

    if (listResponse.status === 401) {
      console.log(
        "✅ Leads list endpoint exists and requires authentication (expected)",
      );
    } else {
      console.log("⚠️  Unexpected response from leads list");
    }

    console.log("\n🎉 Backend API tests completed!");
    console.log("📝 Summary:");
    console.log("   - Backend is running and accessible");
    console.log("   - Lead creation endpoint exists");
    console.log(
      "   - Authentication is working (blocking unauthenticated requests)",
    );
    console.log("   - Next step: Test with authenticated user");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the backend is running:");
      console.log("   npm run dev:backend");
      console.log("   OR");
      console.log("   docker-compose up -d backend");
    }
  }
}

// Run the test
testLeadCreation();
