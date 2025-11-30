import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(
  ({ className, animated = false, accentColor, ...props }, ref) => {
    const CardComponent = animated ? motion.div : "div";
    const animationProps = animated
      ? {
          whileHover: { scale: 1.02, y: -2 },
          transition: { type: "spring", stiffness: 400, damping: 17 },
        }
      : {};

    return (
      <CardComponent
        ref={ref}
        className={cn(
          // Apple-inspired glass morphism
          "card-crm-premium text-neutral-900 overflow-hidden relative",
          "dark:bg-neutral-900/80 dark:text-neutral-100 dark:border-neutral-700/50",

          // Smooth transitions
          "transition-all duration-300 ease-out",

          // Accent color support
          accentColor && `border-l-4 border-l-${accentColor}`,
          className,
        )}
        {...animationProps}
        {...props}
      />
    );
  },
);
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
    className={cn(
      "text-title font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-body text-neutral-600 dark:text-neutral-400",
      className,
    )}
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

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
