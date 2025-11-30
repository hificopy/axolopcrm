import UseCasePageTemplate from './UseCasePageTemplate';
import {
  Megaphone,
  CreditCard,
  Layers,
  Clock,
  FileSpreadsheet,
  RefreshCw,
  Users2,
  GitBranch,
  Mail,
  FileText,
  Calendar,
  Workflow,
  BarChart3,
  Brain,
} from 'lucide-react';

/**
 * Marketing Agencies Use Case Page
 * Primary ICP - replaces 10+ tools positioning
 */
const MarketingAgencies = () => {
  const pageData = {
    // Hero Section
    title: "Replace 10+ Tools With One Platform",
    subtitle: "Built for Marketing Agencies",
    description: "Stop paying $1,500+/month for disconnected tools. Axolop gives your agency CRM, forms, email marketing, automation, and AI—all in one place.",
    icon: Megaphone,
    iconColor: '#2DCE89',
    iconBg: '#047857',

    // Hero Stats
    heroStats: [
      { value: '$1,375', label: 'Saved Monthly' },
      { value: '10+', label: 'Tools Replaced' },
      { value: '20%', label: 'Higher Margins' },
      { value: '1', label: 'Platform' },
    ],

    // Pain Points
    painPointsTitle: "Tired of Tool Sprawl?",
    painPointsSubtitle: "The hidden cost of disconnected systems",
    painPoints: [
      {
        icon: CreditCard,
        title: "Bleeding Money on SaaS",
        description: "GoHighLevel, Typeform, ClickUp, Notion, Calendly, ActiveCampaign... your software costs are out of control."
      },
      {
        icon: Layers,
        title: "Data Lives Everywhere",
        description: "Client info in one tool, tasks in another, emails in a third. No single source of truth."
      },
      {
        icon: Clock,
        title: "Wasting Time on Context Switching",
        description: "Your team spends hours jumping between tabs instead of doing billable work."
      },
      {
        icon: FileSpreadsheet,
        title: "Manual Reporting Nightmares",
        description: "Pulling data from 5 different systems to create client reports? There has to be a better way."
      },
      {
        icon: RefreshCw,
        title: "Onboarding New Clients is Chaos",
        description: "Every new client means setting up accounts in multiple systems. It's slow and error-prone."
      },
    ],

    // Solutions
    solutionsTitle: "Everything Your Agency Needs",
    solutionsSubtitle: "One platform to run your entire operation",
    solutions: [
      {
        icon: Users2,
        feature: "Client & Lead Management",
        description: "Track every prospect and client in one CRM. Custom fields, tags, and segments let you organize your way.",
        benefit: "Replace: HubSpot, Salesforce"
      },
      {
        icon: FileText,
        feature: "Form Builder",
        description: "Create beautiful forms for lead capture, intake questionnaires, and client feedback. Drag-and-drop builder, conditional logic included.",
        benefit: "Replace: Typeform, JotForm"
      },
      {
        icon: Mail,
        feature: "Email Marketing",
        description: "Send campaigns, build automations, and nurture leads. Drag-and-drop email builder with templates.",
        benefit: "Replace: ActiveCampaign, Mailchimp"
      },
      {
        icon: Calendar,
        feature: "Calendar & Scheduling",
        description: "Let clients and prospects book meetings. Syncs with Google Calendar, handles timezones, sends reminders.",
        benefit: "Replace: Calendly, iClosed"
      },
      {
        icon: Workflow,
        feature: "Workflow Automation",
        description: "Build visual automations with triggers, conditions, and actions. Connect everything without Zapier.",
        benefit: "Replace: Zapier, Make"
      },
      {
        icon: GitBranch,
        feature: "Project Pipeline",
        description: "Track client projects from pitch to completion with visual Kanban boards and custom stages.",
        benefit: "Replace: ClickUp, Asana"
      },
      {
        icon: BarChart3,
        feature: "Analytics & Reporting",
        description: "Dashboards showing pipeline health, campaign performance, and team productivity. Export beautiful client reports.",
        benefit: "Replace: Databox, manual spreadsheets"
      },
      {
        icon: Brain,
        feature: "AI Second Brain",
        description: "Your agency's knowledge base with AI-powered search. Store SOPs, client notes, and tribal knowledge.",
        benefit: "Replace: Notion, Coda"
      },
    ],

    // Benefits
    benefitsTitle: "Transform Your Agency",
    benefits: [
      {
        metric: "$1,375",
        title: "Saved Per Month",
        description: "Stop paying for 10+ tools when one does it all."
      },
      {
        metric: "20%",
        title: "Higher Profit Margins",
        description: "Lower overhead + more billable hours = more profit."
      },
      {
        metric: "50%",
        title: "Faster Client Onboarding",
        description: "One system to set up instead of five."
      },
    ],

    // Testimonials
    testimonials: [
      {
        quote: "We were spending $2,100/month on different tools. Axolop cut that to $349 and actually works better because everything is connected.",
        name: "Alex Rivera",
        role: "Founder",
        company: "Rivera Digital Agency",
        rating: 5
      },
      {
        quote: "The form builder alone replaced Typeform for us. Add in the CRM and email marketing, and it's a no-brainer.",
        name: "Emma Chen",
        role: "Operations Director",
        company: "Spark Marketing Co",
        rating: 5
      },
    ],

    // Competitor Comparison
    competitorComparisonTitle: "The All-in-One Advantage",
    competitors: [
      {
        name: "Separate Tools",
        features: [
          { name: "Monthly Cost", axolop: "$67-$349", value: "$1,500+" },
          { name: "CRM", axolop: true, value: "HubSpot $50+" },
          { name: "Forms", axolop: true, value: "Typeform $35+" },
          { name: "Email Marketing", axolop: true, value: "ActiveCampaign $29+" },
          { name: "Scheduling", axolop: true, value: "Calendly $15+" },
          { name: "Automation", axolop: true, value: "Zapier $20+" },
          { name: "Everything Connected", axolop: true, value: false },
        ]
      },
    ],

    // FAQ
    faqs: [
      {
        question: "Can I really replace all my tools with Axolop?",
        answer: "Most agencies can replace 8-12 tools. We cover CRM, forms, email marketing, scheduling, automation, and knowledge management. Some specialized tools (like design software) will still be separate."
      },
      {
        question: "Do you have white-labeling for agencies?",
        answer: "Yes! On our Scale plan, you can white-label client portals with your agency branding. Custom domains coming soon."
      },
      {
        question: "How do I manage multiple clients?",
        answer: "Each client can have their own 'agency' within Axolop. You can switch between clients instantly and maintain separate data, workflows, and reporting."
      },
      {
        question: "Can I migrate my existing data?",
        answer: "Absolutely. We support imports from most popular tools and can assist with complex migrations. Your data stays intact."
      },
    ],
  };

  return <UseCasePageTemplate {...pageData} />;
};

export default MarketingAgencies;
