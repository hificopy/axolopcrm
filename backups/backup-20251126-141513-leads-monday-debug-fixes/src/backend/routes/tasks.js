import express from 'express';
import { supabase } from '../config/supabase-auth.js';
import { authenticateUser } from '../middleware/auth.js';

const authenticate = authenticateUser;

const router = express.Router();

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      group,
      status = 'Not Started',
      board,
      assigned_to,
      due_date,
      priority = 'medium',
      description,
      tags,
      custom_fields,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Task name is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          name,
          group,
          status,
          board,
          assigned_to,
          due_date,
          priority,
          description,
          tags,
          custom_fields,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/tasks/:id
 * Update a task (partial update)
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task (full update - same as PATCH for compatibility)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tasks/bulk-update
 * Bulk update multiple tasks
 */
router.post('/bulk-update', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Task IDs required' });
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .in('id', taskIds)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/tasks/bulk-delete
 * Bulk delete multiple tasks
 */
router.post('/bulk-delete', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Task IDs required' });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', taskIds)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, message: `${taskIds.length} tasks deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
