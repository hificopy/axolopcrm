import express from 'express';
import userPreferencesService from '../services/userPreferencesService.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractAgencyContext, requireEditPermissions } from '../middleware/agency-access.js';

const router = express.Router();

// Apply agency context extraction to all routes
router.use(extractAgencyContext);

// ========================================
// USER PREFERENCES ROUTES
// ========================================

/**
 * GET /api/user-preferences
 * Get user preferences
 */
router.get('/', protect, async (req, res) => {
  try {
    const result = await userPreferencesService.getUserPreferences(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

/**
 * PUT /api/user-preferences
 * Update a specific preference
 */
router.put('/', protect, requireEditPermissions, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const result = await userPreferencesService.updatePreference(req.user.id, key, value);
    res.json(result);
  } catch (error) {
    console.error('Error updating preference:', error);
    res.status(500).json({ error: 'Failed to update preference' });
  }
});

// ========================================
// USER SETTINGS ROUTES
// ========================================

/**
 * GET /api/user-preferences/settings
 * Get user settings (theme, notifications, etc.)
 */
router.get('/settings', protect, async (req, res) => {
  try {
    const result = await userPreferencesService.getUserSettings(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

/**
 * PUT /api/user-preferences/settings
 * Update user settings
 */
router.put('/settings', protect, requireEditPermissions, async (req, res) => {
  try {
    const result = await userPreferencesService.updateUserSettings(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ========================================
// TODOS ROUTES
// ========================================

/**
 * GET /api/user-preferences/todos
 * Get all user todos
 */
router.get('/todos', protect, async (req, res) => {
  try {
    const result = await userPreferencesService.getUserTodos(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Error getting todos:', error);
    res.status(500).json({ error: 'Failed to get todos' });
  }
});

/**
 * POST /api/user-preferences/todos
 * Create a new todo
 */
router.post('/todos', protect, requireEditPermissions, async (req, res) => {
  try {
    const result = await userPreferencesService.createTodo(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * PUT /api/user-preferences/todos/:id
 * Update a todo
 */
router.put('/todos/:id', protect, requireEditPermissions, async (req, res) => {
  try {
    const result = await userPreferencesService.updateTodo(req.user.id, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

/**
 * DELETE /api/user-preferences/todos/:id
 * Delete a todo
 */
router.delete('/todos/:id', protect, requireEditPermissions, async (req, res) => {
  try {
    const result = await userPreferencesService.deleteTodo(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

/**
 * POST /api/user-preferences/todos/:id/toggle
 * Toggle todo completion
 */
router.post('/todos/:id/toggle', protect, requireEditPermissions, async (req, res) => {
  try {
    const result = await userPreferencesService.toggleTodoCompletion(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

/**
 * PUT /api/user-preferences/todos/bulk
 * Bulk update todos (for reordering)
 */
router.put('/todos/bulk', protect, requireEditPermissions, async (req, res) => {
  try {
    const { todos } = req.body;
    if (!Array.isArray(todos)) {
      return res.status(400).json({ error: 'Todos array is required' });
    }

    const result = await userPreferencesService.bulkUpdateTodos(req.user.id, todos);
    res.json(result);
  } catch (error) {
    console.error('Error bulk updating todos:', error);
    res.status(500).json({ error: 'Failed to bulk update todos' });
  }
});

export default router;
