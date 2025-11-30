import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Tooltip component with 2-second hover delay
 * Appears above the trigger element by default
 */
export function Tooltip({
  children,
  content,
  delay = 2000,
  position = 'top',
  className
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    // Clear any existing timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set timeout to show tooltip after delay
    timeoutRef.current = setTimeout(() => {
      setShouldShow(true);
      // Small delay to ensure DOM is ready before animating
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);
  };

  const handleMouseLeave = () => {
    // Clear the show timeout if user leaves before delay completes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(false);

    // Wait for animation to complete before unmounting
    hoverTimeoutRef.current = setTimeout(() => {
      setShouldShow(false);
    }, 150);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const getPositionClasses = () => {
    const positions = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };
    return positions[position] || positions.top;
  };

  const getArrowClasses = () => {
    const arrows = {
      top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
      left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
      right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
    };
    return arrows[position] || arrows.top;
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}

      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isVisible ? 1 : 0,
              scale: isVisible ? 1 : 0.95
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-[100] pointer-events-none',
              getPositionClasses()
            )}
          >
            <div className={cn(
              'bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap max-w-xs',
              className
            )}>
              {content}
              {/* Arrow */}
              <div
                className={cn(
                  'absolute w-0 h-0 border-4',
                  getArrowClasses()
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Wrapper for button elements with tooltips
 * Usage: <TooltipButton tooltip="Description">Button content</TooltipButton>
 */
export function TooltipButton({
  children,
  tooltip,
  delay = 2000,
  position = 'bottom',
  className,
  ...props
}) {
  return (
    <Tooltip content={tooltip} delay={delay} position={position}>
      <button className={className} {...props}>
        {children}
      </button>
    </Tooltip>
  );
}
