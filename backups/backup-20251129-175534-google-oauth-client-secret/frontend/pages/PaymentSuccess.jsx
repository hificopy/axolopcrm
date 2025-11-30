/**
 * Payment Success Page
 * Verifies Stripe payment and redirects to onboarding
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabase } from "@/context/SupabaseContext";
import { supabase } from "@/config/supabaseClient";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSupabase();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");

      // Redirect if no session ID
      if (!sessionId) {
        navigate("/select-plan");
        return;
      }

      // Redirect if not authenticated
      if (!user) {
        navigate("/signup");
        return;
      }

      try {
        // Get auth session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("You must be logged in");
        }

        // Verify session with backend
        const response = await fetch('/api/v1/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Payment verification failed');
        }

        // Store subscription info
        localStorage.setItem('subscription_status', 'trial');
        localStorage.setItem('trial_end_date', data.subscription.trial_end);

        // Redirect to onboarding
        setTimeout(() => {
          navigate('/onboarding?from=payment');
        }, 1500);
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err.message);
        setVerifying(false);

        // Redirect back to plan selection after delay
        setTimeout(() => {
          navigate("/select-plan");
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, user]);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{ background: "#0F0510" }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#E92C92] rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E92C92] rounded-full blur-[100px] animate-pulse-slower" />
      </div>

      <div className="relative text-center max-w-md mx-auto px-4">
        {verifying ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-[#E92C92] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Verifying payment...</h1>
            <p className="text-gray-400">
              Please wait while we confirm your subscription.
            </p>
          </>
        ) : error ? (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Verification Failed</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Redirecting you back to plan selection...
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-16 h-16 text-[#1A777B] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Payment Confirmed!</h1>
            <p className="text-gray-400 mb-4">
              Your 14-day free trial has been activated.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to onboarding...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
