/**
 * TrialBanner Component
 *
 * Displays trial status with countdown, upgrade CTA, and dismissible option.
 * Shows contextually based on trial days remaining.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { localStorageGet, localStorageSet, localStorageRemove } from '../../utils/safeStorage';
import { cn } from '../../lib/utils';

export default function TrialBanner({ className }) {
  const navigate = useNavigate();
  const { currentAgency, subscription } = useAgency();
  const [dismissed, setDismissed] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);

  // Calculate days remaining in trial
  useEffect(() => {
    if (!subscription?.trial_end) {
      setDaysLeft(null);
      return;
    }

    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysLeft(Math.max(0, diffDays));
  }, [subscription?.trial_end]);

  // Check localStorage for dismissed state (per agency)
  useEffect(() => {
    if (!currentAgency?.id) return;

    const dismissedKey = `trial_banner_dismissed_${currentAgency.id}`;
    const dismissedUntil = localStorageGet(dismissedKey);

    if (dismissedUntil) {
      const until = new Date(dismissedUntil);
      if (until > new Date()) {
        setDismissed(true);
      } else {
        localStorageRemove(dismissedKey);
      }
    }
  }, [currentAgency?.id]);

  // Don't show if not on trial or dismissed
  if (!subscription?.status || subscription.status !== 'trialing') {
    return null;
  }

  if (dismissed || daysLeft === null) {
    return null;
  }

  const handleDismiss = () => {
    if (!currentAgency?.id) return;

    // Dismiss for 24 hours (or until next session if urgent)
    const dismissedKey = `trial_banner_dismissed_${currentAgency.id}`;
    const dismissDuration = daysLeft <= 3 ? 4 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 4 hours if urgent, else 24 hours
    const until = new Date(Date.now() + dismissDuration);
    localStorageSet(dismissedKey, until.toISOString());
    setDismissed(true);
  };

  const handleUpgrade = () => {
    navigate('/settings/billing');
  };

  // Determine urgency level
  const isUrgent = daysLeft <= 3;
  const isCritical = daysLeft <= 1;
  const tierName = subscription?.tier_display_name || 'Trial';

  return (
    <div
      className={cn(
        'relative flex items-center justify-between px-4 py-2.5 text-sm transition-all',
        isCritical
          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
          : isUrgent
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
          : 'bg-gradient-to-r from-[#4A1515] to-[#6B2020] text-white',
        className
      )}
    >
      {/* Left: Trial info */}
      <div className="flex items-center gap-3">
        {isCritical ? (
          <AlertTriangle className="h-4 w-4 animate-pulse" />
        ) : isUrgent ? (
          <Clock className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}

        <span className="font-medium">
          {isCritical ? (
            <>Trial ends today! Your card will be charged for {tierName}.</>
          ) : isUrgent ? (
            <>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your {tierName} trial</>
          ) : (
            <>{daysLeft} days remaining in your free trial</>
          )}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleUpgrade}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all',
            isCritical
              ? 'bg-white text-red-600 hover:bg-red-50'
              : isUrgent
              ? 'bg-white text-amber-600 hover:bg-amber-50'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
          )}
        >
          {isCritical ? 'Manage Subscription' : 'View Plans'}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        {!isCritical && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact trial indicator for sidebar/header
 */
export function TrialIndicator({ className }) {
  const { subscription } = useAgency();
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (!subscription?.trial_end) {
      setDaysLeft(null);
      return;
    }

    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysLeft(Math.max(0, diffDays));
  }, [subscription?.trial_end]);

  if (!subscription?.status || subscription.status !== 'trialing' || daysLeft === null) {
    return null;
  }

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        isUrgent
          ? 'bg-amber-100 text-amber-700'
          : 'bg-[#4A1515]/10 text-[#4A1515]',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      {daysLeft}d left
    </div>
  );
}

/**
 * Trial status card for settings/billing page
 */
export function TrialStatusCard({ className }) {
  const navigate = useNavigate();
  const { subscription } = useAgency();
  const [daysLeft, setDaysLeft] = useState(null);
  const [hoursLeft, setHoursLeft] = useState(null);

  useEffect(() => {
    if (!subscription?.trial_end) {
      setDaysLeft(null);
      setHoursLeft(null);
      return;
    }

    const updateTime = () => {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const diffTime = trialEnd - now;

      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setDaysLeft(Math.max(0, days));
      setHoursLeft(Math.max(0, hours));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription?.trial_end]);

  if (!subscription?.status || subscription.status !== 'trialing') {
    return null;
  }

  const tierName = subscription?.tier_display_name || 'Trial';
  const isUrgent = daysLeft <= 3;
  const isCritical = daysLeft <= 1;

  return (
    <div
      className={cn(
        'rounded-lg border p-6',
        isCritical
          ? 'border-red-200 bg-red-50'
          : isUrgent
          ? 'border-amber-200 bg-amber-50'
          : 'border-[#4A1515]/20 bg-[#4A1515]/5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isCritical ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : isUrgent ? (
              <Clock className="h-5 w-5 text-amber-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-[#4A1515]" />
            )}
            <h3 className={cn(
              'font-semibold',
              isCritical ? 'text-red-900' : isUrgent ? 'text-amber-900' : 'text-[#4A1515]'
            )}>
              {tierName} Trial
            </h3>
          </div>

          <p className={cn(
            'text-sm mb-4',
            isCritical ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-[#4A1515]/70'
          )}>
            {isCritical ? (
              <>Your trial ends in {hoursLeft} hours. Your card will be automatically charged.</>
            ) : isUrgent ? (
              <>{daysLeft} day{daysLeft !== 1 ? 's' : ''} and {hoursLeft} hours remaining</>
            ) : (
              <>You have {daysLeft} days left to explore all features</>
            )}
          </p>

          {/* Trial progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  isCritical
                    ? 'bg-red-500'
                    : isUrgent
                    ? 'bg-amber-500'
                    : 'bg-[#4A1515]'
                )}
                style={{ width: `${Math.max(0, Math.min(100, ((14 - daysLeft) / 14) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Day {14 - daysLeft} of 14
            </p>
          </div>
        </div>

        {/* Countdown display */}
        <div className={cn(
          'text-right px-4 py-2 rounded-lg',
          isCritical ? 'bg-red-100' : isUrgent ? 'bg-amber-100' : 'bg-white'
        )}>
          <div className={cn(
            'text-3xl font-bold',
            isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-[#4A1515]'
          )}>
            {daysLeft}
          </div>
          <div className="text-xs text-gray-500">days left</div>
        </div>
      </div>

      {/* What happens next */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            Your card will be charged ${subscription?.price_monthly || '0'}/month
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            You can cancel anytime before trial ends
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            All your data will be preserved
          </li>
        </ul>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate('/settings/billing')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
            isCritical
              ? 'bg-red-600 text-white hover:bg-red-700'
              : isUrgent
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-[#4A1515] text-white hover:bg-[#5A2525]'
          )}
        >
          Manage Subscription
        </button>
        <button
          onClick={() => navigate('/pricing')}
          className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Compare Plans
        </button>
      </div>
    </div>
  );
}
