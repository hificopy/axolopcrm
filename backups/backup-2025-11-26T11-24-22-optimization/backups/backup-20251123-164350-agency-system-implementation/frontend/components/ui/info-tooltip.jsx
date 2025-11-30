import * as React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { Tooltip } from './tooltip';
import { cn } from '@/lib/utils';

/**
 * InfoTooltip component - displays a small info icon with explanatory tooltip
 * Perfect for adding contextual help next to complex features
 *
 * Usage:
 * <InfoTooltip content="This feature allows you to..." />
 * <InfoTooltip content="Explanation" variant="help" size="sm" />
 */
export function InfoTooltip({
  content,
  variant = 'info', // 'info' or 'help'
  size = 'default', // 'sm', 'default', 'lg'
  position = 'top',
  className,
  iconClassName,
  delay = 1000 // Shorter delay for explicit help icons
}) {
  const Icon = variant === 'help' ? HelpCircle : Info;

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const iconSize = sizeClasses[size] || sizeClasses.default;

  return (
    <Tooltip content={content} delay={delay} position={position}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#7b1c14] focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          className
        )}
        onClick={(e) => e.preventDefault()} // Prevent any form submission
      >
        <Icon className={cn(iconSize, iconClassName)} />
      </button>
    </Tooltip>
  );
}

/**
 * Inline variant - sits inline with text, useful for labels
 * Usage:
 * <label>
 *   Complex Feature <InfoTooltipInline content="This does..." />
 * </label>
 */
export function InfoTooltipInline({ content, delay = 1000, position = 'top' }) {
  return (
    <InfoTooltip
      content={content}
      size="sm"
      delay={delay}
      position={position}
      className="ml-1 -mt-0.5 align-middle"
    />
  );
}
