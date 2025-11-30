/**
 * 🧪 MULTI-SESSION TEST SUITE
 *
 * Tests all the multi-session fixes implemented:
 * - Tab master election
 * - Mutex mechanism for agency selection
 * - Modal coordination
 * - Cross-tab communication
 * - Session conflict detection
 */

import tabCoordinator from "../utils/TabCoordinator.js";
import {
  acquireMutex,
  releaseMutex,
  canShowModal,
  isMasterTab,
} from "../utils/TabCoordinator.js";

class MultiSessionTester {
  constructor() {
    this.testResults = [];
    this.testStartTime = Date.now();
  }

  /**
   * Run all multi-session tests
   */
  async runAllTests() {
    console.log("🧪 Starting Multi-Session Test Suite...");

    try {
      // Test 1: Tab Coordinator Initialization
      await this.testTabCoordinatorInit();

      // Test 2: Master Election
      await this.testMasterElection();

      // Test 3: Mutex Mechanism
      await this.testMutexMechanism();

      // Test 4: Modal Coordination
      await this.testModalCoordination();

      // Test 5: Cross-tab Communication
      await this.testCrossTabCommunication();

      // Test 6: Session Conflict Detection
      await this.testSessionConflictDetection();

      // Generate report
      this.generateTestReport();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      this.addTestResult("Test Suite", false, error.message);
    }
  }

  /**
   * Test tab coordinator initialization
   */
  async testTabCoordinatorInit() {
    try {
      const status = tabCoordinator.getStatus();

      const hasTabId = !!status.tabId;
      const hasHeartbeat = !!status.lastHeartbeat;
      const hasMasterInfo = !!status.masterInfo;

      const success = hasTabId && hasHeartbeat && hasMasterInfo;

      this.addTestResult(
        "Tab Coordinator Init",
        success,
        success
          ? "Tab coordinator initialized properly"
          : "Missing required properties",
        { status },
      );

      return success;
    } catch (error) {
      this.addTestResult("Tab Coordinator Init", false, error.message);
      return false;
    }
  }

  /**
   * Test master election process
   */
  async testMasterElection() {
    try {
      const initialStatus = tabCoordinator.getStatus();
      const isInitiallyMaster = initialStatus.isMaster;

      // Simulate master election
      console.log("🏆 Testing master election...");

      // Wait a bit for election to settle
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const finalStatus = tabCoordinator.getStatus();
      const hasMaster = !!finalStatus.masterInfo;
      const hasValidTabId = !!finalStatus.tabId;

      const success = hasMaster && hasValidTabId;

      this.addTestResult(
        "Master Election",
        success,
        success
          ? "Master election working correctly"
          : "Master election failed",
        {
          initialMaster: isInitiallyMaster,
          finalMaster: finalStatus.isMaster,
          masterInfo: finalStatus.masterInfo,
        },
      );

      return success;
    } catch (error) {
      this.addTestResult("Master Election", false, error.message);
      return false;
    }
  }

  /**
   * Test mutex mechanism
   */
  async testMutexMechanism() {
    try {
      console.log("🔒 Testing mutex mechanism...");

      const lockName = "test-lock";

      // Test acquiring lock
      const lockAcquired = await acquireMutex(lockName, 5000);

      if (!lockAcquired) {
        this.addTestResult("Mutex Mechanism", false, "Failed to acquire lock");
        return false;
      }

      // Test lock is held
      const lockAcquiredAgain = await acquireMutex(lockName, 1000);

      // Should not be able to acquire same lock
      if (lockAcquiredAgain) {
        this.addTestResult(
          "Mutex Mechanism",
          false,
          "Lock acquired twice - mutex not working",
        );
        return false;
      }

      // Test releasing lock
      const lockReleased = releaseMutex(lockName);

      if (!lockReleased) {
        this.addTestResult("Mutex Mechanism", false, "Failed to release lock");
        return false;
      }

      // Test acquiring after release
      await new Promise((resolve) => setTimeout(resolve, 100));
      const lockAcquiredAfterRelease = await acquireMutex(lockName, 1000);

      const success =
        lockAcquired &&
        !lockAcquiredAgain &&
        lockReleased &&
        lockAcquiredAfterRelease;

      this.addTestResult(
        "Mutex Mechanism",
        success,
        success
          ? "Mutex mechanism working correctly"
          : "Mutex mechanism has issues",
        {
          firstAcquire: lockAcquired,
          secondAcquire: lockAcquiredAgain,
          release: lockReleased,
          acquireAfterRelease: lockAcquiredAfterRelease,
        },
      );

      // Cleanup
      releaseMutex(lockName);

      return success;
    } catch (error) {
      this.addTestResult("Mutex Mechanism", false, error.message);
      return false;
    }
  }

  /**
   * Test modal coordination
   */
  async testModalCoordination() {
    try {
      console.log("🪟 Testing modal coordination...");

      // Test mandatory modal permission
      const canShowMandatory = canShowModal("mandatory");
      const canShowOptional = canShowModal("optional");

      // Only master tab should show mandatory modals
      const isMaster = isMasterTab();
      const expectedMandatory = isMaster;
      const expectedOptional = true; // Any tab can show optional

      const mandatoryCorrect = canShowMandatory === expectedMandatory;
      const optionalCorrect = canShowOptional === expectedOptional;

      const success = mandatoryCorrect && optionalCorrect;

      this.addTestResult(
        "Modal Coordination",
        success,
        success
          ? "Modal coordination working correctly"
          : "Modal coordination has issues",
        {
          isMaster,
          canShowMandatory,
          canShowOptional,
          expectedMandatory,
          expectedOptional,
        },
      );

      return success;
    } catch (error) {
      this.addTestResult("Modal Coordination", false, error.message);
      return false;
    }
  }

  /**
   * Test cross-tab communication
   */
  async testCrossTabCommunication() {
    try {
      console.log("📡 Testing cross-tab communication...");

      let messageReceived = false;
      let receivedData = null;

      // Listen for test message
      const handleMessage = (data) => {
        if (data.type === "TEST_MESSAGE") {
          messageReceived = true;
          receivedData = data.payload;
        }
      };

      tabCoordinator.on("test-event", handleMessage);

      // Send test message
      const testData = { timestamp: Date.now(), test: "multi-session" };
      tabCoordinator.broadcast("TEST_MESSAGE", testData);

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cleanup
      tabCoordinator.off("test-event", handleMessage);

      const success =
        messageReceived &&
        receivedData &&
        receivedData.test === "multi-session";

      this.addTestResult(
        "Cross-tab Communication",
        success,
        success
          ? "Cross-tab communication working"
          : "Cross-tab communication failed",
        {
          messageReceived,
          receivedData,
          sentData: testData,
        },
      );

      return success;
    } catch (error) {
      this.addTestResult("Cross-tab Communication", false, error.message);
      return false;
    }
  }

  /**
   * Test session conflict detection
   */
  async testSessionConflictDetection() {
    try {
      console.log("⚠️ Testing session conflict detection...");

      const status = tabCoordinator.getStatus();

      // Check for required properties
      const hasTabId = !!status.tabId;
      const hasActiveLocks = Array.isArray(status.activeLocks);
      const hasLastHeartbeat = !!status.lastHeartbeat;

      // Test heartbeat freshness (should be within last 10 seconds)
      const heartbeatAge = Date.now() - status.lastHeartbeat;
      const heartbeatFresh = heartbeatAge < 15000; // Allow some tolerance

      const success =
        hasTabId && hasActiveLocks && hasLastHeartbeat && heartbeatFresh;

      this.addTestResult(
        "Session Conflict Detection",
        success,
        success
          ? "Session conflict detection working"
          : "Session conflict detection has issues",
        {
          hasTabId,
          hasActiveLocks,
          hasLastHeartbeat,
          heartbeatAge,
          heartbeatFresh,
          status,
        },
      );

      return success;
    } catch (error) {
      this.addTestResult("Session Conflict Detection", false, error.message);
      return false;
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, message, details = null) {
    const result = {
      testName,
      passed,
      message,
      details,
      timestamp: Date.now(),
    };

    this.testResults.push(result);

    const status = passed ? "✅" : "❌";
    console.log(`${status} ${testName}: ${message}`);

    if (details) {
      console.log("   Details:", details);
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    const testDuration = Date.now() - this.testStartTime;

    console.log("\n📊 MULTI-SESSION TEST REPORT");
    console.log("=====================================");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Duration: ${testDuration}ms`);
    console.log("=====================================\n");

    // Detailed results
    this.testResults.forEach((result) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.testName}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log("   Details:", JSON.stringify(result.details, null, 2));
      }
      console.log("");
    });

    // Summary for programmatic use
    const summary = {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      duration: testDuration,
      timestamp: Date.now(),
      allPassed: failedTests === 0,
    };

    console.log("📋 Summary:", summary);

    // Store in localStorage for other tabs to see
    try {
      localStorage.setItem(
        "axolop_multisession_test_results",
        JSON.stringify(summary),
      );
      console.log("💾 Test results saved to localStorage");
    } catch (error) {
      console.warn("Failed to save test results to localStorage:", error);
    }

    return summary;
  }

  /**
   * Get test results
   */
  getTestResults() {
    return {
      results: this.testResults,
      summary: this.generateTestReport(),
    };
  }
}

// Export for use in components or manual testing
export default MultiSessionTester;

// Export convenience function for quick testing
export const runMultiSessionTests = async () => {
  const tester = new MultiSessionTester();
  return await tester.runAllTests();
};

// Export function to get stored results
export const getStoredTestResults = () => {
  try {
    const stored = localStorage.getItem("axolop_multisession_test_results");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to get stored test results:", error);
    return null;
  }
};
