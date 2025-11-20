import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAffiliatePopup } from '@/contexts/AffiliatePopupContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TodoSlideOver from '../TodoSlideOver';
import ChatSlideOver from '../ChatSlideOver';
import AffiliatePopup from '../AffiliatePopup';
import AnnouncementSidebar from '../AnnouncementSidebar';
import DemoModeButton from '../DemoModeButton';

export default function MainLayout() {
  const { theme } = useTheme();
  const { isOpen, closePopup } = useAffiliatePopup();
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300 ease-out">
      {/* Sidebar - always stays with its own styling */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 transform-gpu">
        {/* Topbar - should remain unchanged */}
        <Topbar />

        {/* Page Content - dashboard area that changes with theme */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300 ease-out ${theme === 'dark' ? 'bg-[#0d0f12] text-white' : 'bg-gray-50 text-gray-900'}`}>
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
