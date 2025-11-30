import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAffiliatePopup } from '@/contexts/AffiliatePopupContext';
import Sidebar from './Sidebar';
import TodoSlideOver from '../TodoSlideOver';
import ChatSlideOver from '../ChatSlideOver';
import AffiliatePopup from '../AffiliatePopup';
import AnnouncementSidebar from '../AnnouncementSidebar';
import DemoModeButton from '../DemoModeButton';

export default function MainLayout() {
  const { theme } = useTheme();
  const { isOpen, closePopup } = useAffiliatePopup();
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[hsl(var(--crm-sidebar-gradient-start))] overflow-hidden transition-colors duration-300 ease-out">
      {/* Sidebar with transparent background to show parent container color */}
      <Sidebar isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />

      {/* Main Content Area - White content card with rounded corner */}
      <div className={`flex-1 flex flex-col min-w-0 transform-gpu ${isSidebarCollapsed ? 'ml-0' : 'ml-64'} relative`}>
        {/* Header positioned at the top of the content area */}
        <header className="h-14 w-full bg-transparent sticky top-0 z-10 flex items-center px-6">
          {/* Left side - page title */}
          <div>
            <h1 className="text-white text-lg font-semibold">Leads</h1>
            <p className="text-gray-400 text-sm">Manage and track your sales leads...</p>
          </div>
        </header>

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
      <div className="fixed top-3 z-50" style={{ right: '100px' }}>
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
