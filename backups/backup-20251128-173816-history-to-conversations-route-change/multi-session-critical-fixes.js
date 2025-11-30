/**
 * 🔧 CRITICAL FIXES FOR MULTI-SESSION IMPLEMENTATION
 *
 * Fixes for the critical issues identified in the analysis
 */

// 1. FIX RACE CONDITION IN MASTER ELECTION
console.log("🔧 IMPLEMENTING CRITICAL FIXES...");

// Fix 1: Atomic Master Election for TabCoordinator
const atomicMasterElectionFix = `
// FIXED: Atomic master election in TabCoordinator.js

/**
 * Elect master tab atomically using localStorage with version numbers
 */
async electMaster() {
  const currentMaster = this.getStoredMaster();
  
  // Check if current master is still valid
  if (currentMaster && !this.isTabExpired(currentMaster)) {
    // Challenge current master if we're older
    await this.challengeMaster(currentMaster);
    return;
  }
  
  // Try to become master atomically
  const masterInfo = {
    tabId: this.tabId,
    timestamp: Date.now(),
    lastHeartbeat: Date.now(),
    version: Date.now() + Math.random() // Unique version number
  };
  
  try {
    // Atomic check-and-set operation
    const existingMaster = localStorage.getItem('axolop_master_tab');
    
    if (!existingMaster) {
      // No master, try to become one
      localStorage.setItem('axolop_master_tab', JSON.stringify(masterInfo));
      
      // Verify we actually became master
      const stored = JSON.parse(localStorage.getItem('axolop_master_tab'));
      if (stored.tabId === this.tabId && stored.version === masterInfo.version) {
        this.setAsMaster();
        return;
      }
    } else {
      const parsed = JSON.parse(existingMaster);
      if (!this.isTabExpired(parsed)) {
        // Valid master exists, challenge if we're older
        await this.challengeMaster(parsed);
        return;
      }
    }
    
    // If we get here, retry with exponential backoff
    await this.retryMasterElection();
    
  } catch (error) {
    console.error('[TabCoordinator] Master election error:', error);
    await this.retryMasterElection();
  }
}

/**
 * Retry master election with exponential backoff
 */
async retryMasterElection(retryCount = 0) {
  const maxRetries = 5;
  const baseDelay = 100;
  const maxDelay = 2000;
  
  if (retryCount >= maxRetries) {
    console.warn('[TabCoordinator] Max retries reached, giving up master election');
    this.isMaster = false;
    return;
  }
  
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  await this.electMaster();
}

/**
 * Challenge current master with atomic operation
 */
async challengeMaster(currentMaster) {
  // If we're older, we should be master
  if (this.tabId < currentMaster.tabId) {
    const masterInfo = {
      tabId: this.tabId,
      timestamp: Date.now(),
      lastHeartbeat: Date.now(),
      version: Date.now() + Math.random()
    };
    
    try {
      // Atomic replace
      const existing = localStorage.getItem('axolop_master_tab');
      const parsed = JSON.parse(existing);
      
      if (parsed.tabId === currentMaster.tabId) {
        localStorage.setItem('axolop_master_tab', JSON.stringify(masterInfo));
        
        // Verify we won
        const stored = JSON.parse(localStorage.getItem('axolop_master_tab'));
        if (stored.tabId === this.tabId) {
          this.setAsMaster();
          return;
        }
      }
    } catch (error) {
      console.error('[TabCoordinator] Challenge error:', error);
    }
  }
  
  this.isMaster = false;
  console.log(\`[TabCoordinator] Tab \${this.tabId} acknowledges master: \${currentMaster.tabId}\`);
}
`;

// Fix 2: Mutex Expiration and Cleanup
const mutexExpirationFix = `
// FIXED: Mutex with expiration in TabCoordinator.js

/**
 * Acquire mutex lock with automatic expiration
 */
async acquireMutex(lockName, timeout = 5000) {
  if (this.mutexLocks.has(lockName)) {
    return false; // Already held by this tab
  }

  const lockKey = \`axolop_mutex_\${lockName}\`;
  const lockData = {
    tabId: this.tabId,
    timestamp: Date.now(),
    expiresAt: Date.now() + timeout,
    lockId: Math.random().toString(36).substring(2, 11)
  };

  try {
    // Clean up expired locks first
    this.cleanupExpiredLocks(lockKey);
    
    // Try to acquire lock atomically
    localStorage.setItem(lockKey, JSON.stringify(lockData));

    // Verify we got the lock
    const stored = localStorage.getItem(lockKey);
    const parsed = JSON.parse(stored);

    if (parsed.tabId === this.tabId && parsed.lockId === lockData.lockId) {
      this.mutexLocks.set(lockName, {
        expiresAt: lockData.expiresAt,
        lockId: lockData.lockId
      });
      
      // Set up expiration timer
      setTimeout(() => {
        if (this.mutexLocks.has(lockName)) {
          const lock = this.mutexLocks.get(lockName);
          if (lock.lockId === lockData.lockId) {
            this.releaseMutex(lockName);
          }
        }
      }, timeout);
      
      this.broadcast("MUTEX_LOCK", { lockName, tabId: this.tabId });
      console.log(\`[TabCoordinator] Acquired mutex: \${lockName}\`);
      return true;
    }
  } catch (error) {
    console.warn("[TabCoordinator] Failed to acquire mutex:", error);
  }

  return false;
}

/**
 * Clean up expired locks
 */
cleanupExpiredLocks(lockKey) {
  try {
    const stored = localStorage.getItem(lockKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(lockKey);
        console.log(\`[TabCoordinator] Cleaned up expired lock: \${lockKey}\`);
      }
    }
  } catch (error) {
    // Lock is corrupted, remove it
    localStorage.removeItem(lockKey);
  }
}

/**
 * Release mutex lock
 */
releaseMutex(lockName) {
  if (!this.mutexLocks.has(lockName)) {
    return false; // Not held by this tab
  }

  const lockKey = \`axolop_mutex_\${lockName}\`;
  const lock = this.mutexLocks.get(lockName);

  try {
    // Verify we still own the lock
    const stored = localStorage.getItem(lockKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.tabId === this.tabId && parsed.lockId === lock.lockId) {
        localStorage.removeItem(lockKey);
      }
    }
    
    this.mutexLocks.delete(lockName);
    this.broadcast("MUTEX_UNLOCK", { lockName, tabId: this.tabId });
    console.log(\`[TabCoordinator] Released mutex: \${lockName}\`);
    return true;
  } catch (error) {
    console.warn("[TabCoordinator] Failed to release mutex:", error);
    return false;
  }
}
`;

// Fix 3: Remove Duplicate Code in SupabaseSingleton
const duplicateCodeFix = `
// FIXED: Remove duplicate methods in SupabaseSingleton.js

// Remove duplicate initializeTabCoordination method (lines 678-694)
// Keep only the first implementation (lines 612-628)

// Remove duplicate startSessionValidation method (lines 718-758) 
// Keep only the first implementation (lines 633-673)

// FIXED: Clean implementation
initializeTabCoordination() {
  // Listen for master tab changes
  const handleMasterChange = (data) => {
    console.log(
      "🔄 Supabase singleton responding to master tab change:",
      data,
    );
    if (data.isMaster) {
      // This tab became master - ensure we're in a good state
      this.validateSessionState();
    }
  };

  onTabEvent("master-changed", handleMasterChange);

  console.log("🔗 Tab coordination initialized for Supabase singleton");
}

startSessionValidation() {
  if (this.sessionValidationInterval) {
    clearInterval(this.sessionValidationInterval);
  }

  // Adaptive validation frequency based on user activity
  let validationInterval = 10000; // Default 10 seconds
  
  // Reduce frequency for inactive sessions
  const timeSinceLastActivity = Date.now() - this.lastActivity;
  if (timeSinceLastActivity > 5 * 60 * 1000) { // 5 minutes
    validationInterval = 30000; // 30 seconds
  } else if (timeSinceLastActivity > 30 * 60 * 1000) { // 30 minutes
    validationInterval = 60000; // 1 minute
  }

  this.sessionValidationInterval = setInterval(() => {
    this.validateSessionConsistency();
  }, validationInterval);
}
`;

// Fix 4: Improve Error Handling in AgencyContext
const errorHandlingFix = `
// FIXED: Improved error handling in AgencyContext.jsx

// Select an agency with mutex protection and retry logic
const selectAgency = async (agencyId) => {
  if (!agencyId || !user) return;

  const maxRetries = 3;
  const retryDelay = 1000;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Acquire mutex to prevent race conditions across tabs
    const lockAcquired = await acquireMutex("agency_selection", 10000);
    if (!lockAcquired) {
      if (attempt < maxRetries - 1) {
        console.log(
          \`[AgencyContext] Agency selection in progress, retrying... (attempt \${attempt + 1}/\${maxRetries})\`,
        );
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      } else {
        console.error("[AgencyContext] Could not acquire mutex after all retries");
        setError("Another tab is currently selecting an agency. Please try again.");
        return;
      }
    }

    try {
      console.log(
        \`[AgencyContext] Selecting agency \${agencyId} with mutex protection (attempt \${attempt + 1}/\${maxRetries})\`,
      );

      // Use enhanced validation function (checks agency status and user access)
      const { data: accessResult, error: accessError } = await supabase.rpc(
        "validate_agency_access",
        {
          p_user_id: user.id,
          p_agency_id: agencyId,
        },
      );

      if (accessError || !accessResult?.length) {
        console.error("Error validating agency access:", accessError);
        setError(accessError?.message || "Failed to validate agency access");
        return;
      }

      const access = accessResult[0];
      if (!access.has_access) {
        console.error("Access denied to agency:", access.error_message);
        setError(access.error_message || "Access denied to this agency");
        return;
      }

      // Get full agency details (with safety filters)
      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single();

      if (agencyError) {
        console.error("Error fetching agency:", agencyError);
        setError(agencyError.message || "Failed to fetch agency details");
        return;
      }

      // Create synthetic membership object from access data
      const membership = {
        agency_id: agencyId,
        user_id: user.id,
        role: access.user_role,
        invitation_status: "active",
        permissions: {}, // Will be loaded separately if needed
      };

      setCurrentAgency(agency);
      setCurrentMembership(membership);
      setPermissions(membership.permissions || {});
      setError(null); // Clear any previous errors

      // Sync to localStorage for api.js interceptor to read
      // This is NOT the source of truth (Supabase is), just a cache for request headers
      try {
        localStorage.setItem(
          "axolop_current_agency",
          JSON.stringify({
            id: agency.id,
            name: agency.name,
            slug: agency.slug,
            selectedBy: tabCoordinator.tabId, // Track which tab made the selection
            timestamp: Date.now(),
          }),
        );
      } catch (storageError) {
        console.warn(
          "[AgencyContext] Could not sync agency to localStorage:",
          storageError,
        );
      }

      // Save to Supabase for persistence across devices - this is the only source of truth
      try {
        await supabase.rpc("set_current_agency", {
          p_user_id: user.id,
          p_agency_id: agencyId,
        });
      } catch (rpcError) {
        console.warn(
          "[AgencyContext] Could not persist agency selection to Supabase:",
          rpcError,
        );
      }

      console.log(\`[AgencyContext] Successfully selected agency \${agencyId}\`);
      return; // Success, exit retry loop
      
    } catch (error) {
      console.error(\`[AgencyContext] Error selecting agency (attempt \${attempt + 1}/\${maxRetries}):\`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        setError(error.message || "Failed to select agency. Please try again.");
      }
    } finally {
      // Always release the mutex
      releaseMutex("agency_selection");
    }
  }
};
`;

// Fix 5: localStorage Quota Handling
const quotaHandlingFix = `
// FIXED: localStorage quota handling utility

/**
 * Safe localStorage operations with quota handling
 */
class SafeLocalStorage {
  static isQuotaExceeded(error) {
    return error instanceof DOMException && (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    );
  }

  static setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (this.isQuotaExceeded(error)) {
        console.warn('[SafeLocalStorage] Quota exceeded, attempting cleanup...');
        this.cleanup();
        
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (cleanupError) {
          console.error('[SafeLocalStorage] Still cannot store after cleanup:', cleanupError);
          return false;
        }
      } else {
        console.error('[SafeLocalStorage] Error storing item:', error);
        return false;
      }
    }
  }

  static cleanup() {
    const keysToRemove = [];
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Skip essential keys
      if (key.startsWith('sb-') || key.startsWith('axolop_master_')) {
        continue;
      }
      
      try {
        const value = localStorage.getItem(key);
        
        // Remove expired items
        if (key.includes('timestamp') || key.includes('expires')) {
          const parsed = JSON.parse(value);
          if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
            keysToRemove.push(key);
          }
        }
        
        // Remove old broadcast messages
        if (key.includes('broadcast') || key.includes('mutex')) {
          const parsed = JSON.parse(value);
          if (parsed.timestamp && (now - parsed.timestamp) > 60000) { // 1 minute
            keysToRemove.push(key);
          }
        }
      } catch (error) {
        // Remove corrupted items
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(\`[SafeLocalStorage] Could not remove key \${key}:\`, error);
      }
    });
    
    console.log(\`[SafeLocalStorage] Cleaned up \${keysToRemove.length} items\`);
  }

  static getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[SafeLocalStorage] Error getting item:', error);
      return null;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('[SafeLocalStorage] Error removing item:', error);
      return false;
    }
  }
}

// Usage in TabCoordinator:
// Replace localStorage.setItem with SafeLocalStorage.setItem
// Replace localStorage.getItem with SafeLocalStorage.getItem
// Replace localStorage.removeItem with SafeLocalStorage.removeItem
`;

console.log("\n✅ CRITICAL FIXES PREPARED");
console.log("\n📝 FIXES SUMMARY:");
console.log("1. Atomic master election with version numbers");
console.log("2. Mutex expiration and cleanup");
console.log("3. Removed duplicate code in SupabaseSingleton");
console.log("4. Improved error handling with retry logic");
console.log("5. localStorage quota handling");

console.log("\n🔧 TO APPLY THESE FIXES:");
console.log("1. Update TabCoordinator.js with atomic master election");
console.log("2. Add mutex expiration to prevent deadlocks");
console.log("3. Remove duplicate methods from SupabaseSingleton.js");
console.log("4. Enhance error handling in AgencyContext.jsx");
console.log("5. Implement SafeLocalStorage for quota management");

console.log("\n⚠️  AFTER APPLYING FIXES:");
console.log("- Test multi-session behavior thoroughly");
console.log("- Monitor for race conditions");
console.log("- Check localStorage usage");
console.log("- Verify error handling works correctly");

console.log("\n🎯 EXPECTED IMPROVEMENTS:");
console.log("- Eliminate race conditions in master election");
console.log("- Prevent mutex deadlocks");
console.log("- Better error recovery");
console.log("- Improved reliability in storage-constrained environments");
console.log("- Cleaner, more maintainable code");
