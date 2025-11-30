import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { ArrowRight, Check, X, Star, Quote } from 'lucide-react';

/**
 * UseCasePageTemplate - Comprehensive template for industry-specific use case pages
 * Features: Hero, Pain Points, Solutions, Benefits, Testimonials, FAQ, Pricing Comparison, CTA
 */
const UseCasePageTemplate = ({
  // Hero section
  title,
  subtitle,
  description,
  heroStats = [],
  icon: Icon,
  iconColor = '#d4463c',
  iconBg = '#761B14',

  // Pain Points section
  painPoints = [],
  painPointsTitle = "Sound Familiar?",
  painPointsSubtitle = "Common challenges we help solve",

  // Solutions section
  solutions = [],
  solutionsTitle = "How Axolop Helps",
  solutionsSubtitle = "Powerful features tailored for your industry",

  // Benefits section
  benefits = [],
  benefitsTitle = "Key Benefits",

  // Testimonials section
  testimonials = [],

  // FAQ section
  faqs = [],

  // Pricing comparison section
  competitors = [],
  competitorComparisonTitle = "Why Teams Switch to Axolop",

  // CTA
  ctaText = 'Start Your Free Trial',
  ctaLink = '/signup',
  secondaryCta = { text: 'See Pricing', link: '/pricing' },
}) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title={`${title} - Axolop CRM`} description={description} />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: iconBg }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {Icon && (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${iconBg}40` }}
              >
                <Icon className="w-10 h-10" style={{ color: iconColor }} />
              </div>
            )}
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm font-medium mb-6">
              {subtitle}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{title}</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">{description}</p>

            {/* Hero Stats */}
            {heroStats.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold" style={{ color: iconColor }}>{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            )}

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

      {/* Pain Points Section */}
      {painPoints.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{painPointsTitle}</h2>
              <p className="text-gray-400 text-lg">{painPointsSubtitle}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {painPoints.map((point, index) => {
                const PointIcon = point.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-red-950/20 border border-red-900/30 hover:border-red-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        {PointIcon ? <PointIcon className="w-5 h-5 text-red-400" /> : <X className="w-5 h-5 text-red-400" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{point.title}</h3>
                        <p className="text-gray-400 text-sm">{point.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Solutions Section */}
      {solutions.length > 0 && (
        <section className="py-20 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{solutionsTitle}</h2>
              <p className="text-gray-400 text-lg">{solutionsSubtitle}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((solution, index) => {
                const SolutionIcon = solution.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-[#761B14]/10 to-[#14787b]/10 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {SolutionIcon && (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${iconBg}30` }}
                        >
                          <SolutionIcon className="w-6 h-6" style={{ color: iconColor }} />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{solution.feature}</h3>
                          {solution.comingSoon && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-400 uppercase">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{solution.description}</p>
                        <p className="text-[#1fb5b9] text-sm font-medium">{solution.benefit}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{benefitsTitle}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-8 rounded-2xl bg-white/5 border border-gray-800/50"
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: iconColor }}>
                    {benefit.metric}
                  </div>
                  <p className="text-white font-semibold mb-2">{benefit.title}</p>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800/50"
                >
                  <Quote className="w-8 h-8 text-[#761B14] mb-4" />
                  <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#761B14] to-[#d4463c] flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                  {testimonial.rating && (
                    <div className="flex gap-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Competitor Comparison Section */}
      {competitors.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{competitorComparisonTitle}</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-x-auto"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-4 px-4 text-left text-gray-400 font-medium">Feature</th>
                    <th className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#761B14] to-[#d4463c] text-white text-sm font-bold">
                        Axolop
                      </span>
                    </th>
                    {competitors.map((comp, index) => (
                      <th key={index} className="py-4 px-4 text-center text-gray-400 font-medium">
                        {comp.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitors[0]?.features?.map((feature, fIndex) => (
                    <tr key={fIndex} className="border-b border-gray-800/50">
                      <td className="py-4 px-4 text-white">{feature.name}</td>
                      <td className="py-4 px-4 text-center">
                        {feature.axolop === true ? (
                          <Check className="w-5 h-5 text-[#2DCE89] mx-auto" />
                        ) : feature.axolop === false ? (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        ) : (
                          <span className="text-[#2DCE89] font-medium">{feature.axolop}</span>
                        )}
                      </td>
                      {competitors.map((comp, cIndex) => (
                        <td key={cIndex} className="py-4 px-4 text-center">
                          {comp.features[fIndex]?.value === true ? (
                            <Check className="w-5 h-5 text-gray-400 mx-auto" />
                          ) : comp.features[fIndex]?.value === false ? (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          ) : (
                            <span className="text-gray-400">{comp.features[fIndex]?.value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-20 bg-black">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-gray-800/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#761B14]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of teams who have simplified their workflow with Axolop. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              <Link
                to="/contact"
                className="text-gray-400 hover:text-white font-medium transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4">No credit card required. 14-day free trial.</p>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default UseCasePageTemplate;
