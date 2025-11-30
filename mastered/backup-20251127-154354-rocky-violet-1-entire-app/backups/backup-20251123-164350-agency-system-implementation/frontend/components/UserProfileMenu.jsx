import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Download, Zap, Code, Trash2, Archive, Settings, 
  Users, LogOut, HelpCircle, Palette, ArrowUpCircle, Bell, Building, ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabase } from '@/context/SupabaseContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function UserProfileMenu({ trigger, userName = "User", userEmail = "user@axolopcrm.com", agencyName = "My Agency" }) {
  const navigate = useNavigate();
  const { signOut } = useSupabase();
  const { theme, setTheme } = useTheme();
  const [notificationStatus, setNotificationStatus] = useState('off');

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-[#1a1d24] border-gray-700 text-white p-0"
      >
        {/* Header with Logo and Agency Name */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="h-10 w-10 bg-[#ffed00] rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">AX</span>
          </div>
          <span className="font-semibold text-base">Axolop CRM</span>
        </div>

        {/* Account Section */}
        <div className="py-2">
          <DropdownMenuLabel className="text-xs text-gray-400 px-4 py-2 font-normal">
            Account
          </DropdownMenuLabel>
          
          <DropdownMenuItem 
            onClick={() => navigate('/app/profile')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <User className="h-4 w-4 mr-3 text-gray-400" />
            <span>My profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/import')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Download className="h-4 w-4 mr-3 text-gray-400" />
            <span>Import data</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/workflows')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Zap className="h-4 w-4 mr-3 text-gray-400" />
            <span>Automations</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/developers')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Code className="h-4 w-4 mr-3 text-gray-400" />
            <span>Developers</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/trash')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Trash2 className="h-4 w-4 mr-3 text-gray-400" />
            <span>Trash</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/archive')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Archive className="h-4 w-4 mr-3 text-gray-400" />
            <span>Archive</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/settings')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Settings className="h-4 w-4 mr-3 text-gray-400" />
            <span>Administration</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => navigate('/app/teams')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Users className="h-4 w-4 mr-3 text-gray-400" />
            <span>Teams</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleLogout}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <LogOut className="h-4 w-4 mr-3 text-gray-400" />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Working Status Section */}
        <div className="py-2">
          <DropdownMenuLabel className="text-xs text-gray-400 px-4 py-2 font-normal">
            Working status
          </DropdownMenuLabel>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5">
              <Bell className="h-4 w-4 mr-3 text-gray-400" />
              <span>Do not disturb</span>
              <span className="ml-auto text-xs text-gray-500 capitalize">{notificationStatus}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1d24] border-gray-700 text-white">
              <DropdownMenuItem 
                onClick={() => setNotificationStatus('off')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                Off
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setNotificationStatus('on')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                On
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Additional Options */}
        <div className="py-2">
          <DropdownMenuItem 
            onClick={() => navigate('/app/help')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <HelpCircle className="h-4 w-4 mr-3 text-gray-400" />
            <span>Get help</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5">
              <Palette className="h-4 w-4 mr-3 text-gray-400" />
              <span>Change theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1d24] border-gray-700 text-white">
              <DropdownMenuItem 
                onClick={() => setTheme('light')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                Light
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('dark')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('system')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem 
            onClick={() => navigate('/app/upgrade')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <ArrowUpCircle className="h-4 w-4 mr-3 text-gray-400" />
            <span>Upgrade account</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}