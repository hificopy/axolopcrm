import express from 'express';
import customFieldService from '../services/customFieldService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// CUSTOM FIELD DEFINITIONS ROUTES
// ============================================================================

/**
 * GET /api/custom-fields/definitions
 * Get all custom field definitions for the authenticated user
 * Query params: entityType (optional) - Filter by entity type
 */
router.get('/definitions', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType } = req.query;

    const definitions = await customFieldService.getCustomFieldDefinitions(userId, entityType);

    res.status(200).json(definitions);
  } catch (error) {
    console.error('Error fetching custom field definitions:', error);
    res.status(500).json({
      message: 'Failed to fetch custom field definitions',
      error: error.message,
    });
  }
});

/**
 * GET /api/custom-fields/definitions/:id
 * Get a single custom field definition by ID
 */
router.get('/definitions/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const definition = await customFieldService.getCustomFieldDefinitionById(userId, id);

    if (!definition) {
      return res.status(404).json({ message: 'Custom field definition not found' });
    }

    res.status(200).json(definition);
  } catch (error) {
    console.error('Error fetching custom field definition:', error);
    res.status(500).json({
      message: 'Failed to fetch custom field definition',
      error: error.message,
    });
  }
});

/**
 * POST /api/custom-fields/definitions
 * Create a new custom field definition
 */
router.post('/definitions', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const fieldData = req.body;

    // Validate required fields
    if (!fieldData.field_name || !fieldData.display_name) {
      return res.status(400).json({
        message: 'Missing required fields: field_name and display_name are required',
      });
    }

    const newDefinition = await customFieldService.createCustomFieldDefinition(userId, fieldData);

    res.status(201).json(newDefinition);
  } catch (error) {
    console.error('Error creating custom field definition:', error);
    res.status(500).json({
      message: 'Failed to create custom field definition',
      error: error.message,
    });
  }
});

/**
 * PUT /api/custom-fields/definitions/:id
 * Update an existing custom field definition
 */
router.put('/definitions/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const fieldData = req.body;

    const updatedDefinition = await customFieldService.updateCustomFieldDefinition(
      userId,
      id,
      fieldData
    );

    if (!updatedDefinition) {
      return res.status(404).json({ message: 'Custom field definition not found' });
    }

    res.status(200).json(updatedDefinition);
  } catch (error) {
    console.error('Error updating custom field definition:', error);
    res.status(500).json({
      message: 'Failed to update custom field definition',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/custom-fields/definitions/:id
 * Delete a custom field definition (soft delete)
 */
router.delete('/definitions/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await customFieldService.deleteCustomFieldDefinition(userId, id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting custom field definition:', error);
    res.status(500).json({
      message: 'Failed to delete custom field definition',
      error: error.message,
    });
  }
});

/**
 * PUT /api/custom-fields/definitions/reorder
 * Reorder custom field definitions
 * Body: { orderUpdates: [{id, display_order}, ...] }
 */
router.put('/definitions/reorder', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderUpdates } = req.body;

    if (!Array.isArray(orderUpdates)) {
      return res.status(400).json({ message: 'orderUpdates must be an array' });
    }

    await customFieldService.reorderCustomFieldDefinitions(userId, orderUpdates);

    res.status(200).json({ message: 'Custom fields reordered successfully' });
  } catch (error) {
    console.error('Error reordering custom field definitions:', error);
    res.status(500).json({
      message: 'Failed to reorder custom field definitions',
      error: error.message,
    });
  }
});

// ============================================================================
// CUSTOM FIELD VALUES ROUTES
// ============================================================================

/**
 * GET /api/custom-fields/:entityType/:entityId
 * Get custom field values for a specific entity
 */
router.get('/:entityType/:entityId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType, entityId } = req.params;

    // Validate entity type
    if (!['lead', 'contact', 'opportunity'].includes(entityType)) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    const customFields = await customFieldService.getCustomFieldValues(
      userId,
      entityType,
      entityId
    );

    res.status(200).json(customFields);
  } catch (error) {
    console.error('Error fetching custom field values:', error);
    res.status(500).json({
      message: 'Failed to fetch custom field values',
      error: error.message,
    });
  }
});

/**
 * PUT /api/custom-fields/:entityType/:entityId
 * Update custom field values for a specific entity
 */
router.put('/:entityType/:entityId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType, entityId } = req.params;
    const customFields = req.body;

    // Validate entity type
    if (!['lead', 'contact', 'opportunity'].includes(entityType)) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    // Validate custom field values
    const validation = await customFieldService.validateCustomFieldValues(
      userId,
      entityType,
      customFields
    );

    if (!validation.valid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const updatedEntity = await customFieldService.updateCustomFieldValues(
      userId,
      entityType,
      entityId,
      customFields
    );

    res.status(200).json(updatedEntity);
  } catch (error) {
    console.error('Error updating custom field values:', error);
    res.status(500).json({
      message: 'Failed to update custom field values',
      error: error.message,
    });
  }
});

/**
 * POST /api/custom-fields/validate
 * Validate custom field values without saving
 * Body: { entityType, customFields }
 */
router.post('/validate', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType, customFields } = req.body;

    // Validate entity type
    if (!['lead', 'contact', 'opportunity'].includes(entityType)) {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    const validation = await customFieldService.validateCustomFieldValues(
      userId,
      entityType,
      customFields
    );

    res.status(200).json(validation);
  } catch (error) {
    console.error('Error validating custom field values:', error);
    res.status(500).json({
      message: 'Failed to validate custom field values',
      error: error.message,
    });
  }
});

export default router;
