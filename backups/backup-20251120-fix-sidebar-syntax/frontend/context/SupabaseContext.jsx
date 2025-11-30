import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useDemoMode } from '../contexts/DemoModeContext';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDemoMode, demoUser } = useDemoMode();

  // Use demo user when demo mode is enabled, otherwise use real user
  const [user, setUser] = useState(null);
  const effectiveUser = isDemoMode ? demoUser : user;

  useEffect(() => {
    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables are not set, using mock client for development');
      // Create a mock client for development
      setSupabase({
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ 
            data: { 
              subscription: { 
                unsubscribe: () => {} 
              } 
            } 
          }),
          signInWithOAuth: () => Promise.reject(new Error('Supabase not configured')),
          signOut: () => Promise.resolve({ error: null }),
          signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
          signUp: () => Promise.reject(new Error('Supabase not configured')),
          resetPasswordForEmail: () => Promise.reject(new Error('Supabase not configured')),
          getUser: () => Promise.resolve({ data: { user: null }, error: null })
        }
      });
      setLoading(false);
      return;
    }

    const client = createClient(supabaseUrl, supabaseAnonKey);
    setSupabase(client);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await client.auth.getSession();
        if (!error && session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user || null);
        }
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, []);

  // Login with OAuth provider (Google, Auth0, etc.)
  const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/app/home`, // Redirect to dashboard after OAuth
      },
    });

    if (error) {
      console.error('OAuth sign-in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    // If the current user is the test user, reset their onboarding status before signing out
    if (user && user.email === 'test@test.com') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/users/me/reset-onboarding`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          console.warn('Failed to reset onboarding status for test user:', response.statusText);
        }
      } catch (error) {
        console.warn('Error resetting onboarding status for test user:', error);
      }
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }

    // If this is the test user, reset their onboarding status after sign-in
    if (email === 'test@test.com') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/users/me/reset-onboarding`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          console.warn('Failed to reset onboarding status for test user:', response.statusText);
        }
      } catch (error) {
        console.warn('Error resetting onboarding status for test user:', error);
      }
    }

    return data;
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: options // Additional user metadata
      }
    });
    
    if (error) {
      console.error('Sign-up error:', error);
      throw error;
    }
    
    return data;
  };

  // Reset password
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    supabase,
    user: effectiveUser,
    session,
    loading,
    signInWithOAuth,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};