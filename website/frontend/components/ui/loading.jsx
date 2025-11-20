import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Premium Logo Loader
export const LogoLoader = ({ size = 'default', className }) => {
  const sizes = {
    sm: 'h-12 w-12',
    default: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative transform-gpu">
        {/* Animated Ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-[#7b1c14] via-[#a03a2e] to-[#7b1c14]"
          )}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            filter: 'blur(20px)',
            opacity: 0.6,
            transform: 'translateZ(0)' // Enable hardware acceleration
          }}
        />

        {/* Logo Container */}
        <motion.div
          className={cn(
            sizes[size],
            "relative rounded-full bg-white flex items-center justify-center",
            "shadow-2xl border-4 border-white"
          )}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          // Performance optimization
          style={{ transform: 'translateZ(0)' }}
        >
          <img
            src="/axolop-logo.png"
            alt="Loading"
            className="h-3/4 w-3/4 object-contain will-change-transform"
          />
        </motion.div>
      </div>
    </div>
  );
};

// Spinner Loader
export const Spinner = ({ size = 'default', className }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-gray-200 border-t-[#7b1c14]",
        sizes[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{ transform: 'translateZ(0)' }} // Enable hardware acceleration
    />
  );
};

// Dots Loader
export const DotsLoader = ({ className }) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-3 w-3 rounded-full bg-[#7b1c14]"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15
          }}
        />
      ))}
    </div>
  );
};

// Full Page Loader
export const FullPageLoader = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-[#0d0f12]/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <LogoLoader size="lg" />
        {message && (
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Skeleton Loader
export const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      className={cn(
        "rounded-lg bg-gray-200",
        className
      )}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    />
  );
};
