/**
 * useRealtimeMembers Hook
 * Provides real-time updates for agency members using Supabase Realtime
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAgency } from '../context/AgencyContext';
import toast from 'react-hot-toast';

export function useRealtimeMembers() {
  const { currentAgency, refreshAgency } = useAgency();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const subscriptionRef = useRef(null);

  // Fetch initial members
  const fetchMembers = useCallback(async () => {
    if (!currentAgency?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('agency_members')
        .select(`
          id,
          user_id,
          agency_id,
          role,
          member_type,
          invitation_status,
          joined_at,
          invited_at,
          invited_by,
          permissions,
          created_at,
          updated_at,
          user_profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('agency_id', currentAgency.id)
        .eq('invitation_status', 'active')
        .order('joined_at', { ascending: false });

      if (fetchError) throw fetchError;

      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [currentAgency?.id]);

  // Handle realtime updates
  const handleRealtimeUpdate = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Only process events for current agency
    if (newRecord?.agency_id !== currentAgency?.id && oldRecord?.agency_id !== currentAgency?.id) {
      return;
    }

    switch (eventType) {
      case 'INSERT':
        // New member joined
        setMembers(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newRecord.id)) return prev;
          return [newRecord, ...prev];
        });
        toast.success('New team member joined!', { icon: '👋' });
        break;

      case 'UPDATE':
        setMembers(prev =>
          prev.map(m => m.id === newRecord.id ? { ...m, ...newRecord } : m)
        );
        // Check for role changes
        if (oldRecord?.role !== newRecord?.role) {
          toast('Member role updated', { icon: '🔄' });
        }
        break;

      case 'DELETE':
        setMembers(prev => prev.filter(m => m.id !== oldRecord.id));
        toast('Member removed from team', { icon: '👤' });
        break;

      default:
        break;
    }

    // Refresh agency context to update counts
    if (refreshAgency) {
      refreshAgency();
    }
  }, [currentAgency?.id, refreshAgency]);

  // Setup realtime subscription
  useEffect(() => {
    if (!currentAgency?.id) return;

    // Fetch initial data
    fetchMembers();

    // Create subscription
    const channel = supabase
      .channel(`agency_members:${currentAgency.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agency_members',
          filter: `agency_id=eq.${currentAgency.id}`
        },
        handleRealtimeUpdate
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active for agency members');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error');
        }
      });

    subscriptionRef.current = channel;

    // Cleanup on unmount or agency change
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [currentAgency?.id, fetchMembers, handleRealtimeUpdate]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Get online status (members active in last 5 minutes)
  const getOnlineMembers = useCallback(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return members.filter(m => new Date(m.updated_at) > fiveMinutesAgo);
  }, [members]);

  // Get member by ID
  const getMemberById = useCallback((memberId) => {
    return members.find(m => m.id === memberId || m.user_id === memberId);
  }, [members]);

  // Get members by role
  const getMembersByRole = useCallback((role) => {
    return members.filter(m => m.role === role);
  }, [members]);

  return {
    members,
    loading,
    error,
    refresh,
    getOnlineMembers,
    getMemberById,
    getMembersByRole,
    totalMembers: members.length,
    admins: members.filter(m => m.role === 'admin' || m.member_type === 'owner'),
    regularMembers: members.filter(m => m.role !== 'admin' && m.member_type !== 'owner')
  };
}

export default useRealtimeMembers;
