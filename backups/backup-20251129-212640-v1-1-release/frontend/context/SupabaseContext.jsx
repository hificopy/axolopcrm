import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useDemoMode } from "../contexts/DemoModeContext";
import supabaseSingleton, {
  initializeSupabase,
} from "../services/supabase-singleton";

const SupabaseContext = createContext(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

// Safe hook that doesn't throw - returns default values if context missing
export const useSafeSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    // console.warn$1
    return {
      supabase: null,
      user: null,
      session: null,
      loading: true,
      isInitialized: false,
      signInWithOAuth: async () => {
        throw new Error("Supabase not initialized");
      },
      signOut: async () => {
        throw new Error("Supabase not initialized");
      },
      signInWithEmail: async () => {
        throw new Error("Supabase not initialized");
      },
      signUpWithEmail: async () => {
        throw new Error("Supabase not initialized");
      },
      resetPassword: async () => {
        throw new Error("Supabase not initialized");
      },
      getAuthToken: async () => null,
    };
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const { isDemoMode } = useDemoMode();
  const initAttempted = useRef(false);
  const loadingTimeoutRef = useRef(null);

  // Always use real user - demo mode only affects DATA, not USER
  const [user, setUser] = useState(null);

  // Local storage persistence
  const persistAuth = (session) => {
    if (session?.user) {
      localStorage.setItem(
        "axolop_auth_session",
        JSON.stringify({
          user: session.user,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        }),
      );
      localStorage.setItem("axolop_auth_timestamp", Date.now().toString());
    } else {
      localStorage.removeItem("axolop_auth_session");
      localStorage.removeItem("axolop_auth_timestamp");
    }
  };

  // Check for persisted session on mount
  const checkPersistedAuth = useCallback(() => {
    const persistedSession = localStorage.getItem("axolop_auth_session");
    const persistedTimestamp = localStorage.getItem("axolop_auth_timestamp");

    if (persistedSession && persistedTimestamp) {
      try {
        const parsed = JSON.parse(persistedSession);
        const sessionAge = Date.now() - parseInt(persistedTimestamp);

        // Session is valid for 7 days
        if (sessionAge < 7 * 24 * 60 * 60 * 1000 && parsed.access_token) {
          setSession(parsed);
          setUser(parsed.user);
          setLoading(false);
          setIsInitialized(true);

          // CRITICAL: Also initialize Supabase client when using persisted session
          initializeClient()
            .then(() => {
              console.log(
                "[SupabaseContext] Supabase client initialized after persisted session restore",
              );
            })
            .catch((error) => {
              console.error(
                "[SupabaseContext] Failed to initialize client after session restore:",
                error,
              );
            });

          return true;
        }
      } catch (error) {
        console.error("Error parsing persisted session:", error);
      }
    }

    return false;
  }, []);

  // Define callback functions for event listeners (must be at component level for cleanup)
  const handleAuthStateChange = useCallback(
    ({ event, session: newSession }) => {
      // console.log$1
      setSession(newSession);
      setUser(newSession?.user || null);
      // Persist to local storage
      persistAuth(newSession);
    },
    [],
  );

  const handleExternalAuthChange = useCallback(({ session: newSession }) => {
    // console.log$1
    setSession(newSession);
    setUser(newSession?.user || null);
  }, []);

  const handleExternalLogout = useCallback(() => {
    // console.log$1
    setSession(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initAttempted.current) return;
    initAttempted.current = true;

    // Safety timeout - ensure loading never stays true forever
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        // console.warn$1
        setLoading(false);
      }
    }, 15000); // 15 second max loading time

    const initializeClient = async () => {
      console.log("[SupabaseContext] Starting initialization...", {
        hasPersistedSession: checkPersistedAuth(),
        envVars: {
          VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      // First check for persisted session
      const hasPersistedSession = checkPersistedAuth();
      if (hasPersistedSession) {
        console.log(
          "[SupabaseContext] Using persisted session, skipping Supabase init",
        );
        setIsInitialized(true);
        setLoading(false);
        return true; // Skip Supabase initialization
      }

      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.warn("[SupabaseContext] Supabase not configured");
        const mockClient = {
          auth: {
            signInWithOAuth: () =>
              Promise.reject(new Error("Supabase not configured")),
            signInWithPassword: () =>
              Promise.reject(new Error("Supabase not configured")),
            signUp: () => Promise.reject(new Error("Supabase not configured")),
            signOut: () => Promise.reject(new Error("Supabase not configured")),
            resetPasswordForEmail: () =>
              Promise.reject(new Error("Supabase not configured")),
            getUser: () =>
              Promise.resolve({ data: { user: null }, error: null }),
            rpc: () =>
              Promise.resolve({
                data: null,
                error: { message: "Mock client - RPC not available" },
              }),
            from: () => ({
              select: () => Promise.resolve({ data: [], error: null }),
              in: () => Promise.resolve({ data: [], error: null }),
            }),
          },
          rpc: () =>
            Promise.resolve({
              data: null,
              error: { message: "Mock client - RPC not available" },
            }),
          from: () => ({
            select: () => Promise.resolve({ data: [], error: null }),
            in: () => Promise.resolve({ data: [], error: null }),
          }),
        };
        setSupabase(mockClient);
        setIsInitialized(true);
        setLoading(false);
        return;
      }

      try {
        // Use singleton client instead of creating a new one
        // This eliminates dual-client anti-pattern
        console.log("[SupabaseContext] Initializing Supabase client...");
        const client = await initializeSupabase();

        console.log("[SupabaseContext] initializeSupabase returned:", !!client);

        if (!client) {
          console.error(
            "[SupabaseContext] Failed to initialize Supabase client",
          );
          throw new Error("Failed to initialize Supabase client");
        }

        setSupabase(client);
        console.log(
          "[SupabaseContext] Supabase client set in state successfully",
        );

        // Get initial session from singleton
        const initialSession = supabaseSingleton.getCurrentSession();
        const initialUser = supabaseSingleton.getUser();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialUser);
          console.log(
            "[SupabaseContext] Initial session found:",
            initialSession.user?.email,
          );
        }

        // Listen for auth state changes via singleton
        supabaseSingleton.on("auth-state-change", handleAuthStateChange);

        // Listen for external auth changes (from other tabs)
        supabaseSingleton.on("external-auth-change", handleExternalAuthChange);

        // Listen for external logout
        supabaseSingleton.on("external-logout", handleExternalLogout);

        setIsInitialized(true);
        setLoading(false);
        console.log("[SupabaseContext] Initialization complete");
      } catch (error) {
        console.error("[SupabaseContext] Initialization error:", error);
        setInitError(error.message);
        setIsInitialized(false);
        setLoading(false);
      }
    };

    initializeClient();
  }, []); // Run only once on mount

  // DISABLED: Let ProtectedRoute handle all redirects to prevent conflicts
  // Auto-redirecting from context causes loops with React Router
  console.log(
    "[SupabaseContext] Auto-redirect DISABLED - ProtectedRoute handles navigation",
  );

  // Login with OAuth provider (Google, Auth0, etc.)
  const signInWithOAuth = useCallback(
    async (provider) => {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/select-plan`, // Redirect to select plan after OAuth
        },
      });

      if (error) {
        console.error("OAuth sign-in error:", error);
        throw error;
      }
    },
    [supabase],
  );

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error);
      throw error;
    }

    // Clear local storage
    localStorage.removeItem("axolop_auth_session");
    localStorage.removeItem("axolop_auth_timestamp");

    // Trigger storage event for bootstrap reset
    localStorage.setItem("axolop_user_logout", Date.now().toString());

    // Also trigger agency switch event to reset bootstrap
    localStorage.setItem("axolop_agency_switch", Date.now().toString());
  }, [supabase]);

  // Sign in with email and password
  const signInWithEmail = useCallback(
    async (email, password) => {
      // Try to initialize if not already done
      if (!supabase && !isInitialized && !loading) {
        console.log(
          "[SupabaseContext] Attempting to initialize Supabase during sign-in...",
        );
        try {
          const client = await initializeSupabase();
          if (client) {
            setSupabase(client);
            setIsInitialized(true);
            console.log(
              "[SupabaseContext] Supabase initialized successfully during sign-in",
            );
          }
        } catch (error) {
          console.error(
            "[SupabaseContext] Failed to initialize Supabase during sign-in:",
            error,
          );
        }
      }

      if (!supabase) {
        console.error(
          "[SupabaseContext] Sign in attempted but supabase client is null:",
          { supabase, isInitialized, loading },
        );
        throw new Error("Supabase client not initialized");
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: `${window.location.origin}/app/home`, // Redirect to app/home after sign in
        },
      });

      if (error) {
        console.error("Email sign-in error:", error);
        throw error;
      }

      return data;
    },
    [supabase],
  );

  // Sign up with email and password
  const signUpWithEmail = useCallback(
    async (email, password, options = {}) => {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/select-plan`,
          data: {
            ...options, // Additional user metadata
            subscription_status: "none", // Mark as needing plan selection
          },
        },
      });

      if (error) {
        console.error("Sign-up error:", error);
        throw error;
      }

      return data;
    },
    [supabase],
  );

  // Reset password
  const resetPassword = useCallback(
    async (email) => {
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }
    },
    [supabase],
  );

  // Get auth token for API requests
  const getAuthToken = useCallback(async () => {
    if (!supabase) {
      // console.warn$1
      return null;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }, [supabase]);

  const value = {
    supabase,
    user, // Always return real user, even in demo mode
    session,
    loading,
    isInitialized,
    initError,
    isDemoMode, // Expose demo mode status so components can check
    signInWithOAuth,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    getAuthToken,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseProvider;
