import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Megaphone, Building2, Briefcase, ArrowRight } from "lucide-react";

/**
 * Use case data - Industry-specific solutions
 */
const USE_CASES = [
  {
    id: "marketing-agencies",
    industry: "Digital Marketing Agencies",
    icon: Megaphone,
    challenge:
      "Juggling 10+ tools with inconsistent data and high monthly costs",
    solution:
      "One unified platform for client management, campaigns, and reporting",
    result: "Save 15+ hours/week",
    resultDetail: "and reduce tool costs by $1,375/month",
    color: "red",
    stats: [
      { value: "15+", label: "Hours saved weekly" },
      { value: "$1,375", label: "Monthly savings" },
      { value: "40%", label: "Faster reporting" },
    ],
  },
  {
    id: "real-estate",
    industry: "Real Estate Teams",
    icon: Building2,
    challenge: "Lost leads and missed follow-ups across multiple platforms",
    solution: "AI-powered lead scoring and automated nurture sequences",
    result: "40% increase in conversion",
    resultDetail: "with automated lead qualification",
    color: "teal",
    stats: [
      { value: "40%", label: "Higher conversion" },
      { value: "2x", label: "Lead response speed" },
      { value: "0", label: "Leads left behind" },
    ],
  },
  {
    id: "b2b-sales",
    industry: "B2B Sales Teams",
    icon: Briefcase,
    challenge:
      "Slow sales cycles and manual data entry eating into selling time",
    solution: "Intelligent pipeline with AI assistant and automation",
    result: "2x faster deal closure",
    resultDetail: "with AI-powered deal insights",
    color: "amber",
    stats: [
      { value: "2x", label: "Faster closing" },
      { value: "85%", label: "Less data entry" },
      { value: "30%", label: "Revenue increase" },
    ],
  },
];

const colorStyles = {
  red: {
    gradient: "from-[#CA4238]/20 to-[#761B14]/10",
    border: "border-[#CA4238]/30",
    iconBg: "bg-[#CA4238]/20",
    iconText: "text-[#CA4238]",
    badgeBg: "bg-[#CA4238]/20",
    badgeText: "text-[#CA4238]",
  },
  teal: {
    gradient: "from-[#14787b]/20 to-[#1fb5b9]/10",
    border: "border-[#14787b]/30",
    iconBg: "bg-[#14787b]/20",
    iconText: "text-[#1fb5b9]",
    badgeBg: "bg-[#14787b]/20",
    badgeText: "text-[#1fb5b9]",
  },
  amber: {
    gradient: "from-amber-500/20 to-yellow-500/10",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-400",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-400",
  },
};

/**
 * OptimizedUseCaseCard - Individual use case card with performance optimizations
 */
const OptimizedUseCaseCard = ({ useCase, UseCaseIcon, styles, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
    amount: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.1, 0.2), // Reduced and capped delay
        ease: "easeOut",
      }}
      className={cn(
        "group relative p-6 rounded-3xl",
        "backdrop-blur-sm",
        "bg-gradient-to-br",
        styles.gradient,
        "border",
        styles.border,
        "hover:border-opacity-60 transition-all duration-300",
        "will-change-transform",
      )}
    >
      {/* Icon & Industry */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            styles.iconBg,
          )}
        >
          <UseCaseIcon className={cn("w-6 h-6", styles.iconText)} />
        </div>
        <h3 className="text-lg font-semibold text-white">{useCase.industry}</h3>
      </div>

      {/* Challenge */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Challenge
        </p>
        <p className="text-gray-400 text-sm">{useCase.challenge}</p>
      </div>

      {/* Solution */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Solution
        </p>
        <p className="text-gray-300 text-sm">{useCase.solution}</p>
      </div>

      {/* Result */}
      <div className={cn("p-4 rounded-xl mb-4", styles.iconBg)}>
        <p className="text-2xl font-bold text-white mb-1">{useCase.result}</p>
        <p className="text-sm text-gray-400">{useCase.resultDetail}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {useCase.stats.map((stat, i) => (
          <div key={i} className="text-center">
            <p className={cn("text-lg font-bold", styles.iconText)}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/**
 * UseCaseSection - Performance-optimized industry-specific use case demonstrations
 */
const UseCaseSection = ({ className }) => {
  return (
    <section
      className={cn(
        "relative py-20 md:py-28 overflow-hidden",
        "bg-black",
        className,
      )}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Results in All Business-Critical Areas
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See how agencies like yours are transforming their operations and
            boosting their bottom line with Axolop
          </p>
        </motion.div>

        {/* Use cases grid with optimized animations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {USE_CASES.map((useCase, index) => {
            const UseCaseIcon = useCase.icon;
            const styles = colorStyles[useCase.color];

            return (
              <OptimizedUseCaseCard
                key={useCase.id}
                useCase={useCase}
                UseCaseIcon={UseCaseIcon}
                styles={styles}
                index={index}
              />
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Link
            to="/use-cases/marketing-agencies"
            className="inline-flex items-center gap-2 text-[#1fb5b9] hover:text-white transition-colors font-medium"
          >
            <span>See all use cases</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCaseSection;
