import { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
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
  Home,
  Folder,
  Filter,
  MoreHorizontal,
  Building2,
  Gift,
  Plus,
  Search,
  GraduationCap,
  Bot,
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

// DemoApp component removed - now using screenshot image instead

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
          textShadow: "0 0 30px rgba(79, 27, 27, 0.3)",
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
          textShadow: "0 0 30px rgba(79, 27, 27, 0.3)",
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

  // Scroll-based opacity for header glow
  const { scrollY } = useScroll();
  const glowOpacity = useTransform(scrollY, [0, 300, 500], [1, 0.3, 0]);

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
    <div className="relative min-h-screen bg-[#000000] text-white">
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

      {/* Header-to-Background Blend Gradient */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-24 pointer-events-none z-30"
        style={{
          background: "linear-gradient(180deg, #0F1522 0%, transparent 100%)",
          opacity: glowOpacity,
        }}
      />

      {/* Affiliate Personalized Header - Only shows when arriving via affiliate link */}
      {affiliateName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#761B14] via-[#5C2222] to-[#761B14] border-b-2 border-[#6A2525]/30 shadow-2xl backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-[#761B14] animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  Seems like{" "}
                  <span className="text-[#761B14]">{affiliateName}</span> Wants
                  You To Try The New Age of CRMs
                </h2>
                <Sparkles className="h-6 w-6 text-[#761B14] animate-pulse" />
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
                className="relative overflow-hidden bg-gradient-to-br from-[#761B14] to-[#3D1515] hover:from-[#5C2222] hover:to-[#761B14] text-white text-lg px-10 py-7 rounded-full border border-[#6A2525]/30 shadow-[0_0_40px_rgba(74,21,21,0.6),_inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_50px_rgba(74,21,21,0.7)]"
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
                className="relative overflow-hidden text-white border-2 border-gray-700/50 hover:border-[#761B14]/60 bg-white/5 hover:bg-[#761B14]/10 text-lg px-10 py-7 rounded-xl backdrop-blur-xl transition-all duration-300"
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
                <div className="absolute -inset-4 bg-gradient-to-r from-[#761B14]/20 via-[#5C2222]/20 to-[#761B14]/20 rounded-3xl blur-2xl"></div>

                {/* Gradient Border Effect */}
                <div className="absolute -inset-[2px] bg-gradient-to-br from-pink-400/30 via-purple-400/20 to-cyan-400/30 rounded-2xl opacity-60"></div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 bg-[#0a0f1a]">
                  {/* App Screenshot */}
                  <div className="h-[600px]">
                    <img
                      src="/demo-screenshot.png"
                      alt="Axolop CRM Dashboard"
                      className="w-full h-full object-cover object-top"
                    />
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
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-[#EBB207]/95 via-[#EBB207]/85 to-[#EBB207]/75 rounded-2xl shadow-2xl p-4 border-2 border-white/20 backdrop-blur-xl"
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
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#000000]">
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
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#761B14]/20 via-[#5C2222]/20 to-[#761B14]/20 border border-[#761B14]/40">
                <span
                  className="text-sm font-semibold bg-gradient-to-r from-[#761B14] via-[#5C2222] to-[#761B14] bg-clip-text text-transparent inline-block px-0.5"
                  style={{
                    WebkitBoxDecorationBreak: "clone",
                    boxDecorationBreak: "clone",
                  }}
                >
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
              className="text-lg text-gray-300 max-w-3xl mx-auto"
            >
              Built for marketing agencies who need to manage multiple clients,
              campaigns, and teams—all in one place
            </motion.p>
          </div>

          {/* Large Feature Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Client Retention Engine - Primary Brand Red */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#761B14]/30 hover:border-[#761B14]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.5)]"
            >
              {/* Brand color glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#761B14]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#761B14] to-[#5C2222] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-[#761B14]/50">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Client Retention Engine
                </h3>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Predictive AI that prevents churn before it happens. Keep your
                  clients longer and grow MRR.
                </p>
                <ul className="space-y-3">
                  {[
                    "Health scoring algorithms for every client",
                    "Automated retention campaigns",
                    "Sentiment analysis from communications",
                    "Proactive intervention recommendations",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-300 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#761B14] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#761B14]/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Multi-Client Revenue Attribution - Complementary Teal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#14787b]/30 hover:border-[#14787b]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(20,120,123,0.5)]"
            >
              {/* Teal complementary glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#14787b]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#14787b] to-[#1fb5b9] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-[#14787b]/50">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Multi-Client Revenue Attribution
                </h3>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Track ROI across all client campaigns with unified reporting.
                  Prove your value with data.
                </p>
                <ul className="space-y-3">
                  {[
                    "Cross-client campaign performance tracking",
                    "Unified analytics dashboard for all clients",
                    "Campaign performance benchmarking",
                    "Automated white-label client reporting",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-300 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#14787b] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#14787b]/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* White-Label Client Portals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#5C2222]/30 hover:border-[#5C2222]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.5)]"
            >
              {/* Brand glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5C2222]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#5C2222] to-[#6A2525] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-[#5C2222]/50">
                  <Layout className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  White-Label Client Portals
                </h3>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Automated client-branded reports and dashboards. Your brand,
                  professional image.
                </p>
                <ul className="space-y-3">
                  {[
                    "Fully branded client portals",
                    "Automated weekly/monthly reports",
                    "Client self-service dashboards",
                    "Custom domain support",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-300 group-hover:text-white transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#5C2222] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#5C2222]/50 transition-shadow" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Agency Growth Analytics - Amber/Gold Accent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(245,158,11,0.5)]"
            >
              {/* Amber/gold wisdom glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-amber-500/50">
                  <PieChart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Agency Growth Analytics
                </h3>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Agency-specific metrics: CLV, CAC, retention rates. Scale your
                  agency profitably.
                </p>
                <ul className="space-y-3">
                  {[
                    "Client Lifetime Value (CLV) tracking",
                    "Customer Acquisition Cost (CAC) optimization",
                    "Capacity planning & resource utilization",
                    "Revenue forecasting per service line",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-300 group-hover:text-white transition-colors"
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
              className="relative overflow-hidden bg-gradient-to-br from-[#761B14] to-[#3D1515] hover:from-[#5C2222] hover:to-[#761B14] text-white text-lg px-12 py-8 rounded-full border border-[#6A2525]/20 shadow-[0_0_40px_rgba(74,21,21,0.6)] hover:shadow-[0_0_50px_rgba(74,21,21,0.7)] transition-all duration-300 transform hover:scale-105 group"
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
        className="py-28 px-4 sm:px-6 lg:px-8 relative bg-[#000000] overflow-hidden"
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
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#761B14]/10 via-[#5C2222]/10 to-[#761B14]/10 border border-[#761B14]/20">
                <span
                  className="text-sm font-semibold bg-gradient-to-r from-[#761B14] via-[#5C2222] to-[#761B14] bg-clip-text text-transparent inline-block px-0.5"
                  style={{
                    WebkitBoxDecorationBreak: "clone",
                    boxDecorationBreak: "clone",
                  }}
                >
                  100+ FEATURES
                </span>
              </div>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-white">Everything you need in one</span>
              <br />
              <span
                className="bg-gradient-to-r from-[#761B14] via-[#5C2222] to-[#761B14] bg-clip-text text-transparent inline-block px-1"
                style={{
                  WebkitBoxDecorationBreak: "clone",
                  boxDecorationBreak: "clone",
                }}
              >
                converged workspace
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              One platform for client management, campaigns, and team
              productivity
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
                className="group relative overflow-hidden glass-card rounded-2xl p-5 border border-gray-800/50 hover:border-[#761B14]/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#761B14]/20"
              >
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#761B14]/20 to-[#5C2222]/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-[#5C2222] group-hover:text-[#761B14] transition-colors" />
                  </div>
                  <h3 className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors leading-tight">
                    {feature}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Highlighted Features - Agency Focused */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0 }}
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#761B14]/30 hover:border-[#761B14]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(74,21,21,0.4)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5C2222]/20 blur-3xl rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#761B14] to-[#5C2222] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#761B14]/30">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Complete Client Lifecycle
                </h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed">
                  From prospecting to retention, manage every client touchpoint
                  in one place. Track leads, onboard clients, and grow accounts.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Lead → Client conversion tracking",
                    "Automated onboarding sequences",
                    "Service delivery management",
                    "Renewal & upsell automation",
                    "Client health scoring",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-[#5C2222] mr-3 flex-shrink-0" />
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
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#14787b]/30 hover:border-[#14787b]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(20,120,123,0.4)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#14787b]/20 blur-3xl rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14787b] to-[#1fb5b9] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#14787b]/30">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Marketing Operations Hub
                </h3>
                <p className="text-gray-300 mb-6 text-base leading-relaxed">
                  Execute, track, and optimize campaigns for all your clients
                  from one dashboard. End-to-end campaign management.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Cross-client campaign calendar",
                    "Shared asset library",
                    "Template management",
                    "Performance benchmarking",
                    "Automated A/B testing",
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#000000] relative overflow-hidden">
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
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 inline-block px-1"
                style={{
                  WebkitBoxDecorationBreak: "clone",
                  boxDecorationBreak: "clone",
                }}
              >
                Start using one.
              </span>
            </h2>

            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed">
              Marketing agency owners are exhausted from managing 10+ client
              logins, juggling subscriptions, and dealing with inconsistent
              data.
              <br className="hidden sm:block" />
              <span className="text-white font-medium">
                Axolop is the all-in-one platform built specifically for
                agencies.
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
                  features: "Multi-client CRM",
                },
                {
                  name: "HubSpot Agency",
                  cost: "$400/mo",
                  features: "Marketing Hub",
                },
                {
                  name: "Zapier Business",
                  cost: "$299/mo",
                  features: "Automations",
                },
                {
                  name: "Databox Agency",
                  cost: "$199/mo",
                  features: "Client Reporting",
                },
                {
                  name: "Monday.com",
                  cost: "$79/mo",
                  features: "Project Management",
                },
                {
                  name: "Typeform",
                  cost: "$59/mo",
                  features: "Client Forms",
                },
                {
                  name: "Calendly Pro",
                  cost: "$20/mo",
                  features: "Client Scheduling",
                },
                {
                  name: "Other Tools",
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
                  className="group relative overflow-hidden bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-800/60 flex items-center justify-between hover:border-[#5C2222]/40 hover:bg-gray-900/80 transition-all duration-300 shadow-sm hover:shadow-md"
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
                    <XCircle className="h-5 w-5 text-[#5C2222] flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#761B14]/30 to-[#5C2222]/30 backdrop-blur-sm rounded-xl p-5 border-2 border-[#5C2222]/40 flex items-center justify-between font-bold text-xl shadow-lg mt-4">
                <span className="text-white relative z-10">
                  Total Monthly Cost:
                </span>
                <span className="text-white text-2xl relative z-10">
                  $1,753
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
                className="relative overflow-hidden glass-card rounded-3xl p-10 border border-[#5C2222]/40 shadow-[0_20px_80px_-20px_rgba(74,21,21,0.4)] hover:shadow-[0_30px_100px_-20px_rgba(74,21,21,0.6)] transition-all duration-500"
              >
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#761B14]/10 via-transparent to-[#14787b]/5 opacity-50"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#761B14] to-[#5C2222] rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300">
                    <img
                      src="/axolop-logo.png"
                      alt="Axolop"
                      className="h-16 w-auto object-contain"
                    />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">Axolop</h3>

                  <div className="mb-4 flex justify-center">
                    <span
                      className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#761B14] via-[#5C2222] to-[#761B14] inline-block px-1"
                      style={{
                        WebkitBoxDecorationBreak: "clone",
                        boxDecorationBreak: "clone",
                      }}
                    >
                      One Platform
                    </span>
                  </div>

                  <p className="text-gray-300 mb-8 text-base">
                    Built for marketing agencies. All in one place.
                  </p>

                  <ul className="text-left space-y-2.5 mb-8">
                    {[
                      "Unlimited clients & campaigns",
                      "White-label client portals",
                      "Multi-client analytics",
                      "Team collaboration tools",
                      "AI-powered automation",
                      "Priority agency support",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <CheckCircle2 className="h-5 w-5 text-[#1fb5b9] mr-3 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gradient-to-r from-[#14787b]/30 to-[#1fb5b9]/30 border border-[#14787b]/50 rounded-xl p-5 mb-6">
                    <div className="font-bold text-xl text-[#1fb5b9]">
                      Save $1,500+/month
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      Focus on growing your agency
                    </div>
                  </div>

                  <Button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-br from-[#761B14] to-[#3D1515] hover:from-[#5C2222] hover:to-[#761B14] text-white text-base py-6 rounded-full shadow-[0_0_30px_rgba(74,21,21,0.5)] hover:shadow-[0_0_40px_rgba(74,21,21,0.6)] transform hover:scale-105 transition-all font-semibold border border-[#6A2525]/20"
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#000000] relative overflow-hidden">
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
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#761B14] to-[#5C2222] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#5C2222]/40">
              <Brain className="h-12 w-12 text-white" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Scale your agency with</span>
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#CA4238] via-[#14787b] to-amber-500 inline-block px-1"
                style={{
                  WebkitBoxDecorationBreak: "clone",
                  boxDecorationBreak: "clone",
                }}
              >
                AI-Powered Automation
              </span>
            </h2>

            <p className="text-lg text-gray-300 max-w-4xl mx-auto mb-16 leading-relaxed">
              Your AI team member that handles repetitive tasks, finds
              information instantly, coaches your sales team, and delivers
              actionable client insights—so you can focus on growth.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
              {[
                {
                  icon: Bot,
                  label: "AI Agents",
                  desc: "Autonomous agents that handle repetitive tasks, client follow-ups, and campaign management 24/7",
                  gradient: "from-[#CA4238] to-[#761B14]",
                  color: "#CA4238",
                },
                {
                  icon: Search,
                  label: "AI Search",
                  desc: "Semantic search across all your clients, campaigns, and communications—find anything instantly",
                  gradient: "from-[#14787b] to-[#1fb5b9]",
                  color: "#14787b",
                },
                {
                  icon: GraduationCap,
                  label: "AI Sales Training",
                  desc: "AI-powered coaching that analyzes calls, provides feedback, and improves your team's close rate",
                  gradient: "from-amber-500 to-yellow-500",
                  color: "#f59e0b",
                },
                {
                  icon: Users,
                  label: "AI Client Insights",
                  desc: "Predictive analytics that forecast churn, identify upsell opportunities, and surface account health",
                  gradient: "from-[#CA4238] via-[#14787b] to-[#1fb5b9]",
                  color: "#CA4238",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{ opacity: 0 }}
                  className="group relative overflow-hidden glass-card rounded-2xl p-8 border border-gray-800/50 hover:border-opacity-60 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 blur-3xl rounded-full"
                      style={{ backgroundColor: `${feature.color}20` }}
                    />
                  </div>
                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 mx-auto mb-5 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {feature.label}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleGetStarted}
              className="mt-12 bg-gradient-to-br from-[#761B14] to-[#3D1515] hover:from-[#5C2222] hover:to-[#761B14] text-white text-base px-10 py-6 rounded-full shadow-[0_0_30px_rgba(74,21,21,0.5)] hover:shadow-[0_0_40px_rgba(74,21,21,0.6)] transform hover:scale-105 transition-all font-semibold border border-[#6A2525]/20"
            >
              Try AI Agents Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#000000] relative overflow-hidden">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="relative overflow-hidden bg-gradient-to-br from-[#761B14] to-[#3D1515] hover:from-[#5C2222] hover:to-[#761B14] text-white text-lg px-10 py-7 rounded-full border border-[#6A2525]/30 shadow-[0_0_40px_rgba(74,21,21,0.6),_inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_50px_rgba(74,21,21,0.7)]"
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
                className="relative overflow-hidden text-white border-2 border-gray-700/50 hover:border-[#761B14]/60 bg-white/5 hover:bg-[#761B14]/10 text-lg px-10 py-7 rounded-xl backdrop-blur-xl transition-all duration-300"
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
