import { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, Command, User, LogOut, Settings, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import ThemeToggle from './ThemeToggle';
import UltraSmoothMasterSearch from '../UltraSmoothMasterSearch';
import UserProfileMenu from '../UserProfileMenu';
import { Tooltip } from '../ui/tooltip';

export default function Topbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useSupabase();

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



  return (
    <>
      <div className="h-16 bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 backdrop-blur-xl border-b border-white/10 flex items-center px-8 gap-6 shadow-2xl">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all group"
          >
            <Search className="h-4 w-4 text-gray-300" />
            <span className="flex-1 text-left text-gray-400 text-sm">
              Search leads, contacts, campaigns, notes...
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-black/20 backdrop-blur-sm px-2 py-1 rounded border border-white/20 group-hover:border-white/30">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right side - action buttons with icons */}
        <div className="flex items-center space-x-4">
          <Tooltip content="Notifications" position="bottom">
            <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content="Help & Support" position="bottom">
            <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
          </Tooltip>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center space-x-3">
            {/* Agency Profile - will show first letter of selected agency */}
            <Tooltip content="Switch Agency" position="bottom">
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
      </div>

      {/* Ultra Smooth Master Search Modal */}
      <UltraSmoothMasterSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
