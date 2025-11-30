/**
 * Account Status Hook
 *
 * Manages account status, grace periods, and payment wall logic
 */

import { useState, useEffect } from "react";
import { useAgency } from "./useAgency";

export const ACCOUNT_STATUSES = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  UNPAID: "unpaid",
};

export const useAccountStatus = () => {
  const { subscription, subscriptionLoading } = useAgency();
  const [daysPastDue, setDaysPastDue] = useState(0);

  useEffect(() => {
    if (subscription?.current_period_end) {
      const calculateDaysPastDue = () => {
        const now = new Date();
        const endDate = new Date(subscription.current_period_end);
        const days = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
        setDaysPastDue(Math.max(0, days));
      };

      calculateDaysPastDue();
      const interval = setInterval(calculateDaysPastDue, 1000 * 60 * 60); // Update hourly
      return () => clearInterval(interval);
    }
  }, [subscription?.current_period_end]);

  const getStatus = () => {
    if (!subscription) return ACCOUNT_STATUSES.UNPAID;
    return subscription.status;
  };

  const isInGracePeriod = () => {
    const status = getStatus();
    return status === "past_due" && daysPastDue <= 7;
  };

  const needsPaymentWall = () => {
    const status = getStatus();
    return (
      ["canceled", "unpaid"].includes(status) ||
      (status === "past_due" && daysPastDue > 7)
    );
  };

  const shouldShowWarning = () => {
    const status = getStatus();
    return status === "past_due";
  };

  const getGracePeriodDaysRemaining = () => {
    if (!isInGracePeriod()) return 0;
    return Math.max(0, 7 - daysPastDue);
  };

  const getWarningLevel = () => {
    if (needsPaymentWall()) return "critical";
    if (daysPastDue >= 5) return "urgent";
    if (daysPastDue >= 3) return "warning";
    if (shouldShowWarning()) return "info";
    return "none";
  };

  return {
    subscription,
    subscriptionLoading,
    getStatus,
    daysPastDue,
    isInGracePeriod,
    needsPaymentWall,
    shouldShowWarning,
    getGracePeriodDaysRemaining,
    getWarningLevel,
  };
};
