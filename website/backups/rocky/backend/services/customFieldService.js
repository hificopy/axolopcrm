import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// CUSTOM FIELD DEFINITIONS
// ============================================================================

/**
 * Get all custom field definitions for a user
 * @param {string} userId - User ID
 * @param {string} entityType - Optional: Filter by entity type ('lead', 'contact', 'opportunity', 'all')
 * @returns {Promise<Array>} Array of custom field definitions
 */
const getCustomFieldDefinitions = async (userId, entityType = null) => {
  let query = supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (entityType && entityType !== 'all') {
    query = query.or(`entity_type.eq.${entityType},entity_type.eq.all`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase fetch custom field definitions error:', error);
    throw new Error(`Failed to fetch custom field definitions: ${error.message}`);
  }

  return data;
};

/**
 * Get a single custom field definition by ID
 * @param {string} userId - User ID
 * @param {string} fieldId - Field definition ID
 * @returns {Promise<Object>} Custom field definition
 */
const getCustomFieldDefinitionById = async (userId, fieldId) => {
  const { data, error } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('id', fieldId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Supabase fetch custom field definition error:', error);
    throw new Error(`Failed to fetch custom field definition: ${error.message}`);
  }

  return data;
};

/**
 * Create a new custom field definition
 * @param {string} userId - User ID
 * @param {Object} fieldData - Field definition data
 * @returns {Promise<Object>} Created custom field definition
 */
const createCustomFieldDefinition = async (userId, fieldData) => {
  // Normalize field_name
  const normalizedFieldName = fieldData.field_name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const { data, error} = await supabase
    .from('custom_field_definitions')
    .insert({
      user_id: userId,
      field_name: normalizedFieldName,
      display_name: fieldData.display_name,
      field_type: fieldData.field_type || 'text',
      entity_type: fieldData.entity_type || 'lead',
      options: fieldData.options || null,
      is_required: fieldData.is_required || false,
      validation_rules: fieldData.validation_rules || null,
      display_order: fieldData.display_order || 0,
      group_name: fieldData.group_name || null,
      help_text: fieldData.help_text || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase create custom field definition error:', error);
    throw new Error(`Failed to create custom field definition: ${error.message}`);
  }

  return data;
};

/**
 * Update an existing custom field definition
 * @param {string} userId - User ID
 * @param {string} fieldId - Field definition ID
 * @param {Object} fieldData - Updated field data
 * @returns {Promise<Object>} Updated custom field definition
 */
const updateCustomFieldDefinition = async (userId, fieldId, fieldData) => {
  const updateData = {
    ...fieldData,
    updated_at: new Date().toISOString(),
  };

  // Remove fields that shouldn't be updated
  delete updateData.user_id;
  delete updateData.id;
  delete updateData.created_at;

  // Normalize field_name if provided
  if (updateData.field_name) {
    updateData.field_name = updateData.field_name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  const { data, error } = await supabase
    .from('custom_field_definitions')
    .update(updateData)
    .eq('id', fieldId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update custom field definition error:', error);
    throw new Error(`Failed to update custom field definition: ${error.message}`);
  }

  return data;
};

/**
 * Delete a custom field definition (soft delete by setting is_active = false)
 * @param {string} userId - User ID
 * @param {string} fieldId - Field definition ID
 * @returns {Promise<boolean>} Success status
 */
const deleteCustomFieldDefinition = async (userId, fieldId) => {
  const { error } = await supabase
    .from('custom_field_definitions')
    .update({ is_active: false })
    .eq('id', fieldId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete custom field definition error:', error);
    throw new Error(`Failed to delete custom field definition: ${error.message}`);
  }

  return true;
};

/**
 * Reorder custom field definitions
 * @param {string} userId - User ID
 * @param {Array} orderUpdates - Array of {id, display_order} objects
 * @returns {Promise<boolean>} Success status
 */
const reorderCustomFieldDefinitions = async (userId, orderUpdates) => {
  const promises = orderUpdates.map(({ id, display_order }) =>
    supabase
      .from('custom_field_definitions')
      .update({ display_order })
      .eq('id', id)
      .eq('user_id', userId)
  );

  await Promise.all(promises);
  return true;
};

// ============================================================================
// CUSTOM FIELD VALUES (stored in entity custom_fields JSONB)
// ============================================================================

/**
 * Get custom field values for an entity
 * @param {string} userId - User ID
 * @param {string} entityType - Entity type ('lead', 'contact', 'opportunity')
 * @param {string} entityId - Entity ID
 * @returns {Promise<Object>} Custom field values
 */
const getCustomFieldValues = async (userId, entityType, entityId) => {
  const tableName = entityType === 'lead' ? 'leads' : entityType === 'contact' ? 'contacts' : 'opportunities';

  const { data, error } = await supabase
    .from(tableName)
    .select('custom_fields')
    .eq('id', entityId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Supabase fetch custom field values error:', error);
    throw new Error(`Failed to fetch custom field values: ${error.message}`);
  }

  return data?.custom_fields || {};
};

/**
 * Update custom field values for an entity
 * @param {string} userId - User ID
 * @param {string} entityType - Entity type ('lead', 'contact', 'opportunity')
 * @param {string} entityId - Entity ID
 * @param {Object} customFields - Custom field values
 * @returns {Promise<Object>} Updated entity
 */
const updateCustomFieldValues = async (userId, entityType, entityId, customFields) => {
  const tableName = entityType === 'lead' ? 'leads' : entityType === 'contact' ? 'contacts' : 'opportunities';

  const { data, error } = await supabase
    .from(tableName)
    .update({ custom_fields: customFields })
    .eq('id', entityId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update custom field values error:', error);
    throw new Error(`Failed to update custom field values: ${error.message}`);
  }

  return data;
};

/**
 * Validate custom field values against definitions
 * @param {string} userId - User ID
 * @param {string} entityType - Entity type
 * @param {Object} customFields - Custom field values to validate
 * @returns {Promise<Object>} Validation result {valid: boolean, errors: Array}
 */
const validateCustomFieldValues = async (userId, entityType, customFields) => {
  const definitions = await getCustomFieldDefinitions(userId, entityType);
  const errors = [];

  for (const definition of definitions) {
    const value = customFields[definition.field_name];

    // Check required fields
    if (definition.is_required && !value) {
      errors.push({
        field: definition.field_name,
        message: `${definition.display_name} is required`,
      });
      continue;
    }

    // Skip validation if no value
    if (!value) continue;

    // Type validation
    switch (definition.field_type) {
      case 'number':
        if (isNaN(value)) {
          errors.push({
            field: definition.field_name,
            message: `${definition.display_name} must be a number`,
          });
        }
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            field: definition.field_name,
            message: `${definition.display_name} must be a valid email`,
          });
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push({
            field: definition.field_name,
            message: `${definition.display_name} must be a valid URL`,
          });
        }
        break;

      case 'date':
        if (isNaN(Date.parse(value))) {
          errors.push({
            field: definition.field_name,
            message: `${definition.display_name} must be a valid date`,
          });
        }
        break;

      case 'select':
        if (definition.options && !definition.options.some(opt => opt.value === value)) {
          errors.push({
            field: definition.field_name,
            message: `${definition.display_name} must be one of the predefined options`,
          });
        }
        break;

      case 'multiselect':
        if (definition.options && Array.isArray(value)) {
          const validValues = definition.options.map(opt => opt.value);
          const invalidValues = value.filter(v => !validValues.includes(v));
          if (invalidValues.length > 0) {
            errors.push({
              field: definition.field_name,
              message: `${definition.display_name} contains invalid options: ${invalidValues.join(', ')}`,
            });
          }
        }
        break;
    }

    // Custom validation rules
    if (definition.validation_rules) {
      const rules = definition.validation_rules;

      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          field: definition.field_name,
          message: `${definition.display_name} must be at least ${rules.min}`,
        });
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          field: definition.field_name,
          message: `${definition.display_name} must be at most ${rules.max}`,
        });
      }

      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push({
          field: definition.field_name,
          message: `${definition.display_name} must be at least ${rules.minLength} characters`,
        });
      }

      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push({
          field: definition.field_name,
          message: `${definition.display_name} must be at most ${rules.maxLength} characters`,
        });
      }

      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors.push({
          field: definition.field_name,
          message: `${definition.display_name} format is invalid`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ESM default export
export default {
  // Custom field definitions
  getCustomFieldDefinitions,
  getCustomFieldDefinitionById,
  createCustomFieldDefinition,
  updateCustomFieldDefinition,
  deleteCustomFieldDefinition,
  reorderCustomFieldDefinitions,

  // Custom field values
  getCustomFieldValues,
  updateCustomFieldValues,
  validateCustomFieldValues,
};
