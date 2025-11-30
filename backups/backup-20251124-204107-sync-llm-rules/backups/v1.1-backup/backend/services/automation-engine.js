import EmailService from './email-service.js';
import { createClient } from '@supabase/supabase-js';

const emailService = new EmailService();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

class AutomationEngine {
  constructor() {
    this.running = false;
  }

  async start() {
    if (this.running) return;

    this.running = true;
    console.log('Automation Engine started');

    // Start processing workflows
    this.processQueuedExecutions();

    // Start processing emails
    this.processQueuedEmails();

    // Process workflows based on triggers
    this.setupTriggerWatchers();
  }

  stop() {
    this.running = false;
    console.log('Automation Engine stopped');
  }

  async processQueuedExecutions() {
    if (!this.running) return;

    try {
      // Process pending executions using Supabase
      const { data: pendingExecutions, error } = await supabase
        .from('automation_executions')
        .select(`
          *,
          workflow:automation_workflows(*, steps(*))
        `)
        .eq('status', 'PENDING')
        .limit(10);

      if (error) {
        console.error('Error fetching pending executions:', error);
        return;
      }

      for (const execution of pendingExecutions) {
        try {
          await this.executeWorkflowSteps(execution);
        } catch (error) {
          console.error(`Error executing workflow ${execution.workflow_id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing queued executions:', error);
    }

    // Schedule next check in 5 seconds
    setTimeout(() => this.processQueuedExecutions(), 5000);
  }

  async processQueuedEmails() {
    if (!this.running) return;

    try {
      await emailService.processQueuedEmails(5); // Process 5 emails at a time
    } catch (error) {
      console.error('Error processing queued emails:', error);
    }

    // Schedule next check in 10 seconds
    setTimeout(() => this.processQueuedEmails(), 10000);
  }

  async setupTriggerWatchers() {
    if (!this.running) return;

    // Set up trigger watchers for various events
    this.setupEmailOpenTrigger();
    this.setupEmailClickTrigger();
    this.setupLeadCreateTrigger();
    this.setupLeadStatusChangeTrigger();
    this.setupFormSubmitTrigger();

    // Schedule periodic checks for schedule-based triggers
    setInterval(() => {
      this.processScheduledTriggers();
    }, 60000); // Check every minute
  }

  setupEmailOpenTrigger() {
    // In a real implementation, this would set up event listeners
    // For now, we'll just log that the trigger is set up
    console.log('Email open trigger watcher set up');
  }

  setupEmailClickTrigger() {
    console.log('Email click trigger watcher set up');
  }

  setupLeadCreateTrigger() {
    console.log('Lead creation trigger watcher set up');
  }

  setupLeadStatusChangeTrigger() {
    console.log('Lead status change trigger watcher set up');
  }

  setupFormSubmitTrigger() {
    console.log('Form submission trigger watcher set up');
  }

  async processScheduledTriggers() {
    try {
      // Find workflows that are triggered by scheduled time
      const { data: scheduledWorkflows, error } = await supabase
        .from('automation_workflows')
        .select(`
          *,
          steps(*)
        `)
        .eq('is_active', true)
        .eq('is_paused', false)
        .eq('trigger_type', 'SCHEDULED_TIME');

      if (error) {
        console.error('Error fetching scheduled workflows:', error);
        return;
      }

      for (const workflow of scheduledWorkflows) {
        // Check if it's time to execute based on trigger config
        if (this.shouldExecuteScheduledWorkflow(workflow)) {
          await this.triggerWorkflow(workflow.id, {
            entityType: 'SYSTEM',
            entityId: 'SCHEDULED_TRIGGER'
          });
        }
      }
    } catch (error) {
      console.error('Error processing scheduled triggers:', error);
    }
  }

  shouldExecuteScheduledWorkflow(workflow) {
    // In a real implementation, this would check if the current time matches
    // the scheduled time defined in the workflow's triggerConfig
    // For now, we'll return false to avoid executing constantly
    return false;
  }

  async executeWorkflowSteps(execution) {
    try {
      // Update execution status to RUNNING
      const { error: updateError } = await supabase
        .from('automation_executions')
        .update({ status: 'RUNNING' })
        .eq('id', execution.id);

      if (updateError) {
        console.error('Error updating execution status:', updateError);
        return;
      }

      // Execute each step in the workflow
      const startTime = new Date();
      let executionLog = [];

      // Process workflow steps based on the flow structure
      const processedSteps = new Set();
      const queue = [this.getFirstStep(execution.workflow.steps)];

      while (queue.length > 0) {
        const currentStep = queue.shift();

        if (!currentStep || processedSteps.has(currentStep.id)) {
          continue;
        }

        processedSteps.add(currentStep.id);

        try {
          const stepResult = await this.executeStep(currentStep, execution);
          executionLog.push({
            stepId: currentStep.id,
            stepName: currentStep.step_name,
            stepType: currentStep.step_type,
            result: stepResult,
            timestamp: new Date()
          });

          // Based on the result, determine next steps
          const nextSteps = this.getNextSteps(currentStep, stepResult, execution.workflow.steps);
          queue.push(...nextSteps);
        } catch (stepError) {
          console.error(`Error executing step ${currentStep.id}:`, stepError);
          executionLog.push({
            stepId: currentStep.id,
            stepName: currentStep.step_name,
            error: stepError.message,
            timestamp: new Date()
          });

          // Check if we should continue or stop the workflow
          if (currentStep.step_config?.stopOnError !== false) {
            break;
          }
        }
      }

      const endTime = new Date();
      const executionTime = endTime - startTime;

      // Update execution completion
      const { error: completionError } = await supabase
        .from('automation_executions')
        .update({
          status: 'COMPLETED',
          completed_at: endTime,
          execution_time_ms: executionTime,
          execution_log: executionLog
        })
        .eq('id', execution.id);

      if (completionError) {
        console.error('Error updating execution completion:', completionError);
      }

      // Update workflow stats
      await supabase.rpc('increment_column', {
        table_name: 'automation_workflows',
        column_name: 'execution_count',
        row_id: execution.workflow_id,
      });
      await supabase.rpc('increment_column', {
        table_name: 'automation_workflows',
        column_name: 'success_count',
        row_id: execution.workflow_id,
      });

      const { error: statsError } = await supabase
        .from('automation_workflows')
        .update({
          last_executed_at: new Date(),
        })
        .eq('id', execution.workflow_id);

      if (statsError) {
        console.error('Error updating workflow stats:', statsError);
      }
    } catch (error) {
      console.error('Error executing workflow steps:', error);

      // Update execution as FAILED
      const { error: failError } = await supabase
        .from('automation_executions')
        .update({
          status: 'FAILED',
          completed_at: new Date(),
          execution_log: [{ error: error.message, timestamp: new Date() }],
        })
        .eq('id', execution.id);

      // Update workflow stats for failure
      await supabase.rpc('increment_column', {
        table_name: 'automation_workflows',
        column_name: 'execution_count',
        row_id: execution.workflow_id,
      });
      await supabase.rpc('increment_column', {
        table_name: 'automation_workflows',
        column_name: 'failure_count',
        row_id: execution.workflow_id,
      });

      if (failError) {
        console.error('Error updating failed execution:', failError);
      }
    }
  }

  getFirstStep(steps) {
    // Find the trigger step (step with position 0 or no parent)
    return steps.find(step => step.position === 0 || !step.parent_id);
  }

  getNextSteps(currentStep, stepResult, allSteps) {
    // Find child steps that depend on the current step
    return allSteps.filter(step => step.parent_id === currentStep.id);
  }

  async executeStep(step, execution) {
    switch (step.step_type) {
      case 'TRIGGER':
        return await this.executeTriggerStep(step, execution);
      case 'EMAIL':
        return await this.executeEmailStep(step, execution);
      case 'CONDITION':
        return await this.executeConditionStep(step, execution);
      case 'DELAY':
        return await this.executeDelayStep(step, execution);
      case 'TASK_CREATION':
        return await this.executeTaskCreationStep(step, execution);
      case 'TAG_ASSIGNMENT':
        return await this.executeTagAssignmentStep(step, execution);
      case 'FIELD_UPDATE':
        return await this.executeFieldUpdateStep(step, execution);
      case 'WEBHOOK':
        return await this.executeWebhookStep(step, execution);
      case 'BRANCH_CONDITION':
        return await this.executeBranchConditionStep(step, execution);
      case 'WAIT_FOR_EVENT':
        return await this.executeWaitForEventStep(step, execution);
      default:
        throw new Error(`Unknown step type: ${step.step_type}`);
    }
  }

  async executeTriggerStep(step, execution) {
    // The trigger step is already initiated by the system
    // Just return success to continue the workflow
    return { success: true, triggered: true };
  }

  async executeEmailStep(step, execution) {
    // Extract email step configuration
    const { recipient, template_id, subject, body } = step.step_config;

    try {
      // Send email based on configuration
      let targetEmail, targetName, leadId, contactId;

      if (execution.trigger_entity_type === 'LEAD' && execution.trigger_entity_id) {
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (leadError) {
          console.error('Error fetching lead:', leadError);
          return { success: false, error: leadError.message };
        }

        targetEmail = lead.email;
        targetName = lead.name;
        leadId = lead.id;
      } else if (execution.trigger_entity_type === 'CONTACT' && execution.trigger_entity_id) {
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (contactError) {
          console.error('Error fetching contact:', contactError);
          return { success: false, error: contactError.message };
        }

        targetEmail = contact.email;
        targetName = contact.name;
        contactId = contact.id;
      }

      if (targetEmail) {
        // Use the email service to send the email
        const sendResult = await emailService.sendEmail({
          to: targetEmail,
          subject: subject || 'Automated Email',
          html: body || 'Automated message',
          from: process.env.DEFAULT_EMAIL_FROM
        });

        return { success: true, messageId: sendResult.messageId };
      } else {
        return { success: false, error: 'No recipient found' };
      }
    } catch (error) {
      console.error('Error executing email step:', error);
      return { success: false, error: error.message };
    }
  }

  async executeConditionStep(step, execution) {
    // Evaluate condition and return result
    const { condition } = step.step_config;
    // In a real implementation, this would evaluate the condition
    // For now, we'll just return true
    return { success: true, conditionMet: true };
  }

  async executeDelayStep(step, execution) {
    // In a real implementation, this would create a delay
    // For now, we'll just return success
    const { delayMinutes } = step.step_config;
    return { success: true, delayApplied: delayMinutes || 0 };
  }

  async executeTaskCreationStep(step, execution) {
    // Create a task based on step configuration
    const { title, description, assignee, dueDate } = step.step_config;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: title || 'Automated Task',
          description: description || 'Task created by automation',
          assigned_to_id: assignee,
          due_date: dueDate ? new Date(dueDate) : null,
          entity_type: execution.trigger_entity_type,
          entity_id: execution.trigger_entity_id,
          auto_created: true,
          priority: 'MEDIUM'
        });

      if (error) {
        console.error('Error creating task:', error);
        return { success: false, error: error.message };
      }

      return { success: true, taskCreated: true };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message };
    }
  }

  async executeTagAssignmentStep(step, execution) {
    // Assign tags to the entity that triggered the workflow
    const { tagsToAdd, tagsToRemove } = step.step_config;

    try {
      if (execution.trigger_entity_type === 'LEAD' && execution.trigger_entity_id) {
        const { data: lead, error: fetchError } = await supabase
          .from('leads')
          .select('tags')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (fetchError) {
          console.error('Error fetching lead:', fetchError);
          return { success: false, error: fetchError.message };
        }

        let currentTags = lead.tags || [];

        // Add new tags
        if (tagsToAdd && Array.isArray(tagsToAdd)) {
          for (const tag of tagsToAdd) {
            if (!currentTags.includes(tag)) {
              currentTags.push(tag);
            }
          }
        }

        // Remove specified tags
        if (tagsToRemove && Array.isArray(tagsToRemove)) {
          currentTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
        }

        const { error: updateError } = await supabase
          .from('leads')
          .update({ tags: currentTags })
          .eq('id', execution.trigger_entity_id);

        if (updateError) {
          console.error('Error updating lead tags:', updateError);
          return { success: false, error: updateError.message };
        }
      } else if (execution.trigger_entity_type === 'CONTACT' && execution.trigger_entity_id) {
        const { data: contact, error: fetchError } = await supabase
          .from('contacts')
          .select('tags')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (fetchError) {
          console.error('Error fetching contact:', fetchError);
          return { success: false, error: fetchError.message };
        }

        let currentTags = contact.tags || [];

        // Add new tags
        if (tagsToAdd && Array.isArray(tagsToAdd)) {
          for (const tag of tagsToAdd) {
            if (!currentTags.includes(tag)) {
              currentTags.push(tag);
            }
          }
        }

        // Remove specified tags
        if (tagsToRemove && Array.isArray(tagsToRemove)) {
          currentTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
        }

        const { error: updateError } = await supabase
          .from('contacts')
          .update({ tags: currentTags })
          .eq('id', execution.trigger_entity_id);

        if (updateError) {
          console.error('Error updating contact tags:', updateError);
          return { success: false, error: updateError.message };
        }
      }

      return { success: true, tagsUpdated: true };
    } catch (error) {
      console.error('Error assigning tags:', error);
      return { success: false, error: error.message };
    }
  }

  async executeFieldUpdateStep(step, execution) {
    // Update fields on the entity that triggered the workflow
    const { fieldUpdates } = step.step_config;

    try {
      const updateData = {};
      for (const [field, value] of Object.entries(fieldUpdates)) {
        updateData[field] = value;
      }

      if (execution.trigger_entity_type === 'LEAD' && execution.trigger_entity_id) {
        const { error } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', execution.trigger_entity_id);

        if (error) {
          console.error('Error updating lead fields:', error);
          return { success: false, error: error.message };
        }
      } else if (execution.trigger_entity_type === 'CONTACT' && execution.trigger_entity_id) {
        const { error } = await supabase
          .from('contacts')
          .update(updateData)
          .eq('id', execution.trigger_entity_id);

        if (error) {
          console.error('Error updating contact fields:', error);
          return { success: false, error: error.message };
        }
      }

      return { success: true, fieldsUpdated: true };
    } catch (error) {
      console.error('Error updating fields:', error);
      return { success: false, error: error.message };
    }
  }

  async executeWebhookStep(step, execution) {
    // Execute a webhook call
    const { url, method, headers, body } = step.step_config;

    try {
      // In a real implementation, you would make the HTTP request
      // For now, we'll just log the webhook call
      console.log(`Webhook called: ${method} ${url}`);

      return { success: true, webhookCalled: true };
    } catch (error) {
      console.error('Error executing webhook:', error);
      return { success: false, error: error.message };
    }
  }

  async executeWaitForEventStep(step, execution) {
    const { eventType, timeoutMinutes } = step.step_config;

    try {
      // In a real implementation, this would wait for a specific event
      // For now, we'll just return success
      // This would typically involve setting up a listener for the event
      // and potentially pausing the execution until the event occurs or timeout
      console.log(`Waiting for event: ${eventType} with timeout: ${timeoutMinutes} minutes`);

      return { success: true, waiting: true };
    } catch (error) {
      console.error('Error executing wait for event:', error);
      return { success: false, error: error.message };
    }
  }

  async executeBranchConditionStep(step, execution) {
    // Evaluate branching condition
    const { condition } = step.step_config;

    try {
      // Get entity data based on trigger type
      let entityData = {};
      if (execution.trigger_entity_type === 'LEAD' && execution.trigger_entity_id) {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (error) {
          console.error('Error fetching lead:', error);
          return { success: false, error: error.message };
        }
        entityData = data;
      } else if (execution.trigger_entity_type === 'CONTACT' && execution.trigger_entity_id) {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (error) {
          console.error('Error fetching contact:', error);
          return { success: false, error: error.message };
        }
        entityData = data;
      } else if (execution.trigger_entity_type === 'DEAL' && execution.trigger_entity_id) {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('id', execution.trigger_entity_id)
          .single();

        if (error) {
          console.error('Error fetching deal:', error);
          return { success: false, error: error.message };
        }
        entityData = data;
      }

      // Evaluate the condition based on the configuration
      const conditionResult = this.evaluateCondition(condition, entityData);

      return {
        success: true,
        conditionMet: conditionResult,
        branchSelected: conditionResult ? 'true' : 'false'
      };
    } catch (error) {
      console.error('Error evaluating branch condition:', error);
      return { success: false, error: error.message };
    }
  }

  evaluateCondition(condition, entityData) {
    const { field, operator, value } = condition;

    if (!entityData || entityData[field] === undefined) {
      return false;
    }

    const entityValue = entityData[field];

    switch (operator) {
      case 'EQUALS':
        return entityValue == value;
      case 'NOT_EQUALS':
        return entityValue != value;
      case 'GREATER_THAN':
        return entityValue > value;
      case 'LESS_THAN':
        return entityValue < value;
      case 'GREATER_THAN_OR_EQUAL':
        return entityValue >= value;
      case 'LESS_THAN_OR_EQUAL':
        return entityValue <= value;
      case 'CONTAINS':
        return String(entityValue).includes(String(value));
      case 'NOT_CONTAINS':
        return !String(entityValue).includes(String(value));
      case 'IS_EMPTY':
        return !entityValue || String(entityValue).trim() === '';
      case 'IS_NOT_EMPTY':
        return entityValue && String(entityValue).trim() !== '';
      case 'IS_TRUE':
        return Boolean(entityValue) === true;
      case 'IS_FALSE':
        return Boolean(entityValue) === false;
      default:
        return false;
    }
  }

  async triggerWorkflow(workflowId, triggerData) {
    try {
      const { data: workflow, error: workflowError } = await supabase
        .from('automation_workflows')
        .select(`
          *,
          steps(*)
        `)
        .eq('id', workflowId)
        .single();

      if (workflowError) {
        console.error('Error fetching workflow:', workflowError);
        return { success: false, error: workflowError.message };
      }

      if (!workflow.is_active || workflow.is_paused) {
        return { success: false, error: 'Workflow not active' };
      }

      // Create execution record
      const { data: execution, error: creationError } = await supabase
        .from('automation_executions')
        .insert({
          workflow_id: workflowId,
          trigger_entity_id: triggerData.entityId,
          trigger_entity_type: triggerData.entityType,
          status: 'PENDING',
          started_at: new Date()
        })
        .select()
        .single();

      if (creationError) {
        console.error('Error creating execution:', creationError);
        return { success: false, error: creationError.message };
      }

      return { success: true, executionId: execution.id };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return { success: false, error: error.message };
    }
  }

  async processEvent(eventType, eventData) {
    // Process an event that may trigger workflows
    try {
      // Map event types to trigger types
      let triggerType;
      switch (eventType) {
        case 'EMAIL_OPENED':
          triggerType = 'EMAIL_OPENED';
          break;
        case 'EMAIL_CLICKED':
          triggerType = 'EMAIL_CLICKED';
          break;
        case 'LEAD_CREATED':
          triggerType = 'LEAD_CREATED';
          break;
        case 'LEAD_STATUS_CHANGED':
          triggerType = 'LEAD_STATUS_CHANGED';
          break;
        case 'FORM_SUBMITTED':
          triggerType = 'FORM_SUBMITTED';
          break;
        default:
          return { success: false, error: 'Unknown event type' };
      }

      // Find matching workflows
      const { data: matchingWorkflows, error: fetchError } = await supabase
        .from('automation_workflows')
        .select('*')
        .eq('is_active', true)
        .eq('is_paused', false)
        .eq('trigger_type', triggerType);

      if (fetchError) {
        console.error('Error fetching matching workflows:', fetchError);
        return { success: false, error: fetchError.message };
      }

      for (const workflow of matchingWorkflows) {
        await this.triggerWorkflow(workflow.id, eventData);
      }

      return { success: true, workflowsTriggered: matchingWorkflows.length };
    } catch (error) {
      console.error('Error processing event:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AutomationEngine;