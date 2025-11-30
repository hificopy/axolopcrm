import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import {
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Clock,
  Check,
  ArrowRight,
} from 'lucide-react';

/**
 * Benefits of the affiliate program
 */
const BENEFITS = [
  {
    icon: DollarSign,
    title: '30% Recurring Commission',
    description: 'Earn 30% of every payment for the lifetime of each customer you refer.',
  },
  {
    icon: Clock,
    title: '90-Day Cookie Duration',
    description: 'Your referrals are tracked for 90 days, giving you credit for delayed sign-ups.',
  },
  {
    icon: Gift,
    title: 'Marketing Materials',
    description: 'Get access to banners, email templates, and landing pages to promote Axolop.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Dashboard',
    description: 'Track your clicks, conversions, and earnings in your affiliate dashboard.',
  },
];

/**
 * How it works steps
 */
const STEPS = [
  {
    step: 1,
    title: 'Sign Up',
    description: 'Create your free affiliate account in under 2 minutes.',
  },
  {
    step: 2,
    title: 'Share Your Link',
    description: 'Get your unique referral link and start sharing with your audience.',
  },
  {
    step: 3,
    title: 'Earn Commissions',
    description: 'Earn 30% recurring commission for every customer you refer.',
  },
];

/**
 * FAQ
 */
const FAQS = [
  {
    question: 'Who can join the affiliate program?',
    answer: 'Anyone can join! Whether you are a blogger, agency owner, consultant, or influencer, you can earn commissions by referring Axolop.',
  },
  {
    question: 'How and when do I get paid?',
    answer: 'Payouts are processed monthly via PayPal or bank transfer. You need a minimum balance of $50 to request a payout.',
  },
  {
    question: 'Is there a limit to how much I can earn?',
    answer: 'No limits! The more customers you refer, the more you earn. Top affiliates earn $5,000+ per month.',
  },
  {
    question: 'Can I refer my own agency?',
    answer: 'Self-referrals are not allowed. The program is designed for referring new customers only.',
  },
];

/**
 * Affiliate Public Page
 */
const AffiliatePublic = () => {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0F0510' }}>
      <SEO
        title="Affiliate Program - Earn 30% Recurring Commission | Axolop"
        description="Join the Axolop affiliate program and earn 30% recurring commission for every customer you refer. No limits, lifetime commissions."
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#14787b]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#14787b]/20 text-[#1fb5b9] text-sm font-semibold mb-6">
              Affiliate Program
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Earn{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14787b] to-[#1fb5b9]">
                30% Recurring
              </span>
              {' '}Commission
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Join thousands of affiliates earning passive income by recommending
              Axolop to agency owners. Lifetime commissions, no limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup?affiliate=true"
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl',
                  'bg-gradient-to-r from-[#14787b] to-[#1fb5b9]',
                  'text-white font-semibold text-lg',
                  'shadow-lg shadow-[#14787b]/25',
                  'hover:opacity-90 transition-opacity'
                )}
              >
                Become an Affiliate
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/signin"
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl',
                  'bg-white/10 text-white font-semibold',
                  'hover:bg-white/20 transition-colors'
                )}
              >
                Login to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Partner With Us
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    'p-6 rounded-2xl',
                    'backdrop-blur-sm bg-white/5',
                    'border border-gray-800/50'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#14787b]/20 flex items-center justify-center mb-4">
                    <BenefitIcon className="w-6 h-6 text-[#1fb5b9]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="space-y-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#14787b] to-[#1fb5b9] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20 bg-gradient-to-b from-gray-900/30 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              'p-8 rounded-2xl text-center',
              'bg-gradient-to-br from-[#14787b]/20 to-[#1fb5b9]/10',
              'border border-[#14787b]/30'
            )}
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Potential Earnings
            </h3>
            <p className="text-gray-400 mb-6">
              With our average customer paying $119/month and a 30% commission rate:
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-3xl font-bold text-[#1fb5b9]">$35.70</p>
                <p className="text-gray-500 text-sm">per customer/month</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1fb5b9]">$357</p>
                <p className="text-gray-500 text-sm">10 customers/month</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1fb5b9]">$3,570</p>
                <p className="text-gray-500 text-sm">100 customers/month</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              These are recurring commissions. Your earnings grow as your referrals stay subscribed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-black">
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
                className={cn(
                  'p-6 rounded-xl',
                  'backdrop-blur-sm bg-white/5',
                  'border border-gray-800/50'
                )}
              >
                <h3 className="font-semibold text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-400 text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Join the Axolop affiliate program today and start earning 30% recurring commissions.
            </p>
            <Link
              to="/signup?affiliate=true"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-[#14787b] to-[#1fb5b9]',
                'text-white font-semibold text-lg',
                'shadow-lg shadow-[#14787b]/25',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Become an Affiliate
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default AffiliatePublic;
