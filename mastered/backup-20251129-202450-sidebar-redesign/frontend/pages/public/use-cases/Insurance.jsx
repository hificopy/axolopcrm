import UseCasePageTemplate from './UseCasePageTemplate';
import {
  Shield,
  Clock,
  FileCheck,
  AlertTriangle,
  TrendingDown,
  Users,
  UserMinus,
  Calendar,
  Users2,
  GitBranch,
  Mail,
  FileText,
  Workflow,
  Phone,
  BarChart3,
  Brain,
} from 'lucide-react';

/**
 * Insurance Agencies Use Case Page
 * Targeting: Health, Life, Medicare, Property & Casualty insurance agencies
 * Competitive positioning against: VanillaSoft, AgencyBloc, Radiusbob
 */
const Insurance = () => {
  const pageData = {
    // Hero Section
    title: "The CRM Insurance Agencies Trust",
    subtitle: "Built for Insurance Professionals",
    description: "From Medicare to life insurance, Axolop helps agencies manage leads, automate renewals, stay compliant, and close more policies—all in one platform.",
    icon: Shield,
    iconColor: '#E92C92',
    iconBg: '#E92C92',

    // Hero Stats
    heroStats: [
      { value: '30%', label: 'More Policies Closed' },
      { value: '50%', label: 'Less Admin Time' },
      { value: '99%', label: 'Renewal Rate' },
      { value: '5min', label: 'Speed-to-Lead' },
    ],

    // Pain Points
    painPointsTitle: "Sound Familiar?",
    painPointsSubtitle: "Common challenges insurance agencies face every day",
    painPoints: [
      {
        icon: Clock,
        title: "Slow Speed-to-Lead",
        description: "By the time you call back a web lead, they've already talked to 3 other agents. Hot leads go cold fast."
      },
      {
        icon: FileCheck,
        title: "Compliance Nightmares",
        description: "Tracking consent, managing DNC lists, and maintaining audit trails manually is time-consuming and risky."
      },
      {
        icon: TrendingDown,
        title: "Missed Renewal Opportunities",
        description: "Policy renewals slip through the cracks. You're reactive instead of proactive, losing easy revenue."
      },
      {
        icon: AlertTriangle,
        title: "Quote Follow-ups Fall Through",
        description: "You sent the quote, but then life happens. Without systematic follow-up, prospects go silent."
      },
      {
        icon: Users,
        title: "Cross-Sell/Upsell Blindspots",
        description: "You have customers with one policy who could have three. But you don't have time to identify them."
      },
      {
        icon: UserMinus,
        title: "Agent Churn from Poor Lead Quality",
        description: "Your best agents leave because they're wasting time on bad leads instead of closing deals."
      },
    ],

    // Solutions - Feature Mapping
    solutionsTitle: "How Axolop Helps",
    solutionsSubtitle: "Powerful features tailored for insurance professionals",
    solutions: [
      {
        icon: Users2,
        feature: "Lead Management with AI Scoring",
        description: "Capture leads from any source—web forms, Facebook, referrals. AI scores and prioritizes so you call the hottest leads first.",
        benefit: "Call the right leads at the right time"
      },
      {
        icon: GitBranch,
        feature: "Pipeline for Policy Stages",
        description: "Visual Kanban boards for every stage: Lead → Quoted → Application → Underwriting → Bound → Issued.",
        benefit: "Never lose track of where a deal stands"
      },
      {
        icon: Mail,
        feature: "Automated Email Sequences",
        description: "Set up renewal reminders, quote follow-ups, birthday wishes, and policy anniversary emails that send automatically.",
        benefit: "Stay top-of-mind without lifting a finger"
      },
      {
        icon: FileText,
        feature: "Form Builder for Quotes & Applications",
        description: "Create professional quote request forms and online applications. Data flows directly into your CRM—no re-entry.",
        benefit: "Capture leads 24/7 with zero manual work"
      },
      {
        icon: Calendar,
        feature: "Calendar & Scheduling",
        description: "Let prospects book consultations directly. Syncs with Google Calendar, sends reminders, handles timezone magic.",
        benefit: "Fill your calendar without phone tag"
      },
      {
        icon: Workflow,
        feature: "Compliance Workflows",
        description: "Automate consent tracking, DNC list checking, and quiet hours enforcement. Build audit trails automatically.",
        benefit: "Sleep better knowing you're compliant"
      },
      {
        icon: Phone,
        feature: "Sales Dialer",
        description: "Click-to-call with call recording, voicemail drop, and automatic activity logging. Call more, type less.",
        benefit: "Triple your call volume",
        comingSoon: true
      },
      {
        icon: BarChart3,
        feature: "Producer Scorecards & Analytics",
        description: "Real-time dashboards showing connects, quotes, meetings, and written premium by agent, team, or campaign.",
        benefit: "Know exactly what's working"
      },
    ],

    // Key Benefits with Metrics
    benefitsTitle: "Results You Can Expect",
    benefits: [
      {
        metric: "30%",
        title: "More Policies Closed",
        description: "Better lead prioritization and automated follow-up means more quotes turn into bound policies."
      },
      {
        metric: "50%",
        title: "Less Admin Time",
        description: "Automation handles the busywork so agents can focus on what they do best—selling."
      },
      {
        metric: "99%",
        title: "Renewal Retention",
        description: "Proactive renewal campaigns mean you catch lapses before they happen."
      },
    ],

    // Testimonials
    testimonials: [
      {
        quote: "We switched from VanillaSoft because we needed more than just a dialer. Axolop gives us the full picture—forms, email automation, and CRM in one place.",
        name: "Michael Rodriguez",
        role: "Agency Owner",
        company: "Rodriguez Insurance Group",
        rating: 5
      },
      {
        quote: "Our renewal rate went from 85% to 98% after we set up automated reminder campaigns. That's thousands in retained premium.",
        name: "Sarah Chen",
        role: "Operations Manager",
        company: "Pacific Life & Health",
        rating: 5
      },
      {
        quote: "The lead scoring is a game-changer. My agents stopped wasting time on tire-kickers and focused on people ready to buy.",
        name: "James Thompson",
        role: "Sales Director",
        company: "Thompson Medicare Solutions",
        rating: 5
      },
    ],

    // Competitor Comparison
    competitorComparisonTitle: "Why Insurance Agencies Switch to Axolop",
    competitors: [
      {
        name: "VanillaSoft",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$99/mo" },
          { name: "CRM & Lead Management", axolop: true, value: true },
          { name: "Built-in Form Builder", axolop: true, value: false },
          { name: "Email Marketing", axolop: true, value: false },
          { name: "Workflow Automation", axolop: true, value: "Limited" },
          { name: "AI Lead Scoring", axolop: true, value: false },
          { name: "Calendar & Scheduling", axolop: true, value: false },
          { name: "All-in-One Platform", axolop: true, value: false },
        ]
      },
      {
        name: "AgencyBloc",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$70/mo" },
          { name: "CRM & Lead Management", axolop: true, value: true },
          { name: "Built-in Form Builder", axolop: true, value: false },
          { name: "Email Marketing", axolop: true, value: "Basic" },
          { name: "Workflow Automation", axolop: true, value: "Limited" },
          { name: "AI Lead Scoring", axolop: true, value: false },
          { name: "Calendar & Scheduling", axolop: true, value: false },
          { name: "All-in-One Platform", axolop: true, value: false },
        ]
      },
    ],

    // FAQ
    faqs: [
      {
        question: "Is Axolop compliant with insurance regulations?",
        answer: "Axolop helps you maintain compliance with features like consent tracking, DNC list management, quiet hours enforcement, and comprehensive audit trails. However, compliance ultimately depends on how you use the tool and your specific regulatory requirements."
      },
      {
        question: "Can I import my existing book of business?",
        answer: "Absolutely. We support CSV imports and can help migrate data from most insurance CRMs including AgencyBloc, Radiusbob, and VanillaSoft. Our team will assist with the migration to ensure no data is lost."
      },
      {
        question: "Do you integrate with insurance carriers or raters?",
        answer: "We're building integrations with popular insurance platforms. Currently, you can use our Zapier integration or API to connect with most tools. Let us know what integrations you need most."
      },
      {
        question: "How does the AI lead scoring work?",
        answer: "Our AI analyzes lead behavior (form interactions, email engagement, website visits) and demographic data to predict likelihood to convert. High-scoring leads get pushed to agents first, so you're always calling the hottest prospects."
      },
      {
        question: "Can I set up different pipelines for different product lines?",
        answer: "Yes! You can create separate pipelines for Medicare, Life, P&C, or any other product line. Each can have its own stages, automations, and reporting."
      },
      {
        question: "What about team permissions and hierarchies?",
        answer: "Axolop supports role-based access control. Agency owners see everything, managers see their teams, and agents see only their own data. Perfect for multi-location agencies."
      },
      {
        question: "Is there a mobile app?",
        answer: "Axolop is fully responsive and works great on mobile browsers. A dedicated mobile app is on our roadmap for 2025."
      },
      {
        question: "How long does setup take?",
        answer: "Most agencies are up and running within a day. Import your data, customize your pipeline stages, set up a few automations, and you're ready to go."
      },
    ],

    // CTA
    ctaText: "Start Your Free Trial",
    ctaLink: "/signup",
    secondaryCta: { text: "See Pricing", link: "/pricing" }
  };

  return <UseCasePageTemplate {...pageData} />;
};

export default Insurance;
