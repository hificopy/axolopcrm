/**
 * 🚀 AXOLOP CRM - SUPABASE SINGLETON SERVICE
 *
 * Eliminates dual client race conditions by providing a single, centralized
 * Supabase client with advanced multi-session management capabilities.
 *
 * Features:
 * - Singleton pattern ensures one client instance
 * - Cross-tab session synchronization
 * - Token refresh coordination
 * - Request queuing during refresh
 * - Session health monitoring
 * - Graceful error handling
 */

import { createClient } from "@supabase/supabase-js";

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

    // Bind methods to maintain context
    this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
    this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
    this.startHeartbeat = this.startHeartbeat.bind(this);
  }

  /**
   * Initialize the singleton Supabase client
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

    console.log("🔧 Initializing Supabase singleton client...");

    // Create the Supabase client with enhanced configuration
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        flowType: "pkce",
        // Custom session handling for multi-tab support
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

    this.isInitialized = true;
    console.log("✅ Supabase singleton initialized successfully");

    return this.client;
  }

  /**
   * Generate unique session ID for this tab
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Initialize cross-tab broadcast channel
   */
  initializeBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel("supabase-auth");
      this.broadcastChannel.addEventListener(
        "message",
        this.handleBroadcastMessage,
      );
      console.log("📡 Broadcast channel initialized for cross-tab sync");
    } catch (error) {
      console.warn(
        "⚠️ BroadcastChannel not supported, falling back to storage events",
      );
      // Fallback to localStorage events for older browsers
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
  }

  /**
   * Handle broadcast messages from other tabs
   */
  handleBroadcastMessage(event) {
    const { type, data, sessionId } = event.data;

    // Ignore messages from this session
    if (sessionId === this.sessionId) return;

    console.log(`📨 Received broadcast: ${type} from session ${sessionId}`);

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
        this.handleExternalHeartbeat(sessionId);
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
        console.warn("Failed to parse storage event:", error);
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
      sessionId: this.sessionId,
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
        setTimeout(
          () => localStorage.removeItem("supabase-auth-broadcast"),
          100,
        );
      }
    } catch (error) {
      console.warn("Failed to broadcast message:", error);
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

    // Broadcast to other tabs
    this.broadcast("AUTH_STATE_CHANGE", {
      event,
      session: session
        ? {
            user: session.user,
            access_token: session.access_token,
            expires_at: session.expires_at,
          }
        : null,
    });

    // Notify local listeners
    this.emit("auth-state-change", { event, session, previousSession });

    // Handle specific events
    if (event === "TOKEN_REFRESHED") {
      this.handleTokenRefreshed(session);
    } else if (event === "SIGNED_OUT") {
      this.handleSignedOut();
    }
  }

  /**
   * Handle external auth changes from other tabs
   */
  handleExternalAuthChange(data) {
    if (data.session) {
      this.session = data.session;
      this.user = data.session.user;
      console.log("🔄 Session updated from external tab");
    } else {
      this.session = null;
      this.user = null;
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
   * Get current session with validation
   */
  async getSession() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If we're refreshing, wait for it to complete
    if (this.isRefreshing) {
      console.log("⏳ Token refresh in progress, waiting...");
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    // Validate current session
    if (this.session && this.isTokenExpired(this.session)) {
      console.log("⚠️ Token expired, triggering refresh...");
      await this.refreshToken();
    }

    return this.session;
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
   * Refresh token with coordination across tabs
   */
  async refreshToken() {
    if (this.isRefreshing) {
      console.log("⏳ Refresh already in progress, waiting...");
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.isRefreshing = true;
    this.broadcast("TOKEN_REFRESH_START");

    try {
      console.log("🔄 Starting token refresh...");
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

    // Resolve queued requests
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
    this.stopHeartbeat();
    this.emit("signed-out");
  }

  /**
   * Handle external logout
   */
  handleExternalLogout(data) {
    if (data.allSessions || data.sessionId === this.sessionId) {
      this.session = null;
      this.user = null;
      this.stopHeartbeat();
      console.log("👋 Logged out from external tab");
      this.emit("external-logout", data);
    }
  }

  /**
   * Sign out with optional broadcast to other tabs
   */
  async signOut(options = { broadcast: true, allSessions: false }) {
    try {
      if (options.broadcast) {
        this.broadcast("SESSION_LOGOUT", {
          allSessions: options.allSessions,
          sessionId: this.sessionId,
        });
      }

      const { error } = await this.client.auth.signOut();
      if (error) throw error;

      this.handleSignedOut();
    } catch (error) {
      console.error("❌ Sign out error:", error);
      throw error;
    }
  }

  /**
   * Start heartbeat for session health monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.lastActivity = Date.now();
      this.broadcast("HEARTBEAT");

      // Check session health
      if (this.session) {
        const timeSinceLastActivity = Date.now() - this.lastActivity;
        if (timeSinceLastActivity > 30 * 60 * 1000) {
          // 30 minutes
          console.warn("⚠️ Session inactive for 30 minutes");
          this.sessionHealth = "stale";
        } else {
          this.sessionHealth = "healthy";
        }
      }
    }, 60000); // Every minute

    console.log("💓 Heartbeat started");
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log("💔 Heartbeat stopped");
    }
  }

  /**
   * Handle external heartbeat
   */
  handleExternalHeartbeat(sessionId) {
    // Track other active sessions
    console.log(`💓 Heartbeat from session: ${sessionId}`);
  }

  /**
   * Get session health information
   */
  getSessionHealth() {
    return {
      sessionId: this.sessionId,
      health: this.sessionHealth,
      lastActivity: this.lastActivity,
      isRefreshing: this.isRefreshing,
      hasSession: !!this.session,
      userId: this.user?.id,
    };
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
          console.error(`Error in event listener for ${event}:`, error);
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
      // Auto-initialize instead of throwing error
      this.initialize().catch((error) => {
        console.error("❌ Auto-initialization failed:", error);
      });
      return null;
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
   * Get current session
   */
  getCurrentSession() {
    return this.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.session && !!this.user;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopHeartbeat();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }

    window.removeEventListener("storage", this.handleStorageEvent);
    this.eventListeners.clear();

    console.log("🧹 Supabase singleton cleaned up");
  }
}

// Create and export the singleton instance
const supabaseSingleton = new SupabaseSingleton();

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
