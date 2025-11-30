import { useContext } from 'react';
import { AgencyContext } from '../context/AgencyContext';

// Standard hook - throws if not wrapped in AgencyProvider
export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};

// Safe hook - returns default values if context missing (doesn't throw)
export const useSafeAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    console.warn('[useSafeAgency] AgencyContext not found - returning default values');
    return {
      agencies: [],
      currentAgency: null,
      currentMembership: null,
      loading: true,
      loadFailed: false,
      error: null,
      permissions: {},
      subscription: null,
      subscriptionLoading: false,
      isReadOnly: () => true,
      canEdit: () => false,
      canCreate: () => false,
      isAdmin: () => false,
      isGodMode: () => false,
      hasPermission: () => false,
      selectAgency: async () => {},
      switchAgency: async () => {},
      createAgency: async () => null,
      deleteAgency: async () => false,
      refreshAgency: async () => {},
      refreshAgencies: async () => {},
      refreshSubscription: async () => {},
      getSubscriptionTier: () => 'free',
      isFeatureEnabled: () => false,
      isTrialing: () => false,
      getTrialDaysLeft: () => null,
      hasActiveSubscription: () => false,
      getCurrentTier: () => 'free',
      getTierDisplayName: () => 'Free',
      tierHasFeature: () => false,
      getSeatLimit: () => 1,
    };
  }
  return context;
};