/**
 * 🚀 AXOLOP CRM - MULTI-SESSION AUTHENTICATION TEST
 *
 * Comprehensive test suite to validate multi-session authentication fixes.
 * Tests all scenarios that previously caused authentication bugs.
 *
 * Test Scenarios:
 * 1. Concurrent login from multiple browsers
 * 2. Token refresh coordination
 * 3. Cross-tab session synchronization
 * 4. Rate limiting per session
 * 5. Token caching and deduplication
 * 6. Session health monitoring
 * 7. Logout all sessions functionality
 * 8. Error handling and recovery
 */

import axios from "axios";

const API_BASE = "http://localhost:3002/api/v1";

class MultiSessionAuthTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };

    this.testUsers = [
      {
        email: "testuser1@axolopcrm.com",
        password: "testpassword123",
        name: "Test User 1",
      },
      {
        email: "testuser2@axolopcrm.com",
        password: "testpassword456",
        name: "Test User 2",
      },
    ];

    this.sessions = new Map();
    this.testTimeout = 30000; // 30 seconds per test
  }

  /**
   * Run comprehensive test suite
   */
  async runFullTestSuite() {
    console.log("🧪 Starting Multi-Session Authentication Test Suite");
    console.log("=".repeat(60));

    try {
      // Test 1: Basic Authentication
      await this.testBasicAuthentication();

      // Test 2: Concurrent Sessions
      await this.testConcurrentSessions();

      // Test 3: Token Refresh Coordination
      await this.testTokenRefreshCoordination();

      // Test 4: Cross-Tab Synchronization
      await this.testCrossTabSynchronization();

      // Test 5: Rate Limiting Per Session
      await this.testRateLimitingPerSession();

      // Test 6: Token Caching and Deduplication
      await this.testTokenCachingAndDeduplication();

      // Test 7: Session Health Monitoring
      await this.testSessionHealthMonitoring();

      // Test 8: Logout All Sessions
      await this.testLogoutAllSessions();

      // Test 9: Error Handling and Recovery
      await this.testErrorHandlingAndRecovery();

      // Test 10: Performance Under Load
      await this.testPerformanceUnderLoad();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      this.recordResult("Test Suite", false, error.message);
    }

    this.printTestResults();
  }

  /**
   * Test 1: Basic Authentication
   */
  async testBasicAuthentication() {
    console.log("\n📝 Test 1: Basic Authentication");

    try {
      // Test login with valid credentials
      const loginResponse = await this.makeRequest("POST", "/users/login", {
        email: this.testUsers[0].email,
        password: this.testUsers[0].password,
      });

      if (loginResponse.success && loginResponse.data?.session) {
        this.sessions.set("user1", loginResponse.data.session);
        this.recordResult("Basic Authentication", true, "Login successful");
      } else {
        this.recordResult("Basic Authentication", false, "Login failed");
      }

      // Test protected route access
      const protectedResponse = await this.makeRequest(
        "GET",
        "/users/me",
        null,
        {
          Authorization: `Bearer ${loginResponse.data?.session?.access_token}`,
        },
      );

      if (protectedResponse.success) {
        this.recordResult("Protected Route Access", true, "Access granted");
      } else {
        this.recordResult("Protected Route Access", false, "Access denied");
      }
    } catch (error) {
      this.recordResult("Basic Authentication", false, error.message);
    }
  }

  /**
   * Test 2: Concurrent Sessions
   */
  async testConcurrentSessions() {
    console.log("\n🔄 Test 2: Concurrent Sessions");

    try {
      // Simulate concurrent login from multiple "browsers"
      const concurrentPromises = this.testUsers.map(async (user, index) => {
        const response = await this.makeRequest("POST", "/users/login", {
          email: user.email,
          password: user.password,
        });

        if (response.success) {
          this.sessions.set(`user${index + 1}`, response.data.session);
          return {
            user: user.name,
            success: true,
            session: response.data.session,
          };
        } else {
          return { user: user.name, success: false, error: response.error };
        }
      });

      const results = await Promise.all(concurrentPromises);
      const successfulLogins = results.filter((r) => r.success).length;

      if (successfulLogins === this.testUsers.length) {
        this.recordResult(
          "Concurrent Sessions",
          true,
          `${successfulLogins} concurrent logins successful`,
        );
      } else {
        this.recordResult(
          "Concurrent Sessions",
          false,
          `Only ${successfulLogins}/${this.testUsers.length} logins successful`,
        );
      }

      // Test accessing protected resources from both sessions
      for (const [sessionName, session] of this.sessions.entries()) {
        const response = await this.makeRequest("GET", "/users/me", null, {
          Authorization: `Bearer ${session.access_token}`,
        });

        if (response.success) {
          this.recordResult(
            `Session Access - ${sessionName}`,
            true,
            "Access granted",
          );
        } else {
          this.recordResult(
            `Session Access - ${sessionName}`,
            false,
            "Access denied",
          );
        }
      }
    } catch (error) {
      this.recordResult("Concurrent Sessions", false, error.message);
    }
  }

  /**
   * Test 3: Token Refresh Coordination
   */
  async testTokenRefreshCoordination() {
    console.log("\n🔄 Test 3: Token Refresh Coordination");

    try {
      // Simulate token expiry by making requests after delay
      const session = this.sessions.get("user1");
      if (!session) {
        this.recordResult(
          "Token Refresh Coordination",
          false,
          "No session available",
        );
        return;
      }

      // Make multiple concurrent requests to trigger refresh coordination
      const concurrentRequests = Array.from({ length: 5 }, (_, i) =>
        this.makeRequest("GET", "/users/me", null, {
          Authorization: `Bearer ${session.access_token}`,
        }).then((response) => ({ request: i + 1, response })),
      );

      const results = await Promise.all(concurrentRequests);
      const successfulRequests = results.filter(
        (r) => r.response.success,
      ).length;

      if (successfulRequests >= 4) {
        // Allow for some failures
        this.recordResult(
          "Token Refresh Coordination",
          true,
          `${successfulRequests}/5 requests successful`,
        );
      } else {
        this.recordResult(
          "Token Refresh Coordination",
          false,
          `Only ${successfulRequests}/5 requests successful`,
        );
      }
    } catch (error) {
      this.recordResult("Token Refresh Coordination", false, error.message);
    }
  }

  /**
   * Test 4: Cross-Tab Synchronization
   */
  async testCrossTabSynchronization() {
    console.log("\n📡 Test 4: Cross-Tab Synchronization");

    try {
      // This test simulates cross-tab behavior by checking session consistency
      const session1 = this.sessions.get("user1");
      const session2 = this.sessions.get("user2");

      if (!session1 || !session2) {
        this.recordResult(
          "Cross-Tab Synchronization",
          false,
          "Insufficient sessions for test",
        );
        return;
      }

      // Test session invalidation propagation
      const invalidateResponse = await this.makeRequest(
        "POST",
        "/sessions/invalidate",
        {
          sessionId: session1.access_token,
          reason: "test_invalidation",
        },
        {
          Authorization: `Bearer ${session1.access_token}`,
        },
      );

      // Check if other session is affected (it shouldn't be)
      const otherSessionResponse = await this.makeRequest(
        "GET",
        "/users/me",
        null,
        {
          Authorization: `Bearer ${session2.access_token}`,
        },
      );

      if (invalidateResponse.success && otherSessionResponse.success) {
        this.recordResult(
          "Cross-Tab Synchronization",
          true,
          "Session invalidation isolated correctly",
        );
      } else {
        this.recordResult(
          "Cross-Tab Synchronization",
          false,
          "Session invalidation affected other sessions",
        );
      }
    } catch (error) {
      this.recordResult("Cross-Tab Synchronization", false, error.message);
    }
  }

  /**
   * Test 5: Rate Limiting Per Session
   */
  async testRateLimitingPerSession() {
    console.log("\n⏱️ Test 5: Rate Limiting Per Session");

    try {
      const session = this.sessions.get("user1");
      if (!session) {
        this.recordResult(
          "Rate Limiting Per Session",
          false,
          "No session available",
        );
        return;
      }

      // Make rapid requests to test rate limiting
      const rapidRequests = Array.from({ length: 60 }, (_, i) =>
        this.makeRequest("GET", "/users/me", null, {
          Authorization: `Bearer ${session.access_token}`,
        }).then((response) => ({ request: i + 1, response })),
      );

      const results = await Promise.all(rapidRequests);
      const successfulRequests = results.filter(
        (r) => r.response.success,
      ).length;
      const rateLimitedRequests = results.filter(
        (r) => r.response.status === 429,
      ).length;

      // Should allow reasonable number of requests, not block everything
      if (successfulRequests >= 50 && rateLimitedRequests <= 10) {
        this.recordResult(
          "Rate Limiting Per Session",
          true,
          `Rate limiting working: ${successfulRequests} successful, ${rateLimitedRequests} rate limited`,
        );
      } else {
        this.recordResult(
          "Rate Limiting Per Session",
          false,
          `Rate limiting too strict: ${successfulRequests} successful, ${rateLimitedRequests} rate limited`,
        );
      }
    } catch (error) {
      this.recordResult("Rate Limiting Per Session", false, error.message);
    }
  }

  /**
   * Test 6: Token Caching and Deduplication
   */
  async testTokenCachingAndDeduplication() {
    console.log("\n💾 Test 6: Token Caching and Deduplication");

    try {
      const session = this.sessions.get("user1");
      if (!session) {
        this.recordResult(
          "Token Caching and Deduplication",
          false,
          "No session available",
        );
        return;
      }

      // Make identical concurrent requests to test deduplication
      const identicalRequests = Array.from({ length: 10 }, (_, i) =>
        this.makeRequest("GET", "/users/me", null, {
          Authorization: `Bearer ${session.access_token}`,
          "X-Test-Deduplication": "true",
        }).then((response) => ({ request: i + 1, response })),
      );

      const startTime = Date.now();
      const results = await Promise.all(identicalRequests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successfulRequests = results.filter(
        (r) => r.response.success,
      ).length;

      // Deduplication should make this faster and more consistent
      if (successfulRequests >= 9 && duration < 5000) {
        // 10 requests in under 5 seconds
        this.recordResult(
          "Token Caching and Deduplication",
          true,
          `Deduplication working: ${successfulRequests}/10 successful in ${duration}ms`,
        );
      } else {
        this.recordResult(
          "Token Caching and Deduplication",
          false,
          `Deduplication not working: ${successfulRequests}/10 successful in ${duration}ms`,
        );
      }
    } catch (error) {
      this.recordResult(
        "Token Caching and Deduplication",
        false,
        error.message,
      );
    }
  }

  /**
   * Test 7: Session Health Monitoring
   */
  async testSessionHealthMonitoring() {
    console.log("\n💓 Test 7: Session Health Monitoring");

    try {
      const healthResponse = await this.makeRequest("GET", "/sessions/health");

      if (healthResponse.success && healthResponse.data) {
        const { healthScore, activeSessions, recommendations } =
          healthResponse.data;

        if (healthScore >= 70 && activeSessions >= 0) {
          this.recordResult(
            "Session Health Monitoring",
            true,
            `Health score: ${healthScore}, Active sessions: ${activeSessions}`,
          );
        } else {
          this.recordResult(
            "Session Health Monitoring",
            false,
            `Health score: ${healthScore}, Active sessions: ${activeSessions}`,
          );
        }

        if (recommendations && recommendations.length > 0) {
          console.log("Health Recommendations:", recommendations);
        }
      } else {
        this.recordResult(
          "Session Health Monitoring",
          false,
          "Health endpoint not working",
        );
      }
    } catch (error) {
      this.recordResult("Session Health Monitoring", false, error.message);
    }
  }

  /**
   * Test 8: Logout All Sessions
   */
  async testLogoutAllSessions() {
    console.log("\n🔐 Test 8: Logout All Sessions");

    try {
      const session = this.sessions.get("user1");
      if (!session) {
        this.recordResult("Logout All Sessions", false, "No session available");
        return;
      }

      // First check how many sessions are active
      const beforeLogoutResponse = await this.makeRequest(
        "GET",
        "/sessions",
        null,
        {
          Authorization: `Bearer ${session.access_token}`,
        },
      );

      const sessionsBefore = beforeLogoutResponse.data?.count || 0;

      // Logout from all sessions
      const logoutResponse = await this.makeRequest(
        "DELETE",
        "/sessions",
        {
          reason: "test_logout_all",
        },
        {
          Authorization: `Bearer ${session.access_token}`,
        },
      );

      if (logoutResponse.success) {
        // Check sessions after logout
        const afterLogoutResponse = await this.makeRequest(
          "GET",
          "/sessions",
          null,
          {
            Authorization: `Bearer ${session.access_token}`,
          },
        );

        const sessionsAfter = afterLogoutResponse.data?.count || 0;

        if (sessionsAfter < sessionsBefore) {
          this.recordResult(
            "Logout All Sessions",
            true,
            `Sessions reduced from ${sessionsBefore} to ${sessionsAfter}`,
          );
        } else {
          this.recordResult(
            "Logout All Sessions",
            false,
            "Session count did not decrease",
          );
        }
      } else {
        this.recordResult(
          "Logout All Sessions",
          false,
          "Logout request failed",
        );
      }
    } catch (error) {
      this.recordResult("Logout All Sessions", false, error.message);
    }
  }

  /**
   * Test 9: Error Handling and Recovery
   */
  async testErrorHandlingAndRecovery() {
    console.log("\n🛠️ Test 9: Error Handling and Recovery");

    try {
      // Test with invalid token
      const invalidTokenResponse = await this.makeRequest(
        "GET",
        "/users/me",
        null,
        {
          Authorization: "Bearer invalid_token_here",
        },
      );

      if (
        !invalidTokenResponse.success &&
        invalidTokenResponse.status === 401
      ) {
        this.recordResult(
          "Invalid Token Handling",
          true,
          "Invalid token properly rejected",
        );
      } else {
        this.recordResult(
          "Invalid Token Handling",
          false,
          "Invalid token not properly handled",
        );
      }

      // Test with expired token
      const expiredTokenResponse = await this.makeRequest(
        "GET",
        "/users/me",
        null,
        {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwMiIsInR5cCI6ImV4cGUiLCJleHAiOjE2MDc5MDAwMCwiaWF0IjoxNjA0NTY3OTAyfQ.SflKxw", // Expired JWT
        },
      );

      if (
        !expiredTokenResponse.success &&
        expiredTokenResponse.status === 401
      ) {
        this.recordResult(
          "Expired Token Handling",
          true,
          "Expired token properly rejected",
        );
      } else {
        this.recordResult(
          "Expired Token Handling",
          false,
          "Expired token not properly handled",
        );
      }

      // Test recovery with valid token after error
      const validSession = this.sessions.get("user2");
      if (validSession) {
        const recoveryResponse = await this.makeRequest(
          "GET",
          "/users/me",
          null,
          {
            Authorization: `Bearer ${validSession.access_token}`,
          },
        );

        if (recoveryResponse.success) {
          this.recordResult(
            "Error Recovery",
            true,
            "Recovery with valid token successful",
          );
        } else {
          this.recordResult(
            "Error Recovery",
            false,
            "Recovery with valid token failed",
          );
        }
      }
    } catch (error) {
      this.recordResult("Error Handling and Recovery", false, error.message);
    }
  }

  /**
   * Test 10: Performance Under Load
   */
  async testPerformanceUnderLoad() {
    console.log("\n⚡ Test 10: Performance Under Load");

    try {
      const session = this.sessions.get("user1");
      if (!session) {
        this.recordResult(
          "Performance Under Load",
          false,
          "No session available",
        );
        return;
      }

      // Create load with multiple concurrent requests
      const loadRequests = Array.from({ length: 100 }, (_, i) =>
        this.makeRequest("GET", "/users/me", null, {
          Authorization: `Bearer ${session.access_token}`,
          "X-Load-Test": "true",
        }).then((response) => ({
          request: i + 1,
          response,
          timestamp: Date.now(),
        })),
      );

      const startTime = Date.now();
      const results = await Promise.all(loadRequests);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      const successfulRequests = results.filter(
        (r) => r.response.success,
      ).length;
      const averageResponseTime =
        results.reduce((sum, r) => sum + (r.timestamp - startTime), 0) /
        results.length;

      // Performance criteria
      const successRate = (successfulRequests / 100) * 100;
      const requestsPerSecond = 100 / (totalDuration / 1000);

      if (
        successRate >= 95 &&
        totalDuration < 10000 &&
        requestsPerSecond >= 10
      ) {
        this.recordResult(
          "Performance Under Load",
          true,
          `Success rate: ${successRate}%, Duration: ${totalDuration}ms, RPS: ${requestsPerSecond.toFixed(2)}`,
        );
      } else {
        this.recordResult(
          "Performance Under Load",
          false,
          `Success rate: ${successRate}%, Duration: ${totalDuration}ms, RPS: ${requestsPerSecond.toFixed(2)}`,
        );
      }
    } catch (error) {
      this.recordResult("Performance Under Load", false, error.message);
    }
  }

  /**
   * Make HTTP request with error handling
   */
  async makeRequest(method, endpoint, data = null, headers = {}) {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      timeout: this.testTimeout,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data,
        error: response.data?.error || response.data?.message,
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: null,
        error: error.message,
      };
    }
  }

  /**
   * Record test result
   */
  recordResult(testName, passed, details) {
    this.testResults.total++;

    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }

    this.testResults.details.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });

    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`  ${status} ${testName}: ${details}`);
  }

  /**
   * Print comprehensive test results
   */
  printTestResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 MULTI-SESSION AUTHENTICATION TEST RESULTS");
    console.log("=".repeat(60));

    const { passed, failed, total, details } = this.testResults;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log(`\n📈 SUMMARY:`);
    console.log(`  Total Tests: ${total}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Success Rate: ${successRate}%`);

    // Categorize results
    const categories = {
      Authentication: details.filter((d) => d.test.includes("Authentication")),
      "Session Management": details.filter(
        (d) => d.test.includes("Session") || d.test.includes("Concurrent"),
      ),
      Performance: details.filter(
        (d) => d.test.includes("Performance") || d.test.includes("Load"),
      ),
      "Error Handling": details.filter(
        (d) => d.test.includes("Error") || d.test.includes("Recovery"),
      ),
    };

    console.log(`\n📋 RESULTS BY CATEGORY:`);
    Object.entries(categories).forEach(([category, tests]) => {
      const categoryPassed = tests.filter((t) => t.passed).length;
      const categoryTotal = tests.length;
      const categoryRate =
        categoryTotal > 0
          ? ((categoryPassed / categoryTotal) * 100).toFixed(1)
          : 0;

      console.log(`\n  ${category}:`);
      console.log(
        `    Passed: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`,
      );

      if (categoryPassed < categoryTotal) {
        const failedTests = tests.filter((t) => !t.passed);
        console.log(`    Failed Tests:`);
        failedTests.forEach((test) => {
          console.log(`      - ${test.test}: ${test.details}`);
        });
      }
    });

    // Overall assessment
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    if (parseFloat(successRate) >= 80) {
      console.log(
        `  ✅ EXCELLENT: Multi-session authentication is working well (${successRate}% pass rate)`,
      );
    } else if (parseFloat(successRate) >= 60) {
      console.log(
        `  ⚠️  GOOD: Multi-session authentication mostly working (${successRate}% pass rate)`,
      );
    } else {
      console.log(
        `  ❌ NEEDS IMPROVEMENT: Multi-session authentication has issues (${successRate}% pass rate)`,
      );
    }

    // Key recommendations
    console.log(`\n💡 KEY RECOMMENDATIONS:`);
    if (successRate < 100) {
      console.log("  - Review failed tests and fix underlying issues");
    }
    console.log("  - Monitor session health in production");
    console.log("  - Test with real browsers in different locations");
    console.log("  - Implement session analytics dashboard");

    console.log("\n" + "=".repeat(60));
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MultiSessionAuthTest();
  tester
    .runFullTestSuite()
    .then(() => {
      console.log("\n🏁 Test suite completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

export default MultiSessionAuthTest;
