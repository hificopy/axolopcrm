import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Search, Command, Megaphone, Bell, HelpCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import { useSupabase } from "@/context/SupabaseContext";
import axios from 'axios';
import Sidebar from "./Sidebar";
import UltraSmoothMasterSearch from "../UltraSmoothMasterSearch";
import TodoSlideOver from "../TodoSlideOver";
import ChatSlideOver from "../ChatSlideOver";
import AffiliatePopup from "../AffiliatePopup";
import AnnouncementSidebar from "../AnnouncementSidebar";
import DemoModeButton from "../DemoModeButton";
import UserProfileMenu from '../UserProfileMenu';
import PinnedQuickActions from './PinnedQuickActions';
import { Tooltip } from '../ui/tooltip';

export default function MainLayout() {
  const { theme } = useTheme();
  const { isOpen, closePopup } = useAffiliatePopup();
  const { user, supabase } = useSupabase();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pinnedButtons, setPinnedButtons] = useState(['help', 'notifications']);

  // Load pinned buttons preferences
  useEffect(() => {
    const loadPinnedButtons = async () => {
      if (!user || !supabase) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me/pinned-actions`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (response.data.success) {
          setPinnedButtons(response.data.data);
        }
      } catch (error) {
        console.error('Error loading pinned buttons:', error);
      }
    };

    loadPinnedButtons();
  }, [user, supabase]);

  // Save pinned buttons when changed
  const handlePinnedChange = async (newPinned) => {
    setPinnedButtons(newPinned);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/me/pinned-actions`,
        { buttons: newPinned },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
    } catch (error) {
      console.error('Error saving pinned buttons:', error);
    }
  };

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
        pinnedButtons={pinnedButtons}
        onPinnedChange={handlePinnedChange}
      />

      {/* Main Content Area - White content card with rounded corner */}
      <div className="flex-1 flex flex-col min-w-0 transform-gpu relative">
        {/* Header positioned at the top of the content area */}
        <header className="h-10 w-full bg-gradient-to-r from-black/95 via-gray-900/90 to-gray-800/90 backdrop-blur-xl border-b border-white/5 border-l-0 sticky top-0 z-50 flex items-center justify-between px-6 shadow-2xl">
          {/* Minimal Glass Search Bar */}
          <div className="flex-1 max-w-4xl ml-[78px]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group w-full max-w-3xl flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Search className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                Search...
              </span>
              <div className="ml-auto flex items-center gap-0.5 text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
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
                <div className="h-8 w-8 rounded-full bg-[#791C14] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
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
