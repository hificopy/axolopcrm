import * as React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary-blue text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    success: 'bg-primary-green text-white hover:bg-green-600 active:bg-green-700',
    destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    outline: 'border border-crm-border bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    link: 'text-primary-blue underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 rounded-md',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
