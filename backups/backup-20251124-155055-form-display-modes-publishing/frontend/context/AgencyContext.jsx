import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from './SupabaseContext';

const AgencyContext = createContext();

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};

export const AgencyProvider = ({ children }) => {
  const { user, supabase } = useSupabase();
  const [agencies, setAgencies] = useState([]);
  const [currentAgency, setCurrentAgency] = useState(null);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  // Load user's agencies
  const loadAgencies = async () => {
    if (!user) {
      setAgencies([]);
      setCurrentAgency(null);
      setCurrentMembership(null);
      setPermissions({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch agencies using RPC function
      const { data, error } = await supabase
        .rpc('get_user_agencies', { p_user_id: user.id });

      if (error) {
        console.error('Error loading agencies:', error);
        setLoading(false);
        return;
      }

      setAgencies(data || []);

      // Get current agency from Supabase (not localStorage!)
      const { data: currentAgencyId, error: currentError } = await supabase
        .rpc('get_current_agency', { p_user_id: user.id });

      let agencyToSet = null;

      if (currentAgencyId && !currentError) {
        agencyToSet = data?.find(a => a.agency_id === currentAgencyId);
      }

      // If no saved agency or saved agency not found, use first available
      if (!agencyToSet && data && data.length > 0) {
        agencyToSet = data[0];
        // Save this as current agency in Supabase
        await supabase.rpc('set_current_agency', {
          p_user_id: user.id,
          p_agency_id: agencyToSet.agency_id
        });
      }

      if (agencyToSet) {
        await selectAgency(agencyToSet.agency_id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading agencies:', error);
      setLoading(false);
    }
  };

  // Select an agency
  const selectAgency = async (agencyId) => {
    if (!agencyId || !user) return;

    try {
      // Get full agency details
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', agencyId)
        .single();

      if (agencyError) {
        console.error('Error fetching agency:', agencyError);
        return;
      }

      // Get membership details
      const { data: membership, error: memberError } = await supabase
        .from('agency_members')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error fetching membership:', memberError);
        return;
      }

      setCurrentAgency(agency);
      setCurrentMembership(membership);
      setPermissions(membership.permissions || {});

      // Save to Supabase (not localStorage!)
      await supabase.rpc('set_current_agency', {
        p_user_id: user.id,
        p_agency_id: agencyId
      });
    } catch (error) {
      console.error('Error selecting agency:', error);
    }
  };

  // Switch to a different agency
  const switchAgency = async (agencyId) => {
    await selectAgency(agencyId);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    // Admins have all permissions
    if (currentMembership?.role === 'admin') {
      return true;
    }

    // God mode user has all permissions
    if (user?.email === 'axolopcrm@gmail.com') {
      return true;
    }

    // Check specific permission
    return permissions[permission] === true;
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentMembership?.role === 'admin' || user?.email === 'axolopcrm@gmail.com';
  };

  // Check if user is god mode
  const isGodMode = () => {
    return user?.email === 'axolopcrm@gmail.com';
  };

  // Check if user is read-only (seated user)
  const isReadOnly = () => {
    // God mode and admins are NOT read-only
    if (isGodMode() || isAdmin()) {
      return false;
    }
    // Member role is read-only
    return currentMembership?.role === 'member';
  };

  // Check if user can edit/delete
  const canEdit = () => {
    return !isReadOnly();
  };

  // Check if user can create
  const canCreate = () => {
    return !isReadOnly();
  };

  // Get subscription tier
  const getSubscriptionTier = () => {
    if (isGodMode()) {
      return 'god_mode';
    }
    return currentAgency?.subscription_tier || 'free';
  };

  // Check if feature is enabled for current agency
  const isFeatureEnabled = (feature) => {
    if (isGodMode()) {
      return true;
    }

    const settings = currentAgency?.settings || {};
    const sectionsEnabled = settings.sections_enabled || {};
    const featuresEnabled = settings.features_enabled || {};

    return sectionsEnabled[feature] || featuresEnabled[feature] || false;
  };

  // Refresh agency data
  const refreshAgency = async () => {
    if (currentAgency) {
      await selectAgency(currentAgency.id);
    }
  };

  // Refresh agencies list
  const refreshAgencies = async () => {
    await loadAgencies();
  };

  // Create a new agency
  const createAgency = async (agencyData) => {
    if (!user) return null;

    try {
      // Generate slug from name
      const slug = agencyData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Math.random().toString(36).substring(2, 8);

      const tier = user.email === 'axolopcrm@gmail.com' ? 'god_mode' : 'free';

      // Create agency
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          name: agencyData.name,
          slug,
          logo_url: agencyData.logo_url,
          website: agencyData.website,
          description: agencyData.description,
          subscription_tier: tier
        })
        .select()
        .single();

      if (agencyError) {
        console.error('Error creating agency:', agencyError);
        throw agencyError;
      }

      // Add user as admin
      const { error: memberError } = await supabase
        .from('agency_members')
        .insert({
          agency_id: agency.id,
          user_id: user.id,
          role: 'admin',
          invitation_status: 'active'
        });

      if (memberError) {
        console.error('Error adding user as admin:', memberError);
        // Rollback agency creation
        await supabase.from('agencies').delete().eq('id', agency.id);
        throw memberError;
      }

      // Reload agencies
      await loadAgencies();

      return agency;
    } catch (error) {
      console.error('Error creating agency:', error);
      throw error;
    }
  };

  // Load agencies when user changes
  useEffect(() => {
    loadAgencies();
  }, [user]);

  const value = {
    // State
    agencies,
    currentAgency,
    currentMembership,
    loading,
    permissions,

    // Actions
    selectAgency,
    switchAgency,
    createAgency,
    refreshAgency,
    refreshAgencies,

    // Helpers
    hasPermission,
    isAdmin,
    isGodMode,
    isReadOnly,
    canEdit,
    canCreate,
    getSubscriptionTier,
    isFeatureEnabled,
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
};
