import * as React from 'react';
import { cn } from './lib/utils';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900',
        'dark:bg-[#0d0f12] dark:border-gray-700 dark:text-white',
        'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'transition-all duration-200',
        'hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600',
        'focus-visible:outline-none focus-visible:border-[#761B14] focus-visible:ring-2 focus-visible:ring-[#761B14]/20',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-[#0d0f12]',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
