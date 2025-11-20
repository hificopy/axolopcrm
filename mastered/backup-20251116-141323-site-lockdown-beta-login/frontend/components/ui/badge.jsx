import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'badge-gray',
    blue: 'badge-blue',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
  };

  return (
    <span
      className={cn(
        'badge',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
