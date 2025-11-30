import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  CheckCircle,
  Brain,
  Zap,
  TrendingUp,
  Target,
  Rocket,
  Stars,
  HeartHandshake,
  User,
  Settings,
  Check,
} from "lucide-react";
import { Button } from "@components/ui/button";
import SequentialQuestion from "@components/SequentialQuestion";

/**
 * Onboarding Experience - Strategic Form to Tailor CRM Setup
 * Replaces "Get Started Free" button on landing page
 * Uses AI to recommend optimal plan and pre-configure CRM
 */
export default function Onboarding() {
  const navigate = useNavigate();

  // Onboarding state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQuestionExit, setShowQuestionExit] = useState(false);

  // Section management (backend only - user doesn't see sections)
  const [currentSection, setCurrentSection] = useState(0); // 0 = intro, 1-3 = sections
  const [showSectionAnimation, setShowSectionAnimation] = useState(false);
  const [completedSection, setCompletedSection] = useState(null);

  // Opening animation state
  const [showIntro, setShowIntro] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Section definitions (backend logic) - Will be overridden by updatedSections
  const [sections, setSections] = useState([
    {
      name: "Industry",
      icon: "user",
      startQuestion: 0,
      endQuestion: 4, // Questions 1-5 (indices 0-4)
      description: "Understanding your industry and ICP",
    },
    {
      name: "CRM Design",
      icon: "settings",
      startQuestion: 5,
      endQuestion: 9, // Questions 6-10 (indices 5-9)
      description: "Customizing your CRM setup",
    },
    {
      name: "Goals & Alignment",
      icon: "target",
      startQuestion: 10,
      endQuestion: 14, // Questions 11-15 (indices 10-14)
      description: "Aligning with your objectives",
    },
  ]);

  // Affiliate tracking
  const [affiliateRef, setAffiliateRef] = useState(null);
  const [affiliateName, setAffiliateName] = useState(null);

  // Dynamic form loading
  const [formLoading, setFormLoading] = useState(true);
  const [formError, setFormError] = useState(null);

  // Track affiliate on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    const fname = searchParams.get("fname");

    if (ref) {
      setAffiliateRef(ref);
      // No localStorage - will pass through React Router state to signup
      console.log("✅ Affiliate ref captured from URL:", ref);
    }

    if (fname) {
      setAffiliateName(
        fname.charAt(0).toUpperCase() + fname.slice(1).toLowerCase(),
      );
      console.log("✅ Affiliate name captured:", fname);
    }
  }, []);

  // Fetch onboarding form from database (real-time customizable by admin)
  useEffect(() => {
    const fetchOnboardingForm = async () => {
      try {
        setFormLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3002/api"}/forms?title=${
            affiliateRef
              ? "CRM Onboarding - Affiliate Flow"
              : "CRM Onboarding - Regular Flow"
          }`,
        );

        if (!response.ok) throw new Error("Failed to fetch onboarding form");

        const data = await response.json();
        if (data && data.length > 0) {
          // Use the form from database
          setOnboardingQuestions(data[0].questions || onboardingQuestions);
        }
        setFormLoading(false);
      } catch (error) {
        console.error("Error fetching onboarding form:", error);
        setFormError(error.message);
        setFormLoading(false);
        // Continue with hardcoded questions as fallback
      }
    };

    // Only fetch after intro animation
    if (!showIntro) {
      fetchOnboardingForm();
    }
  }, [showIntro, affiliateRef]);

  // Opening animation sequence
  useEffect(() => {
    // Show intro for 6 seconds (3s fade in + 3s display), then trigger 3s fade out
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 6000);

    // Show form after 9 seconds (6s intro + 3s fade out), then form fades in for 0.8s
    const formTimer = setTimeout(() => {
      setShowForm(true);
    }, 9000);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(formTimer);
    };
  }, []);

  // Strategic 15 questions to tailor CRM experience (fallback - will be replaced by database version)
  const [onboardingQuestions, setOnboardingQuestions] = useState([
    // SECTION 1: Industry (Questions 1-5) - Focus on ICP
    // Question 1: Name (Personal Touch)
    {
      id: "q1",
      field: "name",
      type: "short-text",
      title: "First, what's your name?",
      required: true,
      settings: {
        placeholder: "Enter your name",
      },
    },

    // Question 2: Email (Required for contact)
    {
      id: "q2",
      field: "email",
      type: "email",
      title: "What's your email address?",
      required: true,
      settings: {
        placeholder: "your.email@company.com",
        validateEmail: true, // Enable smart email validation
      },
    },

    // Question 3: Business Type (Industry Focus)
    {
      id: "q3",
      field: "businessType",
      type: "multiple-choice",
      title: "What industry are you in?",
      required: true,
      options: [
        "Marketing/Advertising Agency",
        "GoHighLevel Agency",
        "Digital Marketing Consultant",
        "SaaS Company",
        "Ecommerce Business",
        "Real Estate Agency",
        "Insurance",
        "Healthcare",
        "Finance/FinTech",
        "Legal Services",
        "Professional Services",
        "Manufacturing",
        "Other",
      ],
      settings: {},
    },

    // Question 4: Target Customer (ICP Focus)
    {
      id: "q4",
      field: "targetCustomer",
      type: "multiple-choice",
      title: "Who is your ideal customer?",
      required: true,
      options: [
        "B2B - Other Businesses",
        "B2C - Individual Consumers",
        "Both B2B and B2C",
        "SaaS Customers",
        "Lead Generation Clients",
        "Service Clients",
        "Direct-to-Consumer",
        "Other",
      ],
      settings: {},
    },

    // Question 5: ICP Size (ICP Focus)
    {
      id: "q5",
      field: "icpSize",
      type: "multiple-choice",
      title: "What size are your ideal customers?",
      required: true,
      options: [
        "Sole Proprietors",
        "Small Businesses (1-10 employees)",
        "Medium Businesses (11-50 employees)",
        "Large Businesses (51-200 employees)",
        "Enterprise (200+ employees)",
        "Consumers (B2C)",
        "Mixed",
        "Other",
      ],
      settings: {},
    },

    // SECTION 2: CRM Design (Questions 6-10) - CRM Configuration
    // Question 6: Team Size
    {
      id: "q6",
      field: "teamSize",
      type: "multiple-choice",
      title: "How many people are on your team?",
      required: true,
      options: [
        "Just me (Solo)",
        "2-5 people",
        "6-10 people",
        "11-25 people",
        "26-50 people",
        "50+ people",
      ],
      settings: {},
    },

    // Question 7: Current Tools (Pain Point Discovery)
    {
      id: "q7",
      field: "currentTools",
      type: "checkboxes",
      title: "Which tools are you currently using? (Select all that apply)",
      required: true,
      options: [
        "GoHighLevel ($497/mo)",
        "Typeform/Jotform",
        "ClickUp/Asana/Monday.com",
        "Notion/Coda",
        "Miro/Lucidchart",
        "Calendly/iClosed",
        "ActiveCampaign/Klaviyo/Mailchimp",
        "HubSpot",
        "Salesforce",
        "Google Sheets/Excel (manual tracking)",
        "None, Starting fresh",
      ],
      settings: {},
    },

    // Question 8: Monthly Tool Spend (Budget Discovery)
    {
      id: "q8",
      field: "monthlyToolSpend",
      type: "multiple-choice",
      title: "How much do you spend per month on these tools combined?",
      required: true,
      options: [
        "Less than $100",
        "$100 - $500",
        "$500 - $1,000",
        "$1,000 - $2,000",
        "$2,000 - $5,000",
        "$5,000+",
      ],
      settings: {},
    },

    // Question 9: Biggest Pain Point
    {
      id: "q9",
      field: "biggestPainPoint",
      type: "multiple-choice",
      title: "What's your biggest frustration with current tools?",
      required: true,
      options: [
        "Too many disconnected tools, context switching kills productivity",
        "Too expensive, paying for features I don't use",
        "Too complex, need something simpler",
        "Missing features, need more advanced capabilities",
        "Poor integration, data doesn't sync properly",
        "Slow performance, tools are laggy",
        "Bad support, can't get help when needed",
      ],
      settings: {},
    },

    // Question 10: Lead Volume (Usage Prediction)
    {
      id: "q10",
      field: "leadVolume",
      type: "multiple-choice",
      title: "How many leads do you manage per month?",
      required: true,
      options: [
        "Less than 50",
        "50 - 200",
        "200 - 500",
        "500 - 1,000",
        "1,000 - 5,000",
        "5,000+",
      ],
      settings: {},
    },

    // SECTION 3: Goals & Alignment (Questions 11-15) - Objectives & Outcomes
    // Question 11: Primary CRM Use Case
    {
      id: "q11",
      field: "primaryUseCase",
      type: "multiple-choice",
      title: "What will you primarily use this CRM for?",
      required: true,
      options: [
        "Lead Generation & Nurturing",
        "Sales Pipeline Management",
        "Email Marketing Campaigns",
        "Client Management & Communication",
        "Project Management",
        "Team Collaboration",
        "All of the above",
      ],
      settings: {},
    },

    // Question 12: Must-Have Features
    {
      id: "q12",
      field: "mustHaveFeatures",
      type: "checkboxes",
      title:
        "Which features are absolutely essential for you? (Select top 3-5)",
      required: true,
      options: [
        "Email Marketing & Automation",
        "Live Calls & Dialer",
        "Forms & Lead Capture",
        "Calendar & Scheduling",
        "Pipeline & Deal Management",
        "Advanced Reporting & Analytics",
        "Workflow Automation",
        "Project Management",
        "Team Collaboration",
        "AI Assistant",
        "Mind Maps & Visual Planning",
        "Second Brain / Knowledge Base",
      ],
      settings: {},
    },

    // Question 13: Automation Maturity
    {
      id: "q13",
      field: "automationMaturity",
      type: "multiple-choice",
      title: "How would you describe your current automation setup?",
      required: true,
      options: [
        "No automation, everything is manual",
        "Basic automation, simple email sequences",
        "Intermediate, multistep workflows with conditions",
        "Advanced, complex automations with integrations",
        "Expert, custom APIs and advanced triggers",
      ],
      settings: {},
    },

    // Question 14: Email Volume
    {
      id: "q14",
      field: "emailVolume",
      type: "multiple-choice",
      title: "How many marketing emails do you send per month?",
      required: true,
      options: [
        "Less than 1,000",
        "1,000 - 10,000",
        "10,000 - 50,000",
        "50,000 - 100,000",
        "100,000+",
      ],
      settings: {},
    },

    // Question 15: Goals
    {
      id: "q15",
      field: "goals",
      type: "checkboxes",
      title:
        "What are your main goals for the next 90 days? (Select all that apply)",
      required: true,
      options: [
        "Generate more leads",
        "Close more deals",
        "Improve email marketing ROI",
        "Save time with automation",
        "Reduce tool costs",
        "Improve team collaboration",
        "Better track pipeline & forecasting",
        "Scale operations",
        "Improve customer relationships",
        "Get better insights & reporting",
      ],
      settings: {},
    },
  ]);

  // AI-powered plan recommendation logic
  const calculateRecommendation = (responses) => {
    let score = {
      starter: 0,
      professional: 0,
      agency: 0,
      enterprise: 0,
    };

    // Team size scoring
    const teamSize = responses.teamSize;
    if (teamSize === "Just me (Solo)") {
      score.starter += 10;
      score.professional += 5;
    } else if (teamSize === "2-5 people") {
      score.professional += 10;
      score.agency += 5;
    } else if (teamSize === "6-10 people" || teamSize === "11-25 people") {
      score.agency += 10;
      score.professional += 5;
    } else {
      score.enterprise += 10;
      score.agency += 5;
    }

    // Lead volume scoring
    const leadVolume = responses.leadVolume;
    if (leadVolume === "Less than 50" || leadVolume === "50 - 200") {
      score.starter += 8;
      score.professional += 5;
    } else if (leadVolume === "200 - 500" || leadVolume === "500 - 1,000") {
      score.professional += 10;
      score.agency += 5;
    } else {
      score.agency += 10;
      score.enterprise += 10;
    }

    // Monthly spend scoring (budget indicator)
    const spend = responses.monthlyToolSpend;
    if (spend === "Less than $100" || spend === "$100 - $500") {
      score.starter += 10;
    } else if (spend === "$500 - $1,000" || spend === "$1,000 - $2,000") {
      score.professional += 10;
      score.agency += 5;
    } else {
      score.agency += 10;
      score.enterprise += 10;
    }

    // Email volume scoring
    const emailVolume = responses.emailVolume;
    if (emailVolume === "Less than 1,000" || emailVolume === "1,000 - 10,000") {
      score.starter += 5;
      score.professional += 8;
    } else if (emailVolume === "10,000 - 50,000") {
      score.professional += 5;
      score.agency += 10;
    } else {
      score.agency += 10;
      score.enterprise += 10;
    }

    // Feature needs scoring
    const mustHaveFeatures = responses.mustHaveFeatures || [];
    if (mustHaveFeatures.length >= 6) {
      score.agency += 10;
      score.enterprise += 5;
    } else if (mustHaveFeatures.length >= 4) {
      score.professional += 10;
      score.agency += 5;
    } else {
      score.starter += 10;
    }

    // Automation maturity scoring
    const automation = responses.automationMaturity;
    if (
      automation === "No automation, everything is manual" ||
      automation === "Basic automation, simple email sequences"
    ) {
      score.starter += 5;
      score.professional += 8;
    } else if (
      automation === "Intermediate, multistep workflows with conditions"
    ) {
      score.professional += 5;
      score.agency += 10;
    } else {
      score.agency += 10;
      score.enterprise += 10;
    }

    // Business type scoring
    const businessType = responses.businessType;
    if (
      businessType === "GoHighLevel Agency" ||
      businessType === "Marketing/Advertising Agency"
    ) {
      score.agency += 15;
      score.professional += 10;
    }

    // Find highest score
    const maxScore = Math.max(
      score.starter,
      score.professional,
      score.agency,
      score.enterprise,
    );

    let recommendedPlan = "professional";
    if (score.enterprise === maxScore) recommendedPlan = "enterprise";
    else if (score.agency === maxScore) recommendedPlan = "agency";
    else if (score.professional === maxScore) recommendedPlan = "professional";
    else recommendedPlan = "starter";

    // Generate personalized setup recommendations
    const setupRecommendations = [];

    if (mustHaveFeatures.includes("Email Marketing & Automation")) {
      setupRecommendations.push("Email campaigns and automation workflows");
    }
    if (mustHaveFeatures.includes("Forms & Lead Capture")) {
      setupRecommendations.push("Lead capture forms");
    }
    if (mustHaveFeatures.includes("Calendar & Scheduling")) {
      setupRecommendations.push("Calendar integration and booking links");
    }
    if (mustHaveFeatures.includes("Live Calls & Dialer")) {
      setupRecommendations.push("Twilio integration for calls");
    }
    if (mustHaveFeatures.includes("Pipeline & Deal Management")) {
      setupRecommendations.push("Custom sales pipeline");
    }

    return {
      plan: recommendedPlan,
      confidence: maxScore,
      setupRecommendations,
      estimatedSavings: calculateSavings(responses),
      responses,
    };
  };

  // Calculate estimated savings
  const calculateSavings = (responses) => {
    const currentTools = responses.currentTools || [];
    let currentCost = 0;

    const toolCosts = {
      "GoHighLevel ($497/mo)": 497,
      "Typeform/Jotform": 100,
      "ClickUp/Asana/Monday.com": 50,
      "Notion/Coda": 30,
      "Miro/Lucidchart": 50,
      "Calendly/iClosed": 97,
      "ActiveCampaign/Klaviyo/Mailchimp": 500,
      HubSpot: 800,
      Salesforce: 1200,
    };

    currentTools.forEach((tool) => {
      currentCost += toolCosts[tool] || 0;
    });

    const axolopCost = 149;
    return Math.max(0, currentCost - axolopCost);
  };

  // Check if current question is the last in a section
  const isEndOfSection = (questionIndex) => {
    return sections.some((section) => section.endQuestion === questionIndex);
  };

  // Get current section info
  const getCurrentSectionInfo = (questionIndex) => {
    return sections.find(
      (section) =>
        questionIndex >= section.startQuestion &&
        questionIndex <= section.endQuestion,
    );
  };

  // Handle moving to next question with section checks
  const handleNextQuestion = () => {
    if (isEndOfSection(currentQuestionIndex)) {
      // Show section completion animation
      const sectionInfo = getCurrentSectionInfo(currentQuestionIndex);
      setCompletedSection(sectionInfo);

      // Show exit animation for question
      setShowQuestionExit(true);

      // After exit animation completes (0.8 seconds), hide the form
      setTimeout(() => {
        setShowForm(false);

        // Show section animation after a brief pause
        setTimeout(() => {
          setShowSectionAnimation(true);

          // After section animation completes (around 4 seconds total animation time),
          // move to next question
          setTimeout(() => {
            setShowSectionAnimation(false);
            setCompletedSection(null);

            if (currentQuestionIndex < onboardingQuestions.length - 1) {
              // Move to the next question after the section animation
              setCurrentQuestionIndex(currentQuestionIndex + 1);

              // Reset exit animation flag and show next question after a brief delay
              setTimeout(() => {
                setShowQuestionExit(false);
                setShowForm(true);
              }, 100); // Brief delay to reset state
            } else {
              handleSubmit();
            }
          }, 4000); // Section animation duration
        }, 300); // Brief pause before showing section animation
      }, 800); // Duration of exit animation
    } else {
      // Just move to next question - no exit animation needed between questions
      if (currentQuestionIndex < onboardingQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Show exit animation for question before loading results
    setShowQuestionExit(true);

    // After exit animation completes, show loading
    setTimeout(async () => {
      setShowForm(false);
      setLoading(true);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const recommendation = calculateRecommendation(responses);
      setRecommendedPlan(recommendation);
      setLoading(false);
      setShowResults(true);

      // Store in localStorage for signup flow
      localStorage.setItem("onboarding_responses", JSON.stringify(responses));
      localStorage.setItem("recommended_plan", recommendation.plan);
    }, 800); // Duration of exit animation
  };

  // Handle continue to signup
  const handleContinueToSignup = () => {
    // Navigate to signup with onboarding data
    const signupState = {
      fromOnboarding: true,
      email: responses.email,
      name: responses.name,
      recommendedPlan: recommendedPlan,
    };

    // Include affiliate ref if present
    if (affiliateRef) {
      signupState.affiliateRef = affiliateRef;
    }

    navigate("/signup", { state: signupState });
  };

  // Plan details
  const planDetails = {
    starter: {
      name: "Starter",
      price: "$49",
      description: "Perfect for solopreneurs getting started",
      features: [
        "Up to 1,000 contacts",
        "Basic email marketing",
        "Simple forms",
        "Basic automation",
        "1 user",
      ],
    },
    professional: {
      name: "Professional",
      price: "$149",
      description: "Best for growing teams and businesses",
      features: [
        "Up to 10,000 contacts",
        "Advanced email marketing",
        "Advanced forms with logic",
        "Full workflow automation",
        "Live calls & dialer",
        "Calendar & scheduling",
        "Up to 5 users",
      ],
    },
    agency: {
      name: "Agency",
      price: "$349",
      description: "Ideal for agencies managing multiple clients",
      features: [
        "Unlimited contacts",
        "White label options",
        "Client subaccounts",
        "Advanced reporting",
        "Priority support",
        "API access",
        "Up to 15 users",
      ],
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      description: "For large teams with custom needs",
      features: [
        "Everything in Agency",
        "Custom integrations",
        "Dedicated account manager",
        "Custom training",
        "SLA guarantees",
        "Unlimited users",
      ],
    },
  };

  // Get icon component for section
  const getSectionIcon = (iconName) => {
    switch (iconName) {
      case "user":
        return User;
      case "settings":
        return Settings;
      case "target":
        return Target;
      default:
        return Sparkles;
    }
  };

  // Section Completion Animation
  if (showSectionAnimation && completedSection) {
    const IconComponent = getSectionIcon(completedSection.icon);

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="section-animation"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="min-h-screen bg-white flex items-center justify-center overflow-hidden"
        >
          <div className="text-center relative">
            {/* Floating particles background - similar to intro animation but with section color */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-br from-[#761B14]/20 to-[#ff6b4a]/20 rounded-full"
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.random() * 600 - 300,
                    y: Math.random() * 600 - 300,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Icon morphing to checkmark animation */}
            <div className="mb-8 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="inline-block"
              >
                <div className="relative">
                  {/* Expanding ring - similar to intro animation */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(118, 27, 20, 0)",
                        "0 0 0 40px rgba(118, 27, 20, 0.1)",
                        "0 0 0 80px rgba(118, 27, 20, 0)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block rounded-full"
                  >
                    {/* Main icon container - showing section icon first */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-br from-[#761B14] to-[#ff6b4a] p-8 rounded-full"
                    >
                      <IconComponent className="w-24 h-24 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Then morph to checkmark after delay */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                      "0 0 0 40px rgba(34, 197, 94, 0.1)",
                      "0 0 0 80px rgba(34, 197, 94, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block rounded-full"
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-full shadow-2xl">
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 2, duration: 0.8 }}
                    >
                      <Check className="w-24 h-24 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Success message */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                {completedSection.name} Complete!
              </h2>
              <p className="text-xl text-gray-600">
                {completedSection.description}
              </p>
            </motion.div>

            {/* Continuing indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 4,
                times: [0, 0.1, 0.8, 1],
                delay: 2,
              }}
              className="mt-8 text-gray-500 text-sm"
            >
              Moving to next section...
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Beautiful Intro Animation
  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="intro-animation"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="min-h-screen bg-white flex items-center justify-center overflow-hidden"
        >
          <div className="text-center relative">
            {/* Floating particles background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-br from-[#761B14]/20 to-[#ff6b4a]/20 rounded-full"
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.random() * 600 - 300,
                    y: Math.random() * 600 - 300,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Main animation content */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8 relative z-10"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(118, 27, 20, 0)",
                      "0 0 0 40px rgba(118, 27, 20, 0.1)",
                      "0 0 0 80px rgba(118, 27, 20, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block rounded-full"
                >
                  <div className="bg-gradient-to-br from-[#761B14] to-[#ff6b4a] p-8 rounded-full">
                    <Sparkles className="w-24 h-24 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#761B14] to-[#ff6b4a] bg-clip-text text-transparent mb-4"
            >
              {affiliateName
                ? `Welcome, ${affiliateName}!`
                : "Let's Build Your Perfect CRM"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              {affiliateRef
                ? "Get ready to start your 30 day FREE trial"
                : "Answer a few questions to personalize your experience"}
            </motion.p>

            {/* Subtle loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-12 flex justify-center gap-2"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-[#761B14] to-[#ff6b4a] rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (loading) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="min-h-screen bg-white flex items-center justify-center"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6 inline-block"
            >
              <Brain className="w-16 h-16 text-[#761B14]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing your needs...
            </h2>
            <p className="text-gray-600">
              Our AI is crafting the perfect CRM experience for you
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (showResults && recommendedPlan) {
    const plan = planDetails[recommendedPlan.plan];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="min-h-screen bg-white py-12 px-4"
        >
          <div className="max-w-4xl mx-auto">
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="inline-block p-4 bg-green-500/20 rounded-full mb-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">
                Perfect Match Found!
              </h1>
              <p className="text-gray-600 text-lg">
                Based on your answers, we've tailored the perfect CRM setup for{" "}
                {responses.name}
              </p>
            </motion.div>

            {/* Recommended Plan Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden"
            >
              {/* Affiliate Badge - 30 Day Trial */}
              {affiliateRef && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-[#761B14] to-[#ff6b4a] text-white px-6 py-2 rounded-bl-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-bold text-sm">
                        30-DAY FREE TRIAL
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-gray-900">
                    {plan.name} Plan
                  </h2>
                  <p className="text-gray-600">{plan.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {affiliateRef
                      ? "30-day free trial included"
                      : "14-day free trial included"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#761B14]">
                    {plan.price}
                  </div>
                  {plan.price !== "Custom" && (
                    <div className="text-gray-500">/month</div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {recommendedPlan.estimatedSavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-bold text-lg text-green-700">
                        Save $
                        {recommendedPlan.estimatedSavings.toLocaleString()}
                        /month
                      </div>
                      <div className="text-sm text-gray-600">
                        That's $
                        {(
                          recommendedPlan.estimatedSavings * 12
                        ).toLocaleString()}
                        /year by consolidating your tools
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Pre-configured Setup */}
            {recommendedPlan.setupRecommendations.length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-[#761B14]" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    We'll Set Up For You
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Based on your needs, we'll pre-configure these features:
                </p>
                <ul className="space-y-2">
                  {recommendedPlan.setupRecommendations.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-[#761B14]" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <Button
                size="lg"
                onClick={handleContinueToSignup}
                className="relative overflow-hidden bg-gradient-to-r from-[#761B14] to-[#ff6b4a] hover:from-[#8b2c24] hover:to-[#ff7b5a] text-white text-xl px-12 py-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center font-bold">
                  <Sparkles className="mr-3 h-6 w-6" />
                  {affiliateRef
                    ? "Start My 30 Day FREE Trial"
                    : "Create My Account, Start Free Trial"}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </span>
              </Button>
              <p className="text-gray-600 mt-4">
                {affiliateRef
                  ? "30 days FREE • No credit card required • Cancel anytime"
                  : "Free for 30 days • No credit card required • Cancel anytime"}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Main onboarding form
  return (
    <AnimatePresence mode="wait">
      {showForm && (
        <motion.div
          key={`question-${currentQuestionIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={showQuestionExit ? { opacity: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="min-h-screen bg-white"
        >
          {/* Question Content - Centered and Clean */}
          <div className="flex items-center justify-center min-h-screen py-20 px-4">
            <div className="max-w-3xl w-full">
              <SequentialQuestion
                questions={onboardingQuestions}
                responses={responses}
                setResponses={setResponses}
                onSubmit={handleNextQuestion}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                isMeetingMode={false}
                theme="light"
                brandColorPrimary="#761B14"
                brandColorSecondary="#ff6b4a"
                useGradient={true}
                fontColor="#111827"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
