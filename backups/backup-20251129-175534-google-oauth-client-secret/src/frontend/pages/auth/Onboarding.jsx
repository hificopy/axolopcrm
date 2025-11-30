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
lets work on the pricing and make sure each tier actually activates that plan for 14 day free trial, after the user signs up, after a user signs up or a user hasnt finished onboarding, make it necessary for each user especiallyif they havent gone through it yet. after the onboarding which we will redo in inspiration with the monday.com onboarding (but using our form technology like the one we have now) and after the onboarding is done, the app loads in read only (axolop demo agency mode with the demo data) on the app home dahsboard. after the dashboard loaded completely after 3 seconds load sexy background color white  pop up with sexy animation, and show the tier they selected (synced with pricing page) with the Header,  it prompts them to the 14 day free trial of the trial they selected in pricing page (yes remember whcih one they picked)  Start your 14-Day Free Trial, with the features undearneath and undernath that in small text (THATS RADABLE AND HAS GOOD TEXT CONTRAST) should say Switch Pricing Tier? and cta button underneath that redericts to that stripe with the 14 day free trial selected and $0 for 14 days , after rederict and they put in their card details they are out of demo mode and mandatory pop up comes up wit  all the features from that pricing tier, make clear and update documentation on what features go to what this has to be clear, on the locked out elements there will be a similar tooltip pop up like the roadmap but with not a roadmap cta but a upsell cta to uograde to the specific tier that has it. (do not do this if the feature isnt out yet, if the feature isnt out yet make sure roadmap tooltips stay you just state next to it what tier theyre in if locked) make this stripe implementation sexy, and clean. minimize onboarding to 5 questions and take monday.com onboarding qustions (but for us more tailored to the orignial onboarding questions) first question has to be industry, and from that question there should be conditional logic if they picked something Industries available: Insurance,B2B Sales, Coaching, Marketing, Consulting Firms, Real Estate , and develop questions based on that. (remmeber axolop crm is an all in one tool competing with the likes of hubspot and gohighlevel but with modern features with a focus on being the best but it truly excels in everything even task management like asana or monday.com) 
