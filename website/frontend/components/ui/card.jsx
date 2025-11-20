import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, animated = false, accentColor, ...props }, ref) => {
  const CardComponent = animated ? motion.div : 'div';
  const animationProps = animated ? {
    whileHover: { scale: 1.02, y: -4 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={cn(
        // Base styling - no borders, clean glass morphism
        "rounded-xl bg-white text-crm-text-primary overflow-hidden relative",
        "dark:bg-gradient-to-br dark:from-[#1a1d24] dark:to-[#15171d] dark:text-white",

        // Light mode - subtle shadows
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),_0_1px_2px_rgba(0,0,0,0.02)]",
        "hover:shadow-[0_8px_24px_rgba(123,28,20,0.08),_0_4px_8px_rgba(123,28,20,0.04)]",

        // Dark mode - dramatic glow effects
        "dark:shadow-[0_4px_16px_rgba(0,0,0,0.4),_0_2px_4px_rgba(0,0,0,0.3)]",
        "dark:hover:shadow-[0_8px_32px_rgba(212,70,60,0.15),_0_4px_16px_rgba(0,0,0,0.5)]",

        // Glass morphism backdrop
        "dark:backdrop-blur-xl dark:bg-opacity-80",

        // Smooth transitions
        "transition-all duration-300 ease-out",

        // Subtle border for depth (only in light mode)
        "border border-gray-100/50 dark:border-white/5",

        // Accent color support
        accentColor && `border-l-4 border-l-${accentColor}`,
        className
      )}
      {...animationProps}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-lg", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-300", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };