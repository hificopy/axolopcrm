import { supabase } from '../config/supabase-auth.js';
import emailService from './email-service.js';
import leadService from './leadService.js';
import contactService from './contactService.js';
import opportunityService from './opportunityService.js';

/**
 * Workflow Execution Engine
 * Processes and executes email marketing workflows with full CRM integration
 */
class WorkflowExecutionEngine {
  constructor() {
    this.runningExecutions = new Map();
    this.isRunning = false;
  }

  /**
   * Start the workflow execution engine
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Workflow execution engine is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Workflow Execution Engine started');

    // Start processing loops
    this.processExecutionsLoop();
    this.processDelaysLoop();
    this.checkGoalsLoop();
  }

  /**
   * Stop the workflow execution engine
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Workflow Execution Engine stopped');
  }

  /**
   * Main execution processing loop
   */
  async processExecutionsLoop() {
    while (this.isRunning) {
      try {
        await this.processPendingExecutions();
      } catch (error) {
        console.error('Error in execution loop:', error);
      }

      // Wait 5 seconds before next check
      await this.sleep(5000);
    }
  }

  /**
   * Delay processing loop
   */
  async processDelaysLoop() {
    while (this.isRunning) {
      try {
        await this.processDelayedExecutions();
      } catch (error) {
        console.error('Error in delay loop:', error);
      }

      // Wait 10 seconds before next check
      await this.sleep(10000);
    }
  }

  /**
   * Goal checking loop
   */
  async checkGoalsLoop() {
    while (this.isRunning) {
      try {
        await this.processGoalAchievements();
      } catch (error) {
        console.error('Error in goal loop:', error);
      }

      // Wait 30 seconds before next check
      await this.sleep(30000);
    }
  }

  /**
   * Process pending workflow executions
   */
  async processPendingExecutions() {
    const { data: executions, error } = await supabase.rpc(
      'get_pending_workflow_executions',
      { p_limit: 10 }
    );

    if (error) {
      console.error('Error fetching pending executions:', error);
      return;
    }

    if (!executions || executions.length === 0) {
      return;
    }

    console.log(`📋 Processing ${executions.length} pending workflow executions`);

    for (const execution of executions) {
      try {
        await this.executeWorkflow(execution);
      } catch (error) {
        console.error(`Error executing workflow ${execution.execution_id}:`, error);
        await this.markExecutionAsFailed(execution.execution_id, error.message);
      }
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(execution) {
    const { execution_id, workflow_id, nodes, edges, trigger_data } = execution;

    // Update status to running
    await supabase
      .from('email_workflow_executions')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', execution_id);

    console.log(`▶️  Executing workflow: ${execution.workflow_name} (${execution_id})`);

    // Find the trigger node (starting point)
    const triggerNode = nodes.find(node => node.type === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow');
    }

    // Build execution context
    const context = {
      execution_id,
      workflow_id,
      contact_id: execution.contact_id,
      lead_id: execution.lead_id,
      email_address: execution.email_address,
      trigger_data,
      variables: {},
      executed_nodes: [],
      goals: []
    };

    // Execute workflow from trigger node
    await this.executeNode(triggerNode, nodes, edges, context);

    // Mark as completed
    await supabase
      .from('email_workflow_executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        executed_nodes: context.executed_nodes
      })
      .eq('id', execution_id);

    // Update workflow analytics
    await supabase
      .from('email_marketing_workflows')
      .update({
        successful_executions: supabase.rpc('increment', { increment_by: 1 })
      })
      .eq('id', workflow_id);

    console.log(`✅ Workflow execution completed: ${execution_id}`);
  }

  /**
   * Execute a single node
   */
  async executeNode(node, allNodes, allEdges, context) {
    const { execution_id } = context;

    // Check if this node has already been executed (avoid loops)
    if (context.executed_nodes.some(n => n.node_id === node.id)) {
      console.log(`⏭️  Skipping already executed node: ${node.id}`);
      return;
    }

    // Add to executed nodes
    context.executed_nodes.push({
      node_id: node.id,
      node_type: node.type,
      timestamp: new Date().toISOString()
    });

    console.log(`🔄 Executing node: ${node.type} (${node.id})`);

    // Execute based on node type
    switch (node.type) {
      case 'trigger':
        // Trigger nodes don't execute actions, just mark as executed
        break;

      case 'action':
        await this.executeAction(node, context);
        break;

      case 'condition':
        const conditionResult = await this.evaluateCondition(node, context);
        // Record condition result
        await supabase.from('email_workflow_conditions').insert({
          execution_id,
          node_id: node.id,
          condition_type: node.data.conditionType,
          condition_config: node.data,
          result: conditionResult
        });
        // Find the appropriate next node based on condition result
        const nextEdges = allEdges.filter(e => e.source === node.id);
        const nextEdge = nextEdges.find(e => {
          // 'yes' path or 'no' path based on condition result
          if (conditionResult) {
            return !e.label || e.label.toLowerCase().includes('yes') || e.label.toLowerCase().includes('true');
          } else {
            return e.label && (e.label.toLowerCase().includes('no') || e.label.toLowerCase().includes('false'));
          }
        }) || nextEdges[0]; // Fallback to first edge

        if (nextEdge) {
          const nextNode = allNodes.find(n => n.id === nextEdge.target);
          if (nextNode) {
            await this.executeNode(nextNode, allNodes, allEdges, context);
          }
        }
        return; // Early return since we handle the next node above

      case 'delay':
        await this.handleDelay(node, context);
        return; // Delay pauses execution, will resume later

      case 'goal':
        // Register the goal
        context.goals.push({
          node_id: node.id,
          goal_type: node.data.goalType,
          skip_to_node_id: node.data.skipToNodeId
        });
        break;

      case 'split':
        // A/B split testing
        const splitPath = await this.handleSplitTest(node, context);
        const splitEdges = allEdges.filter(e => e.source === node.id);
        const splitEdge = splitPath === 'A'
          ? splitEdges.find(e => e.label && e.label.includes('A'))
          : splitEdges.find(e => e.label && e.label.includes('B'));

        if (splitEdge) {
          const splitNode = allNodes.find(n => n.id === splitEdge.target);
          if (splitNode) {
            await this.executeNode(splitNode, allNodes, allEdges, context);
          }
        }
        return;

      case 'exit':
        // End workflow execution
        console.log(`🛑 Workflow exit: ${node.data.reason || 'completed'}`);
        return;

      default:
        console.warn(`Unknown node type: ${node.type}`);
    }

    // Find next node(s) to execute
    const outgoingEdges = allEdges.filter(edge => edge.source === node.id);

    for (const edge of outgoingEdges) {
      const nextNode = allNodes.find(n => n.id === edge.target);
      if (nextNode) {
        await this.executeNode(nextNode, allNodes, allEdges, context);
      }
    }
  }

  /**
   * Execute an action node
   */
  async executeAction(node, context) {
    const { execution_id } = context;
    const { actionType, ...config } = node.data;

    let result = null;
    let status = 'success';
    let errorMessage = null;

    try {
      switch (actionType) {
        case 'EMAIL':
          result = await this.sendEmail(config, context);
          break;

        case 'SMS':
          result = await this.sendSMS(config, context);
          break;

        case 'TAG_ADD':
          result = await this.addTag(config, context);
          break;

        case 'TAG_REMOVE':
          result = await this.removeTag(config, context);
          break;

        case 'FIELD_UPDATE':
          result = await this.updateField(config, context);
          break;

        case 'TASK_CREATE':
          result = await this.createTask(config, context);
          break;

        case 'CONTACT_CREATE':
          result = await this.createContact(config, context);
          break;

        case 'OPPORTUNITY_CREATE':
          result = await this.createOpportunity(config, context);
          break;

        case 'OPPORTUNITY_UPDATE':
          result = await this.updateOpportunity(config, context);
          break;

        case 'PIPELINE_MOVE':
          result = await this.movePipelineStage(config, context);
          break;

        case 'LEAD_SCORE_UPDATE':
          result = await this.updateLeadScore(config, context);
          break;

        case 'ASSIGN_TO_USER':
          result = await this.assignToUser(config, context);
          break;

        case 'NOTIFICATION':
          result = await this.sendNotification(config, context);
          break;

        case 'WEBHOOK':
          result = await this.callWebhook(config, context);
          break;

        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      status = 'failed';
      errorMessage = error.message;
      console.error(`Action failed: ${actionType}`, error);
    }

    // Record action execution
    await supabase.from('email_workflow_actions').insert({
      execution_id,
      node_id: node.id,
      action_type: actionType,
      action_config: config,
      status,
      result,
      error_message: errorMessage
    });

    console.log(`✓ Action executed: ${actionType} - ${status}`);
  }

  /**
   * Evaluate a condition node
   */
  async evaluateCondition(node, context) {
    const { conditionType, field, operator, value, tagName, scoreOperator, scoreValue } = node.data;

    switch (conditionType) {
      case 'FIELD_COMPARE':
        return await this.compareField(field, operator, value, context);

      case 'TAG_CHECK':
        return await this.checkTag(tagName, context);

      case 'EMAIL_STATUS':
        return await this.checkEmailStatus(node.data, context);

      case 'LEAD_SCORE':
        return await this.checkLeadScore(scoreOperator, scoreValue, context);

      case 'CUSTOM_LOGIC':
        return await this.evaluateCustomLogic(node.data, context);

      default:
        console.warn(`Unknown condition type: ${conditionType}`);
        return false;
    }
  }

  /**
   * Handle delay node
   */
  async handleDelay(node, context) {
    const { execution_id } = context;
    const { delayType, delayAmount, delayUnit, waitUntilDate, waitUntilTime } = node.data;

    let scheduledResumeAt;

    switch (delayType) {
      case 'TIME_DELAY':
        const multiplier = {
          minutes: 60 * 1000,
          hours: 60 * 60 * 1000,
          days: 24 * 60 * 60 * 1000,
          weeks: 7 * 24 * 60 * 60 * 1000
        }[delayUnit];
        scheduledResumeAt = new Date(Date.now() + (delayAmount * multiplier));
        break;

      case 'WAIT_UNTIL':
        scheduledResumeAt = new Date(`${waitUntilDate}T${waitUntilTime}`);
        break;

      case 'WAIT_FOR_EVENT':
        // Event-based delays are handled differently
        scheduledResumeAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // Default 24 hours
        break;
    }

    // Create delay record
    await supabase.from('email_workflow_delays').insert({
      execution_id,
      node_id: node.id,
      delay_type: delayType,
      delay_amount: delayAmount,
      delay_unit: delayUnit,
      wait_until_date: delayType === 'WAIT_UNTIL' ? scheduledResumeAt : null,
      scheduled_resume_at: scheduledResumeAt,
      status: 'waiting'
    });

    // Update execution status to paused
    await supabase
      .from('email_workflow_executions')
      .update({ status: 'waiting', current_node_id: node.id })
      .eq('id', execution_id);

    console.log(`⏸️  Execution paused until: ${scheduledResumeAt.toISOString()}`);
  }

  /**
   * Handle split test node
   */
  async handleSplitTest(node, context) {
    const { splitPercentageA = 50, splitPercentageB = 50 } = node.data;

    // Random split based on percentages
    const random = Math.random() * 100;
    const path = random < splitPercentageA ? 'A' : 'B';

    console.log(`🔀 Split test: Path ${path} chosen (${random.toFixed(2)}%)`);
    return path;
  }

  /**
   * Process delayed executions that are ready to resume
   */
  async processDelayedExecutions() {
    const { data: delays, error } = await supabase.rpc('get_delayed_executions_to_resume');

    if (error || !delays || delays.length === 0) {
      return;
    }

    console.log(`⏰ Resuming ${delays.length} delayed executions`);

    for (const delay of delays) {
      try {
        // Mark delay as completed
        await supabase
          .from('email_workflow_delays')
          .update({ status: 'completed', resumed_at: new Date().toISOString() })
          .eq('execution_id', delay.execution_id)
          .eq('node_id', delay.node_id);

        // Get the execution details
        const { data: execution } = await supabase
          .from('email_workflow_executions')
          .select('*, workflows:workflow_id(*)')
          .eq('id', delay.execution_id)
          .single();

        if (!execution) continue;

        // Get workflow nodes and edges
        const nodes = execution.workflows.nodes;
        const edges = execution.workflows.edges;

        // Find the delay node
        const delayNode = nodes.find(n => n.id === delay.node_id);
        if (!delayNode) continue;

        // Resume from the next node after the delay
        const outgoingEdges = edges.filter(e => e.source === delayNode.id);

        const context = {
          execution_id: delay.execution_id,
          workflow_id: delay.workflow_id,
          contact_id: execution.contact_id,
          lead_id: execution.lead_id,
          email_address: execution.email_address,
          trigger_data: execution.trigger_data,
          variables: {},
          executed_nodes: execution.executed_nodes || [],
          goals: []
        };

        // Update status back to running
        await supabase
          .from('email_workflow_executions')
          .update({ status: 'running' })
          .eq('id', delay.execution_id);

        // Continue execution
        for (const edge of outgoingEdges) {
          const nextNode = nodes.find(n => n.id === edge.target);
          if (nextNode) {
            await this.executeNode(nextNode, nodes, edges, context);
          }
        }
      } catch (error) {
        console.error(`Error resuming execution ${delay.execution_id}:`, error);
      }
    }
  }

  /**
   * Process goal achievements
   */
  async processGoalAchievements() {
    // Check for executions with goals
    const { data: executions, error } = await supabase
      .from('email_workflow_executions')
      .select('*')
      .eq('status', 'running')
      .not('executed_nodes', 'is', null);

    if (error || !executions) return;

    for (const execution of executions) {
      // Check if any goals were registered and achieved
      // Implementation would check for specific events (email clicks, form submissions, etc.)
      // and skip ahead in the workflow if the goal is met
    }
  }

  // ============================================
  // ACTION IMPLEMENTATIONS
  // ============================================

  async sendEmail(config, context) {
    const { emailTemplateId, subject, body } = config;
    const { email_address, contact_id, lead_id } = context;

    if (!email_address) {
      throw new Error('No email address available');
    }

    // Use email service to send
    const result = await emailService.sendCampaignEmail({
      to: email_address,
      subject: subject || 'Automated Email',
      body: body || '',
      templateId: emailTemplateId,
      contactId: contact_id,
      leadId: lead_id
    });

    return { email_sent: true, message_id: result.messageId };
  }

  async sendSMS(config, context) {
    // SMS implementation
    const { phoneNumber, message } = config;
    console.log(`📱 SMS would be sent to ${phoneNumber}: ${message}`);
    return { sms_sent: true };
  }

  async addTag(config, context) {
    const { tagName } = config;
    const { contact_id, lead_id } = context;

    if (lead_id) {
      // Add tag to lead
      await supabase
        .from('leads')
        .update({
          tags: supabase.rpc('array_append', { arr: 'tags', elem: tagName })
        })
        .eq('id', lead_id);
    }

    if (contact_id) {
      // Add tag to contact
      await supabase
        .from('contacts')
        .update({
          tags: supabase.rpc('array_append', { arr: 'tags', elem: tagName })
        })
        .eq('id', contact_id);
    }

    return { tag_added: tagName };
  }

  async removeTag(config, context) {
    const { tagName } = config;
    const { contact_id, lead_id } = context;

    if (lead_id) {
      await supabase
        .from('leads')
        .update({
          tags: supabase.rpc('array_remove', { arr: 'tags', elem: tagName })
        })
        .eq('id', lead_id);
    }

    if (contact_id) {
      await supabase
        .from('contacts')
        .update({
          tags: supabase.rpc('array_remove', { arr: 'tags', elem: tagName })
        })
        .eq('id', contact_id);
    }

    return { tag_removed: tagName };
  }

  async updateField(config, context) {
    const { fieldName, fieldValue } = config;
    const { contact_id, lead_id } = context;

    const updateData = { [fieldName]: fieldValue };

    if (lead_id) {
      await supabase.from('leads').update(updateData).eq('id', lead_id);
    }

    if (contact_id) {
      await supabase.from('contacts').update(updateData).eq('id', contact_id);
    }

    return { field_updated: fieldName, value: fieldValue };
  }

  async createTask(config, context) {
    const { taskTitle, taskDescription, dueDate, assignedTo } = config;

    const { data, error } = await supabase.from('tasks').insert({
      title: taskTitle,
      description: taskDescription,
      due_date: dueDate,
      assigned_to: assignedTo,
      contact_id: context.contact_id,
      lead_id: context.lead_id,
      status: 'pending'
    }).select().single();

    if (error) throw error;
    return { task_created: data.id };
  }

  async createContact(config, context) {
    const contactData = {
      email: context.email_address,
      ...config
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();

    if (error) throw error;
    context.contact_id = data.id; // Update context
    return { contact_created: data.id };
  }

  async createOpportunity(config, context) {
    const { title, value, stage, closeDate } = config;

    const { data, error } = await supabase.from('opportunities').insert({
      title,
      value,
      stage,
      close_date: closeDate,
      contact_id: context.contact_id,
      lead_id: context.lead_id,
      status: 'open'
    }).select().single();

    if (error) throw error;
    return { opportunity_created: data.id };
  }

  async updateOpportunity(config, context) {
    const { opportunityId, updates } = config;

    const { error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', opportunityId);

    if (error) throw error;
    return { opportunity_updated: opportunityId };
  }

  async movePipelineStage(config, context) {
    const { opportunityId, newStage } = config;

    const { error } = await supabase
      .from('opportunities')
      .update({ stage: newStage })
      .eq('id', opportunityId);

    if (error) throw error;
    return { stage_changed: newStage };
  }

  async updateLeadScore(config, context) {
    const { scoreChange, operation } = config; // operation: 'add', 'set', 'subtract'
    const { lead_id } = context;

    if (!lead_id) {
      throw new Error('No lead ID available');
    }

    let updateQuery;
    if (operation === 'set') {
      updateQuery = { lead_score: scoreChange };
    } else if (operation === 'add') {
      updateQuery = { lead_score: supabase.rpc('increment', { increment_by: scoreChange }) };
    } else if (operation === 'subtract') {
      updateQuery = { lead_score: supabase.rpc('decrement', { decrement_by: scoreChange }) };
    }

    const { error } = await supabase
      .from('leads')
      .update(updateQuery)
      .eq('id', lead_id);

    if (error) throw error;
    return { score_updated: true };
  }

  async assignToUser(config, context) {
    const { userId } = config;
    const { contact_id, lead_id } = context;

    if (lead_id) {
      await supabase.from('leads').update({ assigned_to: userId }).eq('id', lead_id);
    }

    if (contact_id) {
      await supabase.from('contacts').update({ assigned_to: userId }).eq('id', contact_id);
    }

    return { assigned_to: userId };
  }

  async sendNotification(config, context) {
    const { recipientUserId, message } = config;

    await supabase.from('notifications').insert({
      user_id: recipientUserId,
      message,
      type: 'workflow',
      related_entity_id: context.execution_id
    });

    return { notification_sent: true };
  }

  async callWebhook(config, context) {
    const { webhookUrl, webhookMethod, webhookHeaders, webhookBody } = config;

    const response = await fetch(webhookUrl, {
      method: webhookMethod || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookHeaders || {})
      },
      body: JSON.stringify(webhookBody || context)
    });

    return {
      webhook_called: true,
      status: response.status,
      response: await response.text()
    };
  }

  // ============================================
  // CONDITION EVALUATIONS
  // ============================================

  async compareField(field, operator, value, context) {
    // Get field value from contact or lead
    let fieldValue;

    if (context.contact_id) {
      const { data } = await supabase
        .from('contacts')
        .select(field)
        .eq('id', context.contact_id)
        .single();
      fieldValue = data?.[field];
    } else if (context.lead_id) {
      const { data } = await supabase
        .from('leads')
        .select(field)
        .eq('id', context.lead_id)
        .single();
      fieldValue = data?.[field];
    }

    // Evaluate operator
    switch (operator) {
      case 'equals': return fieldValue == value;
      case 'not_equals': return fieldValue != value;
      case 'contains': return String(fieldValue).includes(value);
      case 'not_contains': return !String(fieldValue).includes(value);
      case 'greater_than': return Number(fieldValue) > Number(value);
      case 'less_than': return Number(fieldValue) < Number(value);
      case 'is_empty': return !fieldValue || fieldValue === '';
      case 'is_not_empty': return !!fieldValue && fieldValue !== '';
      default: return false;
    }
  }

  async checkTag(tagName, context) {
    if (context.lead_id) {
      const { data } = await supabase
        .from('leads')
        .select('tags')
        .eq('id', context.lead_id)
        .single();
      return data?.tags?.includes(tagName) || false;
    }

    if (context.contact_id) {
      const { data } = await supabase
        .from('contacts')
        .select('tags')
        .eq('id', context.contact_id)
        .single();
      return data?.tags?.includes(tagName) || false;
    }

    return false;
  }

  async checkEmailStatus(config, context) {
    const { emailStatus } = config; // 'opened', 'clicked', 'bounced'
    const { email_address } = context;

    const { data } = await supabase
      .from('email_events')
      .select('event_type')
      .eq('email', email_address)
      .eq('event_type', emailStatus)
      .limit(1);

    return data && data.length > 0;
  }

  async checkLeadScore(operator, scoreValue, context) {
    if (!context.lead_id) return false;

    const { data } = await supabase
      .from('leads')
      .select('lead_score')
      .eq('id', context.lead_id)
      .single();

    const currentScore = data?.lead_score || 0;

    switch (operator) {
      case 'greater_than': return currentScore > Number(scoreValue);
      case 'less_than': return currentScore < Number(scoreValue);
      case 'equals': return currentScore === Number(scoreValue);
      default: return false;
    }
  }

  async evaluateCustomLogic(config, context) {
    // Custom logic evaluation
    // Can be extended for complex business rules
    return true;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  async markExecutionAsFailed(executionId, errorMessage) {
    await supabase
      .from('email_workflow_executions')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', executionId);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const workflowExecutionEngine = new WorkflowExecutionEngine();

export default workflowExecutionEngine;
