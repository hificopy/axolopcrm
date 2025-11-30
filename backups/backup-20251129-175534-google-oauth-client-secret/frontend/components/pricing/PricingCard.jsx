/**
 * Universal Pricing Card Component
 *
 * Reusable pricing display for billing and pricing pages
 */

import { Check, X, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function PricingCard({
  tier,
  isCurrent,
  billingInterval = "monthly",
  onSelect,
  showComparison = false,
  compact = false,
  className,
}) {
  const price =
    billingInterval === "yearly" ? tier.yearlyPrice : tier.monthlyPrice;
  const yearlySavings =
    billingInterval === "yearly"
      ? (
          ((tier.monthlyPrice * 12 - tier.yearlyPrice * 12) /
            (tier.monthlyPrice * 12)) *
          100
        ).toFixed(0)
      : 0;

  if (compact) {
    return (
      <div
        className={cn(
          "p-4 rounded-lg border transition-all",
          isCurrent
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300",
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{tier.name}</h3>
          {isCurrent && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Current
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          ${price}
          <span className="text-sm font-normal text-gray-500">/mo</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg",
        isCurrent
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
          : tier.popular
            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20"
            : "border-gray-200 bg-white hover:border-gray-300",
        className,
      )}
    >
      {/* Popular badge */}
      {tier.popular && !isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg">
          Current Plan
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
        <p className="text-gray-600 text-sm">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-500">/mo</span>
        </div>

        {billingInterval === "yearly" && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-500">
              ${tier.yearlyPrice * 12} billed annually
            </p>
            {yearlySavings > 0 && (
              <p className="text-sm font-medium text-green-600">
                Save {yearlySavings}% vs monthly
              </p>
            )}
          </div>
        )}

        {billingInterval === "monthly" && tier.yearlyPrice && (
          <p className="text-sm text-gray-500 mt-2">
            or ${tier.yearlyPrice}/mo billed annually
          </p>
        )}
      </div>

      {/* Key limits */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {tier.limits &&
          Object.entries(tier.limits)
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-bold text-gray-900 truncate">
                  {value}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {key.replace("_", " ")}
                </div>
              </div>
            ))}
      </div>

      {/* CTA Button */}
      <div className="mb-6">
        {onSelect ? (
          <button
            onClick={() => onSelect(tier)}
            disabled={isCurrent}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2",
              isCurrent
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : tier.popular
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg"
                  : "bg-blue-600 text-white hover:bg-blue-700",
            )}
          >
            {isCurrent ? (
              "Current Plan"
            ) : (
              <>
                {tier.cta || "Select Plan"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <Link
            to={tier.ctaLink || `/signup?plan=${tier.id}`}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-center",
              isCurrent
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : tier.popular
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg"
                  : "bg-blue-600 text-white hover:bg-blue-700",
            )}
          >
            {isCurrent ? (
              "Current Plan"
            ) : (
              <>
                {tier.cta || "Get Started"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          What's included
        </p>
        {tier.features
          ?.slice(0, showComparison ? undefined : 6)
          .map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}

        {tier.features && tier.features.length > 6 && !showComparison && (
          <p className="text-xs text-gray-500 text-center pt-2">
            And {tier.features.length - 6} more features...
          </p>
        )}
      </div>
    </div>
  );
}

// Comparison version for feature comparison tables
export function PricingComparisonCard({ tier, features, currentTier }) {
  const isCurrent = tier.id === currentTier;

  return (
    <div
      className={cn(
        "p-4 border rounded-lg",
        isCurrent ? "border-blue-500 bg-blue-50" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-900">{tier.name}</h3>
        {isCurrent && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Current
          </span>
        )}
      </div>

      <div className="space-y-3">
        {features.map((feature) => {
          const hasFeature = tier.features?.some((f) =>
            f.toLowerCase().includes(feature.toLowerCase()),
          );

          return (
            <div key={feature} className="flex items-center justify-center">
              {hasFeature ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tier badge for showing current plan
export function TierBadge({ tier, size = "md", showIcon = true }) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "scale":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "build":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "sales":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border rounded-full font-medium",
        sizeClasses[size],
        getTierColor(tier),
      )}
    >
      {showIcon && <Star className="h-3 w-3" />}
      {tier || "Unknown"}
    </div>
  );
}
