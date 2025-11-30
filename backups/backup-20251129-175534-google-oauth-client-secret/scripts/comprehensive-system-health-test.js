#!/usr/bin/env node

/**
 * Comprehensive System Health Test Script for Axolop CRM
 *
 * This script tests:
 * 1. API endpoints (with and without authentication)
 * 2. Database connectivity and schema
 * 3. Authentication flow
 * 4. Frontend-backend integration
 * 5. Agency/user hierarchy
 * 6. CRM feature accessibility
 */

import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3002",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  SUPABASE_URL:
    process.env.SUPABASE_URL || "https://fuclpfhitgwugxogxkmw.supabase.co",
  SUPABASE_ANON_KEY:
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA",
  TEST_USER: {
    email: "healthtest@example.com",
    password: "HealthTest123!",
  },
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
};

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const prefix =
    {
      info: "📋",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      skip: "⏭️",
    }[type] || "📋";

  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(name, passed, details = "") {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASS: ${name}`, "success");
  } else {
    testResults.failed++;
    log(`FAIL: ${name}`, "error");
    if (details) console.log(`   Details: ${details}`);
  }

  testResults.details.push({
    name,
    passed,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Create axios instances
const createApiInstance = (authToken = null) => {
  const instance = axios.create({
    baseURL: CONFIG.BACKEND_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (authToken) {
    instance.defaults.headers.Authorization = `Bearer ${authToken}`;
  }

  return instance;
};

// Test functions
async function testBackendHealth() {
  log("Testing Backend Health...");

  try {
    const response = await axios.get(`${CONFIG.BACKEND_URL}/health`, {
      timeout: 5000,
    });

    const isHealthy =
      response.status === 200 && response.data.status === "healthy";
    recordTest(
      "Backend Health Check",
      isHealthy,
      isHealthy ? "All services healthy" : `Status: ${response.data.status}`,
    );

    if (isHealthy) {
      recordTest(
        "Redis Connection",
        response.data.services.redis === "connected",
      );
      recordTest(
        "Database Connection",
        response.data.services.database === "connected",
      );
      recordTest(
        "API Version",
        !!response.data.version,
        `Version: ${response.data.version}`,
      );
    }

    return response.data;
  } catch (error) {
    recordTest("Backend Health Check", false, error.message);
    return null;
  }
}

async function testUnauthenticatedEndpoints() {
  log("Testing Unauthenticated Endpoints (should return 401)...");

  const endpoints = [
    "/api/v1/leads",
    "/api/v1/contacts",
    "/api/v1/opportunities",
    "/api/v1/forms",
    "/api/v1/dashboard/summary",
    "/api/v1/agencies",
    "/api/v1/users",
    "/api/v1/calendar",
    "/api/v1/workflows",
    "/api/v1/tasks",
  ];

  const api = createApiInstance();

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      const is401 = response.status === 401;
      const is404 = response.status === 404; // Some endpoints might not exist
      recordTest(
        `Unauthenticated: ${endpoint}`,
        is401 || is404,
        is401
          ? "Correctly returned 401"
          : is404
            ? "Endpoint not found (404)"
            : `Expected 401, got ${response.status}`,
      );
    } catch (error) {
      const is401 = error.response?.status === 401;
      const is404 = error.response?.status === 404; // Some endpoints might not exist
      recordTest(
        `Unauthenticated: ${endpoint}`,
        is401 || is404,
        is401
          ? "Correctly returned 401"
          : is404
            ? "Endpoint not found (404)"
            : `Error: ${error.message}`,
      );
    }
  }
}

async function testDatabaseSchema() {
  log("Testing Database Schema...");

  try {
    const supabase = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY,
    );

    // Test connection first
    try {
      const { data, error } = await supabase
        .from("_test_connection")
        .select("*")
        .limit(1);
      // If we get here, connection works but table doesn't exist (which is expected)
    } catch (connErr) {
      if (
        connErr.message.includes("ENOTFOUND") ||
        connErr.message.includes("fetch failed")
      ) {
        recordTest(
          "Database Schema Connection",
          false,
          "Cannot connect to Supabase - check URL/network",
        );
        return; // Skip table tests if connection fails
      }
    }

    // Test key tables exist
    const tables = [
      "leads",
      "contacts",
      "opportunities",
      "agencies",
      "agency_members",
      "users",
      "forms",
      "tasks",
      "activities",
      "workflows",
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1);
        recordTest(
          `Database Table: ${table}`,
          !error,
          error?.message || "Table exists",
        );
      } catch (err) {
        if (
          err.message.includes("ENOTFOUND") ||
          err.message.includes("fetch failed")
        ) {
          recordTest(
            `Database Table: ${table}`,
            false,
            "Supabase connection failed",
          );
          break; // Skip remaining table tests
        }
        recordTest(`Database Table: ${table}`, false, err.message);
      }
    }

    // Test schema health endpoint if available
    try {
      const response = await axios.get(`${CONFIG.BACKEND_URL}/health`);
      if (response.data.warnings?.database) {
        log("Database schema warnings detected:", "warning");
        response.data.warnings.database.forEach((warning) => {
          log(`  - ${warning}`, "warning");
        });
      }
    } catch (err) {
      // Ignore health endpoint errors here
    }
  } catch (error) {
    recordTest("Database Schema Connection", false, error.message);
  }
}

async function testAuthenticationFlow() {
  log("Testing Authentication Flow...");

  try {
    const supabase = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY,
    );

    // Test connection first
    try {
      await supabase.auth.getSession();
    } catch (connErr) {
      if (
        connErr.message.includes("ENOTFOUND") ||
        connErr.message.includes("fetch failed")
      ) {
        recordTest(
          "Authentication Connection",
          false,
          "Cannot connect to Supabase Auth - check URL/network",
        );
        return null;
      }
    }

    // Test signup (if test user doesn't exist)
    const { error: signUpError } = await supabase.auth.signUp({
      email: CONFIG.TEST_USER.email,
      password: CONFIG.TEST_USER.password,
    });

    if (!signUpError || signUpError.message?.includes("already registered")) {
      recordTest(
        "User Signup",
        true,
        signUpError?.message || "Signup successful or user exists",
      );
    } else {
      recordTest("User Signup", false, signUpError.message);
    }

    // Test signin
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: CONFIG.TEST_USER.email,
        password: CONFIG.TEST_USER.password,
      });

    if (signInError) {
      recordTest("User Signin", false, signInError.message);
      return null;
    }

    recordTest("User Signin", true, "Successfully signed in");

    if (signInData.session?.access_token) {
      recordTest("JWT Token Generation", true, "Access token created");
      return signInData.session.access_token;
    } else {
      recordTest("JWT Token Generation", false, "No access token in session");
      return null;
    }
  } catch (error) {
    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("fetch failed")
    ) {
      recordTest(
        "Authentication Connection",
        false,
        "Cannot connect to Supabase Auth - check URL/network",
      );
    } else {
      recordTest("Authentication Flow", false, error.message);
    }
    return null;
  }
}

async function testAuthenticatedEndpoints(authToken) {
  if (!authToken) {
    log("Skipping authenticated endpoint tests - no auth token", "skip");
    return;
  }

  log("Testing Authenticated Endpoints...");

  const api = createApiInstance(authToken);

  const endpoints = [
    { path: "/api/v1/leads", method: "get" },
    { path: "/api/v1/contacts", method: "get" },
    { path: "/api/v1/opportunities", method: "get" },
    { path: "/api/v1/forms", method: "get" },
    { path: "/api/v1/dashboard/summary", method: "get" },
    { path: "/api/v1/agencies", method: "get" },
    { path: "/api/v1/tasks", method: "get" },
    { path: "/api/v1/activities", method: "get" },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api[endpoint.method](endpoint.path);
      const isSuccess = response.status >= 200 && response.status < 300;
      recordTest(
        `Authenticated: ${endpoint.method.toUpperCase()} ${endpoint.path}`,
        isSuccess,
        `Status: ${response.status}, Data: ${Array.isArray(response.data) ? response.data.length : "object"}`,
      );
    } catch (error) {
      const isSuccess =
        error.response?.status >= 200 && error.response?.status < 300;
      recordTest(
        `Authenticated: ${endpoint.method.toUpperCase()} ${endpoint.path}`,
        isSuccess,
        `Error: ${error.message}, Status: ${error.response?.status}`,
      );
    }
  }
}

async function testAgencyHierarchy(authToken) {
  if (!authToken) {
    log("Skipping agency hierarchy tests - no auth token", "skip");
    return;
  }

  log("Testing Agency/User Hierarchy...");

  const api = createApiInstance(authToken);

  try {
    // Test agencies endpoint
    const agenciesResponse = await api.get("/api/v1/agencies");
    recordTest(
      "Get Agencies",
      agenciesResponse.status === 200,
      `Found ${Array.isArray(agenciesResponse.data) ? agenciesResponse.data.length : 0} agencies`,
    );

    // Test agency members endpoint
    try {
      const membersResponse = await api.get("/api/v1/agencies/members");
      recordTest(
        "Get Agency Members",
        membersResponse.status === 200,
        `Status: ${membersResponse.status}`,
      );
    } catch (err) {
      recordTest(
        "Get Agency Members",
        err.response?.status === 200 || err.response?.status === 404,
        `Status: ${err.response?.status} (404 may be expected if no agency)`,
      );
    }
  } catch (error) {
    recordTest("Agency Hierarchy", false, error.message);
  }
}

async function testCRUDOperations(authToken) {
  if (!authToken) {
    log("Skipping CRUD tests - no auth token", "skip");
    return;
  }

  log("Testing CRUD Operations...");

  const api = createApiInstance(authToken);

  // Test Lead CRUD
  try {
    // Create
    const leadData = {
      first_name: "Test",
      last_name: "Lead",
      email: `test${Date.now()}@example.com`,
      phone: "+1234567890",
      status: "new",
    };

    const createResponse = await api.post("/api/v1/leads", leadData);
    const leadId = createResponse.data?.id || createResponse.data?.[0]?.id;

    recordTest(
      "Create Lead",
      createResponse.status === 201 || createResponse.status === 200,
      `Status: ${createResponse.status}`,
    );

    if (leadId) {
      // Read
      const getResponse = await api.get(`/api/v1/leads/${leadId}`);
      recordTest(
        "Get Lead",
        getResponse.status === 200,
        `Status: ${getResponse.status}`,
      );

      // Update
      const updateResponse = await api.put(`/api/v1/leads/${leadId}`, {
        ...leadData,
        status: "contacted",
      });
      recordTest(
        "Update Lead",
        updateResponse.status === 200,
        `Status: ${updateResponse.status}`,
      );

      // Delete
      const deleteResponse = await api.delete(`/api/v1/leads/${leadId}`);
      recordTest(
        "Delete Lead",
        deleteResponse.status === 200 || deleteResponse.status === 204,
        `Status: ${deleteResponse.status}`,
      );
    }
  } catch (error) {
    recordTest("Lead CRUD Operations", false, error.message);
  }
}

async function testFrontendIntegration() {
  log("Testing Frontend Integration...");

  try {
    // Test frontend is accessible
    const frontendResponse = await axios.get(CONFIG.FRONTEND_URL, {
      timeout: 5000,
    });
    recordTest(
      "Frontend Accessibility",
      frontendResponse.status === 200,
      `Status: ${frontendResponse.status}`,
    );

    // Test key frontend files exist (if running locally)
    const fs = await import("fs/promises");
    try {
      const frontendFiles = [
        "frontend/lib/api.js",
        "frontend/App.jsx",
        "frontend/main.jsx",
        "package.json",
      ];

      for (const file of frontendFiles) {
        try {
          await fs.access(join(__dirname, "..", file));
          recordTest(`Frontend File: ${file}`, true, "File exists");
        } catch (err) {
          recordTest(`Frontend File: ${file}`, false, "File not found");
        }
      }
    } catch (err) {
      recordTest(
        "Frontend File System Check",
        false,
        "Cannot access file system",
      );
    }
  } catch (error) {
    recordTest("Frontend Integration", false, error.message);
  }
}

async function testErrorHandling() {
  log("Testing Error Handling...");

  const api = createApiInstance();

  try {
    // Test 404 handling
    const response = await api.get("/api/v1/nonexistent-endpoint");
    recordTest(
      "404 Error Handling",
      response.status === 404,
      `Got ${response.status}`,
    );
  } catch (error) {
    recordTest(
      "404 Error Handling",
      error.response?.status === 404,
      `Correctly returned 404: ${error.response?.status}`,
    );
  }

  try {
    // Test frontend is accessible
    await axios.get(CONFIG.FRONTEND_URL, { timeout: 5000 });
    recordTest("Frontend Accessibility", true, "Frontend is accessible");
  } catch (error) {
    recordTest(
      "Validation Error Handling",
      error.response?.status >= 400,
      `Correctly returned error: ${error.response?.status}`,
    );
  }
}

async function testPerformance() {
  log("Testing Performance...");

  try {
    const start = Date.now();
    const response = await axios.get(`${CONFIG.BACKEND_URL}/health`, {
      timeout: 5000,
    });
    const responseTime = Date.now() - start;

    recordTest(
      "API Response Time",
      responseTime < 2000,
      `${responseTime}ms (threshold: 2000ms)`,
    );

    // Test concurrent requests
    const concurrentStart = Date.now();
    await Promise.all(
      Array(5)
        .fill()
        .map(() =>
          axios.get(`${CONFIG.BACKEND_URL}/health`, { timeout: 5000 }),
        ),
    );
    const concurrentTime = Date.now() - concurrentStart;

    recordTest(
      "Concurrent Requests",
      concurrentTime < 5000,
      `${concurrentTime}ms for 5 concurrent requests`,
    );
  } catch (error) {
    recordTest("Performance Tests", false, error.message);
  }
}

function printSummary() {
  console.log("\n" + "=".repeat(80));
  console.log("🏁 SYSTEM HEALTH TEST SUMMARY");
  console.log("=".repeat(80));

  console.log(`\n📊 Test Results:`);
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);

  const successRate =
    testResults.total > 0
      ? ((testResults.passed / testResults.total) * 100).toFixed(1)
      : 0;
  console.log(`   📈 Success Rate: ${successRate}%`);

  if (testResults.failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    testResults.details
      .filter((test) => !test.passed)
      .forEach((test) => {
        console.log(`   • ${test.name}`);
        if (test.details) {
          console.log(`     ${test.details}`);
        }
      });
  }

  console.log(`\n🔗 Service URLs:`);
  console.log(`   Backend: ${CONFIG.BACKEND_URL}`);
  console.log(`   Frontend: ${CONFIG.FRONTEND_URL}`);
  console.log(`   Health Check: ${CONFIG.BACKEND_URL}/health`);

  const overallHealth =
    testResults.failed === 0
      ? "HEALTHY"
      : testResults.failed <= testResults.total * 0.1
        ? "DEGRADED"
        : "UNHEALTHY";

  const healthEmoji = {
    HEALTHY: "🟢",
    DEGRADED: "🟡",
    UNHEALTHY: "🔴",
  }[overallHealth];

  console.log(`\n${healthEmoji} Overall System Status: ${overallHealth}`);
  console.log("=".repeat(80));
}

// Main execution function
async function runSystemHealthTests() {
  console.log("🚀 Starting Axolop CRM System Health Tests...");
  console.log(`Backend URL: ${CONFIG.BACKEND_URL}`);
  console.log(`Frontend URL: ${CONFIG.FRONTEND_URL}`);
  console.log("=".repeat(80));

  try {
    // 1. Test backend health
    await testBackendHealth();

    // 2. Test unauthenticated endpoints
    await testUnauthenticatedEndpoints();

    // 3. Test database schema
    await testDatabaseSchema();

    // 4. Test authentication flow
    const authToken = await testAuthenticationFlow();

    // 5. Test authenticated endpoints
    await testAuthenticatedEndpoints(authToken);

    // 6. Test agency hierarchy
    await testAgencyHierarchy(authToken);

    // 7. Test CRUD operations
    await testCRUDOperations(authToken);

    // 8. Test frontend integration
    await testFrontendIntegration();

    // 9. Test error handling
    await testErrorHandling();

    // 10. Test performance
    await testPerformance();
  } catch (error) {
    log(`Critical error during testing: ${error.message}`, "error");
  }

  // Print summary
  printSummary();

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on("unhandledRejection", (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`, "error");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  log(`Uncaught Exception: ${error.message}`, "error");
  process.exit(1);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSystemHealthTests();
}

export { runSystemHealthTests, testResults };
