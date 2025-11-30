import UseCasePageTemplate from './UseCasePageTemplate';
import {
  Briefcase,
  Target,
  Clock,
  TrendingDown,
  Users,
  FileSpreadsheet,
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
 * B2B Sales Use Case Page
 * Targeting: B2B sales teams, SaaS companies, professional services
 */
const B2BSales = () => {
  const pageData = {
    // Hero Section
    title: "Win More Deals, Forecast Accurately",
    subtitle: "Built for B2B Sales Teams",
    description: "From prospecting to close, Axolop gives B2B sales teams the pipeline visibility, automation, and analytics to hit quota consistently.",
    icon: Briefcase,
    iconColor: '#5BB9F5',
    iconBg: '#1E40AF',

    // Hero Stats
    heroStats: [
      { value: '28%', label: 'Higher Win Rate' },
      { value: '45%', label: 'Shorter Sales Cycle' },
      { value: '95%', label: 'Forecast Accuracy' },
      { value: '2x', label: 'Pipeline Velocity' },
    ],

    // Pain Points
    painPointsTitle: "Pipeline Problems?",
    painPointsSubtitle: "Common challenges B2B sales teams face",
    painPoints: [
      {
        icon: Target,
        title: "Deals Stuck in Pipeline",
        description: "Opportunities sit for weeks without movement. You don't know which deals need attention until it's too late."
      },
      {
        icon: Clock,
        title: "Long Sales Cycles Getting Longer",
        description: "B2B deals take forever. Multiple stakeholders, budget approvals, legal review—the process drags on."
      },
      {
        icon: TrendingDown,
        title: "Inaccurate Forecasting",
        description: "Your forecast is more wishful thinking than science. Leadership doesn't trust the numbers."
      },
      {
        icon: Users,
        title: "Too Many Stakeholders to Track",
        description: "Enterprise deals have 6+ decision makers. Keeping track of who said what is impossible."
      },
      {
        icon: FileSpreadsheet,
        title: "Manual Data Entry Killing Productivity",
        description: "Reps spend hours updating CRM instead of selling. Data quality suffers because no one wants to do it."
      },
    ],

    // Solutions
    solutionsTitle: "How Axolop Accelerates B2B Sales",
    solutionsSubtitle: "Tools designed for complex sales cycles",
    solutions: [
      {
        icon: Users2,
        feature: "Account & Contact Management",
        description: "Track companies and all their stakeholders. Relationship mapping shows who knows who and who influences decisions.",
        benefit: "Navigate complex org charts"
      },
      {
        icon: GitBranch,
        feature: "Multi-Stage Pipeline",
        description: "Custom stages for your sales process. Weighted probability for accurate forecasting. Deal health scores flag at-risk opportunities.",
        benefit: "Predict revenue with confidence"
      },
      {
        icon: Mail,
        feature: "Email Sequences",
        description: "Build prospecting cadences that run on autopilot. Track opens, clicks, and replies. A/B test messaging.",
        benefit: "Scale outreach without losing personalization"
      },
      {
        icon: FileText,
        feature: "Demo Request Forms",
        description: "Capture inbound leads with smart forms that qualify and route automatically. BANT fields built in.",
        benefit: "Qualify before the call"
      },
      {
        icon: Calendar,
        feature: "Meeting Scheduler",
        description: "Let prospects book demos directly. Round-robin across SDRs. Qualify with pre-meeting questions.",
        benefit: "Fill calendars without back-and-forth"
      },
      {
        icon: Workflow,
        feature: "Deal Automation",
        description: "Automate follow-ups, task creation, and stage transitions. Slack alerts for deal movement. Never lose momentum.",
        benefit: "Keep deals moving automatically"
      },
      {
        icon: BarChart3,
        feature: "Sales Analytics",
        description: "Pipeline reports, win/loss analysis, activity metrics, and forecasting. Slice by rep, team, or territory.",
        benefit: "Know exactly what's working"
      },
      {
        icon: Brain,
        feature: "AI Deal Intelligence",
        description: "AI analyzes deal patterns to predict outcomes and recommend next best actions. Surface winning behaviors.",
        benefit: "Coach with data, not gut"
      },
    ],

    // Benefits
    benefitsTitle: "Results B2B Teams Achieve",
    benefits: [
      {
        metric: "28%",
        title: "Higher Win Rate",
        description: "Better pipeline visibility and deal coaching improve close rates."
      },
      {
        metric: "45%",
        title: "Shorter Sales Cycle",
        description: "Automation and multi-threading accelerate complex deals."
      },
      {
        metric: "95%",
        title: "Forecast Accuracy",
        description: "Weighted pipeline and AI predictions make forecasts reliable."
      },
    ],

    // Testimonials
    testimonials: [
      {
        quote: "We finally have a forecast we can trust. The weighted pipeline and deal health scores changed everything.",
        name: "Chris Anderson",
        role: "VP of Sales",
        company: "TechScale Solutions",
        rating: 5
      },
      {
        quote: "Our SDRs doubled their meetings booked using the email sequences and calendar booking. Less busy work, more conversations.",
        name: "Sarah Martinez",
        role: "Sales Director",
        company: "CloudFirst Inc",
        rating: 5
      },
    ],

    // Competitor Comparison
    competitorComparisonTitle: "Why B2B Teams Choose Axolop",
    competitors: [
      {
        name: "Pipedrive",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$14/mo" },
          { name: "Advanced Pipeline", axolop: true, value: true },
          { name: "Email Sequences", axolop: true, value: "Add-on" },
          { name: "Form Builder", axolop: true, value: false },
          { name: "Workflow Automation", axolop: true, value: "Limited" },
          { name: "AI Features", axolop: true, value: "Limited" },
          { name: "All-in-One Platform", axolop: true, value: false },
        ]
      },
      {
        name: "HubSpot Sales",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$50/mo" },
          { name: "Advanced Pipeline", axolop: true, value: true },
          { name: "Email Sequences", axolop: true, value: true },
          { name: "Form Builder", axolop: true, value: true },
          { name: "Workflow Automation", axolop: true, value: "Premium" },
          { name: "AI Features", axolop: true, value: "Premium" },
          { name: "All-in-One Platform", axolop: true, value: "Expensive" },
        ]
      },
    ],

    // FAQ
    faqs: [
      {
        question: "Can Axolop handle complex, multi-stage sales processes?",
        answer: "Absolutely. Create as many pipeline stages as you need, with custom fields, requirements, and automations at each stage. Perfect for enterprise sales cycles."
      },
      {
        question: "How does the forecasting work?",
        answer: "Each stage has a probability weight. Total weighted pipeline gives you expected revenue. AI also analyzes deal patterns to flag opportunities that may not close as expected."
      },
      {
        question: "Can I track multiple contacts per account?",
        answer: "Yes. Accounts can have unlimited contacts with roles, influence levels, and relationship notes. Perfect for navigating buying committees."
      },
      {
        question: "Does it integrate with my other tools?",
        answer: "We integrate with email (Gmail, Outlook), calendars, Slack, and many more via our API and Zapier. Native integrations expanding constantly."
      },
    ],
  };

  return <UseCasePageTemplate {...pageData} />;
};

export default B2BSales;
