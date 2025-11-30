/**
 * Comprehensive Master Search Service
 * Searches EVERYTHING in the CRM - 100x more extensive
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class ComprehensiveSearchService {
  /**
   * Search across ALL entities in the system
   */
  async search(userId, query, options = {}) {
    if (!query || query.trim().length < 2) {
      return {
        query,
        results: [],
        totalCount: 0,
        categories: {},
      };
    }

    const searchQuery = query.trim().toLowerCase();
    const limit = options.limit || 8;

    // If no userId (dev mode or not authenticated), only search navigation
    if (!userId) {
      const navigationPages = this.searchNavigationPages(query);
      return {
        query,
        results: navigationPages.map(item => ({
          ...item,
          category: 'navigation',
          icon: 'Navigation',
          type: 'Page',
        })),
        totalCount: navigationPages.length,
        categories: {
          navigation: navigationPages.length,
        },
      };
    }

    // Execute ALL searches in parallel for maximum speed
    const [
      // Core CRM Data
      leads,
      contacts,
      opportunities,
      activities,

      // Communication & Engagement
      emailCampaigns,
      inboxItems,
      callLogs,
      conversationHistory,

      // Automation & Workflows
      workflows,
      workflowTemplates,
      workflowExecutions,
      automationTriggers,

      // Marketing & Forms
      forms,
      formSubmissions,

      // Second Brain - Detailed
      secondBrainNodes,
      secondBrainMaps,
      secondBrainNotes,
      secondBrainFolders,

      // Calendar & Events
      calendarEvents,
      importantDates,
      recurringEvents,

      // Reports & Analytics
      savedReports,

      // Settings & Configuration
      customFields,
      tags,

      // Extended Entities
      emailTemplates,
      companies,
      deals,
      tasks,
      notes,
      documents,
      pipelineStages,
      products,
      quotes,
      teamMembers,

      // Navigation & Pages
      navigationPages,
    ] = await Promise.all([
      // Core CRM
      this.searchLeads(userId, searchQuery, limit),
      this.searchContacts(userId, searchQuery, limit),
      this.searchOpportunities(userId, searchQuery, limit),
      this.searchActivities(userId, searchQuery, limit),

      // Communication
      this.searchEmailCampaigns(userId, searchQuery, limit),
      this.searchInboxItems(userId, searchQuery, limit),
      this.searchCallLogs(userId, searchQuery, limit),
      this.searchConversationHistory(userId, searchQuery, limit),

      // Workflows
      this.searchWorkflows(userId, searchQuery, limit),
      this.searchWorkflowTemplates(userId, searchQuery, limit),
      this.searchWorkflowExecutions(userId, searchQuery, limit),
      this.searchAutomationTriggers(userId, searchQuery, limit),

      // Marketing
      this.searchForms(userId, searchQuery, limit),
      this.searchFormSubmissions(userId, searchQuery, limit),

      // Second Brain
      this.searchSecondBrainNodes(userId, searchQuery, limit),
      this.searchSecondBrainMaps(userId, searchQuery, limit),
      this.searchSecondBrainNotes(userId, searchQuery, limit),
      this.searchSecondBrainFolders(userId, searchQuery, limit),

      // Calendar
      this.searchCalendarEvents(userId, searchQuery, limit),
      this.searchImportantDates(userId, searchQuery, limit),
      this.searchRecurringEvents(userId, searchQuery, limit),

      // Reports
      this.searchSavedReports(userId, searchQuery, limit),

      // Settings
      this.searchCustomFields(userId, searchQuery, limit),
      this.searchTags(userId, searchQuery, limit),

      // Extended Entities
      this.searchEmailTemplates(userId, searchQuery, limit),
      this.searchCompanies(userId, searchQuery, limit),
      this.searchDeals(userId, searchQuery, limit),
      this.searchTasks(userId, searchQuery, limit),
      this.searchNotes(userId, searchQuery, limit),
      this.searchDocuments(userId, searchQuery, limit),
      this.searchPipelineStages(userId, searchQuery, limit),
      this.searchProducts(userId, searchQuery, limit),
      this.searchQuotes(userId, searchQuery, limit),
      this.searchTeamMembers(userId, searchQuery, limit),

      // Navigation
      this.searchNavigationPages(query),
    ]);

    // Combine all results with proper categorization
    const results = [
      // Core CRM
      ...leads.map(item => ({ ...item, category: 'leads', icon: 'UserPlus', type: 'Lead' })),
      ...contacts.map(item => ({ ...item, category: 'contacts', icon: 'Users', type: 'Contact' })),
      ...opportunities.map(item => ({ ...item, category: 'opportunities', icon: 'TrendingUp', type: 'Opportunity' })),
      ...activities.map(item => ({ ...item, category: 'activities', icon: 'Activity', type: 'Activity' })),

      // Communication
      ...emailCampaigns.map(item => ({ ...item, category: 'marketing', icon: 'Mail', type: 'Email Campaign' })),
      ...inboxItems.map(item => ({ ...item, category: 'communication', icon: 'Inbox', type: 'Email' })),
      ...callLogs.map(item => ({ ...item, category: 'communication', icon: 'Phone', type: 'Call Log' })),
      ...conversationHistory.map(item => ({ ...item, category: 'communication', icon: 'MessageSquare', type: 'Conversation' })),

      // Workflows
      ...workflows.map(item => ({ ...item, category: 'automation', icon: 'Workflow', type: 'Workflow' })),
      ...workflowTemplates.map(item => ({ ...item, category: 'automation', icon: 'Workflow', type: 'Workflow Template' })),
      ...workflowExecutions.map(item => ({ ...item, category: 'automation', icon: 'Zap', type: 'Workflow Execution' })),
      ...automationTriggers.map(item => ({ ...item, category: 'automation', icon: 'Zap', type: 'Automation Trigger' })),

      // Marketing
      ...forms.map(item => ({ ...item, category: 'marketing', icon: 'FileInput', type: 'Form' })),
      ...formSubmissions.map(item => ({ ...item, category: 'marketing', icon: 'FileText', type: 'Form Submission' })),
      ...emailTemplates.map(item => ({ ...item, category: 'marketing', icon: 'Mail', type: 'Email Template' })),

      // Second Brain
      ...secondBrainNodes.map(item => ({ ...item, category: 'secondBrain', subCategory: 'nodes', icon: 'Brain', type: 'Node' })),
      ...secondBrainMaps.map(item => ({ ...item, category: 'secondBrain', subCategory: 'maps', icon: 'Map', type: 'Map' })),
      ...secondBrainNotes.map(item => ({ ...item, category: 'secondBrain', subCategory: 'notes', icon: 'FileText', type: 'Note' })),
      ...secondBrainFolders.map(item => ({ ...item, category: 'secondBrain', subCategory: 'folders', icon: 'Folder', type: 'Folder' })),

      // Calendar
      ...calendarEvents.map(item => ({ ...item, category: 'calendar', icon: 'Calendar', type: 'Event' })),
      ...importantDates.map(item => ({ ...item, category: 'calendar', icon: 'CalendarClock', type: 'Important Date' })),
      ...recurringEvents.map(item => ({ ...item, category: 'calendar', icon: 'CalendarRange', type: 'Recurring Event' })),

      // Reports
      ...savedReports.map(item => ({ ...item, category: 'reports', icon: 'BarChart3', type: 'Report' })),

      // Settings
      ...customFields.map(item => ({ ...item, category: 'settings', icon: 'Settings', type: 'Custom Field' })),
      ...tags.map(item => ({ ...item, category: 'settings', icon: 'Tag', type: 'Tag' })),

      // Extended Entities
      ...companies.map(item => ({ ...item, category: 'contacts', icon: 'Building', type: 'Company' })),
      ...deals.map(item => ({ ...item, category: 'opportunities', icon: 'TrendingUp', type: 'Deal' })),
      ...tasks.map(item => ({ ...item, category: 'activities', icon: 'CheckSquare', type: 'Task' })),
      ...notes.map(item => ({ ...item, category: 'communication', icon: 'FileText', type: 'Note' })),
      ...documents.map(item => ({ ...item, category: 'communication', icon: 'File', type: 'Document' })),
      ...pipelineStages.map(item => ({ ...item, category: 'opportunities', icon: 'Layers', type: 'Pipeline Stage' })),
      ...products.map(item => ({ ...item, category: 'settings', icon: 'Package', type: 'Product' })),
      ...quotes.map(item => ({ ...item, category: 'opportunities', icon: 'FileText', type: 'Quote' })),
      ...teamMembers.map(item => ({ ...item, category: 'settings', icon: 'Users', type: 'Team Member' })),

      // Navigation
      ...navigationPages.map(item => ({ ...item, category: 'navigation', icon: 'Navigation', type: 'Page' })),
    ];

    // Sort by relevance
    const sortedResults = this.sortByRelevance(results, searchQuery);

    // Calculate category counts
    const categories = results.reduce((acc, item) => {
      const cat = item.category;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return {
      query,
      results: sortedResults,
      totalCount: sortedResults.length,
      categories,
    };
  }

  // ==================== CORE CRM ====================

  async searchLeads(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, company, status, phone, source, created_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,phone.ilike.%${query}%,source.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(lead => ({
        id: lead.id,
        title: lead.name,
        subtitle: lead.company || lead.email,
        description: `${lead.status} lead ${lead.source ? `from ${lead.source}` : ''} • ${lead.phone || 'No phone'}`,
        url: `/leads?id=${lead.id}`,
        metadata: { status: lead.status, created_at: lead.created_at },
      }));
    } catch (error) {
      console.error('Error searching leads:', error);
      return [];
    }
  }

  async searchContacts(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, company, phone, position, tags')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,phone.ilike.%${query}%,position.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(contact => ({
        id: contact.id,
        title: contact.name,
        subtitle: contact.position ? `${contact.position} at ${contact.company}` : contact.company,
        description: `${contact.email} • ${contact.phone || 'No phone'}`,
        url: `/contacts?id=${contact.id}`,
        metadata: { company: contact.company, tags: contact.tags },
      }));
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  async searchOpportunities(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, name, company, value, stage, probability, close_date')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,company.ilike.%${query}%,stage.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(opp => ({
        id: opp.id,
        title: opp.name,
        subtitle: opp.company,
        description: `$${opp.value?.toLocaleString() || 0} • ${opp.stage} • ${opp.probability || 0}% probability`,
        url: `/opportunities?id=${opp.id}`,
        metadata: { value: opp.value, stage: opp.stage, close_date: opp.close_date },
      }));
    } catch (error) {
      console.error('Error searching opportunities:', error);
      return [];
    }
  }

  async searchActivities(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, title, type, description, due_date, status, related_to_type, related_to_id')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,type.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(activity => ({
        id: activity.id,
        title: activity.title,
        subtitle: `${activity.type} activity`,
        description: `${activity.status} • Due ${new Date(activity.due_date).toLocaleDateString()} • ${activity.description?.substring(0, 50) || ''}`,
        url: `/activities?id=${activity.id}`,
        metadata: { type: activity.type, due_date: activity.due_date, status: activity.status },
      }));
    } catch (error) {
      console.error('Error searching activities:', error);
      return [];
    }
  }

  // ==================== COMMUNICATION ====================

  async searchEmailCampaigns(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, subject, status, sent_count, open_rate, click_rate, created_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(campaign => ({
        id: campaign.id,
        title: campaign.name,
        subtitle: campaign.subject,
        description: `${campaign.status} • ${campaign.sent_count || 0} sent • ${campaign.open_rate || 0}% open rate`,
        url: `/email-marketing?campaign=${campaign.id}`,
        metadata: { status: campaign.status, stats: { sent: campaign.sent_count, open_rate: campaign.open_rate } },
      }));
    } catch (error) {
      console.error('Error searching campaigns:', error);
      return [];
    }
  }

  async searchInboxItems(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('inbox_emails')
        .select('id, subject, sender, snippet, read, starred, received_at')
        .eq('user_id', userId)
        .or(`subject.ilike.%${query}%,sender.ilike.%${query}%,snippet.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(email => ({
        id: email.id,
        title: email.subject,
        subtitle: `From: ${email.sender}`,
        description: `${email.read ? 'Read' : 'Unread'} • ${new Date(email.received_at).toLocaleDateString()} • ${email.snippet?.substring(0, 60)}`,
        url: `/inbox?email=${email.id}`,
        metadata: { read: email.read, starred: email.starred },
      }));
    } catch (error) {
      console.error('Error searching inbox:', error);
      return [];
    }
  }

  async searchCallLogs(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('id, contact_name, phone_number, direction, duration, status, recorded, created_at, notes')
        .eq('user_id', userId)
        .or(`contact_name.ilike.%${query}%,phone_number.ilike.%${query}%,notes.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(call => ({
        id: call.id,
        title: call.contact_name || call.phone_number,
        subtitle: `${call.direction} call`,
        description: `${call.status} • ${call.duration || 0}s • ${new Date(call.created_at).toLocaleDateString()}`,
        url: `/live-calls?call=${call.id}`,
        metadata: { direction: call.direction, duration: call.duration, recorded: call.recorded },
      }));
    } catch (error) {
      console.error('Error searching call logs:', error);
      return [];
    }
  }

  async searchConversationHistory(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('id, contact_name, channel, last_message, message_count, created_at')
        .eq('user_id', userId)
        .or(`contact_name.ilike.%${query}%,last_message.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(conv => ({
        id: conv.id,
        title: conv.contact_name,
        subtitle: `${conv.channel} conversation`,
        description: `${conv.message_count} messages • Last: ${conv.last_message?.substring(0, 50)}`,
        url: `/history?conversation=${conv.id}`,
        metadata: { channel: conv.channel, message_count: conv.message_count },
      }));
    } catch (error) {
      console.error('Error searching conversation history:', error);
      return [];
    }
  }

  // ==================== WORKFLOWS & AUTOMATION ====================

  async searchWorkflows(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('id, name, description, trigger_type, status, execution_count')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,trigger_type.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(workflow => ({
        id: workflow.id,
        title: workflow.name,
        subtitle: `${workflow.trigger_type} trigger`,
        description: `${workflow.status} • ${workflow.execution_count || 0} executions • ${workflow.description?.substring(0, 60)}`,
        url: `/workflows?id=${workflow.id}`,
        metadata: { status: workflow.status, trigger: workflow.trigger_type },
      }));
    } catch (error) {
      console.error('Error searching workflows:', error);
      return [];
    }
  }

  async searchWorkflowTemplates(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('id, name, description, category, use_count')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(template => ({
        id: template.id,
        title: template.name,
        subtitle: `${template.category} template`,
        description: `Used ${template.use_count || 0} times • ${template.description?.substring(0, 60)}`,
        url: `/workflows?template=${template.id}`,
        metadata: { category: template.category, use_count: template.use_count },
      }));
    } catch (error) {
      console.error('Error searching workflow templates:', error);
      return [];
    }
  }

  async searchWorkflowExecutions(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('id, workflow_id, status, started_at, completed_at, error_message')
        .eq('user_id', userId)
        .or(`status.ilike.%${query}%,error_message.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(exec => ({
        id: exec.id,
        title: `Execution ${exec.id.substring(0, 8)}`,
        subtitle: `Workflow execution`,
        description: `${exec.status} • Started ${new Date(exec.started_at).toLocaleDateString()}`,
        url: `/workflows?execution=${exec.id}`,
        metadata: { status: exec.status, workflow_id: exec.workflow_id },
      }));
    } catch (error) {
      console.error('Error searching workflow executions:', error);
      return [];
    }
  }

  async searchAutomationTriggers(userId, query, limit) {
    // Return common automation triggers that match the query
    const allTriggers = [
      { id: 'email-open', name: 'Email Opened', description: 'Triggered when a campaign email is opened' },
      { id: 'email-click', name: 'Email Link Clicked', description: 'Triggered when a link in an email is clicked' },
      { id: 'form-submit', name: 'Form Submitted', description: 'Triggered when a form is submitted' },
      { id: 'lead-created', name: 'Lead Created', description: 'Triggered when a new lead is added' },
      { id: 'lead-status', name: 'Lead Status Changed', description: 'Triggered when lead status changes' },
      { id: 'opportunity-won', name: 'Opportunity Won', description: 'Triggered when an opportunity is marked as won' },
      { id: 'call-completed', name: 'Call Completed', description: 'Triggered after a call ends' },
    ];

    return allTriggers
      .filter(trigger =>
        trigger.name.toLowerCase().includes(query) ||
        trigger.description.toLowerCase().includes(query)
      )
      .slice(0, limit)
      .map(trigger => ({
        id: trigger.id,
        title: trigger.name,
        subtitle: 'Automation trigger',
        description: trigger.description,
        url: `/workflows?trigger=${trigger.id}`,
        metadata: { type: 'trigger' },
      }));
  }

  // ==================== MARKETING & FORMS ====================

  async searchForms(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('id, name, description, status, submission_count, created_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(form => ({
        id: form.id,
        title: form.name,
        subtitle: 'Form',
        description: `${form.status} • ${form.submission_count || 0} submissions • ${form.description?.substring(0, 50)}`,
        url: `/forms?id=${form.id}`,
        metadata: { status: form.status, submissions: form.submission_count },
      }));
    } catch (error) {
      console.error('Error searching forms:', error);
      return [];
    }
  }

  async searchFormSubmissions(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('id, form_id, form_name, submitter_email, submitter_name, submitted_at')
        .eq('user_id', userId)
        .or(`submitter_email.ilike.%${query}%,submitter_name.ilike.%${query}%,form_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(submission => ({
        id: submission.id,
        title: submission.submitter_name || submission.submitter_email,
        subtitle: `Submitted ${submission.form_name}`,
        description: `${new Date(submission.submitted_at).toLocaleDateString()} • ${submission.submitter_email}`,
        url: `/forms?submission=${submission.id}`,
        metadata: { form_id: submission.form_id, submitted_at: submission.submitted_at },
      }));
    } catch (error) {
      console.error('Error searching form submissions:', error);
      return [];
    }
  }

  // ==================== SECOND BRAIN ====================

  async searchSecondBrainNodes(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_nodes')
        .select('id, label, type, description, tags, metadata')
        .eq('user_id', userId)
        .or(`label.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(node => ({
        id: node.id,
        title: node.label,
        subtitle: `${node.type} node`,
        description: `${node.description?.substring(0, 80) || 'No description'} ${node.tags?.length ? `• Tags: ${node.tags.join(', ')}` : ''}`,
        url: `/second-brain/logic?node=${node.id}`,
        metadata: { type: node.type, tags: node.tags },
      }));
    } catch (error) {
      console.error('Error searching second brain nodes:', error);
      return [];
    }
  }

  async searchSecondBrainMaps(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_maps')
        .select('id, name, description, object_count, created_at, updated_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(map => ({
        id: map.id,
        title: map.name,
        subtitle: 'Map/Canvas',
        description: `${map.object_count || 0} objects • ${map.description?.substring(0, 60) || 'No description'}`,
        url: `/second-brain/maps?map=${map.id}`,
        metadata: { object_count: map.object_count, updated_at: map.updated_at },
      }));
    } catch (error) {
      console.error('Error searching second brain maps:', error);
      return [];
    }
  }

  async searchSecondBrainNotes(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_notes')
        .select('id, title, content, folder, tags, starred, created_at, updated_at')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,folder.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(note => ({
        id: note.id,
        title: note.title,
        subtitle: note.folder || 'Note',
        description: `${note.content?.substring(0, 100) || 'Empty note'} ${note.starred ? '⭐' : ''}`,
        url: `/second-brain/notes?note=${note.id}`,
        metadata: { starred: note.starred, tags: note.tags, folder: note.folder },
      }));
    } catch (error) {
      console.error('Error searching second brain notes:', error);
      return [];
    }
  }

  async searchSecondBrainFolders(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('second_brain_notes')
        .select('folder')
        .eq('user_id', userId)
        .not('folder', 'is', null)
        .ilike('folder', `%${query}%`);

      if (error) throw error;

      const uniqueFolders = [...new Set(data.map(item => item.folder))].slice(0, limit);

      return uniqueFolders.map(folder => ({
        id: folder,
        title: folder,
        subtitle: 'Folder',
        description: 'Collection of notes',
        url: `/second-brain/notes?folder=${encodeURIComponent(folder)}`,
        metadata: { type: 'folder' },
      }));
    } catch (error) {
      console.error('Error searching folders:', error);
      return [];
    }
  }

  // ==================== CALENDAR ====================

  async searchCalendarEvents(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, description, start_time, end_time, event_type, attendees')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        title: event.title,
        subtitle: `${event.event_type} event`,
        description: `${new Date(event.start_time).toLocaleString()} • ${event.description?.substring(0, 50)}`,
        url: `/calendar?event=${event.id}`,
        metadata: { start_time: event.start_time, type: event.event_type },
      }));
    } catch (error) {
      console.error('Error searching calendar events:', error);
      return [];
    }
  }

  async searchImportantDates(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('important_dates')
        .select('id, title, date, category, notes')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,category.ilike.%${query}%,notes.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(date => ({
        id: date.id,
        title: date.title,
        subtitle: `${date.category} - Important Date`,
        description: `${new Date(date.date).toLocaleDateString()} • ${date.notes?.substring(0, 60)}`,
        url: `/calendar?date=${date.id}`,
        metadata: { date: date.date, category: date.category },
      }));
    } catch (error) {
      console.error('Error searching important dates:', error);
      return [];
    }
  }

  async searchRecurringEvents(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('recurring_events')
        .select('id, title, description, recurrence_pattern, next_occurrence')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        title: event.title,
        subtitle: `Recurring ${event.recurrence_pattern}`,
        description: `Next: ${new Date(event.next_occurrence).toLocaleDateString()} • ${event.description?.substring(0, 50)}`,
        url: `/calendar?recurring=${event.id}`,
        metadata: { pattern: event.recurrence_pattern },
      }));
    } catch (error) {
      console.error('Error searching recurring events:', error);
      return [];
    }
  }

  // ==================== REPORTS & ANALYTICS ====================

  async searchSavedReports(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('id, name, report_type, description, created_at')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,report_type.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(report => ({
        id: report.id,
        title: report.name,
        subtitle: `${report.report_type} report`,
        description: `Created ${new Date(report.created_at).toLocaleDateString()} • ${report.description?.substring(0, 50)}`,
        url: `/reports/explorer?report=${report.id}`,
        metadata: { type: report.report_type, created_at: report.created_at },
      }));
    } catch (error) {
      console.error('Error searching saved reports:', error);
      return [];
    }
  }

  // ==================== SETTINGS ====================

  async searchCustomFields(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('id, field_name, field_type, entity_type, options')
        .eq('user_id', userId)
        .or(`field_name.ilike.%${query}%,entity_type.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(field => ({
        id: field.id,
        title: field.field_name,
        subtitle: `${field.field_type} field for ${field.entity_type}`,
        description: 'Custom field configuration',
        url: `/settings?field=${field.id}`,
        metadata: { type: field.field_type, entity: field.entity_type },
      }));
    } catch (error) {
      console.error('Error searching custom fields:', error);
      return [];
    }
  }

  async searchTags(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, color, usage_count')
        .eq('user_id', userId)
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(tag => ({
        id: tag.id,
        title: tag.name,
        subtitle: 'Tag',
        description: `Used ${tag.usage_count || 0} times`,
        url: `/settings?tag=${tag.id}`,
        metadata: { color: tag.color, usage_count: tag.usage_count },
      }));
    } catch (error) {
      console.error('Error searching tags:', error);
      return [];
    }
  }

  // ==================== EXTENDED ENTITIES ====================

  async searchEmailTemplates(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, body_preview, category, usage_count')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,subject.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(template => ({
        id: template.id,
        title: template.name,
        subtitle: template.subject,
        description: `${template.category || 'General'} template • Used ${template.usage_count || 0} times`,
        url: `/email-marketing?template=${template.id}`,
        metadata: { category: template.category, usage_count: template.usage_count },
      }));
    } catch (error) {
      console.error('Error searching email templates:', error);
      return [];
    }
  }

  async searchCompanies(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, industry, size, website, phone, address')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,industry.ilike.%${query}%,website.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(company => ({
        id: company.id,
        title: company.name,
        subtitle: company.industry || 'Company',
        description: `${company.size || 'Unknown size'} • ${company.website || company.phone || 'No contact info'}`,
        url: `/contacts?company=${company.id}`,
        metadata: { industry: company.industry, size: company.size },
      }));
    } catch (error) {
      console.error('Error searching companies:', error);
      return [];
    }
  }

  async searchDeals(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, value, stage, probability, contact_name, company_name, close_date')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,contact_name.ilike.%${query}%,company_name.ilike.%${query}%,stage.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(deal => ({
        id: deal.id,
        title: deal.title,
        subtitle: `${deal.company_name || deal.contact_name || 'Deal'}`,
        description: `$${deal.value?.toLocaleString() || 0} • ${deal.stage} • ${deal.probability || 0}% probability`,
        url: `/pipeline?deal=${deal.id}`,
        metadata: { value: deal.value, stage: deal.stage, close_date: deal.close_date },
      }));
    } catch (error) {
      console.error('Error searching deals:', error);
      return [];
    }
  }

  async searchTasks(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, priority, status, due_date, assigned_to')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(task => ({
        id: task.id,
        title: task.title,
        subtitle: `${task.priority || 'Normal'} priority task`,
        description: `${task.status} • Due ${new Date(task.due_date).toLocaleDateString()}`,
        url: `/activities?task=${task.id}`,
        metadata: { priority: task.priority, status: task.status, due_date: task.due_date },
      }));
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  }

  async searchNotes(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, related_to_type, related_to_name, created_at, updated_at')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(note => ({
        id: note.id,
        title: note.title,
        subtitle: note.related_to_name ? `Note about ${note.related_to_name}` : 'General note',
        description: note.content?.substring(0, 100) || 'Empty note',
        url: `/activities?note=${note.id}`,
        metadata: { related_to_type: note.related_to_type, updated_at: note.updated_at },
      }));
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }

  async searchDocuments(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, file_type, file_size, related_to_type, related_to_name, created_at, tags')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(limit);

      if (error) throw error;

      return data.map(doc => ({
        id: doc.id,
        title: doc.name,
        subtitle: `${doc.file_type?.toUpperCase() || 'Document'} • ${(doc.file_size / 1024).toFixed(1)} KB`,
        description: doc.related_to_name ? `Related to ${doc.related_to_name}` : 'Uploaded document',
        url: `/documents?id=${doc.id}`,
        metadata: { file_type: doc.file_type, file_size: doc.file_size, tags: doc.tags },
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  async searchPipelineStages(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('id, name, description, position, deal_count, total_value')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(stage => ({
        id: stage.id,
        title: stage.name,
        subtitle: `Pipeline stage ${stage.position || ''}`,
        description: `${stage.deal_count || 0} deals • $${stage.total_value?.toLocaleString() || 0} total value`,
        url: `/pipeline?stage=${stage.id}`,
        metadata: { position: stage.position, deal_count: stage.deal_count },
      }));
    } catch (error) {
      console.error('Error searching pipeline stages:', error);
      return [];
    }
  }

  async searchProducts(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, sku, category, stock_quantity')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        title: product.name,
        subtitle: `${product.category || 'Product'} • SKU: ${product.sku || 'N/A'}`,
        description: `$${product.price?.toLocaleString() || 0} • ${product.stock_quantity || 0} in stock`,
        url: `/settings/products?id=${product.id}`,
        metadata: { price: product.price, category: product.category, sku: product.sku },
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async searchQuotes(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, title, quote_number, contact_name, company_name, total_amount, status, created_at, valid_until')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,quote_number.ilike.%${query}%,contact_name.ilike.%${query}%,company_name.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(quote => ({
        id: quote.id,
        title: quote.title || `Quote #${quote.quote_number}`,
        subtitle: quote.company_name || quote.contact_name,
        description: `$${quote.total_amount?.toLocaleString() || 0} • ${quote.status} • Valid until ${new Date(quote.valid_until).toLocaleDateString()}`,
        url: `/opportunities?quote=${quote.id}`,
        metadata: { total_amount: quote.total_amount, status: quote.status },
      }));
    } catch (error) {
      console.error('Error searching quotes:', error);
      return [];
    }
  }

  async searchTeamMembers(userId, query, limit) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, email, role, department, phone, status')
        .eq('organization_id', userId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,role.ilike.%${query}%,department.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return data.map(member => ({
        id: member.id,
        title: member.name,
        subtitle: `${member.role} ${member.department ? `• ${member.department}` : ''}`,
        description: `${member.email} • ${member.status || 'active'}`,
        url: `/settings/team?member=${member.id}`,
        metadata: { role: member.role, department: member.department, status: member.status },
      }));
    } catch (error) {
      console.error('Error searching team members:', error);
      return [];
    }
  }

  // ==================== NAVIGATION & PAGES ====================

  searchNavigationPages(query) {
    const allPages = [
      // Dashboard & Overview
      { id: 'dashboard', name: 'Dashboard', description: 'Overview of your CRM metrics and activity', url: '/dashboard', module: 'Core' },
      { id: 'calendar', name: 'Calendar', description: 'Manage events, meetings, and schedules', url: '/calendar', module: 'Core' },

      // Sales
      { id: 'inbox', name: 'Inbox', description: 'Centralized email inbox and communications', url: '/inbox', module: 'Sales' },
      { id: 'pipeline', name: 'Pipeline', description: 'Visual sales pipeline and deal stages', url: '/pipeline', module: 'Sales' },
      { id: 'opportunities', name: 'Opportunities', description: 'Manage sales opportunities and deals', url: '/opportunities', module: 'Sales' },
      { id: 'leads', name: 'Leads', description: 'Track and nurture potential customers', url: '/leads', module: 'Sales' },
      { id: 'contacts', name: 'Contacts', description: 'Manage your contact database', url: '/contacts', module: 'Sales' },
      { id: 'workflows', name: 'Workflows', description: 'Automate sales processes and tasks', url: '/workflows', module: 'Sales' },
      { id: 'history', name: 'Conversation History', description: 'View all past conversations and interactions', url: '/history', module: 'Sales' },
      { id: 'live-calls', name: 'Live Calls', description: 'Make and manage phone calls', url: '/live-calls', module: 'Sales' },
      { id: 'activities', name: 'Activities', description: 'Track tasks, calls, meetings, and todos', url: '/activities', module: 'Sales' },

      // Reports
      { id: 'activity-overview', name: 'Activity Overview', description: 'Comprehensive view of all activities', url: '/reports/activity-overview', module: 'Reports' },
      { id: 'activity-comparison', name: 'Activity Comparison', description: 'Compare activity metrics across periods', url: '/reports/activity-comparison', module: 'Reports' },
      { id: 'opportunity-funnels', name: 'Opportunity Funnels', description: 'Analyze conversion funnels and drop-offs', url: '/reports/opportunity-funnels', module: 'Reports' },
      { id: 'status-changes', name: 'Status Changes', description: 'Track status change history and patterns', url: '/reports/status-changes', module: 'Reports' },
      { id: 'explorer', name: 'Report Explorer', description: 'Create custom reports and analytics', url: '/reports/explorer', module: 'Reports' },

      // Marketing
      { id: 'email-marketing', name: 'Email Marketing', description: 'Create and manage email campaigns', url: '/email-marketing', module: 'Marketing' },
      { id: 'forms', name: 'Forms', description: 'Build and manage lead capture forms', url: '/forms', module: 'Marketing' },
      { id: 'workflow-builder', name: 'Workflow Builder', description: 'Visual workflow automation builder', url: '/workflow-builder', module: 'Marketing' },

      // Service
      { id: 'tickets', name: 'Tickets', description: 'Customer support ticket management', url: '/tickets', module: 'Service' },
      { id: 'knowledge-base', name: 'Knowledge Base', description: 'Help articles and documentation', url: '/knowledge-base', module: 'Service' },
      { id: 'customer-portal', name: 'Customer Portal', description: 'Self-service portal for customers', url: '/customer-portal', module: 'Service' },
      { id: 'support-analytics', name: 'Support Analytics', description: 'Customer support metrics and insights', url: '/support-analytics', module: 'Service' },

      // Second Brain
      { id: 'second-brain', name: 'Second Brain', description: 'Knowledge management and note-taking system', url: '/second-brain', module: 'Productivity' },
      { id: 'logic-view', name: 'Logic View', description: 'Node-based knowledge graph', url: '/second-brain/logic', module: 'Productivity' },
      { id: 'maps-view', name: 'Maps View', description: 'Infinite canvas for visual thinking', url: '/second-brain/maps', module: 'Productivity' },
      { id: 'notes-view', name: 'Notes View', description: 'Document editor and note management', url: '/second-brain/notes', module: 'Productivity' },

      // Settings
      { id: 'settings', name: 'Settings', description: 'Configure your CRM settings', url: '/settings', module: 'Settings' },
      { id: 'account-settings', name: 'Account Settings', description: 'Manage your account preferences', url: '/settings/account', module: 'Settings' },
      { id: 'billing-settings', name: 'Billing', description: 'Subscription and payment management', url: '/settings/billing', module: 'Settings' },
      { id: 'organization-settings', name: 'Organization', description: 'Team and organization settings', url: '/settings/organization', module: 'Settings' },
      { id: 'communication-settings', name: 'Communication', description: 'Email and messaging configuration', url: '/settings/communication', module: 'Settings' },
      { id: 'integrations-settings', name: 'Integrations', description: 'Third-party app connections', url: '/settings/integrations', module: 'Settings' },
      { id: 'customization-settings', name: 'Customization', description: 'Customize fields, layouts, and branding', url: '/settings/customization', module: 'Settings' },
    ];

    const lowerQuery = query.toLowerCase();
    return allPages
      .filter(page =>
        page.name.toLowerCase().includes(lowerQuery) ||
        page.description.toLowerCase().includes(lowerQuery) ||
        page.module.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10)
      .map(page => ({
        id: page.id,
        title: page.name,
        subtitle: `${page.module} Module`,
        description: page.description,
        url: page.url,
        metadata: { module: page.module },
      }));
  }

  // ==================== UTILITY ====================

  sortByRelevance(results, query) {
    return results.sort((a, b) => {
      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      const lowerQuery = query.toLowerCase();

      // Exact match first
      const aExact = aTitle === lowerQuery ? 1 : 0;
      const bExact = bTitle === lowerQuery ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      // Starts with query
      const aStarts = aTitle.startsWith(lowerQuery) ? 1 : 0;
      const bStarts = bTitle.startsWith(lowerQuery) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      // Contains query
      const aContains = aTitle.includes(lowerQuery) ? 1 : 0;
      const bContains = bTitle.includes(lowerQuery) ? 1 : 0;
      return bContains - aContains;
    });
  }
}

export default new ComprehensiveSearchService();
