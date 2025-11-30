import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import {
  Target,
  Heart,
  Zap,
  Users,
  Shield,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

/**
 * Company values
 */
const VALUES = [
  {
    icon: Target,
    title: 'Agency-First',
    description: 'Every feature is designed with agency owners in mind. We understand your challenges because we lived them.',
    color: 'red',
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    description: 'Your data stays yours. Our local AI processes everything on your terms, not in the cloud.',
    color: 'teal',
  },
  {
    icon: Zap,
    title: 'Simplicity Wins',
    description: 'Powerful features that just work. No complexity, no learning curve, no excuses.',
    color: 'amber',
  },
  {
    icon: Heart,
    title: 'Customer Obsession',
    description: 'Your success is our success. We measure ourselves by the results you achieve.',
    color: 'blue',
  },
];

const colorStyles = {
  red: { iconBg: 'bg-[#E92C92]/20', iconText: 'text-[#E92C92]' },
  teal: { iconBg: 'bg-[#14787b]/20', iconText: 'text-[#1fb5b9]' },
  amber: { iconBg: 'bg-amber-500/20', iconText: 'text-amber-400' },
  blue: { iconBg: 'bg-[#E92C92]/20', iconText: 'text-[#E92C92]' },
};

/**
 * About Page
 */
const About = () => {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0F0510' }}>
      <SEO
        title="About Axolop - The New Age CRM for Agencies"
        description="Learn about Axolop's mission to help agency owners replace 10+ tools with one unified platform. Built by agency owners, for agency owners."
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#E92C92]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#14787b]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#1fb5b9] font-semibold mb-4 tracking-wide uppercase text-sm">
              Our Story
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Built by Agency Owners,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E92C92] to-[#E92C92]">
                For Agency Owners
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              We were tired of juggling 10+ tools to run our agency.
              So we built the solution we wished existed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                Agency owners waste thousands of dollars and countless hours
                switching between disconnected tools. We are on a mission to
                change that.
              </p>
              <p className="text-lg text-gray-400 mb-6">
                Axolop brings everything you need into one unified platform:
                CRM, email marketing, forms, automation, support, and AI
                intelligence. All working together seamlessly.
              </p>
              <p className="text-lg text-gray-300 font-medium">
                We help agencies save $1,375/month on average and raise their
                profit margins by 20%.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800/50 flex items-center justify-center">
                <div className="text-center">
                  <Lightbulb className="w-16 h-16 text-[#E92C92] mx-auto mb-4" />
                  <p className="text-gray-400">Platform Preview Coming Soon</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we build
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => {
              const ValueIcon = value.icon;
              const styles = colorStyles[value.color];

              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    'p-6 rounded-2xl',
                    'backdrop-blur-sm bg-white/5',
                    'border border-gray-800/50',
                    'hover:border-gray-700/50 transition-colors'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                      styles.iconBg
                    )}
                  >
                    <ValueIcon className={cn('w-6 h-6', styles.iconText)} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/30 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '6,000+', label: 'Agency Owners' },
              { value: '10+', label: 'Tools Replaced' },
              { value: '$1,375', label: 'Monthly Savings' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              Join 6,000+ agency owners who have already made the switch.
              Start your free trial today.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full relative group overflow-hidden transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, #ff85c8 0%, #E92C92 30%, #c41e78 70%, #ff69b4 100%)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 10px 40px rgba(233,44,146,0.4)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <span
                className="relative z-10 font-bold text-lg"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Get Started Free
              </span>
              <ArrowRight className="w-5 h-5 text-white/90" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>
              <div className="absolute top-0 -left-[100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-out pointer-events-none"></div>
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default About;
