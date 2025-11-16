import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    red: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    // Premium Accent Variants
    accent: 'bg-[#7b1c14]/10 text-[#7b1c14] border-[#7b1c14]/20 hover:bg-[#7b1c14]/15 font-semibold',
    'accent-solid': 'bg-[#7b1c14] text-white border-[#7b1c14] hover:bg-[#6b1a12] shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
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
