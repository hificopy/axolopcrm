import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSupabase } from "./SupabaseContext";
import api from "../lib/api";

export const AgencyContext = createContext();

// Hook to use the agency context
export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error("useAgency must be used within an AgencyProvider");
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

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

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
      console.log("[AgencyContext] Loading agencies for user:", user.id);

      let agenciesData = [];

      // Try enhanced RPC function first, fall back to direct query if it doesn't exist
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_user_agencies_enhanced",
        { p_user_id: user.id },
      );

      if (rpcError) {
        console.warn(
          "[AgencyContext] RPC get_user_agencies failed, using direct query:",
          rpcError.message,
        );

        // Fallback: Direct query to get user's agencies
        // First get the agency_members for this user
        const { data: memberData, error: memberError } = await supabase
          .from("agency_members")
          .select("*")
          .eq("user_id", user.id);

        console.log(
          "[AgencyContext] User agency_members:",
          memberData,
          "Error:",
          memberError,
        );

        if (memberError) {
          console.error(
            "[AgencyContext] Error fetching agency_members:",
            memberError,
          );
          setAgencies([]);
          setLoading(false);
          return;
        }

        // Now get the agencies for those memberships
        const activeMemberships = (memberData || []).filter(
          (m) => m.invitation_status === "active",
        );
        console.log("[AgencyContext] Active memberships:", activeMemberships);

        if (activeMemberships.length === 0) {
          console.log("[AgencyContext] No active memberships found for user");
          setAgencies([]);
          setLoading(false);
          return;
        }

        // Get the agency details
        const agencyIds = activeMemberships.map((m) => m.agency_id);
        const { data: agencyData, error: agencyError } = await supabase
          .from("agencies")
          .select("*")
          .in("id", agencyIds)
          .eq("is_active", true);

        console.log(
          "[AgencyContext] Agencies found:",
          agencyData,
          "Error:",
          agencyError,
        );

        if (agencyError) {
          console.error(
            "[AgencyContext] Error fetching agencies:",
            agencyError,
          );
          setAgencies([]);
          setLoading(false);
          return;
        }

        // Transform to match expected format
        agenciesData = (agencyData || []).map((agency) => {
          const membership = activeMemberships.find(
            (m) => m.agency_id === agency.id,
          );
          return {
            agency_id: agency.id,
            agency_name: agency.name,
            agency_slug: agency.slug,
            agency_logo_url: agency.logo_url,
            agency_website: agency.website,
            agency_description: agency.description,
            subscription_tier: agency.subscription_tier,
            user_role: membership?.role || "member",
            invitation_status: membership?.invitation_status || "active",
            joined_at: membership?.joined_at,
          };
        });

        console.log(
          "[AgencyContext] Loaded agencies via direct query:",
          agenciesData,
        );
      } else {
        agenciesData = rpcData || [];
        console.log("[AgencyContext] Loaded agencies via RPC:", agenciesData);
      }

      setAgencies(agenciesData);

      // If we have agencies, select one
      if (agenciesData.length > 0) {
        let agencyToSet = null;

        // Try to get current agency preference
        try {
          const { data: currentAgencyId, error: currentError } =
            await supabase.rpc("get_current_agency", { p_user_id: user.id });

          if (!currentError && currentAgencyId) {
            agencyToSet = agenciesData.find(
              (a) => a.agency_id === currentAgencyId,
            );
          }
        } catch (prefError) {
          console.warn(
            "[AgencyContext] Could not get current agency preference:",
            prefError,
          );
        }

        // If no saved agency or saved agency not found, use first available
        if (!agencyToSet) {
          agencyToSet = agenciesData[0];

          // Try to save this as current agency in Supabase
          try {
            await supabase.rpc("set_current_agency", {
              p_user_id: user.id,
              p_agency_id: agencyToSet.agency_id,
            });
          } catch (setPrefError) {
            console.warn(
              "[AgencyContext] Could not save current agency preference:",
              setPrefError,
            );
            // No localStorage fallback - Supabase is the source of truth
          }
        }

        if (agencyToSet) {
          await selectAgency(agencyToSet.agency_id);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("[AgencyContext] Error loading agencies:", error);
      setAgencies([]);
      setLoading(false);
    }
  };

  // Select an agency
  const selectAgency = async (agencyId) => {
    if (!agencyId || !user) return;

    try {
      // Use enhanced validation function (checks agency status and user access)
      const { data: accessResult, error: accessError } = await supabase.rpc(
        "validate_agency_access",
        {
          p_user_id: user.id,
          p_agency_id: agencyId,
        },
      );

      if (accessError || !accessResult?.length) {
        console.error("Error validating agency access:", accessError);
        return;
      }

      const access = accessResult[0];
      if (!access.has_access) {
        console.error("Access denied to agency:", access.error_message);
        return;
      }

      // Get full agency details (with safety filters)
      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .single();

      if (agencyError) {
        console.error("Error fetching agency:", agencyError);
        return;
      }

      // Create synthetic membership object from access data
      const membership = {
        agency_id: agencyId,
        user_id: user.id,
        role: access.user_role,
        invitation_status: "active",
        permissions: {}, // Will be loaded separately if needed
      };

      setCurrentAgency(agency);
      setCurrentMembership(membership);
      setPermissions(membership.permissions || {});

      // Sync to localStorage for api.js interceptor to read
      // This is NOT the source of truth (Supabase is), just a cache for request headers
      try {
        localStorage.setItem('axolop_current_agency', JSON.stringify({
          id: agency.id,
          name: agency.name,
          slug: agency.slug
        }));
      } catch (storageError) {
        console.debug('[AgencyContext] Could not sync agency to localStorage:', storageError);
      }

      // Save to Supabase for persistence across devices - this is the only source of truth
      try {
        await supabase.rpc("set_current_agency", {
          p_user_id: user.id,
          p_agency_id: agencyId,
        });
      } catch (rpcError) {
        console.warn(
          "[AgencyContext] Could not persist agency selection to Supabase:",
          rpcError,
        );
      }
    } catch (error) {
      console.error("Error selecting agency:", error);
    }
  };

  // Switch to a different agency
  const switchAgency = async (agencyId) => {
    await selectAgency(agencyId);
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    // Admins have all permissions
    if (currentMembership?.role === "admin") {
      return true;
    }

    // God mode user has all permissions
    if (user?.email === "axolopcrm@gmail.com") {
      return true;
    }

    // Check specific permission
    return permissions[permission] === true;
  };

  // Check if user is admin
  const isAdmin = () => {
    return (
      currentMembership?.role === "admin" ||
      user?.email === "axolopcrm@gmail.com"
    );
  };

  // Check if user is god mode
  const isGodMode = () => {
    return user?.email === "axolopcrm@gmail.com";
  };

  // Check if user is read-only (seated user)
  const isReadOnly = () => {
    // God mode and admins are NOT read-only
    if (isGodMode() || isAdmin()) {
      return false;
    }
    // Member role is read-only
    return currentMembership?.role === "member";
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
      return "god_mode";
    }
    return currentAgency?.subscription_tier || "free";
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

  // Fetch subscription for current agency
  const fetchSubscription = useCallback(async () => {
    if (!currentAgency?.id) {
      setSubscription(null);
      return;
    }

    try {
      setSubscriptionLoading(true);
      const response = await api.get("/api/v1/stripe/subscription", {
        headers: { "X-Agency-ID": currentAgency.id },
      });

      if (response.data.success) {
        setSubscription(response.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("[AgencyContext] Error fetching subscription:", error);
      // Don't throw - subscription fetch failure shouldn't break the app
      setSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [currentAgency?.id]);

  // Refresh subscription
  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  // Check if agency is on trial
  const isTrialing = () => {
    return subscription?.status === "trialing";
  };

  // Get trial days remaining
  const getTrialDaysLeft = () => {
    if (!subscription?.trial_end) return null;

    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  // Check if subscription is active (includes trialing)
  const hasActiveSubscription = () => {
    if (isGodMode()) return true;
    return (
      subscription?.status === "active" || subscription?.status === "trialing"
    );
  };

  // Get current tier name
  const getCurrentTier = () => {
    if (isGodMode()) return "god_mode";
    return subscription?.tier || currentAgency?.subscription_tier || "free";
  };

  // Get tier display name
  const getTierDisplayName = () => {
    const tier = getCurrentTier();
    const tierNames = {
      sales: "Sales",
      build: "Build",
      scale: "Scale",
      god_mode: "God Mode",
      free: "Free",
    };
    return tierNames[tier] || tier;
  };

  // Check if a feature is available on current tier
  const tierHasFeature = (feature) => {
    if (isGodMode()) return true;

    // Define tier features
    const tierFeatures = {
      sales: [
        "crm",
        "leads",
        "contacts",
        "calendar",
        "forms_basic",
        "email_basic",
      ],
      build: [
        "crm",
        "leads",
        "contacts",
        "calendar",
        "forms",
        "email",
        "automation_basic",
        "reports",
        "ai_basic",
        "seats_3",
      ],
      scale: [
        "crm",
        "leads",
        "contacts",
        "calendar",
        "forms",
        "email",
        "automation",
        "reports",
        "ai",
        "seats_unlimited",
        "api",
        "white_label",
      ],
    };

    const tier = getCurrentTier();
    const features = tierFeatures[tier] || tierFeatures["sales"];

    return features.includes(feature);
  };

  // Get seat limit for current tier
  const getSeatLimit = () => {
    if (isGodMode()) return Infinity;

    const tier = getCurrentTier();
    const limits = {
      sales: 1,
      build: 3,
      scale: Infinity,
    };

    return limits[tier] || 1;
  };

  // Create a new agency
  const createAgency = async (agencyData) => {
    if (!user) return null;

    try {
      // Get session token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        "Session token obtained for agency creation:",
        session ? "has token" : "no token",
      );

      // Construct the API base URL properly - always use /api/v1 for agencies route
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      // Remove any trailing /api or /api/v1 to get clean base, then add /api/v1
      const cleanBase = baseUrl.replace(/\/api(\/v1)?$/, "");
      const apiUrl = `${cleanBase}/api/v1/agencies`;
      console.log("Creating agency at URL:", apiUrl);

      let response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: agencyData.name,
          website: agencyData.website,
          description: agencyData.description,
          logo_url: null, // We'll add the logo separately after creation
        }),
      });

      console.log("Agency creation response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating agency:", errorData);
        throw new Error(errorData.message || "Failed to create agency");
      }

      const result = await response.json();
      const agency = result.data;

      console.log("Agency created successfully:", agency);
      if (!agency || !agency.id) {
        console.error(
          "Agency creation failed - no valid agency returned:",
          result,
        );
        throw new Error(
          result.message || "Failed to create agency - invalid response",
        );
      }

      // If there's a logo file, upload it separately using the logo endpoint
      if (agencyData.logoFile) {
        console.log("Uploading logo for agency:", {
          file: agencyData.logoFile.name,
          fileType: agencyData.logoFile.type,
          fileSize: agencyData.logoFile.size,
          agencyId: agency.id,
        });

        try {
          // Convert file to base64 for the API (since it expects base64 or URL)
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
          });
          reader.readAsDataURL(agencyData.logoFile);
          const base64Data = await base64Promise;

          // Upload the logo using the agency logo endpoint with base64 data
          const logoResponse = await fetch(
            `${cleanBase}/api/v1/agencies/${agency.id}/logo`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
              },
              credentials: "include",
              body: JSON.stringify({
                file_data: base64Data,
                file_name: agencyData.logoFile.name,
                content_type: agencyData.logoFile.type,
              }),
            },
          );

          if (!logoResponse.ok) {
            const logoError = await logoResponse.json();
            console.error("Error uploading logo:", logoError);
            // Don't throw error here as the agency was already created, just log it
            console.warn(
              "Could not upload logo, but agency was created:",
              logoError.message,
            );
          } else {
            console.log("Logo uploaded successfully");
          }
        } catch (logoError) {
          console.error("Error during logo upload process:", logoError);
          // Don't throw error here as the agency was already created, just log it
          console.warn(
            "Logo upload failed, but agency was created:",
            logoError.message || logoError,
          );
        }
      }

      console.log(
        "About to reload agencies after creating agency:",
        agency?.id,
      );

      // Reload agencies to update with new agency
      await loadAgencies();

      console.log("Agencies reloaded after creation");

      return agency;
    } catch (error) {
      console.error("Error creating agency:", error);
      throw error;
    }
  };

  // Delete an agency
  const deleteAgency = async (agencyId) => {
    if (!user) return false;

    try {
      // Get session token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("[AgencyContext] Deleting agency:", agencyId);

      // Construct the API base URL properly
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";
      const cleanBase = baseUrl.replace(/\/api(\/v1)?$/, "");
      const apiUrl = `${cleanBase}/api/v1/agencies/${agencyId}`;

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        credentials: "include",
      });

      console.log("[AgencyContext] Delete response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[AgencyContext] Error deleting agency:", errorData);
        throw new Error(errorData.message || "Failed to delete agency");
      }

      const result = await response.json();
      console.log("[AgencyContext] Agency deleted successfully:", result);

      // Optimistic state update - remove agency immediately
      const previousAgencies = [...agencies];
      const previousAgency = currentAgency;

      setAgencies((prev) => prev.filter((a) => a.agency_id !== agencyId));

      // Clear current agency if it was deleted
      if (currentAgency?.id === agencyId) {
        setCurrentAgency(null);
        setCurrentMembership(null);
        setPermissions({});

        // Clear from Supabase with enhanced error handling
        try {
          await supabase.rpc("set_current_agency", {
            p_user_id: user.id,
            p_agency_id: null,
          });
          console.log("[AgencyContext] Current agency preference cleared");
        } catch (rpcError) {
          console.warn(
            "[AgencyContext] Could not clear agency from Supabase:",
            rpcError,
          );
          // Fallback: clear any local storage if it exists
          try {
            localStorage.removeItem("axolop_current_agency");
          } catch (localError) {
            console.warn(
              "[AgencyContext] Could not clear localStorage:",
              localError,
            );
          }
        }
      }

      // Force refresh to ensure consistency with backend
      try {
        await loadAgencies();
        console.log("[AgencyContext] Agencies reloaded after deletion");
      } catch (refreshError) {
        console.error(
          "[AgencyContext] Error refreshing agencies:",
          refreshError,
        );
        // Rollback state on refresh error
        setAgencies(previousAgencies);
        setCurrentAgency(previousAgency);
        throw new Error(
          "Agency deleted but failed to refresh list. Please refresh the page.",
        );
      }

      return true;
    } catch (error) {
      console.error("[AgencyContext] Error deleting agency:", error);
      throw error;
    }
  };

  // Load agencies when user changes
  useEffect(() => {
    loadAgencies();
  }, [user]);

  // Fetch subscription when agency changes
  useEffect(() => {
    if (currentAgency?.id) {
      fetchSubscription();
    }
  }, [currentAgency?.id, fetchSubscription]);

  const value = {
    // State
    agencies,
    currentAgency,
    currentMembership,
    loading,
    permissions,

    // Subscription state
    subscription,
    subscriptionLoading,

    // Actions
    selectAgency,
    switchAgency,
    createAgency,
    deleteAgency,
    refreshAgency,
    refreshAgencies,
    refreshSubscription,

    // Helpers
    hasPermission,
    isAdmin,
    isGodMode,
    isReadOnly,
    canEdit,
    canCreate,
    getSubscriptionTier,
    isFeatureEnabled,

    // Subscription helpers
    isTrialing,
    getTrialDaysLeft,
    hasActiveSubscription,
    getCurrentTier,
    getTierDisplayName,
    tierHasFeature,
    getSeatLimit,
  };

  return (
    <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>
  );
};
