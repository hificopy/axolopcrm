import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// Premium Logo Loader (centered for section loads)
export const LogoLoader = ({ size = "default", className }) => {
  const sizes = {
    sm: "h-12 w-12",
    default: "h-20 w-20",
    lg: "h-32 w-32",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[200px]",
        className,
      )}
    >
      <div className="relative transform-gpu">
        {/* Animated Ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-[#3F0D28] via-[#3F0D28] to-[#3F0D28]",
          )}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          style={{
            filter: "blur(20px)",
            opacity: 0.6,
            transform: "translateZ(0)", // Enable hardware acceleration
          }}
        />

        {/* Logo Container */}
        <motion.div
          className={cn(
            sizes[size],
            "relative rounded-full bg-white flex items-center justify-center",
            "shadow-2xl border-4 border-white",
          )}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          // Performance optimization
          style={{ transform: "translateZ(0)" }}
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

// Spinner Loader (centered)
export const Spinner = ({ size = "default", className }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    default: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <motion.div
        className={cn(
          "rounded-full border-gray-200 border-t-[#3F0D28]",
          sizes[size],
          className,
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ transform: "translateZ(0)" }} // Enable hardware acceleration
      />
    </div>
  );
};

// Dots Loader (centered)
export const DotsLoader = ({ className }) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 min-h-[200px] w-full",
        className,
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-3 w-3 rounded-full bg-[#3F0D28]"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

// Full Page Loader with Rotating Logo and Loading Bar
export const FullPageLoader = ({ message }) => {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-white/80 dark:bg-[#0d0f12]/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Rotating Logo - Horizontal Flip */}
        <motion.div
          className="relative h-32 w-32"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          <motion.img
            src="/axolop-logo.png"
            alt="Loading"
            className="h-full w-full object-contain"
            animate={{ rotateY: 360 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
              times: [0, 1],
            }}
            style={{
              backfaceVisibility: "visible",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          />
        </motion.div>

        {/* Loading Bar Container */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          {/* Animated Loading Bar */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#3F0D28] via-[#3F0D28] to-[#3F0D28] rounded-full"
            initial={{ x: "-100%", width: "50%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0,
            }}
            style={{ transform: "translateZ(0)" }}
          />
        </div>

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
      className={cn("rounded-lg bg-gray-200", className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    />
  );
};
