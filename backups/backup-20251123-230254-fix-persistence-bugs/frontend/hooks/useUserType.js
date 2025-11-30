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
        throw new Error('Not authenticated');
      }

      // Call API to get user type
      const response = await fetch('http://localhost:3002/api/v1/agencies/me/user-type', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user type');
      }

      const result = await response.json();
      setUserType(result.data);
    } catch (err) {
      console.error('Error fetching user type:', err);
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
