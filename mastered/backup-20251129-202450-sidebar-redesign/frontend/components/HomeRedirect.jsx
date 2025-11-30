import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";

// CRITICAL: Hardcode God emails to prevent redirect loops
const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];

export default function HomeRedirect() {
  const { user, loading } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      console.log("[HomeRedirect] Auth still loading, waiting...");
      return;
    }

    if (!user) {
      console.log("[HomeRedirect] No user - redirecting to signin");
      navigate("/signin");
      return;
    }

    // CRITICAL: Check if user is God user FIRST
    const userEmail = user.email?.toLowerCase() || "";
    const isGodUser = GOD_EMAILS.includes(userEmail);

    console.log("[HomeRedirect] Checking user:", {
      email: userEmail,
      isGodUser,
      subscription_status: user.user_metadata?.subscription_status,
    });

    // God users ALWAYS go to app/home, bypass all plan checks
    if (isGodUser) {
      console.log("[HomeRedirect] God user detected - redirecting to app/home");
      navigate("/app/home", { replace: true });
      return;
    }

    // Check if user needs to select a plan
    const needsPlanSelection =
      !user.user_metadata?.subscription_status ||
      user.user_metadata?.subscription_status === "none" ||
      user.user_metadata?.subscription_status === "free";

    // Check if user has paid plan (including trial)
    const hasPaidPlan =
      user.user_metadata?.subscription_status &&
      user.user_metadata?.subscription_status !== "none" &&
      user.user_metadata?.subscription_status !== "free";

    if (needsPlanSelection) {
      console.log("[HomeRedirect] Free user - redirecting to select-plan");
      navigate("/select-plan", { replace: true });
      return;
    }

    // If user has paid plan (including trial), go to app/home
    if (hasPaidPlan) {
      console.log("[HomeRedirect] Paid user - redirecting to app/home");
      navigate("/app/home", { replace: true });
      return;
    }

    // Default: go to app/home
    console.log("[HomeRedirect] Default - redirecting to app/home");
    navigate("/app/home", { replace: true });
  }, [user, loading, navigate]);

  // Show loading while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Setting up your workspace...</p>
      </div>
    </div>
  );
}
