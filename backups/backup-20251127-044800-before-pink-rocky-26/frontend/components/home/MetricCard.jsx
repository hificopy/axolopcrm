import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  delay = 0,
  subtitle,
  additionalInfo,
}) {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      lightBg: "bg-blue-50 dark:bg-blue-950/30",
      ring: "ring-blue-500/20",
      glow: "shadow-blue-500/20",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      text: "text-emerald-600 dark:text-emerald-400",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
      ring: "ring-emerald-500/20",
      glow: "shadow-emerald-500/20",
    },
    yellow: {
      bg: "bg-gradient-to-br from-amber-500 to-amber-600",
      text: "text-amber-600 dark:text-amber-400",
      lightBg: "bg-amber-50 dark:bg-amber-950/30",
      ring: "ring-amber-500/20",
      glow: "shadow-amber-500/20",
    },
    accent: {
      bg: "bg-gradient-to-br from-[#761B14] to-[#5C2222]",
      text: "text-[#761B14] dark:text-[#761B14]",
      lightBg: "bg-red-50 dark:bg-red-950/30",
      ring: "ring-[#761B14]/20",
      glow: "shadow-[#761B14]/20",
    },
    gray: {
      bg: "bg-gradient-to-br from-gray-600 to-gray-700",
      text: "text-gray-600 dark:text-gray-400",
      lightBg: "bg-gray-50 dark:bg-gray-950/30",
      ring: "ring-gray-500/20",
      glow: "shadow-gray-500/20",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const isPositiveTrend = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full w-full"
    >
      <Card
        className={`h-full w-full overflow-hidden hover:${colors.ring} transition-all duration-300 hover:shadow-xl hover:${colors.glow} relative group`}
      >
        {/* Animated background gradient on hover */}
        <div
          className={`absolute inset-0 ${colors.lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-lg font-medium text-crm-text-secondary uppercase tracking-wide truncate">
                  {title}
                </CardTitle>
              </div>
            </div>
            {/* Icon Badge - Top right in header */}
            <motion.div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md ${colors.bg} flex items-center justify-center flex-shrink-0 shadow-lg`}
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-center relative z-10 pt-0">
          {/* Main Value - Centered and Prominent */}
          <div className="flex-1 flex items-center justify-center my-4">
            <motion.p
              className="text-5xl font-bold text-neutral-900 dark:text-white tracking-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
            >
              {value}
            </motion.p>
          </div>

          {/* Trend Indicator */}
          {trendValue && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={`flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${
                isPositiveTrend
                  ? "bg-[#1A777B]/10 text-[#1A777B]"
                  : "bg-[#CA4238]/10 text-[#CA4238]"
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trendValue}</span>
              <Sparkles className="h-3 w-3 opacity-60" />
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && !trendValue && (
            <div className="text-center">
              <p className="text-sm text-crm-text-secondary">{subtitle}</p>
            </div>
          )}

          {/* Additional Info - Compact at bottom */}
          {additionalInfo && additionalInfo.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
              className="mt-4 pt-4 border-t border-crm-border/50 space-y-2"
            >
              {additionalInfo.slice(0, 2).map((info, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-crm-text-secondary font-medium">
                    {info.label}
                  </span>
                  <span className={`font-bold ${colors.text}`}>
                    {info.value}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>

        {/* Decorative corner accent */}
        <div
          className={`absolute bottom-0 left-0 w-20 h-20 ${colors.bg} opacity-10 blur-2xl rounded-full -mb-10 -ml-10`}
        />
      </Card>
    </motion.div>
  );
}
