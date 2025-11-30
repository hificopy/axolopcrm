import express from 'express';
import { supabase } from '../config/supabase-auth.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// WORKFLOW CRUD OPERATIONS
// ==========================================

/**
 * GET /api/workflows
 * Get all workflows with optional filtering
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { active, search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('email_marketing_workflows')
      .select('*', { count: 'exact' })
      .eq('created_by', userId) // Only user's own workflows
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Filter by active status
    if (active !== undefined) {
      query = query.eq('is_active', active === 'true');
    }

    // Search by name or description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflows/:id
 * Get a specific workflow by ID
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId) // Only user's own workflow
      .is('deleted_at', null)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Get associated triggers
    const { data: triggers } = await supabase
      .from('email_workflow_triggers')
      .select('*')
      .eq('workflow_id', id);

    // Get execution statistics
    const { data: stats } = await supabase
      .from('email_workflow_executions')
      .select('status')
      .eq('workflow_id', id);

    const executionStats = {
      total: stats?.length || 0,
      pending: stats?.filter(s => s.status === 'pending').length || 0,
      running: stats?.filter(s => s.status === 'running').length || 0,
      completed: stats?.filter(s => s.status === 'completed').length || 0,
      failed: stats?.filter(s => s.status === 'failed').length || 0
    };

    res.json({
      success: true,
      data: {
        ...data,
        triggers: triggers || [],
        executionStats
      }
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows
 * Create a new workflow
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      nodes = [],
      edges = [],
      is_active = false,
      execution_mode = 'sequential',
      triggers = []
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required'
      });
    }

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .insert({
        name,
        description,
        nodes,
        edges,
        is_active,
        execution_mode,
        created_by: userId // Associate with user
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // Create triggers if provided
    if (triggers && triggers.length > 0) {
      const triggersToInsert = triggers.map(trigger => ({
        workflow_id: workflow.id,
        trigger_type: trigger.trigger_type || trigger.triggerType,
        config: trigger.config || {},
        filters: trigger.filters || {},
        is_active: trigger.is_active !== undefined ? trigger.is_active : true
      }));

      const { error: triggersError } = await supabase
        .from('email_workflow_triggers')
        .insert(triggersToInsert);

      if (triggersError) {
        console.error('Error creating triggers:', triggersError);
      }
    }

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/workflows/:id
 * Update an existing workflow
 */
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      name,
      description,
      nodes,
      edges,
      is_active,
      execution_mode,
      triggers
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (execution_mode !== undefined) updateData.execution_mode = execution_mode;

    // Update workflow (only if user owns it)
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', userId) // Only update user's own workflow
      .is('deleted_at', null)
      .select()
      .single();

    if (workflowError) throw workflowError;

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Update triggers if provided
    if (triggers !== undefined) {
      // Delete existing triggers
      await supabase
        .from('email_workflow_triggers')
        .delete()
        .eq('workflow_id', id);

      // Insert new triggers
      if (triggers.length > 0) {
        const triggersToInsert = triggers.map(trigger => ({
          workflow_id: id,
          trigger_type: trigger.trigger_type || trigger.triggerType,
          config: trigger.config || {},
          filters: trigger.filters || {},
          is_active: trigger.is_active !== undefined ? trigger.is_active : true
        }));

        const { error: triggersError } = await supabase
          .from('email_workflow_triggers')
          .insert(triggersToInsert);

        if (triggersError) {
          console.error('Error updating triggers:', triggersError);
        }
      }
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/workflows/:id
 * Soft delete a workflow
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Soft delete by setting deleted_at timestamp (only user's own workflow)
    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('created_by', userId) // Only delete user's own workflow
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/:id/activate
 * Activate a workflow
 */
router.post('/:id/activate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .update({ is_active: true })
      .eq('id', id)
      .eq('created_by', userId) // Only activate user's own workflow
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error activating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/:id/deactivate
 * Deactivate a workflow
 */
router.post('/:id/deactivate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .update({ is_active: false })
      .eq('id', id)
      .eq('created_by', userId) // Only deactivate user's own workflow
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error deactivating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/:id/duplicate
 * Duplicate a workflow
 */
router.post('/:id/duplicate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get original workflow (only user's own)
    const { data: original, error: fetchError } = await supabase
      .from('email_marketing_workflows')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId) // Only duplicate user's own workflow
      .is('deleted_at', null)
      .single();

    if (fetchError) throw fetchError;

    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Create duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('email_marketing_workflows')
      .insert({
        name: `${original.name} (Copy)`,
        description: original.description,
        nodes: original.nodes,
        edges: original.edges,
        is_active: false, // Start inactive
        execution_mode: original.execution_mode,
        created_by: userId // Associate with user
      })
      .select()
      .single();

    if (createError) throw createError;

    // Duplicate triggers
    const { data: triggers } = await supabase
      .from('email_workflow_triggers')
      .select('*')
      .eq('workflow_id', id);

    if (triggers && triggers.length > 0) {
      const duplicateTriggers = triggers.map(trigger => ({
        workflow_id: duplicate.id,
        trigger_type: trigger.trigger_type,
        config: trigger.config,
        filters: trigger.filters,
        is_active: false // Start inactive
      }));

      await supabase
        .from('email_workflow_triggers')
        .insert(duplicateTriggers);
    }

    res.status(201).json({
      success: true,
      data: duplicate
    });
  } catch (error) {
    console.error('Error duplicating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// WORKFLOW EXECUTION OPERATIONS
// ==========================================

/**
 * GET /api/workflows/:id/executions
 * Get execution history for a workflow
 */
router.get('/:id/executions', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    // First verify user owns this workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .select('id')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    let query = supabase
      .from('email_workflow_executions')
      .select('*', { count: 'exact' })
      .eq('workflow_id', id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/:id/execute
 * Manually trigger workflow execution
 */
router.post('/:id/execute', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { contact_id, lead_id, email_address, trigger_data = {} } = req.body;

    // Verify workflow exists, is active, and user owns it
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .select('id, name, is_active')
      .eq('id', id)
      .eq('created_by', userId) // Only execute user's own workflow
      .is('deleted_at', null)
      .single();

    if (workflowError) throw workflowError;

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    if (!workflow.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Workflow is not active'
      });
    }

    // Use the database function to queue execution
    const { data, error } = await supabase.rpc('queue_workflow_execution', {
      p_workflow_id: id,
      p_triggered_by: 'manual',
      p_trigger_event: 'manual_trigger',
      p_trigger_data: trigger_data,
      p_contact_id: contact_id || null,
      p_lead_id: lead_id || null,
      p_email_address: email_address || null
    });

    if (error) throw error;

    res.json({
      success: true,
      execution_id: data,
      message: 'Workflow execution queued successfully'
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/workflows/:workflowId/executions/:executionId
 * Get detailed execution information
 */
router.get('/:workflowId/executions/:executionId', authenticateUser, async (req, res) => {
  try {
    const { workflowId, executionId } = req.params;
    const userId = req.user.id;

    // First verify user owns this workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .select('id')
      .eq('id', workflowId)
      .eq('created_by', userId)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Get execution details
    const { data: execution, error: executionError } = await supabase
      .from('email_workflow_executions')
      .select('*')
      .eq('id', executionId)
      .eq('workflow_id', workflowId)
      .single();

    if (executionError) throw executionError;

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    // Get actions performed
    const { data: actions } = await supabase
      .from('email_workflow_actions')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true });

    // Get conditions evaluated
    const { data: conditions } = await supabase
      .from('email_workflow_conditions')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true });

    // Get delays
    const { data: delays } = await supabase
      .from('email_workflow_delays')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true });

    res.json({
      success: true,
      data: {
        ...execution,
        actions: actions || [],
        conditions: conditions || [],
        delays: delays || []
      }
    });
  } catch (error) {
    console.error('Error fetching execution details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/:workflowId/executions/:executionId/cancel
 * Cancel a running execution
 */
router.post('/:workflowId/executions/:executionId/cancel', authenticateUser, async (req, res) => {
  try {
    const { workflowId, executionId } = req.params;
    const userId = req.user.id;

    // First verify user owns this workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .select('id')
      .eq('id', workflowId)
      .eq('created_by', userId)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const { data, error } = await supabase
      .from('email_workflow_executions')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)
      .eq('workflow_id', workflowId)
      .in('status', ['pending', 'running'])
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error cancelling execution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// WORKFLOW ANALYTICS
// ==========================================

/**
 * GET /api/workflows/:id/analytics
 * Get analytics for a workflow
 */
router.get('/:id/analytics', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { start_date, end_date } = req.query;

    // First verify user owns this workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .select('id')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    let query = supabase
      .from('email_workflow_executions')
      .select('*')
      .eq('workflow_id', id);

    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data: executions, error } = await query;

    if (error) throw error;

    // Calculate analytics
    const analytics = {
      total_executions: executions.length,
      by_status: {
        pending: executions.filter(e => e.status === 'pending').length,
        running: executions.filter(e => e.status === 'running').length,
        completed: executions.filter(e => e.status === 'completed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        cancelled: executions.filter(e => e.status === 'cancelled').length
      },
      success_rate: executions.length > 0
        ? (executions.filter(e => e.status === 'completed').length / executions.length * 100).toFixed(2)
        : 0,
      average_retry_count: executions.length > 0
        ? (executions.reduce((sum, e) => sum + (e.retry_count || 0), 0) / executions.length).toFixed(2)
        : 0,
      by_trigger: {}
    };

    // Group by trigger type
    executions.forEach(execution => {
      const trigger = execution.triggered_by || 'unknown';
      analytics.by_trigger[trigger] = (analytics.by_trigger[trigger] || 0) + 1;
    });

    // Get action statistics
    const { data: actions } = await supabase
      .from('email_workflow_actions')
      .select('action_type, status')
      .in('execution_id', executions.map(e => e.id));

    analytics.actions = {
      total: actions?.length || 0,
      by_type: {},
      by_status: {
        success: actions?.filter(a => a.status === 'success').length || 0,
        failed: actions?.filter(a => a.status === 'failed').length || 0,
        pending: actions?.filter(a => a.status === 'pending').length || 0,
        skipped: actions?.filter(a => a.status === 'skipped').length || 0
      }
    };

    actions?.forEach(action => {
      const type = action.action_type || 'unknown';
      analytics.actions.by_type[type] = (analytics.actions.by_type[type] || 0) + 1;
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching workflow analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
