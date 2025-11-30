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
      <div className="h-16 bg-[#2c0202] dark:bg-[#2c0202] border-b border-white/10 flex items-center px-8 gap-6 shadow-2xl">
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

      </div>

      {/* Ultra Smooth Master Search Modal */}
      <UltraSmoothMasterSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
