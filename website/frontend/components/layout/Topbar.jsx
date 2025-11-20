import { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, Command, User, LogOut, Settings, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import ThemeToggle from './ThemeToggle';
import UltraSmoothMasterSearch from '../UltraSmoothMasterSearch';

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
      <div className="h-16 bg-white dark:bg-[#1a1d24] border-b border-gray-200 dark:border-gray-700 flex items-center px-8 gap-6 shadow-sm">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#0d0f12] border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-[#1a1d24] hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
          >
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="flex-1 text-left text-gray-500 dark:text-gray-400 text-sm">
              Search leads, contacts, campaigns, notes...
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#1a1d24] px-2 py-1 rounded border border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>

      </div>

      {/* Ultra Smooth Master Search Modal */}
      <UltraSmoothMasterSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
