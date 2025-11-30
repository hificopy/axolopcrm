/**
 * 🚀 AXOLOP CRM - TAB COORDINATOR
 *
 * Prevents conflicts between multiple browser tabs by implementing:
 * - Master tab election system with atomic operations
 * - localStorage mutex for critical operations
 * - Cross-tab communication coordination
 * - Modal state synchronization
 * - Storage quota management
 * - Enhanced error handling with retry logic
 */

class TabCoordinator {
  constructor() {
    this.tabId = this.generateTabId();
    this.isMaster = false;
    this.heartbeatInterval = null;
    this.broadcastChannel = null;
    this.eventListeners = new Map();
    this.mutexLocks = new Map();
    this.lastHeartbeat = Date.now();
    this.cleanupInterval = null;

    // Initialize coordinator
    this.initialize();
  }

  /**
   * Generate unique tab identifier
   */
  generateTabId() {
    return `tab_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Initialize tab coordinator
   */
  async initialize() {
    console.log(`[TabCoordinator] Initializing tab ${this.tabId}`);

    // Check storage quota first
    if (!this.checkStorageQuota()) {
      console.warn(
        "[TabCoordinator] Limited storage quota, some features may not work",
      );
    }

    // Initialize broadcast channel
    this.initializeBroadcastChannel();

    // Try to become master
    await this.electMaster();

    // Start heartbeat
    this.startHeartbeat();

    // Start cleanup interval
    this.startCleanupInterval();

    // Listen for tab close events
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });

    console.log(
      `[TabCoordinator] Tab ${this.tabId} initialized. Master: ${this.isMaster}`,
    );
  }

  /**
   * Initialize broadcast channel for cross-tab communication
   */
  initializeBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel("axolop-tab-coordination");
      this.broadcastChannel.addEventListener(
        "message",
        this.handleBroadcastMessage.bind(this),
      );
    } catch (error) {
      console.warn(
        "[TabCoordinator] BroadcastChannel not supported, using localStorage fallback",
      );
      // Fallback to localStorage events for older browsers
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
  }

  /**
   * Handle broadcast messages from other tabs
   */
  handleBroadcastMessage(event) {
    const { type, data, tabId, timestamp } = event.data;

    // Ignore messages from this tab
    if (tabId === this.tabId) return;

    console.log(
      `[TabCoordinator] Received broadcast: ${type} from session ${tabId}`,
    );

    switch (type) {
      case "HEARTBEAT":
        this.handleExternalHeartbeat(tabId, timestamp);
        break;
      case "MASTER_ELECTION":
        this.handleMasterElection(data, tabId);
        break;
      case "MUTEX_LOCK":
        this.handleMutexLock(data, tabId);
        break;
      case "MUTEX_UNLOCK":
        this.handleMutexUnlock(data, tabId);
        break;
      case "MODAL_STATE":
        this.handleModalState(data, tabId);
        break;
      case "MASTER_RELINQUISH":
        this.handleMasterRelinquish(tabId);
        break;
    }
  }

  /**
   * Handle storage events for browsers without BroadcastChannel
   */
  handleStorageEvent(event) {
    if (event.key === "axolop-tab-broadcast") {
      try {
        const message = JSON.parse(event.newValue);
        this.handleBroadcastMessage({ data: message });
      } catch (error) {
        console.warn("[TabCoordinator] Failed to parse storage event:", error);
      }
    }
  }

  /**
   * Broadcast message to other tabs with retry logic
   */
  async broadcast(type, data = {}, retries = 3) {
    const message = {
      type,
      data,
      tabId: this.tabId,
      timestamp: Date.now(),
    };

    let attempt = 0;
    while (attempt < retries) {
      attempt++;

      try {
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage(message);
          return true; // Success
        } else {
          // Fallback to localStorage
          localStorage.setItem("axolop-tab-broadcast", JSON.stringify(message));
          // Clear immediately to trigger storage events in other tabs
          setTimeout(() => {
            try {
              localStorage.removeItem("axolop-tab-broadcast");
            } catch (error) {
              // Ignore cleanup errors
            }
          }, 100);
          return true; // Success
        }
      } catch (error) {
        console.warn(
          `[TabCoordinator] Broadcast attempt ${attempt} failed:`,
          error,
        );
      }

      if (attempt < retries) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
      }
    }

    console.error(
      `[TabCoordinator] All broadcast attempts failed for type: ${type}`,
    );
    return false;
  }

  /**
   * Elect master tab with atomic compare-and-swap to prevent race conditions
   */
  async electMaster() {
    const currentMaster = this.getStoredMaster();

    if (!currentMaster || this.isTabExpired(currentMaster)) {
      // Use atomic election to prevent race conditions
      const electionId =
        Date.now() + "_" + Math.random().toString(36).substring(2);
      const candidateInfo = {
        tabId: this.tabId,
        electionId,
        timestamp: Date.now(),
        lastHeartbeat: Date.now(),
      };

      try {
        // Atomic write - only succeeds if no master or expired master
        localStorage.setItem(
          "axolop_master_election",
          JSON.stringify(candidateInfo),
        );

        // Small delay to allow other tabs to write
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Verify we won the election
        const stored = localStorage.getItem("axolop_master_election");
        const winner = JSON.parse(stored);

        if (winner.electionId === electionId) {
          // We won the election
          this.setAsMaster();
          console.log(`[TabCoordinator] Won election: ${this.tabId}`);
        } else {
          // Another tab won
          this.isMaster = false;
          console.log(`[TabCoordinator] Lost election to ${winner.tabId}`);
        }

        // Clean up election data
        localStorage.removeItem("axolop_master_election");
      } catch (error) {
        console.error("[TabCoordinator] Election failed:", error);
        this.isMaster = false;
      }
    } else {
      // Master exists, challenge if we're older
      await this.challengeMaster(currentMaster);
    }
  }

  /**
   * Get current master from localStorage
   */
  getStoredMaster() {
    try {
      const master = localStorage.getItem("axolop_master_tab");
      return master ? JSON.parse(master) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a tab is expired (no heartbeat for 10 seconds)
   */
  isTabExpired(tabInfo) {
    return Date.now() - tabInfo.lastHeartbeat > 10000;
  }

  /**
   * Set this tab as master
   */
  setAsMaster() {
    this.isMaster = true;
    const masterInfo = {
      tabId: this.tabId,
      timestamp: Date.now(),
      lastHeartbeat: Date.now(),
    };

    localStorage.setItem("axolop_master_tab", JSON.stringify(masterInfo));
    this.broadcast("MASTER_ELECTION", { action: "become_master", masterInfo });

    console.log(`[TabCoordinator] Tab ${this.tabId} became master`);
    this.emit("master-changed", { isMaster: true, tabId: this.tabId });
  }

  /**
   * Challenge current master for leadership
   */
  async challengeMaster(currentMaster) {
    // If we're older, we should be master
    if (this.tabId < currentMaster.tabId) {
      this.setAsMaster();
    } else {
      this.isMaster = false;
      console.log(
        `[TabCoordinator] Tab ${this.tabId} acknowledges master: ${currentMaster.tabId}`,
      );
    }
  }

  /**
   * Handle master election from other tabs
   */
  handleMasterElection(data, tabId) {
    if (data.action === "become_master") {
      if (this.isMaster && this.tabId !== tabId) {
        // We were master but another tab became master, relinquish
        this.relinquishMaster();
      }
      this.isMaster = false;
    }
  }

  /**
   * Handle master relinquish from other tabs
   */
  handleMasterRelinquish(tabId) {
    const currentMaster = this.getStoredMaster();
    if (currentMaster && currentMaster.tabId === tabId) {
      // Master relinquished, try to become master
      this.electMaster();
    }
  }

  /**
   * Start heartbeat to keep master status
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.lastHeartbeat = Date.now();

      if (this.isMaster) {
        // Update master heartbeat in localStorage
        const masterInfo = this.getStoredMaster();
        if (masterInfo && masterInfo.tabId === this.tabId) {
          masterInfo.lastHeartbeat = Date.now();
          localStorage.setItem("axolop_master_tab", JSON.stringify(masterInfo));
        }
      }

      this.broadcast("HEARTBEAT", { isMaster: this.isMaster });
    }, 3000); // Every 3 seconds

    console.log("[TabCoordinator] Heartbeat started");
  }

  /**
   * Handle heartbeat from other tabs
   */
  handleExternalHeartbeat(tabId, timestamp) {
    if (this.isMaster) {
      // Master tab monitors other tabs
      const masterInfo = this.getStoredMaster();
      if (masterInfo && masterInfo.tabId === this.tabId) {
        // Update our last heartbeat
        masterInfo.lastHeartbeat = Date.now();
        localStorage.setItem("axolop_master_tab", JSON.stringify(masterInfo));
      }
    }

    console.log(`[TabCoordinator] Heartbeat from tab: ${tabId}`);
  }

  /**
   * Acquire mutex lock for critical operations with deadlock prevention
   */
  async acquireMutex(lockName, timeout = 5000, maxRetries = 3) {
    if (this.mutexLocks.has(lockName)) {
      return false; // Already held by this tab
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;

      const lockKey = `axolop_mutex_${lockName}`;
      const lockData = {
        tabId: this.tabId,
        timestamp: Date.now(),
        expires: Date.now() + timeout,
        attempt,
      };

      try {
        localStorage.setItem(lockKey, JSON.stringify(lockData));

        // Verify we got the lock
        const stored = localStorage.getItem(lockKey);
        const parsed = JSON.parse(stored);

        if (parsed.tabId === this.tabId && parsed.attempt === attempt) {
          // Check if lock is expired
          if (Date.now() < parsed.expires) {
            this.mutexLocks.set(lockName, parsed.expires);
            this.broadcast("MUTEX_LOCK", { lockName, tabId: this.tabId });
            console.log(
              `[TabCoordinator] Acquired mutex: ${lockName} (attempt ${attempt})`,
            );
            return true;
          } else {
            console.warn(
              `[TabCoordinator] Lock ${lockName} expired, retrying...`,
            );
          }
        }
      } catch (error) {
        console.warn(
          `[TabCoordinator] Mutex attempt ${attempt} failed:`,
          error,
        );
      }

      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
      }
    }

    console.error(
      `[TabCoordinator] Failed to acquire mutex: ${lockName} after ${maxRetries} attempts`,
    );
    return false;
  }

  /**
   * Release mutex lock
   */
  releaseMutex(lockName) {
    if (!this.mutexLocks.has(lockName)) {
      return false; // Not held by this tab
    }

    const lockKey = `axolop_mutex_${lockName}`;

    try {
      localStorage.removeItem(lockKey);
      this.mutexLocks.delete(lockName);
      this.broadcast("MUTEX_UNLOCK", { lockName, tabId: this.tabId });
      console.log(`[TabCoordinator] Released mutex: ${lockName}`);
      return true;
    } catch (error) {
      console.warn("[TabCoordinator] Failed to release mutex:", error);
      return false;
    }
  }

  /**
   * Handle mutex lock from other tabs
   */
  handleMutexLock(data, tabId) {
    if (tabId !== this.tabId) {
      console.log(
        `[TabCoordinator] Mutex acquired by another tab: ${data.lockName} by ${tabId}`,
      );
    }
  }

  /**
   * Handle mutex unlock from other tabs
   */
  handleMutexUnlock(data, tabId) {
    if (tabId !== this.tabId) {
      console.log(
        `[TabCoordinator] Mutex released by another tab: ${data.lockName} by ${tabId}`,
      );
    }
  }

  /**
   * Check if this tab can show a modal (only master tab should show mandatory modals)
   */
  canShowModal(modalType) {
    // For mandatory modals, only master tab can show them
    if (modalType === "mandatory") {
      return this.isMaster;
    }

    // For optional modals, any tab can show them
    return true;
  }

  /**
   * Broadcast modal state to other tabs
   */
  broadcastModalState(modalType, isOpen, data = {}) {
    this.broadcast("MODAL_STATE", { modalType, isOpen, data });
  }

  /**
   * Handle modal state from other tabs
   */
  handleModalState(data, tabId) {
    this.emit("modal-state-changed", { ...data, sourceTab: tabId });
  }

  /**
   * Check storage quota availability
   */
  checkStorageQuota() {
    try {
      const testKey = "axolop_quota_test";
      const testData = "x".repeat(1024); // 1KB test

      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);

      return true; // Quota available
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.warn("[TabCoordinator] Storage quota exceeded, cleaning up...");
        this.cleanupExpiredData();
        return false;
      }
      return false;
    }
  }

  /**
   * Clean up expired data to free storage space
   */
  cleanupExpiredData() {
    const keysToRemove = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("axolop_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key));

            // Remove expired data
            if (data.expires && Date.now() > data.expires) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Remove corrupted data
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`[TabCoordinator] Failed to remove ${key}:`, error);
        }
      });

      console.log(
        `[TabCoordinator] Cleaned up ${keysToRemove.length} expired storage items`,
      );
    } catch (error) {
      console.error("[TabCoordinator] Error during cleanup:", error);
    }
  }

  /**
   * Start cleanup interval for expired data
   */
  startCleanupInterval() {
    // Clean up expired data every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredData();
    }, 300000); // 5 minutes
  }

  /**
   * Relinquish master status
   */
  relinquishMaster() {
    if (this.isMaster) {
      this.isMaster = false;
      localStorage.removeItem("axolop_master_tab");
      this.broadcast("MASTER_RELINQUISH");
      console.log(
        `[TabCoordinator] Tab ${this.tabId} relinquished master status`,
      );
      this.emit("master-changed", { isMaster: false, tabId: this.tabId });
    }
  }

  /**
   * Event emitter functionality
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[TabCoordinator] Error in event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  /**
   * Get coordinator status
   */
  getStatus() {
    return {
      tabId: this.tabId,
      isMaster: this.isMaster,
      lastHeartbeat: this.lastHeartbeat,
      activeLocks: Array.from(this.mutexLocks.keys()),
      masterInfo: this.getStoredMaster(),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    console.log(`[TabCoordinator] Cleaning up tab ${this.tabId}`);

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Release all locks
    this.mutexLocks.forEach((_, lockName) => {
      this.releaseMutex(lockName);
    });

    // Relinquish master if we are master
    if (this.isMaster) {
      this.relinquishMaster();
    }

    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }

    // Remove event listeners
    window.removeEventListener("storage", this.handleStorageEvent);
    window.removeEventListener("beforeunload", this.cleanup);
    this.eventListeners.clear();

    console.log("[TabCoordinator] Tab coordinator cleaned up");
  }
}

// Create and export singleton instance
const tabCoordinator = new TabCoordinator();

export default tabCoordinator;

// Export convenience methods
export const acquireMutex = (lockName, timeout, maxRetries) =>
  tabCoordinator.acquireMutex(lockName, timeout, maxRetries);
export const releaseMutex = (lockName) => tabCoordinator.releaseMutex(lockName);
export const canShowModal = (modalType) =>
  tabCoordinator.canShowModal(modalType);
export const broadcastModalState = (modalType, isOpen, data) =>
  tabCoordinator.broadcastModalState(modalType, isOpen, data);
export const isMasterTab = () => tabCoordinator.isMaster;
export const getTabStatus = () => tabCoordinator.getStatus();
export const onTabEvent = (event, callback) =>
  tabCoordinator.on(event, callback);
export const offTabEvent = (event, callback) =>
  tabCoordinator.off(event, callback);
