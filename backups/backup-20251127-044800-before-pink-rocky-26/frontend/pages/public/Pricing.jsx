import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Check, X, HelpCircle, Users, Building2, Rocket, Shield, Zap, Calendar, ChevronRight } from 'lucide-react';

/**
 * Pricing tiers - Sales, Build, Scale
 * Matches docs/features/PRICING_AND_SUBSCRIPTIONS.md
 */
const PLANS = [
  {
    id: 'sales',
    name: 'Sales',
    description: 'For solo operators getting started',
    price: { monthly: 67, yearly: 54 },
    yearlyTotal: 648,
    discount: 19,
    icon: Users,
    limits: {
      users: '1 User',
      leads: 'Unlimited Leads',
      forms: '5 Forms',
      emails: '500/month'
    },
    features: [
      'Full CRM Features',
      'Lead Management',
      'Contact Management',
      'Opportunity Pipeline',
      'Calendar & Scheduling',
      'Basic Forms (5 forms)',
      'Email (500/month)',
      'Basic Reports',
      'Email Support'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=sales',
    popular: false,
  },
  {
    id: 'build',
    name: 'Build',
    description: 'For growing teams',
    price: { monthly: 187, yearly: 149 },
    yearlyTotal: 1788,
    discount: 20,
    icon: Building2,
    limits: {
      users: '3 Users',
      leads: 'Unlimited Leads',
      forms: 'Unlimited Forms',
      emails: '5,000/month'
    },
    features: [
      'Everything in Sales',
      'Advanced Forms (Unlimited)',
      'Email Marketing (5,000/mo)',
      'Basic Workflows',
      'AI Lead Scoring',
      'Full Reports',
      'Priority Email Support'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=build',
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'For agencies at scale',
    price: { monthly: 349, yearly: 279 },
    yearlyTotal: 3348,
    discount: 20,
    icon: Rocket,
    limits: {
      users: 'Unlimited Users',
      leads: 'Unlimited Leads',
      forms: 'Unlimited Forms',
      emails: 'Unlimited'
    },
    features: [
      'Everything in Build',
      'Unlimited Email Marketing',
      'Full Workflows',
      'Full AI Features',
      'AI Assistant & Transcription',
      'Full + Custom Reports',
      'API Access',
      'White Label',
      'Priority + Onboarding Support'
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=scale',
    popular: false,
  },
];

/**
 * Tools replaced and their costs
 */
const TOOLS_REPLACED = [
  { name: 'GoHighLevel', cost: 497 },
  { name: 'Typeform', cost: 100 },
  { name: 'ClickUp', cost: 50 },
  { name: 'Notion', cost: 30 },
  { name: 'Miro', cost: 50 },
  { name: 'Calendly', cost: 97 },
  { name: 'ActiveCampaign', cost: 500 },
  { name: 'Others', cost: 51 },
];

/**
 * FAQ data
 */
const FAQS = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'Start your trial on any plan. You\'ll need to enter a credit card, but you won\'t be charged during the 14-day trial period. Cancel anytime before the trial ends and you won\'t be charged. If you continue, your card will be automatically charged at the end of the trial.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. When you upgrade, you\'ll be charged a prorated amount. When you downgrade, the change takes effect at your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) via Stripe.',
  },
  {
    question: 'Is there a long-term contract?',
    answer: 'No long-term contracts. Monthly plans bill monthly and can be canceled anytime. Annual plans are billed yearly and offer significant savings (up to 20%).',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied within the first 30 days after your trial ends, contact us for a full refund.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data is retained for 30 days after cancellation. During this time, you can export your data or reactivate your account. After 30 days, data is permanently deleted.',
  },
];

/**
 * Pricing Page - Modern, sleek design with CSS animations only
 */
const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  const totalSavings = TOOLS_REPLACED.reduce((sum, tool) => sum + tool.cost, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Pricing - Axolop CRM"
        description="Simple, transparent pricing. Start with a 14-day free trial. Save $1,375/month by replacing 10+ tools with one unified platform."
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#761B14] rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#761B14] rounded-full blur-[100px] animate-pulse-slower" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#761B14]/20 border border-[#761B14]/30 mb-8 fade-in-up">
            <Calendar className="w-4 h-4 text-[#EBB207]" />
            <span className="text-sm font-medium text-[#EBB207]">14-Day Free Trial • All Plans</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 fade-in-up delay-100">
            Simple Pricing.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Powerful Results.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-3 fade-in-up delay-200">
            Replace 10+ tools and save <span className="text-[#EBB207] font-bold">${totalSavings}/month</span>.
          </p>
          <p className="text-sm text-gray-500 mb-12 fade-in-up delay-300">
            No hidden fees • No setup costs • Cancel anytime
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-4 fade-in-up delay-400">
            <span className={cn('text-sm font-medium transition-colors', !isYearly ? 'text-white' : 'text-gray-500')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative w-16 h-8 rounded-full transition-colors',
                isYearly ? 'bg-[#761B14]' : 'bg-gray-700'
              )}
              aria-label="Toggle billing period"
            >
              <div
                className={cn(
                  'absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ease-in-out',
                  isYearly ? 'translate-x-9' : 'translate-x-1'
                )}
              />
            </button>
            <span className={cn('text-sm font-medium transition-colors', isYearly ? 'text-white' : 'text-gray-500')}>
              Yearly
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#EBB207]/20 text-[#EBB207] text-xs font-bold">
                Save up to 20%
              </span>
            </span>
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
                    'relative p-8 rounded-3xl flex flex-col transition-all duration-300 hover-lift',
                    'stagger-fade-in',
                    plan.popular
                      ? 'bg-gradient-to-br from-[#761B14]/30 via-[#761B14]/20 to-transparent border-2 border-[#761B14] md:scale-105'
                      : 'bg-white/[0.02] border border-gray-800/50 hover:border-[#761B14]/30'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#761B14] to-[#3D1515] text-white text-xs font-bold uppercase tracking-wide shadow-lg">
                      Most Popular
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                        plan.popular ? 'bg-gradient-to-br from-[#761B14] to-[#3D1515]' : 'bg-[#761B14]/20'
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {plan.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-gray-400 text-lg">/mo</span>
                    </div>
                    {isYearly && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-500">
                          ${plan.yearlyTotal} billed annually
                        </p>
                        <p className="text-sm text-[#EBB207] font-medium">
                          Save {plan.discount}% vs monthly
                        </p>
                      </div>
                    )}
                    {!isYearly && (
                      <p className="text-sm text-gray-500 mt-3">
                        or ${plan.price.yearly}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {Object.entries(plan.limits).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="px-3 py-3 rounded-xl bg-white/[0.03] border border-gray-800/50 text-center">
                        <div className="text-sm font-bold text-white truncate">{value}</div>
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    to={plan.ctaLink}
                    className={cn(
                      'block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300 mb-8 group',
                      plan.popular
                        ? 'bg-gradient-to-r from-[#761B14] to-[#3D1515] text-white hover:from-[#5C2222] hover:to-[#761B14] shadow-lg hover:shadow-[#761B14]/50'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-gray-700 hover:border-[#761B14]'
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>

                  {/* Features */}
                  <div className="flex-1 pt-8 border-t border-gray-800/50">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-semibold">What's included</p>
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

      {/* Tools Replaced Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Replace 10+ Tools
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Stop paying for multiple subscriptions. One platform for everything.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {TOOLS_REPLACED.map((tool, index) => (
              <div
                key={tool.name}
                className="p-6 rounded-2xl bg-white/[0.02] border border-gray-800/50 text-center stagger-fade-in hover-lift transition-all duration-300 hover:border-[#761B14]/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-3xl font-bold text-white mb-1">
                  ${tool.cost}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  {tool.name}
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#761B14]/20 via-[#761B14]/10 to-transparent border border-[#761B14]/30 text-center fade-in-up">
            <div className="text-5xl md:text-6xl font-bold text-[#EBB207] mb-3">
              ${totalSavings}<span className="text-3xl">/mo</span>
            </div>
            <p className="text-gray-300 text-lg">
              That's <span className="text-white font-semibold">${(totalSavings * 12).toLocaleString()}/year</span> back in your pocket
            </p>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, text: 'Bank-Level Security' },
              { icon: Zap, text: '99.9% Uptime' },
              { icon: Users, text: '1000+ Agencies' },
              { icon: Calendar, text: '14-Day Free Trial' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex flex-col items-center stagger-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#761B14]/20 border border-[#761B14]/40 flex items-center justify-center mb-3 hover-lift">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={faq.question}
                className="border border-gray-800/50 rounded-2xl overflow-hidden bg-white/[0.02] stagger-fade-in hover:border-[#761B14]/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium text-white pr-4">{faq.question}</span>
                  <HelpCircle
                    className={cn(
                      'w-5 h-5 text-gray-500 transition-all flex-shrink-0 duration-300',
                      openFaq === index && 'rotate-180 text-white'
                    )}
                  />
                </button>
                <div className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  <div className="px-5 pb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Save $1,375/Month?
            </h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
              Start your 14-day free trial today. Full access, no credit card required.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-[#761B14] to-[#3D1515] text-white font-bold text-lg hover:from-[#5C2222] hover:to-[#761B14] transition-all duration-300 shadow-lg hover:shadow-[#761B14]/50 group"
            >
              Start Your Free Trial
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="text-sm text-gray-500 mt-6">
              Questions? <Link to="/contact" className="text-white hover:text-[#EBB207] transition-colors underline underline-offset-2">Contact our sales team</Link>
            </p>
          </div>
        </div>
      </section>

      <FooterSection />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes pulseSlower {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .stagger-fade-in {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-400 {
          animation-delay: 400ms;
        }

        .animate-pulse-slow {
          animation: pulseSlow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulseSlower 10s ease-in-out infinite;
        }

        .hover-lift {
          transition: transform 0.3s ease-out;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
};

export default Pricing;
