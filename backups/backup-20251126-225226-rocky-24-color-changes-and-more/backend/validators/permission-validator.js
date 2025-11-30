/**
 * Permission Validator
 *
 * Validates permission structures, keys, and role configurations
 * to ensure data integrity before database operations.
 */

import { ALL_PERMISSIONS } from '../services/permission-resolver.js';

// Valid permission keys
const VALID_PERMISSION_KEYS = Object.keys(ALL_PERMISSIONS);

// Valid member types
const VALID_MEMBER_TYPES = ['owner', 'admin', 'seated_user'];

// Valid role fields
const ROLE_REQUIRED_FIELDS = ['name', 'display_name'];
const ROLE_OPTIONAL_FIELDS = ['description', 'color', 'icon', 'permissions', 'section_access', 'position'];

// Color validation regex (hex color)
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate a single permission key
 * @param {string} key - Permission key to validate
 * @returns {Object} Validation result
 */
export function validatePermissionKey(key) {
  if (typeof key !== 'string') {
    return { valid: false, error: 'Permission key must be a string' };
  }

  if (!key.trim()) {
    return { valid: false, error: 'Permission key cannot be empty' };
  }

  if (!VALID_PERMISSION_KEYS.includes(key)) {
    return {
      valid: false,
      error: `Invalid permission key: ${key}`,
      suggestion: findSimilarPermission(key)
    };
  }

  return { valid: true };
}

/**
 * Find similar permission key (for typo suggestions)
 */
function findSimilarPermission(input) {
  const inputLower = input.toLowerCase();
  const matches = VALID_PERMISSION_KEYS.filter(key =>
    key.toLowerCase().includes(inputLower) ||
    inputLower.includes(key.toLowerCase().replace('can_', ''))
  );
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Validate a permissions object
 * @param {Object} permissions - Permissions object to validate
 * @returns {Object} Validation result with cleaned permissions
 */
export function validatePermissionsObject(permissions) {
  const errors = [];
  const warnings = [];
  const cleanedPermissions = {};

  if (permissions === null || permissions === undefined) {
    return { valid: true, permissions: {}, errors: [], warnings: [] };
  }

  if (typeof permissions !== 'object' || Array.isArray(permissions)) {
    return {
      valid: false,
      permissions: {},
      errors: ['Permissions must be an object'],
      warnings: []
    };
  }

  for (const [key, value] of Object.entries(permissions)) {
    const keyValidation = validatePermissionKey(key);

    if (!keyValidation.valid) {
      if (keyValidation.suggestion) {
        warnings.push(`Unknown permission '${key}', did you mean '${keyValidation.suggestion}'?`);
      } else {
        errors.push(keyValidation.error);
      }
      continue;
    }

    if (typeof value !== 'boolean') {
      warnings.push(`Permission '${key}' value should be boolean, got ${typeof value}. Converting.`);
      cleanedPermissions[key] = Boolean(value);
    } else {
      cleanedPermissions[key] = value;
    }
  }

  return {
    valid: errors.length === 0,
    permissions: cleanedPermissions,
    errors,
    warnings
  };
}

/**
 * Validate section access object
 * @param {Object} sectionAccess - Section access configuration
 * @returns {Object} Validation result
 */
export function validateSectionAccess(sectionAccess) {
  const validSections = [
    'dashboard',
    'leads',
    'contacts',
    'opportunities',
    'activities',
    'calendar',
    'meetings',
    'forms',
    'campaigns',
    'workflows',
    'reports',
    'settings',
    'second_brain'
  ];

  if (!sectionAccess || typeof sectionAccess !== 'object') {
    return { valid: true, sectionAccess: {}, warnings: [] };
  }

  const warnings = [];
  const cleanedAccess = {};

  for (const [section, value] of Object.entries(sectionAccess)) {
    if (!validSections.includes(section)) {
      warnings.push(`Unknown section '${section}'`);
      continue;
    }

    cleanedAccess[section] = Boolean(value);
  }

  return {
    valid: true,
    sectionAccess: cleanedAccess,
    warnings
  };
}

/**
 * Validate role data for creation/update
 * @param {Object} roleData - Role data to validate
 * @param {boolean} isUpdate - Whether this is an update (some fields optional)
 * @returns {Object} Validation result
 */
export function validateRoleData(roleData, isUpdate = false) {
  const errors = [];
  const warnings = [];
  const cleanedData = {};

  // Check required fields (only for create)
  if (!isUpdate) {
    for (const field of ROLE_REQUIRED_FIELDS) {
      if (!roleData[field] || !String(roleData[field]).trim()) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Validate name
  if (roleData.name !== undefined) {
    const name = String(roleData.name).trim();
    if (name.length < 2) {
      errors.push('Role name must be at least 2 characters');
    } else if (name.length > 100) {
      errors.push('Role name must be less than 100 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      errors.push('Role name can only contain letters, numbers, underscores, and hyphens');
    } else {
      cleanedData.name = name.toLowerCase();
    }
  }

  // Validate display_name
  if (roleData.display_name !== undefined) {
    const displayName = String(roleData.display_name).trim();
    if (displayName.length < 2) {
      errors.push('Display name must be at least 2 characters');
    } else if (displayName.length > 100) {
      errors.push('Display name must be less than 100 characters');
    } else {
      cleanedData.display_name = displayName;
    }
  }

  // Validate description
  if (roleData.description !== undefined) {
    const description = String(roleData.description).trim();
    if (description.length > 500) {
      errors.push('Description must be less than 500 characters');
    } else {
      cleanedData.description = description;
    }
  }

  // Validate color
  if (roleData.color !== undefined) {
    const color = String(roleData.color).trim();
    if (color && !HEX_COLOR_REGEX.test(color)) {
      warnings.push('Invalid color format, using default');
      cleanedData.color = '#4A1515';
    } else {
      cleanedData.color = color || '#4A1515';
    }
  }

  // Validate icon
  if (roleData.icon !== undefined) {
    const icon = String(roleData.icon).trim();
    if (icon.length > 50) {
      errors.push('Icon name must be less than 50 characters');
    } else {
      cleanedData.icon = icon;
    }
  }

  // Validate permissions
  if (roleData.permissions !== undefined) {
    const permValidation = validatePermissionsObject(roleData.permissions);
    if (!permValidation.valid) {
      errors.push(...permValidation.errors);
    }
    warnings.push(...permValidation.warnings);
    cleanedData.permissions = permValidation.permissions;
  }

  // Validate section_access
  if (roleData.section_access !== undefined) {
    const sectionValidation = validateSectionAccess(roleData.section_access);
    warnings.push(...sectionValidation.warnings);
    cleanedData.section_access = sectionValidation.sectionAccess;
  }

  // Validate position
  if (roleData.position !== undefined) {
    const position = parseInt(roleData.position);
    if (isNaN(position) || position < 0) {
      warnings.push('Invalid position, defaulting to 0');
      cleanedData.position = 0;
    } else if (position > 1000) {
      warnings.push('Position too large, capping at 1000');
      cleanedData.position = 1000;
    } else {
      cleanedData.position = position;
    }
  }

  return {
    valid: errors.length === 0,
    data: cleanedData,
    errors,
    warnings
  };
}

/**
 * Validate member type
 * @param {string} memberType - Member type to validate
 * @returns {Object} Validation result
 */
export function validateMemberType(memberType) {
  if (!memberType || typeof memberType !== 'string') {
    return { valid: false, error: 'Member type is required' };
  }

  const normalized = memberType.toLowerCase().trim();

  if (!VALID_MEMBER_TYPES.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid member type: ${memberType}. Must be one of: ${VALID_MEMBER_TYPES.join(', ')}`
    };
  }

  return { valid: true, memberType: normalized };
}

/**
 * Validate UUID
 * @param {string} id - UUID to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {Object} Validation result
 */
export function validateUUID(id, fieldName = 'ID') {
  if (!id || typeof id !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (!UUID_REGEX.test(id)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  return { valid: true };
}

/**
 * Validate bulk role assignment data
 * @param {Array} memberIds - Array of member IDs
 * @param {Array} roleIds - Array of role IDs
 * @returns {Object} Validation result
 */
export function validateBulkRoleAssignment(memberIds, roleIds) {
  const errors = [];

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    errors.push('At least one member ID is required');
  } else {
    for (let i = 0; i < memberIds.length; i++) {
      const validation = validateUUID(memberIds[i], `Member ID at index ${i}`);
      if (!validation.valid) {
        errors.push(validation.error);
      }
    }

    if (memberIds.length > 100) {
      errors.push('Cannot assign roles to more than 100 members at once');
    }
  }

  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    errors.push('At least one role ID is required');
  } else {
    for (let i = 0; i < roleIds.length; i++) {
      const validation = validateUUID(roleIds[i], `Role ID at index ${i}`);
      if (!validation.valid) {
        errors.push(validation.error);
      }
    }

    if (roleIds.length > 10) {
      errors.push('Cannot assign more than 10 roles at once');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get all valid permission keys
 * @returns {Array<string>} List of valid permission keys
 */
export function getValidPermissionKeys() {
  return [...VALID_PERMISSION_KEYS];
}

/**
 * Get permission description
 * @param {string} key - Permission key
 * @returns {string|null} Permission description
 */
export function getPermissionDescription(key) {
  return ALL_PERMISSIONS[key] || null;
}

export default {
  validatePermissionKey,
  validatePermissionsObject,
  validateSectionAccess,
  validateRoleData,
  validateMemberType,
  validateUUID,
  validateBulkRoleAssignment,
  getValidPermissionKeys,
  getPermissionDescription
};
