import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useOptimizedAnimation } from "@/hooks/useAnimationPerformance";

/**
 * Customer logos data
 * Using placeholder text until actual logos are provided
 */
const CUSTOMER_LOGOS = [
  { name: "Wayfair", width: 120 },
  { name: "Deloitte", width: 100 },
  { name: "Pfizer", width: 90 },
  { name: "Adobe", width: 100 },
  { name: "American Airlines", width: 140 },
  { name: "NBC Universal", width: 130 },
  { name: "Mercedes-Benz", width: 130 },
  { name: "Marriott", width: 110 },
  { name: "Radyant", width: 100 },
  { name: "Daimler Truck", width: 120 },
];

/**
 * LogoPlaceholder - Placeholder for customer logos
 * Replace with actual logo images when available
 */
const LogoPlaceholder = ({ name, width }) => (
  <div
    className={cn(
      "flex items-center justify-center",
      "text-gray-500 font-medium text-sm",
      "opacity-50 hover:opacity-100",
      "transition-opacity duration-300",
      "grayscale hover:grayscale-0",
    )}
    style={{ width: `${width}px`, height: "40px" }}
  >
    {name}
  </div>
);

/**
 * CustomerLogosCarousel - Performance-optimized infinite scrolling logo carousel
 * Uses CSS transforms instead of Framer Motion for continuous animation
 */
const CustomerLogosCarousel = ({ className }) => {
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const { addTimer, addListener } = useOptimizedAnimation(
    "CustomerLogosCarousel",
  );

  // Duplicate logos for seamless infinite scroll
  const allLogos = [...CUSTOMER_LOGOS, ...CUSTOMER_LOGOS];

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Calculate total width for seamless loop
    const totalWidth = CUSTOMER_LOGOS.reduce(
      (sum, logo) => sum + logo.width + 48,
      0,
    ); // 48px gap

    // Optimized animation using requestAnimationFrame
    const animate = () => {
      positionRef.current -= 1; // Slower, smoother scroll

      // Reset position for seamless loop
      if (Math.abs(positionRef.current) >= totalWidth) {
        positionRef.current = 0;
      }

      carousel.style.transform = `translateX(${positionRef.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup using optimized hook
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section
      className={cn("relative py-16 overflow-hidden", className)}
      style={{ background: '#0F0510' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-400 text-lg">
            Used daily by more than{" "}
            <span className="text-white font-semibold">6,000</span> small and
            large agencies
          </p>
        </motion.div>

        {/* Logo carousel */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

          {/* Scrolling container with CSS transform */}
          <div className="overflow-hidden">
            <div
              ref={carouselRef}
              className="flex items-center gap-12 will-change-transform"
              style={{ transform: "translateX(0)" }}
            >
              {allLogos.map((logo, index) => (
                <div key={`${logo.name}-${index}`} className="flex-shrink-0">
                  <LogoPlaceholder name={logo.name} width={logo.width} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optional: View all customers link */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="/about"
            className="inline-flex items-center gap-2 text-sm text-[#1fb5b9] hover:text-[#14787b] transition-colors"
          >
            See all customers
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerLogosCarousel;
