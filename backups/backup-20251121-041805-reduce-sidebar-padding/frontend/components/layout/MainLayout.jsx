import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Megaphone, Bell, HelpCircle, UserPlus, ChevronDown, Search, Command, MessageSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAffiliatePopup } from '@/contexts/AffiliatePopupContext';
import { useSupabase } from '@/context/SupabaseContext';
import Sidebar from './Sidebar';
import TodoSlideOver from '../TodoSlideOver';
import ChatSlideOver from '../ChatSlideOver';
import AffiliatePopup from '../AffiliatePopup';
import AnnouncementSidebar from '../AnnouncementSidebar';
import DemoModeButton from '../DemoModeButton';
import UltraSmoothMasterSearch from '../UltraSmoothMasterSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MainLayout() {
  const { theme } = useTheme();
  const { isOpen, closePopup } = useAffiliatePopup();
  const { user, signOut } = useSupabase();
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300 ease-out">
      {/* Background that extends under both sidebar and header for seamless appearance */}
      <div className="fixed inset-0 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] -z-10"></div>

      {/* Sidebar - transparent to show background */}
      <Sidebar />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header - transparent to show same background as sidebar */}
        <header className="h-14 flex items-center px-6 bg-transparent border-b border-gray-800/50">
          {/* RIGHT: Actions & Profile */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Action Icons - Minimal, No Backgrounds */}
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all relative">
              <Bell className="h-5 w-5" />
              {/* Notification Dot */}
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all hidden sm:block">
              <UserPlus className="h-5 w-5" />
            </button>

            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all hidden sm:block">
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-medium ring-2 ring-white/30 shadow-sm hover:ring-white/50 transition-all">
                  {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border border-gray-700/50 text-white">
                <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700/50" />
                <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50" asChild>
                  <Link to="/app/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50" asChild>
                  <Link to="/app/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700/50" />
                <DropdownMenuItem
                  className="text-red-400 hover:bg-gray-800/50"
                  onSelect={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content - dashboard area that changes with theme */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300 ease-out ${theme === 'dark' ? 'bg-[#0d0f12] text-white' : 'bg-gray-50 text-gray-900'} rounded-tl-2xl`}>
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Ultra Smooth Master Search Modal */}
      <UltraSmoothMasterSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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
