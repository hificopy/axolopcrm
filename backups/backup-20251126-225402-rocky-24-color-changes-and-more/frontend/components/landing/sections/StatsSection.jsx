import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

import { animateCounter } from "@/lib/apple-animations";
import { gsap } from "gsap";

/**
 * Stats data - Key metrics that matter to agency owners
 */
const STATS = [
  {
    value: 10,
    suffix: "x",
    label: "Faster Setup",
    sublabel: "vs. traditional CRMs",
    color: "vibrant",
  },
  {
    prefix: "$",
    value: 1375,
    label: "Monthly Savings",
    sublabel: "on average per agency",
    color: "teal",
  },
  {
    value: 94,
    suffix: "%",
    label: "User Satisfaction",
    sublabel: "based on customer surveys",
    color: "amber",
  },
  {
    value: 2,
    suffix: "min",
    label: "Time to Value",
    sublabel: "from signup to first lead",
    color: "default",
  },
];

/**
 * StatsSection - Large impact statistics section
 * Perspective.co inspired design with Apple-style scroll-controlled counters
 */
const StatsSection = ({ className }) => {
  const counterRefs = useRef([]);

  useEffect(() => {
    // Initialize simple counter animations when visible
    counterRefs.current.forEach((ref, index) => {
      if (ref && STATS[index]) {
        const stat = STATS[index];
        const endValue = stat.value;
        const prefix = stat.prefix || "";
        const suffix = stat.suffix || "";

        // Clean up any existing animations
        gsap.killTweensOf(ref);

        // Create quick, sleek counter animation when visible
        animateCounter(ref, endValue, {
          prefix,
          suffix,
          duration: 1.2, // Quick and sleek: 1.2 seconds
        });
      }
    });

    return () => {
      // Cleanup animations
      counterRefs.current.forEach((ref) => {
        if (ref) gsap.killTweensOf(ref);
      });
    };
  }, []);
  return (
    <section
      className={cn(
        "relative py-20 md:py-28 overflow-hidden",
        "bg-black",
        className,
      )}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#761B14]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#14787b]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Results That Speak for Themselves
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join thousands of agency owners who have transformed their
            operations and boosted their profit margins with Axolop
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-12">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={cn(
                "relative p-4 sm:p-6 rounded-xl sm:rounded-2xl",
                "backdrop-blur-sm bg-white/[0.02]",
                "border border-gray-800/30",
                "hover:border-gray-700/50 transition-colors",
              )}
            >
              <div className="text-center">
                <div
                  ref={(el) => (counterRefs.current[index] = el)}
                  className={cn(
                    "text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight tabular-nums text-center",
                    stat.color === "vibrant" && "text-[#CA4238]",
                    stat.color === "teal" &&
                      "text-transparent bg-clip-text bg-gradient-to-r from-[#14787b] to-[#1fb5b9]",
                    stat.color === "amber" &&
                      "text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500",
                    stat.color === "default" && "text-white",
                  )}
                  data-counter={stat.value}
                  data-prefix={stat.prefix || ""}
                  data-suffix={stat.suffix || ""}
                >
                  {/* Animation will set this to start from 0 and count up */}
                </div>
                {stat.label && (
                  <p className="text-sm sm:text-lg md:text-xl font-medium text-white mt-1 sm:mt-2">
                    {stat.label}
                  </p>
                )}
                {stat.sublabel && (
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                    {stat.sublabel}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.p
          className="text-center text-gray-500 mt-12 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Trusted by 6,000+ agencies worldwide
        </motion.p>
      </div>
    </section>
  );
};

export default StatsSection;
