import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Download, Zap, Code, Trash2, Archive, Settings,
  Users, LogOut, HelpCircle, Palette, ArrowUpCircle, Bell, Building, ChevronDown, SlidersHorizontal, Lock, UserPlus
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
import { useAgency } from '@/hooks/useAgency';
import { useTheme } from '@/contexts/ThemeContext';
import InviteMemberModal from './InviteMemberModal';

export default function UserProfileMenu({ trigger }) {
  const navigate = useNavigate();
  const { user, signOut } = useSupabase();
  const { currentAgency, isAdmin } = useAgency();
  const { theme, setTheme } = useTheme();
  const [notificationStatus, setNotificationStatus] = useState('off');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get user info
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@axolopcrm.com';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const agencyName = currentAgency?.name || 'My Agency';
  const agencyLogo = currentAgency?.logo_url;

  // Get subscription tier - can be 'Free', 'Sales', 'Build', 'Scale', or 'God'
  // Admin emails get God tier automatically
  const getSubscriptionTier = () => {
    const adminEmails = ['axolopcrm@gmail.com', 'kate@kateviolet.com'];

    // Check if user is an admin
    if (adminEmails.includes(userEmail)) {
      return 'God';
    }

    // Check for subscription tier in user metadata or agency
    const tier = user?.user_metadata?.subscription_tier || currentAgency?.subscription_tier;

    // If no tier found (no Stripe subscription), default to Free
    return tier || 'Free';
  };

  const subscriptionTier = getSubscriptionTier();

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-72 max-h-[calc(100vh-100px)] overflow-y-auto bg-[#1a1d24] border-gray-700 text-white p-0 z-[9999]"
      >
        {/* Header with User Avatar and Info */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-[#E92C92] rounded-full flex items-center justify-center shadow-lg shadow-[#E92C92]/20">
              <span className="text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-base text-white truncate">{userName}</p>
              <span className="text-xs text-gray-400 shrink-0">{subscriptionTier}</span>
            </div>
            <p className="text-xs text-gray-400 truncate">{agencyName}</p>
          </div>
        </div>

        {/* Seat Usage Section (Admin Only) */}
        {currentAgency && isAdmin && isAdmin() && (
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Team Seats</span>
              <span className="text-sm font-semibold text-white">
                {currentAgency.current_users || 0} / {currentAgency.max_users || 3}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
              <div
                className="bg-yellow-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(((currentAgency.current_users || 0) / (currentAgency.max_users || 3)) * 100, 100)}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {(currentAgency.max_users || 3) - (currentAgency.current_users || 0)} seats available
              </span>
              {currentAgency.max_users > 3 && (
                <span className="text-yellow-400">
                  ${((currentAgency.max_users - 3) * 12).toFixed(0)}/mo
                </span>
              )}
            </div>
          </div>
        )}

        {/* Account Section */}
        <div className="py-2">
          <DropdownMenuLabel className="text-xs text-gray-300 px-4 py-2 font-normal uppercase tracking-wider">
            Account
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigate('/app/profile')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <User className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">My profile</span>
          </DropdownMenuItem>

          {currentAgency && isAdmin && isAdmin() && (
            <DropdownMenuItem
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
            >
              <UserPlus className="h-4 w-4 mr-3 text-white" />
              <span className="text-white">Invite team member</span>
            </DropdownMenuItem>
          )}

          <div className="relative group">
            <DropdownMenuItem
              disabled
              className="px-4 py-2.5 cursor-not-allowed opacity-50 relative"
            >
              <Download className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-400">Import data</span>
              <Lock className="h-3 w-3 ml-auto text-gray-400" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                  Coming in V1.1
                </div>
              </div>
            </DropdownMenuItem>
          </div>

          <div className="relative group">
            <DropdownMenuItem
              disabled
              className="px-4 py-2.5 cursor-not-allowed opacity-50 relative"
            >
              <Zap className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-400">Automations</span>
              <Lock className="h-3 w-3 ml-auto text-gray-400" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                  Coming in V1.1
                </div>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuItem
            onClick={() => navigate('/app/settings/integrations/developer')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Code className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">Developers</span>
          </DropdownMenuItem>

          <div className="relative group">
            <DropdownMenuItem
              disabled
              className="px-4 py-2.5 cursor-not-allowed opacity-50 relative"
            >
              <Trash2 className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-400">Trash</span>
              <Lock className="h-3 w-3 ml-auto text-gray-400" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                  Coming in V1.1
                </div>
              </div>
            </DropdownMenuItem>
          </div>

          <div className="relative group">
            <DropdownMenuItem
              disabled
              className="px-4 py-2.5 cursor-not-allowed opacity-50 relative"
            >
              <Archive className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-400">Archive</span>
              <Lock className="h-3 w-3 ml-auto text-gray-400" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                  Coming in V1.1
                </div>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuItem
            onClick={() => navigate('/app/settings')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Settings className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate('/app/settings/agency')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <Building className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">Agency Settings</span>
          </DropdownMenuItem>

          <div className="relative group">
            <DropdownMenuItem
              disabled
              className="px-4 py-2.5 cursor-not-allowed opacity-50 relative"
            >
              <Users className="h-4 w-4 mr-3 text-gray-400" />
              <span className="text-gray-400">Teams</span>
              <Lock className="h-3 w-3 ml-auto text-gray-400" />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                  Coming in V1.2
                </div>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuItem
            onClick={() => navigate('/app/settings')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <SlidersHorizontal className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">All Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <LogOut className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">Log out</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Working Status Section */}
        <div className="py-2">
          <DropdownMenuLabel className="text-xs text-gray-300 px-4 py-2 font-normal uppercase tracking-wider">
            Working status
          </DropdownMenuLabel>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5">
              <Bell className="h-4 w-4 mr-3 text-white" />
              <span className="text-white">Do not disturb</span>
              <span className="ml-auto text-xs text-gray-400 capitalize">{notificationStatus}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1d24] border-gray-700 text-white">
              <DropdownMenuItem
                onClick={() => setNotificationStatus('off')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                <span className="text-white">Off</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setNotificationStatus('on')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                <span className="text-white">On</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Additional Options */}
        <div className="py-2">
          <DropdownMenuItem
            onClick={() => navigate('/help')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <HelpCircle className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">Get help</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5">
              <Palette className="h-4 w-4 mr-3 text-white" />
              <span className="text-white">Change theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1d24] border-gray-700 text-white">
              <DropdownMenuItem
                onClick={() => setTheme('light')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                <span className="text-white">Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('dark')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                <span className="text-white">Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('system')}
                className="px-4 py-2 cursor-pointer hover:bg-white/5"
              >
                <span className="text-white">System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            onClick={() => navigate('/app/settings/billing')}
            className="px-4 py-2.5 cursor-pointer hover:bg-white/5 focus:bg-white/5"
          >
            <ArrowUpCircle className="h-4 w-4 mr-3 text-white" />
            <span className="text-white">Upgrade account</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Invite Member Modal */}
    <InviteMemberModal
      isOpen={showInviteModal}
      onClose={() => setShowInviteModal(false)}
      onSuccess={() => {
        // Modal will refresh agency context automatically
        console.log('Member invited successfully');
      }}
    />
  </>
  );
}