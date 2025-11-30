/**
 * Demo Data Seeding Service
 * Creates realistic, interconnected placeholder data for new users
 * All demo data is marked with is_placeholder_data: true for easy removal
 */

import { supabaseServer } from '../config/supabase-auth.js';

class DemoDataService {
  /**
   * Seed all demo data for a new user
   */
  async seedDemoData(userId) {
    try {
      console.log(`Starting demo data seed for user: ${userId}`);

      // Create data in order of dependencies
      const leads = await this.createDemoLeads(userId);
      const contacts = await this.createDemoContacts(userId);
      const opportunities = await this.createDemoOpportunities(userId, leads);
      const forms = await this.createDemoForms(userId);
      const workflows = await this.createDemoWorkflows(userId, forms);

      // Create activity data
      await this.createDemoActivities(userId, leads, contacts);
      await this.createDemoFormSubmissions(forms, leads);

      console.log(`Demo data seed completed for user: ${userId}`);

      return {
        success: true,
        data: {
          leads: leads.length,
          contacts: contacts.length,
          opportunities: opportunities.length,
          forms: forms.length,
          workflows: workflows.length
        }
      };
    } catch (error) {
      console.error('Error seeding demo data:', error);
      throw error;
    }
  }

  /**
   * Create demo leads with realistic data
   */
  async createDemoLeads(userId) {
    const demoLeads = [
      {
        name: 'Acme Corporation',
        email: 'contact@acmecorp.demo',
        phone: '+1 (555) 123-4567',
        website: 'https://acmecorp.demo',
        type: 'B2B_COMPANY',
        status: 'QUALIFIED',
        value: 15000,
        source: 'Website Form',
        industry: 'Technology',
        company_size: '50-200',
        custom_fields: {
          notes: 'Interested in enterprise plan. Decision maker: John Smith',
          last_contact: '2025-11-15'
        }
      },
      {
        name: 'TechStart Inc',
        email: 'hello@techstart.demo',
        phone: '+1 (555) 234-5678',
        website: 'https://techstart.demo',
        type: 'B2B_COMPANY',
        status: 'NEW',
        value: 8000,
        source: 'LinkedIn Outreach',
        industry: 'SaaS',
        company_size: '10-50',
        custom_fields: {
          notes: 'Early stage startup, looking for basic CRM solution',
          last_contact: '2025-11-18'
        }
      },
      {
        name: 'Global Solutions Ltd',
        email: 'info@globalsolutions.demo',
        phone: '+1 (555) 345-6789',
        website: 'https://globalsolutions.demo',
        type: 'B2B_COMPANY',
        status: 'NURTURE',
        value: 25000,
        source: 'Referral',
        industry: 'Consulting',
        company_size: '200-500',
        custom_fields: {
          notes: 'Large consulting firm. Needs multi-team access',
          last_contact: '2025-11-10'
        }
      },
      {
        name: 'InnovateCo',
        email: 'sales@innovateco.demo',
        phone: '+1 (555) 456-7890',
        website: 'https://innovateco.demo',
        type: 'B2B_COMPANY',
        status: 'QUALIFIED',
        value: 12000,
        source: 'Google Ads',
        industry: 'E-commerce',
        company_size: '20-50',
        custom_fields: {
          notes: 'Growing fast, need automation features',
          last_contact: '2025-11-17'
        }
      },
      {
        name: 'DataDriven Analytics',
        email: 'contact@datadriven.demo',
        phone: '+1 (555) 567-8901',
        website: 'https://datadriven.demo',
        type: 'B2B_COMPANY',
        status: 'DISQUALIFIED',
        value: 5000,
        source: 'Cold Email',
        industry: 'Data Analytics',
        company_size: '5-10',
        custom_fields: {
          notes: 'Budget too low for our pricing',
          last_contact: '2025-11-05'
        }
      }
    ];

    const { data, error} = await supabaseServer
      .from('leads')
      .insert(demoLeads.map(lead => ({
        ...lead,
        is_placeholder_data: true,
        created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 14 days
      })))
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Create demo contacts linked to leads
   */
  async createDemoContacts(userId) {
    const demoContacts = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@acmecorp.demo',
        phone: '+1 (555) 123-4567',
        title: 'CEO',
        company: 'Acme Corporation',
        source: 'Website Form',
        custom_fields: {
          linkedin: 'https://linkedin.com/in/johnsmith',
          timezone: 'America/New_York'
        }
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@techstart.demo',
        phone: '+1 (555) 234-5678',
        title: 'Founder',
        company: 'TechStart Inc',
        source: 'LinkedIn Outreach',
        custom_fields: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          timezone: 'America/Los_Angeles'
        }
      },
      {
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@globalsolutions.demo',
        phone: '+1 (555) 345-6789',
        title: 'VP of Operations',
        company: 'Global Solutions Ltd',
        source: 'Referral',
        custom_fields: {
          linkedin: 'https://linkedin.com/in/michaelchen',
          timezone: 'America/Chicago'
        }
      },
      {
        first_name: 'Emma',
        last_name: 'Williams',
        email: 'emma@innovateco.demo',
        phone: '+1 (555) 456-7890',
        title: 'Head of Sales',
        company: 'InnovateCo',
        source: 'Google Ads',
        custom_fields: {
          linkedin: 'https://linkedin.com/in/emmawilliams',
          timezone: 'America/Denver'
        }
      }
    ];

    const { data, error } = await supabaseServer
      .from('contacts')
      .insert(demoContacts.map(contact => ({
        ...contact,
        is_placeholder_data: true,
        created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
      })))
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Create demo opportunities linked to leads
   */
  async createDemoOpportunities(userId, leads) {
    if (!leads || leads.length === 0) return [];

    const opportunities = [
      {
        lead_id: leads[0]?.id, // Acme Corporation
        name: 'Acme Corp - Enterprise Plan',
        stage: 'PROPOSAL',
        amount: 15000,
        probability: 75,
        expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        description: 'Enterprise CRM solution for 50+ users with custom integrations',
        custom_fields: {
          decision_maker: 'John Smith (CEO)',
          competitors: 'Salesforce, HubSpot',
          next_step: 'Schedule demo call'
        }
      },
      {
        lead_id: leads[1]?.id, // TechStart Inc
        name: 'TechStart - Startup Plan',
        stage: 'DISCOVERY',
        amount: 8000,
        probability: 40,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Basic CRM setup for growing startup team',
        custom_fields: {
          decision_maker: 'Sarah Johnson (Founder)',
          budget_confirmed: 'Yes',
          next_step: 'Send pricing proposal'
        }
      },
      {
        lead_id: leads[2]?.id, // Global Solutions
        name: 'Global Solutions - Multi-Team Setup',
        stage: 'NEGOTIATION',
        amount: 25000,
        probability: 60,
        expected_close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Large-scale CRM deployment for consulting teams',
        custom_fields: {
          decision_maker: 'Michael Chen (VP Operations)',
          contract_length: '2 years',
          next_step: 'Review legal terms'
        }
      },
      {
        lead_id: leads[3]?.id, // InnovateCo
        name: 'InnovateCo - Growth Plan',
        stage: 'QUALIFIED',
        amount: 12000,
        probability: 50,
        expected_close_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'CRM with automation for scaling e-commerce business',
        custom_fields: {
          decision_maker: 'Emma Williams (Head of Sales)',
          pain_points: 'Manual follow-ups, lost leads',
          next_step: 'Product demo scheduled'
        }
      }
    ];

    const { data, error } = await supabaseServer
      .from('opportunities')
      .insert(opportunities.map(opp => ({
        ...opp,
        is_placeholder_data: true,
        status: 'OPEN'
      })))
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Create demo forms
   */
  async createDemoForms(userId) {
    const demoForms = [
      {
        title: 'Contact Us Form',
        description: 'General inquiry form for website visitors',
        questions: [
          {
            id: 'q1',
            type: 'text',
            title: 'What is your name?',
            required: true,
            placeholder: 'John Doe'
          },
          {
            id: 'q2',
            type: 'email',
            title: 'What is your email address?',
            required: true,
            placeholder: 'john@company.com'
          },
          {
            id: 'q3',
            type: 'phone',
            title: 'Phone number',
            required: false
          },
          {
            id: 'q4',
            type: 'textarea',
            title: 'How can we help you?',
            required: true,
            placeholder: 'Tell us about your needs...'
          }
        ],
        settings: {
          branding: true,
          analytics: true,
          notifications: true,
          mode: 'standard',
          theme: 'default',
          create_contact: true
        },
        is_active: true,
        is_published: true,
        total_responses: 12
      },
      {
        title: 'Product Demo Request',
        description: 'Request a personalized product demonstration',
        questions: [
          {
            id: 'q1',
            type: 'text',
            title: 'Company name',
            required: true
          },
          {
            id: 'q2',
            type: 'email',
            title: 'Work email',
            required: true
          },
          {
            id: 'q3',
            type: 'select',
            title: 'Company size',
            required: true,
            options: ['1-10', '11-50', '51-200', '201-500', '500+']
          },
          {
            id: 'q4',
            type: 'select',
            title: 'Industry',
            required: true,
            options: ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Other']
          },
          {
            id: 'q5',
            type: 'textarea',
            title: 'What features are you most interested in?',
            required: false
          }
        ],
        settings: {
          branding: true,
          analytics: true,
          notifications: true,
          mode: 'standard',
          theme: 'default',
          create_contact: true,
          lead_scoring_enabled: true
        },
        is_active: true,
        is_published: true,
        total_responses: 8
      }
    ];

    const { data, error } = await supabaseServer
      .from('forms')
      .insert(demoForms.map(form => ({
        ...form,
        is_placeholder_data: true
      })))
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Create demo workflows linked to forms
   */
  async createDemoWorkflows(userId, forms) {
    const workflows = [
      {
        name: 'New Lead Follow-Up Sequence',
        description: 'Automatic email sequence for new leads from contact form',
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            data: { label: 'Form Submitted', type: 'form_submission' },
            position: { x: 100, y: 100 }
          },
          {
            id: 'action-1',
            type: 'action',
            data: { label: 'Send Welcome Email', type: 'send_email' },
            position: { x: 100, y: 200 }
          },
          {
            id: 'delay-1',
            type: 'delay',
            data: { label: 'Wait 2 Days', duration: '2d' },
            position: { x: 100, y: 300 }
          },
          {
            id: 'action-2',
            type: 'action',
            data: { label: 'Send Follow-Up Email', type: 'send_email' },
            position: { x: 100, y: 400 }
          }
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'action-1', target: 'delay-1' },
          { id: 'e3', source: 'delay-1', target: 'action-2' }
        ],
        is_active: true,
        execution_mode: 'sequential',
        total_executions: 5,
        successful_executions: 5
      },
      {
        name: 'Demo Request Notification',
        description: 'Notify sales team when someone requests a demo',
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            data: { label: 'Demo Form Submitted', type: 'form_submission' },
            position: { x: 100, y: 100 }
          },
          {
            id: 'action-1',
            type: 'action',
            data: { label: 'Create Lead', type: 'create_lead' },
            position: { x: 100, y: 200 }
          },
          {
            id: 'action-2',
            type: 'action',
            data: { label: 'Notify Sales Team', type: 'send_notification' },
            position: { x: 100, y: 300 }
          }
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'action-1', target: 'action-2' }
        ],
        is_active: true,
        execution_mode: 'sequential',
        total_executions: 3,
        successful_executions: 3
      }
    ];

    const { data, error } = await supabaseServer
      .from('email_marketing_workflows')
      .insert(workflows.map(workflow => ({
        ...workflow,
        created_by: userId,
        is_placeholder_data: true
      })))
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Create demo activities (notes, calls, meetings)
   */
  async createDemoActivities(userId, leads, contacts) {
    // This will be implemented when we have the activities table
    // For now, return empty array
    return [];
  }

  /**
   * Create demo form submissions
   */
  async createDemoFormSubmissions(forms, leads) {
    // This will be implemented to create sample form submissions
    // For now, return empty array
    return [];
  }

  /**
   * Clear ALL placeholder data for a user
   */
  async clearPlaceholderData(userId) {
    try {
      console.log(`Clearing all placeholder data for user: ${userId}`);

      // Delete from all tables where is_placeholder_data = true
      const tables = [
        'leads',
        'contacts',
        'opportunities',
        'forms',
        'form_responses',
        'email_marketing_workflows',
        'email_workflow_executions'
      ];

      const results = {};

      for (const table of tables) {
        try {
          // For tables with user_id
          if (['leads', 'contacts', 'opportunities', 'forms'].includes(table)) {
            const { data, error } = await supabaseServer
              .from(table)
              .delete()
              .eq('is_placeholder_data', true)
              .select('id');

            results[table] = data?.length || 0;
            if (error) console.error(`Error clearing ${table}:`, error);
          }
          // For workflows with created_by
          else if (table === 'email_marketing_workflows') {
            const { data, error } = await supabaseServer
              .from(table)
              .delete()
              .eq('created_by', userId)
              .eq('is_placeholder_data', true)
              .select('id');

            results[table] = data?.length || 0;
            if (error) console.error(`Error clearing ${table}:`, error);
          }
        } catch (err) {
          console.error(`Error processing table ${table}:`, err);
        }
      }

      console.log(`Placeholder data cleared:`, results);

      return {
        success: true,
        cleared: results
      };
    } catch (error) {
      console.error('Error clearing placeholder data:', error);
      throw error;
    }
  }

  /**
   * Check if user has placeholder data
   */
  async hasPlaceholderData(userId) {
    try {
      const { data, error } = await supabaseServer
        .from('leads')
        .select('id')
        .eq('user_id', userId)
        .eq('is_placeholder_data', true)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking placeholder data:', error);
      return false;
    }
  }
}

export default new DemoDataService();
