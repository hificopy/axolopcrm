import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";
import api from "../lib/api";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  skipOnboarding = false,
}) => {
  const { user, loading } = useSupabase();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is admin (exempt from onboarding)
  const isAdmin = user && user.email === "axolopcrm@gmail.com";

  // Track when auth check is complete
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Check onboarding status - ONLY when we have a user and haven't checked yet
  useEffect(() => {
    async function checkOnboarding() {
      if (!user || skipOnboarding || isAdmin) {
        setCheckingOnboarding(false);
        return;
      }

      // Only check onboarding if we haven't checked before
      if (onboardingStatus !== null) {
        setCheckingOnboarding(false);
        return;
      }

      setCheckingOnboarding(true);
      try {
        const response = await api.get("/users/me/onboarding-status");
        setOnboardingStatus(response.data.onboarding_completed);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // If error, assume not completed
        setOnboardingStatus(false);
      } finally {
        setCheckingOnboarding(false);
      }
    }

    if (authChecked && user) {
      checkOnboarding();
    }
  }, [user, skipOnboarding, isAdmin, authChecked, onboardingStatus]);

  // ONLY show loading during initial auth check, not on route changes
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to sign in, saving the attempted location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin) {
    const isAdminUser =
      isAdmin ||
      (user &&
        user.app_metadata &&
        user.app_metadata.roles &&
        user.app_metadata.roles.includes("admin")) ||
      (user && user.user_metadata && user.user_metadata.role === "admin");

    if (!isAdminUser) {
      // Redirect non-admins to dashboard or show access denied
      return <Navigate to="/app/home" state={{ accessDenied: true }} replace />;
    }
  }

  // Check if onboarding is required (skip for admin and onboarding page itself)
  if (
    !skipOnboarding &&
    !isAdmin &&
    onboardingStatus === false &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // If all checks pass, render the protected content immediately
  return children;
};

export default ProtectedRoute;
