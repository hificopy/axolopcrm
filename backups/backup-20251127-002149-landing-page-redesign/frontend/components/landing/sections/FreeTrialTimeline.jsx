import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Unlock,
  Bell,
  Star,
  Check,
} from 'lucide-react';

/**
 * Timeline steps for free trial
 */
const TIMELINE_STEPS = [
  {
    day: 'Today',
    title: 'Sign up in 2 minutes',
    description: 'No credit card required. Access the software, 20+ templates, and all features instantly.',
    icon: Unlock,
    color: 'teal',
  },
  {
    day: 'Day 7',
    title: 'We send you a reminder',
    description: 'Check your progress and explore features you might have missed. Stay in control.',
    icon: Bell,
    color: 'amber',
  },
  {
    day: 'Day 14',
    title: 'Your subscription starts',
    description: 'Continue with full access, or cancel anytime. No strings attached.',
    icon: Star,
    color: 'red',
  },
];

const colorStyles = {
  teal: {
    bg: 'bg-[#14787b]',
    ring: 'ring-[#14787b]/30',
    text: 'text-[#1fb5b9]',
  },
  amber: {
    bg: 'bg-amber-500',
    ring: 'ring-amber-500/30',
    text: 'text-amber-400',
  },
  red: {
    bg: 'bg-[#761B14]',
    ring: 'ring-[#761B14]/30',
    text: 'text-white',
  },
};

/**
 * FreeTrialTimeline - Visual timeline showing trial journey
 */
const FreeTrialTimeline = ({ className }) => {
  return (
    <section
      className={cn(
        'relative py-20 md:py-28 overflow-hidden',
        'bg-black',
        className
      )}
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your Free Trial, Made Easy
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Try Axolop risk-free for 14 days. Get full access to all features,
            including 20+ templates. No commitment, cancel anytime.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#14787b] via-amber-500 to-[#761B14] hidden md:block" />

          {/* Timeline steps */}
          <div className="space-y-12 md:space-y-0">
            {TIMELINE_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const styles = colorStyles[step.color];
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={cn(
                    'relative md:flex md:items-center md:justify-center',
                    'md:min-h-[140px]'
                  )}
                >
                  {/* Connector dot */}
                  <div
                    className={cn(
                      'hidden md:flex absolute left-1/2 -translate-x-1/2',
                      'w-12 h-12 rounded-full items-center justify-center',
                      styles.bg,
                      'ring-4',
                      styles.ring,
                      'z-10'
                    )}
                  >
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content card */}
                  <div
                    className={cn(
                      'md:w-[calc(50%-40px)]',
                      isLeft ? 'md:mr-auto md:pr-8 md:text-right' : 'md:ml-auto md:pl-8 md:text-left'
                    )}
                  >
                    <div
                      className={cn(
                        'p-6 rounded-2xl',
                        'backdrop-blur-sm bg-white/5',
                        'border border-gray-800/50',
                        'hover:border-gray-700/50 transition-colors'
                      )}
                    >
                      {/* Mobile icon */}
                      <div
                        className={cn(
                          'md:hidden w-10 h-10 rounded-xl flex items-center justify-center mb-4',
                          styles.bg
                        )}
                      >
                        <StepIcon className="w-5 h-5 text-white" />
                      </div>

                      {/* Day badge */}
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3',
                          'bg-white/5',
                          styles.text
                        )}
                      >
                        {step.day}
                      </span>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            to="/signup"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
              'bg-gradient-to-r from-[#14787b] to-[#1fb5b9]',
              'text-white font-semibold text-lg',
              'shadow-lg shadow-[#14787b]/25',
              'hover:shadow-xl hover:shadow-[#14787b]/30',
              'transition-all duration-300',
              'hover:scale-105'
            )}
          >
            Start my 14-day free trial
          </Link>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1fb5b9]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1fb5b9]" />
              <span>Free forever option</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1fb5b9]" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FreeTrialTimeline;
