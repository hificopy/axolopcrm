import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const StatCard = React.forwardRef(({
  label,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  trendValue,
  className,
  animated = true,
  ...props
}, ref) => {
  const colorVariants = {
    blue: {
      bg: 'bg-red-100 dark:bg-red-950',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      hover: 'group-hover:bg-red-200 dark:group-hover:bg-red-900'
    },
    green: {
      bg: 'bg-emerald-100 dark:bg-emerald-950',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      hover: 'group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900'
    },
    yellow: {
      bg: 'bg-amber-100 dark:bg-amber-950',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      hover: 'group-hover:bg-amber-200 dark:group-hover:bg-amber-900'
    },
    accent: {
      bg: 'bg-[#761B14]/10 dark:bg-[#761B14]/20',
      text: 'text-[#761B14] dark:text-[#d4463c]',
      border: 'border-[#761B14]/20 dark:border-[#761B14]/40',
      hover: 'group-hover:bg-[#761B14]/15 dark:group-hover:bg-[#761B14]/30'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      hover: 'group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  const CardComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    whileHover: { y: -4 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={cn(
        // No borders, clean glass morphism design
        "bg-white rounded-xl p-6 relative overflow-hidden",
        "dark:bg-gradient-to-br dark:from-[#1a1d24] dark:to-[#15171d]",

        // Light mode shadows
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)]",
        "hover:shadow-[0_8px_24px_rgba(123,28,20,0.08),_0_4px_8px_rgba(123,28,20,0.04)]",

        // Dark mode glow
        "dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
        "dark:hover:shadow-[0_8px_32px_rgba(212,70,60,0.15),_0_4px_16px_rgba(0,0,0,0.5)]",

        // Glass effect
        "dark:backdrop-blur-xl dark:bg-opacity-80",

        // Subtle outline
        "border border-gray-100/50 dark:border-white/5",

        "transition-all duration-300 group",
        className
      )}
      {...animationProps}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {label}
          </p>
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-lg transition-all duration-300",
            colors.bg,
            colors.hover
          )}>
            <Icon className={cn("h-5 w-5", colors.text)} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className={cn(
          "text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300",
          color === 'accent' && "group-hover:text-[#761B14]"
        )}>
          {value}
        </div>

        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          )}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>
    </CardComponent>
  );
});

StatCard.displayName = 'StatCard';

export { StatCard };
