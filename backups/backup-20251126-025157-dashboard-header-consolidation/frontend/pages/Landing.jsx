import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  Zap,
  Brain,
  Mail,
  Calendar,
  Users,
  BarChart3,
  Workflow,
  MessageSquare,
  FileText,
  Target,
  TrendingUp,
  DollarSign,
  Heart,
  Rocket,
  CheckCircle2,
  XCircle,
  Send,
  Headset,
  UserPlus,
  Activity,
  LayoutDashboard,
  Phone,
  Inbox,
  Network,
  Layout,
  BookOpen,
  Lock,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  History,
  Book,
  CircleDot,
  ListTodo,
  PieChart,
  RotateCcw,
  FileBarChart,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import SEO from "@/components/SEO";

// Import new landing page components
import { NavigationBar } from "@/components/landing/navigation";
import {
  StatsSection,
  TrustBadgesSection,
  CustomerLogosCarousel,
  VideoTestimonialsGrid,
  WallOfLoveSection,
  FeatureShowcaseSection,
  UseCaseSection,
  FreeTrialTimeline,
  FooterSection,
} from "@/components/landing/sections";

gsap.registerPlugin(ScrollTrigger);

// Dynamic Header Text Component
const DynamicHeaderText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Features with consistent character lengths for seamless UX
  // Memoized to prevent unnecessary re-renders
  const features = useMemo(
    () => [
      "CRM",
      "Sales",
      "Funnels",
      "Projects",
      "Chats",
      "Calls",
      "Emails",
      "AI",
    ],
    [],
  );

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [mounted]); // Only run when mounted state changes

  const variants = {
    enter: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      filter: "blur(4px)",
    },
    center: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for Apple-like smoothness
      },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      y: 10,
      filter: "blur(4px)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Prevent hydration mismatch and ensure smooth UX
  if (!mounted) {
    return (
      <span
        className="text-white font-bold"
        style={{
          textShadow: "0 0 30px rgba(74, 21, 21, 0.3)",
          fontSize: "inherit",
          lineHeight: "inherit",
        }}
      >
        CRM
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={currentIndex}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="text-white font-bold"
        style={{
          display: "inline-block",
          textShadow: "0 0 30px rgba(74, 21, 21, 0.3)",
          fontSize: "inherit",
          lineHeight: "inherit",
        }}
      >
        {features[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
};

// Enhanced feature icons mapping
const FEATURE_ICONS = {
  "CRM & Sales Pipeline": Target,
  "Email Marketing": Mail,
  "Marketing Automation": Workflow,
  "Form Builder": FileText,
  "Calendar & Scheduling": Calendar,
  "Live Calls & Dialer": Phone,
  "AI Assistant": Brain,
  "Team Collaboration": Users,
  "Analytics & Reports": BarChart3,
  "Workflow Automation": Zap,
  "Second Brain": Sparkles,
  "Customer Support": Headset,
  "Mind Maps & Logic": Network,
  "Lead Management": UserPlus,
  "Activity Tracking": Activity,
  "Inbox Management": Inbox,
};

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Sidebar collapse state for demo
  const [collapsedSections, setCollapsedSections] = useState({
    sales: false,
    opportunities: false,
    conversations: true,
    reports: true,
    marketing: true,
    service: true,
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Affiliate tracking state
  const [affiliateRef, setAffiliateRef] = useState(null);
  const [affiliateName, setAffiliateName] = useState(null);

  // Helper function to format name (capitalize first letter, rest lowercase)
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Track affiliate click and store referral code
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get("ref");
    const fname = searchParams.get("fname");

    if (ref) {
      setAffiliateRef(ref);

      // Track the affiliate click in Supabase (affiliate_clicks table)
      // No localStorage - we'll pass ref through URL params and React Router state
      axios
        .post(
          `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3002/api/v1"}/affiliate/track-click`,
          {
            referral_code: ref,
            landing_page: window.location.href,
            utm_source: searchParams.get("utm_source"),
            utm_medium: searchParams.get("utm_medium"),
            utm_campaign: searchParams.get("utm_campaign"),
          },
        )
        .catch((err) => {
          console.error("Error tracking affiliate click:", err);
        });

      console.log("✅ Affiliate click tracked in Supabase:", ref);
    }

    if (fname) {
      setAffiliateName(formatName(fname));
    }
  }, []);

  // Dynamic SEO content based on affiliate
  const seoTitle = affiliateName
    ? `Join ${affiliateName}'s Team - Axolop | The New Age CRM with Local AI Second Brain`
    : "Axolop - The New Age CRM with Local AI Second Brain | All-in-One Platform";

  const seoDescription = affiliateName
    ? `Join ${affiliateName}'s team with a 30-day free trial of Axolop. The New Age CRM with Local AI Second Brain. All-in-one platform replacing 10+ SaaS tools.`
    : "Axolop: The New Age CRM with Local AI Second Brain. Replace 10+ tools with our all-in-one platform. HubSpot competitor for ECOMMERCE, B2B BUSINESS, REAL ESTATE. Features: AI assistant, Project Management, Mind Maps, Marketing Automation.";

  useEffect(() => {
    // GSAP animations for hero section
    const tl = gsap.timeline();

    tl.fromTo(
      ".hero-title",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
    )
      .fromTo(
        ".hero-subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4",
      )
      .fromTo(
        ".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4",
      )
      .fromTo(
        ".hero-dashboard",
        {
          y: 60,
          opacity: 0,
          rotateX: 12,
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 8,
          duration: 1,
          ease: "power3.out",
          onComplete: () => {
            // Ensure visibility after animation
            const dashboard = document.querySelector(".hero-dashboard");
            if (dashboard) {
              dashboard.style.opacity = "1";
            }
          },
        },
        "-=0.5",
      );

    // Dashboard scroll-triggered tilt animation
    gsap.to(".hero-dashboard", {
      scrollTrigger: {
        trigger: ".hero-dashboard-wrapper",
        start: "top 80%",
        end: "bottom 40%",
        scrub: 1,
      },
      rotateX: 0,
      ease: "none",
    });

    // Scroll-triggered animations
    gsap.utils.toArray(".animate-on-scroll").forEach((elem) => {
      gsap.from(elem, {
        scrollTrigger: {
          trigger: elem,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleGetStarted = () => {
    // Navigate to onboarding instead of signup
    // Pass affiliate ref if present
    if (affiliateRef) {
      navigate(
        `/onboarding?ref=${affiliateRef}${affiliateName ? `&fname=${affiliateName}` : ""}`,
      );
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dynamic SEO Meta Tags */}
      <SEO
        title="Axolop - The New Age CRM with Local AI Second Brain | All-in-One Platform"
        description="Axolop: The New Age CRM with Local AI Second Brain. Replace 10+ tools with our all-in-one platform. HubSpot competitor for ECOMMERCE, B2B BUSINESS, REAL ESTATE. Features: AI assistant, Project Management, Mind Maps, Marketing Automation."
        keywords="CRM, Axolop, HubSpot alternative, AI CRM, sales automation, marketing automation, project management, mind maps, business automation, GoHighLevel competitor, e-commerce CRM, B2B CRM, real estate CRM, AI assistant"
        affiliateName={affiliateName}
      />

      {/* Navigation - Enhanced with Dropdowns */}
      <NavigationBar
        affiliateRef={affiliateRef}
        affiliateName={affiliateName}
      />

      {/* Affiliate Personalized Header - Only shows when arriving via affiliate link */}
      {affiliateName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515] border-b-2 border-[#6A2424]/30 shadow-2xl backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-[#ff6b4a] animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  Seems like{" "}
                  <span className="text-[#ff6b4a]">{affiliateName}</span> Wants
                  You To Try The New Age of CRMs
                </h2>
                <Sparkles className="h-6 w-6 text-[#ff6b4a] animate-pulse" />
              </div>
              <p className="text-white/90 text-sm sm:text-base font-medium">
                Join thousands of agencies saving 10+ hours per week
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`${affiliateName ? "pt-48" : "pt-28"} pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A1515]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4A1515]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1
              className="hero-title font-bold mb-6 leading-tight text-white drop-shadow-2xl"
              style={{
                opacity: 0,
                transform: "translateY(50px)",
                fontSize: "clamp(35px, 8vw, 77px)",
              }}
            >
              Replace Your Agency's <br className="hidden lg:block" />
              <DynamicHeaderText /> with Axolop&trade;
            </h1>

            <p
              className="hero-subtitle text-lg sm:text-xl text-gray-400 mb-8 max-w-4xl mx-auto font-normal"
              style={{ opacity: 0, transform: "translateY(30px)" }}
            >
              Easily replace 10+ business tools with one AI-powered CRM platform
              with integrated marketing automation, project management, and AI
              assistant in minutes. No switching between apps required.
            </p>

            <div
              className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
              style={{ opacity: 0, transform: "translateY(20px)" }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="relative overflow-hidden bg-gradient-to-br from-[#4A1515] to-[#3D1212] hover:from-[#5C1E1E] hover:to-[#4A1515] text-white text-lg px-10 py-7 rounded-full border border-[#6A2424]/30 shadow-[0_0_40px_rgba(74,21,21,0.6),_inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_50px_rgba(74,21,21,0.7)]"
              >
                <span className="relative z-10 flex items-center font-bold">
                  {affiliateRef
                    ? affiliateName
                      ? `Join ${affiliateName}'s Team - 30 Days FREE`
                      : "Claim Your 30-Day FREE Trial"
                    : "Replace your tools free in 30 mins"}
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden text-white border-2 border-gray-700/50 hover:border-[#4A1515]/60 bg-white/5 hover:bg-[#4A1515]/10 text-lg px-10 py-7 rounded-xl backdrop-blur-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
                <span className="relative z-10 flex items-center">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Demo
                </span>
              </Button>
            </div>

            <p className="text-sm text-white opacity-70">
              {affiliateRef
                ? `30-day FREE trial • No credit card • ${affiliateName ? `Recommended by ${affiliateName}` : "Special offer"}`
                : "14-day free trial • Setup in 30 mins"}
            </p>
          </div>

          {/* Real App Dashboard Preview - Based on Actual Screenshot */}
          <div
            className="hero-dashboard-wrapper relative mx-auto overflow-visible"
            style={{ perspective: "1500px", perspectiveOrigin: "center top" }}
          >
            {/* Responsive scale wrapper */}
            <div
              className="dashboard-scale-wrapper origin-top flex justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <style>{`
                .dashboard-scale-wrapper {
                  transform: scale(0.28);
                  margin-bottom: -430px;
                }
                @media (min-width: 400px) {
                  .dashboard-scale-wrapper {
                    transform: scale(0.34);
                    margin-bottom: -395px;
                  }
                }
                @media (min-width: 480px) {
                  .dashboard-scale-wrapper {
                    transform: scale(0.42);
                    margin-bottom: -350px;
                  }
                }
                @media (min-width: 640px) {
                  .dashboard-scale-wrapper {
                    transform: scale(0.55);
                    margin-bottom: -270px;
                  }
                }
                @media (min-width: 768px) {
                  .dashboard-scale-wrapper {
                    transform: scale(0.7);
                    margin-bottom: -180px;
                  }
                }
                @media (min-width: 1024px) {
                  .dashboard-scale-wrapper {
                    transform: scale(0.85);
                    margin-bottom: -90px;
                  }
                }
                @media (min-width: 1200px) {
                  .dashboard-scale-wrapper {
                    transform: scale(1);
                    margin-bottom: 0;
                  }
                }
              `}</style>
              <div
                className="hero-dashboard relative origin-top"
                style={{
                  opacity: 0,
                  transform: "translateY(60px) rotateX(12deg)",
                  willChange: "transform, opacity",
                  transformStyle: "preserve-3d",
                  width: "1100px",
                  flexShrink: 0,
                }}
              >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#4A1515]/20 via-[#5C1E1E]/20 to-[#4A1515]/20 rounded-3xl blur-2xl"></div>

                {/* Gradient Border Effect */}
                <div className="absolute -inset-[2px] bg-gradient-to-br from-pink-400/30 via-purple-400/20 to-cyan-400/30 rounded-2xl opacity-60"></div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 bg-black/50 backdrop-blur-sm">
                  {/* macOS Window Controls */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                    <div className="w-3 h-3 rounded-full bg-[#761B14]/80 hover:bg-[#761B14] transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
                  </div>

                  {/* App Layout - Matching Real Screenshot */}
                  <div className="flex h-[600px]">
                    {/* Sidebar - Exact Match */}
                    <div className="w-52 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border-r border-gray-800/30 flex flex-col flex-shrink-0">
                      {/* Logo */}
                      <div className="h-20 flex items-center justify-center px-4 border-b border-gray-800/30">
                        <img
                          src="/axolop-logo.png"
                          alt="Axolop"
                          className="h-12 w-auto object-contain"
                        />
                      </div>

                      {/* CRM/Chat/Tasks Buttons - Glassmorphic */}
                      <div className="px-3 py-4 border-b border-gray-800/30">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {/* CRM - Active */}
                          <button className="relative flex flex-col items-center justify-center flex-1 h-16 rounded-xl backdrop-blur-xl bg-gradient-to-br from-[#4A1515]/40 via-[#4A1515]/30 to-[#4A1515]/20 border-2 border-[#4A1515]/60 shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
                            <BarChart3 className="h-5 w-5 text-white relative z-10 mb-1" />
                            <span className="text-[9px] font-bold text-white relative z-10">
                              CRM
                            </span>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#4A1515] rounded-full" />
                          </button>

                          {/* Chat - Locked */}
                          <button className="relative flex flex-col items-center justify-center flex-1 h-16 rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-700/20 via-gray-800/30 to-gray-900/40 border-2 border-gray-700/40 shadow-md transition-all duration-300 hover:scale-105 overflow-hidden cursor-not-allowed">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                            <MessageSquare className="h-5 w-5 text-gray-400 relative z-10 mb-1" />
                            <span className="text-[9px] font-bold text-gray-400 relative z-10">
                              CHAT
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
                              <Lock className="h-3 w-3 text-gray-300" />
                            </div>
                          </button>

                          {/* Tasks - Locked */}
                          <button className="relative flex flex-col items-center justify-center flex-1 h-16 rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-700/20 via-gray-800/30 to-gray-900/40 border-2 border-gray-700/40 shadow-md transition-all duration-300 hover:scale-105 overflow-hidden cursor-not-allowed">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                            <CheckSquare className="h-5 w-5 text-gray-400 relative z-10 mb-1" />
                            <span className="text-[9px] font-bold text-gray-400 relative z-10">
                              TASKS
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
                              <Lock className="h-3 w-3 text-gray-300" />
                            </div>
                          </button>
                        </div>

                        {/* Second Brain Button */}
                        <button className="relative w-full flex items-center justify-center py-2.5 px-3 rounded-lg backdrop-blur-xl bg-gradient-to-r from-gray-700/20 via-gray-800/30 to-gray-900/40 border-2 border-gray-700/40 shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                          <Brain className="h-4 w-4 text-gray-300 relative z-10 mr-2" />
                          <span className="text-xs font-bold text-gray-300 relative z-10">
                            Second Brain
                          </span>
                        </button>

                        {/* Dashboard & Calendar */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button className="flex items-center justify-center py-2 px-2 rounded-lg bg-gradient-to-r from-[#4A1515]/30 via-[#4A1515]/20 to-transparent text-white border border-[#4A1515] text-xs font-medium">
                            <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                            Dashboard
                          </button>
                          <button className="flex items-center justify-center py-2 px-2 rounded-lg text-gray-300 hover:bg-white/5 border border-gray-800/30 text-xs font-medium">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            Calendar
                          </button>
                        </div>
                      </div>

                      {/* Navigation Items - Fully Functional */}
                      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                        {/* Sales Section */}
                        <div>
                          <button
                            onClick={() => toggleSection("sales")}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-white hover:bg-white/5 transition-all duration-150 text-sm group"
                          >
                            {!collapsedSections.sales ? (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:bg-gray-800/50 transition-all">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <DollarSign className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <span className="flex-1 text-left font-semibold">
                              Sales
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {!collapsedSections.sales && (
                            <div className="ml-3 mt-1 space-y-1">
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Inbox className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Inbox</span>
                                <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                  48
                                </span>
                              </button>

                              {/* Opportunities Submenu */}
                              <div>
                                <button
                                  onClick={() => toggleSection("opportunities")}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs"
                                >
                                  <TrendingUp className="h-3.5 w-3.5" />
                                  <span className="flex-1 text-left">
                                    Opportunities
                                  </span>
                                  {collapsedSections.opportunities ? (
                                    <ChevronRight className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </button>
                                {!collapsedSections.opportunities && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <CircleDot className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Pipeline
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <ListTodo className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        List
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Leads</span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Users className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Contacts
                                </span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Workflow className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Workflows
                                </span>
                              </button>

                              {/* Conversations Submenu */}
                              <div>
                                <button
                                  onClick={() => toggleSection("conversations")}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span className="flex-1 text-left">
                                    Conversations
                                  </span>
                                  {collapsedSections.conversations ? (
                                    <ChevronRight className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </button>
                                {!collapsedSections.conversations && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <History className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        History
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <Phone className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Live Calls
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <Activity className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Activities
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Reports Submenu */}
                              <div>
                                <button
                                  onClick={() => toggleSection("reports")}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs"
                                >
                                  <BarChart3 className="h-3.5 w-3.5" />
                                  <span className="flex-1 text-left">
                                    Reports
                                  </span>
                                  {collapsedSections.reports ? (
                                    <ChevronRight className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </button>
                                {!collapsedSections.reports && (
                                  <div className="ml-6 mt-1 space-y-1">
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <Activity className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Activity Overview
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <BarChart3 className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Activity Comparison
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <TrendingUp className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Opportunity Funnels
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <RotateCcw className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Status Changes
                                      </span>
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                      <PieChart className="h-3 w-3" />
                                      <span className="flex-1 text-left">
                                        Funnel
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Marketing Section */}
                        <div>
                          <button
                            onClick={() => toggleSection("marketing")}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-white hover:bg-white/5 transition-all duration-150 text-sm group"
                          >
                            {!collapsedSections.marketing ? (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14787b] to-[#1fb5b9] flex items-center justify-center flex-shrink-0">
                                <Send className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:bg-gray-800/50 transition-all">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14787b] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Send className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <span className="flex-1 text-left font-semibold">
                              Marketing
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {!collapsedSections.marketing && (
                            <div className="ml-3 mt-1 space-y-1">
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Email Marketing
                                </span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <FileText className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">Forms</span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Workflow className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Workflows
                                </span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <FileBarChart className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Reports
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Service Section */}
                        <div>
                          <button
                            onClick={() => toggleSection("service")}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-white hover:bg-white/5 transition-all duration-150 text-sm group"
                          >
                            {!collapsedSections.service ? (
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                                <Headset className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:bg-gray-800/50 transition-all">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Headset className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <span className="flex-1 text-left font-semibold">
                              Service
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          {!collapsedSections.service && (
                            <div className="ml-3 mt-1 space-y-1">
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Activity className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Tickets
                                </span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <Book className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Knowledge Base
                                </span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <UserCircle className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Customer Portal
                                </span>
                              </button>
                              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                                <BarChart3 className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">
                                  Support Analytics
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Main Dashboard Content - Based on Real Screenshot */}
                    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                      {/* Top Bar */}
                      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h2 className="text-xl font-bold text-gray-900">
                            Dashboard
                          </h2>
                          <Badge className="bg-rose-50 text-rose-600 border border-rose-200 text-xs">
                            THIS MONTH
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            November 2025
                          </Button>
                        </div>
                      </div>

                      {/* Dashboard Content */}
                      <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">
                        {/* Stats Grid - From Real Screenshot */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          {/* Total Revenue */}
                          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-sm text-gray-600 mb-2">
                              TOTAL REVENUE
                            </div>
                            <div className="text-4xl font-bold text-[#4A1515] mb-2">
                              $125k
                            </div>
                            <div className="flex items-center text-sm text-green-600 font-semibold">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +12.5%
                            </div>
                          </div>

                          {/* Active Deals */}
                          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">
                                ACTIVE DEALS
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14787b] to-[#1fb5b9] flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                              0
                            </div>
                            <div className="flex items-center text-sm text-green-600 font-semibold">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +12.5%
                            </div>
                          </div>

                          {/* New Leads */}
                          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">
                                NEW LEADS
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                              10
                            </div>
                            <div className="flex items-center text-sm text-green-600 font-semibold">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +12.5%
                            </div>
                          </div>

                          {/* Conversion Rate */}
                          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">
                                CONVERSION RATE
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                                <Target className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">
                              60.0%
                            </div>
                            <div className="text-sm text-gray-600">
                              Conversion Rate
                            </div>
                          </div>
                        </div>

                        {/* Revenue Overview Chart - Simplified from Screenshot */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-[#4A1515] flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">
                                    Revenue Overview
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Total: $700,450
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-green-600 font-semibold">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                13.2%
                              </div>
                            </div>
                            {/* Simplified Chart Visual */}
                            <div className="h-32 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg flex items-end px-4 pb-4">
                              <div className="flex-1 h-full flex items-end justify-around">
                                <div
                                  className="w-8 bg-gradient-to-t from-[#4A1515] to-[#5C1E1E] rounded-t"
                                  style={{ height: "60%" }}
                                ></div>
                                <div
                                  className="w-8 bg-gradient-to-t from-[#4A1515] to-[#5C1E1E] rounded-t"
                                  style={{ height: "75%" }}
                                ></div>
                                <div
                                  className="w-8 bg-gradient-to-t from-[#4A1515] to-[#5C1E1E] rounded-t"
                                  style={{ height: "65%" }}
                                ></div>
                                <div
                                  className="w-8 bg-gradient-to-t from-[#4A1515] to-[#5C1E1E] rounded-t"
                                  style={{ height: "85%" }}
                                ></div>
                                <div
                                  className="w-8 bg-gradient-to-t from-[#4A1515] to-[#5C1E1E] rounded-t"
                                  style={{ height: "90%" }}
                                ></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                              <div className="text-center">
                                <div className="text-gray-500">Weekly Avg</div>
                                <div className="font-bold text-gray-900">
                                  $116,742
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500">Highest</div>
                                <div className="font-bold text-green-600">
                                  $142,000
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500">Lowest</div>
                                <div className="font-bold text-[#4A1515]">
                                  $95,000
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  Conversion Funnel
                                </div>
                                <div className="text-sm text-gray-500">
                                  Lead to Customer Journey
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {[
                                {
                                  label: "Leads",
                                  value: "250",
                                  percent: "100%",
                                  color: "bg-[#14787b]",
                                },
                                {
                                  label: "Qualified",
                                  value: "175",
                                  percent: "70%",
                                  color: "bg-[#5C1E1E]",
                                },
                                {
                                  label: "Proposals",
                                  value: "85",
                                  percent: "34%",
                                  color: "bg-amber-500",
                                },
                                {
                                  label: "Customers",
                                  value: "42",
                                  percent: "17%",
                                  color: "bg-green-500",
                                },
                              ].map((stage, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div
                                      className={`w-2 h-2 rounded-full ${stage.color}`}
                                    ></div>
                                    <span className="text-sm text-gray-600">
                                      {stage.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-32 bg-gray-100 rounded-full h-2">
                                      <div
                                        className={`${stage.color} h-2 rounded-full transition-all`}
                                        style={{ width: stage.percent }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 w-12">
                                      {stage.value}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating AI Badge */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, 0, -2, 0],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-orange-500/90 rounded-2xl shadow-2xl p-4 border-2 border-white/20 backdrop-blur-xl"
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-white animate-pulse" />
                    <div>
                      <div className="text-xs text-white/90 font-bold">
                        AI Processing
                      </div>
                      <div className="text-xs text-white/70">
                        Lead scoring active
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Workflow Badge */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -2, 0, 2, 0],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#14787b]/90 via-[#1fb5b9]/90 to-[#14787b]/90 rounded-2xl shadow-2xl p-4 border-2 border-white/20 backdrop-blur-xl"
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-white animate-pulse" />
                    <div>
                      <div className="text-xs text-white/90 font-bold">
                        Workflow Active
                      </div>
                      <div className="text-xs text-white/70">
                        3 automations running
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW PERSPECTIVE-INSPIRED SECTIONS */}

      {/* Customer Logos Carousel */}
      <CustomerLogosCarousel />

      {/* Stats Section - Large animated numbers */}
      <StatsSection />

      {/* Trust Badges - G2, Capterra badges */}
      <TrustBadgesSection />

      {/* Feature Showcase Section */}
      <FeatureShowcaseSection />

      {/* Video Testimonials Grid */}
      <VideoTestimonialsGrid />

      {/* Use Cases by Industry */}
      <UseCaseSection />

      {/* Wall of Love - Short testimonials */}
      <WallOfLoveSection />

      {/* Free Trial Timeline */}
      <FreeTrialTimeline />

      {/* Key Differentiators - Black Background */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black">
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(123,28,20,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,120,123,0.10),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,70,60,0.08),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="inline-block mb-5"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4A1515]/20 via-[#5C1E1E]/20 to-[#4A1515]/20 border border-[#4A1515]/40">
                <span className="text-sm font-semibold bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515] bg-clip-text text-transparent">
                  THE NEW AGE OF CRMS
                </span>
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ opacity: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              <span className="text-white">Way more than traditional CRM</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ opacity: 0 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
            >
              The only platform that unifies everything you need to run your
              business
            </motion.p>
          </div>

          {/* Large Feature Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Local AI Second Brain - Primary Brand Red */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-gray-800/50 hover:border-[#4A1515]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.5)]"
            >
              {/* Brand color glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#4A1515]/20 dark:bg-[#5C1E1E]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4A1515] to-[#5C1E1E] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl shadow-[#4A1515]/50">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Local AI Second Brain
                </h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  Your data stays private with local AI processing. No cloud
                  uploads, no privacy risks.
                </p>
                <ul className="space-y-3">
                  {[
                    "Private AI processing on your machine",
                    "Intelligent knowledge base with RAG",
                    "Context-aware insights & recommendations",
                    "Semantic search across all business data",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-400 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#4A1515] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#4A1515]/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Mind Maps & Visual Planning - Complementary Teal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-slate-200/50 dark:border-[#14787b]/30 hover:border-[#14787b]/60 dark:hover:border-[#14787b]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(20,120,123,0.4)] dark:hover:shadow-[0_20px_70px_-10px_rgba(20,120,123,0.5)]"
            >
              {/* Teal complementary glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#14787b]/20 dark:bg-[#14787b]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#14787b] to-[#1fb5b9] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl shadow-[#14787b]/50">
                  <Network className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Mind Maps & Visual Planning
                </h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  Map out strategies visually. Replace Miro with native canvas
                  collaboration.
                </p>
                <ul className="space-y-3">
                  {[
                    "Visual strategy planning & brainstorming",
                    "Project dependencies & timelines",
                    "AI-generated mind maps from notes",
                    "Real-time collaborative canvas",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-400 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#14787b] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#14787b]/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Project Management - Analogous Orange */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-slate-200/50 dark:border-[#5C1E1E]/30 hover:border-[#5C1E1E]/60 dark:hover:border-[#5C1E1E]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.4)] dark:hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.5)]"
            >
              {/* Orange analogous glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5C1E1E]/20 dark:bg-[#5C1E1E]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#5C1E1E] to-[#6A2424] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl shadow-[#5C1E1E]/50">
                  <Layout className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Built-in Project Management
                </h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  Full ClickUp functionality built-in. Tasks, workflows, and
                  team collaboration.
                </p>
                <ul className="space-y-3">
                  {[
                    "Tasks, workflows & team collaboration",
                    "Kanban boards & Gantt charts",
                    "Project templates & automation",
                    "Resource planning & capacity tracking",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-400 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#5C1E1E] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#5C1E1E]/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Knowledge Base - Amber/Gold Accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-slate-200/50 dark:border-amber-500/30 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(245,158,11,0.4)] dark:hover:shadow-[0_20px_70px_-10px_rgba(245,158,11,0.5)]"
            >
              {/* Amber/gold wisdom glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 dark:bg-amber-500/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl shadow-amber-500/50">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Knowledge Base & Second Brain
                </h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  Notion-level documentation with AI-powered search and linked
                  thinking.
                </p>
                <ul className="space-y-3">
                  {[
                    "Rich text editor with blocks & embeds",
                    "Wiki & internal documentation",
                    "AI-enhanced semantic search",
                    "Linked notes & relationship mapping",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-400 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-amber-500/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ opacity: 0 }}
            className="text-center"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="relative overflow-hidden bg-gradient-to-br from-[#4A1515] to-[#3D1212] hover:from-[#5C1E1E] hover:to-[#4A1515] text-white text-lg px-12 py-8 rounded-full border border-[#6A2424]/20 shadow-[0_0_40px_rgba(74,21,21,0.6)] hover:shadow-[0_0_50px_rgba(74,21,21,0.7)] transition-all duration-300 transform hover:scale-105 group"
            >
              <span className="relative z-10 flex items-center font-bold text-xl">
                Experience the new age CRM
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Black Background */}
      <section
        id="features"
        ref={featuresRef}
        className="py-28 px-4 sm:px-6 lg:px-8 relative bg-black overflow-hidden"
      >
        {/* Brand color gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(123,28,20,0.12),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.10),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="inline-block mb-5"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4A1515]/10 via-[#5C1E1E]/10 to-[#4A1515]/10 border border-[#4A1515]/20">
                <span className="text-sm font-semibold bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515] bg-clip-text text-transparent">
                  100+ FEATURES
                </span>
              </div>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-white">Everything you need in one</span>
              <br />
              <span className="bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515] bg-clip-text text-transparent">
                converged workspace
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Replace 10+ tools with one intelligent platform
            </p>
          </div>

          {/* Feature Icons Grid - Brand Colors */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-16">
            {Object.entries(FEATURE_ICONS).map(([feature, Icon], i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: i * 0.02, duration: 0.4 }}
                style={{ opacity: 0 }}
                className="group relative overflow-hidden bg-gray-900/50 rounded-2xl p-5 border border-gray-800/50 hover:border-[#4A1515]/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#4A1515]/20"
              >
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4A1515]/20 to-[#5C1E1E]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-[#5C1E1E] group-hover:text-[#4A1515] transition-colors" />
                  </div>
                  <h3 className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors leading-tight">
                    {feature}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Highlighted Features - Brand Color Theory */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-gray-800/50 hover:border-[#4A1515]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.4)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5C1E1E]/20 blur-3xl rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A1515] to-[#5C1E1E] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#4A1515]/30">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Complete CRM & Sales
                </h3>
                <p className="text-gray-400 mb-6 text-base leading-relaxed">
                  Everything HubSpot and Close do, minus the complexity. Visual
                  pipeline, AI lead scoring, revenue forecasting, and team
                  collaboration: all built for speed.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Visual Kanban Pipeline",
                    "AI-Powered Lead Scoring",
                    "Revenue Forecasting",
                    "Team Activity Tracking",
                    "Built-in Dialer & SMS",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-[#5C1E1E] mr-3 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-gray-800/50 hover:border-[#14787b]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(20,120,123,0.4)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#14787b]/20 blur-3xl rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14787b] to-[#1fb5b9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#14787b]/30">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Marketing Automation
                </h3>
                <p className="text-gray-400 mb-6 text-base leading-relaxed">
                  ActiveCampaign and Klaviyo-level automation without the
                  learning curve. Visual workflows, smart segmentation, and A/B
                  testing that actually works.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Visual Workflow Builder",
                    "Smart Segmentation",
                    "A/B Testing Engine",
                    "Advanced Analytics",
                    "Form Builder (Typeform-level)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-[#1fb5b9] mr-3 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Break Up With Your Tools Section - Black Background */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(123,28,20,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.10),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-8"
            >
              <Badge className="relative overflow-hidden bg-[#4A1515]/20 text-white border border-[#4A1515]/40 backdrop-blur-xl px-6 py-3 text-sm font-bold shadow-lg hover:bg-[#4A1515]/30 transition-all">
                <span className="relative z-10">The All-in-One Platform</span>
              </Badge>
            </motion.div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8">
              <span className="text-white">Stop paying for 10+ tools.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400">
                Start using one.
              </span>
            </h2>

            <p className="text-xl text-gray-400 max-w-4xl mx-auto mb-16 leading-relaxed">
              Agency owners and business leaders are exhausted from juggling
              subscriptions, managing integrations, and dealing with
              inconsistent data across platforms.
              <br className="hidden sm:block" />
              <span className="text-white font-medium">
                Axolop is the all-in-one platform that actually delivers.
              </span>
            </p>
          </div>

          {/* Tool Replacement Comparison */}
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* What You're Replacing */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold mb-6 text-white">
                What you're replacing:
              </h3>
              {[
                {
                  name: "GoHighLevel",
                  cost: "$497/mo",
                  features: "CRM & Automation",
                },
                {
                  name: "Typeform / Jotform",
                  cost: "$100/mo",
                  features: "Form Builder",
                },
                {
                  name: "ClickUp / Asana",
                  cost: "$50/mo",
                  features: "Project Management",
                },
                {
                  name: "Notion / Coda",
                  cost: "$30/mo",
                  features: "Knowledge Base & Docs",
                },
                {
                  name: "Miro / Lucidchart",
                  cost: "$50/mo",
                  features: "Mind Maps & Diagrams",
                },
                {
                  name: "Scheduling Tools",
                  cost: "$97/mo",
                  features: "Scheduling & Meetings",
                },
                {
                  name: "ActiveCampaign",
                  cost: "$500/mo",
                  features: "Email Marketing",
                },
                {
                  name: "+ 5 more tools",
                  cost: "$200/mo",
                  features: "Various features",
                },
              ].map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  style={{ opacity: 0 }}
                  className="group relative overflow-hidden bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-800/60 flex items-center justify-between hover:border-[#5C1E1E]/40 hover:bg-gray-900/80 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#4A1515]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex-1 relative z-10">
                    <div className="font-semibold text-white text-base group-hover:text-gray-100 transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {tool.features}
                    </div>
                  </div>
                  <div className="text-right relative z-10 flex items-center gap-3">
                    <div className="font-bold text-white text-lg">
                      {tool.cost}
                    </div>
                    <XCircle className="h-5 w-5 text-[#5C1E1E] flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#4A1515]/30 to-[#5C1E1E]/30 backdrop-blur-sm rounded-xl p-5 border-2 border-[#5C1E1E]/40 flex items-center justify-between font-bold text-xl shadow-lg mt-4">
                <span className="text-white relative z-10">
                  Total Monthly Cost:
                </span>
                <span className="text-white text-2xl relative z-10">
                  $1,524
                </span>
              </div>
            </div>

            {/* Axolop - The Solution */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                style={{ opacity: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/80 rounded-3xl p-10 border-2 border-[#5C1E1E]/40 shadow-[0_20px_80px_-20px_rgba(74,21,21,0.4)] hover:shadow-[0_30px_100px_-20px_rgba(74,21,21,0.6)] transition-all duration-500"
              >
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A1515]/10 via-transparent to-[#14787b]/5 opacity-50"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#4A1515] to-[#5C1E1E] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-3 transition-transform duration-300">
                    <img
                      src="/axolop-logo.png"
                      alt="Axolop"
                      className="h-16 w-auto object-contain"
                    />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">Axolop</h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515]">
                      One Platform
                    </span>
                  </div>

                  <p className="text-gray-400 mb-8 text-base">
                    Everything you need. All in one place.
                  </p>

                  <ul className="text-left space-y-2.5 mb-8">
                    {[
                      "All features included",
                      "Unlimited contacts & data",
                      "Simple, transparent plans",
                      "100% data ownership",
                      "AI assistant included",
                      "Priority support",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <CheckCircle2 className="h-5 w-5 text-[#1fb5b9] mr-3 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gradient-to-r from-[#14787b]/30 to-[#1fb5b9]/30 border border-[#14787b]/50 rounded-xl p-5 mb-6">
                    <div className="font-bold text-xl text-[#1fb5b9]">
                      Save 10+ hours per week
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Focus on growing your business
                    </div>
                  </div>

                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-br from-[#4A1515] to-[#3D1212] hover:from-[#5C1E1E] hover:to-[#4A1515] text-white text-base py-6 rounded-full shadow-[0_0_30px_rgba(74,21,21,0.5)] hover:shadow-[0_0_40px_rgba(74,21,21,0.6)] transform hover:scale-105 transition-all font-semibold border border-[#6A2424]/20"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Section - Black Background */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,28,20,0.12),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,120,123,0.10),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            style={{ opacity: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#4A1515] to-[#5C1E1E] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#5C1E1E]/40">
              <Brain className="h-12 w-12 text-white" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">A new era of business,</span>
              <br />
              <span className="text-white">with </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A1515] via-[#5C1E1E] to-[#4A1515]">
                AI Agents
              </span>
            </h2>

            <p className="text-lg text-gray-400 max-w-4xl mx-auto mb-16 leading-relaxed">
              Let AI handle the repetitive work. Axolop's AI agents write
              emails, qualify leads, schedule meetings, analyze conversations,
              and optimize your workflows, so you can focus on closing deals and
              growing your business.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
              {[
                {
                  icon: Brain,
                  label: "@AI Agent",
                  desc: "Your 24/7 intelligent assistant that never sleeps",
                  gradient: "from-[#4A1515] to-[#5C1E1E]",
                  color: "#4A1515",
                },
                {
                  icon: Zap,
                  label: "Ambient Intelligence",
                  desc: "Automatic lead scoring, routing, and prioritization",
                  gradient: "from-[#14787b] to-[#1fb5b9]",
                  color: "#14787b",
                },
                {
                  icon: Rocket,
                  label: "Auto-Pilot Mode",
                  desc: "Set it and forget it. Never manually assign tasks again",
                  gradient: "from-amber-500 to-yellow-500",
                  color: "#f59e0b",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{ opacity: 0 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-800/50 hover:border-opacity-60 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 blur-3xl rounded-full"
                      style={{ backgroundColor: `${feature.color}20` }}
                    />
                  </div>
                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 mx-auto mb-5 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {feature.label}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleGetStarted}
              className="mt-12 bg-gradient-to-br from-[#4A1515] to-[#3D1212] hover:from-[#5C1E1E] hover:to-[#4A1515] text-white text-base px-10 py-6 rounded-full shadow-[0_0_30px_rgba(74,21,21,0.5)] hover:shadow-[0_0_40px_rgba(74,21,21,0.6)] transform hover:scale-105 transition-all font-semibold border border-[#6A2424]/20"
            >
              Try AI Agents Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table - Black Background */}
      <section
        id="comparison"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden"
      >
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,28,20,0.12),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="inline-block mb-6"
            >
              <Badge className="bg-[#4A1515]/20 text-white border border-[#5C1E1E]/40 px-6 py-3 text-sm font-bold">
                Feature Comparison
              </Badge>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
              How Axolop stacks up
            </h2>
            <p className="text-lg text-gray-400">
              See why thousands of agency owners are making the switch
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-2 border-gray-800/60">
              <thead className="bg-gray-900/80 border-b-2 border-gray-800/60">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A1515] to-[#5C1E1E] flex items-center justify-center shadow-md">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-base font-bold text-white">
                        Axolop
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ClickUp
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ActiveCampaign
                  </th>
                  <th className="px-6 py-5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    GoHighLevel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {[
                  {
                    feature: "Full CRM & Sales Pipeline",
                    axolop: true,
                    clickup: false,
                    activecampaign: false,
                    ghl: true,
                  },
                  {
                    feature: "Email Marketing & Campaigns",
                    axolop: true,
                    clickup: false,
                    activecampaign: true,
                    ghl: true,
                  },
                  {
                    feature: "Marketing Automation Workflows",
                    axolop: true,
                    clickup: false,
                    activecampaign: true,
                    ghl: true,
                  },
                  {
                    feature: "Form Builder (Typeform-level)",
                    axolop: true,
                    clickup: false,
                    activecampaign: false,
                    ghl: true,
                  },
                  {
                    feature: "Calendar & Scheduling",
                    axolop: true,
                    clickup: true,
                    activecampaign: false,
                    ghl: true,
                  },
                  {
                    feature: "Built-in Dialer & Live Calls",
                    axolop: true,
                    clickup: false,
                    activecampaign: false,
                    ghl: true,
                  },
                  {
                    feature: "AI Assistant & Automation",
                    axolop: true,
                    clickup: true,
                    activecampaign: false,
                    ghl: false,
                  },
                  {
                    feature: "Second Brain / Mind Maps (Miro)",
                    axolop: true,
                    clickup: false,
                    activecampaign: false,
                    ghl: false,
                  },
                  {
                    feature: "Project Management (ClickUp)",
                    axolop: true,
                    clickup: true,
                    activecampaign: false,
                    ghl: false,
                  },
                  {
                    feature: "Knowledge Base (Notion)",
                    axolop: true,
                    clickup: false,
                    activecampaign: false,
                    ghl: false,
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-300">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.axolop === "boolean" ? (
                        row.axolop ? (
                          <div className="flex justify-center">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#14787b]/30 to-[#1fb5b9]/30 border border-[#1fb5b9]/40 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-[#1fb5b9]" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <div className="w-7 h-7 rounded-lg bg-gray-800/50 flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                        )
                      ) : (
                        <span className="font-bold text-base text-[#5C1E1E]">
                          {row.axolop}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.clickup === "boolean" ? (
                        row.clickup ? (
                          <CheckCircle2 className="h-5 w-5 text-gray-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-700 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400 font-medium text-sm">
                          {row.clickup}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.activecampaign === "boolean" ? (
                        row.activecampaign ? (
                          <CheckCircle2 className="h-5 w-5 text-gray-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-700 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400 font-medium text-sm">
                          {row.activecampaign}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.ghl === "boolean" ? (
                        row.ghl ? (
                          <CheckCircle2 className="h-5 w-5 text-gray-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-700 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400 font-medium text-sm">
                          {row.ghl}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,28,20,0.08),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.05),transparent_50%)]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            style={{ opacity: 0 }}
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-10 text-white">
              Ready to break up with your tools?
            </h2>
            <p className="text-2xl text-gray-400 mb-16 font-light max-w-3xl mx-auto">
              Join thousands of agency owners and business leaders who've
              simplified their tech stack, saved thousands per month, and
              accelerated their growth with Axolop.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-br from-[#4A1515] to-[#3D1212] hover:from-[#5C1E1E] hover:to-[#4A1515] text-white text-xl px-12 py-8 rounded-full shadow-[0_0_40px_rgba(74,21,21,0.6)] hover:shadow-[0_0_50px_rgba(74,21,21,0.7)] transform hover:scale-105 transition-all border border-[#6A2424]/20"
              >
                {affiliateRef
                  ? affiliateName
                    ? `Join ${affiliateName}'s Team Now`
                    : "Claim Your 30-Day Trial"
                  : "Start Your 14-Day Free Trial"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-2 border-white hover:bg-white hover:text-gray-900 text-xl px-12 py-8 rounded-2xl backdrop-blur-xl"
              >
                Schedule a Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-8">
              14-day free trial • Cancel anytime • Setup in 30 mins
            </p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <FooterSection />
    </div>
  );
};

export default Landing;

// Add custom scrollbar styles
const style = document.createElement("style");
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;
if (!document.querySelector("style[data-custom-scrollbar]")) {
  style.setAttribute("data-custom-scrollbar", "true");
  document.head.appendChild(style);
}
