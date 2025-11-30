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

const SupabaseContext = createContext();

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

  // Define callback functions for event listeners (must be at component level for cleanup)
  const handleAuthStateChange = useCallback(
    ({ event, session: newSession }) => {
      // console.log$1
      setSession(newSession);
      setUser(newSession?.user || null);
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
      // Check if Supabase is configured
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        // console.warn$1
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
          },
          rpc: () =>
            Promise.resolve({
              data: null,
              error: { message: "Mock client - RPC not available" },
            }),
          from: () => ({
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: null, error: null }),
                in: () => ({
                  eq: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
            }),
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
        // console.log$1
        const client = await initializeSupabase();

        if (!client) {
          throw new Error("Failed to initialize Supabase client");
        }

        setSupabase(client);

        // Get initial session from singleton
        const initialSession = supabaseSingleton.getCurrentSession();
        const initialUser = supabaseSingleton.getUser();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialUser);
          // console.log$1
        }

        // Listen for auth state changes via singleton
        supabaseSingleton.on("auth-state-change", handleAuthStateChange);

        // Listen for external auth changes (from other tabs)
        supabaseSingleton.on("external-auth-change", handleExternalAuthChange);

        // Listen for external logout
        supabaseSingleton.on("external-logout", handleExternalLogout);

        setIsInitialized(true);
        setLoading(false); // CRITICAL: Must set loading to false on success!
        // console.log$1
      } catch (error) {
        console.error("[SupabaseContext] Initialization error:", error);
        setInitError(error.message);
        setIsInitialized(false);
        setLoading(false);
      }
    };

    initializeClient();

    // Cleanup
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      // Remove event listeners
      supabaseSingleton.off("auth-state-change", handleAuthStateChange);
      supabaseSingleton.off("external-auth-change", handleExternalAuthChange);
      supabaseSingleton.off("external-logout", handleExternalLogout);
    };
  }, []);

  // Login with OAuth provider (Google, Auth0, etc.)
  const signInWithOAuth = async (provider) => {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/app/home`, // Redirect to home after OAuth
      },
    });

    if (error) {
      console.error("OAuth sign-in error:", error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error);
      throw error;
    }

    // Trigger storage event for bootstrap reset
    localStorage.setItem("axolop_user_logout", Date.now().toString());

    // Also trigger agency switch event to reset bootstrap
    localStorage.setItem("axolop_agency_switch", Date.now().toString());
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Email sign-in error:", error);
      throw error;
    }

    return data;
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password, options = {}) => {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: options, // Additional user metadata
      },
    });

    if (error) {
      console.error("Sign-up error:", error);
      throw error;
    }

    return data;
  };

  // Reset password
  const resetPassword = async (email) => {
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
  };

  // Get auth token for API requests
  const getAuthToken = async () => {
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
  };

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
