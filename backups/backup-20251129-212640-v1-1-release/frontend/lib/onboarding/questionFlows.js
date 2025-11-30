/**
 * Industry-Based Onboarding Question Flows
 * Monday.com inspired 5-question onboarding with conditional logic
 */

// Industry types
export const INDUSTRIES = {
  INSURANCE: "insurance",
  B2B_SALES: "b2b_sales",
  COACHING: "coaching",
  MARKETING: "marketing",
  CONSULTING: "consulting",
  REAL_ESTATE: "real_estate",
};

// Base questions (always shown)
export const baseQuestions = [
  {
    id: "q1",
    field: "industry",
    type: "multiple-choice",
    title: "Which industry are you in?",
    subtitle: "Help us tailor your CRM experience to your specific needs",
    required: true,
    icon: "🏢",
    options: [
      "Insurance",
      "B2B Sales",
      "Coaching",
      "Marketing Agency",
      "Consulting Firm",
      "Real Estate",
    ],
  },
  {
    id: "q2",
    field: "teamSize",
    type: "multiple-choice",
    title: "How many people are on your team?",
    subtitle: "This helps us recommend the right plan for your needs",
    required: true,
    icon: "👥",
    options: [
      "Just me (Solo)",
      "2-5 people",
      "6-10 people",
      "11-25 people",
      "26+ people",
    ],
  },
];

// Industry-specific question flows
export const industryQuestions = {
  [INDUSTRIES.INSURANCE]: [
    {
      id: "q3_insurance",
      field: "insuranceType",
      type: "multiple-choice",
      title: "What type of insurance do you primarily sell?",
      subtitle: "We'll customize your workflow for your specialty",
      required: true,
      icon: "🛡️",
      options: [
        "Life Insurance",
        "Health Insurance",
        "Property & Casualty",
        "Commercial Insurance",
        "Multiple Lines",
      ],
    },
    {
      id: "q4_insurance",
      field: "leadVolume",
      type: "multiple-choice",
      title: "How many leads do you manage per month?",
      subtitle: "This helps us set up your lead management system",
      required: true,
      icon: "📊",
      options: ["Less than 50", "50-200", "200-500", "500-1,000", "1,000+"],
    },
    {
      id: "q5_insurance",
      field: "topPriority",
      type: "multiple-choice",
      title: "What's your top priority right now?",
      subtitle: "We'll focus on what matters most to grow your business",
      required: true,
      icon: "🎯",
      options: [
        "Automating follow-ups",
        "Better lead tracking",
        "Team collaboration",
        "Policy renewal management",
        "Compliance & documentation",
      ],
    },
  ],

  [INDUSTRIES.B2B_SALES]: [
    {
      id: "q3_b2b",
      field: "salesCycleLength",
      type: "multiple-choice",
      title: "How long is your typical sales cycle?",
      subtitle:
        "Understanding your sales process helps us optimize your pipeline",
      required: true,
      icon: "⏱️",
      options: [
        "Less than 1 week",
        "1-4 weeks",
        "1-3 months",
        "3-6 months",
        "6+ months",
      ],
    },
    {
      id: "q4_b2b",
      field: "dealSize",
      type: "multiple-choice",
      title: "What's your average deal size?",
      subtitle: "This helps us recommend the right features for your business",
      required: true,
      icon: "💰",
      options: ["Under $1K", "$1K-$5K", "$5K-$25K", "$25K-$100K", "$100K+"],
    },
    {
      id: "q5_b2b",
      field: "currentTools",
      type: "checkboxes",
      title: "Which tools are you currently using?",
      subtitle:
        "We'll help you replace multiple tools with one unified platform",
      required: true,
      icon: "🔧",
      options: [
        "HubSpot",
        "Salesforce",
        "Pipedrive",
        "Monday.com",
        "Google Sheets",
        "Excel",
        "None - starting fresh",
      ],
    },
  ],

  [INDUSTRIES.COACHING]: [
    {
      id: "q3_coaching",
      field: "coachingNiche",
      type: "multiple-choice",
      title: "What's your coaching niche?",
      subtitle: "Personalize your CRM for your coaching specialty",
      required: true,
      icon: "🎓",
      options: [
        "Business/Executive Coaching",
        "Life Coaching",
        "Health & Wellness",
        "Career Coaching",
        "Relationship Coaching",
        "Other",
      ],
    },
    {
      id: "q4_coaching",
      field: "clientCapacity",
      type: "multiple-choice",
      title: "How many active clients do you manage?",
      subtitle: "We'll scale with your coaching business",
      required: true,
      icon: "👥",
      options: [
        "1-10 clients",
        "11-25 clients",
        "26-50 clients",
        "51-100 clients",
        "100+ clients",
      ],
    },
    {
      id: "q5_coaching",
      field: "biggestChallenge",
      type: "multiple-choice",
      title: "What's your biggest challenge right now?",
      subtitle: "Focus on solving what's holding you back",
      required: true,
      icon: "🚧",
      options: [
        "Scheduling & calendar management",
        "Client communication",
        "Payment & invoicing",
        "Progress tracking",
        "Lead generation",
      ],
    },
  ],

  [INDUSTRIES.MARKETING]: [
    {
      id: "q3_marketing",
      field: "clientCount",
      type: "multiple-choice",
      title: "How many clients do you manage?",
      subtitle: "We'll help you scale your agency operations",
      required: true,
      icon: "🏢",
      options: [
        "1-5 clients",
        "6-15 clients",
        "16-30 clients",
        "31-50 clients",
        "50+ clients",
      ],
    },
    {
      id: "q4_marketing",
      field: "services",
      type: "checkboxes",
      title: "Which services do you offer?",
      subtitle: "Select all that apply to your agency",
      required: true,
      icon: "🛠️",
      options: [
        "Social Media Management",
        "SEO",
        "Paid Advertising",
        "Content Marketing",
        "Email Marketing",
        "Web Design",
        "Brand Strategy",
      ],
    },
    {
      id: "q5_marketing",
      field: "topNeed",
      type: "multiple-choice",
      title: "What do you need most?",
      subtitle: "We'll prioritize what drives your agency success",
      required: true,
      icon: "🎯",
      options: [
        "Client project management",
        "Campaign tracking",
        "Reporting & dashboards",
        "Team collaboration",
        "Client communication portal",
      ],
    },
  ],

  [INDUSTRIES.CONSULTING]: [
    {
      id: "q3_consulting",
      field: "consultingType",
      type: "multiple-choice",
      title: "What type of consulting do you do?",
      subtitle: "Tailor your CRM to your consulting practice",
      required: true,
      icon: "💼",
      options: [
        "Management Consulting",
        "IT Consulting",
        "Financial Consulting",
        "HR Consulting",
        "Marketing Consulting",
        "Strategy Consulting",
        "Other",
      ],
    },
    {
      id: "q4_consulting",
      field: "projectVolume",
      type: "multiple-choice",
      title: "How many active projects do you typically manage?",
      subtitle: "We'll optimize for your project workflow",
      required: true,
      icon: "📋",
      options: [
        "1-3 projects",
        "4-10 projects",
        "11-25 projects",
        "26-50 projects",
        "50+ projects",
      ],
    },
    {
      id: "q5_consulting",
      field: "priorityFeature",
      type: "multiple-choice",
      title: "Which feature is most important to you?",
      subtitle: "We'll focus on what delivers value to your clients",
      required: true,
      icon: "⭐",
      options: [
        "Project & task management",
        "Time tracking & billing",
        "Document management",
        "Client communication",
        "Reporting & analytics",
      ],
    },
  ],

  [INDUSTRIES.REAL_ESTATE]: [
    {
      id: "q3_realestate",
      field: "realEstateType",
      type: "multiple-choice",
      title: "What type of real estate do you focus on?",
      subtitle: "Customize your CRM for your real estate specialty",
      required: true,
      icon: "🏠",
      options: [
        "Residential Sales",
        "Commercial Real Estate",
        "Property Management",
        "Real Estate Investment",
        "Mixed Portfolio",
      ],
    },
    {
      id: "q4_realestate",
      field: "transactionVolume",
      type: "multiple-choice",
      title: "How many transactions do you close per year?",
      subtitle: "We'll scale with your transaction volume",
      required: true,
      icon: "📈",
      options: [
        "1-10 transactions",
        "11-25 transactions",
        "26-50 transactions",
        "51-100 transactions",
        "100+ transactions",
      ],
    },
    {
      id: "q5_realestate",
      field: "mainGoal",
      type: "multiple-choice",
      title: "What's your main goal with a CRM?",
      subtitle: "Focus on what grows your real estate business",
      required: true,
      icon: "🎯",
      options: [
        "Better lead management",
        "Automate follow-ups",
        "Track property listings",
        "Manage client relationships",
        "Team coordination & compliance",
      ],
    },
  ],
};

// Get questions based on selected industry
export const getQuestionsForIndustry = (industry) => {
  // Normalize industry name to match our keys
  let normalizedIndustry = industry.toLowerCase().trim();

  // Map common industry names to our internal keys
  const industryMap = {
    "insurance": INDUSTRIES.INSURANCE,
    "b2b sales": INDUSTRIES.B2B_SALES,
    "b2b_sales": INDUSTRIES.B2B_SALES,
    "coaching": INDUSTRIES.COACHING,
    "marketing agency": INDUSTRIES.MARKETING,
    "marketing_agency": INDUSTRIES.MARKETING,
    "marketing": INDUSTRIES.MARKETING,
    "consulting firm": INDUSTRIES.CONSULTING,
    "consulting_firm": INDUSTRIES.CONSULTING,
    "consulting": INDUSTRIES.CONSULTING,
    "real estate": INDUSTRIES.REAL_ESTATE,
    "real_estate": INDUSTRIES.REAL_ESTATE,
  };

  const mappedIndustry = industryMap[normalizedIndustry] || INDUSTRIES.B2B_SALES;
  const specificQuestions = industryQuestions[mappedIndustry] || industryQuestions[INDUSTRIES.B2B_SALES];

  console.log("getQuestionsForIndustry:", {
    input: industry,
    normalized: normalizedIndustry,
    mapped: mappedIndustry,
    questionsCount: specificQuestions.length
  });

  return [...baseQuestions, ...specificQuestions];
};

// Calculate recommended plan based on responses
export const calculateRecommendedPlan = (responses) => {
  let score = { sales: 0, build: 0, scale: 0 };

  // Team size scoring (primary factor)
  const teamSize = responses.teamSize;
  if (teamSize === "Just me (Solo)" || teamSize === "2-5 people") {
    score.sales += 15;
    score.build += 8;
  } else if (teamSize === "6-10 people" || teamSize === "11-25 people") {
    score.build += 15;
    score.scale += 10;
  } else {
    score.scale += 20;
  }

  // Industry-specific scoring
  const industry = responses.industry;
  if (industry === "Marketing Agency" || industry === "Consulting Firm") {
    score.build += 10;
    score.scale += 8;
  } else if (industry === "Insurance" || industry === "Real Estate") {
    score.sales += 5;
    score.build += 10;
  }

  // Volume/Complexity scoring
  const volume =
    responses.leadVolume ||
    responses.clientCount ||
    responses.clientCapacity ||
    responses.transactionVolume;
  if (
    volume &&
    (volume.includes("50") || volume.includes("1-10") || volume.includes("1-5"))
  ) {
    score.sales += 8;
  } else if (
    volume &&
    (volume.includes("200") ||
      volume.includes("11-25") ||
      volume.includes("6-15"))
  ) {
    score.build += 10;
    score.scale += 5;
  } else if (
    volume &&
    (volume.includes("500") ||
      volume.includes("26-50") ||
      volume.includes("16-30"))
  ) {
    score.scale += 10;
  }

  // Deal size/project complexity scoring
  const dealSize = responses.dealSize || responses.projectVolume;
  if (
    dealSize &&
    (dealSize.includes("$25K") ||
      dealSize.includes("50+") ||
      dealSize.includes("26-50"))
  ) {
    score.scale += 8;
  } else if (
    dealSize &&
    (dealSize.includes("$5K") || dealSize.includes("4-10"))
  ) {
    score.build += 8;
  } else if (
    dealSize &&
    (dealSize.includes("Under $1K") || dealSize.includes("1-3"))
  ) {
    score.sales += 5;
  }

  // Tools complexity scoring
  const currentTools = responses.currentTools || responses.services;
  if (currentTools && Array.isArray(currentTools)) {
    if (currentTools.length >= 4) {
      score.scale += 10;
      score.build += 5;
    } else if (currentTools.length >= 2) {
      score.build += 8;
    }
  }

  // Find highest score
  const maxScore = Math.max(score.sales, score.build, score.scale);
  if (score.scale === maxScore) return "scale";
  if (score.build === maxScore) return "build";
  return "sales";
};

// Get plan details for recommendation
export const getPlanDetails = (plan) => {
  const plans = {
    sales: {
      name: "Sales",
      description: "Perfect for solo operators getting started",
      price: "$67",
      yearlyPrice: "$54",
      icon: "🚀",
      features: [
        "Up to 3 team members",
        "500 leads/month",
        "1,000 emails/month",
        "Lead & Contact Management",
        "Opportunities Pipeline",
        "Calendar Integration",
        "5GB storage",
        "Email Support",
      ],
    },
    build: {
      name: "Build",
      description: "Ideal for growing teams and agencies",
      price: "$187",
      yearlyPrice: "$149",
      icon: "🏗️",
      features: [
        "Up to 5 team members",
        "2,000 leads/month",
        "5,000 emails/month",
        "Everything in Sales",
        "Forms Builder (Unlimited)",
        "Email Campaigns",
        "Workflow Automation",
        "AI Lead Scoring",
        "Advanced Reporting",
        "50GB storage",
        "Priority Email Support",
      ],
    },
    scale: {
      name: "Scale",
      description: "Built for agencies at scale",
      price: "$349",
      yearlyPrice: "$279",
      icon: "📈",
      features: [
        "Unlimited team members",
        "Unlimited leads & emails",
        "Everything in Build",
        "White Label Branding",
        "API Access",
        "Custom Integrations",
        "Mind Maps & Team Chat",
        "500GB storage",
        "24/7 Priority Support with Onboarding",
      ],
    },
  };

  return plans[plan];
};

// Industry-specific value propositions
export const getIndustryValueProp = (industry) => {
  const valueProps = {
    insurance: {
      headline: "Built for Insurance Professionals",
      subheadline: "Automate follow-ups, track policies, and stay compliant",
      benefits: [
        "Automated policy renewal reminders",
        "Compliance tracking & documentation",
        "Lead nurturing for insurance prospects",
        "Commission tracking & reporting",
      ],
    },
    b2b_sales: {
      headline: "Optimize Your B2B Sales Process",
      subheadline: "Shorten sales cycles and close more deals",
      benefits: [
        "Visual sales pipeline management",
        "Automated follow-up sequences",
        "Deal stage tracking & forecasting",
        "Team collaboration tools",
      ],
    },
    coaching: {
      headline: "Streamline Your Coaching Practice",
      subheadline: "Focus on clients, not admin work",
      benefits: [
        "Client progress tracking",
        "Session scheduling & reminders",
        "Goal setting & milestone tracking",
        "Automated billing & invoicing",
      ],
    },
    marketing: {
      headline: "Scale Your Marketing Agency",
      subheadline: "Manage multiple clients from one platform",
      benefits: [
        "Client project management",
        "Campaign performance tracking",
        "White-label client portals",
        "Team collaboration & reporting",
      ],
    },
    consulting: {
      headline: "Professional Consulting Tools",
      subheadline: "Manage projects and deliver value efficiently",
      benefits: [
        "Project timeline & milestone tracking",
        "Time tracking & billing",
        "Document management & sharing",
        "Client communication hub",
      ],
    },
    real_estate: {
      headline: "Complete Real Estate CRM",
      subheadline: "From lead to close, manage it all",
      benefits: [
        "Property listing management",
        "Lead nurturing & follow-up",
        "Transaction tracking",
        "Commission & document management",
      ],
    },
  };

  return valueProps[industry.toLowerCase()] || valueProps.b2b_sales;
};
