/**
 * Feature Guard Component
 *
 * Controls access to features based on subscription tier
 */
import { Link } from "react-router-dom";
import { Lock, Upgrade, Zap } from "lucide-react";
import { useAgency } from "../../hooks/useAgency";
import { cn } from "../../lib/utils";

export default function FeatureGuard({
  feature,
  children,
  fallback = null,
  showUpgradePrompt = true,
  compact = false,
  className,
}) {
  const { tierHasFeature, getCurrentTier, getTierDisplayName } = useAgency();
  const currentTier = getCurrentTier();

  const canAccess = tierHasFeature(feature);

  if (canAccess) {
    return children;
  }

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 text-amber-600 text-sm",
          className,
        )}
      >
        <Lock className="h-4 w-4" />
        <span>Requires {getTierDisplayName(getNextTier(currentTier))}</span>
      </div>
    );
  }

  if (fallback) {
    return fallback;
  }

  return (
    <FeatureLockedMessage
      feature={feature}
      currentTier={currentTier}
      showUpgradePrompt={showUpgradePrompt}
    />
  );
}

function FeatureLockedMessage({ feature, currentTier, showUpgradePrompt }) {
  const { getTierDisplayName } = useAgency();

  const getFeatureInfo = (feature) => {
    const featureMap = {
      advanced_forms: {
        name: "Advanced Forms",
        description: "Unlimited custom forms with advanced fields and logic",
        requiredTier: "build",
      },
      email_marketing: {
        name: "Email Marketing",
        description: "Send email campaigns and automated sequences",
        requiredTier: "build",
      },
      workflows: {
        name: "Workflow Automation",
        description: "Automate your business processes with custom workflows",
        requiredTier: "build",
      },
      ai_features: {
        name: "AI Features",
        description: "AI-powered lead scoring and insights",
        requiredTier: "build",
      },
      advanced_ai: {
        name: "Advanced AI",
        description: "AI assistant, call transcription, and advanced analytics",
        requiredTier: "scale",
      },
      api_access: {
        name: "API Access",
        description: "Full API access for custom integrations",
        requiredTier: "scale",
      },
      white_label: {
        name: "White Label",
        description: "Custom branding and domain options",
        requiredTier: "scale",
      },
      unlimited_users: {
        name: "Unlimited Users",
        description: "Add unlimited team members",
        requiredTier: "scale",
      },
      unlimited_email: {
        name: "Unlimited Email",
        description: "Send unlimited emails and campaigns",
        requiredTier: "scale",
      },
    };

    return (
      featureMap[feature] || {
        name: feature
          .replace("_", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        description: `This feature requires a higher tier plan`,
        requiredTier: "build",
      }
    );
  };

  const featureInfo = getFeatureInfo(feature);
  const requiredTierName = getTierDisplayName(featureInfo.requiredTier);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="h-8 w-8 text-gray-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {featureInfo.name} Locked
      </h3>

      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {featureInfo.description}
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <Zap className="h-5 w-5" />
          <span className="font-medium">Upgrade to {requiredTierName}</span>
        </div>
        <p className="text-sm text-blue-700">
          Get access to {featureInfo.name} and other premium features
        </p>
      </div>

      {showUpgradePrompt && (
        <div className="flex gap-3 justify-center">
          <Link
            to="/app/settings/billing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upgrade className="h-4 w-4" />
            Upgrade Now
          </Link>
          <Link
            to="/pricing"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Compare Plans
          </Link>
        </div>
      )}
    </div>
  );
}

function getNextTier(currentTier) {
  const tierOrder = ["sales", "build", "scale"];
  const currentIndex = tierOrder.indexOf(currentTier);
  return tierOrder[Math.min(currentIndex + 1, tierOrder.length - 1)];
}

// Inline feature guard for compact spaces
export function InlineFeatureGuard({ feature, children }) {
  const { tierHasFeature } = useAgency();

  if (!tierHasFeature(feature)) {
    return (
      <div className="text-amber-600 text-sm flex items-center gap-1">
        <Lock className="h-3 w-3" />
        <span>Upgrade required</span>
      </div>
    );
  }

  return children;
}

// Hook for feature access
export function useFeatureAccess() {
  const { tierHasFeature, getCurrentTier } = useAgency();

  const canAccess = (feature) => {
    return tierHasFeature(feature);
  };

  const getUpgradePrompt = (feature) => {
    if (canAccess(feature)) return null;

    return {
      message: `${feature.replace("_", " ")} requires upgrading your plan`,
      action: "/app/settings/billing",
      actionText: "Upgrade Plan",
    };
  };

  return { canAccess, getUpgradePrompt };
}
