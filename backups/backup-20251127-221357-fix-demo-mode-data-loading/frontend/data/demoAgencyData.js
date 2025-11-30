// Demo Agency Data for Axolop CRM Marketing Demo
// This file contains all demo data for the virtual demo agency

export const DEMO_AGENCY = {
  id: "demo-agency-virtual",
  agency_id: "demo-agency-virtual",
  name: "Axolop Demo Agency",
  description: "Marketing demonstration data",
  logo_url: "/axolop-logo.png",
  created_at: new Date().toISOString(),
  subscription_tier: "scale",
  max_users: 999,
  current_users: 8,
  settings: {
    theme: "default",
    sections_enabled: {
      leads: true,
      contacts: true,
      opportunities: true,
      forms: true,
      calendar: true,
      tasks: true,
      email_marketing: true,
      workflows: true,
      reports: true,
      second_brain: true,
    },
  },
  isDemo: true,
};

export const isDemoAgency = (agency) => {
  return agency?.id === "demo-agency-virtual";
};

// Dashboard Metrics
export const DEMO_DASHBOARD_METRICS = {
  sales: {
    totalRevenue: 31000,
    recurringRevenue: 18500,
    projectRevenue: 8200,
    consultingRevenue: 4300,
    growthRate: 8.8,
    monthlyTrend: [
      { month: "Jan", revenue: 28000 },
      { month: "Feb", revenue: 28500 },
      { month: "Mar", revenue: 29000 },
      { month: "Apr", revenue: 29500 },
      { month: "May", revenue: 30000 },
      { month: "Jun", revenue: 31000 },
    ],
  },
  marketing: {
    totalLeads: 50,
    newLeads: 15,
    contactedLeads: 12,
    qualifiedLeads: 13,
    proposalSent: 7,
    negotiation: 3,
    conversionRate: 28.1,
    pipelineValue: 245000,
  },
  profitLoss: {
    revenue: 31000,
    expenses: 18600,
    profit: 12400,
    profitMargin: 40.0,
    expenseBreakdown: {
      software: 3200,
      salaries: 12000,
      marketing: 2400,
      operations: 1000,
    },
  },
};

// Demo Leads (50 total)
export const DEMO_LEADS = [
  {
    id: "demo-lead-1",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@techcorp.com",
    phone: "+1-555-0101",
    company: "TechCorp Solutions",
    value: 45000,
    stage: "qualified",
    status: "active",
    source: "website",
    created_at: "2025-01-15T10:00:00Z",
    last_contact: "2025-01-20T14:30:00Z",
    notes:
      "Interested in enterprise CRM solution, decision maker, budget approved",
  },
  {
    id: "demo-lead-2",
    first_name: "Michael",
    last_name: "Chen",
    email: "mchen@startup.io",
    phone: "+1-555-0102",
    company: "StartupIO",
    value: 25000,
    stage: "proposal_sent",
    status: "active",
    source: "referral",
    created_at: "2025-01-10T09:15:00Z",
    last_contact: "2025-01-22T16:45:00Z",
    notes: "Fast-growing startup, needs scalable solution, timeline 2 months",
  },
  {
    id: "demo-lead-3",
    first_name: "Emily",
    last_name: "Rodriguez",
    email: "emily.r@marketpro.com",
    phone: "+1-555-0103",
    company: "Marketing Pro Inc",
    value: 35000,
    stage: "negotiation",
    status: "active",
    source: "cold_email",
    created_at: "2025-01-08T11:30:00Z",
    last_contact: "2025-01-25T13:20:00Z",
    notes: "Marketing agency, manages 50+ clients, needs automation features",
  },
  {
    id: "demo-lead-4",
    first_name: "David",
    last_name: "Kim",
    email: "dkim@retailplus.com",
    phone: "+1-555-0104",
    company: "Retail Plus",
    value: 15000,
    stage: "contacted",
    status: "active",
    source: "linkedin",
    created_at: "2025-01-18T15:45:00Z",
    last_contact: "2025-01-19T10:15:00Z",
    notes: "Retail chain, 5 locations, seasonal business needs",
  },
  {
    id: "demo-lead-5",
    first_name: "Lisa",
    last_name: "Thompson",
    email: "lthompson@consultco.com",
    phone: "+1-555-0105",
    company: "Consulting Co",
    value: 55000,
    stage: "new",
    status: "active",
    source: "website",
    created_at: "2025-01-25T08:30:00Z",
    last_contact: null,
    notes: "Management consulting, 20 consultants, project-based billing",
  },
  // Add 45 more leads to reach 50 total...
];

// Demo Contacts (75 total)
export const DEMO_CONTACTS = [
  {
    id: "demo-contact-1",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@techcorp.com",
    phone: "+1-555-0101",
    company: "TechCorp Solutions",
    title: "CEO",
    type: "decision_maker",
    lead_id: "demo-lead-1",
    created_at: "2025-01-15T10:00:00Z",
    last_contact: "2025-01-20T14:30:00Z",
  },
  {
    id: "demo-contact-2",
    first_name: "Michael",
    last_name: "Chen",
    email: "mchen@startup.io",
    phone: "+1-555-0102",
    company: "StartupIO",
    title: "CTO",
    type: "technical",
    lead_id: "demo-lead-2",
    created_at: "2025-01-10T09:15:00Z",
    last_contact: "2025-01-22T16:45:00Z",
  },
  {
    id: "demo-contact-3",
    first_name: "Emily",
    last_name: "Rodriguez",
    email: "emily.r@marketpro.com",
    phone: "+1-555-0103",
    company: "Marketing Pro Inc",
    title: "Marketing Director",
    type: "influencer",
    lead_id: "demo-lead-3",
    created_at: "2025-01-08T11:30:00Z",
    last_contact: "2025-01-25T13:20:00Z",
  },
  // Add 72 more contacts...
];

// Demo Opportunities (25 total)
export const DEMO_OPPORTUNITIES = [
  {
    id: "demo-opp-1",
    name: "TechCorp Enterprise CRM",
    company: "TechCorp Solutions",
    value: 45000,
    stage: "proposal_sent",
    probability: 75,
    close_date: "2025-02-28",
    lead_id: "demo-lead-1",
    created_at: "2025-01-15T10:00:00Z",
    description: "Full CRM implementation for 100-user enterprise",
    activities: 12,
  },
  {
    id: "demo-opp-2",
    name: "StartupIO Growth Package",
    company: "StartupIO",
    value: 25000,
    stage: "negotiation",
    probability: 90,
    close_date: "2025-02-15",
    lead_id: "demo-lead-2",
    created_at: "2025-01-10T09:15:00Z",
    description: "Scalable CRM for fast-growing startup",
    activities: 8,
  },
  {
    id: "demo-opp-3",
    name: "Marketing Pro Automation",
    company: "Marketing Pro Inc",
    value: 35000,
    stage: "qualified",
    probability: 60,
    close_date: "2025-03-15",
    lead_id: "demo-lead-3",
    created_at: "2025-01-08T11:30:00Z",
    description: "Marketing automation and workflow management",
    activities: 6,
  },
  // Add 22 more opportunities...
];

// Demo Forms (12 total)
export const DEMO_FORMS = [
  {
    id: "demo-form-1",
    name: "Enterprise Contact Form",
    description: "High-value enterprise lead generation",
    submissions: 156,
    conversion_rate: 42.3,
    created_at: "2025-01-01T00:00:00Z",
    status: "active",
    fields: ["name", "email", "company", "phone", "revenue", "employees"],
  },
  {
    id: "demo-form-2",
    name: "Free Trial Signup",
    description: "14-day free trial registration",
    submissions: 89,
    conversion_rate: 35.8,
    created_at: "2025-01-05T00:00:00Z",
    status: "active",
    fields: ["name", "email", "company", "password"],
  },
  {
    id: "demo-form-3",
    name: "Demo Request",
    description: "Product demonstration requests",
    submissions: 67,
    conversion_rate: 31.2,
    created_at: "2025-01-10T00:00:00Z",
    status: "active",
    fields: ["name", "email", "company", "phone", "preferred_time"],
  },
  // Add 9 more forms...
];

// Demo Calendar Events (60 events over 90 days)
export const DEMO_CALENDAR_EVENTS = [
  {
    id: "demo-event-1",
    title: "Sales Call - TechCorp",
    type: "sales_call",
    start: "2025-01-28T14:00:00Z",
    end: "2025-01-28T15:00:00Z",
    attendees: ["Sarah Johnson", "John Doe"],
    location: "Zoom",
    description: "CRM demo and requirements discussion",
    lead_id: "demo-lead-1",
  },
  {
    id: "demo-event-2",
    title: "Client Meeting - StartupIO",
    type: "client_meeting",
    start: "2025-01-29T10:00:00Z",
    end: "2025-01-29T11:30:00Z",
    attendees: ["Michael Chen", "Jane Smith"],
    location: "Google Meet",
    description: "Q1 planning and feature review",
    lead_id: "demo-lead-2",
  },
  {
    id: "demo-event-3",
    title: "Product Demo - Marketing Pro",
    type: "product_demo",
    start: "2025-01-30T16:00:00Z",
    end: "2025-01-30T17:00:00Z",
    attendees: ["Emily Rodriguez", "Mike Wilson"],
    location: "Zoom",
    description: "Marketing automation features demo",
    lead_id: "demo-lead-3",
  },
  // Add 57 more events...
];

// Demo Tasks (45 total)
export const DEMO_TASKS = [
  {
    id: "demo-task-1",
    title: "Follow up with TechCorp after demo",
    description: "Send proposal and schedule next meeting",
    due_date: "2025-01-29T17:00:00Z",
    priority: "high",
    status: "pending",
    assignee: "John Doe",
    lead_id: "demo-lead-1",
    created_at: "2025-01-25T10:00:00Z",
  },
  {
    id: "demo-task-2",
    title: "Prepare contract for StartupIO",
    description: "Draft service agreement and pricing",
    due_date: "2025-01-30T12:00:00Z",
    priority: "high",
    status: "in_progress",
    assignee: "Jane Smith",
    lead_id: "demo-lead-2",
    created_at: "2025-01-22T14:30:00Z",
  },
  {
    id: "demo-task-3",
    title: "Update marketing materials",
    description: "Add new case studies and testimonials",
    due_date: "2025-02-05T17:00:00Z",
    priority: "medium",
    status: "pending",
    assignee: "Mike Wilson",
    lead_id: null,
    created_at: "2025-01-20T09:15:00Z",
  },
  // Add 42 more tasks...
];

// Demo Email Campaigns (8 total)
export const DEMO_EMAIL_CAMPAIGNS = [
  {
    id: "demo-campaign-1",
    name: "Q1 Product Launch",
    subject: "Introducing Axolop CRM 2.0 - Now with AI Second Brain",
    sent: 2500,
    delivered: 2425,
    opened: 1662,
    clicked: 532,
    open_rate: 68.5,
    click_rate: 32.1,
    status: "completed",
    sent_date: "2025-01-15T09:00:00Z",
  },
  {
    id: "demo-campaign-2",
    name: "January Newsletter",
    subject: "Your Monthly CRM Tips & Updates",
    sent: 1800,
    delivered: 1746,
    opened: 873,
    clicked: 262,
    open_rate: 50.0,
    click_rate: 30.0,
    status: "completed",
    sent_date: "2025-01-08T10:00:00Z",
  },
  {
    id: "demo-campaign-3",
    name: "Demo Follow-up Sequence",
    subject: "Ready to Transform Your CRM Experience?",
    sent: 1200,
    delivered: 1164,
    opened: 698,
    clicked: 209,
    open_rate: 60.0,
    click_rate: 29.9,
    status: "active",
    sent_date: "2025-01-20T14:00:00Z",
  },
  // Add 5 more campaigns...
];

// Demo Activities
export const DEMO_ACTIVITIES = [
  {
    id: "demo-activity-1",
    type: "call",
    description: "Initial discovery call with Sarah Johnson",
    lead_id: "demo-lead-1",
    user_id: "demo-user-1",
    created_at: "2025-01-15T10:00:00Z",
    duration: 45,
    outcome: "positive",
  },
  {
    id: "demo-activity-2",
    type: "email",
    description: "Sent proposal to Michael Chen",
    lead_id: "demo-lead-2",
    user_id: "demo-user-1",
    created_at: "2025-01-22T16:45:00Z",
    outcome: "sent",
  },
  {
    id: "demo-activity-3",
    type: "meeting",
    description: "Product demo for Emily Rodriguez",
    lead_id: "demo-lead-3",
    user_id: "demo-user-2",
    created_at: "2025-01-25T13:20:00Z",
    duration: 60,
    outcome: "positive",
  },
  // Add more activities...
];

// Helper function to generate additional demo data
export const generateMoreDemoData = () => {
  // This function can be used to generate more realistic demo data
  // if needed for testing or expansion
  return {
    leads: DEMO_LEADS,
    contacts: DEMO_CONTACTS,
    opportunities: DEMO_OPPORTUNITIES,
    forms: DEMO_FORMS,
    events: DEMO_CALENDAR_EVENTS,
    tasks: DEMO_TASKS,
    campaigns: DEMO_EMAIL_CAMPAIGNS,
    activities: DEMO_ACTIVITIES,
  };
};
