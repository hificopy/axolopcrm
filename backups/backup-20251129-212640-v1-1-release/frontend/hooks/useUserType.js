import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

/**
 * Custom hook to get current user's type and permissions
 * Returns user type, agencies, permissions, and loading state
 */
export function useUserType() {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserType();
  }, []);

  const fetchUserType = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        throw new Error('Not authenticated');
      }

      // console.log$1

      // Call API to get user type (use relative path for Vite proxy)
      const response = await fetch('/api/v1/agencies/me/user-type', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      // console.log$1

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ User type error response:', errorText);
        throw new Error(`Failed to fetch user type: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      // console.log$1
      setUserType(result.data);
    } catch (err) {
      console.error('💥 Error fetching user type:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userType?.isAdmin || false;
  const isSeatedUser = userType?.isSeatedUser || false;
  const isGodMode = userType?.isGodMode || false;
  const canEdit = userType?.canEditAnything || false;

  return {
    userType,
    loading,
    error,
    isAdmin,
    isSeatedUser,
    isGodMode,
    canEdit,
    refresh: fetchUserType
  };
}
