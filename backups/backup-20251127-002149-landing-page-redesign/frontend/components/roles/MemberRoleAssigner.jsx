import { useState, useEffect } from "react";
import { useRoles } from "../../context/RolesContext";
import { supabase } from "../../config/supabaseClient";
import {
  Users,
  UserPlus,
  X,
  Check,
  Crown,
  Shield,
  Eye,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

const MemberRoleAssigner = () => {
  const {
    agencyRoles,
    assignRoleToMember,
    removeRoleFromMember,
    getMemberRoles,
  } = useRoles();

  const [members, setMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigningRole, setAssigningRole] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPermissionOverrides, setShowPermissionOverrides] = useState(false);

  // Fetch agency members
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current agency
      const { data: agencyMember } = await supabase
        .from("agency_members")
        .select("agency_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single();

      if (!agencyMember) throw new Error("Not agency owner");

      // Fetch all members of this agency
      const { data: members, error } = await supabase
        .from("agency_members")
        .select(
          `
          user_id,
          role,
          joined_at,
          user_profiles:user_id (
            email,
            full_name,
            avatar_url
          )
        `,
        )
        .eq("agency_id", agencyMember.agency_id)
        .neq("role", "owner");

      if (error) throw error;

      setMembers(members || []);

      // Fetch roles for each member
      const rolesPromises = members.map((member) =>
        getMemberRoles(member.user_id),
      );
      const rolesResults = await Promise.allSettled(rolesPromises);

      const rolesMap = {};
      members.forEach((member, index) => {
        rolesMap[member.user_id] =
          rolesResults[index].status === "fulfilled"
            ? rolesResults[index].value
            : [];
      });

      setMemberRoles(rolesMap);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (memberId, roleId) => {
    setAssigningRole({ [memberId]: roleId });

    try {
      await assignRoleToMember(memberId, roleId);

      // Refresh member roles
      const roles = await getMemberRoles(memberId);
      setMemberRoles((prev) => ({
        ...prev,
        [memberId]: roles,
      }));

      toast.success("Role assigned successfully");
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error(error.message || "Failed to assign role");
    } finally {
      setAssigningRole({});
    }
  };

  const handleRemoveRole = async (memberId, roleId) => {
    const role = agencyRoles.find((r) => r.id === roleId);

    try {
      await removeRoleFromMember(memberId, roleId);

      // Refresh member roles
      const roles = await getMemberRoles(memberId);
      setMemberRoles((prev) => ({
        ...prev,
        [memberId]: roles,
      }));

      toast.success(`Removed ${role?.name || "role"} from member`);
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error(error.message || "Failed to remove role");
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return <Crown className="w-4 h-4" />;
      case "member":
        return <Shield className="w-4 h-4" />;
      case "viewer":
        return <Eye className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    if (!role) return "bg-gray-100 text-gray-800";

    const colors = {
      admin: "bg-red-100 text-red-800",
      member: "bg-blue-100 text-blue-800",
      viewer: "bg-green-100 text-green-800",
    };

    return (
      colors[role.name?.toLowerCase()] ||
      role.color ||
      "bg-purple-100 text-purple-800"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">
            Manage roles and permissions for your team members
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{members.length} members</span>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No team members yet
            </h4>
            <p className="text-gray-600">
              Invite team members to manage their roles and permissions
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((member) => (
              <div key={member.user_id} className="p-6">
                <div className="flex items-center justify-between">
                  {/* Member Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.user_profiles?.avatar_url ? (
                        <img
                          src={member.user_profiles.avatar_url}
                          alt={member.user_profiles.full_name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {(member.user_profiles?.full_name ||
                            "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.user_profiles?.full_name || "Unknown User"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {member.user_profiles?.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {/* Roles Section */}
                  <div className="flex items-center space-x-4">
                    {/* Current Roles */}
                    <div className="flex items-center space-x-2">
                      {memberRoles[member.user_id]?.map((role) => (
                        <div
                          key={role.id}
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                        >
                          {getRoleIcon(role.name)}
                          <span>{role.name}</span>
                          <button
                            onClick={() =>
                              handleRemoveRole(member.user_id, role.id)
                            }
                            className="ml-1 hover:text-red-600"
                            title="Remove role"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Assign Role Dropdown */}
                    <div className="flex items-center space-x-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignRole(member.user_id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        disabled={assigningRole[member.user_id]}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Assign role...</option>
                        {agencyRoles
                          .filter(
                            (role) =>
                              !memberRoles[member.user_id]?.some(
                                (r) => r.id === role.id,
                              ),
                          )
                          .map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                      </select>

                      {/* Permission Overrides Button */}
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowPermissionOverrides(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Permissions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permission Overrides Modal */}
      {showPermissionOverrides && selectedMember && (
        <MemberPermissionOverrides
          member={selectedMember}
          onClose={() => {
            setShowPermissionOverrides(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

// Permission Overrides Component
const MemberPermissionOverrides = ({ member, onClose }) => {
  const {
    getMemberEffectivePermissions,
    setPermissionOverride,
    removePermissionOverride,
  } = useRoles();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchPermissions();
  }, [member.user_id]);

  const fetchPermissions = async () => {
    try {
      const perms = await getMemberEffectivePermissions(member.user_id);
      setPermissions(perms || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (permissionKey, value) => {
    setSaving({ [permissionKey]: true });

    try {
      if (value === null) {
        await removePermissionOverride(member.user_id, permissionKey);
      } else {
        await setPermissionOverride(member.user_id, permissionKey, value);
      }

      // Refresh permissions
      await fetchPermissions();
      toast.success("Permission updated");
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
    } finally {
      setSaving({});
    }
  };

  const getPermissionValue = (key) => {
    const perm = permissions[key];
    if (!perm) return null; // Inherit
    return perm.granted ? true : false; // true = Allow, false = Deny
  };

  const getPermissionState = (key) => {
    const value = getPermissionValue(key);
    if (value === null) return "inherit";
    return value ? "allow" : "deny";
  };

  const getPermissionIcon = (state) => {
    switch (state) {
      case "allow":
        return <Check className="w-4 h-4 text-green-600" />;
      case "deny":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded" />;
    }
  };

  const getPermissionColor = (state) => {
    switch (state) {
      case "allow":
        return "bg-green-50 border-green-200";
      case "deny":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Permission Overrides
            </h3>
            <p className="text-sm text-gray-600">
              {member.user_profiles?.full_name || member.user_profiles?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Permissions */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Override specific permissions for this team member.
              <span className="font-medium">Inherit</span> uses the role's
              default permission.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(permissions).map(([key, permission]) => {
              const state = getPermissionState(key);

              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border ${getPermissionColor(state)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getPermissionIcon(state)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {permission.name || key}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {permission.description || `Permission for ${key}`}
                        </p>
                      </div>
                    </div>

                    {/* Three-state toggle */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePermissionChange(key, null)}
                        disabled={saving[key]}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          state === "inherit"
                            ? "bg-gray-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Inherit
                      </button>
                      <button
                        onClick={() => handlePermissionChange(key, true)}
                        disabled={saving[key]}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          state === "allow"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Allow
                      </button>
                      <button
                        onClick={() => handlePermissionChange(key, false)}
                        disabled={saving[key]}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          state === "deny"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRoleAssigner;
