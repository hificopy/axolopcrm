import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * FeatureCard - Large feature showcase card with icon, title, description
 * Used in the feature showcase section of the landing page
 */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features = [],
  href,
  color = 'red', // 'red' | 'teal' | 'amber' | 'blue'
  image,
  className,
}) => {
  const colorStyles = {
    red: {
      gradient: 'from-[#761B14] to-[#d4463c]',
      glow: 'hover:shadow-[0_0_40px_rgba(118,27,20,0.4)]',
      iconBg: 'bg-[#761B14]/20',
      iconText: 'text-[#d4463c]',
      border: 'hover:border-[#761B14]/50',
    },
    teal: {
      gradient: 'from-[#14787b] to-[#1fb5b9]',
      glow: 'hover:shadow-[0_0_40px_rgba(20,120,123,0.4)]',
      iconBg: 'bg-[#14787b]/20',
      iconText: 'text-[#1fb5b9]',
      border: 'hover:border-[#14787b]/50',
    },
    amber: {
      gradient: 'from-amber-500 to-yellow-500',
      glow: 'hover:shadow-[0_0_40px_rgba(245,166,35,0.4)]',
      iconBg: 'bg-amber-500/20',
      iconText: 'text-amber-400',
      border: 'hover:border-amber-500/50',
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]',
      iconBg: 'bg-blue-500/20',
      iconText: 'text-blue-400',
      border: 'hover:border-blue-500/50',
    },
  };

  const styles = colorStyles[color];

  const CardWrapper = href ? Link : 'div';
  const cardProps = href ? { to: href } : {};

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-black/80',
        'border border-gray-800/50',
        'p-8',
        'transition-all duration-500',
        styles.glow,
        styles.border,
        href && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
          'bg-gradient-to-br',
          styles.gradient
        )}
      />

      <CardWrapper {...cardProps} className="relative z-10 block">
        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
              styles.iconBg
            )}
          >
            <Icon className={cn('w-7 h-7', styles.iconText)} />
          </div>
        )}

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Feature list */}
        {features.length > 0 && (
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
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
                <span className="text-gray-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Image */}
        {image && (
          <div className="mt-6 rounded-xl overflow-hidden border border-gray-800/50">
            <img
              src={image}
              alt={title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Learn more link */}
        {href && (
          <div className="flex items-center gap-2 text-sm font-medium mt-4">
            <span className={cn('bg-gradient-to-r bg-clip-text text-transparent', styles.gradient)}>
              Learn more
            </span>
            <ArrowRight
              className={cn(
                'w-4 h-4 transform group-hover:translate-x-1 transition-transform',
                styles.iconText
              )}
            />
          </div>
        )}
      </CardWrapper>
    </motion.div>
  );
};

/**
 * FeatureCardCompact - Smaller version for grids
 */
const FeatureCardCompact = ({
  icon: Icon,
  title,
  description,
  href,
  color = 'red',
  className,
}) => {
  const colorStyles = {
    red: {
      iconBg: 'bg-[#761B14]/20',
      iconText: 'text-[#d4463c]',
    },
    teal: {
      iconBg: 'bg-[#14787b]/20',
      iconText: 'text-[#1fb5b9]',
    },
    amber: {
      iconBg: 'bg-amber-500/20',
      iconText: 'text-amber-400',
    },
    blue: {
      iconBg: 'bg-blue-500/20',
      iconText: 'text-blue-400',
    },
  };

  const styles = colorStyles[color];
  const CardWrapper = href ? Link : 'div';
  const cardProps = href ? { to: href } : {};

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-xl',
        'backdrop-blur-xl bg-white/5',
        'border border-gray-800/50',
        'p-5',
        'transition-all duration-300',
        'hover:bg-white/[0.07]',
        'hover:border-gray-700/50',
        href && 'cursor-pointer',
        className
      )}
      whileHover={{ scale: 1.02 }}
    >
      <CardWrapper {...cardProps} className="block">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                styles.iconBg
              )}
            >
              <Icon className={cn('w-5 h-5', styles.iconText)} />
            </div>
          )}
          <div>
            <h4 className="text-base font-semibold text-white mb-1">
              {title}
            </h4>
            <p className="text-sm text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
};

export { FeatureCard, FeatureCardCompact };
export default FeatureCard;
