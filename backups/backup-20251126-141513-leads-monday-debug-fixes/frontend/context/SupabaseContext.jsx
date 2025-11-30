import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useDemoMode } from "../contexts/DemoModeContext";
import supabaseSingleton, { initializeSupabase } from "../services/supabase-singleton";

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
    console.warn('[useSafeSupabase] SupabaseContext not found - returning default values');
    return {
      supabase: null,
      user: null,
      session: null,
      loading: true,
      isInitialized: false,
      signInWithOAuth: async () => { throw new Error('Supabase not initialized'); },
      signOut: async () => { throw new Error('Supabase not initialized'); },
      signInWithEmail: async () => { throw new Error('Supabase not initialized'); },
      signUpWithEmail: async () => { throw new Error('Supabase not initialized'); },
      resetPassword: async () => { throw new Error('Supabase not initialized'); },
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
  const { isDemoMode, demoUser } = useDemoMode();
  const initAttempted = useRef(false);
  const loadingTimeoutRef = useRef(null);

  // Use demo user when demo mode is enabled, otherwise use real user
  const [user, setUser] = useState(null);
  const effectiveUser = isDemoMode ? demoUser : user;

  useEffect(() => {
    // Prevent duplicate initialization
    if (initAttempted.current) return;
    initAttempted.current = true;

    // Safety timeout - ensure loading never stays true forever
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn('[SupabaseContext] Loading timeout reached - forcing completion');
        setLoading(false);
      }
    }, 15000); // 15 second max loading time

    const initializeClient = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log("[SupabaseContext] Initializing with env vars:", {
        supabaseUrl: supabaseUrl ? "set" : "not set",
        supabaseAnonKey: supabaseAnonKey ? "set" : "not set",
      });

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
          "[SupabaseContext] Supabase environment variables are not set, using mock client",
        );
        // Create a mock client for development
        const mockClient = {
          auth: {
            getSession: () =>
              Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({
              data: {
                subscription: {
                  unsubscribe: () => {},
                },
              },
            }),
            signInWithOAuth: () =>
              Promise.reject(new Error("Supabase not configured")),
            signOut: () => Promise.resolve({ error: null }),
            signInWithPassword: () =>
              Promise.reject(new Error("Supabase not configured")),
            signUp: () => Promise.reject(new Error("Supabase not configured")),
            resetPasswordForEmail: () =>
              Promise.reject(new Error("Supabase not configured")),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          },
          rpc: () => Promise.resolve({ data: null, error: { message: 'Mock client - RPC not available' } }),
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
        // Use the singleton client instead of creating a new one
        // This eliminates the dual-client anti-pattern
        console.log("[SupabaseContext] Initializing Supabase singleton...");
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
          console.log("[SupabaseContext] Initial session loaded:", initialUser?.id);
        }

        // Listen for auth state changes via singleton
        supabaseSingleton.on('auth-state-change', ({ event, session: newSession }) => {
          console.log("[SupabaseContext] Auth state changed:", event);
          setSession(newSession);
          setUser(newSession?.user || null);
        });

        // Listen for external auth changes (from other tabs)
        supabaseSingleton.on('external-auth-change', ({ session: newSession }) => {
          console.log("[SupabaseContext] External auth change detected");
          setSession(newSession);
          setUser(newSession?.user || null);
        });

        // Listen for external logout
        supabaseSingleton.on('external-logout', () => {
          console.log("[SupabaseContext] External logout detected");
          setSession(null);
          setUser(null);
        });

        setIsInitialized(true);
        console.log("[SupabaseContext] Initialization complete");
      } catch (error) {
        console.error("[SupabaseContext] Initialization error:", error);
        setInitError(error.message);
      } finally {
        // CRITICAL: Always set loading to false
        setLoading(false);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    };

    initializeClient();

    // Cleanup
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      // Remove event listeners
      supabaseSingleton.off('auth-state-change', () => {});
      supabaseSingleton.off('external-auth-change', () => {});
      supabaseSingleton.off('external-logout', () => {});
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
      console.warn("Supabase client not initialized");
      return null;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const value = {
    supabase,
    user: effectiveUser,
    session,
    loading,
    isInitialized,
    initError,
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
