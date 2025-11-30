import React, { createContext, useContext, useState, useEffect } from "react";

const DemoModeContext = createContext();

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
};

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  // Check trial/subscription status and demo mode
  // IMPORTANT: Trial users should NOT be in demo mode
  useEffect(() => {
    try {
      // Check if user has active trial or subscription
      const trialStatus = localStorage.getItem("subscription_status");

      // If user has active trial or subscription, disable demo mode
      if (trialStatus === "trial" || trialStatus === "active") {
        setSubscriptionStatus(trialStatus);
        setIsDemoMode(false);
        localStorage.removeItem("axolop_demo_mode_enabled");
        return;
      }

      // Otherwise, check demo mode state
      const savedDemoMode = localStorage.getItem("axolop_demo_mode_enabled");
      if (savedDemoMode === "true") {
        setIsDemoMode(true);
      }
    } catch (error) {
      console.warn("[DemoModeContext] Failed to load demo mode state:", error);
    }
  }, []);

  // Save demo mode state to localStorage
  // IMPORTANT: Use same key as AgencyContext ("axolop_demo_mode_enabled")
  useEffect(() => {
    try {
      if (isDemoMode) {
        localStorage.setItem("axolop_demo_mode_enabled", "true");
      } else {
        // Remove the key entirely when demo mode is off to prevent any stale state
        localStorage.removeItem("axolop_demo_mode_enabled");
      }
    } catch (error) {
      console.warn("[DemoModeContext] Failed to save demo mode state:", error);
    }
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    console.log("[DemoModeContext] Toggling demo mode:", !isDemoMode);
    setIsDemoMode(!isDemoMode);
  };

  const enableDemoMode = () => {
    console.log("[DemoModeContext] Enabling demo mode");
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    console.log("[DemoModeContext] Disabling demo mode");
    setIsDemoMode(false);
  };

  // Demo user configuration
  const demoUser = {
    email: "biztester@demo.axolop.com",
    name: "Biz Tester",
    role: "Business User",
    plan: "professional",
    onboardingCompleted: true,
    isDemo: true,
  };

  const value = {
    isDemoMode,
    subscriptionStatus,
    toggleDemoMode,
    enableDemoMode,
    disableDemoMode,
    demoUser,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};
