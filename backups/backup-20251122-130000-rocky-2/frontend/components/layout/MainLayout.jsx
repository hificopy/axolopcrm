import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Search, Command, Megaphone, Bell, HelpCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import { useSupabase } from "@/context/SupabaseContext";
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
  const { user } = useSupabase();
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
        <header className="h-10 w-full bg-transparent sticky top-0 z-10 flex items-center justify-between px-6">
          {/* Left side - Search bar moved to the left side */}
          <div className="flex-1 max-w-2xl">
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

          {/* Right side - action buttons with icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-3">
              {/* Agency Profile - will show first letter of selected agency */}
              <div className="h-8 w-8 rounded-full bg-[#7b1c14] flex items-center justify-center text-white text-sm font-bold cursor-pointer" title="Current Agency">
                A
              </div>
              {/* User Profile */}
              <div className="h-8 w-8 rounded-full bg-[#7b1c14] flex items-center justify-center text-white text-sm font-bold">
                {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
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






      {/* Affiliate Popup */}
      <AffiliatePopup isOpen={isOpen} onClose={closePopup} />
    </div>
  );
}
