/**
 * Role Service
 *
 * Handles all role-related operations:
 * - Role templates (global)
 * - Agency roles (custom per agency)
 * - Role assignments to members
 * - Permission overrides
 */

import { supabaseServer } from "../config/supabase-auth.js";
import logger from "../utils/logger.js";

// Use shared Supabase client (service role key) from config
const supabase = supabaseServer;

// ============================================
// ROLE TEMPLATES (Global)
// ============================================

/**
 * Get all role templates
 */
export async function getAllRoleTemplates() {
  try {
    const { data, error } = await supabase
      .from("role_templates")
      .select("*")
      .order("category")
      .order("position");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error getting role templates:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get role templates by category
 */
export async function getRoleTemplatesByCategory(category) {
  try {
    const { data, error } = await supabase
      .from("role_templates")
      .select("*")
      .eq("category", category)
      .order("position");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error getting role templates by category:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all unique categories from role templates
 */
export async function getRoleCategories() {
  try {
    const { data, error } = await supabase
      .from("role_templates")
      .select("category")
      .order("category");

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data.map((r) => r.category))];
    return { success: true, data: categories };
  } catch (error) {
    logger.error("Error getting role categories:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Search role templates
 */
export async function searchRoleTemplates(query, category = null) {
  try {
    let queryBuilder = supabase
      .from("role_templates")
      .select("*")
      .or(
        `name.ilike.%${query}%,display_name.ilike.%${query}%,description.ilike.%${query}%`,
      );

    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    const { data, error } = await queryBuilder
      .order("category")
      .order("position");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error searching role templates:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a single role template by ID
 */
export async function getRoleTemplate(templateId) {
  try {
    const { data, error } = await supabase
      .from("role_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error getting role template:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// AGENCY ROLES (Custom per agency)
// ============================================

/**
 * Get all roles for an agency
 */
export async function getAgencyRoles(agencyId) {
  try {
    const { data, error } = await supabase
      .from("agency_roles")
      .select(
        `
        *,
        template:role_templates(name, display_name, category),
        member_count:member_roles(count)
      `,
      )
      .eq("agency_id", agencyId)
      .order("position");

    if (error) throw error;

    // Transform data to include member count
    const rolesWithCount = data.map((role) => ({
      ...role,
      member_count: role.member_count?.[0]?.count || 0,
    }));

    return { success: true, data: rolesWithCount };
  } catch (error) {
    logger.error("Error getting agency roles:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a single agency role by ID
 */
export async function getAgencyRole(roleId) {
  try {
    const { data, error } = await supabase
      .from("agency_roles")
      .select(
        `
        *,
        template:role_templates(name, display_name, category)
      `,
      )
      .eq("id", roleId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error getting agency role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Copy a role template to an agency
 */
export async function copyRoleTemplateToAgency(
  templateId,
  agencyId,
  createdBy,
) {
  try {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from("role_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw templateError;

    // Check if role already exists
    const { data: existing } = await supabase
      .from("agency_roles")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("name", template.name)
      .single();

    if (existing) {
      return {
        success: false,
        error: "A role with this name already exists in your agency",
      };
    }

    // Create agency role from template
    const { data, error } = await supabase
      .from("agency_roles")
      .insert({
        agency_id: agencyId,
        template_id: templateId,
        name: template.name,
        display_name: template.display_name,
        description: template.description,
        color: template.color,
        icon: template.icon,
        permissions: template.permissions,
        section_access: template.section_access,
        position: template.position,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error copying role template:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a custom agency role
 */
export async function createAgencyRole(agencyId, roleData, createdBy) {
  try {
    // Check if role name already exists
    const { data: existing } = await supabase
      .from("agency_roles")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("name", roleData.name)
      .single();

    if (existing) {
      return { success: false, error: "A role with this name already exists" };
    }

    // Get max position
    const { data: maxPos } = await supabase
      .from("agency_roles")
      .select("position")
      .eq("agency_id", agencyId)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position || 0) + 1;

    // Create role
    const { data, error } = await supabase
      .from("agency_roles")
      .insert({
        agency_id: agencyId,
        name: roleData.name,
        display_name: roleData.display_name || roleData.name,
        description: roleData.description || "",
        color: roleData.color || "#4A1515",
        icon: roleData.icon || "user",
        permissions: roleData.permissions || {},
        section_access: roleData.section_access || {},
        is_default: roleData.is_default || false,
        position,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error creating agency role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an agency role
 */
export async function updateAgencyRole(roleId, agencyId, updates) {
  try {
    // Verify role belongs to agency
    const { data: role } = await supabase
      .from("agency_roles")
      .select("id")
      .eq("id", roleId)
      .eq("agency_id", agencyId)
      .single();

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    // If name is being changed, check for duplicates
    if (updates.name) {
      const { data: existing } = await supabase
        .from("agency_roles")
        .select("id")
        .eq("agency_id", agencyId)
        .eq("name", updates.name)
        .neq("id", roleId)
        .single();

      if (existing) {
        return {
          success: false,
          error: "A role with this name already exists",
        };
      }
    }

    // Update role
    const { data, error } = await supabase
      .from("agency_roles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roleId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error updating agency role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an agency role
 */
export async function deleteAgencyRole(roleId, agencyId) {
  try {
    // Verify role belongs to agency
    const { data: role } = await supabase
      .from("agency_roles")
      .select("id")
      .eq("id", roleId)
      .eq("agency_id", agencyId)
      .single();

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    // Delete role (cascades to member_roles)
    const { error } = await supabase
      .from("agency_roles")
      .delete()
      .eq("id", roleId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("Error deleting agency role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Reorder agency roles
 */
export async function reorderAgencyRoles(agencyId, roleIds) {
  try {
    // Update positions for each role
    const updates = roleIds.map((roleId, index) => ({
      id: roleId,
      position: index,
    }));

    for (const update of updates) {
      await supabase
        .from("agency_roles")
        .update({ position: update.position })
        .eq("id", update.id)
        .eq("agency_id", agencyId);
    }

    return { success: true };
  } catch (error) {
    logger.error("Error reordering roles:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Set default role for agency
 */
export async function setDefaultRole(roleId, agencyId) {
  try {
    // Clear existing default
    await supabase
      .from("agency_roles")
      .update({ is_default: false })
      .eq("agency_id", agencyId);

    // Set new default
    const { error } = await supabase
      .from("agency_roles")
      .update({ is_default: true })
      .eq("id", roleId)
      .eq("agency_id", agencyId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("Error setting default role:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ROLE ASSIGNMENTS
// ============================================

/**
 * Get roles assigned to a member
 */
export async function getMemberRoles(memberId) {
  try {
    const { data, error } = await supabase
      .from("member_roles")
      .select(
        `
        id,
        assigned_at,
        assigned_by,
        role:agency_roles(
          id,
          name,
          display_name,
          color,
          icon,
          permissions,
          section_access
        )
      `,
      )
      .eq("member_id", memberId);

    if (error) throw error;
    return {
      success: true,
      data: data.map((mr) => ({
        ...mr.role,
        assignment_id: mr.id,
        assigned_at: mr.assigned_at,
      })),
    };
  } catch (error) {
    logger.error("Error getting member roles:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get members with a specific role
 */
export async function getRoleMembers(roleId) {
  try {
    const { data, error } = await supabase
      .from("member_roles")
      .select(
        `
        id,
        assigned_at,
        member:agency_members(
          id,
          user_id,
          member_type,
          role
        )
      `,
      )
      .eq("role_id", roleId);

    if (error) throw error;
    return {
      success: true,
      data: data.map((mr) => ({
        ...mr.member,
        assignment_id: mr.id,
        assigned_at: mr.assigned_at,
      })),
    };
  } catch (error) {
    logger.error("Error getting role members:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Assign a role to a member
 */
export async function assignRoleToMember(memberId, roleId, assignedBy) {
  try {
    // Verify member and role are in same agency
    const { data: member } = await supabase
      .from("agency_members")
      .select("agency_id")
      .eq("id", memberId)
      .single();

    const { data: role } = await supabase
      .from("agency_roles")
      .select("agency_id")
      .eq("id", roleId)
      .single();

    if (!member || !role || member.agency_id !== role.agency_id) {
      return {
        success: false,
        error: "Member and role must be in the same agency",
      };
    }

    // Assign role
    const { data, error } = await supabase
      .from("member_roles")
      .upsert(
        {
          member_id: memberId,
          role_id: roleId,
          assigned_by: assignedBy,
        },
        {
          onConflict: "member_id,role_id",
        },
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error assigning role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a role from a member
 */
export async function removeRoleFromMember(memberId, roleId) {
  try {
    const { error } = await supabase
      .from("member_roles")
      .delete()
      .eq("member_id", memberId)
      .eq("role_id", roleId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("Error removing role:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Set all roles for a member (replace existing)
 */
export async function setMemberRoles(memberId, roleIds, assignedBy) {
  try {
    // Delete existing assignments
    await supabase.from("member_roles").delete().eq("member_id", memberId);

    // Create new assignments
    if (roleIds.length > 0) {
      const assignments = roleIds.map((roleId) => ({
        member_id: memberId,
        role_id: roleId,
        assigned_by: assignedBy,
      }));

      const { error } = await supabase.from("member_roles").insert(assignments);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    logger.error("Error setting member roles:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// PERMISSION OVERRIDES
// ============================================

/**
 * Get all permission overrides for a member
 */
export async function getMemberPermissionOverrides(memberId) {
  try {
    const { data, error } = await supabase
      .from("member_permission_overrides")
      .select("*")
      .eq("member_id", memberId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error getting permission overrides:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Set a permission override for a member
 */
export async function setPermissionOverride(
  memberId,
  permissionKey,
  value,
  setBy,
  reason = null,
) {
  try {
    const { data, error } = await supabase
      .from("member_permission_overrides")
      .upsert(
        {
          member_id: memberId,
          permission_key: permissionKey,
          value,
          set_by: setBy,
          reason,
          set_at: new Date().toISOString(),
        },
        {
          onConflict: "member_id,permission_key",
        },
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    logger.error("Error setting permission override:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a permission override (revert to role-based)
 */
export async function removePermissionOverride(memberId, permissionKey) {
  try {
    const { error } = await supabase
      .from("member_permission_overrides")
      .delete()
      .eq("member_id", memberId)
      .eq("permission_key", permissionKey);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("Error removing permission override:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Set multiple permission overrides at once
 */
export async function setMultiplePermissionOverrides(
  memberId,
  overrides,
  setBy,
) {
  try {
    // Delete existing overrides for these permissions
    const permissionKeys = overrides.map((o) => o.permission_key);
    await supabase
      .from("member_permission_overrides")
      .delete()
      .eq("member_id", memberId)
      .in("permission_key", permissionKeys);

    // Insert new overrides
    const overrideRecords = overrides.map((o) => ({
      member_id: memberId,
      permission_key: o.permission_key,
      value: o.value,
      set_by: setBy,
      reason: o.reason || null,
    }));

    const { error } = await supabase
      .from("member_permission_overrides")
      .insert(overrideRecords);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("Error setting multiple overrides:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear all permission overrides for a member
 */
export async function clearPermissionOverrides(memberId) {
  try {
    const { error } = await supabase
      .from("member_permission_overrides")
      .delete()
      .eq("member_id", memberId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logger.error("Error clearing permission overrides:", error);
    return { success: false, error: error.message };
  }
}

export default {
  // Templates
  getAllRoleTemplates,
  getRoleTemplatesByCategory,
  getRoleCategories,
  searchRoleTemplates,
  getRoleTemplate,

  // Agency roles
  getAgencyRoles,
  getAgencyRole,
  copyRoleTemplateToAgency,
  createAgencyRole,
  updateAgencyRole,
  deleteAgencyRole,
  reorderAgencyRoles,
  setDefaultRole,

  // Role assignments
  getMemberRoles,
  getRoleMembers,
  assignRoleToMember,
  removeRoleFromMember,
  setMemberRoles,

  // Permission overrides
  getMemberPermissionOverrides,
  setPermissionOverride,
  removePermissionOverride,
  setMultiplePermissionOverrides,
  clearPermissionOverrides,
};
