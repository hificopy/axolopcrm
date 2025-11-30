import React, { useState, useEffect } from 'react';
import {
  Bell,
  HelpCircle,
  UserPlus,
  ChevronDown,
  Search,
  Command
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import UltraSmoothMasterSearch from '../UltraSmoothMasterSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="h-14 flex items-center px-4 rounded-tl-lg bg-transparent">

        {/* LEFT: Transparent Logo and Workspace Selector */}
        <div className="flex items-center gap-4">
          {/* Transparent Logo */}
          <div className="h-10 w-10 flex items-center justify-center">
            <img src="/axolop-logo.png" alt="Axolop" className="h-8 w-8 opacity-80" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-700/50 py-1.5 px-2 rounded-md transition-colors group">
                {/* Workspace Icon */}
                <div className="h-6 w-6 bg-gray-800 rounded text-[10px] flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all">
                  AX
                </div>

                {/* Workspace Name */}
                <span className="text-sm font-bold text-gray-300 group-hover:text-white">
                  AxolopCRM
                </span>

                <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border border-gray-700/50 text-white">
              <DropdownMenuLabel className="text-gray-300">Switch Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700/50" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50">My Primary Agency</DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50">Client Marketing Agency</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700/50" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50">Create new agency</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Optional: Search Bar (Monday Style) */}
          <div className="relative hidden md:block group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="h-8 w-64 pl-9 pr-4 bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:border-white/50 focus:bg-gray-800 focus:ring-0 rounded-md text-sm transition-all outline-none hover:bg-gray-800/70"
            />
          </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-1">

          {/* Action Icons - Minimal, No Backgrounds */}
          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-full transition-all relative">
            <Bell className="h-5 w-5" />
            {/* Notification Dot */}
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-[hsl(var(--crm-sidebar-gradient-start))]"></span>
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-full transition-all hidden sm:block">
            <UserPlus className="h-5 w-5" />
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-full transition-all hidden sm:block">
            <HelpCircle className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-gray-700/50 mx-2 hidden sm:block"></div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 h-8 w-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-medium ring-2 ring-white/30 shadow-sm hover:ring-gray-200 transition-all">
                {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border border-gray-700/50 text-white">
              <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700/50" />
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50" asChild>
                <a href="/app/profile">Profile</a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-gray-800/50" asChild>
                <a href="/app/settings">Settings</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700/50" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-gray-800/50"
                onSelect={handleSignOut}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Ultra Smooth Master Search Modal */}
      <UltraSmoothMasterSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
