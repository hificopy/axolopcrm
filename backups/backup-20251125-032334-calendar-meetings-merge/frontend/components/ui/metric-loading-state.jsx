import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

/**
 * MetricLoadingState - Component for displaying sync issues in metrics
 * Shows "..." animation to indicate data sync problems (different from $0 or regular loading)
 */
export default function MetricLoadingState({
  size = "text-xl",
  showIcon = false,
  className = "",
  tooltip = "Syncing data...",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-500/20"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

      <motion.span
        className={`${size} font-medium text-amber-600 dark:text-amber-400`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.span>

      {tooltip && (
        <div className="absolute hidden group-hover:block z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap">
          {tooltip}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

/**
 * MetricSyncStatus - Small indicator showing sync status
 */
export function MetricSyncStatus({
  status = "synced", // 'synced', 'syncing', 'error'
  lastUpdated = null,
  className = "",
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "syncing":
        return {
          color: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          icon: AlertCircle,
          text: "Syncing...",
          animate: true,
        };
      case "error":
        return {
          color: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          icon: AlertCircle,
          text: "Sync Error",
          animate: false,
        };
      default:
        return {
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          icon: null,
          text: lastUpdated ? `Updated ${formatTimeAgo(lastUpdated)}` : "Live",
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.borderColor} border ${className}`}
    >
      {Icon && (
        <Icon
          className={`h-3 w-3 ${config.color} ${config.animate ? "animate-pulse" : ""}`}
        />
      )}
      <span className={config.color}>{config.text}</span>
    </div>
  );
}

/**
 * Data Freshness Indicator Component
 */
export function DataFreshnessIndicator({
  lastUpdated,
  className = "",
  showLabel = true,
}) {
  if (!lastUpdated) return null;

  const timeAgo = formatTimeAgo(lastUpdated);
  const isFresh = isDataFresh(lastUpdated);

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isFresh ? "bg-green-500" : "bg-amber-500"
        } ${isFresh ? "" : "animate-pulse"}`}
      />
      {showLabel && (
        <span
          className={`font-medium ${
            isFresh
              ? "text-green-700 dark:text-green-300"
              : "text-amber-700 dark:text-amber-300"
          }`}
        >
          {timeAgo}
        </span>
      )}
    </div>
  );
}

/**
 * Checks if data is considered fresh
 */
function isDataFresh(timestamp) {
  if (!timestamp) return false;

  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  // Data is fresh if less than 5 minutes old
  return diffMins < 5;
}

/**
 * Helper function to format time ago
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";

  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
