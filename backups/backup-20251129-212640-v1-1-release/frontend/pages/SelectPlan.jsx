/**
 * Plan Selection Page
 * Users select their plan after account creation, before Stripe payment
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Check,
  Rocket,
  Users,
  Building2,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "../context/SupabaseContext";

// Axolop Logo Component
const AxolopLogo = ({ className }) => (
  <img
    src="/LOGO/transparent-logo.png"
    alt="Axolop Logo"
    className={className}
  />
);

// NavLink Component
const NavLink = ({ href, children, className }) => (
  <Link
    to={href}
    className={cn(
      "px-3 py-2 rounded-lg",
      "text-base font-medium text-gray-300",
      "hover:text-white transition-colors duration-200",
      className,
    )}
  >
    {children}
  </Link>
);

/**
 * Pricing tiers configuration
 */
const PLANS = [
  {
    id: "sales",
    name: "Sales",
    description: "For solo operators getting started",
    price: { monthly: 67, yearly: 54 },
    yearlyTotal: 648,
    discount: 19,
    icon: Users,
    limits: {
      users: "1 User",
      agencies: "1 Agency",
      forms: "5 Forms",
      emails: "500/month",
    },
    features: [
      "Full CRM Features",
      "Lead Management",
      "Contact Management",
      "Opportunity Pipeline",
      "Calendar & Scheduling",
      "Basic Forms (5 forms)",
      "Email (500/month)",
      "Basic Reports",
      "Email Support",
    ],
    popular: false,
  },
  {
    id: "build",
    name: "Build",
    description: "For growing teams",
    price: { monthly: 187, yearly: 149 },
    yearlyTotal: 1788,
    discount: 20,
    icon: Building2,
    limits: {
      users: "3 Users",
      agencies: "3 Agencies",
      forms: "Unlimited Forms",
      emails: "5,000/month",
    },
    features: [
      "Everything in Sales",
      "Advanced Forms (Unlimited)",
      "Email Marketing (5,000/mo)",
      "Basic Workflows",
      "AI Lead Scoring",
      "Full Reports",
      "Priority Email Support",
    ],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    description: "For agencies at scale",
    price: { monthly: 349, yearly: 279 },
    yearlyTotal: 3348,
    discount: 20,
    icon: Rocket,
    limits: {
      users: "3 Users",
      agencies: "Unlimited Agencies",
      forms: "Unlimited Forms",
      emails: "Unlimited",
    },
    features: [
      "Everything in Build",
      "Unlimited Email Marketing",
      "Full Workflows",
      "Full AI Features",
      "AI Assistant & Transcription",
      "Full + Custom Reports",
      "API Access",
      "White Label",
      "Priority + Onboarding Support",
    ],
    popular: false,
  },
];

export default function SelectPlan() {
  const [searchParams] = useSearchParams();
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, session } = useSupabase();

  const preSelectedPlan = searchParams.get("plan");

  const handleSelectPlan = async (planId) => {
    try {
      setLoading(true);

      // Store selected plan
      localStorage.setItem("selected_plan", planId);
      localStorage.setItem("selected_billing", isYearly ? "yearly" : "monthly");

      // Check if user is authenticated
      if (!session || !session.access_token) {
        throw new Error("You must be logged in to proceed");
      }

      // Create trial checkout session
      const response = await fetch('/api/v1/stripe/create-trial-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan: planId,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const data = await response.json();

      if (!data.success || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0F0510" }}>
      {/* Navigation - Matching Landing Page */}
      <motion.nav
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: "#0F0510",
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "backdrop-blur-xl",
          "transition-all duration-300",
          isScrolled && "shadow-2xl shadow-black/40",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <AxolopLogo className="w-10 h-10" />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-[#E92C92]/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight">
                Axolop
              </span>
            </Link>

            {/* Desktop Navigation - Centered - No Pricing/About/Contact buttons */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
              {/* Plan selection page - no navigation buttons needed */}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden ml-auto p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-gradient-to-r from-[#E92C92] via-[#5B1046] to-[#E92C92]"
            >
              <div className="max-w-7xl mx-auto px-4 py-2 text-center">
                {/* Plan selection page - no navigation buttons needed */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#E92C92] rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E92C92] rounded-full blur-[100px] animate-pulse-slower" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E92C92]/20 border border-[#E92C92]/30 mb-8 fade-in-up">
            <Rocket className="w-4 h-4 text-[#E92C92]" />
            <span className="text-sm font-medium text-[#E92C92]">
              14-Day Free Trial
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 fade-in-up delay-100">
            {preSelectedPlan ? "Confirm Your Plan" : "Select Your Plan"}
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto text-center mb-3 fade-in-up delay-200">
            {preSelectedPlan
              ? "Review your selection and start your free trial"
              : "Start your 14-day free trial. Cancel anytime."}
          </p>
          <p className="text-sm text-gray-500 mb-12 fade-in-up delay-300">
            No hidden fees • No setup costs • Full access to all features
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-8 fade-in-up delay-400">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "text-sm font-medium transition-all duration-300 px-4 py-2 rounded-lg cursor-pointer",
                !isYearly
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-gray-300",
              )}
            >
              Monthly
            </button>

            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative w-16 h-8 rounded-full transition-all duration-300 active:scale-95",
                "bg-gradient-to-r from-[#E92C92] to-[#ff6b4a]",
                "border-2 border-white/20",
                "shadow-lg shadow-[#E92C92]/30",
              )}
              aria-label="Toggle billing period"
            >
              <div
                className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-lg",
                  isYearly ? "left-[calc(100%-1.75rem)]" : "left-1",
                )}
              />
            </button>

            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "text-sm font-bold transition-all duration-300 px-4 py-2 rounded-lg cursor-pointer",
                isYearly ? "text-white" : "text-gray-400 hover:text-gray-300",
              )}
            >
              Yearly
              <span
                className={cn(
                  "ml-3 px-3 py-1 rounded-full font-bold transition-all duration-300",
                  isYearly
                    ? "bg-white text-[#E92C92] shadow-lg"
                    : "bg-[#EBB207]/20 text-[#EBB207]",
                )}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Show single plan if pre-selected, otherwise show all */}
          <div
            className={cn(
              "grid gap-8",
              preSelectedPlan
                ? "grid-cols-1 max-w-md mx-auto"
                : "grid-cols-1 md:grid-cols-3",
            )}
          >
            {PLANS.filter(
              (plan) => !preSelectedPlan || plan.id === preSelectedPlan,
            ).map((plan, index) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.price.yearly : plan.price.monthly;
              const isPreSelected = preSelectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative p-8 rounded-3xl flex flex-col transition-all duration-300 hover-lift",
                    "stagger-fade-in",
                    isPreSelected
                      ? "ring-2 ring-[#EBB207] shadow-lg shadow-[#EBB207]/30"
                      : plan.popular
                        ? "bg-gradient-to-br from-[#E92C92]/30 via-[#E92C92]/20 border-2 border-[#E92C92] shadow-lg hover:shadow-[#E92C92]/40"
                        : "bg-white/[0.02] border border-gray-800/50 hover:border-[#E92C92]/30 hover:shadow-md",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Badge */}
                  {preSelectedPlan ? (
                    // Show "Your Selection" for pre-selected plan
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-[#EBB207] text-[#0F0810] text-xs font-semibold rounded-full">
                        Your Selection
                      </span>
                    </div>
                  ) : (
                    // Show "Most Popular" only when showing all plans
                    plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-[#E92C92] text-white text-xs font-semibold rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )
                  )}

                  {/* Header */}
                  <div className="text-center mb-8">
                    <Icon className="w-8 h-8 mx-auto mb-4 text-[#E92C92]" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 mb-6">{plan.description}</p>

                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-6xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-gray-400 text-lg">/mo</span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-gray-500 mt-1">
                        ${plan.yearlyTotal} billed annually
                        <div className="text-sm font-medium text-[#EBB207]">
                          Save {plan.discount}% vs monthly
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {Object.entries(plan.limits)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="px-3 py-3 rounded-xl bg-white/[0.02] border border-gray-800/50 text-center"
                        >
                          <div className="text-xs font-medium text-gray-500 uppercase">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {value}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={cn(
                      "block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300",
                      "bg-gradient-to-r from-[#E92C92] to-[#ff6b4a] hover:from-[#5B1046] hover:to-[#ff7b5a] shadow-lg hover:shadow-[#E92C92]/50",
                      "text-white flex items-center justify-center gap-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {loading ? (
                      "Processing..."
                    ) : preSelectedPlan ? (
                      <>
                        Confirm & Start Trial
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Select Plan
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Features */}
                  <div className="flex-1 pt-8 border-t border-gray-800/50">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#1A777B]" />
                          <span className="text-sm text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Change plan link (only show when plan is pre-selected) */}
      {preSelectedPlan && (
        <section className="pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <button
              onClick={() => navigate("/select-plan")}
              className="text-[#E92C92] hover:text-[#ff6b4a] text-sm font-medium transition-colors underline"
            >
              Want to change your plan? View all options
            </button>
          </div>
        </section>
      )}

      {/* Footer note */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            All plans include a 14-day free trial. Cancel anytime during the
            trial with no charges.
          </p>
        </div>
      </section>
    </div>
  );
}
