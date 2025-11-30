import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Check, X, HelpCircle, Users, Building2, Rocket, Shield, Zap, Calendar } from 'lucide-react';

/**
 * Pricing tiers - Sales, Build, Scale
 * Source of truth: docs/PRICING_GUIDE.md
 */
const PLANS = [
  {
    id: 'sales',
    name: 'Sales',
    description: 'Perfect for small sales teams getting started',
    price: { monthly: 67, yearly: 54 },
    yearlyTotal: 648,
    discount: 19,
    icon: Users,
    limits: {
      users: 1,
      agencies: 1,
      leads: '500/mo',
      emails: '1,000/mo',
      forms: 3,
      storage: '5 GB'
    },
    features: [
      { name: 'Dashboard & Analytics', included: true },
      { name: 'Lead Management', included: true },
      { name: 'Contact Management', included: true },
      { name: 'Opportunity Pipeline', included: true },
      { name: 'Activity Tracking', included: true },
      { name: 'Calendar & Scheduling', included: true },
      { name: 'Basic Reporting', included: true },
      { name: 'Form Builder (3 forms)', included: true },
      { name: 'AI Lead Scoring', included: false },
      { name: 'Email Campaigns', included: false },
      { name: 'Workflow Automation', included: false },
      { name: 'Second Brain AI', included: false },
      { name: 'API Access', included: false },
    ],
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/signup?plan=sales',
    popular: false,
    color: '#4A1515',
  },
  {
    id: 'build',
    name: 'Build',
    description: 'Scale your agency with powerful automation',
    price: { monthly: 187, yearly: 149 },
    yearlyTotal: 1788,
    discount: 20,
    icon: Building2,
    limits: {
      users: 5,
      agencies: 1,
      leads: '2,000/mo',
      emails: '5,000/mo',
      forms: 10,
      storage: '50 GB'
    },
    features: [
      { name: 'Everything in Sales, plus:', included: true, highlight: true },
      { name: 'Meetings & Scheduling', included: true },
      { name: 'Form Builder (10 forms)', included: true },
      { name: 'Email Marketing Campaigns', included: true },
      { name: 'Workflow Automation (10)', included: true },
      { name: 'AI Lead Scoring', included: true },
      { name: 'AI Call Transcription', included: true },
      { name: 'Second Brain AI', included: true },
      { name: 'Advanced Reporting', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Mind Maps', included: false },
      { name: 'Team Chat', included: false },
      { name: 'API Access', included: false },
    ],
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/signup?plan=build',
    popular: true,
    color: '#4A1515',
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Unlimited everything for enterprise agencies',
    price: { monthly: 349, yearly: 279 },
    yearlyTotal: 3348,
    discount: 20,
    icon: Rocket,
    limits: {
      users: 'Unlimited',
      agencies: 'Unlimited',
      leads: 'Unlimited',
      emails: 'Unlimited',
      forms: 'Unlimited',
      storage: '500 GB'
    },
    features: [
      { name: 'Everything in Build, plus:', included: true, highlight: true },
      { name: 'Unlimited Team Members', included: true },
      { name: 'Unlimited Agencies', included: true },
      { name: 'Unlimited Forms & Workflows', included: true },
      { name: 'Mind Maps (Miro replacement)', included: true },
      { name: 'Team Chat (Slack alternative)', included: true },
      { name: 'White Label Options', included: true },
      { name: 'Full API Access', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'Dedicated Account Manager', included: true },
      { name: 'Custom Onboarding', included: true },
      { name: '24/7 Priority Support', included: true },
      { name: 'SLA Guarantee', included: true },
    ],
    cta: 'Start 14-Day Free Trial',
    ctaLink: '/signup?plan=scale',
    popular: false,
    color: '#4A1515',
  },
];

/**
 * Tools replaced and their costs
 */
const TOOLS_REPLACED = [
  { name: 'GoHighLevel', cost: 497, category: 'CRM & Automation' },
  { name: 'Typeform/Jotform', cost: 100, category: 'Forms' },
  { name: 'ClickUp/Asana', cost: 50, category: 'Project Management' },
  { name: 'Notion/Coda', cost: 30, category: 'Knowledge Base' },
  { name: 'Miro/Lucidchart', cost: 50, category: 'Visual Planning' },
  { name: 'Calendly', cost: 97, category: 'Meeting Scheduling' },
  { name: 'ActiveCampaign', cost: 500, category: 'Email Marketing' },
  { name: 'Other Tools', cost: 51, category: 'Various' },
];

/**
 * FAQ data
 */
const FAQS = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'Start your trial on any plan. You will need to enter a credit card, but you will not be charged during the 14-day trial period. Cancel anytime before the trial ends and you will not be charged. If you continue, your card will be automatically charged at the end of the trial.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. When you upgrade, you will be charged a prorated amount. When you downgrade, the change takes effect at your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover). Enterprise customers can also pay via invoice with NET-30 terms.',
  },
  {
    question: 'How do team seats work?',
    answer: 'Each plan includes a set number of team members. Sales includes 1 seat, Build includes 5 seats, and Scale has unlimited seats. Additional seats can be added for $12/month per seat on Sales and Build plans.',
  },
  {
    question: 'Can I add more agencies?',
    answer: 'Sales and Build plans include 1 agency. Scale plan includes unlimited agencies. On Sales and Build, you can add additional agencies for $47/month per agency.',
  },
  {
    question: 'Is there a long-term contract?',
    answer: 'No long-term contracts. Monthly plans bill monthly and can be canceled anytime. Annual plans are billed yearly and offer significant savings.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied within the first 30 days after your trial ends, contact us for a full refund.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data is retained for 30 days after cancellation. During this time, you can export your data or reactivate your account. After 30 days, data is permanently deleted.',
  },
];

/**
 * Pricing Page
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
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#4A1515]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#4A1515]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trial badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A1515]/20 border border-[#4A1515]/30 mb-6">
              <Calendar className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">14-Day Free Trial on All Plans</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              One Platform, One Price
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
              Replace 10+ tools and save <span className="text-yellow-500 font-bold">${totalSavings}/month</span>.
              Simple pricing that scales with your agency.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              No hidden fees. No setup costs. Cancel anytime.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn('text-sm font-medium', !isYearly ? 'text-white' : 'text-gray-500')}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  'relative w-14 h-7 rounded-full transition-colors',
                  isYearly ? 'bg-[#4A1515]' : 'bg-gray-700'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                    isYearly ? 'translate-x-8' : 'translate-x-1'
                  )}
                />
              </button>
              <span className={cn('text-sm font-medium', isYearly ? 'text-white' : 'text-gray-500')}>
                Yearly
                <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">
                  Save up to 20%
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.price.yearly : plan.price.monthly;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    'relative p-6 lg:p-8 rounded-2xl flex flex-col',
                    plan.popular
                      ? 'bg-gradient-to-br from-[#4A1515]/30 to-black border-2 border-[#4A1515] md:scale-105 md:-my-4 z-10'
                      : 'bg-white/5 border border-gray-800/50',
                    'hover:border-[#4A1515]/50 transition-all'
                  )}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#4A1515] text-white text-xs font-bold uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        plan.popular ? 'bg-[#4A1515]' : 'bg-[#4A1515]/20'
                      )}>
                        <Icon className="w-5 h-5 text-white" />
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
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    {isYearly && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500">
                          ${plan.yearlyTotal} billed annually
                        </p>
                        <p className="text-sm text-yellow-500 font-medium">
                          Save {plan.discount}% vs monthly
                        </p>
                      </div>
                    )}
                    {!isYearly && (
                      <p className="text-sm text-gray-500 mt-2">
                        or ${plan.price.yearly}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Limits badges */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="px-3 py-2 rounded-lg bg-white/5 text-center">
                      <div className="text-sm font-bold text-white">{plan.limits.users}</div>
                      <div className="text-xs text-gray-500">Team Members</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/5 text-center">
                      <div className="text-sm font-bold text-white">{plan.limits.leads}</div>
                      <div className="text-xs text-gray-500">Leads</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={plan.ctaLink}
                    className={cn(
                      'block w-full py-4 rounded-xl text-center font-semibold transition-all mb-6',
                      plan.popular
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                        : 'bg-[#4A1515] text-white hover:bg-[#5a2020]'
                    )}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <div className="flex-1 pt-6 border-t border-gray-800/50">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className={cn(
                              'w-5 h-5 flex-shrink-0 mt-0.5',
                              feature.highlight ? 'text-yellow-500' : 'text-[#4A1515]'
                            )} />
                          ) : (
                            <X className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              feature.highlight ? 'text-yellow-500 font-semibold' :
                              feature.included ? 'text-gray-300' : 'text-gray-600'
                            )}
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Replaced Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Replace 10+ Tools With One Platform
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stop paying for multiple subscriptions. Axolop combines everything you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TOOLS_REPLACED.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-gray-800/50 text-center"
              >
                <div className="text-2xl font-bold text-white mb-1">
                  ${tool.cost}
                </div>
                <div className="text-sm font-medium text-white mb-1">
                  {tool.name}
                </div>
                <div className="text-xs text-gray-500">
                  {tool.category}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 p-6 rounded-2xl bg-[#4A1515]/20 border border-[#4A1515]/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-4xl font-bold text-yellow-500 mb-2">
              ${totalSavings}/month savings
            </div>
            <p className="text-gray-400">
              That's <span className="text-white font-semibold">${totalSavings * 12}/year</span> back in your pocket
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, text: '256-bit SSL Encryption' },
              { icon: Zap, text: '99.9% Uptime SLA' },
              { icon: Users, text: '1000+ Agencies' },
              { icon: Calendar, text: '14-Day Free Trial' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#4A1515]/20 border border-[#4A1515]/40 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">{item.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/30 to-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-gray-800/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  <HelpCircle
                    className={cn(
                      'w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-4',
                      openFaq === index && 'rotate-180 text-[#4A1515]'
                    )}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Start your 14-day free trial today. No credit card required to explore.
              Upgrade when you're ready.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors"
            >
              Start Your Free Trial
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Questions? <Link to="/contact" className="text-[#4A1515] hover:underline">Contact our sales team</Link>
            </p>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Pricing;
