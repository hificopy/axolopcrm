import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', animated = true, ...props }, ref) => {
  const variants = {
    // DEFAULT NOW USES BRAND ACCENT RED
    default: 'bg-[#7b1c14] text-white hover:bg-[#6b1a12] active:bg-[#5a1810] shadow-lg hover:shadow-xl hover:shadow-red-900/40 transition-all duration-200 font-semibold',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 hover:shadow-md transition-all duration-200',
    success: 'bg-primary-green text-white hover:bg-green-600 active:bg-green-700 shadow-md hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200',
    // BRAND ACCENT VARIANTS (same as default now)
    accent: 'bg-[#7b1c14] text-white hover:bg-[#6b1a12] active:bg-[#5a1810] shadow-lg hover:shadow-xl hover:shadow-red-900/40 transition-all duration-200 font-semibold',
    'accent-subtle': 'bg-[#7b1c14]/10 text-[#7b1c14] hover:bg-[#7b1c14]/20 border border-[#7b1c14]/30 hover:border-[#7b1c14]/50 transition-all duration-200',
    'accent-gradient': 'bg-gradient-to-r from-[#101010] via-[#7b1c14] to-[#101010] text-white hover:shadow-2xl hover:shadow-red-900/50 transition-all duration-300 font-semibold',
    // Sales blue for specific sales actions only
    blue: 'bg-primary-blue text-white hover:bg-blue-600 active:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200',
    outline: 'border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200',
    ghost: 'hover:bg-gray-100 hover:text-gray-900 transition-all duration-150',
    link: 'text-[#7b1c14] underline-offset-4 hover:underline transition-all duration-150',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 rounded-lg',
    sm: 'h-9 px-3 rounded-lg text-xs',
    lg: 'h-12 px-8 rounded-lg text-base',
    icon: 'h-10 w-10 rounded-lg',
  };

  const ButtonComponent = animated ? motion.button : 'button';
  const animationProps = animated ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  } : {};

  return (
    <ButtonComponent
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b1c14] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...animationProps}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
