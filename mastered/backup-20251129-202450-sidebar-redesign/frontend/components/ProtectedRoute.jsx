import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";
import api from "../lib/api";

// CRITICAL: Hardcode God emails for 0-latency detection
const GOD_EMAILS = ["axolopcrm@gmail.com", "kate@kateviolet.com"];

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  skipOnboarding = false,
}) => {
  const { user, loading } = useSupabase();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState(null);

  // 1. LOADING SAFETY VALVE - Wait for auth to finish loading
  if (loading) {
    console.log("[ProtectedRoute] Auth loading, waiting...");
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // 2. NO USER -> SIGN IN (unless already on auth pages)
  if (!user) {
    console.log("[ProtectedRoute] No user, redirecting to signin");
    // If we're already on signin/signup, don't redirect again
    if (["/signin", "/signup"].includes(location.pathname)) {
      return children;
    }
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 3. GOD MODE CHECK (Synchronous & Instant)
  const userEmail = user.email?.toLowerCase() || "";
  const isAdmin = GOD_EMAILS.includes(userEmail);
  const isGodUser = isAdmin;

  // 4. DERIVE OTHER FLAGS
  const subscriptionStatus = user?.user_metadata?.subscription_status || "none";
  const hasActivePlan =
    subscriptionStatus !== "none" && subscriptionStatus !== "free";
  const isFreeUser = !isGodUser && !hasActivePlan;

  // 5. DEBUG LOG
  console.log("[ProtectedRoute] DECISION:", {
    email: userEmail,
    isGodUser,
    isFreeUser,
    hasActivePlan,
    path: location.pathname,
    timestamp: new Date().toISOString(),
  });

  // 6. GOD USER BYPASS - The Golden Rule
  if (isGodUser) {
    console.log("[ProtectedRoute] GOD USER - BYPASS GRANTED");

    // If on select-plan, redirect to app/home
    if (location.pathname === "/select-plan") {
      console.log("[ProtectedRoute] God user -> Redirecting from select-plan to app/home");
      return <Navigate to="/app/home" replace />;
    }

    // If on auth pages, redirect to app/home
    if (["/signin", "/signup"].includes(location.pathname)) {
      console.log("[ProtectedRoute] God user -> Redirecting from auth page to app/home");
      return <Navigate to="/app/home" replace />;
    }

    // OTHERWISE: ALLOW EVERYTHING
    return children;
  }

  // 7. PAID USER CHECK (Non-God with plans)
  if (hasActivePlan) {
    console.log("[ProtectedRoute] PAID USER - Access granted");

    // Redirect from select-plan to app/home
    if (location.pathname === "/select-plan") {
      return <Navigate to="/app/home" replace />;
    }

    // Redirect from auth pages to app/home
    if (["/signin", "/signup"].includes(location.pathname)) {
      return <Navigate to="/app/home" replace />;
    }

    return children;
  }

  // 8. ADMIN REQUIREMENT CHECK
  if (requireAdmin && !isAdmin) {
    console.log("[ProtectedRoute] Admin required but user is not admin");
    return <Navigate to="/app/home" state={{ accessDenied: true }} replace />;
  }

  // 9. ONBOARDING CHECK (Non-God users only)
  useEffect(() => {
    async function checkOnboarding() {
      if (!user || skipOnboarding || isGodUser || onboardingStatus !== null) {
        return;
      }

      try {
        const response = await api.get("/users/me/onboarding-status");
        setOnboardingStatus(response.data.onboarding_completed);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        setOnboardingStatus(false);
      }
    }

    checkOnboarding();
  }, [user, skipOnboarding, isGodUser, onboardingStatus]);

  if (
    !skipOnboarding &&
    !isGodUser &&
    onboardingStatus === false &&
    location.pathname !== "/onboarding" &&
    location.pathname !== "/select-plan"
  ) {
    console.log("[ProtectedRoute] Onboarding required");
    return <Navigate to="/onboarding" replace />;
  }

  // 10. FREE USERS - Must be on select-plan
  if (isFreeUser && location.pathname !== "/select-plan") {
    console.log("[ProtectedRoute] FREE user -> Redirecting to select-plan");
    return <Navigate to="/select-plan" replace />;
  }

  // DEFAULT: Allow access
  console.log("[ProtectedRoute] Access granted");
  return children;
};

export default ProtectedRoute;
