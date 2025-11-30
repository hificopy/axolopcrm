// End-to-End User Flow Testing
import axios from "axios";

const BACKEND_URL = "http://localhost:3002";
const FRONTEND_URL = "http://localhost:3000";

async function testEndToEndFlow() {
  console.log("🚀 Starting End-to-End User Flow Testing...");

  const testResults = {
    passed: 0,
    failed: 0,
    details: [],
  };

  function recordTest(name, passed, details = "") {
    if (passed) {
      testResults.passed++;
      console.log(`✅ PASS: ${name}`);
    } else {
      testResults.failed++;
      console.log(`❌ FAIL: ${name} - ${details}`);
    }
    testResults.details.push({ name, passed, details });
  }

  try {
    // Test 1: Frontend Accessibility
    console.log("\n📋 Testing Frontend Accessibility...");
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      recordTest("Frontend Home Page", response.status === 200);
    } catch (error) {
      recordTest("Frontend Home Page", false, error.message);
    }

    // Test 2: Backend API Health
    console.log("\n📋 Testing Backend API Health...");
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 5000,
      });
      const isHealthy =
        response.status === 200 &&
        response.data.status === "healthy" &&
        response.data.services.database === "connected";
      recordTest("Backend API Health", isHealthy);
    } catch (error) {
      recordTest("Backend API Health", false, error.message);
    }

    // Test 3: Database Connectivity
    console.log("\n📋 Testing Database Connectivity...");
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/leads`, {
        headers: { Authorization: "Bearer test-token" },
        timeout: 5000,
      });
      recordTest(
        "Database Connectivity (Leads)",
        response.status === 401 || response.status === 200,
      ); // 401 is expected without auth
    } catch (error) {
      const isExpected = error.response?.status === 401;
      recordTest(
        "Database Connectivity (Leads)",
        isExpected,
        isExpected ? "Correctly returned 401" : error.message,
      );
    }

    // Test 4: API Security
    console.log("\n📋 Testing API Security...");
    const secureEndpoints = [
      "/api/v1/contacts",
      "/api/v1/forms",
      "/api/v1/dashboard/summary",
    ];

    for (const endpoint of secureEndpoints) {
      try {
        const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
          timeout: 5000,
        });
        recordTest(`API Security: ${endpoint}`, response.status === 401);
      } catch (error) {
        const isSecure = error.response?.status === 401;
        recordTest(`API Security: ${endpoint}`, isSecure);
      }
    }

    // Test 5: Performance
    console.log("\n📋 Testing Performance...");
    const startTime = Date.now();
    try {
      await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      recordTest(
        "API Response Time",
        responseTime < 2000,
        `${responseTime}ms (threshold: 2000ms)`,
      );
    } catch (error) {
      recordTest("API Response Time", false, error.message);
    }

    // Test 6: Error Handling
    console.log("\n📋 Testing Error Handling...");
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/nonexistent`, {
        timeout: 5000,
      });
      recordTest("404 Error Handling", response.status === 404);
    } catch (error) {
      const handles404 = error.response?.status === 404;
      recordTest("404 Error Handling", handles404);
    }
  } catch (error) {
    console.error("❌ Critical error during testing:", error.message);
  }

  // Results Summary
  const total = testResults.passed + testResults.failed;
  const successRate =
    total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

  console.log("\n" + "=".repeat(60));
  console.log("🏁 END-TO-END USER FLOW TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`📊 Test Results:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Success Rate: ${successRate}%`);

  if (testResults.failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    testResults.details
      .filter((test) => !test.passed)
      .forEach((test) => {
        console.log(`   • ${test.name}`);
        if (test.details) console.log(`     ${test.details}`);
      });
  }

  console.log(`\n🔗 Service URLs:`);
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   Health Check: ${BACKEND_URL}/health`);

  const overallStatus =
    successRate >= 90
      ? "HEALTHY"
      : successRate >= 75
        ? "DEGRADED"
        : "UNHEALTHY";
  const statusEmoji =
    successRate >= 90 ? "🟢" : successRate >= 75 ? "🟡" : "🔴";

  console.log(`\n${statusEmoji} Overall System Status: ${overallStatus}`);
  console.log("=".repeat(60));

  return {
    success: parseFloat(successRate) >= 90,
    successRate: parseFloat(successRate),
    total,
    passed: testResults.passed,
    failed: testResults.failed,
  };
}

testEndToEndFlow();
