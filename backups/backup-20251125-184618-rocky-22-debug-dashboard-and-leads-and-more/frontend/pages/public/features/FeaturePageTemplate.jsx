import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { ArrowRight, Check } from 'lucide-react';

const FeaturePageTemplate = ({
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor = '#d4463c',
  iconBg = '#761B14',
  features = [],
  benefits = [],
  ctaText = 'Start Free Trial',
  ctaLink = '/signup',
  secondaryCta = { text: 'See Pricing', link: '/pricing' },
  screenshots = [],
  integrations = [],
  useCases = [],
}) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title={`${title} - Axolop`} description={description} />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
            style={{ backgroundColor: `${iconBg}20` }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {Icon && (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${iconBg}30` }}
              >
                <Icon className="w-8 h-8" style={{ color: iconColor }} />
              </div>
            )}
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm font-medium mb-6">
              {subtitle}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{title}</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">{description}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ctaLink}
                className={cn(
                  'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                  'bg-gradient-to-r from-[#761B14] to-[#d4463c]',
                  'text-white font-semibold text-lg',
                  'shadow-lg shadow-[#761B14]/25',
                  'hover:opacity-90 transition-opacity'
                )}
              >
                {ctaText} <ArrowRight className="w-5 h-5" />
              </Link>
              {secondaryCta && (
                <Link
                  to={secondaryCta.link}
                  className="text-gray-400 hover:text-white font-medium transition-colors"
                >
                  {secondaryCta.text}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      {features.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Key Features</h2>
              <p className="text-gray-400">Everything you need to succeed</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
                  >
                    {FeatureIcon && (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${iconBg}20` }}
                      >
                        <FeatureIcon className="w-6 h-6" style={{ color: iconColor }} />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <section className="py-20 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-br from-[#761B14]/20 to-[#14787b]/10 border border-gray-800/50"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Why Choose Axolop</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#14787b]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#1fb5b9]" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>
      )}

      {/* Use Cases */}
      {useCases.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Use Cases</h2>
              <p className="text-gray-400">How teams use this feature</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-gray-800/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                  <p className="text-gray-400 text-sm">{useCase.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of agency owners who have simplified their workflow with Axolop.
            </p>
            <Link
              to="/signup"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-[#761B14] to-[#d4463c]',
                'text-white font-semibold text-lg',
                'shadow-lg shadow-[#761B14]/25',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default FeaturePageTemplate;
