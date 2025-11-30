import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useSupabase } from "./SupabaseContext";
import api from "../lib/api";
import {
  acquireMutex,
  releaseMutex,
  onTabEvent,
  offTabEvent,
} from "../utils/TabCoordinator";
import tabCoordinator from "../utils/TabCoordinator";
import { DEMO_AGENCY, isDemoAgency } from "../data/demoAgencyData";

export const AgencyContext = createContext();

// Hook to use the agency context (throws if not wrapped)
export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error("useAgency must be used within an AgencyProvider");
  }
  return context;
};

// Safe hook that doesn't throw - returns default values if context missing
export const useSafeAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    console.warn(
      "[useSafeAgency] AgencyContext not found - returning default values",
    );
    return {
      agencies: [],
      currentAgency: null,
      currentMembership: null,
      loading: true,
      loadFailed: false,
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
      getSubscriptionTier: () => "free",
      isFeatureEnabled: () => false,
      isTrialing: () => false,
      getTrialDaysLeft: () => null,
      hasActiveSubscription: () => false,
      getCurrentTier: () => "free",
      getTierDisplayName: () => "Free",
      tierHasFeature: () => false,
      getSeatLimit: () => 1,
    };
  }
  return context;
};

export const AgencyProvider = ({ children }) => {
  const {
    user,
    supabase,
    loading: supabaseLoading,
    isInitialized,
  } = useSupabase();
  const [agencies, setAgencies] = useState([]);
  const [currentAgency, setCurrentAgency] = useState(null);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false); // Track if loading failed (don't show modal on failure)
  const [permissions, setPermissions] = useState({});
  const loadingTimeoutRef = useRef(null);
  const loadAttemptRef = useRef(0);

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Load user's agencies with retry logic
  const loadAgencies = useCallback(async () => {
    // Don't load if supabase isn't ready yet
    if (!isInitialized || supabaseLoading) {
      console.log("[AgencyContext] Waiting for Supabase initialization...");
      return;
    }

    if (!user) {
      setAgencies([]);
      setCurrentAgency(null);
      setCurrentMembership(null);
      setPermissions({});
      setLoading(false);
      return;
    }

    // Check if supabase client is available
    if (!supabase) {
      console.warn("[AgencyContext] Supabase client not available");
      setLoading(false);
      setError("Supabase client not initialized");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLoadFailed(false);
      loadAttemptRef.current += 1;
      const currentAttempt = loadAttemptRef.current;
      console.log(
        "[AgencyContext] Loading agencies for user:",
        user.id,
        "attempt:",
        currentAttempt,
      );

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
        // First get agency_members for this user
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
          setLoadFailed(true);
          setError("Failed to load your memberships. Please refresh.");
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
          setLoadFailed(true);
          setError("Failed to load agencies. Please refresh.");
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

      // Inject virtual demo agency if demo mode is enabled and user is God mode
      const isDemoModeEnabled =
        localStorage.getItem("axolop_demo_mode_enabled") === "true" &&
        user?.email === "axolopcrm@gmail.com";

      let agenciesWithDemo = agenciesData;
      if (isDemoModeEnabled) {
        console.log(
          "[AgencyContext] Demo mode enabled - injecting demo agency",
        );
        agenciesWithDemo = [DEMO_AGENCY, ...agenciesData];
      }

      setAgencies(agenciesWithDemo);

      // If we have agencies, select one
      if (agenciesWithDemo.length > 0) {
        let agencyToSet = null;

        // Check if demo mode was just disabled and we need to switch away from demo agency
        const currentAgencyData = localStorage.getItem('axolop_current_agency');
        const isCurrentlyDemo = currentAgencyData && JSON.parse(currentAgencyData).id === 'demo-agency-virtual';
        const demoModeDisabled = !isDemoModeEnabled && isCurrentlyDemo;

        if (demoModeDisabled) {
          console.log('[AgencyContext] Demo mode disabled, switching away from demo agency');
          // Remove demo agency from consideration and select first real agency
          const realAgencies = agenciesWithDemo.filter(a => a.id !== 'demo-agency-virtual' && a.agency_id !== 'demo-agency-virtual');
          if (realAgencies.length > 0) {
            agencyToSet = realAgencies[0];
          }
        } else if (isDemoModeEnabled) {
          // Demo mode is enabled - prioritize demo agency selection
          console.log('[AgencyContext] Demo mode enabled - selecting demo agency');
          agencyToSet = DEMO_AGENCY;
        } else {
          // Try to get current agency preference
          try {
            const { data: currentAgencyId, error: currentError } =
              await supabase.rpc("get_current_agency", { p_user_id: user.id });

            if (!currentError && currentAgencyId) {
              agencyToSet = agenciesWithDemo.find(
                (a) => a.agency_id === currentAgencyId || a.id === currentAgencyId,
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
            agencyToSet = agenciesWithDemo[0];
          }
        }

        if (agencyToSet) {
          const agencyId = agencyToSet.agency_id || agencyToSet.id;
          await selectAgency(agencyId);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("[AgencyContext] Error loading agencies:", error);
      setAgencies([]);
      setLoadFailed(true); // Mark as failed - don't show MandatoryAgencyModal
      setError("Failed to load agencies. Please refresh the page.");
      setLoading(false);
    }
  }, [user, supabase, isInitialized, supabaseLoading]);

  // Select an agency with mutex protection
  const selectAgency = async (agencyId) => {
    if (!agencyId || !user) return;

    // Check if this is the demo agency
    if (agencyId === "demo-agency-virtual") {
      console.log("[AgencyContext] Selecting demo agency");

      // Create demo agency object
      const demoAgency = {
        ...DEMO_AGENCY,
        id: DEMO_AGENCY.id,
        agency_id: DEMO_AGENCY.id,
      };

      // Create demo membership
      const demoMembership = {
        agency_id: DEMO_AGENCY.id,
        user_id: user.id,
        role: "admin",
        invitation_status: "active",
        permissions: {},
      };

      console.log('[AgencyContext] Setting current agency:', {
        agencyId: demoAgency.id,
        agencyName: demoAgency.name,
        isDemo: demoAgency.id === 'demo-agency-virtual'
      });
      
      setCurrentAgency(demoAgency);
      setCurrentMembership(demoMembership);
      setPermissions(demoMembership.permissions || {});

      // Sync to localStorage
      try {
        localStorage.setItem(
          "axolop_current_agency",
          JSON.stringify({
            id: demoAgency.id,
            name: demoAgency.name,
            slug: demoAgency.slug,
            selectedBy: tabCoordinator.tabId, // Track which tab made the selection
            timestamp: Date.now(),
          }),
        );
      } catch (storageError) {
        console.debug(
          "[AgencyContext] Could not sync demo agency to localStorage:",
          storageError,
        );
      }

      console.log("[AgencyContext] Demo agency selected successfully");
      return;
    }

    // Acquire mutex to prevent race conditions across tabs
    const lockAcquired = await acquireMutex("agency_selection", 10000);
    if (!lockAcquired) {
      console.log(
        "[AgencyContext] Agency selection in progress in another tab, skipping...",
      );
      return;
    }

    try {
      console.log(
        `[AgencyContext] Selecting agency ${agencyId} with mutex protection`,
      );

      // Use enhanced validation function (checks agency status and user access)
      // If RPC fails, fall back to simple validation
      let hasAccess = false;
      let membershipData = null;

      try {
        const { data: accessResult, error: accessError } = await supabase.rpc(
          "validate_agency_access",
          {
            p_user_id: user.id,
            p_agency_id: agencyId,
          },
        );

        if (!accessError && accessResult?.length) {
          const access = accessResult[0];
          hasAccess = access.has_access;
          if (!hasAccess) {
            console.error("Access denied to agency:", access.error_message);
            return;
          }
          // Create membership data from RPC result
          membershipData = {
            role: access.user_role || 'member',
            invitation_status: 'active'
          };
        } else if (accessError) {
          console.warn("RPC validation failed, falling back to simple check:", accessError);
          // Fall back to simple membership check
          const { data: membership } = await supabase
            .from("agency_members")
            .select("*")
            .eq("agency_id", agencyId)
            .eq("user_id", user.id)
            .eq("invitation_status", "active")
            .single();

          hasAccess = !!membership;
          membershipData = membership;
        }
      } catch (err) {
        console.warn("Error in agency validation, using fallback:", err);
        // Last resort - check if user has any membership
        const { data: membership } = await supabase
          .from("agency_members")
          .select("*")
          .eq("agency_id", agencyId)
          .eq("user_id", user.id)
          .single();

        hasAccess = !!membership;
        membershipData = membership;
      }

      if (!hasAccess || !membershipData) {
        console.error("No access to agency");
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

      // Create synthetic membership object from membership data
      const membership = {
        agency_id: agencyId,
        user_id: user.id,
        role: membershipData.role || 'member',
        invitation_status: membershipData.invitation_status || "active",
        permissions: {}, // Will be loaded separately if needed
      };

      console.log("[AgencyContext] Setting current agency:", {
        agencyId: agency.id,
        agencyName: agency.name,
        isDemo: agency.id === "demo-agency-virtual",
      });

      setCurrentAgency(agency);
      setCurrentMembership(membership);
      setPermissions(membership.permissions || {});

      // Sync to localStorage for api.js interceptor to read
      // This is NOT the source of truth (Supabase is), just a cache for request headers
      try {
        localStorage.setItem(
          "axolop_current_agency",
          JSON.stringify({
            id: agency.id,
            name: agency.name,
            slug: agency.slug,
            selectedBy: tabCoordinator.tabId, // Track which tab made the selection
            timestamp: Date.now(),
          }),
        );
      } catch (storageError) {
        console.debug(
          "[AgencyContext] Could not sync agency to localStorage:",
          storageError,
        );
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

      console.log(`[AgencyContext] Successfully selected agency ${agencyId}`);
    } catch (error) {
      console.error("Error selecting agency:", error);
    } finally {
      // Always release the mutex
      releaseMutex("agency_selection");
    }
  };

  // Switch to a different agency
  const switchAgency = async (agencyId) => {
    console.log("[AgencyContext] switchAgency called with:", {
      agencyId,
      isDemoAgency: agencyId === "demo-agency-virtual",
      currentAgency: currentAgency?.id || currentAgency?.agency_id,
    });
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
    // Demo agency should be fully functional for testing!
    // Only God mode and admins are NOT read-only
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

    // Skip for demo agency
    if (currentAgency.id === 'demo-agency-virtual') {
      setSubscription(null);
      setSubscriptionLoading(false);
      return;
    }

    try {
      setSubscriptionLoading(true);
      const response = await api.get("/stripe/subscription", {
        headers: { "X-Agency-ID": currentAgency.id },
      });

      if (response.data.success) {
        setSubscription(response.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("[AgencyContext] Error fetching subscription:", error);
      // Don't throw - subscription fetch failure shouldn't break app
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

      // Construct API base URL properly - always use /api/v1 for agencies route
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
          logo_url: null, // We'll add logo separately after creation
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

      // If there's a logo file, upload it separately using logo endpoint
      if (agencyData.logoFile) {
        console.log("Uploading logo for agency:", {
          file: agencyData.logoFile.name,
          fileType: agencyData.logoFile.type,
          fileSize: agencyData.logoFile.size,
          agencyId: agency.id,
        });

        try {
          // Convert file to base64 for API (since it expects base64 or URL)
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
          });
          reader.readAsDataURL(agencyData.logoFile);
          const base64Data = await base64Promise;

          // Upload logo using the agency logo endpoint with base64 data
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
            // Don't throw error here as agency was already created, just log it
            console.warn(
              "Could not upload logo, but agency was created:",
              logoError.message,
            );
          } else {
            console.log("Logo uploaded successfully");
          }
        } catch (logoError) {
          console.error("Error during logo upload process:", logoError);
          // Don't throw error here as agency was already created, just log it
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

      // Construct to API base URL properly
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

  // Load agencies when user changes or Supabase becomes ready
  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Safety timeout - ensure loading never stays true forever
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn(
          "[AgencyContext] Loading timeout reached - forcing completion",
        );
        setLoading(false);
        setError("Loading timeout - please refresh the page");
      }
    }, 20000); // 20 second max loading time

    // Only load when Supabase is ready
    if (isInitialized && !supabaseLoading) {
      loadAgencies();
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [user, isInitialized, supabaseLoading]);

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
    loadFailed, // Expose to check if load failed (don't show mandatory modal on failure)
    error,
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

    // Demo agency helpers
    isDemoAgencySelected: () => isDemoAgency(currentAgency),
  };

  return (
    <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>
  );
};
