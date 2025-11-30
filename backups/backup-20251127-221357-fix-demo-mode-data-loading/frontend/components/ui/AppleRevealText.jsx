import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { revealText } from "@/lib/apple-animations";

/**
 * AppleRevealText - Smooth text reveal for section headers
 */
const AppleRevealText = ({
  children,
  className,
  delay = 0,
  stagger = 0.1,
  as: Component = "h2",
  ...props
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current && children) {
      revealText(textRef.current, { delay, stagger });
    }
  }, [children, delay, stagger]);

  return (
    <Component
      ref={textRef}
      className={cn("font-bold tracking-tight", className)}
      data-reveal
      {...props}
    >
      {children}
    </Component>
  );
};

export default AppleRevealText;
