import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
    blue: 'bg-[#3F0D28]/10 dark:bg-[#3F0D28]/20 text-[#3F0D28] dark:text-gray-100 border-[#3F0D28]/20 dark:border-[#3F0D28]/40 hover:bg-[#3F0D28]/15 dark:hover:bg-[#3F0D28]/30',
    green: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900',
    yellow: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900',
    red: 'bg-[#3F0D28]/10 dark:bg-[#3F0D28]/20 text-[#3F0D28] dark:text-gray-100 border-[#3F0D28]/20 dark:border-[#3F0D28]/40 hover:bg-[#3F0D28]/15 dark:hover:bg-[#3F0D28]/30',
    // Premium Accent Variants
    accent: 'bg-[#3F0D28]/10 dark:bg-[#3F0D28]/20 text-[#3F0D28] dark:text-gray-100 border-[#3F0D28]/20 dark:border-[#3F0D28]/40 hover:bg-[#3F0D28]/15 dark:hover:bg-[#3F0D28]/30 font-semibold',
    'accent-solid': 'bg-[#3F0D28] dark:bg-[#3D1212] text-white border-[#3F0D28] dark:border-[#3D1212] hover:bg-[#3D1212] dark:hover:bg-[#2F0F0F] shadow-sm',
    success: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900',
    warning: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900',
    danger: 'bg-[#3F0D28]/10 dark:bg-[#3F0D28]/20 text-[#3F0D28] dark:text-gray-100 border-[#3F0D28]/20 dark:border-[#3F0D28]/40 hover:bg-[#3F0D28]/15 dark:hover:bg-[#3F0D28]/30',
    info: 'bg-[#3F0D28]/10 dark:bg-[#3F0D28]/20 text-[#3F0D28] dark:text-gray-100 border-[#3F0D28]/20 dark:border-[#3F0D28]/40 hover:bg-[#3F0D28]/15 dark:hover:bg-[#3F0D28]/30',
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
