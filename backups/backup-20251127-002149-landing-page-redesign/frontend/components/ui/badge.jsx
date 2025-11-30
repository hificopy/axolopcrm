import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
    blue: 'bg-[#761B14]/10 dark:bg-[#761B14]/20 text-[#761B14] dark:text-gray-100 border-[#761B14]/20 dark:border-[#761B14]/40 hover:bg-[#761B14]/15 dark:hover:bg-[#761B14]/30',
    green: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900',
    yellow: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900',
    red: 'bg-[#761B14]/10 dark:bg-[#761B14]/20 text-[#761B14] dark:text-gray-100 border-[#761B14]/20 dark:border-[#761B14]/40 hover:bg-[#761B14]/15 dark:hover:bg-[#761B14]/30',
    // Premium Accent Variants
    accent: 'bg-[#4A1515]/10 dark:bg-[#4A1515]/20 text-[#4A1515] dark:text-gray-100 border-[#4A1515]/20 dark:border-[#4A1515]/40 hover:bg-[#4A1515]/15 dark:hover:bg-[#4A1515]/30 font-semibold',
    'accent-solid': 'bg-[#4A1515] dark:bg-[#3D1212] text-white border-[#4A1515] dark:border-[#3D1212] hover:bg-[#3D1212] dark:hover:bg-[#2F0F0F] shadow-sm',
    success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900',
    warning: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900',
    danger: 'bg-[#761B14]/10 dark:bg-[#761B14]/20 text-[#761B14] dark:text-gray-100 border-[#761B14]/20 dark:border-[#761B14]/40 hover:bg-[#761B14]/15 dark:hover:bg-[#761B14]/30',
    info: 'bg-[#761B14]/10 dark:bg-[#761B14]/20 text-[#761B14] dark:text-gray-100 border-[#761B14]/20 dark:border-[#761B14]/40 hover:bg-[#761B14]/15 dark:hover:bg-[#761B14]/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
