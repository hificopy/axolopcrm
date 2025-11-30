import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import SEO from "../components/SEO";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session } = useSupabase();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");
  const [trialInfo, setTrialInfo] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setError("No session ID found. Please try again.");
        return;
      }

      if (!user || !session) {
        setStatus("error");
        setError("You must be logged in to complete setup.");
        return;
      }

      try {
        // Verify session with backend
        const response = await fetch("/api/v1/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to verify payment session");
        }

        // Session verified - trial is set up
        setTrialInfo(data.subscription);
        setStatus("success");

        // Wait 3 seconds then redirect to onboarding or dashboard
        setTimeout(() => {
          // Check if user has completed onboarding
          const onboardingCompleted = user.user_metadata?.onboarding_completed;

          if (onboardingCompleted) {
            navigate("/app/home", { replace: true });
          } else {
            navigate("/onboarding?from=payment", { replace: true });
          }
        }, 3000);
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setError(err.message || "Failed to verify payment. Please contact support.");
      }
    };

    verifySession();
  }, [searchParams, user, session, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0F0510] p-4 overflow-hidden">
      <SEO
        title="Payment Success - Axolop CRM"
        description="Your trial has been activated successfully"
      />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,44,146,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.10),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(63,13,40,0.08),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3F0D28]/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#14787b]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/5 via-transparent to-[#14787b]/5 pointer-events-none"></div>

          <div className="relative z-10">
            {status === "verifying" && (
              <>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verifying Payment...
                </h2>
                <p className="text-gray-400">
                  Please wait while we set up your trial
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Trial Activated Successfully!
                </h2>
                <p className="text-gray-400 mb-6">
                  Your 14-day free trial has been activated
                </p>

                {trialInfo && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white font-medium">
                          {trialInfo.plan?.charAt(0).toUpperCase() +
                            trialInfo.plan?.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Billing:</span>
                        <span className="text-white font-medium">
                          {trialInfo.billing_cycle === "yearly"
                            ? "Yearly"
                            : "Monthly"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trial Ends:</span>
                        <span className="text-white font-medium">
                          {formatDate(trialInfo.trial_end)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 font-medium">
                          Active Trial
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-300">
                    💳 Your payment method has been saved. You won't be charged
                    until your trial ends.
                  </p>
                </div>

                <p className="text-sm text-gray-400">
                  Redirecting you to complete setup...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-400 mb-6">{error}</p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/select-plan")}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#E92C92] to-[#ff6b4a] hover:from-[#5B1046] hover:to-[#ff7b5a] text-white rounded-lg font-semibold transition-all duration-300 shadow-lg"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate("/app/home")}
                    className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-300"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
