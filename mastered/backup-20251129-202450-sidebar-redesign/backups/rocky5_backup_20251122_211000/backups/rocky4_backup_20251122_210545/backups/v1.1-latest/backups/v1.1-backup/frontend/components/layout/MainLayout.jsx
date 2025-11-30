import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Search, Command, Megaphone } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import Sidebar from "./Sidebar";
import UltraSmoothMasterSearch from "../UltraSmoothMasterSearch";
import TodoSlideOver from "../TodoSlideOver";
import ChatSlideOver from "../ChatSlideOver";
import AffiliatePopup from "../AffiliatePopup";
import AnnouncementSidebar from "../AnnouncementSidebar";
import DemoModeButton from "../DemoModeButton";

export default function MainLayout() {
  const { theme } = useTheme();
  const { isOpen, closePopup } = useAffiliatePopup();
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[hsl(var(--crm-sidebar-gradient-start))] overflow-hidden transition-colors duration-300 ease-out">
      {/* Sidebar with transparent background to show parent container color */}
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area - White content card with rounded corner */}
      <div className="flex-1 flex flex-col min-w-0 transform-gpu relative">
        {/* Header positioned at the top of the content area */}
        <header className="h-14 w-full bg-transparent sticky top-0 z-10 flex items-center justify-between px-6">
          {/* Left side - Empty space for layout consistency */}
          <div className="flex items-center gap-2"></div>

          {/* Center - Search bar with absolute positioning to allow full movement */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="max-w-xl -ml-[29.375rem]">
              {/* This moves the search bar 470px left (480px - 10px) */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-md bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-[#101010]/90 dark:to-[#1a1d24]/90 backdrop-blur-md border border-gray-300/60 dark:border-gray-700/60 hover:from-white hover:to-white dark:hover:from-[#22252c] dark:hover:to-[#22252c] hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <Search className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                <span className="flex-1 text-left text-gray-700 dark:text-gray-200 text-sm font-normal tracking-wide">
                  Search leads, contacts, campaigns, notes...
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-[#22252c]/80 dark:to-[#2c2f38]/80 px-2 py-0.5 rounded border border-gray-300/60 dark:border-gray-700/60 group-hover:border-gray-400 dark:group-hover:border-gray-600 font-medium">
                  <Command className="h-2.5 w-2.5" />
                  <span className="font-mono">K</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right side - action buttons - REMOVED as per requirements */}
        </header>

        {/* Ultra Smooth Master Search Modal */}
        <UltraSmoothMasterSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* Page Content - dashboard area that changes with theme */}
        <main className="flex-1 bg-white overflow-x-hidden overflow-y-auto transition-colors duration-300 ease-out rounded-tl-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border-l border-t border-white/10">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Chat Slide-over - Top Right */}
      <ChatSlideOver />

      {/* Demo Mode Button - Positioned next to chat button */}
      <DemoModeButton />

      {/* Announcement Button - Positioned between Chat and Tasks */}
      <div className="fixed top-3 z-50" style={{ right: "100px" }}>
        <button
          onClick={() => setIsAnnouncementOpen(true)}
          className="relative h-10 w-10 flex items-center justify-center rounded-lg bg-[#7b1c14] text-white hover:bg-[#6b1a12] active:bg-[#5a1810] shadow-lg hover:shadow-xl hover:shadow-red-900/40 transition-all duration-200 group overflow-hidden"
        >
          <Megaphone className="h-5 w-5 text-white group-hover:text-white transition-colors relative z-10" />
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-[#5a1610] rounded-full shadow-lg z-20 flex items-center justify-center text-xs text-white font-bold">
            !
          </span>

          {/* Tooltip - Opaque */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-gray-700">
            Announcements
          </div>
        </button>
      </div>

      {/* Todo Slide-over - Top Right */}
      <TodoSlideOver />

      {/* Announcement Sidebar - Top Right */}
      <AnnouncementSidebar
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
      />

      {/* Affiliate Popup */}
      <AffiliatePopup isOpen={isOpen} onClose={closePopup} />
    </div>
  );
}
