import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Check, X, HelpCircle } from 'lucide-react';

/**
 * Pricing plans data
 */
const PLANS = [
  {
    name: 'Free',
    description: 'For individuals getting started',
    price: { monthly: 0, yearly: 0 },
    features: [
      { name: '100 contacts', included: true },
      { name: '1 pipeline', included: true },
      { name: 'Basic email', included: true },
      { name: 'Form builder (3 forms)', included: true },
      { name: 'Community support', included: true },
      { name: 'AI features', included: false },
      { name: 'Automation', included: false },
      { name: 'Custom fields', included: false },
      { name: 'Team members', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free',
    ctaLink: '/signup',
    popular: false,
  },
  {
    name: 'Starter',
    description: 'For growing agencies',
    price: { monthly: 100, yearly: 80 },
    features: [
      { name: '2,500 contacts', included: true },
      { name: '5 pipelines', included: true },
      { name: 'Email marketing', included: true },
      { name: 'Unlimited forms', included: true },
      { name: 'Email support', included: true },
      { name: 'Basic AI features', included: true },
      { name: 'Basic automation', included: true },
      { name: 'Custom fields', included: true },
      { name: '3 team members', included: true },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=starter',
    popular: false,
  },
  {
    name: 'Business',
    description: 'For established agencies',
    price: { monthly: 119, yearly: 99 },
    features: [
      { name: 'Unlimited contacts', included: true },
      { name: 'Unlimited pipelines', included: true },
      { name: 'Advanced email marketing', included: true },
      { name: 'Unlimited forms', included: true },
      { name: 'Priority support', included: true },
      { name: 'Full AI features', included: true },
      { name: 'Advanced automation', included: true },
      { name: 'Unlimited custom fields', included: true },
      { name: '10 team members', included: true },
      { name: 'Full API access', included: true },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup?plan=business',
    popular: true,
  },
];

/**
 * FAQ data
 */
const FAQS = [
  {
    question: 'Can I try Axolop for free?',
    answer: 'Yes! We offer a 14-day free trial on all paid plans with no credit card required. You also have a free plan that you can use forever.',
  },
  {
    question: 'What happens when my trial ends?',
    answer: 'If you decide not to continue, your account will automatically switch to our Free plan. You will not be charged, and you will keep access to basic features.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and billing is prorated.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Save 20% when you choose annual billing on any paid plan.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay via invoice.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees ever. Get started in minutes with our self-service onboarding.',
  },
];

/**
 * Pricing Page
 */
const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Pricing - Axolop CRM"
        description="Simple, transparent pricing for Axolop CRM. Start free, upgrade as you grow. Save $1,375/month by replacing 10+ tools."
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#761B14]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start free, upgrade as you grow. No hidden fees, no surprises.
              Save $1,375/month by replacing 10+ tools.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn('text-sm', !isYearly ? 'text-white' : 'text-gray-500')}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  'relative w-14 h-7 rounded-full transition-colors',
                  isYearly ? 'bg-[#14787b]' : 'bg-gray-700'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                    isYearly ? 'translate-x-8' : 'translate-x-1'
                  )}
                />
              </button>
              <span className={cn('text-sm', isYearly ? 'text-white' : 'text-gray-500')}>
                Yearly
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#14787b]/20 text-[#1fb5b9] text-xs">
                  Save 20%
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  'relative p-6 rounded-2xl',
                  plan.popular
                    ? 'bg-gradient-to-br from-gray-900 to-black border-2 border-[#14787b] scale-105'
                    : 'bg-white/5 border border-gray-800/50',
                  'hover:border-gray-700/50 transition-all'
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#14787b] text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed annually (${(isYearly ? plan.price.yearly : plan.price.monthly) * 12}/year)
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={plan.ctaLink}
                  className={cn(
                    'block w-full py-3 rounded-xl text-center font-semibold transition-all',
                    plan.popular
                      ? 'bg-gradient-to-r from-[#14787b] to-[#1fb5b9] text-white hover:opacity-90'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-gray-800/50">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-[#1fb5b9] flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                        <span
                          className={cn(
                            'text-sm',
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
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              'p-8 rounded-2xl text-center',
              'bg-gradient-to-br from-[#761B14]/20 to-[#14787b]/20',
              'border border-gray-800/50'
            )}
          >
            <h3 className="text-2xl font-bold text-white mb-3">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              For agencies with 25+ team members or specific requirements,
              we offer custom Enterprise plans with dedicated support.
            </p>
            <Link
              to="/contact?type=enterprise"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-white/10 text-white font-semibold',
                'hover:bg-white/20 transition-colors'
              )}
            >
              Contact Sales
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
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
                      'w-5 h-5 text-gray-500 transition-transform',
                      openFaq === index && 'rotate-180'
                    )}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-400 text-sm">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Pricing;
