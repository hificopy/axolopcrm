/**
 * Roles Routes
 *
 * Handles all role and permission management endpoints:
 * - Role templates (global)
 * - Agency roles (custom)
 * - Role assignments
 * - Permission overrides
 */

import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { requireAgencyAccess, requireAgencyAdmin } from '../middleware/agency-access.js';
import roleService from '../services/role-service.js';
import permissionResolver from '../services/permission-resolver.js';
import logger from '../utils/logger.js';

const router = express.Router();

// ============================================
// ROLE TEMPLATES (Global - Read Only)
// ============================================

/**
 * GET /api/v1/roles/templates
 * Get all role templates
 */
router.get('/templates',
  authenticateUser,
  async (req, res) => {
    try {
      const result = await roleService.getAllRoleTemplates();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting role templates:', error);
      res.status(500).json({ success: false, error: 'Failed to get role templates' });
    }
  }
);

/**
 * GET /api/v1/roles/templates/categories
 * Get all role template categories
 */
router.get('/templates/categories',
  authenticateUser,
  async (req, res) => {
    try {
      const result = await roleService.getRoleCategories();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting role categories:', error);
      res.status(500).json({ success: false, error: 'Failed to get categories' });
    }
  }
);

/**
 * GET /api/v1/roles/templates/category/:category
 * Get role templates by category
 */
router.get('/templates/category/:category',
  authenticateUser,
  async (req, res) => {
    try {
      const { category } = req.params;
      const result = await roleService.getRoleTemplatesByCategory(category);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting role templates by category:', error);
      res.status(500).json({ success: false, error: 'Failed to get role templates' });
    }
  }
);

/**
 * GET /api/v1/roles/templates/search
 * Search role templates
 */
router.get('/templates/search',
  authenticateUser,
  async (req, res) => {
    try {
      const { q, category } = req.query;

      if (!q) {
        return res.status(400).json({ success: false, error: 'Search query required' });
      }

      const result = await roleService.searchRoleTemplates(q, category);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error searching role templates:', error);
      res.status(500).json({ success: false, error: 'Failed to search role templates' });
    }
  }
);

/**
 * GET /api/v1/roles/templates/:id
 * Get a single role template
 */
router.get('/templates/:id',
  authenticateUser,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await roleService.getRoleTemplate(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting role template:', error);
      res.status(500).json({ success: false, error: 'Failed to get role template' });
    }
  }
);

// ============================================
// AGENCY ROLES (Custom per agency)
// ============================================

/**
 * GET /api/v1/roles/agency
 * Get all roles for current agency
 */
router.get('/agency',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const result = await roleService.getAgencyRoles(agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting agency roles:', error);
      res.status(500).json({ success: false, error: 'Failed to get agency roles' });
    }
  }
);

/**
 * GET /api/v1/roles/agency/:id
 * Get a single agency role
 */
router.get('/agency/:id',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await roleService.getAgencyRole(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Verify role belongs to agency
      if (result.data.agency_id !== req.agency.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting agency role:', error);
      res.status(500).json({ success: false, error: 'Failed to get agency role' });
    }
  }
);

/**
 * POST /api/v1/roles/agency
 * Create a custom agency role
 * Requires: admin or owner
 */
router.post('/agency',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const userId = req.user.id;
      const roleData = req.body;

      if (!roleData.name) {
        return res.status(400).json({ success: false, error: 'Role name is required' });
      }

      const result = await roleService.createAgencyRole(agencyId, roleData, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating agency role:', error);
      res.status(500).json({ success: false, error: 'Failed to create role' });
    }
  }
);

/**
 * POST /api/v1/roles/agency/copy-template
 * Copy a role template to agency
 * Requires: admin or owner
 */
router.post('/agency/copy-template',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const userId = req.user.id;
      const { template_id } = req.body;

      if (!template_id) {
        return res.status(400).json({ success: false, error: 'template_id is required' });
      }

      const result = await roleService.copyRoleTemplateToAgency(template_id, agencyId, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error copying role template:', error);
      res.status(500).json({ success: false, error: 'Failed to copy role template' });
    }
  }
);

/**
 * PUT /api/v1/roles/agency/:id
 * Update an agency role
 * Requires: admin or owner
 */
router.put('/agency/:id',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const agencyId = req.agency.id;
      const updates = req.body;

      const result = await roleService.updateAgencyRole(id, agencyId, updates);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error updating agency role:', error);
      res.status(500).json({ success: false, error: 'Failed to update role' });
    }
  }
);

/**
 * DELETE /api/v1/roles/agency/:id
 * Delete an agency role
 * Requires: admin or owner
 */
router.delete('/agency/:id',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const agencyId = req.agency.id;

      const result = await roleService.deleteAgencyRole(id, agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error deleting agency role:', error);
      res.status(500).json({ success: false, error: 'Failed to delete role' });
    }
  }
);

/**
 * POST /api/v1/roles/agency/reorder
 * Reorder agency roles
 * Requires: admin or owner
 */
router.post('/agency/reorder',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const agencyId = req.agency.id;
      const { role_ids } = req.body;

      if (!role_ids || !Array.isArray(role_ids)) {
        return res.status(400).json({ success: false, error: 'role_ids array is required' });
      }

      const result = await roleService.reorderAgencyRoles(agencyId, role_ids);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error reordering roles:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder roles' });
    }
  }
);

/**
 * POST /api/v1/roles/agency/:id/set-default
 * Set a role as default for new members
 * Requires: admin or owner
 */
router.post('/agency/:id/set-default',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const agencyId = req.agency.id;

      const result = await roleService.setDefaultRole(id, agencyId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error setting default role:', error);
      res.status(500).json({ success: false, error: 'Failed to set default role' });
    }
  }
);

// ============================================
// ROLE ASSIGNMENTS
// ============================================

/**
 * GET /api/v1/roles/member/:memberId
 * Get roles assigned to a member
 */
router.get('/member/:memberId',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const result = await roleService.getMemberRoles(memberId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting member roles:', error);
      res.status(500).json({ success: false, error: 'Failed to get member roles' });
    }
  }
);

/**
 * GET /api/v1/roles/agency/:roleId/members
 * Get members with a specific role
 */
router.get('/agency/:roleId/members',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const { roleId } = req.params;
      const result = await roleService.getRoleMembers(roleId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting role members:', error);
      res.status(500).json({ success: false, error: 'Failed to get role members' });
    }
  }
);

/**
 * POST /api/v1/roles/member/:memberId/assign
 * Assign a role to a member
 * Requires: admin or owner
 */
router.post('/member/:memberId/assign',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const { role_id } = req.body;
      const userId = req.user.id;

      if (!role_id) {
        return res.status(400).json({ success: false, error: 'role_id is required' });
      }

      const result = await roleService.assignRoleToMember(memberId, role_id, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error assigning role:', error);
      res.status(500).json({ success: false, error: 'Failed to assign role' });
    }
  }
);

/**
 * DELETE /api/v1/roles/member/:memberId/roles/:roleId
 * Remove a role from a member
 * Requires: admin or owner
 */
router.delete('/member/:memberId/roles/:roleId',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId, roleId } = req.params;

      const result = await roleService.removeRoleFromMember(memberId, roleId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error removing role:', error);
      res.status(500).json({ success: false, error: 'Failed to remove role' });
    }
  }
);

/**
 * PUT /api/v1/roles/member/:memberId/roles
 * Set all roles for a member (replace existing)
 * Requires: admin or owner
 */
router.put('/member/:memberId/roles',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const { role_ids } = req.body;
      const userId = req.user.id;

      if (!role_ids || !Array.isArray(role_ids)) {
        return res.status(400).json({ success: false, error: 'role_ids array is required' });
      }

      const result = await roleService.setMemberRoles(memberId, role_ids, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error setting member roles:', error);
      res.status(500).json({ success: false, error: 'Failed to set member roles' });
    }
  }
);

// ============================================
// PERMISSION OVERRIDES
// ============================================

/**
 * GET /api/v1/roles/member/:memberId/overrides
 * Get permission overrides for a member
 */
router.get('/member/:memberId/overrides',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const result = await roleService.getMemberPermissionOverrides(memberId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting permission overrides:', error);
      res.status(500).json({ success: false, error: 'Failed to get permission overrides' });
    }
  }
);

/**
 * POST /api/v1/roles/member/:memberId/overrides
 * Set a permission override for a member
 * Requires: admin or owner
 */
router.post('/member/:memberId/overrides',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const { permission_key, value, reason } = req.body;
      const userId = req.user.id;

      if (!permission_key || typeof value !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'permission_key and boolean value are required'
        });
      }

      const result = await roleService.setPermissionOverride(
        memberId,
        permission_key,
        value,
        userId,
        reason
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error setting permission override:', error);
      res.status(500).json({ success: false, error: 'Failed to set permission override' });
    }
  }
);

/**
 * DELETE /api/v1/roles/member/:memberId/overrides/:permissionKey
 * Remove a permission override (revert to role-based)
 * Requires: admin or owner
 */
router.delete('/member/:memberId/overrides/:permissionKey',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId, permissionKey } = req.params;

      const result = await roleService.removePermissionOverride(memberId, permissionKey);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error removing permission override:', error);
      res.status(500).json({ success: false, error: 'Failed to remove permission override' });
    }
  }
);

/**
 * PUT /api/v1/roles/member/:memberId/overrides
 * Set multiple permission overrides at once
 * Requires: admin or owner
 */
router.put('/member/:memberId/overrides',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const { overrides } = req.body;
      const userId = req.user.id;

      if (!overrides || !Array.isArray(overrides)) {
        return res.status(400).json({
          success: false,
          error: 'overrides array is required'
        });
      }

      const result = await roleService.setMultiplePermissionOverrides(memberId, overrides, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error setting multiple overrides:', error);
      res.status(500).json({ success: false, error: 'Failed to set permission overrides' });
    }
  }
);

/**
 * DELETE /api/v1/roles/member/:memberId/overrides
 * Clear all permission overrides for a member
 * Requires: admin or owner
 */
router.delete('/member/:memberId/overrides',
  authenticateUser,
  requireAgencyAccess,
  requireAgencyAdmin,
  async (req, res) => {
    try {
      const { memberId } = req.params;

      const result = await roleService.clearPermissionOverrides(memberId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error clearing permission overrides:', error);
      res.status(500).json({ success: false, error: 'Failed to clear permission overrides' });
    }
  }
);

// ============================================
// PERMISSION RESOLUTION
// ============================================

/**
 * GET /api/v1/roles/member/:memberId/permissions
 * Get resolved permissions for a member
 */
router.get('/member/:memberId/permissions',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const permissions = await permissionResolver.resolvePermissions(memberId, req.user.email);

      res.json({ success: true, data: permissions });
    } catch (error) {
      logger.error('Error resolving permissions:', error);
      res.status(500).json({ success: false, error: 'Failed to resolve permissions' });
    }
  }
);

/**
 * GET /api/v1/roles/my-permissions
 * Get resolved permissions for current user in current agency
 */
router.get('/my-permissions',
  authenticateUser,
  requireAgencyAccess,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const agencyId = req.agency.id;

      const permissions = await permissionResolver.resolvePermissionsByUserAndAgency(
        userId,
        agencyId,
        req.user.email
      );

      const sectionAccess = await permissionResolver.getSectionAccess(
        req.member?.id,
        req.user.email
      );

      res.json({
        success: true,
        data: {
          permissions,
          section_access: sectionAccess,
          member_type: req.member?.member_type || 'unknown'
        }
      });
    } catch (error) {
      logger.error('Error getting my permissions:', error);
      res.status(500).json({ success: false, error: 'Failed to get permissions' });
    }
  }
);

/**
 * GET /api/v1/roles/permissions/all
 * Get all available permissions (for UI)
 */
router.get('/permissions/all',
  authenticateUser,
  async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          permissions: permissionResolver.ALL_PERMISSIONS,
          categories: permissionResolver.PERMISSION_CATEGORIES
        }
      });
    } catch (error) {
      logger.error('Error getting all permissions:', error);
      res.status(500).json({ success: false, error: 'Failed to get permissions' });
    }
  }
);

export default router;
