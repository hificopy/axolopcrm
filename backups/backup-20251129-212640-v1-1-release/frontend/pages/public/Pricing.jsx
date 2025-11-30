/**
 * Pricing tiers - Sales, Build, Scale
 * Enhanced with onboarding integration and trial activation
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { NavigationBar } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/sections";
import SEO from "@/components/SEO";
import { Check, Users, Building2, Rocket, ChevronRight } from "lucide-react";

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
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=sales",
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
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=build",
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
    cta: "Start Free Trial",
    ctaLink: "/signup?plan=scale",
    popular: false,
  },
];

/**
 * Tools replaced by Axolop CRM
 */
const TOOLS_REPLACED = [
  { name: "GoHighLevel", cost: 497 },
  { name: "Typeform", cost: 100 },
  { name: "ClickUp", cost: 50 },
  { name: "Notion", cost: 30 },
  { name: "Miro", cost: 50 },
  { name: "Calendly", cost: 97 },
  { name: "ActiveCampaign", cost: 500 },
  { name: "Klaviyo", cost: 50 },
];

/**
 * FAQ data
 */
const FAQ = [
  {
    question: "What is included in the 14-day free trial?",
    answer:
      "Full access to all features in your selected plan. No credit card required.",
  },
  {
    question: "Can I change plans anytime?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    question: "Do you offer custom plans?",
    answer:
      "Yes! Contact our sales team for custom enterprise plans with tailored features.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and wire transfers for annual plans.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely! We use enterprise-grade encryption and are GDPR compliant.",
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const totalSavings = TOOLS_REPLACED.reduce((sum, tool) => sum + tool.cost, 0);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0F0510" }}>
      <SEO
        title="Pricing - Axolop CRM"
        description="Simple, transparent pricing. Start with a 14-day free trial. Save $1,375/month by replacing 10+ tools with one unified platform."
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#E92C92] rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E92C92] rounded-full blur-[100px] animate-pulse-slower" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E92C92]/20 border border-[#E92C92]/30 mb-8 fade-in-up">
            <Rocket className="w-4 h-4 text-[#E92C92]" />
            <span className="text-sm font-medium text-[#E92C207]">
              14-Day Free Trial • All Plans
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 fade-in-up delay-100">
            Simple Pricing.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Powerful Results.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto text-center mb-3 fade-in-up delay-200">
            Replace 10+ tools and save{" "}
            <span className="text-[#EBB207] font-bold">
              ${totalSavings.toLocaleString()}/month
            </span>
            .
          </p>
          <p className="text-sm text-gray-500 mb-12 fade-in-up delay-300">
            No hidden fees • No setup costs • Cancel anytime
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
              {/* Animated sliding indicator */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.price.yearly : plan.price.monthly;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative p-8 rounded-3xl flex flex-col transition-all duration-300 hover-lift",
                    "stagger-fade-in",
                    plan.popular
                      ? "bg-gradient-to-br from-[#E92C92]/30 via-[#E92C92]/20 border-2 border-[#E92C92] shadow-lg hover:shadow-[#E92C92]/40"
                      : "bg-white/[0.02] border border-gray-800/50 hover:border-[#E92C92]/30 hover:shadow-md",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-[#E92C92] text-white text-xs font-semibold rounded-full">
                        Most Popular
                      </span>
                    </div>
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
                  <Link
                    to={plan.ctaLink}
                    className={cn(
                      "block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300",
                      "bg-gradient-to-r from-[#E92C92] to-[#ff6b4a] hover:from-[#5B1046] hover:to-[#ff7b5a] shadow-lg hover:shadow-[#E92C92]/50",
                      "text-white flex items-center justify-center gap-2",
                    )}
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>

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

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {FAQ.map((item, index) => (
              <div
                key={index}
                className="bg-white/[0.02] border border-gray-800/50 rounded-xl p-6"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left flex items-center justify-between p-0 hover:bg-transparent"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {item.question}
                  </h3>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform duration-200",
                      openFaq === index ? "rotate-90" : "",
                    )}
                  />
                </button>
                {openFaq === index && (
                  <p className="mt-4 text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Ready to Save $1,375/month?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto text-center mb-8">
            Choose your plan and start your 14-day free trial today.
          </p>
          <div className="mt-8">
            <Link
              to="/pricing?trial=true"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#E92C92] to-[#ff6b4a] hover:from-[#5B1046] hover:to-[#ff7b5a] text-white text-lg py-4 rounded-xl font-semibold shadow-lg hover:shadow-[#E92C92]/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                <span className="font-semibold">Start Your Free Trial</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
