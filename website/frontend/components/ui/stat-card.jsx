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
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'group-hover:bg-blue-200'
    },
    green: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'group-hover:bg-emerald-200'
    },
    yellow: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200',
      hover: 'group-hover:bg-amber-200'
    },
    accent: {
      bg: 'bg-[#7b1c14]/10',
      text: 'text-[#7b1c14]',
      border: 'border-[#7b1c14]/20',
      hover: 'group-hover:bg-[#7b1c14]/15'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'group-hover:bg-gray-200'
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
        "bg-white rounded-xl p-6 border border-gray-200",
        "hover:shadow-lg hover:border-gray-300",
        "transition-all duration-300 group",
        className
      )}
      {...animationProps}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          "text-3xl font-bold text-gray-900 transition-colors duration-300",
          color === 'accent' && "group-hover:text-[#7b1c14]"
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
