import { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/context/SupabaseContext";
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
        className="font-black chrome-text"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #ffffff 20%, #cbd5e1 60%, #64748b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter:
            "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3)) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
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
        className="font-black chrome-text"
        style={{
          display: "inline-block",
          backgroundImage:
            "linear-gradient(to bottom, #ffffff 20%, #cbd5e1 60%, #64748b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter:
            "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3)) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
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

// CRITICAL: Hardcode God emails for smart routing
const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSupabase();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Scroll-based opacity for header glow
  const { scrollY } = useScroll();
  const glowOpacity = useTransform(scrollY, [0, 300, 500], [1, 0.3, 0]);

  // Smart redirect for already logged-in users
  useEffect(() => {
    if (authLoading || !user) return;

    // User is logged in - determine where to redirect them
    const userEmail = user.email?.toLowerCase() || "";
    const isGodUser = GOD_EMAILS.includes(userEmail);
    const subscriptionStatus = user.user_metadata?.subscription_status || "none";
    const gracePeriodEnds = user.user_metadata?.grace_period_ends_at;

    console.log("[Landing] Logged-in user detected:", {
      email: userEmail,
      isGodUser,
      subscriptionStatus,
    });

    // Determine destination
    let destination = "/app/home";

    if (isGodUser) {
      destination = "/app/home";
    } else if (subscriptionStatus === "past_due") {
      // Check if grace period expired
      if (gracePeriodEnds && new Date() > new Date(gracePeriodEnds)) {
        destination = "/select-plan";
      } else {
        destination = "/app/settings/billing?locked=true";
      }
    } else if (subscriptionStatus === "trialing" || subscriptionStatus === "active") {
      destination = "/app/home";
    } else {
      // Free user
      destination = "/select-plan";
    }

    console.log("[Landing] Redirecting logged-in user to:", destination);

    // Small delay to avoid jarring redirect
    const timer = setTimeout(() => {
      navigate(destination, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [user, authLoading, navigate]);

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
    // Smooth Apple-like tilt: starts tilted, flattens as you scroll
    gsap.to(".hero-dashboard", {
      scrollTrigger: {
        trigger: heroRef.current,   // Hero section as trigger
        start: "top top",           // Start at top of page (when scrolling begins)
        end: "bottom top",          // End when hero section scrolls off
        scrub: 0.8,                 // Smooth scrubbing (0.8s to catch up)
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
    // If user is already authenticated, redirect to app
    if (user) {
      navigate("/app/home");
      return;
    }

    // Navigate to signup (account creation first)
    // Pass affiliate ref if present
    if (affiliateRef) {
      navigate(
        `/signup?ref=${affiliateRef}${affiliateName ? `&fname=${affiliateName}` : ""}`,
      );
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0F0510] text-white">
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
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-[#3F0D28] via-[#5B1046] to-[#3F0D28] border-b-2 border-[#F472B6]/30 shadow-2xl backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-[#F472B6] animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  Seems like{" "}
                  <span className="text-[#F472B6]">{affiliateName}</span> Wants
                  You To Try The New Age of CRMs
                </h2>
                <Sparkles className="h-6 w-6 text-[#F472B6] animate-pulse" />
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
        className={`${affiliateName ? "pt-48" : "pt-28"} pb-20 px-4 sm:px-6 lg:px-8 relative`}
        style={{ overflowX: "clip" }}
      >
        {/* Background Effects - Aurora-like wavy streaks */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main "Wavy" Reddish/Pink Streak */}
          <div
            className="absolute top-[10%] left-0 w-[100%] h-[600px] blur-[100px] mix-blend-screen opacity-80 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(190, 18, 60, 0.2), transparent)",
              transform: "rotate(-12deg)",
            }}
          ></div>
          {/* Second Bright Streak (Intersection) */}
          <div
            className="absolute top-[20%] right-0 w-[100%] h-[400px] blur-[80px] mix-blend-screen opacity-60"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(219, 39, 119, 0.3), transparent)",
              transform: "rotate(6deg)",
            }}
          ></div>
          {/* Deep Vignette to keep edges dark */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, #0F0510 80%)",
            }}
          ></div>
        </div>

        <div
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-16" style={{ overflow: "hidden" }}>
            <h1
              className="hero-title font-black mb-6 leading-[1.05] tracking-tighter"
              style={{
                opacity: 0,
                transform: "translateY(50px)",
                fontSize: "clamp(40px, 8vw, 90px)",
                overflow: "hidden",
              }}
            >
              {/* Top Line - True Chrome Effect */}
              <span
                className="chrome-text block pb-2"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #ffffff 20%, #cbd5e1 60%, #64748b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter:
                    "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3)) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
                }}
              >
                Replace Your Agency's
              </span>
              {/* Bottom Line - True Chrome Effect */}
              <span className="block relative" style={{ overflow: "hidden" }}>
                <span
                  className="chrome-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, #ffffff 20%, #cbd5e1 60%, #64748b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter:
                      "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3)) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  <DynamicHeaderText /> with Axolop
                  <span style={{ fontSize: "0.6em", verticalAlign: "super" }}>
                    ™
                  </span>
                </span>
              </span>
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
              className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-6 mb-4"
              style={{ opacity: 0, transform: "translateY(20px)" }}
            >
              {/* Primary Metallic Chrome Button */}
              <button onClick={handleGetStarted} className="relative group">
                {/* Metallic Button Body */}
                <div
                  className="relative overflow-hidden px-10 py-5 rounded-full leading-none flex items-center transition transform group-hover:-translate-y-1 active:translate-y-0 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(180deg, #ff85c8 0%, #E92C92 30%, #c41e78 70%, #ff69b4 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 10px 40px rgba(233,44,146,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {/* Chrome Text */}
                  <span
                    className="relative z-10 font-black tracking-wide text-lg"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                    }}
                  >
                    {affiliateRef
                      ? affiliateName
                        ? `Join ${affiliateName}'s Team - 30 Days FREE`
                        : "Claim Your 30-Day FREE Trial"
                      : "Replace your tools free in 50 mins"}
                  </span>

                  {/* Top metallic shine band */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
                  {/* Animated diagonal sheen */}
                  <div className="absolute top-0 -left-[100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-out"></div>
                </div>
              </button>

              {/* Secondary Metallic Glass Button */}
              <button className="group relative">
                {/* Subtle outer glow */}
                <div className="absolute -inset-1 bg-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition duration-500"></div>

                <div
                  className="relative overflow-hidden px-10 py-5 rounded-full leading-none flex items-center gap-3 transition transform group-hover:-translate-y-1 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.9) 50%, rgba(220,220,230,0.85) 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(255,255,255,1), inset 0 -2px 4px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(255,255,255,0.8)",
                  }}
                >
                  {/* Chrome play icon */}
                  <svg
                    className="w-5 h-5 relative z-10"
                    viewBox="0 0 24 24"
                    style={{
                      fill: "url(#playGradient)",
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="playGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#333" />
                        <stop offset="50%" stopColor="#111" />
                        <stop offset="100%" stopColor="#444" />
                      </linearGradient>
                    </defs>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {/* Chrome text */}
                  <span
                    className="font-black tracking-wide text-lg relative z-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, #1a1a1a 0%, #333 50%, #555 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Watch Demo
                  </span>

                  {/* Top metallic shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full pointer-events-none"></div>
                  {/* Animated sheen */}
                  <div className="absolute top-0 -left-[100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-out"></div>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest opacity-80">
              <span>
                {affiliateRef ? "30-day FREE trial" : "14-day free trial"}
              </span>
              <span className="text-[#3F0D28]">•</span>
              <span>
                {affiliateRef
                  ? affiliateName
                    ? `Recommended by ${affiliateName}`
                    : "Special offer"
                  : "Setup in 50 mins"}
              </span>
            </div>
          </div>

          {/* Real App Dashboard Preview - Based on Actual Screenshot */}
          <div
            className="hero-dashboard-wrapper relative mx-auto max-w-full pt-10 pb-10 px-8 flex justify-center"
            style={{
              perspective: "1200px",
              perspectiveOrigin: "center top"
            }}
          >
            {/* Responsive sizing via CSS zoom (doesn't break 3D) */}
            <style>{`
              .hero-dashboard {
                zoom: 0.28;
              }
              @media (min-width: 400px) {
                .hero-dashboard { zoom: 0.34; }
              }
              @media (min-width: 480px) {
                .hero-dashboard { zoom: 0.42; }
              }
              @media (min-width: 640px) {
                .hero-dashboard { zoom: 0.55; }
              }
              @media (min-width: 768px) {
                .hero-dashboard { zoom: 0.7; }
              }
              @media (min-width: 1024px) {
                .hero-dashboard { zoom: 0.85; }
              }
              @media (min-width: 1200px) {
                .hero-dashboard { zoom: 1; }
              }
            `}</style>
            <div
              className="hero-dashboard relative"
              style={{
                opacity: 0,
                transform: "translateY(60px) rotateX(12deg)",
                transformOrigin: "center top",
                willChange: "transform, opacity",
                width: "1100px",
                maxWidth: "100vw",
              }}
            >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#3F0D28]/20 via-[#5B1046]/20 to-[#3F0D28]/20 rounded-3xl blur-2xl"></div>

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

                {/* Floating AI Badge - Metallic Gold */}
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
                  className="absolute -top-6 -right-6 rounded-full overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, #ffd966 0%, #f5c518 20%, #d4a00a 50%, #b8860b 70%, #d4a00a 90%, #f5c518 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(212,160,10,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  {/* Top metallic shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/15 to-transparent rounded-t-full pointer-events-none"></div>

                  <div className="relative z-10 flex items-center space-x-3 px-5 py-3">
                    <Brain
                      className="h-5 w-5"
                      style={{
                        color: "rgba(92, 70, 0, 0.9)",
                        filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.4))",
                      }}
                    />
                    <div>
                      <div
                        className="text-sm font-bold text-amber-950/90"
                        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}
                      >
                        AI Processing
                      </div>
                      <div className="text-xs text-amber-900/70 font-medium">
                        Lead scoring active
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Workflow Badge - Metallic Teal */}
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
                  className="absolute -bottom-6 -left-6 rounded-full overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(180deg, #7ee8ec 0%, #4dd9de 20%, #26c6cc 50%, #1fb5b9 70%, #26c6cc 90%, #4dd9de 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.15), 0 8px 24px rgba(31,181,185,0.5), 0 2px 8px rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  {/* Top metallic shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/15 to-transparent rounded-t-full pointer-events-none"></div>

                  <div className="relative z-10 flex items-center space-x-3 px-5 py-3">
                    <Zap
                      className="h-5 w-5"
                      style={{
                        color: "rgba(13, 69, 71, 0.9)",
                        filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.4))",
                      }}
                    />
                    <div>
                      <div
                        className="text-sm font-bold text-teal-950/90"
                        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}
                      >
                        Workflow Active
                      </div>
                      <div className="text-xs text-teal-900/70 font-medium">
                        3 automations running
                      </div>
                    </div>
                  </div>
                </motion.div>
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
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#140516]">
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,44,146,0.15),transparent_50%)]"></div>
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
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#3F0D28]/20 via-[#5B1046]/20 to-[#3F0D28]/20 border border-[#3F0D28]/40">
                <span
                  className="text-sm font-semibold bg-gradient-to-r from-[#3F0D28] via-[#C81E78] to-[#3F0D28] bg-clip-text text-transparent inline-block px-0.5"
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
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#3F0D28]/30 hover:border-[#3F0D28]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(233,44,146,0.5)]"
            >
              {/* Brand color glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3F0D28]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3F0D28] to-[#5B1046] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-[#3F0D28]/50">
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
                      <div className="w-2 h-2 rounded-full bg-[#3F0D28] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#3F0D28]/50 transition-shadow" />
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
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#5B1046]/30 hover:border-[#5B1046]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(233,44,146,0.5)]"
            >
              {/* Brand glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5B1046]/20 blur-3xl rounded-full" />
              </div>

              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#5B1046] to-[#C81E78] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-[#5B1046]/50">
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
                      <div className="w-2 h-2 rounded-full bg-[#5B1046] mt-2 flex-shrink-0 group-hover:shadow-lg group-hover:shadow-[#5B1046]/50 transition-shadow" />
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
            <button onClick={handleGetStarted} className="relative group">
              {/* Metallic Button Body */}
              <div
                className="relative overflow-hidden px-12 py-7 rounded-full leading-none flex items-center"
                style={{
                  background:
                    "linear-gradient(180deg, #5a1a3a 0%, #3F0D28 30%, #c41e78 70%, #ff69b4 100%)",
                  boxShadow:
                    "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {/* Chrome Text */}
                <span
                  className="relative z-10 font-black tracking-wide text-xl flex items-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                  }}
                >
                  Experience the new age CRM
                  <ArrowRight
                    className="ml-3 h-6 w-6"
                    style={{
                      color: "#ffffff",
                      filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                    }}
                  />
                </span>

                {/* Top metallic shine band */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Black Background */}
      <section
        id="features"
        ref={featuresRef}
        className="py-28 px-4 sm:px-6 lg:px-8 relative bg-[#140516] overflow-hidden"
      >
        {/* Brand color gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(233,44,146,0.12),transparent_50%)]"></div>
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
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#3F0D28]/10 via-[#5B1046]/10 to-[#3F0D28]/10 border border-[#3F0D28]/20">
                <span
                  className="text-sm font-semibold bg-gradient-to-r from-[#3F0D28] via-[#C81E78] to-[#3F0D28] bg-clip-text text-transparent inline-block px-0.5"
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
                className="bg-gradient-to-r from-[#3F0D28] via-[#C81E78] to-[#3F0D28] bg-clip-text text-transparent inline-block px-1"
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
                className="group relative overflow-hidden glass-card rounded-2xl p-5 border border-gray-800/50 hover:border-[#3F0D28]/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-[#3F0D28]/20"
              >
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3F0D28]/20 to-[#5B1046]/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-5 w-5 text-[#3F0D28] group-hover:text-[#3F0D28] transition-colors" />
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
              className="group relative overflow-hidden glass-card rounded-3xl p-10 border border-[#3F0D28]/30 hover:border-[#3F0D28]/60 transition-all duration-500 hover:shadow-[0_20px_70px_-10px_rgba(233,44,146,0.4)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5B1046]/20 blur-3xl rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3F0D28] to-[#5B1046] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-[#3F0D28]/30">
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
                      <Check className="h-4 w-4 text-[#3F0D28] mr-3 flex-shrink-0" />
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#140516] relative overflow-hidden">
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,44,146,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.10),transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-8"
            >
              <Badge className="relative overflow-hidden bg-[#3F0D28]/20 text-white border border-[#3F0D28]/40 backdrop-blur-xl px-6 py-3 text-sm font-bold shadow-lg hover:bg-[#3F0D28]/30 transition-all">
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
                  className="group relative overflow-hidden bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-800/60 flex items-center justify-between hover:border-[#3F0D28]/40 hover:bg-gray-900/80 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3F0D28]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <XCircle className="h-5 w-5 text-[#3F0D28] flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#3F0D28]/30 to-[#5B1046]/30 backdrop-blur-sm rounded-xl p-5 border-2 border-[#3F0D28]/40 flex items-center justify-between font-bold text-xl shadow-lg mt-4">
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
                className="relative overflow-hidden glass-card rounded-3xl p-10 border border-[#3F0D28]/40 shadow-[0_20px_80px_-20px_rgba(233,44,146,0.4)] hover:shadow-[0_30px_100px_-20px_rgba(233,44,146,0.6)] transition-all duration-500"
              >
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/10 via-transparent to-[#14787b]/5 opacity-50"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#3F0D28] to-[#5B1046] rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300">
                    <img
                      src="/axolop-logo.png"
                      alt="Axolop"
                      className="h-16 w-auto object-contain"
                    />
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">Axolop</h3>

                  <div className="mb-4 flex justify-center">
                    <span
                      className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3F0D28] via-[#C81E78] to-[#3F0D28] inline-block px-1"
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

                  <button onClick={handleGetStarted} className="w-full">
                    {/* Metallic Button Body */}
                    <div
                      className="relative overflow-hidden px-8 py-5 rounded-full leading-none flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(180deg, #5a1a3a 0%, #3F0D28 30%, #c41e78 70%, #ff69b4 100%)",
                        boxShadow:
                          "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      {/* Chrome Text */}
                      <span
                        className="relative z-10 font-black tracking-wide text-base flex items-center"
                        style={{
                          backgroundImage:
                            "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                        }}
                      >
                        Start Free Trial
                        <ArrowRight
                          className="ml-2 h-5 w-5"
                          style={{
                            color: "#ffffff",
                            filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                          }}
                        />
                      </span>

                      {/* Top metallic shine band */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Section - Black Background */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#140516] relative overflow-hidden">
        {/* Brand gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(233,44,146,0.12),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,120,123,0.10),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            style={{ opacity: 0 }}
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#3F0D28] to-[#5B1046] rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#3F0D28]/40">
              <Brain className="h-12 w-12 text-white" />
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Scale your agency with</span>
              <br />
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#3F0D28] via-[#14787b] to-amber-500 inline-block px-1"
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
                  gradient: "from-[#3F0D28] to-[#3F0D28]",
                  color: "#3F0D28",
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
                  gradient: "from-[#3F0D28] via-[#14787b] to-[#1fb5b9]",
                  color: "#3F0D28",
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

            <button onClick={handleGetStarted} className="mt-12">
              {/* Metallic Button Body */}
              <div
                className="relative overflow-hidden px-10 py-5 rounded-full leading-none flex items-center"
                style={{
                  background:
                    "linear-gradient(180deg, #5a1a3a 0%, #3F0D28 30%, #c41e78 70%, #ff69b4 100%)",
                  boxShadow:
                    "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {/* Chrome Text */}
                <span
                  className="relative z-10 font-black tracking-wide text-base flex items-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                  }}
                >
                  Try AI Agents Free
                  <Sparkles
                    className="ml-2 h-5 w-5"
                    style={{
                      color: "#ffffff",
                      filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                    }}
                  />
                </span>

                {/* Top metallic shine band */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
              </div>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#140516] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(233,44,146,0.08),transparent_60%)]"></div>
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
              <button onClick={handleGetStarted}>
                {/* Metallic Button Body */}
                <div
                  className="relative overflow-hidden px-10 py-6 rounded-full leading-none flex items-center"
                  style={{
                    background:
                      "linear-gradient(180deg, #5a1a3a 0%, #3F0D28 30%, #c41e78 70%, #ff69b4 100%)",
                    boxShadow:
                      "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {/* Chrome Text */}
                  <span
                    className="relative z-10 font-black tracking-wide text-lg"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                    }}
                  >
                    {affiliateRef
                      ? affiliateName
                        ? `Join ${affiliateName}'s Team - 30 Days FREE`
                        : "Claim Your 30-Day FREE Trial"
                      : "Replace your tools free in 50 mins"}
                  </span>

                  {/* Top metallic shine band */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
                </div>
              </button>
              <Button
                size="lg"
                variant="outline"
                className="relative overflow-hidden text-white border-2 border-gray-700/50 bg-white/5 text-lg px-10 py-7 rounded-xl backdrop-blur-xl"
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
