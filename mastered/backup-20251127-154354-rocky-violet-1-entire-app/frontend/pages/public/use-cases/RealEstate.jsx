import UseCasePageTemplate from './UseCasePageTemplate';
import {
  Home,
  Clock,
  Users,
  FileSearch,
  CalendarX,
  TrendingDown,
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
 * Real Estate Use Case Page
 * Targeting: Real estate agents, brokerages, property managers
 */
const RealEstate = () => {
  const pageData = {
    // Hero Section
    title: "Close More Deals, Less Paperwork",
    subtitle: "Built for Real Estate Professionals",
    description: "From lead capture to closing, Axolop helps real estate professionals manage their pipeline, automate follow-ups, and never miss a showing again.",
    icon: Home,
    iconColor: '#F5A623',
    iconBg: '#B45309',

    // Hero Stats
    heroStats: [
      { value: '35%', label: 'More Closings' },
      { value: '60%', label: 'Less Admin Work' },
      { value: '24/7', label: 'Lead Capture' },
      { value: '0', label: 'Missed Follow-ups' },
    ],

    // Pain Points
    painPointsTitle: "Sound Like Your Day?",
    painPointsSubtitle: "Common challenges real estate professionals face",
    painPoints: [
      {
        icon: Clock,
        title: "Leads Go Cold While You're Showing",
        description: "You're at a showing and can't respond. By the time you call back, they've talked to another agent."
      },
      {
        icon: Users,
        title: "Too Many Leads, Not Enough Time",
        description: "Zillow, Realtor.com, your website, referrals... leads come from everywhere. Keeping track is overwhelming."
      },
      {
        icon: FileSearch,
        title: "Lost in Spreadsheets",
        description: "Your pipeline lives in spreadsheets, notes apps, and your head. Nothing is connected."
      },
      {
        icon: CalendarX,
        title: "Scheduling Nightmares",
        description: "Coordinating showings, inspections, and client meetings by phone and text is exhausting."
      },
      {
        icon: TrendingDown,
        title: "Past Clients Forget You",
        description: "You close the deal and move on. Three years later, they list with someone else because you weren't top of mind."
      },
    ],

    // Solutions
    solutionsTitle: "How Axolop Helps You Sell More",
    solutionsSubtitle: "Tools designed for real estate success",
    solutions: [
      {
        icon: Users2,
        feature: "Lead Management & Scoring",
        description: "Capture leads from any source. AI scores them so you know who's ready to buy and who's just browsing.",
        benefit: "Focus on buyers, not tire-kickers"
      },
      {
        icon: GitBranch,
        feature: "Visual Deal Pipeline",
        description: "See every deal from lead to closing. Custom stages for buyers and sellers. Drag-and-drop simplicity.",
        benefit: "Know exactly where every deal stands"
      },
      {
        icon: Mail,
        feature: "Automated Drip Campaigns",
        description: "Set up nurture sequences for new leads, market updates for buyers, and anniversary emails for past clients.",
        benefit: "Stay top of mind automatically"
      },
      {
        icon: FileText,
        feature: "Property Inquiry Forms",
        description: "Embed beautiful forms on listings. Capture lead info and property preferences. Route to your CRM instantly.",
        benefit: "Turn website visitors into leads"
      },
      {
        icon: Calendar,
        feature: "Showing Scheduler",
        description: "Let buyers book showings online. Syncs with your calendar, sends reminders, and handles reschedules.",
        benefit: "Fill your calendar without phone tag"
      },
      {
        icon: Workflow,
        feature: "Transaction Workflows",
        description: "Automate the closing process. Tasks for inspections, appraisals, and paperwork trigger automatically.",
        benefit: "Never miss a closing deadline"
      },
      {
        icon: BarChart3,
        feature: "Production Reports",
        description: "Track listings, closings, and GCI. See your pipeline health and forecast future income.",
        benefit: "Run your business by the numbers"
      },
      {
        icon: Brain,
        feature: "Property Knowledge Base",
        description: "Store listing details, neighborhood info, and market data. Search with AI to prep for any showing.",
        benefit: "Be the neighborhood expert"
      },
    ],

    // Benefits
    benefitsTitle: "Results You Can Expect",
    benefits: [
      {
        metric: "35%",
        title: "More Closings",
        description: "Better lead management and follow-up converts more prospects."
      },
      {
        metric: "60%",
        title: "Less Admin Time",
        description: "Automation handles the busywork so you can sell."
      },
      {
        metric: "3x",
        title: "More Referrals",
        description: "Stay top of mind with past clients who refer their friends."
      },
    ],

    // Testimonials
    testimonials: [
      {
        quote: "I was losing leads because I couldn't respond fast enough. Now automated texts go out instantly while I'm at showings.",
        name: "Michelle Torres",
        role: "Realtor",
        company: "RE/MAX Elite",
        rating: 5
      },
      {
        quote: "The pipeline view changed how I run my business. I can see my entire month's closings at a glance.",
        name: "Robert Kim",
        role: "Broker",
        company: "Kim Realty Group",
        rating: 5
      },
    ],

    // Competitor Comparison
    competitorComparisonTitle: "Why Agents Choose Axolop",
    competitors: [
      {
        name: "Follow Up Boss",
        features: [
          { name: "Starting Price", axolop: "$67/mo", value: "$69/mo" },
          { name: "CRM & Lead Management", axolop: true, value: true },
          { name: "Built-in Form Builder", axolop: true, value: false },
          { name: "Email Marketing", axolop: true, value: "Basic" },
          { name: "Workflow Automation", axolop: true, value: "Limited" },
          { name: "AI Features", axolop: true, value: false },
          { name: "Calendar & Scheduling", axolop: true, value: false },
        ]
      },
    ],

    // FAQ
    faqs: [
      {
        question: "Does Axolop integrate with Zillow and Realtor.com?",
        answer: "Yes! We can capture leads from major portals through their API integrations or email parsing. Leads flow directly into your pipeline."
      },
      {
        question: "Can I use this for a team or brokerage?",
        answer: "Absolutely. Our team features include lead routing, production tracking by agent, and permission controls so agents see only their deals."
      },
      {
        question: "Is there transaction management?",
        answer: "Yes. Create workflows for the entire transaction from accepted offer to closing. Tasks, reminders, and checklists keep everyone on track."
      },
      {
        question: "Do you have a mobile app?",
        answer: "Axolop is fully responsive on mobile browsers. A dedicated app is on our 2025 roadmap."
      },
    ],
  };

  return <UseCasePageTemplate {...pageData} />;
};

export default RealEstate;
