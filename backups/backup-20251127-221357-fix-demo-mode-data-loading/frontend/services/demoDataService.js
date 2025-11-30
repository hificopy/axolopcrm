// Demo Data Service Wrapper
// Centralized service that returns demo data for all sections when demo agency is selected

import {
  DEMO_DASHBOARD_METRICS,
  DEMO_LEADS,
  DEMO_CONTACTS,
  DEMO_OPPORTUNITIES,
  DEMO_FORMS,
  DEMO_CALENDAR_EVENTS,
  DEMO_TASKS,
  DEMO_EMAIL_CAMPAIGNS,
  DEMO_ACTIVITIES,
} from "@/data/demoAgencyData";

export const demoDataService = {
  // Dashboard
  getSalesMetrics: (timeRange) => {
    console.log(
      `[DemoDataService] Returning sales metrics for timeRange: ${timeRange}`,
    );
    return Promise.resolve(DEMO_DASHBOARD_METRICS.sales);
  },

  getProfitLossData: (timeRange = "current") => {
    console.log(
      `[DemoDataService] Returning profit/loss data for timeRange: ${timeRange}`,
    );
    return Promise.resolve(DEMO_DASHBOARD_METRICS.profitLoss);
  },

  getMarketingMetrics: (timeRange = "current") => {
    console.log(
      `[DemoDataService] Returning marketing metrics for timeRange: ${timeRange}`,
    );
    return Promise.resolve(DEMO_DASHBOARD_METRICS.marketing);
  },

  // Combined dashboard data (for Home page)
  getDashboardData: (timeRange = "month") => {
    console.log(
      `[DemoDataService] Returning complete dashboard data for timeRange: ${timeRange}`,
    );
    return {
      sales: DEMO_DASHBOARD_METRICS.sales,
      marketing: DEMO_DASHBOARD_METRICS.marketing,
      profitLoss: DEMO_DASHBOARD_METRICS.profitLoss,
      forms: {
        total: 42,
        thisWeek: 12,
        submissions: [],
      },
    };
  },

  // Lead Management
  getLeads: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo leads with filters:",
      filters,
    );
    let filteredLeads = [...DEMO_LEADS];

    // Apply filters if provided
    if (filters.stage) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.stage === filters.stage,
      );
    }
    if (filters.status) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.status === filters.status,
      );
    }
    if (filters.source) {
      filteredLeads = filteredLeads.filter(
        (lead) => lead.source === filters.source,
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredLeads,
      total: filteredLeads.length,
    });
  },

  getLeadById: (leadId) => {
    console.log(`[DemoDataService] Returning lead by ID: ${leadId}`);
    const lead = DEMO_LEADS.find((l) => l.id === leadId);
    return Promise.resolve({
      success: true,
      data: lead,
    });
  },

  createLead: (leadData) => {
    console.log(
      "[DemoDataService] Demo mode - lead creation simulated:",
      leadData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Lead creation simulated",
      data: { ...leadData, id: `demo-lead-new-${Date.now()}`, isDemo: true },
    });
  },

  updateLead: (leadId, updateData) => {
    console.log(
      `[DemoDataService] Demo mode - lead update simulated: ${leadId}`,
      updateData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Lead update simulated",
      data: { ...updateData, id: leadId, isDemo: true },
    });
  },

  deleteLead: (leadId) => {
    console.log(
      `[DemoDataService] Demo mode - lead deletion simulated: ${leadId}`,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Lead deletion simulated",
    });
  },

  // Contact Management
  getContacts: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo contacts with filters:",
      filters,
    );
    let filteredContacts = [...DEMO_CONTACTS];

    if (filters.type) {
      filteredContacts = filteredContacts.filter(
        (contact) => contact.type === filters.type,
      );
    }
    if (filters.company) {
      filteredContacts = filteredContacts.filter((contact) =>
        contact.company.toLowerCase().includes(filters.company.toLowerCase()),
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredContacts,
      total: filteredContacts.length,
    });
  },

  getContactById: (contactId) => {
    console.log(`[DemoDataService] Returning contact by ID: ${contactId}`);
    const contact = DEMO_CONTACTS.find((c) => c.id === contactId);
    return Promise.resolve({
      success: true,
      data: contact,
    });
  },

  createContact: (contactData) => {
    console.log(
      "[DemoDataService] Demo mode - contact creation simulated:",
      contactData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Contact creation simulated",
      data: {
        ...contactData,
        id: `demo-contact-new-${Date.now()}`,
        isDemo: true,
      },
    });
  },

  updateContact: (contactId, updateData) => {
    console.log(
      `[DemoDataService] Demo mode - contact update simulated: ${contactId}`,
      updateData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Contact update simulated",
      data: { ...updateData, id: contactId, isDemo: true },
    });
  },

  deleteContact: (contactId) => {
    console.log(
      `[DemoDataService] Demo mode - contact deletion simulated: ${contactId}`,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Contact deletion simulated",
    });
  },

  // Opportunity Management
  getOpportunities: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo opportunities with filters:",
      filters,
    );
    let filteredOpportunities = [...DEMO_OPPORTUNITIES];

    if (filters.stage) {
      filteredOpportunities = filteredOpportunities.filter(
        (opp) => opp.stage === filters.stage,
      );
    }
    if (filters.probability_min) {
      filteredOpportunities = filteredOpportunities.filter(
        (opp) => opp.probability >= filters.probability_min,
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredOpportunities,
      total: filteredOpportunities.length,
    });
  },

  getOpportunityById: (opportunityId) => {
    console.log(
      `[DemoDataService] Returning opportunity by ID: ${opportunityId}`,
    );
    const opportunity = DEMO_OPPORTUNITIES.find((o) => o.id === opportunityId);
    return Promise.resolve({
      success: true,
      data: opportunity,
    });
  },

  createOpportunity: (opportunityData) => {
    console.log(
      "[DemoDataService] Demo mode - opportunity creation simulated:",
      opportunityData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Opportunity creation simulated",
      data: {
        ...opportunityData,
        id: `demo-opp-new-${Date.now()}`,
        isDemo: true,
      },
    });
  },

  updateOpportunity: (opportunityId, updateData) => {
    console.log(
      `[DemoDataService] Demo mode - opportunity update simulated: ${opportunityId}`,
      updateData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Opportunity update simulated",
      data: { ...updateData, id: opportunityId, isDemo: true },
    });
  },

  deleteOpportunity: (opportunityId) => {
    console.log(
      `[DemoDataService] Demo mode - opportunity deletion simulated: ${opportunityId}`,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Opportunity deletion simulated",
    });
  },

  // Form Management
  getForms: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo forms with filters:",
      filters,
    );
    let filteredForms = [...DEMO_FORMS];

    if (filters.status) {
      filteredForms = filteredForms.filter(
        (form) => form.status === filters.status,
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredForms,
      total: filteredForms.length,
    });
  },

  getFormById: (formId) => {
    console.log(`[DemoDataService] Returning form by ID: ${formId}`);
    const form = DEMO_FORMS.find((f) => f.id === formId);
    return Promise.resolve({
      success: true,
      data: form,
    });
  },

  getFormSubmissions: (formId) => {
    console.log(`[DemoDataService] Returning submissions for form: ${formId}`);
    // Generate some mock submissions for the form
    const mockSubmissions = Array.from({ length: 10 }, (_, i) => ({
      id: `demo-submission-${i + 1}`,
      form_id: formId,
      submitted_at: new Date(
        Date.now() - i * 24 * 60 * 60 * 1000,
      ).toISOString(),
      data: {
        name: `Demo User ${i + 1}`,
        email: `demo${i + 1}@example.com`,
        company: `Demo Company ${i + 1}`,
      },
    }));

    return Promise.resolve({
      success: true,
      data: mockSubmissions,
      total: mockSubmissions.length,
    });
  },

  // Calendar Management
  getCalendarEvents: (startDate, endDate) => {
    console.log(
      `[DemoDataService] Returning calendar events from ${startDate} to ${endDate}`,
    );
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredEvents = DEMO_CALENDAR_EVENTS.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate >= start && eventDate <= end;
    });

    return Promise.resolve({
      success: true,
      data: filteredEvents,
      total: filteredEvents.length,
    });
  },

  createCalendarEvent: (eventData) => {
    console.log(
      "[DemoDataService] Demo mode - calendar event creation simulated:",
      eventData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Calendar event creation simulated",
      data: { ...eventData, id: `demo-event-new-${Date.now()}`, isDemo: true },
    });
  },

  updateCalendarEvent: (eventId, updateData) => {
    console.log(
      `[DemoDataService] Demo mode - calendar event update simulated: ${eventId}`,
      updateData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Calendar event update simulated",
      data: { ...updateData, id: eventId, isDemo: true },
    });
  },

  deleteCalendarEvent: (eventId) => {
    console.log(
      `[DemoDataService] Demo mode - calendar event deletion simulated: ${eventId}`,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Calendar event deletion simulated",
    });
  },

  // Task Management
  getTasks: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo tasks with filters:",
      filters,
    );
    let filteredTasks = [...DEMO_TASKS];

    if (filters.status) {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === filters.status,
      );
    }
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === filters.priority,
      );
    }
    if (filters.assignee) {
      filteredTasks = filteredTasks.filter(
        (task) => task.assignee === filters.assignee,
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredTasks,
      total: filteredTasks.length,
    });
  },

  getTaskById: (taskId) => {
    console.log(`[DemoDataService] Returning task by ID: ${taskId}`);
    const task = DEMO_TASKS.find((t) => t.id === taskId);
    return Promise.resolve({
      success: true,
      data: task,
    });
  },

  createTask: (taskData) => {
    console.log(
      "[DemoDataService] Demo mode - task creation simulated:",
      taskData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Task creation simulated",
      data: { ...taskData, id: `demo-task-new-${Date.now()}`, isDemo: true },
    });
  },

  updateTask: (taskId, updateData) => {
    console.log(
      `[DemoDataService] Demo mode - task update simulated: ${taskId}`,
      updateData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Task update simulated",
      data: { ...updateData, id: taskId, isDemo: true },
    });
  },

  deleteTask: (taskId) => {
    console.log(
      `[DemoDataService] Demo mode - task deletion simulated: ${taskId}`,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Task deletion simulated",
    });
  },

  // Email Campaign Management
  getEmailCampaigns: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo email campaigns with filters:",
      filters,
    );
    let filteredCampaigns = [...DEMO_EMAIL_CAMPAIGNS];

    if (filters.status) {
      filteredCampaigns = filteredCampaigns.filter(
        (campaign) => campaign.status === filters.status,
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredCampaigns,
      total: filteredCampaigns.length,
    });
  },

  getCampaignById: (campaignId) => {
    console.log(`[DemoDataService] Returning campaign by ID: ${campaignId}`);
    const campaign = DEMO_EMAIL_CAMPAIGNS.find((c) => c.id === campaignId);
    return Promise.resolve({
      success: true,
      data: campaign,
    });
  },

  // Activity Management
  getActivities: (filters = {}) => {
    console.log(
      "[DemoDataService] Returning demo activities with filters:",
      filters,
    );
    let filteredActivities = [...DEMO_ACTIVITIES];

    if (filters.type) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.type === filters.type,
      );
    }
    if (filters.lead_id) {
      filteredActivities = filteredActivities.filter(
        (activity) => activity.lead_id === filters.lead_id,
      );
    }

    return Promise.resolve({
      success: true,
      data: filteredActivities,
      total: filteredActivities.length,
    });
  },

  createActivity: (activityData) => {
    console.log(
      "[DemoDataService] Demo mode - activity creation simulated:",
      activityData,
    );
    return Promise.resolve({
      success: true,
      message: "Demo mode: Activity creation simulated",
      data: {
        ...activityData,
        id: `demo-activity-new-${Date.now()}`,
        isDemo: true,
      },
    });
  },

  // User Todos
  getTodos: () => {
    console.log("[DemoDataService] Returning demo todos");
    return [
      {
        id: 'demo-todo-1',
        title: 'Follow up with Acme Corp lead',
        completed: false,
        priority: 'high',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-todo-2',
        title: 'Send proposal to TechStart Inc',
        completed: false,
        priority: 'medium',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-todo-3',
        title: 'Review dashboard metrics',
        completed: true,
        priority: 'low',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo-todo-4',
        title: 'Update email campaign templates',
        completed: false,
        priority: 'medium',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },
};

// Export a convenience function to check if demo mode should be used
export const shouldUseDemoData = () => {
  // This will be used by other services to check if demo agency is selected
  // The actual implementation will be in the AgencyContext
  return false; // Placeholder - will be overridden by context
};
