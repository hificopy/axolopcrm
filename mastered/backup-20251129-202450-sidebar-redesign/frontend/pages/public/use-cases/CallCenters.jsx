import UseCasePageTemplate from './UseCasePageTemplate';
import {
  Headphones,
  Clock,
  UserMinus,
  Eye,
  Layers,
  MessageSquare,
  Mic,
  Wrench,
  Users2,
  Activity,
  BarChart3,
  Mail,
  Workflow,
  Shield,
  Phone,
  Brain,
} from 'lucide-react';

/**
 * Call Centers / Telemarketing Use Case Page
 * Targeting: Outbound call centers, telemarketing agencies, inside sales teams
 * Competitive positioning against: VanillaSoft, Five9, CallTools, Aircall
 */
const CallCenters = () => {
  const pageData = {
    // Hero Section
    title: "Built for High-Volume Outbound Teams",
    subtitle: "Call Center & Telemarketing CRM",
    description: "From lead routing to performance analytics, Axolop gives call centers the tools to maximize agent productivity, improve call quality, and drive consistent results.",
    icon: Headphones,
    iconColor: '#5BB9F5',
    iconBg: '#1E40AF',

    // Hero Stats
    heroStats: [
      { value: '3x', label: 'More Calls Per Agent' },
      { value: '40%', label: 'Higher Connect Rate' },
      { value: '25%', label: 'Lower Agent Churn' },
      { value: '100%', label: 'Activity Visibility' },
    ],

    // Pain Points
    painPointsTitle: "These Problems Killing Your Numbers?",
    painPointsSubtitle: "Common challenges we help call centers overcome",
    painPoints: [
      {
        icon: UserMinus,
        title: "High Agent Turnover",
        description: "Your best agents leave because they're stuck with bad leads and outdated tools. Training new hires is expensive and slow."
      },
      {
        icon: Clock,
        title: "Slow Speed-to-Dial",
        description: "Every minute between lead capture and first call costs conversions. Your current system makes agents wait too long."
      },
      {
        icon: Eye,
        title: "No Visibility Into Performance",
        description: "You don't know who your top performers are until end of month. Real-time coaching is impossible without real-time data."
      },
      {
        icon: Layers,
        title: "Scattered Call Tracking",
        description: "Call logs in one system, notes in another, emails in a third. No single view of customer interactions."
      },
      {
        icon: MessageSquare,
        title: "Inconsistent Follow-Up",
        description: "Agents forget to send emails, SMS goes out late, and multi-touch campaigns are manual and messy."
      },
      {
        icon: Mic,
        title: "Coaching Takes Too Long",
        description: "Listening to hours of call recordings to find coaching moments? There has to be a better way."
      },
      {
        icon: Wrench,
        title: "Too Many Disconnected Tools",
        description: "Dialer, CRM, email platform, reporting tool—your team wastes time switching between systems."
      },
    ],

    // Solutions - Feature Mapping
    solutionsTitle: "How Axolop Transforms Your Call Center",
    solutionsSubtitle: "Everything your team needs in one platform",
    solutions: [
      {
        icon: Users2,
        feature: "Queue-Based Lead Routing",
        description: "Intelligent lead distribution based on agent skills, availability, and performance. The right lead reaches the right agent instantly.",
        benefit: "Maximize every lead's potential"
      },
      {
        icon: Activity,
        feature: "Every Call Documented",
        description: "Automatic activity logging for every call, email, and interaction. Complete customer history at your agents' fingertips.",
        benefit: "Never ask 'what happened with this lead?'"
      },
      {
        icon: BarChart3,
        feature: "Real-Time Performance Dashboards",
        description: "Live visibility into calls made, connects, talk time, conversions, and revenue—by agent, team, or campaign.",
        benefit: "Coach in the moment, not next month"
      },
      {
        icon: Mail,
        feature: "Automated Multi-Channel Follow-Up",
        description: "Trigger email and SMS sequences based on call outcomes. Missed call? Voicemail drop? Automatic follow-up fires.",
        benefit: "Multi-touch campaigns on autopilot"
      },
      {
        icon: Workflow,
        feature: "Call Disposition Workflows",
        description: "Build automation based on call outcomes. Interested? Schedule callback. Not interested? Move to nurture. Appointment set? Send confirmation.",
        benefit: "Turn call outcomes into actions"
      },
      {
        icon: Shield,
        feature: "Role-Based Access Control",
        description: "Agents see their leads. Supervisors see their teams. Managers see everything. 200+ permission templates to choose from.",
        benefit: "Right data to the right people"
      },
      {
        icon: Phone,
        feature: "Power Dialer with Click-to-Call",
        description: "Progressive dialing, preview mode, and click-to-call. Call recording and voicemail drop included.",
        benefit: "Triple your call volume",
        comingSoon: true
      },
      {
        icon: Brain,
        feature: "AI Call Intelligence",
        description: "AI-powered call transcription and analysis. Surface coaching moments, track talk patterns, and identify winning behaviors.",
        benefit: "Scale your best performers",
        comingSoon: true
      },
    ],

    // Key Benefits with Metrics
    benefitsTitle: "Results Call Centers Achieve",
    benefits: [
      {
        metric: "3x",
        title: "More Calls Per Agent",
        description: "Smart lead routing and streamlined workflows mean agents spend less time searching and more time selling."
      },
      {
        metric: "40%",
        title: "Higher Connect Rate",
        description: "AI-prioritized leads and optimal call timing increase the odds of reaching decision-makers."
      },
      {
        metric: "25%",
        title: "Lower Agent Churn",
        description: "Better tools, better leads, and better results keep your top performers happy and engaged."
      },
    ],

    // Testimonials
    testimonials: [
      {
        quote: "We run a 50-seat outbound center. Axolop replaced three tools and gave us visibility we never had. Agent productivity jumped 40% in the first quarter.",
        name: "David Kim",
        role: "VP of Operations",
        company: "Velocity Sales Partners",
        rating: 5
      },
      {
        quote: "The automated follow-up campaigns are incredible. If an agent can't connect, the system sends an email and schedules a callback. Nothing falls through the cracks.",
        name: "Jennifer Walsh",
        role: "Call Center Manager",
        company: "National Lead Services",
        rating: 5
      },
      {
        quote: "Real-time dashboards changed how we coach. I can see who's struggling and jump in before it becomes a problem. Agent churn dropped by half.",
        name: "Marcus Johnson",
        role: "Sales Director",
        company: "Premier Contact Center",
        rating: 5
      },
    ],

    // Competitor Comparison
    competitorComparisonTitle: "Why Call Centers Choose Axolop",
    competitors: [
      {
        name: "VanillaSoft",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$99/mo" },
          { name: "CRM & Lead Management", axolop: true, value: true },
          { name: "Email Marketing Built-In", axolop: true, value: false },
          { name: "Form Builder", axolop: true, value: false },
          { name: "Workflow Automation", axolop: true, value: "Limited" },
          { name: "AI Lead Scoring", axolop: true, value: false },
          { name: "Multi-Channel Campaigns", axolop: true, value: "Email Only" },
          { name: "All-in-One Platform", axolop: true, value: false },
        ]
      },
      {
        name: "Five9",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$149/mo" },
          { name: "CRM & Lead Management", axolop: true, value: "Basic" },
          { name: "Email Marketing Built-In", axolop: true, value: false },
          { name: "Form Builder", axolop: true, value: false },
          { name: "Workflow Automation", axolop: true, value: true },
          { name: "AI Lead Scoring", axolop: true, value: false },
          { name: "Multi-Channel Campaigns", axolop: true, value: true },
          { name: "All-in-One Platform", axolop: true, value: false },
        ]
      },
      {
        name: "CallTools",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$95/mo" },
          { name: "CRM & Lead Management", axolop: true, value: "Basic" },
          { name: "Email Marketing Built-In", axolop: true, value: false },
          { name: "Form Builder", axolop: true, value: false },
          { name: "Workflow Automation", axolop: true, value: "Limited" },
          { name: "AI Lead Scoring", axolop: true, value: false },
          { name: "Multi-Channel Campaigns", axolop: true, value: "Limited" },
          { name: "All-in-One Platform", axolop: true, value: false },
        ]
      },
    ],

    // FAQ
    faqs: [
      {
        question: "How does the queue-based lead routing work?",
        answer: "Leads are automatically distributed to agents based on rules you define: round-robin, skills-based, performance-based, or custom logic. When an agent finishes a call, the next best lead is automatically pushed to them."
      },
      {
        question: "Can supervisors monitor calls in real-time?",
        answer: "Yes. Supervisors can see live dashboards showing which agents are on calls, call duration, and performance metrics. Listen-in and whisper coaching capabilities are coming soon with our dialer."
      },
      {
        question: "Do you support predictive/auto dialing?",
        answer: "Our power dialer with progressive and preview modes is coming soon. It will include click-to-call, call recording, voicemail drop, and automatic disposition tracking."
      },
      {
        question: "How do automated follow-ups work?",
        answer: "You define triggers based on call dispositions. For example: 'If disposition = No Answer, send email template A in 1 hour and schedule callback in 24 hours.' The system handles it automatically."
      },
      {
        question: "Can I import leads from my existing system?",
        answer: "Absolutely. We support CSV imports and have APIs for real-time lead injection. Migrate from VanillaSoft, Five9, or any other platform easily."
      },
      {
        question: "What reporting is available?",
        answer: "Real-time dashboards show calls made, connects, talk time, conversions, and revenue. Filter by agent, team, campaign, date range, or custom fields. Export to CSV or schedule automated reports."
      },
      {
        question: "Is there a per-seat or per-minute pricing model?",
        answer: "Axolop uses per-seat pricing starting at $67/mo. No hidden per-minute charges. Phone minutes are billed separately through your Twilio account, so you control costs."
      },
      {
        question: "How long does it take to onboard a team?",
        answer: "Most teams are productive within a few days. We provide training resources, and our support team is available to help with setup, imports, and workflow configuration."
      },
    ],

    // CTA
    ctaText: "Start Your Free Trial",
    ctaLink: "/signup",
    secondaryCta: { text: "See Pricing", link: "/pricing" }
  };

  return <UseCasePageTemplate {...pageData} />;
};

export default CallCenters;
