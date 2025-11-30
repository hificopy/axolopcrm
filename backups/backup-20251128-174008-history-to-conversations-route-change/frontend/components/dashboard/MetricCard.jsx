import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MetricLoadingState from "@/components/ui/metric-loading-state";

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
  // New props for sync issue handling
  isLoading = false,
  isReliable = true,
  syncStatus = null,
  showSyncIcon = false,
}) {
  // Standardized color scheme - branded red accents only
  const colors = {
    // Icon badge always uses branded red
    bg: "bg-gradient-to-br from-[#3F0D28] to-[#3F0D28]",
    // Text uses neutral colors for readability
    text: "text-neutral-900 dark:text-neutral-100",
    lightBg: "bg-neutral-50 dark:bg-neutral-950/30",
    ring: "ring-[#3F0D28]/20",
    glow: "shadow-[#3F0D28]/20",
  };
  const isPositiveTrend = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full w-full"
    >
      <Card className="h-full w-full overflow-hidden bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 relative">
        <CardContent className="p-6 h-full flex flex-col justify-center relative z-10">
          {/* Icon Badge - Floating top right */}
          <motion.div
            className={`absolute -top-2 -right-2 w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shadow-lg`}
            whileHover={{ rotate: 12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>

          {/* Title */}
          <div className="mb-4">
            <p className="text-sm font-medium text-crm-text-secondary uppercase tracking-wide">
              {title}
            </p>
          </div>

          {/* Main Value - Centered and Prominent */}
          <div className="flex-1 flex items-center justify-center my-4">
            {isLoading || !isReliable ? (
              <MetricLoadingState
                size="text-5xl"
                showIcon={showSyncIcon}
                className="font-bold tracking-tight"
                tooltip={syncStatus?.message || "Syncing data..."}
              />
            ) : (
              <motion.p
                className={`text-5xl font-bold ${colors.text} tracking-tight`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: "spring" }}
              >
                {value}
              </motion.p>
            )}
          </div>

          {/* Trend Indicator */}
          {trendValue && !isLoading && isReliable && (
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
          {additionalInfo && additionalInfo.length > 0 && !isLoading && (
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
      </Card>
    </motion.div>
  );
}
