import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * AnimatedCounter - Animates numbers from 0 to target value
 * Triggers animation when element comes into view
 */
const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  decimals = 0,
  className,
  valueClassName,
  prefixClassName,
  suffixClassName,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Parse the numeric value from string (handles values like '$1,375', '10x', '94%')
  const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;

  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (latest) => {
    const rounded = decimals > 0
      ? latest.toFixed(decimals)
      : Math.round(latest);

    // Add thousand separators
    return Number(rounded).toLocaleString();
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      spring.set(numericValue);
    }
  }, [isInView, numericValue, spring]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setDisplayValue(latest);
    });
  }, [display]);

  return (
    <div ref={ref} className={cn('inline-flex items-baseline', className)}>
      {prefix && (
        <span className={cn('text-inherit', prefixClassName)}>
          {prefix}
        </span>
      )}
      <motion.span
        className={cn('tabular-nums', valueClassName)}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {displayValue}
      </motion.span>
      {suffix && (
        <span className={cn('text-inherit', suffixClassName)}>
          {suffix}
        </span>
      )}
    </div>
  );
};

/**
 * StatDisplay - Complete stat display with label and sublabel
 */
const StatDisplay = ({
  value,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  duration = 2,
  decimals = 0,
  className,
  color = 'default', // 'default' | 'red' | 'teal' | 'amber'
}) => {
  const colorClasses = {
    default: 'text-white',
    red: 'text-transparent bg-clip-text bg-gradient-to-r from-[#761B14] to-[#d4463c]',
    teal: 'text-transparent bg-clip-text bg-gradient-to-r from-[#14787b] to-[#1fb5b9]',
    amber: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500',
  };

  return (
    <div className={cn('text-center', className)}>
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={suffix}
        duration={duration}
        decimals={decimals}
        className={cn(
          'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight',
          colorClasses[color]
        )}
      />
      {label && (
        <p className="text-sm sm:text-lg md:text-xl font-medium text-white mt-1 sm:mt-2">
          {label}
        </p>
      )}
      {sublabel && (
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
          {sublabel}
        </p>
      )}
    </div>
  );
};

export { AnimatedCounter, StatDisplay };
export default AnimatedCounter;
