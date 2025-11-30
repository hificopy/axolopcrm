import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createFeatureCardHover } from "@/lib/apple-animations";

/**
 * AppleFeatureCard - Feature card with subtle hover lift
 */
const AppleFeatureCard = ({ children, className, hover = true, ...props }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (hover && cardRef.current) {
      const cleanup = createFeatureCardHover(cardRef.current);
      return cleanup;
    }
  }, [hover]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative p-6 rounded-2xl",
        "backdrop-blur-sm bg-white/[0.02]",
        "border border-gray-800/30",
        "transition-all duration-300",
        "hover:border-gray-700/50",
        hover && "cursor-pointer",
        className,
      )}
      data-feature-card
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AppleFeatureCard;
