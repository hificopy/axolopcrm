import express from 'express';
import { supabase } from '../config/supabase-auth.js';
import workflowTemplatesService from '../services/workflow-templates-service.js';

const router = express.Router();

// ==========================================
// WORKFLOW CRUD OPERATIONS
// ==========================================

/**
 * GET /api/workflows
 * Get all workflows with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { active, search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('email_marketing_workflows')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (active !== undefined) {
      query = query.eq('is_active', active === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .select('*')
      .eq('id', id)
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
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      nodes = [],
      edges = [],
      is_active = false,
      execution_mode = 'sequential',
      triggers = []
    } = req.body;

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
        created_by: req.user?.id || null
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      nodes,
      edges,
      is_active,
      execution_mode,
      triggers
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (execution_mode !== undefined) updateData.execution_mode = execution_mode;

    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .update(updateData)
      .eq('id', id)
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
      await supabase
        .from('email_workflow_triggers')
        .delete()
        .eq('workflow_id', id);

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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
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
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .update({ is_active: true })
      .eq('id', id)
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
router.post('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('email_marketing_workflows')
      .update({ is_active: false })
      .eq('id', id)
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
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: original, error: fetchError } = await supabase
      .from('email_marketing_workflows')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError) throw fetchError;

    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const { data: duplicate, error: createError } = await supabase
      .from('email_marketing_workflows')
      .insert({
        name: `${original.name} (Copy)`,
        description: original.description,
        nodes: original.nodes,
        edges: original.edges,
        is_active: false,
        execution_mode: original.execution_mode,
        created_by: req.user?.id || null
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
        is_active: false
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
// WORKFLOW TEMPLATES
// ==========================================

/**
 * GET /api/workflows/templates
 * Get all workflow templates
 */
router.get('/templates', async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (difficulty) filters.difficulty_level = difficulty;

    const templates = await workflowTemplatesService.getAllTemplates(filters);

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/templates/:id/use
 * Create a workflow from a template
 */
router.post('/templates/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    const { customizations = {} } = req.body;

    const workflow = await workflowTemplatesService.createWorkflowFromTemplate(id, customizations);

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/workflows/templates/initialize
 * Initialize template library (admin only)
 */
router.post('/templates/initialize', async (req, res) => {
  try {
    await workflowTemplatesService.initializeTemplateLibrary();

    res.json({
      success: true,
      message: 'Template library initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// WORKFLOW EXECUTIONS
// ==========================================

/**
 * GET /api/workflows/:id/executions
 * Get execution history for a workflow
 */
router.get('/:id/executions', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

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
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { contact_id, lead_id, email_address, trigger_data = {} } = req.body;

    const { data: workflow, error: workflowError } = await supabase
      .from('email_marketing_workflows')
      .select('id, name, is_active')
      .eq('id', id)
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
 * GET /api/workflows/:id/analytics
 * Get analytics for a workflow
 */
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

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
        : 0
    };

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
