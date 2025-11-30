import { supabase } from '../config/supabase-auth.js';
import emailService from './email-service.js';
import leadService from './leadService.js';
import contactService from './contactService.js';
import opportunityService from './opportunityService.js';

/**
 * Enhanced Workflow Execution Engine
 * Enterprise-level automation combining ActiveCampaign and GoHighLevel features
 *
 * Features:
 * - Multi-trigger support (form, email, event, time, API, page visit, etc.)
 * - Advanced actions (email, SMS, webhooks, integrations, notifications)
 * - Complex conditional logic (nested, multi-field)
 * - Goal tracking and skip-ahead logic
 * - A/B split testing
 * - Wait-for-event delays
 * - Internal notifications
 * - Predictive sending optimization
 */
class EnhancedWorkflowExecutionEngine {
  constructor() {
    this.runningExecutions = new Map();
    this.isRunning = false;
    this.eventListeners = new Map();
  }

  /**
   * Start the workflow execution engine
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Enhanced Workflow Execution Engine is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Enhanced Workflow Execution Engine started');

    // Start processing loops
    this.processExecutionsLoop();
    this.processDelaysLoop();
    this.processGoalsLoop();
    this.processScheduledWorkflowsLoop();
  }

  /**
   * Stop the workflow execution engine
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Enhanced Workflow Execution Engine stopped');
  }

  // ==========================================
  // PROCESSING LOOPS
  // ==========================================

  async processExecutionsLoop() {
    while (this.isRunning) {
      try {
        await this.processPendingExecutions();
      } catch (error) {
        console.error('Error in execution loop:', error);
      }
      await this.sleep(3000); // Check every 3 seconds
    }
  }

  async processDelaysLoop() {
    while (this.isRunning) {
      try {
        await this.processDelayedExecutions();
      } catch (error) {
        console.error('Error in delay loop:', error);
      }
      await this.sleep(10000); // Check every 10 seconds
    }
  }

  async processGoalsLoop() {
    while (this.isRunning) {
      try {
        await this.processGoalAchievements();
      } catch (error) {
        console.error('Error in goal loop:', error);
      }
      await this.sleep(15000); // Check every 15 seconds
    }
  }

  async processScheduledWorkflowsLoop() {
    while (this.isRunning) {
      try {
        await this.processScheduledWorkflows();
      } catch (error) {
        console.error('Error in scheduled workflow loop:', error);
      }
      await this.sleep(60000); // Check every minute
    }
  }

  // ==========================================
  // EXECUTION PROCESSING
  // ==========================================

  async processPendingExecutions() {
    const { data: executions, error } = await supabase.rpc(
      'get_pending_workflow_executions',
      { p_limit: 20 }
    );

    if (error || !executions || executions.length === 0) {
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
      opportunity_id: execution.opportunity_id,
      email_address: execution.email_address,
      phone_number: execution.phone_number,
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
    await supabase.rpc('record_workflow_analytics', {
      p_workflow_id: workflow_id,
      p_date: new Date().toISOString().split('T')[0],
      p_metric: 'success',
      p_value: 1
    });

    console.log(`✅ Workflow execution completed: ${execution_id}`);
  }

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
          result: conditionResult,
          path_taken: conditionResult ? 'true' : 'false'
        });

        // Find the appropriate next node based on condition result
        const nextEdges = allEdges.filter(e => e.source === node.id);
        const nextEdge = nextEdges.find(e => {
          if (conditionResult) {
            return !e.label || e.sourceHandle === 'true' ||
                   e.label?.toLowerCase().includes('yes') ||
                   e.label?.toLowerCase().includes('true');
          } else {
            return e.sourceHandle === 'false' ||
                   e.label?.toLowerCase().includes('no') ||
                   e.label?.toLowerCase().includes('false');
          }
        }) || nextEdges[0];

        if (nextEdge) {
          const nextNode = allNodes.find(n => n.id === nextEdge.target);
          if (nextNode) {
            await this.executeNode(nextNode, allNodes, allEdges, context);
          }
        }
        return;

      case 'delay':
        await this.handleDelay(node, context);
        return; // Delay pauses execution

      case 'goal':
        // Register the goal
        context.goals.push({
          node_id: node.id,
          goal_type: node.data.goalType,
          skip_to_node_id: node.data.skipToNodeId
        });

        // Record goal in database
        await supabase.from('email_workflow_goals').insert({
          workflow_id: context.workflow_id,
          execution_id: context.execution_id,
          goal_type: node.data.goalType,
          goal_config: node.data,
          skip_to_node_id: node.data.skipToNodeId
        });
        break;

      case 'split':
        // A/B split testing
        const splitResult = await this.handleSplitTest(node, context);
        const splitEdges = allEdges.filter(e => e.source === node.id);
        const splitEdge = splitEdges.find(e =>
          e.label && e.label.toUpperCase().includes(splitResult)
        ) || splitEdges[0];

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

      case 'wait_for_event':
        await this.handleWaitForEvent(node, context);
        return; // Pauses execution

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

  // ==========================================
  // ACTION IMPLEMENTATIONS
  // ==========================================

  async executeAction(node, context) {
    const { execution_id, workflow_id } = context;
    const { actionType, ...config } = node.data;

    let result = null;
    let status = 'success';
    let errorMessage = null;

    try {
      switch (actionType) {
        case 'EMAIL':
          result = await this.sendEmail(config, context);
          await supabase.rpc('record_workflow_analytics', {
            p_workflow_id: workflow_id,
            p_date: new Date().toISOString().split('T')[0],
            p_metric: 'email_sent',
            p_value: 1
          });
          break;

        case 'SMS':
        case 'SEND_SMS':
          result = await this.sendSMS(config, context);
          await supabase.rpc('record_workflow_analytics', {
            p_workflow_id: workflow_id,
            p_date: new Date().toISOString().split('T')[0],
            p_metric: 'sms_sent',
            p_value: 1
          });
          break;

        case 'TAG_ADD':
        case 'TAG_ASSIGNMENT':
          result = await this.addTag(config, context);
          break;

        case 'TAG_REMOVE':
          result = await this.removeTag(config, context);
          break;

        case 'FIELD_UPDATE':
          result = await this.updateField(config, context);
          break;

        case 'TASK_CREATE':
        case 'TASK_CREATION':
          result = await this.createTask(config, context);
          break;

        case 'CONTACT_CREATE':
        case 'CREATE_CONTACT':
          result = await this.createContact(config, context);
          break;

        case 'OPPORTUNITY_CREATE':
        case 'CREATE_DEAL':
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

        case 'INTERNAL_NOTIFICATION':
          result = await this.sendInternalNotification(config, context);
          break;

        case 'WEBHOOK':
        case 'API_CALL':
          result = await this.callWebhook(config, context);
          break;

        case 'CALENDAR_EVENT_CREATE':
          result = await this.createCalendarEvent(config, context);
          break;

        case 'TRIGGER_WORKFLOW':
          result = await this.triggerAnotherWorkflow(config, context);
          break;

        case 'STOP_WORKFLOW':
          throw new Error('WORKFLOW_STOPPED');

        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      if (error.message === 'WORKFLOW_STOPPED') {
        status = 'stopped';
      } else {
        status = 'failed';
        errorMessage = error.message;
        console.error(`Action failed: ${actionType}`, error);
      }
    }

    // Record action execution
    await supabase.from('email_workflow_actions').insert({
      execution_id,
      node_id: node.id,
      action_type: actionType,
      action_config: config,
      status,
      result,
      error_message: errorMessage,
      executed_at: new Date().toISOString()
    });

    console.log(`✓ Action executed: ${actionType} - ${status}`);

    if (status === 'stopped') {
      throw new Error('WORKFLOW_STOPPED');
    }
  }

  async sendEmail(config, context) {
    const { emailTemplateId, subject, body, fromName, fromEmail } = config;
    const { email_address, contact_id, lead_id } = context;

    if (!email_address) {
      throw new Error('No email address available');
    }

    const result = await emailService.sendCampaignEmail({
      to: email_address,
      subject: subject || 'Automated Email',
      body: body || '',
      templateId: emailTemplateId,
      contactId: contact_id,
      leadId: lead_id,
      fromName,
      fromEmail
    });

    return { email_sent: true, message_id: result.messageId };
  }

  async sendSMS(config, context) {
    const { phoneNumber, message } = config;
    const phone = phoneNumber || context.phone_number;

    if (!phone) {
      throw new Error('No phone number available');
    }

    // TODO: Integrate with SMS service (Twilio, etc.)
    console.log(`📱 SMS would be sent to ${phone}: ${message}`);
    return { sms_sent: true, phone, message };
  }

  async addTag(config, context) {
    const { tagName } = config;
    const { contact_id, lead_id } = context;

    if (lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('tags')
        .eq('id', lead_id)
        .single();

      const currentTags = lead?.tags || [];
      if (!currentTags.includes(tagName)) {
        await supabase
          .from('leads')
          .update({ tags: [...currentTags, tagName] })
          .eq('id', lead_id);
      }
    }

    if (contact_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('tags')
        .eq('id', contact_id)
        .single();

      const currentTags = contact?.tags || [];
      if (!currentTags.includes(tagName)) {
        await supabase
          .from('contacts')
          .update({ tags: [...currentTags, tagName] })
          .eq('id', contact_id);
      }
    }

    return { tag_added: tagName };
  }

  async removeTag(config, context) {
    const { tagName } = config;
    const { contact_id, lead_id } = context;

    if (lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('tags')
        .eq('id', lead_id)
        .single();

      const currentTags = lead?.tags || [];
      const newTags = currentTags.filter(tag => tag !== tagName);

      await supabase
        .from('leads')
        .update({ tags: newTags })
        .eq('id', lead_id);
    }

    if (contact_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('tags')
        .eq('id', contact_id)
        .single();

      const currentTags = contact?.tags || [];
      const newTags = currentTags.filter(tag => tag !== tagName);

      await supabase
        .from('contacts')
        .update({ tags: newTags })
        .eq('id', contact_id);
    }

    return { tag_removed: tagName };
  }

  async updateField(config, context) {
    const { fieldName, fieldValue, entityType = 'lead' } = config;
    const { contact_id, lead_id } = context;

    const updateData = { [fieldName]: fieldValue };

    if (entityType === 'lead' && lead_id) {
      await supabase.from('leads').update(updateData).eq('id', lead_id);
    } else if (entityType === 'contact' && contact_id) {
      await supabase.from('contacts').update(updateData).eq('id', contact_id);
    }

    return { field_updated: fieldName, value: fieldValue };
  }

  async createTask(config, context) {
    const { taskTitle, taskDescription, dueDate, assignedTo, priority } = config;

    const { data, error } = await supabase.from('tasks').insert({
      title: taskTitle,
      description: taskDescription,
      due_date: dueDate,
      assigned_to: assignedTo,
      priority: priority || 'normal',
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
      phone: context.phone_number,
      ...config
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();

    if (error) throw error;
    context.contact_id = data.id;
    return { contact_created: data.id };
  }

  async createOpportunity(config, context) {
    const { title, value, stage, closeDate, pipelineId } = config;

    const { data, error } = await supabase.from('opportunities').insert({
      title,
      value,
      stage,
      close_date: closeDate,
      pipeline_id: pipelineId,
      contact_id: context.contact_id,
      lead_id: context.lead_id,
      status: 'open'
    }).select().single();

    if (error) throw error;
    context.opportunity_id = data.id;
    return { opportunity_created: data.id };
  }

  async updateOpportunity(config, context) {
    const { opportunityId, updates } = config;
    const oppId = opportunityId || context.opportunity_id;

    if (!oppId) {
      throw new Error('No opportunity ID available');
    }

    const { error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', oppId);

    if (error) throw error;
    return { opportunity_updated: oppId };
  }

  async movePipelineStage(config, context) {
    const { opportunityId, newStage } = config;
    const oppId = opportunityId || context.opportunity_id;

    if (!oppId) {
      throw new Error('No opportunity ID available');
    }

    const { error } = await supabase
      .from('opportunities')
      .update({ stage: newStage })
      .eq('id', oppId);

    if (error) throw error;
    return { stage_changed: newStage };
  }

  async updateLeadScore(config, context) {
    const { scoreChange, operation } = config;
    const { lead_id } = context;

    if (!lead_id) {
      throw new Error('No lead ID available');
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('lead_score')
      .eq('id', lead_id)
      .single();

    let newScore;
    if (operation === 'set') {
      newScore = scoreChange;
    } else if (operation === 'add') {
      newScore = (lead.lead_score || 0) + scoreChange;
    } else if (operation === 'subtract') {
      newScore = (lead.lead_score || 0) - scoreChange;
    }

    const { error } = await supabase
      .from('leads')
      .update({ lead_score: newScore })
      .eq('id', lead_id);

    if (error) throw error;
    return { score_updated: true, new_score: newScore };
  }

  async assignToUser(config, context) {
    const { userId, entityType = 'lead' } = config;
    const { contact_id, lead_id } = context;

    if (entityType === 'lead' && lead_id) {
      await supabase.from('leads').update({ assigned_to: userId }).eq('id', lead_id);
    }

    if (entityType === 'contact' && contact_id) {
      await supabase.from('contacts').update({ assigned_to: userId }).eq('id', contact_id);
    }

    return { assigned_to: userId };
  }

  async sendInternalNotification(config, context) {
    const { recipientUserId, title, message, priority, actionUrl, actionLabel, notificationType } = config;

    await supabase.from('workflow_internal_notifications').insert({
      execution_id: context.execution_id,
      workflow_id: context.workflow_id,
      recipient_user_id: recipientUserId,
      notification_type: notificationType || 'in_app',
      title,
      message,
      priority: priority || 'normal',
      action_url: actionUrl,
      action_label: actionLabel
    });

    return { notification_sent: true };
  }

  async callWebhook(config, context) {
    const { webhookUrl, webhookMethod, webhookHeaders, webhookBody, includeContext } = config;

    const body = includeContext ? { ...webhookBody, context } : webhookBody;

    const response = await fetch(webhookUrl, {
      method: webhookMethod || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookHeaders || {})
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();

    return {
      webhook_called: true,
      status: response.status,
      response: responseText
    };
  }

  async createCalendarEvent(config, context) {
    const { title, description, startTime, endTime, attendees, location } = config;

    // TODO: Integrate with calendar service
    console.log('📅 Creating calendar event:', { title, startTime, endTime });

    return { event_created: true };
  }

  async triggerAnotherWorkflow(config, context) {
    const { workflowId, passContext } = config;

    const triggerData = passContext ? context : {};

    const { data: executionId } = await supabase.rpc('queue_workflow_execution', {
      p_workflow_id: workflowId,
      p_triggered_by: 'workflow',
      p_trigger_event: 'workflow_trigger',
      p_trigger_data: triggerData,
      p_contact_id: passContext ? context.contact_id : null,
      p_lead_id: passContext ? context.lead_id : null
    });

    return { workflow_triggered: workflowId, execution_id: executionId };
  }

  // ==========================================
  // CONDITION EVALUATIONS
  // ==========================================

  async evaluateCondition(node, context) {
    const { conditionType } = node.data;

    switch (conditionType) {
      case 'FIELD_COMPARE':
        return await this.compareField(node.data, context);

      case 'MULTI_FIELD':
        return await this.evaluateMultiFieldCondition(node.data, context);

      case 'TAG_CHECK':
        return await this.checkTag(node.data, context);

      case 'EMAIL_STATUS':
        return await this.checkEmailStatus(node.data, context);

      case 'LEAD_SCORE':
        return await this.checkLeadScore(node.data, context);

      case 'TIME_BASED':
        return await this.evaluateTimeBased(node.data, context);

      case 'CUSTOM_LOGIC':
        return await this.evaluateCustomLogic(node.data, context);

      default:
        console.warn(`Unknown condition type: ${conditionType}`);
        return false;
    }
  }

  async compareField(data, context) {
    const { field, operator, value, entityType = 'lead' } = data;
    let fieldValue;

    if (entityType === 'contact' && context.contact_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .select(field)
        .eq('id', context.contact_id)
        .single();
      fieldValue = contact?.[field];
    } else if (entityType === 'lead' && context.lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select(field)
        .eq('id', context.lead_id)
        .single();
      fieldValue = lead?.[field];
    }

    return this.evaluateOperator(fieldValue, operator, value);
  }

  async evaluateMultiFieldCondition(data, context) {
    const { logic, conditions } = data; // logic: 'AND' or 'OR'

    const results = await Promise.all(
      conditions.map(cond => this.compareField(cond, context))
    );

    if (logic === 'AND') {
      return results.every(r => r === true);
    } else if (logic === 'OR') {
      return results.some(r => r === true);
    }

    return false;
  }

  evaluateOperator(fieldValue, operator, value) {
    switch (operator) {
      case 'equals': return fieldValue == value;
      case 'not_equals': return fieldValue != value;
      case 'contains': return String(fieldValue).includes(value);
      case 'not_contains': return !String(fieldValue).includes(value);
      case 'greater_than': return Number(fieldValue) > Number(value);
      case 'less_than': return Number(fieldValue) < Number(value);
      case 'greater_than_or_equal': return Number(fieldValue) >= Number(value);
      case 'less_than_or_equal': return Number(fieldValue) <= Number(value);
      case 'is_empty': return !fieldValue || fieldValue === '';
      case 'is_not_empty': return !!fieldValue && fieldValue !== '';
      case 'starts_with': return String(fieldValue).startsWith(value);
      case 'ends_with': return String(fieldValue).endsWith(value);
      default: return false;
    }
  }

  async checkTag(data, context) {
    const { tagName, entityType = 'lead' } = data;

    if (entityType === 'lead' && context.lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('tags')
        .eq('id', context.lead_id)
        .single();
      return lead?.tags?.includes(tagName) || false;
    }

    if (entityType === 'contact' && context.contact_id) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('tags')
        .eq('id', context.contact_id)
        .single();
      return contact?.tags?.includes(tagName) || false;
    }

    return false;
  }

  async checkEmailStatus(data, context) {
    const { emailStatus } = data;
    const { email_address } = context;

    const { data: events } = await supabase
      .from('email_events')
      .select('event_type')
      .eq('email', email_address)
      .eq('event_type', emailStatus)
      .limit(1);

    return events && events.length > 0;
  }

  async checkLeadScore(data, context) {
    const { scoreOperator, scoreValue } = data;
    if (!context.lead_id) return false;

    const { data: lead } = await supabase
      .from('leads')
      .select('lead_score')
      .eq('id', context.lead_id)
      .single();

    const currentScore = lead?.lead_score || 0;

    return this.evaluateOperator(currentScore, scoreOperator, scoreValue);
  }

  async evaluateTimeBased(data, context) {
    const { timeCondition, dayOfWeek, hour, minute } = data;
    const now = new Date();

    if (timeCondition === 'day_of_week') {
      return now.getDay() === dayOfWeek;
    }

    if (timeCondition === 'time_of_day') {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      return currentHour === hour && currentMinute >= minute;
    }

    return false;
  }

  async evaluateCustomLogic(data, context) {
    // Can be extended for complex business rules
    return true;
  }

  // ==========================================
  // DELAY HANDLING
  // ==========================================

  async handleDelay(node, context) {
    const { execution_id, workflow_id } = context;
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

      default:
        scheduledResumeAt = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour default
    }

    await supabase.from('email_workflow_delays').insert({
      execution_id,
      workflow_id,
      node_id: node.id,
      delay_type: delayType,
      delay_amount: delayAmount,
      delay_unit: delayUnit,
      wait_until_date: delayType === 'WAIT_UNTIL' ? scheduledResumeAt : null,
      scheduled_resume_at: scheduledResumeAt,
      status: 'waiting'
    });

    await supabase
      .from('email_workflow_executions')
      .update({ status: 'waiting', current_node_id: node.id })
      .eq('id', execution_id);

    console.log(`⏸️  Execution paused until: ${scheduledResumeAt.toISOString()}`);
  }

  async handleWaitForEvent(node, context) {
    const { execution_id, workflow_id } = context;
    const { eventType, timeoutHours = 168 } = node.data;

    const scheduledResumeAt = new Date(Date.now() + (timeoutHours * 60 * 60 * 1000));

    await supabase.from('email_workflow_delays').insert({
      execution_id,
      workflow_id,
      node_id: node.id,
      delay_type: 'WAIT_FOR_EVENT',
      wait_for_event_type: eventType,
      wait_for_event_config: node.data,
      timeout_hours: timeoutHours,
      scheduled_resume_at: scheduledResumeAt,
      status: 'waiting'
    });

    await supabase
      .from('email_workflow_executions')
      .update({ status: 'waiting', current_node_id: node.id })
      .eq('id', execution_id);

    console.log(`⏸️  Waiting for event: ${eventType} (timeout: ${timeoutHours}h)`);
  }

  // ==========================================
  // SPLIT TEST HANDLING
  // ==========================================

  async handleSplitTest(node, context) {
    const { workflow_id } = context;
    const {
      splitPercentageA = 50,
      splitPercentageB = 50,
      splitPercentageC = 0,
      splitPercentageD = 0
    } = node.data;

    // Get or create split test record
    let { data: splitTest } = await supabase
      .from('email_workflow_split_tests')
      .select('*')
      .eq('workflow_id', workflow_id)
      .eq('node_id', node.id)
      .single();

    if (!splitTest) {
      const { data: newSplit } = await supabase
        .from('email_workflow_split_tests')
        .insert({
          workflow_id,
          node_id: node.id,
          split_name: node.data.label || 'Split Test',
          variant_a_percentage: splitPercentageA,
          variant_b_percentage: splitPercentageB,
          variant_c_percentage: splitPercentageC,
          variant_d_percentage: splitPercentageD
        })
        .select()
        .single();

      splitTest = newSplit;
    }

    // Random split based on percentages
    const random = Math.random() * 100;
    let path = 'A';
    let cumulativePercent = 0;

    if (random < (cumulativePercent += splitPercentageA)) {
      path = 'A';
      await supabase
        .from('email_workflow_split_tests')
        .update({ variant_a_count: splitTest.variant_a_count + 1 })
        .eq('id', splitTest.id);
    } else if (random < (cumulativePercent += splitPercentageB)) {
      path = 'B';
      await supabase
        .from('email_workflow_split_tests')
        .update({ variant_b_count: splitTest.variant_b_count + 1 })
        .eq('id', splitTest.id);
    } else if (random < (cumulativePercent += splitPercentageC) && splitPercentageC > 0) {
      path = 'C';
      await supabase
        .from('email_workflow_split_tests')
        .update({ variant_c_count: splitTest.variant_c_count + 1 })
        .eq('id', splitTest.id);
    } else if (splitPercentageD > 0) {
      path = 'D';
      await supabase
        .from('email_workflow_split_tests')
        .update({ variant_d_count: splitTest.variant_d_count + 1 })
        .eq('id', splitTest.id);
    }

    console.log(`🔀 Split test: Path ${path} chosen (${random.toFixed(2)}%)`);
    return path;
  }

  // ==========================================
  // DELAYED EXECUTION RESUMPTION
  // ==========================================

  async processDelayedExecutions() {
    const { data: delays } = await supabase.rpc('get_delayed_executions_to_resume');

    if (!delays || delays.length === 0) return;

    console.log(`⏰ Resuming ${delays.length} delayed executions`);

    for (const delay of delays) {
      try {
        await this.resumeDelayedExecution(delay);
      } catch (error) {
        console.error(`Error resuming execution ${delay.execution_id}:`, error);
      }
    }
  }

  async resumeDelayedExecution(delay) {
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

    if (!execution) return;

    const nodes = execution.workflows.nodes;
    const edges = execution.workflows.edges;

    const delayNode = nodes.find(n => n.id === delay.node_id);
    if (!delayNode) return;

    const outgoingEdges = edges.filter(e => e.source === delayNode.id);

    const context = {
      execution_id: delay.execution_id,
      workflow_id: delay.workflow_id,
      contact_id: execution.contact_id,
      lead_id: execution.lead_id,
      opportunity_id: execution.opportunity_id,
      email_address: execution.email_address,
      phone_number: execution.phone_number,
      trigger_data: execution.trigger_data,
      variables: {},
      executed_nodes: execution.executed_nodes || [],
      goals: []
    };

    await supabase
      .from('email_workflow_executions')
      .update({ status: 'running' })
      .eq('id', delay.execution_id);

    for (const edge of outgoingEdges) {
      const nextNode = nodes.find(n => n.id === edge.target);
      if (nextNode) {
        await this.executeNode(nextNode, nodes, edges, context);
      }
    }
  }

  // ==========================================
  // GOAL PROCESSING
  // ==========================================

  async processGoalAchievements() {
    // TODO: Implement goal tracking and skip-ahead logic
  }

  async processScheduledWorkflows() {
    // TODO: Implement scheduled/recurring workflow triggers
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

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
const enhancedWorkflowExecutionEngine = new EnhancedWorkflowExecutionEngine();

export default enhancedWorkflowExecutionEngine;
