import * as React from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Export variants for use in other components
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white dark:ring-offset-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#791C14] dark:focus-visible:ring-[#d4463c] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-[#791C14] text-white hover:bg-[#6b1a12] active:bg-[#5a1810] shadow-lg hover:shadow-xl hover:shadow-red-900/40 transition-all duration-200 font-semibold',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 hover:shadow-md transition-all duration-200',
        success: 'bg-primary-green text-white hover:bg-green-600 active:bg-green-700 shadow-md hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200',
        destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200',
        accent: 'bg-[#791C14] text-white hover:bg-[#6b1a12] active:bg-[#5a1810] shadow-lg hover:shadow-xl hover:shadow-red-900/40 transition-all duration-200 font-semibold',
        'accent-subtle': 'bg-[#791C14]/10 text-[#791C14] hover:bg-[#791C14]/20 border border-[#791C14]/30 hover:border-[#791C14]/50 transition-all duration-200',
        'accent-gradient': 'bg-gradient-to-r from-[#101010] via-[#791C14] to-[#101010] text-white hover:shadow-2xl hover:shadow-red-900/50 transition-all duration-300 font-semibold',
        blue: 'bg-primary-blue text-white hover:bg-blue-600 active:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200',
        outline: 'border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm dark:bg-[#1a1d24] dark:border-gray-700 dark:hover:bg-[#2C3440] dark:hover:border-gray-600 dark:text-white transition-all duration-200',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2C3440] dark:hover:text-white dark:text-white transition-all duration-150',
        link: 'text-[#791C14] underline-offset-4 hover:underline transition-all duration-150',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-lg',
        sm: 'h-9 px-3 rounded-lg text-xs',
        lg: 'h-12 px-8 rounded-lg text-base',
        icon: 'h-10 w-10 rounded-lg',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    }
  }
);

const Button = React.forwardRef(({ className, variant, size, animated = true, disabled, ...props }, ref) => {

  const ButtonComponent = animated ? motion.button : 'button';
  const animationProps = animated ? {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
      // Faster transitions for better responsiveness
      duration: 0.15
    }
  } : {};

  return (
    <ButtonComponent
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled}
      {...animationProps}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
