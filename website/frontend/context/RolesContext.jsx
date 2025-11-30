/**
 * Roles Context
 *
 * Manages role and permission state for the application.
 * Provides:
 * - Role templates (global)
 * - Agency roles (custom)
 * - Current user's permissions
 * - Permission checking utilities
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAgency } from "./AgencyContext";
import api from "../lib/api";

const RolesContext = createContext(null);

// All available permissions for reference
export const ALL_PERMISSIONS = {
  // Dashboard
  can_view_dashboard: "View the main dashboard",

  // Leads
  can_view_leads: "View leads",
  can_create_leads: "Create new leads",
  can_edit_leads: "Edit existing leads",
  can_delete_leads: "Delete leads",

  // Contacts
  can_view_contacts: "View contacts",
  can_create_contacts: "Create new contacts",
  can_edit_contacts: "Edit existing contacts",
  can_delete_contacts: "Delete contacts",

  // Opportunities
  can_view_opportunities: "View opportunities/deals",
  can_create_opportunities: "Create new opportunities",
  can_edit_opportunities: "Edit existing opportunities",
  can_delete_opportunities: "Delete opportunities",

  // Activities
  can_view_activities: "View activities",
  can_create_activities: "Create new activities",
  can_edit_activities: "Edit existing activities",

  // Calendar & Meetings
  can_view_calendar: "View calendar",
  can_manage_calendar: "Manage calendar events",
  can_view_meetings: "View meetings",
  can_manage_meetings: "Schedule and manage meetings",

  // Forms
  can_view_forms: "View forms",
  can_manage_forms: "Create and manage forms",

  // Campaigns
  can_view_campaigns: "View email campaigns",
  can_manage_campaigns: "Create and manage campaigns",

  // Workflows
  can_view_workflows: "View automation workflows",
  can_manage_workflows: "Create and manage workflows",

  // Reports
  can_view_reports: "View reports and analytics",
  can_export_data: "Export data",
  can_import_data: "Import data",

  // Team Management
  can_manage_team: "Invite and manage team members",
  can_manage_roles: "Create and manage roles",

  // Billing (Owner only)
  can_manage_billing: "Manage billing and subscription",

  // Settings
  can_manage_agency_settings: "Manage agency settings",
  can_access_api: "Access API",
  can_manage_integrations: "Manage integrations",

  // Second Brain
  can_view_second_brain: "View Second Brain",
  can_manage_second_brain: "Manage Second Brain content",
};

// Permission categories for UI
export const PERMISSION_CATEGORIES = {
  CRM: [
    "can_view_dashboard",
    "can_view_leads",
    "can_create_leads",
    "can_edit_leads",
    "can_delete_leads",
    "can_view_contacts",
    "can_create_contacts",
    "can_edit_contacts",
    "can_delete_contacts",
    "can_view_opportunities",
    "can_create_opportunities",
    "can_edit_opportunities",
    "can_delete_opportunities",
    "can_view_activities",
    "can_create_activities",
    "can_edit_activities",
  ],
  Calendar: [
    "can_view_calendar",
    "can_manage_calendar",
    "can_view_meetings",
    "can_manage_meetings",
  ],
  Marketing: [
    "can_view_forms",
    "can_manage_forms",
    "can_view_campaigns",
    "can_manage_campaigns",
    "can_view_workflows",
    "can_manage_workflows",
  ],
  Data: ["can_view_reports", "can_export_data", "can_import_data"],
  Administration: [
    "can_manage_team",
    "can_manage_roles",
    "can_manage_billing",
    "can_manage_agency_settings",
    "can_access_api",
    "can_manage_integrations",
  ],
  "AI Features": ["can_view_second_brain", "can_manage_second_brain"],
};

export function RolesProvider({ children }) {
  const { currentAgency } = useAgency();

  // State
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
  const [agencyRoles, setAgencyRoles] = useState([]);
  const [myPermissions, setMyPermissions] = useState({});
  const [mySectionAccess, setMySectionAccess] = useState({});
  const [myMemberType, setMyMemberType] = useState("seated_user");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch role templates (global)
  const fetchRoleTemplates = useCallback(async () => {
    try {
      const response = await api.get("/roles/templates");
      if (response.data.success) {
        setRoleTemplates(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching role templates:", err);
    }
  }, []);

  // Fetch template categories
  const fetchTemplateCategories = useCallback(async () => {
    try {
      const response = await api.get("/roles/templates/categories");
      if (response.data.success) {
        setTemplateCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching template categories:", err);
    }
  }, []);

  // Fetch agency roles
  const fetchAgencyRoles = useCallback(async () => {
    if (!currentAgency?.id) return;

    // Skip for demo agency
    if (currentAgency.id === "demo-agency-virtual") {
      setAgencyRoles([]);
      return;
    }

    try {
      const response = await api.get("/roles/agency", {
        headers: { "X-Agency-ID": currentAgency.id },
      });
      if (response.data.success) {
        setAgencyRoles(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching agency roles:", err);
    }
  }, [currentAgency?.id]);

  // Fetch my permissions
  const fetchMyPermissions = useCallback(async () => {
    if (!currentAgency?.id) return;

    // Skip for demo agency - set admin permissions
    if (currentAgency.id === "demo-agency-virtual") {
      setMyPermissions({});
      setMySectionAccess({});
      setMyMemberType("admin");
      return;
    }

    try {
      const response = await api.get("/roles/my-permissions", {
        headers: { "X-Agency-ID": currentAgency.id },
      });
      if (response.data.success) {
        setMyPermissions(response.data.data?.permissions || {});
        setMySectionAccess(response.data.data?.section_access || {});
        setMyMemberType(response.data.data?.member_type || "seated_user");
      }
    } catch (err) {
      console.error("Error fetching my permissions:", err);
    }
  }, [currentAgency?.id]);

  // Initial load - only for authenticated routes
  useEffect(() => {
    // Skip loading for public routes
    const isPublicRoute =
      window.location.pathname === "/" ||
      window.location.pathname === "/signin" ||
      window.location.pathname === "/signup" ||
      window.location.pathname === "/forgot-password" ||
      window.location.pathname === "/select-plan" ||
      window.location.pathname.startsWith("/payment-");

    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchRoleTemplates(), fetchTemplateCategories()]);

        if (currentAgency?.id) {
          await Promise.all([fetchAgencyRoles(), fetchMyPermissions()]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    currentAgency?.id,
    fetchRoleTemplates,
    fetchTemplateCategories,
    fetchAgencyRoles,
    fetchMyPermissions,
  ]);

  // Permission check helpers
  const hasPermission = useCallback(
    (permission) => {
      // Owner and admin have all permissions (except billing for admin)
      if (myMemberType === "owner") return true;
      if (myMemberType === "admin" && permission !== "can_manage_billing")
        return true;

      return myPermissions[permission] === true;
    },
    [myPermissions, myMemberType],
  );

  const hasAnyPermission = useCallback(
    (permissions) => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissions) => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission],
  );

  const canAccessSection = useCallback(
    (section) => {
      // Owner and admin can access all sections
      if (myMemberType === "owner" || myMemberType === "admin") return true;

      return mySectionAccess[section] === true;
    },
    [mySectionAccess, myMemberType],
  );

  // Check if user is owner
  const isOwner = myMemberType === "owner";
  const isAdmin = myMemberType === "owner" || myMemberType === "admin";

  // Role management functions
  const copyTemplateToAgency = async (templateId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.post(
      "/roles/agency/copy-template",
      {
        template_id: templateId,
      },
      {
        headers: { "X-Agency-ID": currentAgency.id },
      },
    );

    if (response.data.success) {
      await fetchAgencyRoles();
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to copy role");
  };

  const createAgencyRole = async (roleData) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.post("/roles/agency", roleData, {
      headers: { "X-Agency-ID": currentAgency.id },
    });

    if (response.data.success) {
      await fetchAgencyRoles();
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to create role");
  };

  const updateAgencyRole = async (roleId, updates) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.put(`/roles/agency/${roleId}`, updates, {
      headers: { "X-Agency-ID": currentAgency.id },
    });

    if (response.data.success) {
      await fetchAgencyRoles();
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to update role");
  };

  const deleteAgencyRole = async (roleId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.delete(`/roles/agency/${roleId}`, {
      headers: { "X-Agency-ID": currentAgency.id },
    });

    if (response.data.success) {
      await fetchAgencyRoles();
      return true;
    }

    throw new Error(response.data.error || "Failed to delete role");
  };

  // Member role management
  const getMemberRoles = async (memberId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.get(`/roles/member/${memberId}`, {
      headers: { "X-Agency-ID": currentAgency.id },
    });

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to get member roles");
  };

  const assignRoleToMember = async (memberId, roleId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.post(
      `/roles/member/${memberId}/assign`,
      {
        role_id: roleId,
      },
      {
        headers: { "X-Agency-ID": currentAgency.id },
      },
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to assign role");
  };

  const removeRoleFromMember = async (memberId, roleId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.delete(
      `/roles/member/${memberId}/roles/${roleId}`,
      {
        headers: { "X-Agency-ID": currentAgency.id },
      },
    );

    if (response.data.success) {
      return true;
    }

    throw new Error(response.data.error || "Failed to remove role");
  };

  const setMemberRoles = async (memberId, roleIds) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.put(
      `/roles/member/${memberId}/roles`,
      {
        role_ids: roleIds,
      },
      {
        headers: { "X-Agency-ID": currentAgency.id },
      },
    );

    if (response.data.success) {
      return true;
    }

    throw new Error(response.data.error || "Failed to set member roles");
  };

  // Permission override management
  const getMemberOverrides = async (memberId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.get(`/roles/member/${memberId}/overrides`, {
      headers: { "X-Agency-ID": currentAgency.id },
    });

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to get overrides");
  };

  const setPermissionOverride = async (
    memberId,
    permissionKey,
    value,
    reason = null,
  ) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.post(
      `/roles/member/${memberId}/overrides`,
      {
        permission_key: permissionKey,
        value,
        reason,
      },
      {
        headers: { "X-Agency-ID": currentAgency.id },
      },
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.error || "Failed to set override");
  };

  const removePermissionOverride = async (memberId, permissionKey) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.delete(
      `/roles/member/${memberId}/overrides/${permissionKey}`,
      {
        headers: { "X-Agency-ID": currentAgency.id },
      },
    );

    if (response.data.success) {
      return true;
    }

    throw new Error(response.data.error || "Failed to remove override");
  };

  // Get member's effective permissions (resolved from roles + overrides)
  const getMemberEffectivePermissions = async (memberId) => {
    if (!currentAgency?.id) throw new Error("No agency selected");

    const response = await api.get(`/roles/member/${memberId}/permissions`, {
      headers: { "X-Agency-ID": currentAgency.id },
    });

    if (response.data.success) {
      // Transform the permissions array into an object with permission details
      const permissionsObj = {};
      const permissions = response.data.data || {};

      // If it's already an object, return it
      if (!Array.isArray(permissions)) {
        Object.keys(ALL_PERMISSIONS).forEach((key) => {
          permissionsObj[key] = {
            name: key.replace(/_/g, " ").replace(/can /i, ""),
            description: ALL_PERMISSIONS[key],
            granted: permissions[key] || false,
          };
        });
        return permissionsObj;
      }

      // If it's an array, transform it
      Object.keys(ALL_PERMISSIONS).forEach((key) => {
        permissionsObj[key] = {
          name: key.replace(/_/g, " ").replace(/can /i, ""),
          description: ALL_PERMISSIONS[key],
          granted: permissions.includes(key),
        };
      });

      return permissionsObj;
    }

    throw new Error(response.data.error || "Failed to get member permissions");
  };

  // Filter templates by category
  const getTemplatesByCategory = useCallback(
    (category) => {
      if (!category) return roleTemplates;
      return roleTemplates.filter((t) => t.category === category);
    },
    [roleTemplates],
  );

  // Search templates
  const searchTemplates = useCallback(
    (query) => {
      if (!query) return roleTemplates;
      const lowerQuery = query.toLowerCase();
      return roleTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.display_name.toLowerCase().includes(lowerQuery) ||
          t.description?.toLowerCase().includes(lowerQuery),
      );
    },
    [roleTemplates],
  );

  const value = {
    // State
    roleTemplates,
    templateCategories,
    agencyRoles,
    myPermissions,
    mySectionAccess,
    myMemberType,
    loading,
    error,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessSection,
    isOwner,
    isAdmin,

    // Template helpers
    getTemplatesByCategory,
    searchTemplates,

    // Role management
    copyTemplateToAgency,
    createAgencyRole,
    updateAgencyRole,
    deleteAgencyRole,

    // Member role management
    getMemberRoles,
    assignRoleToMember,
    removeRoleFromMember,
    setMemberRoles,

    // Permission overrides
    getMemberOverrides,
    setPermissionOverride,
    removePermissionOverride,
    getMemberEffectivePermissions,

    // Refresh functions
    refreshRoleTemplates: fetchRoleTemplates,
    refreshAgencyRoles: fetchAgencyRoles,
    refreshMyPermissions: fetchMyPermissions,

    // Constants
    ALL_PERMISSIONS,
    PERMISSION_CATEGORIES,
  };

  return (
    <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
  );
}

export function useRoles() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles must be used within a RolesProvider");
  }
  return context;
}

export default RolesContext;
