import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createMagneticButton } from "@/lib/apple-animations";

/**
 * AppleButton - Premium button with subtle magnetic effect
 */
const AppleButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  magnetic = true,
  ...props
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (magnetic && buttonRef.current) {
      const cleanup = createMagneticButton(buttonRef.current, {
        strength: 0.15,
      });
      return cleanup;
    }
  }, [magnetic]);

  const variants = {
    primary:
      "bg-gradient-to-r from-[#761B14] to-[#5C2222] text-white hover:from-[#5C2222] hover:to-[#761B14]",
    secondary:
      "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20",
    outline:
      "bg-transparent text-white border border-white/30 hover:bg-white/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative inline-flex items-center justify-center",
        "font-medium rounded-xl transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-[#761B14]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AppleButton;
