/**
 * RolesSettings Page
 *
 * Admin/Owner page for managing roles and permissions.
 * Features:
 * - Browse role templates by category
 * - Copy templates to agency
 * - Create custom roles
 * - Edit role permissions
 * - Assign roles to members
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  Users,
  ChevronRight,
  Check,
  X,
  Loader2,
  Lock,
  Unlock,
  Filter,
  Grid,
  List,
  Star,
  Info,
  Settings,
} from "lucide-react";
import {
  useRoles,
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
} from "../context/RolesContext";
import { useAgency } from "../hooks/useAgency";
import { useIsAdmin } from "../hooks/usePermission";
import { useToast } from "../components/ui/use-toast";
import { cn } from "../lib/utils";
import MemberRoleAssigner from "../components/roles/MemberRoleAssigner";

// Category icons and colors
const CATEGORY_CONFIG = {
  Sales: { color: "bg-blue-100 text-[#3F0D28]", icon: "💼" },
  Marketing: { color: "bg-purple-100 text-purple-600", icon: "📣" },
  Operations: { color: "bg-green-100 text-green-600", icon: "⚙️" },
  Finance: { color: "bg-yellow-100 text-yellow-600", icon: "💰" },
  "Client Success": { color: "bg-pink-100 text-pink-600", icon: "🤝" },
  Creative: { color: "bg-orange-100 text-orange-600", icon: "🎨" },
  Technology: { color: "bg-indigo-100 text-indigo-600", icon: "💻" },
  Leadership: { color: "bg-red-100 text-red-600", icon: "👑" },
  "Agency-Specific": { color: "bg-teal-100 text-teal-600", icon: "🏢" },
  Support: { color: "bg-gray-100 text-gray-600", icon: "🎧" },
};

export default function RolesSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    roleTemplates,
    templateCategories,
    agencyRoles,
    loading,
    copyTemplateToAgency,
    createAgencyRole,
    updateAgencyRole,
    deleteAgencyRole,
    getTemplatesByCategory,
    searchTemplates,
  } = useRoles();
  const { currentAgency, isGodMode } = useAgency();
  const isAdmin = useIsAdmin();

  // State
  const [activeTab, setActiveTab] = useState("agency"); // 'agency' or 'templates'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin && !isGodMode()) {
      navigate("/app/settings");
    }
  }, [isAdmin, isGodMode, navigate]);

  // Filter templates
  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory
      ? getTemplatesByCategory(selectedCategory)
      : roleTemplates;

  // Handle copy template
  const handleCopyTemplate = async (template) => {
    try {
      setActionLoading(`copy-${template.id}`);
      await copyTemplateToAgency(template.id);
      toast({
        title: "Role Created",
        description: `"${template.display_name || template.name}" has been added to your agency roles.`,
      });
      setActiveTab("agency"); // Switch to show the new role
    } catch (error) {
      console.error("Error copying template:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to copy template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete role
  const handleDeleteRole = async (roleId) => {
    const roleToDelete = agencyRoles.find((r) => r.id === roleId);
    if (
      !confirm(
        "Are you sure you want to delete this role? Members with this role will lose its permissions.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(`delete-${roleId}`);
      await deleteAgencyRole(roleId);
      toast({
        title: "Role Deleted",
        description: `"${roleToDelete?.display_name || roleToDelete?.name || "Role"}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit role
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3F0D28]" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#3F0D28]" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Roles & Permissions
              </h1>
              <p className="text-gray-500">
                Manage team roles and access control
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3F0D28] text-white rounded-lg hover:bg-[#5A2525] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("agency")}
            className={cn(
              "py-3 border-b-2 font-medium text-sm transition-colors",
              activeTab === "agency"
                ? "border-[#3F0D28] text-[#3F0D28]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Agency Roles ({agencyRoles.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={cn(
              "py-3 border-b-2 font-medium text-sm transition-colors",
              activeTab === "templates"
                ? "border-[#3F0D28] text-[#3F0D28]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Role Templates ({roleTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={cn(
              "py-3 border-b-2 font-medium text-sm transition-colors",
              activeTab === "members"
                ? "border-[#3F0D28] text-[#3F0D28]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Team Members
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "agency" ? (
          // Agency Roles
          <div className="space-y-6">
            {agencyRoles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No roles yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create a custom role or copy from templates
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#3F0D28] text-white rounded-lg hover:bg-[#5A2525] transition-colors"
                  >
                    Create Custom Role
                  </button>
                  <button
                    onClick={() => setActiveTab("templates")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Browse Templates
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agencyRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={() => handleEditRole(role)}
                    onDelete={() => handleDeleteRole(role.id)}
                    loading={actionLoading === `delete-${role.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "templates" ? (
          // Role Templates
          <div className="space-y-6">
            {/* Search and filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28]"
                />
              </div>

              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-white shadow-sm"
                      : "text-gray-500",
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-white shadow-sm"
                      : "text-gray-500",
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  !selectedCategory
                    ? "bg-[#3F0D28] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                All ({roleTemplates.length})
              </button>
              {templateCategories.map((category) => {
                const config = CATEGORY_CONFIG[category.name] || {
                  color: "bg-gray-100 text-gray-600",
                };
                const count = roleTemplates.filter(
                  (t) => t.category === category.name,
                ).length;

                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      selectedCategory === category.name
                        ? "bg-[#3F0D28] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    )}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Templates grid/list */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onCopy={() => handleCopyTemplate(template)}
                    loading={actionLoading === `copy-${template.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <TemplateListItem
                    key={template.id}
                    template={template}
                    onCopy={() => handleCopyTemplate(template)}
                    loading={actionLoading === `copy-${template.id}`}
                  />
                ))}
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        ) : activeTab === "members" ? (
          // Team Members
          <MemberRoleAssigner />
        ) : null}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createAgencyRole}
        />
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSave={updateAgencyRole}
        />
      )}
    </div>
  );
}

// Role Card Component
function RoleCard({ role, onEdit, onDelete, loading }) {
  const permissionCount = Object.values(role.permissions || {}).filter(
    Boolean,
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: role.color || "#3F0D28" }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {role.display_name || role.name}
            </h3>
            <p className="text-xs text-gray-500">
              {permissionCount} permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {role.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {role.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5" />
          <span>{role.member_count || 0} members</span>
        </div>

        {role.source_template_id && (
          <span className="text-xs text-gray-400">From template</span>
        )}
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onCopy, loading }) {
  const config = CATEGORY_CONFIG[template.category] || {
    color: "bg-gray-100 text-gray-600",
  };
  const permissionCount = Object.values(template.permissions || {}).filter(
    Boolean,
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            config.color,
          )}
        >
          {template.category}
        </div>
        {template.is_popular && (
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        )}
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">
        {template.display_name || template.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {template.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {permissionCount} permissions
        </span>
        <button
          onClick={onCopy}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3F0D28] text-white text-sm font-medium rounded-lg hover:bg-[#5A2525] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Copy
        </button>
      </div>
    </div>
  );
}

// Template List Item Component
function TemplateListItem({ template, onCopy, loading }) {
  const config = CATEGORY_CONFIG[template.category] || {
    color: "bg-gray-100 text-gray-600",
  };
  const permissionCount = Object.values(template.permissions || {}).filter(
    Boolean,
  ).length;

  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            config.color,
          )}
        >
          {template.category}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {template.display_name || template.name}
          </h3>
          <p className="text-sm text-gray-500">{template.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {permissionCount} permissions
        </span>
        <button
          onClick={onCopy}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3F0D28] text-white text-sm font-medium rounded-lg hover:bg-[#5A2525] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Copy to Agency
        </button>
      </div>
    </div>
  );
}

// Create Role Modal
function CreateRoleModal({ onClose, onCreate }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3F0D28");
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !displayName.trim()) return;

    try {
      setLoading(true);
      await onCreate({
        name: name.toLowerCase().replace(/\s+/g, "_"),
        display_name: displayName,
        description,
        color,
        permissions,
      });
      toast({
        title: "Role Created",
        description: `"${displayName}" has been created successfully.`,
      });
      onClose();
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Role
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setName(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                }}
                placeholder="e.g., Senior Sales Rep"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role is for..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-500">{color}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Permissions
            </h3>
            <div className="space-y-4">
              {Object.entries(PERMISSION_CATEGORIES).map(
                ([category, categoryPermissions]) => (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
                      {category}
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {categoryPermissions.map((permKey) => (
                        <label
                          key={permKey}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissions[permKey] || false}
                            onChange={() => togglePermission(permKey)}
                            className="w-4 h-4 text-[#3F0D28] border-gray-300 rounded focus:ring-[#3F0D28]"
                          />
                          <span className="text-sm text-gray-600">
                            {ALL_PERMISSIONS[permKey] ||
                              permKey.replace("can_", "").replace(/_/g, " ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!displayName.trim() || loading}
            className="px-4 py-2 bg-[#3F0D28] text-white rounded-lg hover:bg-[#5A2525] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Role"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Role Modal
function EditRoleModal({ role, onClose, onSave }) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(role.display_name || "");
  const [description, setDescription] = useState(role.description || "");
  const [color, setColor] = useState(role.color || "#3F0D28");
  const [permissions, setPermissions] = useState(role.permissions || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(role.id, {
        display_name: displayName,
        description,
        color,
        permissions,
      });
      toast({
        title: "Role Updated",
        description: `"${displayName}" has been updated successfully.`,
      });
      onClose();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Edit Role</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-500">{color}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Permissions
            </h3>
            <div className="space-y-4">
              {Object.entries(PERMISSION_CATEGORIES).map(
                ([category, categoryPermissions]) => (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
                      {category}
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {categoryPermissions.map((permKey) => (
                        <label
                          key={permKey}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={permissions[permKey] || false}
                            onChange={() => togglePermission(permKey)}
                            className="w-4 h-4 text-[#3F0D28] border-gray-300 rounded focus:ring-[#3F0D28]"
                          />
                          <span className="text-sm text-gray-600">
                            {ALL_PERMISSIONS[permKey] ||
                              permKey.replace("can_", "").replace(/_/g, " ")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!displayName.trim() || loading}
            className="px-4 py-2 bg-[#3F0D28] text-white rounded-lg hover:bg-[#5A2525] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
