import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * GlassMorphicCard - Reusable glassmorphism card component
 * Follows Axolop's Apple-inspired design language
 */
const GlassMorphicCard = ({
  children,
  className,
  hover = true,
  glow = false,
  glowColor = 'red', // 'red' | 'teal' | 'amber'
  padding = 'default', // 'none' | 'sm' | 'default' | 'lg'
  as = 'div',
  onClick,
  ...props
}) => {
  const Component = motion[as] || motion.div;

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const glowClasses = {
    red: 'hover:shadow-[0_0_30px_rgba(118,27,20,0.3)]',
    teal: 'hover:shadow-[0_0_30px_rgba(20,120,123,0.3)]',
    amber: 'hover:shadow-[0_0_30px_rgba(245,166,35,0.3)]',
  };

  return (
    <Component
      className={cn(
        // Base glassmorphism
        'relative overflow-hidden rounded-2xl',
        'backdrop-blur-xl bg-white/5',
        'border border-gray-800/50',
        'shadow-lg',
        // Padding
        paddingClasses[padding],
        // Hover effects
        hover && 'transition-all duration-300',
        hover && 'hover:border-gray-700/50',
        hover && 'hover:bg-white/[0.07]',
        // Glow effect
        glow && glowClasses[glowColor],
        // Clickable
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

/**
 * GlassMorphicCardHeader - Optional header section
 */
const GlassMorphicCardHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

/**
 * GlassMorphicCardTitle - Card title styling
 */
const GlassMorphicCardTitle = ({ children, className }) => (
  <h3 className={cn('text-xl font-semibold text-white', className)}>
    {children}
  </h3>
);

/**
 * GlassMorphicCardDescription - Card description styling
 */
const GlassMorphicCardDescription = ({ children, className }) => (
  <p className={cn('text-gray-400 text-sm mt-1', className)}>
    {children}
  </p>
);

/**
 * GlassMorphicCardContent - Main content area
 */
const GlassMorphicCardContent = ({ children, className }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);

/**
 * GlassMorphicCardFooter - Optional footer section
 */
const GlassMorphicCardFooter = ({ children, className }) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-800/50', className)}>
    {children}
  </div>
);

export {
  GlassMorphicCard,
  GlassMorphicCardHeader,
  GlassMorphicCardTitle,
  GlassMorphicCardDescription,
  GlassMorphicCardContent,
  GlassMorphicCardFooter,
};

export default GlassMorphicCard;
