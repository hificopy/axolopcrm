/**
 * usePermission Hook
 *
 * Simple hook for checking permissions in components.
 * Uses the RolesContext for permission data.
 *
 * Usage:
 * const canEdit = usePermission('can_edit_leads');
 * const canManage = usePermission(['can_manage_team', 'can_manage_roles'], 'any');
 * const hasAll = usePermission(['can_view_leads', 'can_edit_leads'], 'all');
 */

import { useRoles } from '../context/RolesContext';

/**
 * Check if user has permission(s)
 *
 * @param {string|string[]} permission - Single permission key or array of keys
 * @param {'single'|'any'|'all'} mode - How to check multiple permissions
 * @returns {boolean} - Whether user has the permission(s)
 */
export function usePermission(permission, mode = 'single') {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isOwner, isAdmin } = useRoles();

  // Owner has all permissions
  if (isOwner) return true;

  // Single permission check
  if (typeof permission === 'string') {
    // Admin has all permissions except billing
    if (isAdmin && permission !== 'can_manage_billing') return true;
    return hasPermission(permission);
  }

  // Array of permissions
  if (Array.isArray(permission)) {
    if (mode === 'any') {
      // Admin check for any
      if (isAdmin) {
        return permission.some(p => p !== 'can_manage_billing') || permission.length === 0;
      }
      return hasAnyPermission(permission);
    }

    if (mode === 'all') {
      // Admin check for all
      if (isAdmin) {
        return permission.every(p => p !== 'can_manage_billing');
      }
      return hasAllPermissions(permission);
    }

    // Default to 'any' for arrays
    return hasAnyPermission(permission);
  }

  return false;
}

/**
 * Check if user can access a section
 *
 * @param {string} section - Section name (dashboard, leads, contacts, etc.)
 * @returns {boolean} - Whether user can access the section
 */
export function useSectionAccess(section) {
  const { canAccessSection, isOwner, isAdmin } = useRoles();

  // Owner and admin can access all sections
  if (isOwner || isAdmin) return true;

  return canAccessSection(section);
}

/**
 * Get current user's member type
 *
 * @returns {'owner'|'admin'|'seated_user'} - The user's member type
 */
export function useMemberType() {
  const { myMemberType } = useRoles();
  return myMemberType;
}

/**
 * Check if current user is owner
 *
 * @returns {boolean} - Whether user is owner
 */
export function useIsOwner() {
  const { isOwner } = useRoles();
  return isOwner;
}

/**
 * Check if current user is admin or owner
 *
 * @returns {boolean} - Whether user is admin or owner
 */
export function useIsAdmin() {
  const { isAdmin } = useRoles();
  return isAdmin;
}

/**
 * Check if current user can manage billing (owner only)
 *
 * @returns {boolean} - Whether user can manage billing
 */
export function useCanManageBilling() {
  const { isOwner, hasPermission } = useRoles();
  return isOwner || hasPermission('can_manage_billing');
}

/**
 * Check if current user can manage team
 *
 * @returns {boolean} - Whether user can manage team
 */
export function useCanManageTeam() {
  const { isOwner, isAdmin, hasPermission } = useRoles();
  return isOwner || isAdmin || hasPermission('can_manage_team');
}

/**
 * Check if current user can manage roles
 *
 * @returns {boolean} - Whether user can manage roles
 */
export function useCanManageRoles() {
  const { isOwner, isAdmin, hasPermission } = useRoles();
  return isOwner || isAdmin || hasPermission('can_manage_roles');
}

/**
 * Higher-order component to wrap components with permission check
 * Renders null if permission check fails
 *
 * @param {React.Component} Component - Component to wrap
 * @param {string|string[]} permission - Required permission(s)
 * @param {'single'|'any'|'all'} mode - How to check multiple permissions
 * @returns {React.Component} - Wrapped component
 */
export function withPermission(Component, permission, mode = 'single') {
  return function PermissionWrapper(props) {
    const hasAccess = usePermission(permission, mode);

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Component that renders children only if user has permission
 *
 * Usage:
 * <PermissionGate permission="can_edit_leads">
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({ permission, mode = 'single', fallback = null, children }) {
  const hasAccess = usePermission(permission, mode);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

/**
 * Component that renders children only if user can access section
 *
 * Usage:
 * <SectionGate section="leads">
 *   <LeadsPage />
 * </SectionGate>
 */
export function SectionGate({ section, fallback = null, children }) {
  const hasAccess = useSectionAccess(section);

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

/**
 * Component that renders children only if user is owner
 *
 * Usage:
 * <OwnerOnly>
 *   <BillingSettings />
 * </OwnerOnly>
 */
export function OwnerOnly({ fallback = null, children }) {
  const isOwner = useIsOwner();

  if (!isOwner) {
    return fallback;
  }

  return children;
}

/**
 * Component that renders children only if user is admin or owner
 *
 * Usage:
 * <AdminOnly>
 *   <TeamSettings />
 * </AdminOnly>
 */
export function AdminOnly({ fallback = null, children }) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return fallback;
  }

  return children;
}

export default usePermission;
