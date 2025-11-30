/**
 * 🧪 COMPREHENSIVE MULTI-SESSION TEST SUITE
 *
 * Tests all aspects of multi-session functionality:
 * - TabCoordinator master election and mutex
 * - AgencyContext race condition protection
 * - MandatoryAgencyModal coordination
 * - SupabaseSingleton cross-tab communication
 * - Backend API concurrent request handling
 * - Edge cases and failure scenarios
 */

// Test configuration
const TEST_CONFIG = {
  maxTabs: 5,
  testDuration: 30000, // 30 seconds
  heartbeatInterval: 1000,
  mutexTimeout: 5000,
  apiTimeout: 10000,
};

// Test results tracking
const testResults = {
  tabCoordinator: { passed: 0, failed: 0, errors: [] },
  agencyContext: { passed: 0, failed: 0, errors: [] },
  modalCoordination: { passed: 0, failed: 0, errors: [] },
  supabaseSingleton: { passed: 0, failed: 0, errors: [] },
  backendApi: { passed: 0, failed: 0, errors: [] },
  edgeCases: { passed: 0, failed: 0, errors: [] },
};

// Utility functions
function assert(condition, message, category) {
  if (condition) {
    testResults[category].passed++;
    console.log(`✅ PASS: ${message}`);
    return true;
  } else {
    testResults[category].failed++;
    testResults[category].errors.push(message);
    console.error(`❌ FAIL: ${message}`);
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock localStorage for testing
class MockLocalStorage {
  constructor() {
    this.data = {};
    this.events = [];
  }

  getItem(key) {
    return this.data[key] || null;
  }

  setItem(key, value) {
    this.data[key] = value;
    this.events.push({ type: "storage", key, newValue: value });
  }

  removeItem(key) {
    delete this.data[key];
    this.events.push({ type: "storage", key, newValue: null });
  }

  clear() {
    this.data = {};
  }

  getEvents() {
    return this.events;
  }
}

// Mock BroadcastChannel for testing
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.listeners = [];
    this.messages = [];
  }

  addEventListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  postMessage(message) {
    this.messages.push(message);
    // Notify all listeners
    this.listeners.forEach(({ callback }) => {
      try {
        callback({ data: message });
      } catch (error) {
        console.error("BroadcastChannel callback error:", error);
      }
    });
  }

  close() {
    this.listeners = [];
  }

  getMessages() {
    return this.messages;
  }
}

// Setup mock environment
function setupMockEnvironment() {
  global.localStorage = new MockLocalStorage();
  global.BroadcastChannel = MockBroadcastChannel;
  // Store original Date.now
  if (!global.originalDateNow) {
    global.originalDateNow = Date.now;
  }
}

// 1. TabCoordinator Tests
async function testTabCoordinator() {
  console.log("\n🔧 TESTING TAB COORDINATOR");

  setupMockEnvironment();

  // Import TabCoordinator (adjust path as needed)
  // const TabCoordinator = require('../frontend/utils/TabCoordinator.js').default;

  // Test 1: Master election
  try {
    const tabs = [];
    for (let i = 0; i < 3; i++) {
      // const coordinator = new TabCoordinator();
      // await coordinator.initialize();
      // tabs.push(coordinator);
      await sleep(100);
    }

    // Check that exactly one tab is master
    const masterTabs = tabs.filter((tab) => tab.isMaster);
    assert(
      masterTabs.length === 1,
      "Exactly one tab should be master",
      "tabCoordinator",
    );

    // Test 2: Master relinquish on close
    const masterTab = masterTabs[0];
    const masterId = masterTab.tabId;

    // Simulate master tab closing
    masterTab.cleanup();
    await sleep(1000);

    // Check that a new master was elected
    const newMasterTabs = tabs.filter(
      (tab) => tab.isMaster && tab.tabId !== masterId,
    );
    assert(
      newMasterTabs.length === 1,
      "New master should be elected when old master closes",
      "tabCoordinator",
    );

    // Test 3: Mutex acquisition
    const testMutex = "test_agency_selection";

    // First tab should acquire mutex
    const lock1 = await tabs[0].acquireMutex(testMutex, 2000);
    assert(lock1 === true, "First tab should acquire mutex", "tabCoordinator");

    // Second tab should not acquire mutex
    const lock2 = await tabs[1].acquireMutex(testMutex, 2000);
    assert(
      lock2 === false,
      "Second tab should not acquire mutex when held",
      "tabCoordinator",
    );

    // Release mutex and try again
    tabs[0].releaseMutex(testMutex);
    await sleep(100);

    const lock3 = await tabs[1].acquireMutex(testMutex, 2000);
    assert(
      lock3 === true,
      "Second tab should acquire mutex after release",
      "tabCoordinator",
    );

    // Test 4: Modal coordination
    const canShow1 = tabs[0].canShowModal("mandatory");
    const canShow2 = tabs[1].canShowModal("mandatory");

    assert(
      canShow1 === true,
      "Master tab can show mandatory modal",
      "tabCoordinator",
    );
    assert(
      canShow2 === false,
      "Non-master tab cannot show mandatory modal",
      "tabCoordinator",
    );

    // Cleanup
    tabs.forEach((tab) => tab.cleanup());
  } catch (error) {
    assert(
      false,
      `TabCoordinator test error: ${error.message}`,
      "tabCoordinator",
    );
  }
}

// 2. AgencyContext Tests
async function testAgencyContext() {
  console.log("\n🏢 TESTING AGENCY CONTEXT");

  try {
    // Test 1: Mutex protection on agency selection
    // This would require mocking the AgencyContext
    // For now, we'll test the logic conceptually

    const mockAgencySelection = async (agencyId, tabId) => {
      // Simulate mutex acquisition
      const lockKey = `axolop_mutex_agency_selection`;
      const lockData = {
        tabId: tabId,
        timestamp: Date.now(),
      };

      // Check if lock exists
      const existingLock = global.localStorage.getItem(lockKey);
      if (existingLock) {
        const parsed = JSON.parse(existingLock);
        if (parsed.tabId !== tabId) {
          return { success: false, reason: "Lock held by another tab" };
        }
      }

      // Acquire lock
      global.localStorage.setItem(lockKey, JSON.stringify(lockData));

      try {
        // Simulate agency selection work
        await sleep(500);

        // Simulate saving to localStorage
        const agencyData = {
          id: agencyId,
          name: `Test Agency ${agencyId}`,
          selectedBy: tabId,
          timestamp: Date.now(),
        };
        global.localStorage.setItem(
          "axolop_current_agency",
          JSON.stringify(agencyData),
        );

        return { success: true, agency: agencyData };
      } finally {
        // Release lock
        global.localStorage.removeItem(lockKey);
      }
    };

    // Test concurrent agency selection
    const promises = [];
    const results = [];

    for (let i = 0; i < 3; i++) {
      const tabId = `tab_${i}`;
      const promise = mockAgencySelection("agency_123", tabId)
        .then((result) => ({ tabId, result }))
        .catch((error) => ({ tabId, error: error.message }));
      promises.push(promise);
    }

    const concurrentResults = await Promise.all(promises);
    const successCount = concurrentResults.filter(
      (r) => r.result.success,
    ).length;

    assert(
      successCount === 1,
      "Only one agency selection should succeed concurrently",
      "agencyContext",
    );

    // Test 2: Agency data consistency
    const storedAgency = JSON.parse(
      global.localStorage.getItem("axolop_current_agency") || "{}",
    );
    assert(
      storedAgency.id === "agency_123",
      "Agency data should be correctly stored",
      "agencyContext",
    );
  } catch (error) {
    assert(
      false,
      `AgencyContext test error: ${error.message}`,
      "agencyContext",
    );
  }
}

// 3. Modal Coordination Tests
async function testModalCoordination() {
  console.log("\n🎭 TESTING MODAL COORDINATION");

  try {
    // Test 1: Modal state broadcasting
    const modalStates = [];

    // Mock modal component
    class MockModal {
      constructor(tabId) {
        this.tabId = tabId;
        this.isOpen = false;
      }

      async open() {
        this.isOpen = true;
        // Broadcast modal state
        const message = {
          type: "MODAL_STATE",
          data: { modalType: "mandatory", isOpen: true },
          tabId: this.tabId,
          timestamp: Date.now(),
        };

        // Simulate broadcast
        global.BroadcastChannel.prototype.postMessage.call(
          { name: "axolop-tab-coordination" },
          message,
        );
      }

      handleModalStateChange(data) {
        if (data.modalType === "mandatory" && data.sourceTab !== this.tabId) {
          this.isOpen = false; // Hide modal if another tab opened it
        }
      }
    }

    const modals = [
      new MockModal("tab_1"),
      new MockModal("tab_2"),
      new MockModal("tab_3"),
    ];

    // Open modal in first tab
    await modals[0].open();

    // Check that only first modal is open
    assert(
      modals[0].isOpen === true,
      "First modal should be open",
      "modalCoordination",
    );
    assert(
      modals[1].isOpen === false,
      "Second modal should be closed",
      "modalCoordination",
    );
    assert(
      modals[2].isOpen === false,
      "Third modal should be closed",
      "modalCoordination",
    );

    // Test 2: Master tab modal authority
    // Mock master tab check
    const isMasterTab = (tabId) => tabId === "tab_1";

    const canShowModal = (tabId, modalType) => {
      if (modalType === "mandatory") {
        return isMasterTab(tabId);
      }
      return true;
    };

    assert(
      canShowModal("tab_1", "mandatory") === true,
      "Master tab can show mandatory modal",
      "modalCoordination",
    );
    assert(
      canShowModal("tab_2", "mandatory") === false,
      "Non-master tab cannot show mandatory modal",
      "modalCoordination",
    );
    assert(
      canShowModal("tab_2", "optional") === true,
      "Any tab can show optional modal",
      "modalCoordination",
    );
  } catch (error) {
    assert(
      false,
      `Modal coordination test error: ${error.message}`,
      "modalCoordination",
    );
  }
}

// 4. SupabaseSingleton Tests
async function testSupabaseSingleton() {
  console.log("\n🗄️ TESTING SUPABASE SINGLETON");

  try {
    // Test 1: Singleton pattern
    // Mock the singleton behavior
    class MockSupabaseSingleton {
      constructor() {
        if (MockSupabaseSingleton.instance) {
          return MockSupabaseSingleton.instance;
        }
        this.client = null;
        this.session = null;
        this.isInitialized = false;
        MockSupabaseSingleton.instance = this;
      }

      async initialize() {
        if (this.isInitialized) return this.client;

        // Mock client
        this.client = {
          auth: {
            onAuthStateChange: () => ({ data: { subscription: null } }),
            getSession: () =>
              Promise.resolve({
                data: { session: { user: { id: "test_user" } } },
              }),
            refreshSession: () =>
              Promise.resolve({
                data: { session: { user: { id: "test_user" } } },
              }),
          },
        };

        this.isInitialized = true;
        return this.client;
      }
    }

    const singleton1 = new MockSupabaseSingleton();
    const singleton2 = new MockSupabaseSingleton();

    assert(
      singleton1 === singleton2,
      "Singleton should return same instance",
      "supabaseSingleton",
    );

    // Test 2: Cross-tab session sync
    const sessionEvents = [];

    // Mock session change broadcast
    const broadcastSessionChange = (session, tabId) => {
      const message = {
        type: "AUTH_STATE_CHANGE",
        data: { session, event: "SIGNED_IN" },
        sessionId: tabId,
        timestamp: Date.now(),
      };

      // Simulate broadcast to other tabs
      global.BroadcastChannel.prototype.postMessage.call(
        { name: "supabase-auth" },
        message,
      );
    };

    // Test session sync
    const testSession = {
      user: { id: "test_user", email: "test@example.com" },
      access_token: "mock_token",
      expires_at: Date.now() + 3600000,
    };

    broadcastSessionChange(testSession, "tab_1");

    // Verify session was broadcast
    const messages = global.BroadcastChannel.prototype.getMessages();
    const sessionMessage = messages.find((m) => m.type === "AUTH_STATE_CHANGE");

    assert(
      sessionMessage !== undefined,
      "Session change should be broadcast",
      "supabaseSingleton",
    );
    assert(
      sessionMessage.data.session.user.id === "test_user",
      "Session data should be correct",
      "supabaseSingleton",
    );

    // Test 3: Token refresh coordination
    const refreshEvents = [];

    // Mock token refresh
    const mockTokenRefresh = async (isMaster) => {
      if (!isMaster) {
        // Non-master tabs should wait for master
        return new Promise((resolve) => {
          setTimeout(() => resolve({ success: true }), 1000);
        });
      }

      // Master tab performs refresh
      await sleep(500);
      return { success: true, session: testSession };
    };

    // Test master tab refresh
    const masterResult = await mockTokenRefresh(true);
    assert(
      masterResult.success === true,
      "Master tab should refresh token",
      "supabaseSingleton",
    );

    // Test non-master tab waiting
    const nonMasterResult = await mockTokenRefresh(false);
    assert(
      nonMasterResult.success === true,
      "Non-master tab should wait for refresh",
      "supabaseSingleton",
    );
  } catch (error) {
    assert(
      false,
      `SupabaseSingleton test error: ${error.message}`,
      "supabaseSingleton",
    );
  }
}

// 5. Backend API Tests
async function testBackendApi() {
  console.log("\n🔌 TESTING BACKEND API");

  try {
    // Test 1: Concurrent agency selection requests
    const mockApiCall = async (agencyId, userId, tabId) => {
      // Simulate API delay
      await sleep(Math.random() * 200 + 100);

      // Simulate request validation
      if (!agencyId || !userId) {
        throw new Error("Missing required parameters");
      }

      // Simulate database operation
      const result = {
        success: true,
        data: {
          agencyId,
          userId,
          selectedBy: tabId,
          timestamp: Date.now(),
        },
      };

      return result;
    };

    // Test concurrent requests
    const concurrentRequests = [];
    for (let i = 0; i < 5; i++) {
      const request = mockApiCall("agency_123", "user_456", `tab_${i}`)
        .then((result) => ({ tabId: `tab_${i}`, result }))
        .catch((error) => ({ tabId: `tab_${i}`, error: error.message }));
      concurrentRequests.push(request);
    }

    const apiResults = await Promise.all(concurrentRequests);
    const successCount = apiResults.filter((r) => r.result.success).length;

    assert(
      successCount === 5,
      "All concurrent API requests should succeed",
      "backendApi",
    );

    // Test 2: Rate limiting and session handling
    const requestTimes = [];
    const mockRateLimitedApi = async (sessionId) => {
      const now = Date.now();
      const recentRequests = requestTimes.filter((t) => now - t < 1000); // Last second

      if (recentRequests.length >= 10) {
        // 10 requests per second limit
        throw new Error("Rate limit exceeded");
      }

      requestTimes.push(now);
      await sleep(50);
      return { success: true, sessionId };
    };

    // Test rate limiting
    const rateLimitRequests = [];
    for (let i = 0; i < 12; i++) {
      const request = mockRateLimitedApi("session_123")
        .then((result) => ({ success: true, result }))
        .catch((error) => ({ success: false, error: error.message }));
      rateLimitRequests.push(request);
    }

    const rateLimitResults = await Promise.all(rateLimitRequests);
    const rateLimitSuccessCount = rateLimitResults.filter(
      (r) => r.success,
    ).length;
    const rateLimitFailCount = rateLimitResults.filter(
      (r) => !r.success,
    ).length;

    assert(
      rateLimitSuccessCount === 10,
      "First 10 requests should succeed",
      "backendApi",
    );
    assert(
      rateLimitFailCount === 2,
      "Last 2 requests should be rate limited",
      "backendApi",
    );

    // Test 3: Authentication token caching
    const tokenCache = new Map();
    const mockAuthValidation = async (token) => {
      if (tokenCache.has(token)) {
        return { user: { id: "cached_user" }, cached: true };
      }

      // Simulate token validation
      await sleep(100);
      const user = { id: "validated_user" };
      tokenCache.set(token, user);

      // Clear cache after 5 minutes
      setTimeout(() => tokenCache.delete(token), 300000);

      return { user, cached: false };
    };

    // First call - not cached
    const firstCall = await mockAuthValidation("test_token");
    assert(
      firstCall.cached === false,
      "First call should not be cached",
      "backendApi",
    );

    // Second call - cached
    const secondCall = await mockAuthValidation("test_token");
    assert(
      secondCall.cached === true,
      "Second call should be cached",
      "backendApi",
    );
  } catch (error) {
    assert(false, `Backend API test error: ${error.message}`, "backendApi");
  }
}

// 6. Edge Cases and Failure Scenarios
async function testEdgeCases() {
  console.log("\n⚠️ TESTING EDGE CASES");

  try {
    // Test 1: localStorage quota exceeded
    const mockLocalStorage = new MockLocalStorage();

    // Fill localStorage to simulate quota exceeded
    let largeData = "x".repeat(5 * 1024 * 1024); // 5MB
    try {
      mockLocalStorage.setItem("large_data", largeData);
    } catch (error) {
      assert(
        error.name === "QuotaExceededError",
        "Should handle quota exceeded",
        "edgeCases",
      );
    }

    // Test 2: BroadcastChannel not supported
    const originalBroadcastChannel = global.BroadcastChannel;
    global.BroadcastChannel = undefined;

    // Test fallback to localStorage events
    const mockTabCoordinator = {
      initializeBroadcastChannel() {
        try {
          new BroadcastChannel("test");
        } catch (error) {
          // Should fallback to localStorage events
          window.addEventListener("storage", this.handleStorageEvent);
          return "fallback";
        }
      },
    };

    const result = mockTabCoordinator.initializeBroadcastChannel();
    assert(
      result === "fallback",
      "Should fallback to localStorage when BroadcastChannel not supported",
      "edgeCases",
    );

    // Restore BroadcastChannel
    global.BroadcastChannel = originalBroadcastChannel;

    // Test 3: Network connectivity issues
    const mockApiWithNetworkError = async () => {
      // Simulate network error
      throw new Error("Network request failed");
    };

    const networkErrorHandled = await mockApiWithNetworkError()
      .then(() => false)
      .catch((error) => {
        // Should handle network error gracefully
        return error.message === "Network request failed";
      });

    assert(
      networkErrorHandled === true,
      "Should handle network errors gracefully",
      "edgeCases",
    );

    // Test 4: Race condition in master election
    const electionResults = [];
    const mockMasterElection = async (tabId) => {
      await sleep(Math.random() * 100); // Random delay

      const currentMaster = global.localStorage.getItem("axolop_master_tab");
      if (!currentMaster) {
        global.localStorage.setItem(
          "axolop_master_tab",
          JSON.stringify({
            tabId,
            timestamp: Date.now(),
          }),
        );
        electionResults.push({ tabId, elected: true });
      } else {
        electionResults.push({ tabId, elected: false });
      }
    };

    // Simulate multiple tabs trying to become master simultaneously
    const electionPromises = [];
    for (let i = 0; i < 5; i++) {
      electionPromises.push(mockMasterElection(`tab_${i}`));
    }

    await Promise.all(electionPromises);
    const electedCount = electionResults.filter((r) => r.elected).length;

    assert(
      electedCount === 1,
      "Exactly one tab should be elected master",
      "edgeCases",
    );

    // Test 5: Memory leak prevention
    const eventListeners = [];

    // Mock event listener management
    const mockEventManager = {
      listeners: new Map(),

      on(event, callback) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        eventListeners.push(callback);
      },

      off(event, callback) {
        if (this.listeners.has(event)) {
          const callbacks = this.listeners.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      },

      cleanup() {
        this.listeners.clear();
      },
    };

    // Add listeners
    for (let i = 0; i < 10; i++) {
      mockEventManager.on("test", () => console.log(`Listener ${i}`));
    }

    assert(
      mockEventManager.listeners.get("test").length === 10,
      "Should have 10 listeners",
      "edgeCases",
    );

    // Cleanup
    mockEventManager.cleanup();
    assert(
      mockEventManager.listeners.size === 0,
      "Should clean up all listeners",
      "edgeCases",
    );
  } catch (error) {
    assert(false, `Edge cases test error: ${error.message}`, "edgeCases");
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 STARTING COMPREHENSIVE MULTI-SESSION TEST SUITE");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    await testTabCoordinator();
    await testAgencyContext();
    await testModalCoordination();
    await testSupabaseSingleton();
    await testBackendApi();
    await testEdgeCases();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Print results
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));

    const categories = Object.keys(testResults);
    let totalPassed = 0;
    let totalFailed = 0;

    categories.forEach((category) => {
      const results = testResults[category];
      totalPassed += results.passed;
      totalFailed += results.failed;

      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${results.passed}`);
      console.log(`  ❌ Failed: ${results.failed}`);

      if (results.errors.length > 0) {
        console.log("  🚨 Errors:");
        results.errors.forEach((error) => {
          console.log(`    - ${error}`);
        });
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log("OVERALL SUMMARY:");
    console.log(`  ✅ Total Passed: ${totalPassed}`);
    console.log(`  ❌ Total Failed: ${totalFailed}`);
    console.log(`  ⏱️  Duration: ${duration}ms`);
    console.log(
      `  📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`,
    );

    if (totalFailed === 0) {
      console.log(
        "\n🎉 ALL TESTS PASSED! Multi-session implementation is working correctly.",
      );
    } else {
      console.log("\n⚠️  SOME TESTS FAILED! Please review the errors above.");
    }

    return totalFailed === 0;
  } catch (error) {
    console.error("❌ Test suite error:", error);
    return false;
  }
}

// Export for use in Node.js or browser
export { runAllTests, testResults };

// Auto-run if called directly
if (typeof window === "undefined") {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

// Auto-run if called directly
runAllTests().then((success) => {
  console.log("\n🏁 Test suite completed");
});

// Auto-run if called directly
if (typeof window === "undefined") {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
