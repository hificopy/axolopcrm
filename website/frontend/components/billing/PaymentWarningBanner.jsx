/**
 * Payment Warning Banner
 *
 * Red banner shown in header when payment is missed
 */

import { Link } from "react-router-dom";
import { AlertCircle, Clock } from "lucide-react";
import { useAccountStatus } from "../../hooks/useAccountStatus";

export default function PaymentWarningBanner() {
  const { isInGracePeriod, getGracePeriodDaysRemaining, getWarningLevel } =
    useAccountStatus();

  if (!isInGracePeriod()) return null;

  const daysRemaining = getGracePeriodDaysRemaining();
  const warningLevel = getWarningLevel();

  const getBannerStyles = () => {
    switch (warningLevel) {
      case "urgent":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-orange-600 text-white";
      default:
        return "bg-amber-600 text-white";
    }
  };

  const getWarningText = () => {
    if (daysRemaining <= 1) {
      return "Payment missed! Update payment method immediately to avoid losing access.";
    } else if (daysRemaining <= 3) {
      return `Payment missed! Please update your payment method within ${daysRemaining} days.`;
    } else {
      return `Payment missed! Please update your payment method before you lose access.`;
    }
  };

  return (
    <div className={`${getBannerStyles()} px-4 py-3 text-center relative z-50`}>
      <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium text-sm">{getWarningText()}</span>
        <div className="flex items-center gap-2 ml-4">
          <Clock className="h-4 w-4" />
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
          </span>
          <Link
            to="/app/settings/billing"
            className="ml-2 bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Pay Now
          </Link>
        </div>
      </div>
    </div>
  );
}
