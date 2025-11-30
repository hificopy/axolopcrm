// frontend/components/AppBootstrap.jsx

import { useEffect, useState } from "react";
import { useSupabase } from "@/context/SupabaseContext";
import { useAgency } from "@/hooks/useAgency";
import bootstrapService from "../services/bootstrapService";

export default function AppBootstrap({ children }) {
  const { user, loading: authLoading } = useSupabase();
  const { loading: agenciesLoading, loadFailed } = useAgency();
  const [bootstrapError, setBootstrapError] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapComplete, setBootstrapComplete] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Only run bootstrap if user is authenticated
        if (!user || authLoading) {
          return;
        }

        // Check if already bootstrapped in this session
        const hasBootstrapped = sessionStorage.getItem("axolop_bootstrapped");
        if (hasBootstrapped) {
          console.log("[AppBootstrap] Already bootstrapped, skipping...");
          setBootstrapComplete(true);
          return;
        }

        // Start bootstrap process
        setIsBootstrapping(true);

        // Don't wait for agencies - proceed with bootstrap even if they're loading
        // This prevents blocking the UI
        if (agenciesLoading) {
          console.log(
            "[AppBootstrap] Agencies still loading, proceeding with bootstrap...",
          );
        }

        // Check if agencies failed to load (non-blocking)
        if (loadFailed) {
          console.warn(
            "[AppBootstrap] Agency load failed, proceeding with bootstrap...",
          );
        }

        // Load bootstrap data with timeout to prevent hanging
        console.log("[AppBootstrap] Starting bootstrap...");
        const bootstrapPromise = bootstrapService.loadBootstrapData();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Bootstrap timeout")), 5000),
        );

        const result = await Promise.race([bootstrapPromise, timeoutPromise]);

        if (result.success) {
          console.log("[AppBootstrap] Bootstrap completed successfully");
          sessionStorage.setItem("axolop_bootstrapped", "true");
          setBootstrapError(null);
          setBootstrapComplete(true);
        } else {
          throw new Error(result.error || "Failed to initialize app");
        }
      } catch (error) {
        console.error("[AppBootstrap] Bootstrap error:", error);
        setBootstrapError(error.message);
        // Still set bootstrap complete to allow app to render
        setBootstrapComplete(true);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [user?.id, authLoading]); // Only depend on user ID and auth loading

  // Reset bootstrap flag when user logs out or switches agencies
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "axolop_user_logout" || e.key === "axolop_agency_switch") {
        console.log(
          "[AppBootstrap] User logout/agency switch detected, resetting bootstrap flag",
        );
        sessionStorage.removeItem("axolop_bootstrapped");
        setBootstrapComplete(false);
        setIsBootstrapping(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Show minimal loading screen ONLY during initial bootstrap
  if (isBootstrapping && !bootstrapComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          {/* Axolop Logo */}
          <div className="w-12 h-12 mx-auto mb-3 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28] to-[#8B1538] rounded-lg animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/axolop-logo.png"
                alt="Axolop CRM"
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          {/* Quick Loading Animation */}
          <div className="flex space-x-1 justify-center mb-3">
            <div
              className="w-1.5 h-1.5 bg-[#3F0D28] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-[#3F0D28] rounded-full animate-bounce"
              style={{ animationDelay: "100ms" }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-[#3F0D28] rounded-full animate-bounce"
              style={{ animationDelay: "200ms" }}
            ></div>
          </div>

          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show error state but still render app
  if (bootstrapError) {
    return (
      <div className="min-h-screen">
        {children}
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-lg shadow-lg max-w-sm z-50">
          <p className="text-sm font-medium">
            ⚠️ App initialized with errors. Some features may be unavailable.
          </p>
        </div>
      </div>
    );
  }

  // App is ready, render children immediately
  return <>{children}</>;
}
