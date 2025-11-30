import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Star, Shield, Award, Zap } from 'lucide-react';

/**
 * Trust badges data
 * These are placeholder badges - replace with actual ones when earned
 */
const TRUST_BADGES = [
  {
    name: 'G2 Leader',
    rating: '4.9',
    subtitle: 'Winter 2025',
    icon: Award,
    color: 'red',
  },
  {
    name: 'High Performer',
    rating: null,
    subtitle: 'EMEA Winter 2025',
    icon: Zap,
    color: 'teal',
  },
  {
    name: 'Easiest Admin',
    rating: null,
    subtitle: 'Small Business',
    icon: Star,
    color: 'amber',
  },
  {
    name: 'GDPR Ready',
    rating: null,
    subtitle: 'Data Protection',
    icon: Shield,
    color: 'blue',
  },
];

const colorStyles = {
  red: {
    bg: 'bg-gradient-to-br from-[#4F1B1B]/20 to-[#5C2222]/10',
    border: 'border-[#4F1B1B]/30',
    icon: 'text-[#6A2525]',
  },
  teal: {
    bg: 'bg-gradient-to-br from-[#14787b]/20 to-[#1fb5b9]/10',
    border: 'border-[#14787b]/30',
    icon: 'text-[#1fb5b9]',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
  },
};

/**
 * TrustBadgesSection - Awards and trust indicators
 */
const TrustBadgesSection = ({ className }) => {
  return (
    <section
      className={cn(
        'relative py-16 overflow-hidden',
        'bg-black',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Marketers Favorite Growth Platform
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Trusted by thousands. Awarded by the best. Agency owners choose Axolop
            for its ease of use, innovation, and results.
          </p>
        </motion.div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {TRUST_BADGES.map((badge, index) => {
            const BadgeIcon = badge.icon;
            const styles = colorStyles[badge.color];

            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'relative p-6 rounded-2xl text-center',
                  'backdrop-blur-sm',
                  styles.bg,
                  'border',
                  styles.border,
                  'transition-all duration-300'
                )}
              >
                {/* Icon */}
                <div className="flex justify-center mb-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      'bg-white/5'
                    )}
                  >
                    <BadgeIcon className={cn('w-6 h-6', styles.icon)} />
                  </div>
                </div>

                {/* Rating */}
                {badge.rating && (
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-white">
                      {badge.rating}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Name */}
                <p className="text-sm font-semibold text-white mb-0.5">
                  {badge.name}
                </p>

                {/* Subtitle */}
                <p className="text-xs text-gray-500">
                  {badge.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;
