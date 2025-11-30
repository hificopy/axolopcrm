import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Brain,
  Network,
  Layout,
  BookOpen,
  BarChart3,
  Mail,
  Zap,
  ArrowRight,
} from 'lucide-react';

/**
 * Feature showcase data - Key differentiators
 */
const FEATURES = [
  {
    id: 'ai-brain',
    title: 'Local AI Second Brain',
    description: 'Your private AI that learns from your agency data. No cloud dependency, complete privacy, instant answers.',
    icon: Brain,
    color: 'red',
    features: [
      'Learn from all your client interactions',
      'Instant answers without searching',
      'Privacy-first local processing',
      'Continuous learning and improvement',
    ],
    href: '/features/second-brain',
  },
  {
    id: 'pipeline',
    title: 'Visual Pipeline Management',
    description: 'See your entire sales process at a glance. Drag-and-drop deals, automate follow-ups, close faster.',
    icon: BarChart3,
    color: 'teal',
    features: [
      'Kanban-style deal tracking',
      'Automated stage transitions',
      'Revenue forecasting',
      'Team performance insights',
    ],
    href: '/features/pipeline',
  },
  {
    id: 'automation',
    title: 'Powerful Workflow Automation',
    description: 'Automate repetitive tasks and focus on what matters. Build workflows visually without code.',
    icon: Zap,
    color: 'amber',
    features: [
      'Visual workflow builder',
      'Trigger-based automation',
      'Multi-step sequences',
      'Cross-tool integrations',
    ],
    href: '/features/automation',
  },
  {
    id: 'email',
    title: 'Email Marketing Suite',
    description: 'Create, send, and track email campaigns that convert. Built-in templates and AI-powered optimization.',
    icon: Mail,
    color: 'blue',
    features: [
      'Drag-and-drop email builder',
      'Automated sequences',
      'A/B testing built-in',
      'Detailed analytics',
    ],
    href: '/features/email',
  },
];

const colorStyles = {
  red: {
    gradient: 'from-[#761B14] to-[#d4463c]',
    iconBg: 'bg-[#761B14]/20',
    iconText: 'text-[#d4463c]',
    glow: 'group-hover:shadow-[0_0_60px_rgba(118,27,20,0.3)]',
    border: 'group-hover:border-[#761B14]/40',
  },
  teal: {
    gradient: 'from-[#14787b] to-[#1fb5b9]',
    iconBg: 'bg-[#14787b]/20',
    iconText: 'text-[#1fb5b9]',
    glow: 'group-hover:shadow-[0_0_60px_rgba(20,120,123,0.3)]',
    border: 'group-hover:border-[#14787b]/40',
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-500',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    glow: 'group-hover:shadow-[0_0_60px_rgba(245,166,35,0.3)]',
    border: 'group-hover:border-amber-500/40',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    glow: 'group-hover:shadow-[0_0_60px_rgba(59,130,246,0.3)]',
    border: 'group-hover:border-blue-500/40',
  },
};

/**
 * FeatureShowcaseSection - Large feature cards highlighting key differentiators
 */
const FeatureShowcaseSection = ({ className }) => {
  return (
    <section
      className={cn(
        'relative py-20 md:py-28 overflow-hidden',
        'bg-gradient-to-b from-black via-gray-900/20 to-black',
        className
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#761B14]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#14787b]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#1fb5b9] font-semibold mb-3 tracking-wide uppercase text-sm">
            100+ Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Way More Than Traditional CRM
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to run your agency, from lead capture to customer success,
            all powered by local AI
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => {
            const FeatureIcon = feature.icon;
            const styles = colorStyles[feature.color];

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={feature.href}
                  className={cn(
                    'group block h-full p-8 rounded-3xl',
                    'backdrop-blur-sm bg-gradient-to-br from-gray-900/80 to-black/80',
                    'border border-gray-800/50',
                    'transition-all duration-500',
                    styles.glow,
                    styles.border
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
                      styles.iconBg
                    )}
                  >
                    <FeatureIcon className={cn('w-7 h-7', styles.iconText)} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            styles.iconBg
                          )}
                        >
                          <svg
                            className={cn('w-3 h-3', styles.iconText)}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Learn more */}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span
                      className={cn(
                        'bg-gradient-to-r bg-clip-text text-transparent',
                        styles.gradient
                      )}
                    >
                      Learn more
                    </span>
                    <ArrowRight
                      className={cn(
                        'w-4 h-4 transform group-hover:translate-x-1 transition-transform',
                        styles.iconText
                      )}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/signup"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
              'bg-gradient-to-r from-[#761B14] to-[#d4463c]',
              'text-white font-semibold text-lg',
              'shadow-lg shadow-[#761B14]/25',
              'hover:shadow-xl hover:shadow-[#761B14]/30',
              'transition-all duration-300',
              'hover:scale-105'
            )}
          >
            Experience the New Age CRM
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcaseSection;
