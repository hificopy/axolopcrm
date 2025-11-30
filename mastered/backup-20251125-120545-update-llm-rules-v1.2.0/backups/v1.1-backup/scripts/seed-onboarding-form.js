/**
 * Seed Onboarding Form to Database
 * Creates the strategic 15-question onboarding form that can be edited by admin
 * Run with: node scripts/seed-onboarding-form.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the 15 strategic onboarding questions
const onboardingQuestions = [
  {
    id: 'q1',
    type: 'short-text',
    title: "First, what's your name?",
    required: true,
    options: [],
    settings: {
      placeholder: 'Enter your name'
    },
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q2',
    type: 'email',
    title: "What's your email address?",
    required: true,
    options: [],
    settings: {
      placeholder: 'your.email@company.com',
      validateEmail: true
    },
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    title: 'What type of business do you run?',
    required: true,
    options: [
      'Marketing/Advertising Agency',
      'GoHighLevel Agency',
      'Digital Marketing Consultant',
      'SaaS Company',
      'E-commerce Business',
      'Service Provider (Freelancer/Consultant)',
      'Real Estate Agency',
      'Other'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    title: 'How many people are on your team?',
    required: true,
    options: [
      'Just me (Solo)',
      '2-5 people',
      '6-10 people',
      '11-25 people',
      '26-50 people',
      '50+ people'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q5',
    type: 'checkboxes',
    title: 'Which tools are you currently using? (Select all that apply)',
    required: true,
    options: [
      'GoHighLevel ($497/mo)',
      'Typeform/Jotform',
      'ClickUp/Asana/Monday.com',
      'Notion/Coda',
      'Miro/Lucidchart',
      'Calendly/iClosed',
      'ActiveCampaign/Klaviyo/Mailchimp',
      'HubSpot',
      'Salesforce',
      'Google Sheets/Excel (manual tracking)',
      'None - Starting fresh'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    title: 'How much do you spend per month on these tools combined?',
    required: true,
    options: [
      'Less than $100',
      '$100 - $500',
      '$500 - $1,000',
      '$1,000 - $2,000',
      '$2,000 - $5,000',
      '$5,000+'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q7',
    type: 'multiple-choice',
    title: "What's your biggest frustration with current tools?",
    required: true,
    options: [
      'Too many disconnected tools - context switching kills productivity',
      "Too expensive - paying for features I don't use",
      'Too complex - need something simpler',
      'Missing features - need more advanced capabilities',
      "Poor integration - data doesn't sync properly",
      'Slow performance - tools are laggy',
      "Bad support - can't get help when needed"
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q8',
    type: 'multiple-choice',
    title: 'How many leads do you manage per month?',
    required: true,
    options: [
      'Less than 50',
      '50 - 200',
      '200 - 500',
      '500 - 1,000',
      '1,000 - 5,000',
      '5,000+'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q9',
    type: 'multiple-choice',
    title: 'What will you primarily use this CRM for?',
    required: true,
    options: [
      'Lead Generation & Nurturing',
      'Sales Pipeline Management',
      'Email Marketing Campaigns',
      'Client Management & Communication',
      'Project Management',
      'Team Collaboration',
      'All of the above'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q10',
    type: 'checkboxes',
    title: 'Which features are absolutely essential for you? (Select top 3-5)',
    required: true,
    options: [
      'Email Marketing & Automation',
      'Live Calls & Dialer',
      'Forms & Lead Capture',
      'Calendar & Scheduling',
      'Pipeline & Deal Management',
      'Advanced Reporting & Analytics',
      'Workflow Automation',
      'Project Management',
      'Team Collaboration',
      'AI Assistant',
      'Mind Maps & Visual Planning',
      'Second Brain / Knowledge Base'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q11',
    type: 'multiple-choice',
    title: 'How would you describe your current automation setup?',
    required: true,
    options: [
      'No automation - everything is manual',
      'Basic automation - simple email sequences',
      'Intermediate - multi-step workflows with conditions',
      'Advanced - complex automations with integrations',
      'Expert - custom APIs and advanced triggers'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q12',
    type: 'multiple-choice',
    title: 'How many marketing emails do you send per month?',
    required: true,
    options: [
      'Less than 1,000',
      '1,000 - 10,000',
      '10,000 - 50,000',
      '50,000 - 100,000',
      '100,000+'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q13',
    type: 'checkboxes',
    title: 'Which integrations do you need? (Select all that apply)',
    required: false,
    options: [
      'Google Calendar',
      'Gmail',
      'Outlook',
      'Twilio (Calling/SMS)',
      'SendGrid (Email Delivery)',
      'Stripe (Payments)',
      'Zapier',
      'Slack',
      'Zoom',
      'QuickBooks',
      'Shopify',
      'WordPress'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q14',
    type: 'multiple-choice',
    title: 'When do you need to have this up and running?',
    required: true,
    options: [
      'Immediately - today/this week',
      'Within 2 weeks',
      'Within 1 month',
      'Within 3 months',
      'Just exploring - no rush'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  },
  {
    id: 'q15',
    type: 'checkboxes',
    title: 'What are your main goals for the next 90 days? (Select all that apply)',
    required: true,
    options: [
      'Generate more leads',
      'Close more deals',
      'Improve email marketing ROI',
      'Save time with automation',
      'Reduce tool costs',
      'Improve team collaboration',
      'Better track pipeline & forecasting',
      'Scale operations',
      'Improve customer relationships',
      'Get better insights & reporting'
    ],
    settings: {},
    lead_scoring_enabled: false,
    lead_scoring: {},
    conditional_logic: []
  }
];

// Define form settings
const formSettings = {
  branding: true,
  analytics: true,
  notifications: true,
  mode: 'sequential', // Typeform-style one question at a time
  theme: 'dark',
  create_contact: true, // Auto-create contact/lead
  contact_mapping: {
    email: 'q2',
    name: 'q1'
  },
  workflow_nodes: [],
  workflow_edges: [],
  endings: [
    {
      id: 'end-default',
      title: 'Thank you for completing the onboarding!',
      message: 'We\'re analyzing your responses to create the perfect CRM experience for you.',
      icon: 'success',
      mark_as_qualified: true
    }
  ]
};

async function seedOnboardingForm() {
  console.log('🚀 Starting onboarding form seed...\n');

  try {
    // Check if onboarding form already exists
    const { data: existingForm, error: checkError } = await supabase
      .from('forms')
      .select('id, title')
      .eq('title', 'CRM Onboarding - Regular Flow')
      .is('deleted_at', null)
      .single();

    if (existingForm) {
      console.log('⚠️  Onboarding form already exists:');
      console.log(`   ID: ${existingForm.id}`);
      console.log(`   Title: ${existingForm.title}`);
      console.log('\n✅ No action needed - form is already seeded');
      return;
    }

    // Create the onboarding form
    console.log('📝 Creating onboarding form...');
    const { data: newForm, error: createError } = await supabase
      .from('forms')
      .insert([{
        title: 'CRM Onboarding - Regular Flow',
        description: 'Strategic 15-question onboarding to tailor the perfect CRM experience. This form is displayed when users click "Get Started Free" from the landing page.',
        questions: onboardingQuestions,
        settings: formSettings,
        is_active: true,
        is_published: true
      }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log('\n✅ Successfully created onboarding form!');
    console.log(`   ID: ${newForm.id}`);
    console.log(`   Title: ${newForm.title}`);
    console.log(`   Questions: ${onboardingQuestions.length}`);
    console.log(`   Published: ${newForm.is_published ? 'Yes' : 'No'}`);

    // Create affiliate variant
    console.log('\n📝 Creating affiliate onboarding form variant...');
    const affiliateFormSettings = {
      ...formSettings,
      endings: [
        {
          id: 'end-affiliate',
          title: 'Perfect! Your 30-day FREE trial is ready!',
          message: "We're creating your personalized CRM setup. Get ready to experience the new age of CRMs.",
          icon: 'success',
          mark_as_qualified: true
        }
      ]
    };

    const { data: affiliateForm, error: affiliateError } = await supabase
      .from('forms')
      .insert([{
        title: 'CRM Onboarding - Affiliate Flow',
        description: 'Strategic 15-question onboarding for affiliate referrals with 30-day FREE trial messaging. This form is displayed when users arrive via affiliate links.',
        questions: onboardingQuestions,
        settings: affiliateFormSettings,
        is_active: true,
        is_published: true
      }])
      .select()
      .single();

    if (affiliateError) {
      console.warn('\n⚠️  Could not create affiliate variant:', affiliateError.message);
    } else {
      console.log('\n✅ Successfully created affiliate onboarding form!');
      console.log(`   ID: ${affiliateForm.id}`);
      console.log(`   Title: ${affiliateForm.title}`);
    }

    console.log('\n📋 Admin Access Instructions:');
    console.log('   1. Login with axolopcrm@gmail.com');
    console.log('   2. Navigate to Forms section');
    console.log('   3. Edit "CRM Onboarding - Regular Flow" or "CRM Onboarding - Affiliate Flow"');
    console.log('   4. Customize questions, logic, and endings as needed');

    console.log('\n🎉 Onboarding form seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding onboarding form:', error);
    console.error('   Message:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedOnboardingForm();
