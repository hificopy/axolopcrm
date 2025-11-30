/**
 * 🚀 AXOLOP CRM - SUPABASE SINGLETON SERVICE
 *
 * Enhanced singleton with comprehensive multi-session management:
 * - Tab coordination integration
 * - Master-only token refresh
 * - Session conflict detection
 * - Atomic operations
 * - Enhanced error handling
 */

import { createClient } from "@supabase/supabase-js";
import { isMasterTab, onTabEvent, offTabEvent } from "../utils/TabCoordinator";

class SupabaseSingleton {
  constructor() {
    this.client = null;
    this.session = null;
    this.user = null;
    this.isInitialized = false;
    this.isRefreshing = false;
    this.refreshQueue = [];
    this.sessionId = this.generateSessionId();
    this.lastActivity = Date.now();

    // Cross-tab communication
    this.broadcastChannel = null;
    this.eventListeners = new Map();

    // Health monitoring
    this.heartbeatInterval = null;
    this.sessionHealth = "healthy";

    // Tab-specific session tracking
    this.tabSessionId = null;
    this.sessionValidationInterval = null;

    // Bind methods to maintain context
    this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
    this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
    this.startHeartbeat = this.startHeartbeat.bind(this);
  }

  /**
   * Generate unique session ID for this tab
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate tab-specific session identifier
   */
  generateTabSessionId() {
    return `tabsession_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Initialize singleton Supabase client with tab coordination
   */
  async initialize() {
    if (this.isInitialized) {
      return this.client;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Supabase environment variables are not set!");
      throw new Error("Supabase configuration missing");
    }

    console.log(
      "🔧 Initializing Supabase singleton client with tab coordination...",
    );

    // Create Supabase client with enhanced configuration
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        flowType: "pkce",
        debug: process.env.NODE_ENV === "development",
      },
    });

    // Initialize cross-tab communication
    this.initializeBroadcastChannel();

    // Set up auth state listener
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange(this.handleAuthStateChange);

    // Get initial session
    await this.loadInitialSession();

    // Start health monitoring
    this.startHeartbeat();

    // Initialize tab coordination
    this.initializeTabCoordination();

    this.isInitialized = true;
    console.log(
      "✅ Supabase singleton initialized successfully with tab coordination",
    );

    return this.client;
  }

  /**
   * Initialize cross-tab communication
   */
  initializeBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel("supabase-auth");
      this.broadcastChannel.addEventListener(
        "message",
        this.handleBroadcastMessage,
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
    if (tabId === this.sessionId) return;

    console.log(`📨 Received broadcast: ${type} from session ${tabId}`);

    switch (type) {
      case "AUTH_STATE_CHANGE":
        this.handleExternalAuthChange(data);
        break;
      case "TOKEN_REFRESH_START":
        this.handleExternalRefreshStart();
        break;
      case "TOKEN_REFRESH_END":
        this.handleExternalRefreshEnd(data);
        break;
      case "SESSION_LOGOUT":
        this.handleExternalLogout(data);
        break;
      case "HEARTBEAT":
        this.handleExternalHeartbeat(tabId, timestamp);
        break;
    }
  }

  /**
   * Handle storage events for browsers without BroadcastChannel
   */
  handleStorageEvent(event) {
    if (event.key === "supabase-auth-broadcast") {
      try {
        const message = JSON.parse(event.newValue);
        this.handleBroadcastMessage({ data: message });
      } catch (error) {
        console.warn("[TabCoordinator] Failed to parse storage event:", error);
      }
    }
  }

  /**
   * Broadcast message to other tabs
   */
  broadcast(type, data = {}) {
    const message = {
      type,
      data,
      tabId: this.sessionId,
      timestamp: Date.now(),
    };

    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message);
      } else {
        // Fallback to localStorage
        localStorage.setItem(
          "supabase-auth-broadcast",
          JSON.stringify(message),
        );
        // Clear immediately to trigger storage events in other tabs
        setTimeout(() => {
          try {
            localStorage.removeItem("supabase-auth-broadcast");
          } catch (error) {
            // Ignore cleanup errors
          }
        }, 100);
      }
    } catch (error) {
      console.warn("[TabCoordinator] Failed to broadcast message:", error);
    }
  }

  /**
   * Handle authentication state changes
   */
  async handleAuthStateChange(event, session) {
    console.log(`🔄 Auth state changed: ${event}`, session?.user?.id);

    const previousSession = this.session;
    this.session = session;
    this.user = session?.user || null;
    this.lastActivity = Date.now();

    // Generate tab-specific session ID for new sessions
    if (session && event === "SIGNED_IN") {
      this.tabSessionId = this.generateTabSessionId();
      console.log(`🆔 Generated tab session ID: ${this.tabSessionId}`);
    }

    // Broadcast to other tabs with tab session info
    this.broadcast("AUTH_STATE_CHANGE", {
      event,
      session: session
        ? {
            user: session.user,
            access_token: session.access_token,
            expires_at: session.expires_at,
            tabSessionId: this.tabSessionId,
          }
        : null,
      tabSessionId: this.tabSessionId,
    });

    // Notify local listeners
    this.emit("auth-state-change", { event, session, previousSession });

    // Handle specific events
    if (event === "TOKEN_REFRESHED") {
      this.handleTokenRefreshed(session);
    } else if (event === "SIGNED_OUT") {
      this.handleSignedOut();
    }

    // Start session validation for new sessions
    if (session && event === "SIGNED_IN") {
      this.startSessionValidation();
    }
  }

  /**
   * Handle external auth changes from other tabs
   */
  handleExternalAuthChange(data) {
    if (data.session) {
      // Check if this is from the same tab session
      if (data.tabSessionId && data.tabSessionId === this.tabSessionId) {
        console.log("🔄 Ignoring auth change from same tab session");
        return;
      }

      this.session = data.session;
      this.user = data.session.user;
      console.log(
        "🔄 Session updated from external tab (different tab session)",
      );
    } else {
      this.session = null;
      this.user = null;
      this.tabSessionId = null;
      console.log("🔄 Session cleared from external tab");
    }

    this.emit("external-auth-change", data);
  }

  /**
   * Load initial session
   */
  async loadInitialSession() {
    try {
      const {
        data: { session },
        error,
      } = await this.client.auth.getSession();

      if (!error && session) {
        this.session = session;
        this.user = session.user;
        console.log("✅ Initial session loaded:", session.user.id);
      }
    } catch (error) {
      console.error("❌ Failed to load initial session:", error);
    }
  }

  /**
   * Initialize tab coordination
   */
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

  /**
   * Validate session state when becoming master
   */
  async validateSessionState() {
    try {
      if (this.session) {
        console.log("🔍 Validating session state as new master tab");

        // Check if session is still valid
        if (this.isTokenExpired(this.session)) {
          console.log("⚠️ Session expired as master, refreshing...");
          await this.refreshToken();
        }
      }
    } catch (error) {
      console.error("❌ Error validating session state:", error);
    }
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpired(session) {
    if (!session?.expires_at) return true;

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    const bufferTime = 300; // 5 minutes buffer

    return now >= expiresAt - bufferTime;
  }

  /**
   * Refresh token with coordination across tabs (master tab only)
   */
  async refreshToken() {
    if (this.isRefreshing) {
      console.log("⏳ Refresh already in progress, waiting...");
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    // Only master tab should initiate token refresh to avoid conflicts
    if (!isMasterTab()) {
      console.log(
        "🔄 Not master tab, waiting for token refresh from master...",
      );
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.isRefreshing = true;
    this.broadcast("TOKEN_REFRESH_START");

    try {
      console.log("🔄 Starting token refresh (master tab)...");
      const { data, error } = await this.client.auth.refreshSession();

      if (error) {
        console.error("❌ Token refresh failed:", error);
        throw error;
      }

      console.log("✅ Token refreshed successfully");
      this.broadcast("TOKEN_REFRESH_END", {
        success: true,
        session: data.session,
      });

      return data.session;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      this.broadcast("TOKEN_REFRESH_END", {
        success: false,
        error: error.message,
      });
      throw error;
    } finally {
      this.isRefreshing = false;

      // Resolve all queued requests
      this.refreshQueue.forEach((resolve) => resolve(this.session));
      this.refreshQueue = [];
    }
  }

  /**
   * Handle external refresh start
   */
  handleExternalRefreshStart() {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      console.log("⏳ External token refresh detected, pausing requests...");
    }
  }

  /**
   * Handle external refresh end
   */
  handleExternalRefreshEnd(data) {
    this.isRefreshing = false;

    if (data.success && data.session) {
      this.session = data.session;
      this.user = data.session.user;
      console.log("✅ Session updated from external refresh");
    }

    // Resolve all queued requests
    this.refreshQueue.forEach((resolve) => resolve(this.session));
    this.refreshQueue = [];
  }

  /**
   * Handle token refreshed event
   */
  handleTokenRefreshed(session) {
    console.log("🔄 Token refreshed locally");
    this.emit("token-refreshed", session);
  }

  /**
   * Handle signed out event
   */
  handleSignedOut() {
    console.log("👋 Signed out");
    this.session = null;
    this.user = null;
    this.tabSessionId = null;
    this.stopSessionValidation();
    this.emit("signed-out");
  }

  /**
   * Handle external logout
   */
  handleExternalLogout(data) {
    if (data.allSessions || data.sessionId === this.sessionId) {
      this.session = null;
      this.user = null;
      this.tabSessionId = null;
      this.stopSessionValidation();
      console.log("👋 Logged out from external tab");
      this.emit("external-logout", data);
    }
  }

  /**
   * Handle external heartbeat
   */
  handleExternalHeartbeat(tabId, timestamp) {
    if (this.isMaster) {
      // Master tab monitors other tabs
      console.log(`💓 Heartbeat from session: ${tabId}`);
    }
  }

  /**
   * Start heartbeat for session health monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.lastActivity = Date.now();
      this.broadcast("HEARTBEAT", { isMaster: isMasterTab() });
    }, 3000); // Every 3 seconds

    console.log("💓 Heartbeat started");
  }

  /**
   * Start session validation to detect conflicts
   */
  startSessionValidation() {
    if (this.sessionValidationInterval) {
      clearInterval(this.sessionValidationInterval);
    }

    this.sessionValidationInterval = setInterval(() => {
      this.validateSessionConsistency();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Stop session validation
   */
  stopSessionValidation() {
    if (this.sessionValidationInterval) {
      clearInterval(this.sessionValidationInterval);
      this.sessionValidationInterval = null;
    }
  }

  /**
   * Validate session consistency across tabs
   */
  async validateSessionConsistency() {
    if (!this.session || !this.tabSessionId) return;

    try {
      // Check if our session is still valid
      const {
        data: { session },
        error,
      } = await this.client.auth.getSession();

      if (error || !session) {
        console.debug(
          "⚠️ Session validation failed, may have been invalidated by another tab",
        );
        this.emit("session-conflict", { type: "invalidated" });
        return;
      }

      // Check if user ID matches
      if (session.user?.id !== this.user?.id) {
        console.debug(
          "⚠️ User ID mismatch detected, possible session conflict",
        );
        this.emit("session-conflict", { type: "user_mismatch" });
        return;
      }

      // Check if tab session ID matches
      if (session.tabSessionId !== this.tabSessionId) {
        console.debug("⚠️ Tab session ID mismatch, possible session conflict");
        this.emit("session-conflict", { type: "tab_session_mismatch" });
        return;
      }
    } catch (error) {
      console.error("❌ Error during session validation:", error);
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
            `[SupabaseSingleton] Error in event listener for ${event}:`,
            error,
          );
        }
      });
    }
  }

  /**
   * Get Supabase client instance
   */
  getClient() {
    if (!this.isInitialized) {
      console.warn(
        "⚠️ Supabase singleton not initialized. Auto-initializing...",
      );
      this.initialize().catch((error) => {
        console.error("❌ Auto-initialization failed:", error);
      });
    }
    return this.client;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current session (sync)
   */
  getCurrentSession() {
    return this.session;
  }

  /**
   * Get session (async) - fetches fresh session from Supabase
   * Used by request-queue.js and other services
   */
  async getSession() {
    try {
      // If we have a cached session, return it
      if (this.session) {
        return this.session;
      }
      // Otherwise fetch from Supabase
      const { data: { session }, error } = await this.client.auth.getSession();
      if (error) {
        console.error('[SupabaseSingleton] Error getting session:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('[SupabaseSingleton] Exception getting session:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.session && !!this.user;
  }

  /**
   * Get session health information
   */
  getSessionHealth() {
    return {
      sessionId: this.sessionId,
      tabSessionId: this.tabSessionId,
      health: this.sessionHealth,
      lastActivity: this.lastActivity,
      isRefreshing: this.isRefreshing,
      hasSession: !!this.session,
      userId: this.user?.id,
      isMaster: isMasterTab(),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    console.log("🧹 Supabase singleton cleaning up");

    this.stopSessionValidation();
    this.stopHeartbeat();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }

    window.removeEventListener("storage", this.handleStorageEvent);
    this.eventListeners.clear();

    console.log("🧹 Supabase singleton cleaned up");
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create and export the singleton instance
const supabaseSingleton = new SupabaseSingleton();

// Expose on window for request-queue.js and other services that need global access
if (typeof window !== "undefined") {
  window.supabaseSingleton = supabaseSingleton;
}

export default supabaseSingleton;

// Export convenience methods
export const initializeSupabase = () => supabaseSingleton.initialize();
export const getSupabaseClient = () => supabaseSingleton.getClient();
export const getSupabaseSession = () => supabaseSingleton.getSession();
export const getSupabaseUser = () => supabaseSingleton.getUser();
export const isSupabaseAuthenticated = () =>
  supabaseSingleton.isAuthenticated();
export const signOutSupabase = (options) => supabaseSingleton.signOut(options);
export const getSessionHealth = () => supabaseSingleton.getSessionHealth();
export const onSupabaseEvent = (event, callback) =>
  supabaseSingleton.on(event, callback);
export const offSupabaseEvent = (event, callback) =>
  supabaseSingleton.off(event, callback);
