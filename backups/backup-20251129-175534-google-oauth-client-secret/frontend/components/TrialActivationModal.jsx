import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Sparkles,
  CreditCard,
  ArrowRight,
  Lock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/context/SupabaseContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { getPlanDetails } from "@/lib/onboarding/questionFlows";

export default function TrialActivationModal({
  selectedPlan,
  onClose,
  onActivate,
}) {
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);
  const { user } = useSupabase();
  const { disableDemoMode } = useDemoMode();

  const plan = getPlanDetails(selectedPlan);

  const handleStartTrial = async () => {
    setIsRedirectingToStripe(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Call backend to create trial checkout session
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3002/api"}/stripe/create-trial-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await user.session.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            plan: selectedPlan,
            trialDays: 14,
            billingCycle: "monthly",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error creating trial checkout:", error);
      setIsRedirectingToStripe(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 pb-6 bg-gradient-to-br from-[#3F0D28] to-[#ff6b4a] text-white rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  Start Your 14-Day Free Trial
                </h2>
                <p className="text-white/90 mt-1">
                  No charges for 14 days • Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-[#3F0D28]/20 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name} Plan
                </h3>
                <p className="text-gray-600 mt-1">Perfect for your needs</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#3F0D28]">
                  {plan.price}
                </div>
                <div className="text-sm text-gray-500">/month after trial</div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trial Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900 mb-1">
                    Free for 14 Days
                  </p>
                  <p className="text-sm text-blue-700">
                    Enter your card details to start your trial. You won't be
                    charged until day 15. Cancel anytime before then at no cost.
                  </p>
                </div>
              </div>
            </div>

            {/* Switch Plan Link */}
            <div className="text-center mb-6">
              <button
                onClick={() => {
                  onClose();
                  // Navigate to pricing page with trial parameter
                  window.location.href = "/pricing?trial=true";
                }}
                className="text-sm text-gray-600 hover:text-[#3F0D28] font-medium underline transition-colors"
              >
                Switch Pricing Tier?
              </button>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleStartTrial}
              disabled={isRedirectingToStripe}
              className="w-full bg-gradient-to-r from-[#3F0D28] to-[#ff6b4a] hover:from-[#8b2c24] hover:to-[#ff7b5a] text-white text-lg py-6 rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              {isRedirectingToStripe ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <span className="flex items-center gap-2">
                    Redirecting to secure checkout...
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Your 14-Day Free Trial
                </span>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              By starting your trial, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
