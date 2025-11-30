/**
 * Usage Warning Component
 *
 * Shows warnings when approaching or at feature limits
 */

import { AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function UsageWarning({
  feature,
  current,
  limit,
  showUpgradePrompt = true,
  compact = false,
}) {
  const percentage = limit ? (current / limit) * 100 : 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isLimit = percentage >= 100;
  const isNearLimit = percentage >= 90 && percentage < 100;

  if (!isWarning && !isLimit) return null;

  const getWarningStyles = () => {
    if (isLimit) {
      return {
        container: "bg-red-50 border-red-200",
        icon: "text-red-600",
        title: "text-red-900",
        description: "text-red-700",
        button: "bg-red-600 text-white hover:bg-red-700",
      };
    } else if (isNearLimit) {
      return {
        container: "bg-orange-50 border-orange-200",
        icon: "text-orange-600",
        title: "text-orange-900",
        description: "text-orange-700",
        button: "bg-orange-600 text-white hover:bg-orange-700",
      };
    } else {
      return {
        container: "bg-amber-50 border-amber-200",
        icon: "text-amber-600",
        title: "text-amber-900",
        description: "text-amber-700",
        button: "bg-blue-600 text-white hover:bg-blue-700",
      };
    }
  };

  const styles = getWarningStyles();

  if (compact) {
    return (
      <div className={cn("p-3 rounded-lg border", styles.container)}>
        <div className="flex items-center gap-2">
          {isLimit ? (
            <XCircle className={cn("h-4 w-4 flex-shrink-0", styles.icon)} />
          ) : (
            <AlertTriangle
              className={cn("h-4 w-4 flex-shrink-0", styles.icon)}
            />
          )}
          <span className={cn("text-sm font-medium", styles.title)}>
            {isLimit ? "Limit Reached" : "Approaching Limit"}
          </span>
          <span
            className={cn("text-xs px-2 py-0.5 rounded-full", styles.button)}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-lg border", styles.container)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isLimit ? (
            <XCircle className={cn("h-5 w-5", styles.icon)} />
          ) : (
            <AlertTriangle className={cn("h-5 w-5", styles.icon)} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn("font-medium mb-1", styles.title)}>
            {isLimit ? "Limit Reached" : "Approaching Limit"}
          </h4>

          <p className={cn("text-sm mb-3", styles.description)}>
            You've used {current.toLocaleString()} of{" "}
            {limit === 999999 ? "unlimited" : limit.toLocaleString()} {feature}
            {limit !== 999999 && ` (${percentage.toFixed(0)}%)`}.
            {isLimit
              ? ` Upgrade your plan to continue using ${feature}.`
              : ` Consider upgrading soon to avoid interruption.`}
          </p>

          {/* Progress bar */}
          {limit !== 999999 && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    isLimit
                      ? "bg-red-600"
                      : isNearLimit
                        ? "bg-orange-600"
                        : "bg-amber-600",
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Usage trend */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <TrendingUp className="h-3 w-3" />
            <span>
              {isLimit
                ? `Cannot add more ${feature} until upgrade`
                : `${(limit - current).toLocaleString()} ${feature} remaining`}
            </span>
          </div>

          {/* Action buttons */}
          {showUpgradePrompt && (
            <div className="flex gap-2">
              <Link
                to="/app/settings/billing"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                  styles.button,
                )}
              >
                {isLimit ? "Upgrade Now" : "Upgrade Plan"}
              </Link>

              {!isLimit && (
                <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for inline usage
export function CompactUsageWarning({ feature, current, limit }) {
  return (
    <UsageWarning
      feature={feature}
      current={current}
      limit={limit}
      compact={true}
    />
  );
}

// Inline version for forms and other components
export function InlineUsageWarning({ current, limit, className }) {
  const percentage = limit ? (current / limit) * 100 : 0;
  const isWarning = percentage >= 80;

  if (!isWarning) return null;

  return (
    <div
      className={cn(
        "text-xs p-2 rounded border",
        percentage >= 100
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-amber-50 border-amber-200 text-amber-700",
        className,
      )}
    >
      {percentage >= 100 ? "Limit reached" : `${percentage.toFixed(0)}% used`} •
      <Link to="/app/settings/billing" className="underline ml-1">
        Upgrade plan
      </Link>
    </div>
  );
}
