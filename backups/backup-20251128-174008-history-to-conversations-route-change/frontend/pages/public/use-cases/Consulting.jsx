import UseCasePageTemplate from './UseCasePageTemplate';
import {
  GraduationCap,
  Clock,
  FileSpreadsheet,
  Users,
  DollarSign,
  Calendar,
  Users2,
  GitBranch,
  Mail,
  FileText,
  Workflow,
  BarChart3,
  Brain,
  FolderOpen,
} from 'lucide-react';

/**
 * Consulting Firms Use Case Page
 * Targeting: Management consultants, business coaches, advisory firms
 */
const Consulting = () => {
  const pageData = {
    // Hero Section
    title: "Run Your Practice, Not Spreadsheets",
    subtitle: "Built for Consultants & Advisors",
    description: "From client acquisition to project delivery, Axolop helps consulting firms manage relationships, streamline operations, and grow revenue.",
    icon: GraduationCap,
    iconColor: '#A855F7',
    iconBg: '#7C3AED',

    // Hero Stats
    heroStats: [
      { value: '40%', label: 'More Client Capacity' },
      { value: '65%', label: 'Less Admin Time' },
      { value: '90%', label: 'Client Retention' },
      { value: '$50K+', label: 'New Revenue/Year' },
    ],

    // Pain Points
    painPointsTitle: "Running a Practice is Hard",
    painPointsSubtitle: "Common challenges consultants face",
    painPoints: [
      {
        icon: Clock,
        title: "Feast or Famine Revenue",
        description: "You're either drowning in client work or scrambling for the next engagement. Pipeline visibility is non-existent."
      },
      {
        icon: FileSpreadsheet,
        title: "Client Info Scattered Everywhere",
        description: "Notes in docs, emails in inbox, proposals in folders. Finding anything takes forever."
      },
      {
        icon: Users,
        title: "Relationship Management is Manual",
        description: "You know you should follow up with past clients and referral sources. But when? The system is in your head."
      },
      {
        icon: DollarSign,
        title: "Leaving Money on the Table",
        description: "Clients who could use more services aren't being offered them. You're too busy delivering to sell."
      },
      {
        icon: Calendar,
        title: "Scheduling is a Time Sink",
        description: "Back-and-forth emails to find meeting times. Double bookings. Timezone confusion. It adds up."
      },
    ],

    // Solutions
    solutionsTitle: "How Axolop Helps You Grow",
    solutionsSubtitle: "Tools designed for consulting success",
    solutions: [
      {
        icon: Users2,
        feature: "Client Relationship Hub",
        description: "360° view of every client and prospect. Full history of interactions, projects, and communications in one place.",
        benefit: "Never forget a conversation again"
      },
      {
        icon: GitBranch,
        feature: "Engagement Pipeline",
        description: "Visual pipeline from prospect to proposal to signed. Track engagement value, probability, and expected close date.",
        benefit: "Predict revenue months in advance"
      },
      {
        icon: Mail,
        feature: "Nurture Campaigns",
        description: "Stay top of mind with past clients and referral sources. Automated check-ins, thought leadership, and milestone reminders.",
        benefit: "Generate referrals on autopilot"
      },
      {
        icon: FileText,
        feature: "Intake & Discovery Forms",
        description: "Professional intake questionnaires that capture client needs before the first call. Data flows into your CRM.",
        benefit: "Show up to discovery calls prepared"
      },
      {
        icon: Calendar,
        feature: "Scheduling Made Easy",
        description: "Clients book directly on your calendar. Discovery calls, strategy sessions, and reviews—all self-scheduled.",
        benefit: "Eliminate scheduling back-and-forth"
      },
      {
        icon: Workflow,
        feature: "Client Onboarding Workflows",
        description: "Automated sequences for new client onboarding. Welcome emails, document requests, kickoff scheduling.",
        benefit: "Professional experience every time"
      },
      {
        icon: BarChart3,
        feature: "Practice Analytics",
        description: "Track pipeline, utilization, revenue by client, and engagement profitability. Know your numbers.",
        benefit: "Run your practice by data"
      },
      {
        icon: Brain,
        feature: "Knowledge Repository",
        description: "Store templates, frameworks, and client deliverables. AI-powered search finds anything instantly.",
        benefit: "Leverage past work for new engagements"
      },
    ],

    // Benefits
    benefitsTitle: "Results Consultants Achieve",
    benefits: [
      {
        metric: "40%",
        title: "More Client Capacity",
        description: "Automation frees time to take on more engagements."
      },
      {
        metric: "65%",
        title: "Less Admin Work",
        description: "Stop chasing spreadsheets and scheduling emails."
      },
      {
        metric: "90%",
        title: "Client Retention",
        description: "Proactive relationship management keeps clients coming back."
      },
    ],

    // Testimonials
    testimonials: [
      {
        quote: "I went from zero pipeline visibility to knowing exactly what's coming for the next quarter. Game changer for planning.",
        name: "Dr. Amanda Foster",
        role: "Principal",
        company: "Foster Strategy Group",
        rating: 5
      },
      {
        quote: "The automated nurture campaigns brought back three past clients in the first month. That's $80K in revenue I wasn't going to get.",
        name: "Mark Sullivan",
        role: "Managing Partner",
        company: "Sullivan Advisory",
        rating: 5
      },
    ],

    // Competitor Comparison
    competitorComparisonTitle: "Why Consultants Choose Axolop",
    competitors: [
      {
        name: "Dubsado",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$40/mo" },
          { name: "CRM & Client Management", axolop: true, value: true },
          { name: "Email Marketing", axolop: true, value: "Basic" },
          { name: "Advanced Pipelines", axolop: true, value: "Limited" },
          { name: "Workflow Automation", axolop: true, value: true },
          { name: "AI Features", axolop: true, value: false },
          { name: "Knowledge Base", axolop: true, value: false },
        ]
      },
      {
        name: "HoneyBook",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$19/mo" },
          { name: "CRM & Client Management", axolop: true, value: true },
          { name: "Email Marketing", axolop: true, value: "Basic" },
          { name: "Advanced Pipelines", axolop: true, value: "Limited" },
          { name: "Workflow Automation", axolop: true, value: "Basic" },
          { name: "AI Features", axolop: true, value: false },
          { name: "Knowledge Base", axolop: true, value: false },
        ]
      },
    ],

    // FAQ
    faqs: [
      {
        question: "Is Axolop good for solo consultants?",
        answer: "Absolutely! Many solo consultants use Axolop to manage their practice. The Sales plan at $67/mo is perfect for independent practitioners."
      },
      {
        question: "Can I track project profitability?",
        answer: "Yes. Associate time and revenue with each engagement to track profitability. See which clients and project types are most profitable."
      },
      {
        question: "Do you have templates for consulting?",
        answer: "We provide starter templates for intake forms, proposal workflows, and email sequences. Customize them for your practice."
      },
      {
        question: "Can my team collaborate on client accounts?",
        answer: "Yes. Team members can share access to clients, leave internal notes, and hand off relationships seamlessly."
      },
    ],
  };

  return <UseCasePageTemplate {...pageData} />;
};

export default Consulting;
