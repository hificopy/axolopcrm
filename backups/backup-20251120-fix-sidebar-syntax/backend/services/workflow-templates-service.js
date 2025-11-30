import { supabase } from '../config/supabase-auth.js';

/**
 * Workflow Templates Service
 * Pre-built workflow templates for common CRM automation scenarios
 */

// Template Library - Professional workflow templates
export const workflowTemplates = [
  // ==========================================
  // LEAD NURTURE WORKFLOWS
  // ==========================================
  {
    name: 'Welcome New Lead',
    description: 'Send a warm welcome email sequence to new leads over 3 days',
    category: 'lead_nurture',
    difficulty_level: 'beginner',
    estimated_setup_time: 5,
    tags: ['welcome', 'onboarding', 'email'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'New Lead Created',
          triggerType: 'LEAD_CREATED',
          description: 'When a new lead enters the system'
        }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 180 },
        data: {
          label: 'Send Welcome Email',
          actionType: 'EMAIL',
          description: 'Send immediate welcome email',
          subject: 'Welcome! Here\'s what to expect',
          emailTemplateId: 'welcome-day-1'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 310 },
        data: {
          label: 'Wait 1 Day',
          delayType: 'TIME_DELAY',
          delayAmount: 1,
          delayUnit: 'days'
        }
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 440 },
        data: {
          label: 'Send Day 2 Email',
          actionType: 'EMAIL',
          subject: 'Your success guide',
          emailTemplateId: 'welcome-day-2'
        }
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 570 },
        data: {
          label: 'Wait 2 Days',
          delayType: 'TIME_DELAY',
          delayAmount: 2,
          delayUnit: 'days'
        }
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 700 },
        data: {
          label: 'Send Day 3 Email',
          actionType: 'EMAIL',
          subject: 'Let\'s get started!',
          emailTemplateId: 'welcome-day-3'
        }
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 830 },
        data: {
          label: 'Add "Nurtured" Tag',
          actionType: 'TAG_ADD',
          tagName: 'nurtured'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'action-1', target: 'delay-1', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'delay-1', target: 'action-2', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'action-2', target: 'delay-2', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'delay-2', target: 'action-3', type: 'smoothstep', animated: true },
      { id: 'e6', source: 'action-3', target: 'action-4', type: 'smoothstep', animated: true }
    ]
  },

  {
    name: 'Engaged Lead Follow-up',
    description: 'Automatically follow up with leads who open emails but don\'t click',
    category: 'lead_nurture',
    difficulty_level: 'intermediate',
    estimated_setup_time: 10,
    tags: ['engagement', 'follow-up', 'email'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Email Opened',
          triggerType: 'EMAIL_OPENED',
          description: 'When a lead opens an email'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 180 },
        data: {
          label: 'Wait 2 Hours',
          delayType: 'TIME_DELAY',
          delayAmount: 2,
          delayUnit: 'hours'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 310 },
        data: {
          label: 'Did They Click?',
          conditionType: 'EMAIL_STATUS',
          emailStatus: 'clicked'
        }
      },
      {
        id: 'action-yes',
        type: 'action',
        position: { x: 100, y: 470 },
        data: {
          label: 'Add "Hot Lead" Tag',
          actionType: 'TAG_ADD',
          tagName: 'hot-lead'
        }
      },
      {
        id: 'action-no',
        type: 'action',
        position: { x: 400, y: 470 },
        data: {
          label: 'Send Follow-up Email',
          actionType: 'EMAIL',
          subject: 'Did you see this?',
          emailTemplateId: 'engagement-followup'
        }
      },
      {
        id: 'action-notify',
        type: 'action',
        position: { x: 100, y: 600 },
        data: {
          label: 'Notify Sales Rep',
          actionType: 'INTERNAL_NOTIFICATION',
          title: 'Hot lead identified',
          message: 'A lead clicked your email link'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'delay-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'delay-1', target: 'condition-1', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'condition-1', target: 'action-yes', type: 'smoothstep', animated: true, label: 'Yes', sourceHandle: 'true' },
      { id: 'e4', source: 'condition-1', target: 'action-no', type: 'smoothstep', animated: true, label: 'No', sourceHandle: 'false' },
      { id: 'e5', source: 'action-yes', target: 'action-notify', type: 'smoothstep', animated: true }
    ]
  },

  // ==========================================
  // SALES WORKFLOWS
  // ==========================================
  {
    name: 'Opportunity Pipeline Automation',
    description: 'Automatically move opportunities through pipeline stages based on activity',
    category: 'sales',
    difficulty_level: 'advanced',
    estimated_setup_time: 15,
    tags: ['sales', 'pipeline', 'opportunities'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Opportunity Created',
          triggerType: 'OPPORTUNITY_CREATE',
          description: 'When a new opportunity is created'
        }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 180 },
        data: {
          label: 'Create Follow-up Task',
          actionType: 'TASK_CREATE',
          taskTitle: 'Initial contact with prospect',
          dueDate: '+1 day'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 310 },
        data: {
          label: 'Wait 3 Days',
          delayType: 'TIME_DELAY',
          delayAmount: 3,
          delayUnit: 'days'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 440 },
        data: {
          label: 'Contact Made?',
          conditionType: 'FIELD_COMPARE',
          field: 'contact_made',
          operator: 'equals',
          value: 'true'
        }
      },
      {
        id: 'action-move',
        type: 'action',
        position: { x: 100, y: 600 },
        data: {
          label: 'Move to Qualified',
          actionType: 'PIPELINE_MOVE',
          newStage: 'qualified'
        }
      },
      {
        id: 'action-notify',
        type: 'action',
        position: { x: 400, y: 600 },
        data: {
          label: 'Notify Manager',
          actionType: 'INTERNAL_NOTIFICATION',
          title: 'Stalled opportunity',
          message: 'No contact made after 3 days',
          priority: 'high'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'action-1', target: 'delay-1', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'delay-1', target: 'condition-1', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'condition-1', target: 'action-move', type: 'smoothstep', animated: true, label: 'Yes', sourceHandle: 'true' },
      { id: 'e5', source: 'condition-1', target: 'action-notify', type: 'smoothstep', animated: true, label: 'No', sourceHandle: 'false' }
    ]
  },

  // ==========================================
  // FORM SUBMISSION WORKFLOWS
  // ==========================================
  {
    name: 'Contact Form Response',
    description: 'Instantly respond to contact form submissions and create tasks',
    category: 'forms',
    difficulty_level: 'beginner',
    estimated_setup_time: 5,
    tags: ['forms', 'response', 'task'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Form Submitted',
          triggerType: 'FORM_SUBMITTED',
          description: 'When contact form is submitted'
        }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 180 },
        data: {
          label: 'Send Thank You Email',
          actionType: 'EMAIL',
          subject: 'Thanks for contacting us!',
          emailTemplateId: 'form-thank-you'
        }
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 310 },
        data: {
          label: 'Create Contact',
          actionType: 'CREATE_CONTACT'
        }
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 440 },
        data: {
          label: 'Create Follow-up Task',
          actionType: 'TASK_CREATE',
          taskTitle: 'Follow up on contact form',
          dueDate: '+1 day',
          priority: 'high'
        }
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 570 },
        data: {
          label: 'Notify Sales Team',
          actionType: 'INTERNAL_NOTIFICATION',
          title: 'New contact form submission',
          notificationType: 'slack'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'action-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'action-1', target: 'action-2', type: 'smoothstep', animated: true },
      { id: 'e3', source: 'action-2', target: 'action-3', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'action-3', target: 'action-4', type: 'smoothstep', animated: true }
    ]
  },

  // ==========================================
  // RE-ENGAGEMENT WORKFLOWS
  // ==========================================
  {
    name: 'Re-engage Inactive Leads',
    description: 'Automatically reach out to leads that haven\'t engaged in 30 days',
    category: 'reengagement',
    difficulty_level: 'intermediate',
    estimated_setup_time: 10,
    tags: ['reengagement', 'inactive', 'email'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Scheduled: Daily at 9AM',
          triggerType: 'SCHEDULED_TIME',
          description: 'Runs daily to find inactive leads',
          schedule: '0 9 * * *'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 180 },
        data: {
          label: 'Inactive 30+ Days?',
          conditionType: 'FIELD_COMPARE',
          field: 'last_activity_date',
          operator: 'less_than',
          value: '-30 days'
        }
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 340 },
        data: {
          label: 'Send Re-engagement Email',
          actionType: 'EMAIL',
          subject: 'We miss you! Special offer inside',
          emailTemplateId: 'reengagement-offer'
        }
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 470 },
        data: {
          label: 'Wait 1 Week',
          delayType: 'TIME_DELAY',
          delayAmount: 1,
          delayUnit: 'weeks'
        }
      },
      {
        id: 'condition-2',
        type: 'condition',
        position: { x: 250, y: 600 },
        data: {
          label: 'Did They Engage?',
          conditionType: 'EMAIL_STATUS',
          emailStatus: 'opened'
        }
      },
      {
        id: 'action-engaged',
        type: 'action',
        position: { x: 100, y: 760 },
        data: {
          label: 'Add "Re-engaged" Tag',
          actionType: 'TAG_ADD',
          tagName: 're-engaged'
        }
      },
      {
        id: 'action-cold',
        type: 'action',
        position: { x: 400, y: 760 },
        data: {
          label: 'Mark as Cold Lead',
          actionType: 'FIELD_UPDATE',
          fieldName: 'status',
          fieldValue: 'cold'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'condition-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'condition-1', target: 'action-1', type: 'smoothstep', animated: true, label: 'Yes', sourceHandle: 'true' },
      { id: 'e3', source: 'action-1', target: 'delay-1', type: 'smoothstep', animated: true },
      { id: 'e4', source: 'delay-1', target: 'condition-2', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'condition-2', target: 'action-engaged', type: 'smoothstep', animated: true, label: 'Yes', sourceHandle: 'true' },
      { id: 'e6', source: 'condition-2', target: 'action-cold', type: 'smoothstep', animated: true, label: 'No', sourceHandle: 'false' }
    ]
  },

  // ==========================================
  // TASK AUTOMATION WORKFLOWS
  // ==========================================
  {
    name: 'Auto-assign New Leads',
    description: 'Automatically assign new leads to sales reps based on territory or round-robin',
    category: 'task_automation',
    difficulty_level: 'intermediate',
    estimated_setup_time: 10,
    tags: ['assignment', 'task', 'sales'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'New Lead Created',
          triggerType: 'LEAD_CREATED'
        }
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 180 },
        data: {
          label: 'Lead Score > 50?',
          conditionType: 'LEAD_SCORE',
          scoreOperator: 'greater_than',
          scoreValue: 50
        }
      },
      {
        id: 'action-high',
        type: 'action',
        position: { x: 100, y: 340 },
        data: {
          label: 'Assign to Senior Rep',
          actionType: 'ASSIGN_TO_USER',
          userId: 'senior-rep-id'
        }
      },
      {
        id: 'action-low',
        type: 'action',
        position: { x: 400, y: 340 },
        data: {
          label: 'Assign to Junior Rep',
          actionType: 'ASSIGN_TO_USER',
          userId: 'junior-rep-id'
        }
      },
      {
        id: 'action-task',
        type: 'action',
        position: { x: 250, y: 500 },
        data: {
          label: 'Create Outreach Task',
          actionType: 'TASK_CREATE',
          taskTitle: 'Contact new lead',
          dueDate: '+1 day'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'condition-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'condition-1', target: 'action-high', type: 'smoothstep', animated: true, label: 'Yes', sourceHandle: 'true' },
      { id: 'e3', source: 'condition-1', target: 'action-low', type: 'smoothstep', animated: true, label: 'No', sourceHandle: 'false' },
      { id: 'e4', source: 'action-high', target: 'action-task', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'action-low', target: 'action-task', type: 'smoothstep', animated: true }
    ]
  },

  // ==========================================
  // ADVANCED WORKFLOWS WITH A/B TESTING
  // ==========================================
  {
    name: 'A/B Test Welcome Sequence',
    description: 'Test two different welcome email approaches to optimize engagement',
    category: 'optimization',
    difficulty_level: 'advanced',
    estimated_setup_time: 15,
    tags: ['ab-test', 'optimization', 'email'],
    industry: ['all'],
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'New Lead Created',
          triggerType: 'LEAD_CREATED'
        }
      },
      {
        id: 'split-1',
        type: 'split',
        position: { x: 250, y: 180 },
        data: {
          label: 'A/B Split Test',
          splitPercentageA: 50,
          splitPercentageB: 50
        }
      },
      {
        id: 'action-a',
        type: 'action',
        position: { x: 100, y: 340 },
        data: {
          label: 'Send Version A (Formal)',
          actionType: 'EMAIL',
          subject: 'Welcome to Our Platform',
          emailTemplateId: 'welcome-formal'
        }
      },
      {
        id: 'action-b',
        type: 'action',
        position: { x: 400, y: 340 },
        data: {
          label: 'Send Version B (Casual)',
          actionType: 'EMAIL',
          subject: 'Hey! Let\'s get started',
          emailTemplateId: 'welcome-casual'
        }
      },
      {
        id: 'goal-1',
        type: 'goal',
        position: { x: 250, y: 500 },
        data: {
          label: 'Track Email Click',
          goalType: 'EMAIL_CLICKED'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'split-1', type: 'smoothstep', animated: true },
      { id: 'e2', source: 'split-1', target: 'action-a', type: 'smoothstep', animated: true, label: 'A (50%)' },
      { id: 'e3', source: 'split-1', target: 'action-b', type: 'smoothstep', animated: true, label: 'B (50%)' },
      { id: 'e4', source: 'action-a', target: 'goal-1', type: 'smoothstep', animated: true },
      { id: 'e5', source: 'action-b', target: 'goal-1', type: 'smoothstep', animated: true }
    ]
  }
];

/**
 * Get all workflow templates
 */
export async function getAllTemplates(filters = {}) {
  let query = supabase
    .from('email_workflow_templates')
    .select('*')
    .order('use_count', { ascending: false });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.difficulty_level) {
    query = query.eq('difficulty_level', filters.difficulty_level);
  }

  if (filters.is_featured) {
    query = query.eq('is_featured', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data;
}

/**
 * Get a specific template
 */
export async function getTemplate(templateId) {
  const { data, error } = await supabase
    .from('email_workflow_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    return null;
  }

  return data;
}

/**
 * Create workflow from template
 */
export async function createWorkflowFromTemplate(templateId, customizations = {}) {
  const template = await getTemplate(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  const { data: workflow, error } = await supabase
    .from('email_marketing_workflows')
    .insert({
      name: customizations.name || `${template.name} (Copy)`,
      description: customizations.description || template.description,
      nodes: template.nodes,
      edges: template.edges,
      is_active: false
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Update template use count
  await supabase
    .from('email_workflow_templates')
    .update({ use_count: template.use_count + 1 })
    .eq('id', templateId);

  return workflow;
}

/**
 * Initialize template library in database
 */
export async function initializeTemplateLibrary() {
  console.log('📚 Initializing workflow template library...');

  for (const template of workflowTemplates) {
    const { error } = await supabase
      .from('email_workflow_templates')
      .upsert(
        {
          ...template,
          is_featured: template.difficulty_level === 'beginner'
        },
        { onConflict: 'name' }
      );

    if (error) {
      console.error(`Error creating template "${template.name}":`, error);
    } else {
      console.log(`✓ Created template: ${template.name}`);
    }
  }

  console.log('✅ Workflow template library initialized');
}

export default {
  getAllTemplates,
  getTemplate,
  createWorkflowFromTemplate,
  initializeTemplateLibrary,
  workflowTemplates
};
