import { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Routes that should auto-collapse sidebar for more space
const AUTO_COLLAPSE_ROUTES = [
  // Builders (CRITICAL - need canvas space)
  '/app/workflows/builder',
  '/app/workflows',
  '/app/forms/builder',
  '/app/email-marketing/create',
  '/app/email-marketing',

  // Kanban/Canvas views
  '/app/pipeline',
  '/app/opportunities',
  '/app/calendar',
  '/app/boards',

  // Data tables (benefit from extra width)
  '/app/leads',
  '/app/contacts',
  '/app/inbox',
  '/app/activities',

  // Settings (focus mode)
  '/app/settings',

  // Reports (charts need space)
  '/app/reports',
  '/app/funnels',
  '/app/meetings',
];
import { Search, Command, ChevronLeft } from "lucide-react";
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
    subscription,
    subscriptionLoading,
    isGodMode,
    hasActiveSubscription,
  } = useAgency();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const [userManuallyExpanded, setUserManuallyExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pinnedButtons, setPinnedButtons] = useState(["help", "notifications"]);

  // Check if current route should auto-collapse
  const isAutoCollapsePage = AUTO_COLLAPSE_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  // Auto-collapse effect - collapse on auto-collapse pages unless user manually expanded
  // Uses 100ms delay for smoother transition when navigating
  useEffect(() => {
    if (isAutoCollapsePage && !userManuallyExpanded) {
      const timer = setTimeout(() => {
        setIsSidebarCollapsed(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isAutoCollapsePage, userManuallyExpanded]);

  // Reset manual override when leaving auto-collapse pages
  useEffect(() => {
    if (!isAutoCollapsePage) {
      setUserManuallyExpanded(false);
    }
  }, [isAutoCollapsePage]);

  // Sidebar toggle handler with manual override tracking
  const handleSidebarToggle = useCallback(() => {
    const newCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsed);
    // If on auto-collapse page and user expands, remember it
    if (isAutoCollapsePage && !newCollapsed) {
      setUserManuallyExpanded(true);
    }
  }, [isSidebarCollapsed, isAutoCollapsePage]);

  // Tour functionality
  const { isTourOpen, startTour, closeTour } = useTour("dashboard");

  /**
   * Determine if user needs to create an agency
   *
   * Modal should ONLY show when all conditions are met:
   * 1. All data is fully loaded (no loading states)
   * 2. User is NOT privileged (god mode or active subscriber)
   * 3. User truly has zero agencies AND no current agency
   */
  const needsAgency = useMemo(() => {
    // SAFETY CHECK 1: Wait for agencies to finish loading
    if (agenciesLoading) {
      return false;
    }

    // SAFETY CHECK 2: Wait for subscription data to load
    if (subscriptionLoading) {
      return false;
    }

    // SAFETY CHECK 3: Don't show if loading failed (API error)
    if (agenciesLoadFailed) {
      return false;
    }

    // SAFETY CHECK 4: God users bypass agency requirement
    if (isGodMode()) {
      return false;
    }

    // SAFETY CHECK 5: Active subscribers (paid or trial) shouldn't be blocked
    if (hasActiveSubscription()) {
      return false;
    }

    // SAFETY CHECK 6: Check both agencies array AND currentAgency state
    // Prevents flash when agencies exist but are still hydrating
    const hasNoAgencies = agencies.length === 0;
    const hasNoCurrentAgency = !currentAgency;

    return hasNoAgencies && hasNoCurrentAgency;
  }, [
    agenciesLoading,
    subscriptionLoading,
    agenciesLoadFailed,
    agencies.length,
    currentAgency,
    isGodMode,
    hasActiveSubscription,
  ]);

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

  // DEBUG: Log modal state decisions (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[MandatoryAgencyModal] Modal state evaluation:', {
        needsAgency,
        checks: {
          agenciesLoading,
          subscriptionLoading,
          agenciesLoadFailed,
          agenciesCount: agencies.length,
          hasCurrentAgency: !!currentAgency,
          isGod: isGodMode(),
          hasActiveSub: hasActiveSubscription(),
        },
      });
    }
  }, [needsAgency, agenciesLoading, subscriptionLoading, agencies.length, currentAgency]);

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
          `${import.meta.env.VITE_API_URL || "/api"}/users/me/pinned-actions`,
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
        `${import.meta.env.VITE_API_URL || "/api"}/users/me/pinned-actions`,
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

  // Keyboard shortcuts: Cmd+K (search), Cmd+L (cycle agencies), Cmd+\ (toggle sidebar)
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
      // Cmd+\ or Ctrl+\ - Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        handleSidebarToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleToNextAgency, handleSidebarToggle]);

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "#0B0B0B" }}
    >
      {/* Enhanced Sidebar with progressive disclosure */}
      <SimplifiedSidebar
        currentTheme={currentTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        pinnedButtons={pinnedButtons}
        onPinnedChange={handlePinnedChange}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      />

      {/* Sidebar Toggle Button - Edge Position */}
      <button
        onClick={handleSidebarToggle}
        onMouseEnter={() => setIsToggleHovered(true)}
        onMouseLeave={() => setIsToggleHovered(false)}
        className="fixed z-[60] w-6 h-6 flex items-center justify-center bg-gray-600/40 backdrop-blur-sm border border-gray-500/50 rounded-full shadow-lg text-gray-400 hover:text-white hover:bg-gray-500/60 cursor-pointer active:scale-95"
        style={{
          top: '45%',
          transform: 'translateY(-50%)',
          left: isSidebarCollapsed ? '28px' : '244px',
          opacity: isSidebarCollapsed || isSidebarHovered || isToggleHovered ? 1 : 0,
          transition: 'left 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out, background-color 150ms ease',
          willChange: 'left, opacity',
        }}
        title={isSidebarCollapsed ? "Expand sidebar (⌘\\)" : "Collapse sidebar (⌘\\)"}
      >
        <ChevronLeft
          className="h-3.5 w-3.5"
          style={{
            transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </button>

      {/* Main Content Area - White content card with rounded corner */}
      <div className="flex-1 flex flex-col min-w-0 transform-gpu relative">
        {/* Header positioned at the top of the content area */}
        <header
          className="h-10 w-full backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 shadow-2xl"
          style={{
            background:
              "linear-gradient(90deg, #0a0a0a 0%, #1a0812 30%, #3F0D28 50%, #1a0812 70%, #0a0a0a 100%)",
          }}
        >
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
        <main className="flex-1 bg-white overflow-x-hidden overflow-y-auto transition-colors duration-300 ease-out rounded-tl-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
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
            {agenciesError ||
              "Failed to load agencies. Please refresh the page."}
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
