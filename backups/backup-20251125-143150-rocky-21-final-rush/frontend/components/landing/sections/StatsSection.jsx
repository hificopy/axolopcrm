import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StatDisplay } from '../ui/AnimatedCounter';

/**
 * Stats data - Key metrics that matter to agency owners
 */
const STATS = [
  {
    value: 10,
    suffix: 'x',
    label: 'Faster Setup',
    sublabel: 'vs. traditional CRMs',
    color: 'red',
  },
  {
    prefix: '$',
    value: 1375,
    label: 'Monthly Savings',
    sublabel: 'on average per agency',
    color: 'teal',
  },
  {
    value: 94,
    suffix: '%',
    label: 'User Satisfaction',
    sublabel: 'based on customer surveys',
    color: 'amber',
  },
  {
    value: 2,
    suffix: 'min',
    label: 'Time to Value',
    sublabel: 'from signup to first lead',
    color: 'default',
  },
];

/**
 * StatsSection - Large impact statistics section
 * Perspective.co inspired design with animated counters
 */
const StatsSection = ({ className }) => {
  return (
    <section
      className={cn(
        'relative py-20 md:py-28 overflow-hidden',
        'bg-gradient-to-b from-black via-gray-900/50 to-black',
        className
      )}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#761B14]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#14787b]/10 rounded-full blur-3xl" />
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Results That Speak for Themselves
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join thousands of agency owners who have transformed their operations
            and boosted their profit margins with Axolop
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={cn(
                'relative p-6 rounded-2xl',
                'backdrop-blur-sm bg-white/[0.02]',
                'border border-gray-800/30',
                'hover:border-gray-700/50 transition-colors'
              )}
            >
              <StatDisplay
                value={stat.value}
                prefix={stat.prefix || ''}
                suffix={stat.suffix || ''}
                label={stat.label}
                sublabel={stat.sublabel}
                color={stat.color}
                duration={2.5}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.p
          className="text-center text-gray-500 mt-12 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Trusted by 6,000+ agencies worldwide
        </motion.p>
      </div>
    </section>
  );
};

export default StatsSection;
