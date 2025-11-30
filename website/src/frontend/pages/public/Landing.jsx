import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAppleAnimations } from "@/lib/apple-animations";
// import StatsSection from "@/components/landing/sections/StatsSection";
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
  Shield,
  Clock,
  DollarSign,
  Heart,
  Rocket,
  Star,
  CheckCircle2,
  XCircle,
  Send,
  Headset,
  UserPlus,
  Activity,
  LayoutDashboard,
  Phone,
  Inbox,
  GitBranch,
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
  MessagesSquare,
  PieChart,
  RotateCcw,
  FileBarChart,
  HelpCircle,
  UserCircle,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import axios from "axios";
import SEO from "@components/SEO";

gsap.registerPlugin(ScrollTrigger);

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
    // Initialize Apple-style animations
    try {
      initAppleAnimations();
    } catch (error) {
      console.error("Apple animations init error:", error);
    }

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
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          clearProps: "transform,opacity",
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

      {/* Navigation - Premium Glassmorphic Design */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border-b border-gray-800/30 backdrop-blur-xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Premium Effect */}
            <div className="flex items-center">
              <div className="relative group">
                {/* Subtle Accent Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#761B14]/0 via-[#761B14]/20 to-[#761B14]/0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Logo */}
                <img
                  src="/axolop-logo.png"
                  alt="Axolop"
                  className="h-11 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Navigation Links - Glassmorphic */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Pricing
              </a>
              <a
                href="#comparison"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Compare
              </a>
              <Button
                variant="ghost"
                onClick={() => navigate("/signin")}
                className="text-gray-300 hover:text-white hover:bg-white/5 backdrop-blur-xl"
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="relative overflow-hidden bg-gradient-to-br from-[#761B14]/40 via-[#761B14]/30 to-[#761B14]/20 hover:from-[#761B14]/60 hover:via-[#761B14]/50 hover:to-[#761B14]/40 text-white border-2 border-[#761B14]/60 shadow-lg backdrop-blur-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
                <span className="relative z-10 flex items-center">
                  {affiliateRef ? "Try 30 days FREE" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Affiliate Personalized Header - Only shows when arriving via affiliate link */}
      {affiliateName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#761B14] via-[#8b2214] to-[#761B14] border-b-2 border-[#ff6b4a]/30 shadow-2xl backdrop-blur-xl"
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#761B14]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#761B14]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Badge className="relative overflow-hidden bg-gradient-to-r from-[#761B14]/40 via-[#761B14]/30 to-[#761B14]/20 text-white border-2 border-[#761B14]/60 backdrop-blur-xl px-4 py-2 text-sm font-bold shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
                <span className="relative z-10">
                  The Break Up With Your Tools CRM
                </span>
              </Badge>
            </motion.div>

            <h1
              className="hero-title text-3xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl"
              style={{ opacity: 1 }}
            >
              Replace all your agency's tools with Axolop&trade;
            </h1>

            <p
              className="hero-subtitle text-lg sm:text-xl text-gray-400 mb-8 max-w-4xl mx-auto font-normal"
              style={{ opacity: 1 }}
            >
              Easily replace 10+ business tools with one AI-powered CRM platform
              with integrated marketing automation, project management, and AI
              assistant in minutes. No switching between apps required. Built
              for agency owners.
            </p>

            <div
              className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
              style={{ opacity: 1 }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="relative overflow-hidden bg-gradient-to-br from-[#761B14]/40 via-[#761B14]/30 to-[#761B14]/20 hover:from-[#761B14]/60 hover:via-[#761B14]/50 hover:to-[#761B14]/40 text-white text-lg px-10 py-7 rounded-xl border-2 border-[#761B14]/60 shadow-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105"
                data-magnetic
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
                <span className="relative z-10 flex items-center font-bold">
                  {affiliateRef
                    ? affiliateName
                      ? `Join ${affiliateName}'s Team - 30 Days FREE`
                      : "Claim Your 30-Day FREE Trial"
                    : "Get Started. It's FREE"}
                  <Rocket className="ml-2 h-5 w-5" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden text-white border-2 border-gray-700/50 hover:border-[#761B14]/60 bg-white/5 hover:bg-[#761B14]/10 text-lg px-10 py-7 rounded-xl backdrop-blur-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
                <span className="relative z-10 flex items-center">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Watch Demo
                </span>
              </Button>
            </div>

            <p className="text-sm text-white opacity-70">
              {affiliateRef
                ? `30-day FREE trial • No credit card • ${affiliateName ? `Recommended by ${affiliateName}` : "Special offer"}`
                : "Free forever • No credit card • Setup in 2 minutes"}
            </p>
          </div>

          {/* Real App Dashboard Preview - Based on Actual Screenshot */}
          <div
            className="hero-dashboard relative max-w-6xl mx-auto"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#761B14]/20 via-[#9A392D]/20 to-[#761B14]/20 rounded-3xl blur-2xl"></div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50">
              {/* macOS Window Controls */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
              </div>

              {/* App Layout - Matching Real Screenshot */}
              <div className="flex h-[600px]">
                {/* Sidebar - Exact Match */}
                <div className="w-52 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border-r border-gray-800/30 flex flex-col">
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
                      <button className="relative flex flex-col items-center justify-center flex-1 h-16 rounded-xl backdrop-blur-xl bg-gradient-to-br from-[#761B14]/40 via-[#761B14]/30 to-[#761B14]/20 border-2 border-[#761B14]/60 shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
                        <BarChart3 className="h-5 w-5 text-white relative z-10 mb-1" />
                        <span className="text-[9px] font-bold text-white relative z-10">
                          CRM
                        </span>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#761B14] rounded-full" />
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
                      <button className="flex items-center justify-center py-2 px-2 rounded-lg bg-gradient-to-r from-[#761B14]/30 via-[#761B14]/20 to-transparent text-white border border-[#761B14] text-xs font-medium">
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
                                  <span className="flex-1 text-left">List</span>
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
                            <span className="flex-1 text-left">Contacts</span>
                          </button>
                          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                            <Workflow className="h-3.5 w-3.5" />
                            <span className="flex-1 text-left">Workflows</span>
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
                              <span className="flex-1 text-left">Reports</span>
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
                            <span className="flex-1 text-left">Workflows</span>
                          </button>
                          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-150 text-xs">
                            <FileBarChart className="h-3.5 w-3.5" />
                            <span className="flex-1 text-left">Reports</span>
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
                            <span className="flex-1 text-left">Tickets</span>
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
                      <Button size="sm" variant="outline" className="text-xs">
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
                        <div className="text-4xl font-bold text-[#761B14] mb-2">
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
                          <div className="text-sm text-gray-600">NEW LEADS</div>
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
                            <div className="w-10 h-10 rounded-xl bg-[#761B14] flex items-center justify-center">
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
                              className="w-8 bg-gradient-to-t from-[#761B14] to-[#9A392D] rounded-t"
                              style={{ height: "60%" }}
                            ></div>
                            <div
                              className="w-8 bg-gradient-to-t from-[#761B14] to-[#9A392D] rounded-t"
                              style={{ height: "75%" }}
                            ></div>
                            <div
                              className="w-8 bg-gradient-to-t from-[#761B14] to-[#9A392D] rounded-t"
                              style={{ height: "65%" }}
                            ></div>
                            <div
                              className="w-8 bg-gradient-to-t from-[#761B14] to-[#9A392D] rounded-t"
                              style={{ height: "85%" }}
                            ></div>
                            <div
                              className="w-8 bg-gradient-to-t from-[#761B14] to-[#9A392D] rounded-t"
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
                            <div className="font-bold text-[#761B14]">
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
                              color: "bg-[#d4463c]",
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
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-500/90 via-pink-500/90 to-orange-500/90 rounded-2xl shadow-2xl p-4 border-2 border-white/20 backdrop-blur-xl"
              data-float
              data-float-amplitude="5"
              data-float-duration="4"
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
              data-float
              data-float-amplitude="5"
              data-float-duration="3.5"
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
      </section>

      {/* Stats Section - Apple-style scroll-controlled counters */}
      <StatsSection />

      {/* Social Proof - Black Background */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-12 uppercase tracking-wider font-semibold">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10">
            {[
              "Wayfair",
              "Deloitte",
              "Pfizer",
              "Adobe",
              "American Airlines",
              "NBC Universal",
            ].map((company, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-2xl font-bold text-gray-600 hover:text-[#761B14] transition-all duration-300 cursor-pointer"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              viewport={{ once: true }}
              className="inline-block mb-5"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#761B14]/20 via-[#d4463c]/20 to-[#761B14]/20 border border-[#761B14]/40">
                <span className="text-sm font-semibold bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14] bg-clip-text text-transparent">
                  THE NEW AGE OF CRMS
                </span>
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              <span className="text-white">Way more than traditional CRM</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
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
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-gray-800/50 hover:border-[#761B14]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(212,70,60,0.5)]"
            >
              {/* Brand color glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#761B14]/20 dark:bg-[#d4463c]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#761B14] to-[#d4463c] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl shadow-[#761B14]/50">
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
                      <div className="w-2 h-2 rounded-full bg-[#761B14] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#761B14]/50 transition-shadow" />
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
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
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
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-slate-200/50 dark:border-[#d4463c]/30 hover:border-[#d4463c]/60 dark:hover:border-[#d4463c]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(212,70,60,0.4)] dark:hover:shadow-[0_20px_70px_-10px_rgba(212,70,60,0.5)]"
            >
              {/* Orange analogous glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d4463c]/20 dark:bg-[#d4463c]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#d4463c] to-[#ff6b5c] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-2xl shadow-[#d4463c]/50">
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
                      <div className="w-2 h-2 rounded-full bg-[#d4463c] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#d4463c]/50 transition-shadow" />
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
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
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
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="relative overflow-hidden bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14] text-white text-lg px-12 py-8 rounded-2xl border-2 border-[#761B14] shadow-2xl transition-all duration-300 transform hover:scale-105 group"
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
              viewport={{ once: true }}
              className="inline-block mb-5"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#761B14]/10 via-[#d4463c]/10 to-[#761B14]/10 border border-[#761B14]/20">
                <span className="text-sm font-semibold bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14] bg-clip-text text-transparent">
                  100+ FEATURES
                </span>
              </div>
            </motion.div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
              data-reveal
            >
              <span className="text-white">Everything you need in one</span>
              <br />
              <span className="bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14] bg-clip-text text-transparent">
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
                viewport={{ once: true }}
                transition={{ delay: i * 0.01, duration: 0.3 }}
                className="group relative overflow-hidden bg-gray-900/50 rounded-2xl p-5 border border-gray-800/50 hover:border-[#761B14]/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#761B14]/20"
              >
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#761B14]/20 to-[#d4463c]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-[#d4463c] group-hover:text-[#761B14] transition-colors" />
                  </div>
                  <h3 className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors leading-tight">
                    {feature}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Highlighted Features - Brand Color Theory */}
          <div className="grid md:grid-cols-2 gap-6 animate-on-scroll">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-10 border-2 border-gray-800/50 hover:border-[#761B14]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(123,28,20,0.4)]"
              data-feature-card
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d4463c]/20 blur-3xl rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#761B14] to-[#d4463c] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#761B14]/30">
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
                      <Check className="h-4 w-4 text-[#d4463c] mr-3 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
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
              <Badge className="relative overflow-hidden bg-[#761B14]/20 text-white border border-[#761B14]/40 backdrop-blur-xl px-6 py-3 text-sm font-bold shadow-lg hover:bg-[#761B14]/30 transition-all">
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
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative overflow-hidden bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-800/60 flex items-center justify-between hover:border-[#d4463c]/40 hover:bg-gray-900/80 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#761B14]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <XCircle className="h-5 w-5 text-[#d4463c] flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#761B14]/30 to-[#d4463c]/30 backdrop-blur-sm rounded-xl p-5 border-2 border-[#d4463c]/40 flex items-center justify-between font-bold text-xl shadow-lg mt-4">
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
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="relative overflow-hidden bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/80 rounded-3xl p-10 border-2 border-[#d4463c]/40 shadow-[0_20px_80px_-20px_rgba(123,28,20,0.4)] hover:shadow-[0_30px_100px_-20px_rgba(212,70,60,0.6)] transition-all duration-500"
              >
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#761B14]/10 via-transparent to-[#14787b]/5 opacity-50"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#761B14] to-[#d4463c] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-3 transition-transform duration-300">
                    <img
                      src="/axolop-logo.png"
                      alt="Axolop"
                      className="h-16 w-auto object-contain"
                    />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">Axolop</h3>

                  <div className="mb-2">
                    <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14]">
                      $149
                    </span>
                    <span className="text-xl text-gray-400">/mo</span>
                  </div>

                  <p className="text-gray-400 mb-8 text-base">
                    Everything included. Forever.
                  </p>

                  <ul className="text-left space-y-2.5 mb-8">
                    {[
                      "All features, unlimited forever",
                      "Unlimited contacts & data",
                      "No per-seat pricing",
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
                      Save $1,375/month
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      = $16,500 saved per year
                    </div>
                  </div>

                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-[#761B14] to-[#d4463c] hover:from-[#d4463c] hover:to-[#761B14] text-white text-base py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all font-semibold"
                  >
                    Start Free Forever
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
            viewport={{ once: true }}
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#761B14] to-[#d4463c] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#d4463c]/40">
              <Brain className="h-12 w-12 text-white" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">A new era of business,</span>
              <br />
              <span className="text-white">with </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14]">
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
                  gradient: "from-[#761B14] to-[#d4463c]",
                  color: "#761B14",
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
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
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
              className="mt-12 bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14] hover:from-[#d4463c] hover:via-[#761B14] hover:to-[#d4463c] text-white text-base px-10 py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all font-semibold"
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
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <Badge className="bg-[#761B14]/20 text-white border border-[#d4463c]/40 px-6 py-3 text-sm font-bold">
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
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#761B14] to-[#d4463c] flex items-center justify-center shadow-md">
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
                  {
                    feature: "Est. Monthly Cost (10 users)",
                    axolop: "$149",
                    clickup: "$500+",
                    activecampaign: "$500+",
                    ghl: "$497+",
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
                        <span className="font-bold text-base text-[#d4463c]">
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

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden"
      >
        {/* Subtle teal gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,120,123,0.06),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <Badge className="bg-[#14787b]/10 text-[#1fb5b9] border border-[#14787b]/30 px-6 py-3 text-sm font-bold backdrop-blur-sm">
                Simple Pricing
              </Badge>
            </motion.div>

            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
              data-reveal
            >
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No hidden fees. No per-seat charges. No surprise bills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
                <div className="mb-3">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-xl text-gray-500 ml-2">/mo</span>
                </div>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                  Get started signing clients in a complete sales workstation
                </p>

                <ul className="space-y-3 mb-10 min-h-[280px]">
                  {[
                    "100 contacts",
                    "1 user",
                    "Full Sales Pipeline",
                    "Lead & Contact management",
                    "Deal tracking & forecasting",
                    "Email tracking & open alerts",
                    "Sales call logging",
                    "Calendar & booking links",
                    "Activity timeline",
                    "Sales reports & analytics",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <Check className="h-4.5 w-4.5 text-[#14787b] mr-3 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full py-6 text-base bg-gray-900 hover:bg-gray-800 text-white transition-all rounded-xl font-semibold"
                  onClick={handleGetStarted}
                >
                  Get started
                </Button>
              </div>
            </motion.div>

            {/* Business Plan - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-[#1a1a1a] rounded-3xl p-10 border border-gray-800 shadow-2xl transform scale-105 z-10"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-white text-gray-900 font-bold px-6 py-2 text-xs shadow-lg">
                  Popular
                </Badge>
              </div>

              <div className="relative z-10 pt-4">
                <h3 className="text-3xl font-bold text-white mb-4">Business</h3>
                <div className="mb-3">
                  <span className="text-5xl font-bold text-white">$119</span>
                  <span className="text-xl text-gray-400 ml-2">/mo</span>
                </div>
                <p className="text-gray-300 mb-8 text-base">
                  Everything unlimited. Forever.
                </p>

                <ul className="space-y-3 mb-10 min-h-[280px]">
                  {[
                    "UNLIMITED contacts",
                    "UNLIMITED users",
                    "UNLIMITED everything",
                    "Full CRM + Sales Pipeline",
                    "Project Management + Kanban",
                    "UNLIMITED Mind Maps + Second Brain",
                    "Email Marketing + Automation",
                    "Form Builder (Typeform-level)",
                    "Calendar + Scheduling",
                    "Live Calls + AI Transcription",
                    "UNLIMITED Workflows + Integrations",
                    "Full AI Features included",
                    "Priority support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-200">
                      <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                  onClick={handleGetStarted}
                >
                  Get started
                </Button>
              </div>
            </motion.div>

            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Starter
                </h3>
                <div className="mb-3">
                  <span className="text-5xl font-bold text-gray-900">$100</span>
                  <span className="text-xl text-gray-500 ml-2">/mo</span>
                </div>
                <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                  Scale your sales with marketing automation & team tools
                </p>

                <ul className="space-y-3 mb-10 min-h-[280px]">
                  {[
                    "2,500 contacts",
                    "5 users",
                    "Full CRM + Sales Pipeline",
                    "Project Management + Kanban",
                    "5 Mind Maps",
                    "25 workflows",
                    "10 forms",
                    "Email campaigns (2,500/mo)",
                    "Calendar + Scheduling",
                    "Live calls (100 mins/mo)",
                    "Automation + integrations",
                    "Email support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <Check className="h-4.5 w-4.5 text-[#14787b] mr-3 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  className="w-full py-6 text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 transition-all rounded-xl font-semibold"
                  onClick={handleGetStarted}
                >
                  {affiliateRef
                    ? "Start 30-Day FREE Trial"
                    : "Start 14-Day Free Trial"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Enterprise Tier - Horizontal Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-6xl mx-auto mt-10"
          >
            <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Left side - Title & Description */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-3xl font-bold text-gray-900">
                      Enterprise
                    </h3>
                    <Badge className="bg-gray-100 text-gray-700 border border-gray-200 font-bold px-4 py-1.5 text-xs">
                      CUSTOM
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-base font-medium mb-2">
                    Best for agencies & large teams
                  </p>
                  <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
                    Get a custom demo and see how Axolop aligns with your goals.
                    White-label, SSO, dedicated support, and more.
                  </p>
                </div>

                {/* Middle - Key Features */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      "Everything in Business",
                      "White-label & rebrand",
                      "SSO & Advanced Security",
                      "Dedicated Success Manager",
                      "Custom integrations",
                      "SLA guarantee",
                      "24/7 Priority Support",
                      "Onboarding & Training",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-[#14787b] flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side - CTA */}
                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-10 py-6 text-base font-semibold transition-all whitespace-nowrap rounded-xl"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
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
            viewport={{ once: true }}
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
                className="bg-gradient-to-r from-[#761B14] to-[#9A392D] hover:from-[#9A392D] hover:to-[#761B14] text-white text-xl px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
              >
                {affiliateRef
                  ? affiliateName
                    ? `Join ${affiliateName}'s Team Now`
                    : "Claim Your 30-Day Trial"
                  : "Get Started Free Forever"}
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
              No credit card required • Free forever • Cancel anytime • Setup in
              2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer - Branded to Match Header */}
      <footer className="relative bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800/30 backdrop-blur-xl overflow-hidden">
        {/* Brand gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(123,28,20,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.06),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/axolop-logo.png"
                  alt="Axolop"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-gray-300 mb-6 text-lg font-light">
                The New Age CRM with Local AI Second Brain
                <br />
                <span className="text-gray-400">
                  All-in-one platform replacing 10+ SaaS tools.
                </span>
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4463c] transition-colors"
                >
                  <Star className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#14787b] transition-colors"
                >
                  <Star className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#761B14] transition-colors"
                >
                  <Star className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg">Product</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a
                    href="#features"
                    className="hover:text-[#d4463c] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-[#d4463c] transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#comparison"
                    className="hover:text-[#d4463c] transition-colors"
                  >
                    Comparison
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#d4463c] transition-colors"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg">Company</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14787b] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14787b] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14787b] transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#14787b] transition-colors"
                  >
                    Press Kit
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#761B14] transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#761B14] transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#761B14] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#761B14] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/30 pt-10 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Axolop LLC. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-4 sm:mt-0">
              Made for GoHighLevel agency owners ready to raise 20% profit
              margins
            </p>
          </div>
        </div>
      </footer>
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
