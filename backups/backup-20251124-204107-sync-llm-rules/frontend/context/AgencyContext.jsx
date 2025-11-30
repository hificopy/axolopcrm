import React, { createContext, useEffect, useState } from 'react';
import { useSupabase } from './SupabaseContext';

export const AgencyContext = createContext();

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

      console.log('Loaded agencies:', data);
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

      // Save to Supabase for persistence across devices
      await supabase.rpc('set_current_agency', {
        p_user_id: user.id,
        p_agency_id: agencyId
      });

      // Also save to localStorage for API client to access
      localStorage.setItem('currentAgency', JSON.stringify({ id: agencyId }));
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
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session token obtained for agency creation:', session ? 'has token' : 'no token');

      // Create the agency without the logo first
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/agencies`;
      console.log('Creating agency at URL:', apiUrl);

      let response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: agencyData.name,
          website: agencyData.website,
          description: agencyData.description,
          logo_url: null, // We'll add the logo separately after creation
        }),
      });

      console.log('Agency creation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating agency:', errorData);
        throw new Error(errorData.message || 'Failed to create agency');
      }

      const result = await response.json();
      const agency = result.data;

      console.log('Agency created successfully:', agency);
      if (!agency || !agency.id) {
        console.error('Agency creation failed - no valid agency returned:', result);
        throw new Error(result.message || 'Failed to create agency - invalid response');
      }

      // If there's a logo file, upload it separately using the logo endpoint
      if (agencyData.logoFile) {
        console.log('Uploading logo for agency:', {
          file: agencyData.logoFile.name,
          fileType: agencyData.logoFile.type,
          fileSize: agencyData.logoFile.size,
          agencyId: agency.id
        });

        try {
          // Create form data for the logo upload (original implementation)
          const formData = new FormData();
          formData.append('file', agencyData.logoFile, agencyData.logoFile.name);

          // Upload the logo using the agency logo endpoint
          const logoResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'}/agencies/${agency.id}/logo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
            },
            credentials: 'include',
            body: formData,
          });

          if (!logoResponse.ok) {
            const logoError = await logoResponse.json();
            console.error('Error uploading logo:', logoError);
            // Don't throw error here as the agency was already created, just log it
            console.warn('Could not upload logo, but agency was created:', logoError.message);
          } else {
            console.log('Logo uploaded successfully');
          }
        } catch (logoError) {
          console.error('Error during logo upload process:', logoError);
          // Don't throw error here as the agency was already created, just log it
          console.warn('Logo upload failed, but agency was created:', logoError.message || logoError);
        }
      }

      console.log('About to reload agencies after creating agency:', agency?.id);

      // Reload agencies to update with new agency
      await loadAgencies();

      console.log('Agencies reloaded after creation');

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
