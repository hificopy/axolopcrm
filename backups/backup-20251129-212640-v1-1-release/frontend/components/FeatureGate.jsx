import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Rocket, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { canAccessFeature, getUpgradeMessage } from "@/lib/featureGating";

export default function FeatureGate({
  featureId,
  userTier,
  hasActiveTrial = false,
  children,
  showUpgradeButton = true,
  className = "",
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hasAccess = canAccessFeature(featureId, userTier, hasActiveTrial);
  const upgradeInfo = getUpgradeMessage(featureId, userTier);

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // Feature is not released yet - show roadmap tooltip
  if (upgradeInfo && !upgradeInfo.released) {
    return (
      <TooltipProvider>
        <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
          <TooltipTrigger asChild>
            <div
              className={`relative opacity-50 cursor-not-allowed ${className}`}
            >
              {children}
              <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{upgradeInfo.name}</p>
              <p className="text-sm text-gray-600">{upgradeInfo.description}</p>
              <p className="text-xs text-blue-600">
                Estimated Release: {upgradeInfo.roadmapETA || "TBD"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Available in:{" "}
                {upgradeInfo.availableIn?.join(", ").toUpperCase()} tiers
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Feature is released but user doesn't have access - show upsell
  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <div
            className={`relative opacity-50 cursor-not-allowed ${className}`}
          >
            {children}
            <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Locked
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-3">
            <div>
              <p className="font-medium">{upgradeInfo.name}</p>
              <p className="text-sm text-gray-600">{upgradeInfo.description}</p>
            </div>

            {upgradeInfo && (
              <>
                <p className="text-sm font-medium text-orange-600">
                  {upgradeInfo.message}
                </p>
                {showUpgradeButton && (
                  <Button
                    size="sm"
                    onClick={() => (window.location.href = "/pricing")}
                    className="w-full bg-gradient-to-r from-[#3F0D28] to-[#ff6b4a] hover:from-[#8b2c24] hover:to-[#ff7b5a]"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Upgrade Now
                    </span>
                  </Button>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
