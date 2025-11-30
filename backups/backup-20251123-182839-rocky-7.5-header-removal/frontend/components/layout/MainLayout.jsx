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
import UserProfileMenu from '../UserProfileMenu';
import { Tooltip } from '../ui/tooltip';

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
        <header className="h-10 w-full bg-gradient-to-r from-black/95 via-gray-900/90 to-gray-800/90 backdrop-blur-xl border-b border-white/5 border-l-0 sticky top-0 z-50 flex items-center justify-between px-6 shadow-2xl">
          {/* Empty div to maintain layout spacing since search bar is removed */}
          <div className="flex-1 max-w-2xl"></div>

          {/* Right side - action buttons with icons */}
          <div className="flex items-center space-x-4">
            <Tooltip content="Notifications" position="bottom" delay={500}>
              <button className="hover:opacity-80 transition-opacity">
                <Bell className="h-5 w-5" color="white" strokeWidth={2} />
              </button>
            </Tooltip>
            <Tooltip content="Help & Support" position="bottom" delay={500}>
              <button className="hover:opacity-80 transition-opacity">
                <HelpCircle className="h-5 w-5" color="white" strokeWidth={2} />
              </button>
            </Tooltip>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-3">
              {/* Agency Profile - will show first letter of selected agency */}
              <Tooltip content="Switch Agency" position="bottom" delay={500}>
                <div className="h-8 w-8 rounded-full bg-[#7b1c14] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                  A
                </div>
              </Tooltip>
              {/* User Profile with Menu */}
              <UserProfileMenu
                trigger={
                  <button className="h-8 w-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/10 hover:ring-white/30 transition-all cursor-pointer">
                    {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U'}
                  </button>
                }
                userName={user?.user_metadata?.full_name || "User"}
                userEmail={user?.email || "user@axolopcrm.com"}
              />
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
          <div className="max-w-full px-4 sm:px-6 lg:px-8 pb-6">
            <Outlet />
          </div>
        </main>
      </div>






      {/* Affiliate Popup */}
      <AffiliatePopup isOpen={isOpen} onClose={closePopup} />
    </div>
  );
}
