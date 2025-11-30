import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Lock, Check, Sparkles, Zap, ArrowRight } from "lucide-react";

/**
 * Tier-based upsell messages for locked features
 * Pricing: Yearly only ($149/mo Build, $279/mo Scale)
 */
const UPSELL_MESSAGES = {
  sales: {
    forms: {
      title: "Unlock Form Builder",
      description: "Create unlimited forms, surveys, and lead capture pages.",
      upgradeToTier: "build",
      price: "$149/mo",
      yearlyTotal: "$1,788/year",
      savings: "Save $456/year vs monthly",
      features: [
        "Unlimited forms",
        "Custom branding",
        "Advanced analytics",
        "Conditional logic",
      ],
    },
    email_campaigns: {
      title: "Unlock Email Campaigns",
      description: "Send targeted email campaigns to your leads and contacts.",
      upgradeToTier: "build",
      price: "$149/mo",
      yearlyTotal: "$1,788/year",
      savings: "Save $456/year vs monthly",
      features: [
        "5,000 emails/month",
        "Email templates",
        "Automation sequences",
        "Analytics dashboard",
      ],
    },
    ai: {
      title: "Unlock AI Features",
      description: "Leverage AI for lead scoring and call transcription.",
      upgradeToTier: "build",
      price: "$149/mo",
      yearlyTotal: "$1,788/year",
      savings: "Save $456/year vs monthly",
      features: [
        "AI lead scoring",
        "Call transcription",
        "Smart insights",
        "Sentiment analysis",
      ],
    },
    second_brain: {
      title: "Unlock Second Brain",
      description: "AI-powered knowledge base and smart notes.",
      upgradeToTier: "build",
      price: "$149/mo",
      yearlyTotal: "$1,788/year",
      savings: "Save $456/year vs monthly",
      features: [
        "AI assistant",
        "Knowledge base",
        "Smart search",
        "Team collaboration",
      ],
    },
    automation: {
      title: "Unlock Automation",
      description: "Automate your workflows and save hours every week.",
      upgradeToTier: "build",
      price: "$149/mo",
      yearlyTotal: "$1,788/year",
      savings: "Save $456/year vs monthly",
      features: [
        "Workflow builder",
        "Trigger-based actions",
        "Email sequences",
        "Task automation",
      ],
    },
  },
  build: {
    white_label: {
      title: "Unlock White Label",
      description: "Custom domain and full branding control for your agency.",
      upgradeToTier: "scale",
      price: "$279/mo",
      yearlyTotal: "$3,348/year",
      savings: "Save $840/year vs monthly",
      features: [
        "Custom domain",
        "Remove Axolop branding",
        "Client portals",
        "Custom login pages",
      ],
    },
    api: {
      title: "Unlock API Access",
      description: "Build custom integrations with our powerful API.",
      upgradeToTier: "scale",
      price: "$279/mo",
      yearlyTotal: "$3,348/year",
      savings: "Save $840/year vs monthly",
      features: [
        "REST API access",
        "Webhooks",
        "Custom integrations",
        "Rate limits: 10k/day",
      ],
    },
    unlimited_seats: {
      title: "Unlock Unlimited Team",
      description: "Add unlimited team members to your agency.",
      upgradeToTier: "scale",
      price: "$279/mo",
      yearlyTotal: "$3,348/year",
      savings: "Save $840/year vs monthly",
      features: [
        "Unlimited users",
        "Advanced roles",
        "Team analytics",
        "Activity logs",
      ],
    },
    mind_maps: {
      title: "Unlock Mind Maps",
      description: "Visual planning and strategy boards for your team.",
      upgradeToTier: "scale",
      price: "$279/mo",
      yearlyTotal: "$3,348/year",
      savings: "Save $840/year vs monthly",
      features: [
        "Infinite canvas",
        "Real-time collaboration",
        "Templates library",
        "Export to PDF",
      ],
    },
    advanced_reports: {
      title: "Unlock Advanced Reports",
      description: "Deep analytics and custom reporting dashboards.",
      upgradeToTier: "scale",
      price: "$279/mo",
      yearlyTotal: "$3,348/year",
      savings: "Save $840/year vs monthly",
      features: [
        "Custom dashboards",
        "Scheduled reports",
        "Data exports",
        "Team performance",
      ],
    },
  },
};

/**
 * TierUpsellModal - Shows upgrade prompt for locked features
 * @param {Object} props
 * @param {string} props.feature - The feature key (e.g., "forms", "white_label")
 * @param {string} props.currentTier - Current tier ("sales" | "build" | "scale")
 * @param {function} props.onClose - Close handler
 * @param {boolean} props.isOpen - Whether modal is open
 */
export default function TierUpsellModal({
  feature,
  currentTier = "sales",
  onClose,
  isOpen = false,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const upsell = UPSELL_MESSAGES[currentTier]?.[feature];

  // If no upsell message found, show generic upgrade
  if (!upsell) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-6 text-center">
            <Lock className="h-12 w-12 text-[#761B14] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Feature Locked
            </h2>
            <p className="text-gray-400 mb-6">
              This feature is not available on your current plan.
            </p>
            <button
              onClick={() => navigate("/app/settings/billing")}
              className="w-full py-3 bg-gradient-to-r from-[#761B14] to-[#8B2B1F] hover:from-[#8B2B1F] hover:to-[#a13328] text-white font-bold rounded-lg transition-all"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const handleUpgrade = () => {
    setLoading(true);
    navigate(`/app/settings/billing?upgrade=${upsell.upgradeToTier}`);
  };

  const tierDisplayName = {
    build: "Build",
    scale: "Scale",
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#761B14]/5 via-transparent to-[#8B2B1F]/5 pointer-events-none" />

        <div className="relative z-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-0 text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-[#761B14]/20 to-[#8B2B1F]/20 ring-2 ring-[#761B14]/30 mb-4">
              <Lock className="h-8 w-8 text-[#761B14]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {upsell.title}
            </h2>
            <p className="text-gray-400">{upsell.description}</p>
          </div>

          {/* Pricing Card */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-[#761B14]/10 to-[#8B2B1F]/10 border border-[#761B14]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Upgrade to {tierDisplayName[upsell.upgradeToTier]}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {upsell.price}
                    <span className="text-base font-normal text-gray-400">
                      {" "}
                      billed yearly
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    {upsell.savings}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">{upsell.yearlyTotal}</p>

              {/* Features */}
              <ul className="space-y-2.5">
                {upsell.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="p-1 rounded-full bg-green-500/20">
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#761B14] to-[#8B2B1F] hover:from-[#8B2B1F] hover:to-[#a13328] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#761B14]/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Upgrade to {tierDisplayName[upsell.upgradeToTier]}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-gray-400 hover:text-white font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Get upsell info for a feature without rendering the modal
 * Useful for checking if a feature is locked and what upgrade is needed
 */
export function getUpsellInfo(feature, currentTier = "sales") {
  return UPSELL_MESSAGES[currentTier]?.[feature] || null;
}

/**
 * Check if a feature is locked for a given tier
 */
export function isFeatureLocked(feature, currentTier = "sales") {
  // Features available at each tier
  const tierFeatures = {
    sales: ["crm", "leads", "contacts", "calendar", "calls", "inbox"],
    build: [
      "crm",
      "leads",
      "contacts",
      "calendar",
      "calls",
      "inbox",
      "forms",
      "email_campaigns",
      "automation",
      "ai",
      "second_brain",
      "reports",
    ],
    scale: [
      "crm",
      "leads",
      "contacts",
      "calendar",
      "calls",
      "inbox",
      "forms",
      "email_campaigns",
      "automation",
      "ai",
      "second_brain",
      "reports",
      "white_label",
      "api",
      "unlimited_seats",
      "mind_maps",
      "advanced_reports",
    ],
    god_mode: [], // All features enabled
  };

  if (currentTier === "god_mode") return false;

  const availableFeatures = tierFeatures[currentTier] || tierFeatures.sales;
  return !availableFeatures.includes(feature);
}
