import { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Search, Command } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import { useSupabase } from "@/context/SupabaseContext";
import { useAgency } from "@/hooks/useAgency";
import { toast } from "@/components/ui/use-toast";
import { getPreset, generateThemeCSS } from "@/config/agencyThemes";
import axios from "axios";
import SimplifiedSidebar from "./SimplifiedSidebar";
import UniversalSearch from "../UniversalSearch";
import { InteractiveTour, useTour } from "../InteractiveTour";
import AffiliatePopup from "../AffiliatePopup";
import UserProfileMenu from "../UserProfileMenu";
import PinnedQuickActions from "./PinnedQuickActions";
import MandatoryAgencyModal from "../MandatoryAgencyModal";
import { Tooltip } from "../ui/tooltip";

export default function MainLayout() {
  const { theme } = useTheme();
  const { isOpen, closePopup } = useAffiliatePopup();
  const { user, supabase } = useSupabase();
  const {
    agencies,
    currentAgency,
    switchAgency,
    loading: agenciesLoading,
    loadFailed: agenciesLoadFailed,
    error: agenciesError,
  } = useAgency();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pinnedButtons, setPinnedButtons] = useState(["help", "notifications"]);

  // Tour functionality
  const { isTourOpen, startTour, closeTour } = useTour("dashboard");

  // Check if user needs to create an agency
  // IMPORTANT: Don't show modal if loading failed - that means API error, not "no agencies"
  const needsAgency = !agenciesLoading && !agenciesLoadFailed && agencies.length === 0;

  // Get current agency theme
  const currentThemeId = currentAgency?.settings?.theme || "default";
  const currentTheme = useMemo(
    () => getPreset(currentThemeId),
    [currentThemeId],
  );
  const themeStyles = useMemo(
    () => generateThemeCSS(currentThemeId),
    [currentThemeId],
  );

  // Cycle to next agency (Cmd+L / Ctrl+L)
  const cycleToNextAgency = useCallback(async () => {
    if (agencies.length <= 1) return;

    const currentIndex = agencies.findIndex(
      (a) => a.agency_id === currentAgency?.id,
    );
    const nextIndex = (currentIndex + 1) % agencies.length;
    const nextAgency = agencies[nextIndex];

    if (nextAgency) {
      await switchAgency(nextAgency.agency_id);
      toast({
        title: `Switched to ${nextAgency.agency_name}`,
        description:
          agencies.length > 2
            ? `Press ⌘L to cycle (${nextIndex + 1}/${agencies.length})`
            : undefined,
      });
    }
  }, [agencies, currentAgency, switchAgency]);

  // Load pinned buttons preferences
  useEffect(() => {
    const loadPinnedButtons = async () => {
      if (!user || !supabase) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || '/api'}/users/me/pinned-actions`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        if (response.data.success) {
          setPinnedButtons(response.data.data);
        }
      } catch (error) {
        console.error("Error loading pinned buttons:", error);
      }
    };

    loadPinnedButtons();
  }, [user, supabase]);

  // Save pinned buttons when changed
  const handlePinnedChange = async (newPinned) => {
    // Store the previous state for potential rollback
    const previousPinned = [...pinnedButtons];

    // Optimistic update - update the UI immediately
    setPinnedButtons(newPinned);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // If no session, revert the change
        setPinnedButtons(previousPinned);
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL || '/api'}/users/me/pinned-actions`,
        { buttons: newPinned },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
    } catch (error) {
      console.error("Error saving pinned buttons:", error);
      // Revert the optimistic update on error
      setPinnedButtons(previousPinned);
    }
  };

  // Keyboard shortcuts: Cmd+K (search), Cmd+L (cycle agencies)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K - Open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Cmd+L or Ctrl+L - Cycle through agencies
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        cycleToNextAgency();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleToNextAgency]);

  return (
    <div
      className="flex h-screen w-full overflow-hidden transition-colors duration-500 ease-out"
      style={{
        backgroundColor: "#000000",
        // Apply CSS variables for theme
        "--crm-sidebar-gradient-start":
          themeStyles["--crm-sidebar-gradient-start"],
        "--crm-sidebar-gradient-mid": themeStyles["--crm-sidebar-gradient-mid"],
        "--crm-sidebar-gradient-end": themeStyles["--crm-sidebar-gradient-end"],
        "--crm-sidebar-hover": themeStyles["--crm-sidebar-hover"],
        "--crm-sidebar-active": themeStyles["--crm-sidebar-active"],
      }}
    >
      {/* Enhanced Sidebar with progressive disclosure */}
      <SimplifiedSidebar
        currentTheme={currentTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        pinnedButtons={pinnedButtons}
        onPinnedChange={handlePinnedChange}
      />

      {/* Main Content Area - White content card with rounded corner */}
      <div className="flex-1 flex flex-col min-w-0 transform-gpu relative">
        {/* Header positioned at the top of the content area */}
        <header className="h-10 w-full bg-gradient-to-r from-black/95 via-gray-900/90 to-gray-800/90 backdrop-blur-xl border-b border-white/5 border-l-0 sticky top-0 z-50 flex items-center justify-between px-6 shadow-2xl">
          {/* Enhanced Universal Search Bar */}
          <div
            className="flex-shrink-0 w-[calc(100%-240px)] ml-[78px] universal-search 
                          sm:w-[300px] md:w-[400px] lg:w-[500px] xl:w-[600px] 2xl:max-w-4xl"
          >
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group w-full flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Search className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors truncate">
                Search anything in your CRM...
              </span>
              <div className="ml-auto flex items-center gap-0.5 text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 flex-shrink-0">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right side - action buttons with icons */}
          <div className="flex items-center space-x-4">
            {/* Pinned Quick Actions */}
            <PinnedQuickActions pinnedButtons={pinnedButtons} />

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-3">
              {/* Agency Profile - will show first letter of selected agency */}
              <Tooltip content="Switch Agency" position="bottom" delay={500}>
                <div className="btn-premium-red h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                  A
                </div>
              </Tooltip>
              {/* User Profile with Menu */}
              <UserProfileMenu
                trigger={
                  <button className="btn-premium-red h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10 hover:ring-white/30 transition-all cursor-pointer">
                    {user?.user_metadata?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() ||
                      user?.email?.substring(0, 2).toUpperCase() ||
                      "U"}
                  </button>
                }
                userName={user?.user_metadata?.full_name || "User"}
                userEmail={user?.email || "user@axolopcrm.com"}
              />
            </div>
          </div>
        </header>

        {/* Universal Search Modal */}
        <UniversalSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* Page Content - dashboard area that changes with theme */}
        <main className="flex-1 bg-white overflow-x-hidden overflow-y-auto transition-colors duration-300 ease-out rounded-tl-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border-l border-t border-white/10">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 pb-6">
            {/* Interactive Tour */}
            <InteractiveTour
              tourKey="dashboard"
              isOpen={isTourOpen}
              onClose={closeTour}
            />

            <Outlet />
          </div>
        </main>
      </div>

      {/* Affiliate Popup */}
      <AffiliatePopup isOpen={isOpen} onClose={closePopup} />

      {/* Error Banner for Agency Load Failure */}
      {agenciesLoadFailed && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm font-medium">
            {agenciesError || "Failed to load agencies. Please refresh the page."}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Mandatory Agency Creation Modal */}
      <MandatoryAgencyModal isOpen={needsAgency} />
    </div>
  );
}
