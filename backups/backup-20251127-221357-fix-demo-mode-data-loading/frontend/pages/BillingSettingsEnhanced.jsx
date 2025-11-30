/**
 * Enhanced Billing Settings Page
 *
 * Owner-only page for managing agency subscription and billing.
 * Features:
 * - Current plan display
 * - Trial status with countdown
 * - Upgrade/downgrade options with universal pricing cards
 * - Enhanced billing history with CSV export
 * - Multiple payment methods management
 * - Usage warnings and limits
 * - Cancel subscription
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Receipt,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  ExternalLink,
  Check,
  Loader2,
  AlertTriangle,
  Shield,
  DollarSign,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAgency } from "../hooks/useAgency";
import { useIsOwner } from "../hooks/usePermission";
import { useAccountStatus } from "../hooks/useAccountStatus";
import { TrialStatusCard } from "../components/billing/TrialBanner";
import BillingHistory from "../components/billing/BillingHistory";
import PaymentMethods from "../components/billing/PaymentMethods";
import UsageWarning from "../components/billing/UsageWarning";
import PricingCard from "../components/pricing/PricingCard";
import { useToast } from "@/components/ui/use-toast";
import api from "../lib/api";
import { cn } from "../lib/utils";

// Default pricing tiers (fallback if API fails)
const DEFAULT_PRICING_TIERS = {
  sales: {
    name: "Sales",
    monthlyPrice: 67,
    yearlyPrice: 54,
    description: "For solo operators getting started",
    features: [
      "1 User",
      "Unlimited Leads",
      "Basic CRM",
      "Calendar",
      "Basic Forms",
      "Email (500/mo)",
    ],
    color: "#3F0D28",
    limits: {
      users: 1,
      leads: "Unlimited",
      forms: 5,
      emails: "500/month",
    },
  },
  build: {
    name: "Build",
    monthlyPrice: 187,
    yearlyPrice: 149,
    description: "For growing teams",
    features: [
      "3 Users",
      "Everything in Sales",
      "Advanced Forms",
      "Email Marketing",
      "Basic Automation",
      "AI Assistant",
    ],
    color: "#3F0D28",
    popular: true,
    limits: {
      users: 3,
      leads: "Unlimited",
      forms: "Unlimited",
      emails: "5,000/month",
    },
  },
  scale: {
    name: "Scale",
    monthlyPrice: 349,
    yearlyPrice: 279,
    description: "For agencies at scale",
    features: [
      "Unlimited Users",
      "Everything in Build",
      "Full Automation",
      "Advanced AI",
      "API Access",
      "White Label",
    ],
    color: "#3F0D28",
    limits: {
      users: "Unlimited",
      leads: "Unlimited",
      forms: "Unlimited",
      emails: "Unlimited",
    },
  },
};

export default function BillingSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentAgency,
    subscription,
    subscriptionLoading,
    refreshSubscription,
    isTrialing,
    getCurrentTier,
    getTierDisplayName,
    isGodMode,
  } = useAgency();
  const { needsPaymentWall } = useAccountStatus();
  const isOwner = useIsOwner();

  const [activeTab, setActiveTab] = useState("billing");
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [pendingDowngradeTier, setPendingDowngradeTier] = useState(null);
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [usageData, setUsageData] = useState(null);
  const [pricingTiers, setPricingTiers] = useState(DEFAULT_PRICING_TIERS);
  const [isDemoModeEnabled, setIsDemoModeEnabled] = useState(false);

  // Redirect non-owners (unless god mode)
  useEffect(() => {
    if (!isOwner && !isGodMode()) {
      navigate("/app/settings");
    }
  }, [isOwner, isGodMode, navigate]);

  // Load demo mode state from localStorage
  useEffect(() => {
    if (isGodMode()) {
      const savedDemoMode =
        localStorage.getItem("axolop_demo_mode_enabled") === "true";
      setIsDemoModeEnabled(savedDemoMode);
    }
  }, [isGodMode()]);

  // Handle demo mode toggle
  const handleDemoModeToggle = () => {
    const newDemoMode = !isDemoModeEnabled;
    setIsDemoModeEnabled(newDemoMode);
    localStorage.setItem("axolop_demo_mode_enabled", newDemoMode.toString());

    toast({
      title: newDemoMode ? "Demo Mode Enabled" : "Demo Mode Disabled",
      description: newDemoMode
        ? "Demo agency will appear in the agency selector"
        : "Demo agency has been removed from the selector",
    });

    // Force a page refresh to update agency context
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Fetch pricing tiers from API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get("/api/v1/stripe/pricing");

        if (response.data.success && response.data.data) {
          // Transform API response to match expected format
          const apiTiers = response.data.data;
          const transformedTiers = {};

          apiTiers.forEach((tier) => {
            transformedTiers[tier.tier_id || tier.name?.toLowerCase()] = {
              name: tier.name,
              monthlyPrice: tier.monthly_price || tier.monthlyPrice,
              yearlyPrice: tier.yearly_price || tier.yearlyPrice,
              description: tier.description,
              features: tier.features || [],
              color: tier.color || "#3F0D28",
              popular: tier.popular || tier.name === "Build",
              limits: tier.limits || {},
            };
          });

          if (Object.keys(transformedTiers).length > 0) {
            setPricingTiers(transformedTiers);
          }
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        // Keep default pricing tiers on error
      }
    };

    fetchPricing();
  }, []);

  // Fetch usage data
  useEffect(() => {
    const fetchUsage = async () => {
      if (!currentAgency?.id) return;

      try {
        const response = await api.get("/api/v1/stats/usage", {
          headers: { "X-Agency-ID": currentAgency.id },
        });

        if (response.data.success) {
          setUsageData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching usage:", error);
        // Set default usage data
        setUsageData({
          leadsCreated: 0,
          outboundCalls: 0,
          inboundCalls: 0,
          sentEmails: 0,
          receivedEmails: 0,
          opportunitiesCreated: 0,
          teamMembers: 1,
          formsCreated: 0,
        });
      }
    };

    fetchUsage();
  }, [currentAgency?.id]);

  // Handle manage billing (opens Stripe portal)
  const handleManageBilling = async () => {
    if (!currentAgency?.id) return;

    try {
      setActionLoading("portal");
      const response = await api.post(
        "/api/v1/stripe/create-portal-session",
        {},
        {
          headers: { "X-Agency-ID": currentAgency.id },
        },
      );

      if (response.data.success && response.data.data?.url) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle upgrade
  const handleUpgrade = async (tier) => {
    if (!currentAgency?.id) return;

    try {
      setActionLoading(`upgrade-${tier}`);
      const response = await api.post(
        "/api/v1/stripe/upgrade",
        {
          new_tier: tier,
          billing_interval: billingInterval,
        },
        {
          headers: { "X-Agency-ID": currentAgency.id },
        },
      );

      if (response.data.success) {
        await refreshSubscription();
        toast({
          title: "Plan upgraded",
          description: `Successfully upgraded to ${pricingTiers[tier]?.name || tier} plan.`,
        });
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      toast({
        title: "Upgrade failed",
        description:
          error.response?.data?.message ||
          "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Show downgrade confirmation modal
  const confirmDowngrade = (tier) => {
    setPendingDowngradeTier(tier);
    setShowDowngradeModal(true);
  };

  // Handle downgrade (called after confirmation)
  const handleDowngrade = async () => {
    if (!currentAgency?.id || !pendingDowngradeTier) return;

    try {
      setActionLoading(`downgrade-${pendingDowngradeTier}`);
      const response = await api.post(
        "/api/v1/stripe/downgrade",
        {
          new_tier: pendingDowngradeTier,
        },
        {
          headers: { "X-Agency-ID": currentAgency.id },
        },
      );

      if (response.data.success) {
        await refreshSubscription();
        setShowDowngradeModal(false);
        setPendingDowngradeTier(null);
        toast({
          title: "Plan changed",
          description: `Your plan will be downgraded to ${pricingTiers[pendingDowngradeTier]?.name || pendingDowngradeTier} at the end of your billing period.`,
        });
      }
    } catch (error) {
      console.error("Error downgrading:", error);
      toast({
        title: "Downgrade failed",
        description:
          error.response?.data?.message ||
          "Failed to change plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle cancel subscription
  const handleCancel = async () => {
    if (!currentAgency?.id) return;

    try {
      setActionLoading("cancel");
      const response = await api.post(
        "/api/v1/stripe/cancel",
        {},
        {
          headers: { "X-Agency-ID": currentAgency.id },
        },
      );

      if (response.data.success) {
        await refreshSubscription();
        setShowCancelModal(false);
        toast({
          title: "Subscription canceled",
          description:
            "Your subscription will end at the end of your billing period.",
        });
      }
    } catch (error) {
      console.error("Error canceling:", error);
      toast({
        title: "Cancellation failed",
        description:
          error.response?.data?.message ||
          "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle resume subscription
  const handleResume = async () => {
    if (!currentAgency?.id) return;

    try {
      setActionLoading("resume");
      const response = await api.post(
        "/api/v1/stripe/resume",
        {},
        {
          headers: { "X-Agency-ID": currentAgency.id },
        },
      );

      if (response.data.success) {
        await refreshSubscription();
        toast({
          title: "Subscription resumed",
          description: "Your subscription has been reactivated.",
        });
      }
    } catch (error) {
      console.error("Error resuming:", error);
      toast({
        title: "Resume failed",
        description:
          error.response?.data?.message ||
          "Failed to resume subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const currentTier = getCurrentTier();
  const tierConfig =
    pricingTiers[currentTier] ||
    pricingTiers.sales ||
    DEFAULT_PRICING_TIERS.sales;

  // God mode display
  if (isGodMode()) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
              <p className="text-gray-300">God Mode - All features unlocked</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* God Mode Status */}
            <div className="bg-gradient-to-r from-[#3F0D28] to-[#6B2020] rounded-xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10" />
                <div>
                  <h2 className="text-2xl font-bold">God Mode Active</h2>
                  <p className="text-white/70">
                    You have unlimited access to all features
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">Unlimited</div>
                  <div className="text-sm text-white/70">Users</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">All</div>
                  <div className="text-sm text-white/70">Features</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">$0</div>
                  <div className="text-sm text-white/70">Forever</div>
                </div>
              </div>
            </div>

            {/* Demo Mode Toggle */}
            <div className="bg-white dark:bg-[#1a1d24] rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDemoModeEnabled ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {isDemoModeEnabled ? (
                      <Eye className="h-6 w-6 text-blue-600" />
                    ) : (
                      <EyeOff className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Demo Mode
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isDemoModeEnabled
                        ? "Demo agency is visible in agency selector with $31k/mo sample data"
                        : "Enable to show demo agency for marketing screenshots"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDemoModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDemoModeEnabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDemoModeEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {isDemoModeEnabled && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Eye className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Demo Mode Active</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>"Axolop Demo Agency" appears in agency selector</li>
                        <li>Shows $31,000/month revenue with full breakdown</li>
                        <li>50 leads, 75 contacts, 25 opportunities</li>
                        <li>
                          Forms, calendar, tasks, and email campaigns populated
                        </li>
                        <li>Perfect for marketing screenshots and demos</li>
                        <li>
                          No impact on real data - purely visual demonstration
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-[#3F0D28]" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Billing Settings
              </h1>
              <p className="text-gray-500">
                Manage your subscription and billing
              </p>
            </div>
          </div>

          <button
            onClick={handleManageBilling}
            disabled={actionLoading === "portal"}
            className="flex items-center gap-2 px-4 py-2 bg-[#3F0D28] text-white rounded-lg hover:bg-[#5A2525] transition-colors disabled:opacity-50"
          >
            {actionLoading === "portal" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Manage in Stripe
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="bg-white dark:bg-[#1a1d24] rounded-lg border border-gray-200 p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === "billing"
                        ? "bg-[#3F0D28] text-white"
                        : "hover:bg-gray-100 text-gray-900",
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Billing</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("payment-methods")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === "payment-methods"
                        ? "bg-[#3F0D28] text-white"
                        : "hover:bg-gray-100 text-gray-900",
                    )}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Methods</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("usage")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeTab === "usage"
                        ? "bg-[#3F0D28] text-white"
                        : "hover:bg-gray-100 text-gray-900",
                    )}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Usage</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Billing Tab */}
              {activeTab === "billing" && (
                <>
                  {/* Trial Status */}
                  {isTrialing() && <TrialStatusCard />}

                  {/* Current Plan */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Current Plan
                      </h2>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-[#3F0D28]">
                              {tierConfig.name}
                            </span>
                            {subscription?.status === "trialing" && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Trial
                              </span>
                            )}
                            {subscription?.cancel_at_period_end && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Canceling
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 mt-1">
                            {tierConfig.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            $
                            {subscription?.billing_interval === "yearly"
                              ? tierConfig.yearlyPrice
                              : tierConfig.monthlyPrice}
                            <span className="text-base font-normal text-gray-500">
                              /mo
                            </span>
                          </div>
                          {subscription?.billing_interval === "yearly" && (
                            <p className="text-sm text-emerald-700">
                              Billed yearly (save 20%)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mt-6 grid grid-cols-2 gap-2">
                        {tierConfig.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Billing info */}
                      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Status</div>
                          <div
                            className={cn(
                              "font-medium",
                              subscription?.status === "active"
                                ? "text-emerald-700"
                                : subscription?.status === "trialing"
                                  ? "text-amber-600"
                                  : "text-gray-900",
                            )}
                          >
                            {subscription?.status === "active"
                              ? "Active"
                              : subscription?.status === "trialing"
                                ? "Trial"
                                : subscription?.status || "Unknown"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Next billing date
                          </div>
                          <div className="font-medium text-gray-900">
                            {subscription?.current_period_end
                              ? new Date(
                                  subscription.current_period_end,
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Billing interval
                          </div>
                          <div className="font-medium text-gray-900 capitalize">
                            {subscription?.billing_interval || "Monthly"}
                          </div>
                        </div>
                      </div>

                      {/* Cancel warning */}
                      {subscription?.cancel_at_period_end && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-900">
                                Subscription ending
                              </h4>
                              <p className="text-sm text-red-700 mt-1">
                                Your subscription will end on{" "}
                                {new Date(
                                  subscription.cancel_at,
                                ).toLocaleDateString()}
                                . You will lose access to premium features after
                                this date.
                              </p>
                              <button
                                onClick={handleResume}
                                disabled={actionLoading === "resume"}
                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                {actionLoading === "resume" ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Resume Subscription"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Plan */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Change Plan
                        </h2>

                        {/* Billing toggle */}
                        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => setBillingInterval("monthly")}
                            className={cn(
                              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                              billingInterval === "monthly"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500",
                            )}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setBillingInterval("yearly")}
                            className={cn(
                              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                              billingInterval === "yearly"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500",
                            )}
                          >
                            Yearly
                            <span className="ml-1 text-emerald-700">-20%</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(pricingTiers).map(([key, tier]) => {
                          const isCurrentTier = key === currentTier;
                          const isUpgrade =
                            Object.keys(pricingTiers).indexOf(key) >
                            Object.keys(pricingTiers).indexOf(currentTier);

                          return (
                            <PricingCard
                              key={key}
                              tier={{ ...tier, id: key }}
                              isCurrent={isCurrentTier}
                              billingInterval={billingInterval}
                              onSelect={
                                isUpgrade
                                  ? () => handleUpgrade(key)
                                  : () => confirmDowngrade(key)
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <BillingHistory />

                  {/* Cancel Subscription */}
                  {subscription?.status === "active" &&
                    !subscription?.cancel_at_period_end && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Cancel Subscription
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Your subscription will remain active until the end
                              of your billing period.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCancelModal(true)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            Cancel Subscription
                          </button>
                        </div>
                      </div>
                    )}
                </>
              )}

              {/* Payment Methods Tab */}
              {activeTab === "payment-methods" && <PaymentMethods />}

              {/* Usage Tab */}
              {activeTab === "usage" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Usage
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Usage Warnings */}
                      {usageData && (
                        <>
                          <UsageWarning
                            feature="Team Members"
                            current={usageData.teamMembers || 1}
                            limit={
                              tierConfig.limits?.users === "Unlimited"
                                ? 999999
                                : tierConfig.limits?.users || 1
                            }
                          />

                          <UsageWarning
                            feature="Emails Sent"
                            current={usageData.sentEmails || 0}
                            limit={
                              tierConfig.limits?.emails === "Unlimited"
                                ? 999999
                                : parseInt(
                                    tierConfig.limits?.emails?.split("/")[0] ||
                                      "500",
                                  )
                            }
                          />

                          <UsageWarning
                            feature="Forms Created"
                            current={usageData.formsCreated || 0}
                            limit={
                              tierConfig.limits?.forms === "Unlimited"
                                ? 999999
                                : tierConfig.limits?.forms || 5
                            }
                          />
                        </>
                      )}

                      {/* Leads Created */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-[#3F0D28]/10 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-[#3F0D28]" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Leads Created
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {usageData?.leadsCreated || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          This period
                        </p>
                      </div>

                      {/* Opportunities Created */}
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg
                              className="h-5 w-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Opportunities
                          </h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {usageData?.opportunitiesCreated || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          This period
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Usage Details */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Plan Limits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Current Period
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                          <li className="flex justify-between">
                            <span>Leads</span>
                            <span className="text-gray-900">Unlimited</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Storage</span>
                            <span className="text-gray-900">
                              {usageData?.storageUsed || "0 GB"} / 10 GB
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>API Calls</span>
                            <span className="text-gray-900">
                              {usageData?.apiCalls || 0} /{" "}
                              {currentTier === "scale" ? "Unlimited" : "10,000"}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Billing Period
                        </h4>
                        <p className="text-sm text-gray-500">
                          {subscription?.current_period_start
                            ? new Date(
                                subscription.current_period_start,
                              ).toLocaleDateString()
                            : "N/A"}{" "}
                          -{" "}
                          {subscription?.current_period_end
                            ? new Date(
                                subscription.current_period_end,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Next billing:{" "}
                          {subscription?.current_period_end
                            ? new Date(
                                subscription.current_period_end,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Subscription?
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your {getTierDisplayName()}{" "}
              subscription? You will lose access to:
            </p>

            <ul className="space-y-2 mb-6">
              {tierConfig.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading === "cancel"}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading === "cancel" ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && pendingDowngradeTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ArrowDownCircle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Downgrade
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to downgrade to the{" "}
              <strong>
                {pricingTiers[pendingDowngradeTier]?.name ||
                  pendingDowngradeTier}
              </strong>{" "}
              plan?
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">
                    What happens when you downgrade:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Changes take effect at the end of your billing period
                    </li>
                    <li>You will retain current features until then</li>
                    <li>
                      Some features may become unavailable on the new plan
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDowngradeModal(false);
                  setPendingDowngradeTier(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDowngrade}
                disabled={actionLoading === `downgrade-${pendingDowngradeTier}`}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading === `downgrade-${pendingDowngradeTier}` ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  "Confirm Downgrade"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
