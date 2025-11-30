import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAffiliatePopup } from '@/contexts/AffiliatePopupContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useSupabase } from '../../context/SupabaseContext';
import axios from 'axios';
import {
  LayoutDashboard, DollarSign, Users, Send, Headset, Inbox, UserPlus, Target,
  TrendingUp, Workflow, Activity, Mail, Layers, Lock, LogOut, ChevronDown, ChevronRight,
  Calendar, FileText, BarChart3, MessageSquare, CheckSquare, Shield, CreditCard,
  Eye, Phone, History, Settings, User, Sparkles, Link as LinkIcon, Filter, Hash,
  Square, Folder, MoreHorizontal, ChevronLeft, Search, Building2
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AgenciesSelector from './AgenciesSelector';

// Top-level navigation items
const topLevelItems = [
  { name: 'Home', href: '/app/home', icon: LayoutDashboard },
];

const mainCategories = [
  {
    name: 'Sales',
    icon: DollarSign,
    items: [
      { name: 'Inbox', href: '/app/inbox', icon: Inbox, badge: 48, locked: true },
      {
        name: 'Leads',
        icon: UserPlus,
        subItems: [
          { name: 'List', href: '/app/leads', icon: UserPlus },
          { name: 'New Custom View', href: '/app/leads/custom-view', icon: Eye, locked: true },
        ]
      },
      { name: 'Contacts', href: '/app/contacts', icon: Users },
      {
        name: 'Opportunities',
        icon: TrendingUp,
        subItems: [
          { name: 'Pipeline', href: '/app/pipeline', icon: Target },
          { name: 'List', href: '/app/opportunities', icon: TrendingUp },
        ]
      },
      { name: 'Workflows', href: '/app/workflows', icon: Workflow },
      {
        name: 'Conversations',
        icon: MessageSquare,
        subItems: [
          { name: 'History', href: '/app/history', icon: History },
          { name: 'Live Calls', href: '/app/live-calls', icon: Phone, locked: true },
        ]
      },
      {
        name: 'Activities',
        icon: Activity,
        subItems: [
          { name: 'List', href: '/app/activities', icon: Activity },
          { name: 'Activity Overview', href: '/app/reports/activity-overview', icon: Activity, locked: true },
          { name: 'Activity Comparison', href: '/app/reports/activity-comparison', icon: BarChart3, locked: true },
          { name: 'Opportunity Funnels', href: '/app/reports/opportunity-funnels', icon: TrendingUp, locked: true },
          { name: 'Status Changes', href: '/app/reports/status-changes', icon: History, locked: true },
          { name: 'Explorer', href: '/app/reports/explorer', icon: Target, locked: true },
        ]
      },
    ]
  },
  {
    name: 'Teams',
    icon: Users,
    items: [
      {
        name: 'Chat',
        icon: MessageSquare,
        subItems: [
          { name: 'Team Chat', href: '/app/team-chat', icon: MessageSquare },
          { name: 'Direct Messages', href: '/app/direct-messages', icon: MessageSquare },
        ]
      },
      {
        name: 'Projects',
        icon: Folder,
        subItems: [
          { name: 'Project Management', href: '/app/projects', icon: Folder },
          { name: 'Task Lists', href: '/app/task-lists', icon: CheckSquare },
          { name: 'Boards', href: '/app/boards', icon: Square },
        ]
      },
    ]
  },
  {
    name: 'Marketing',
    icon: Send,
    items: [
      { name: 'Email Marketing', href: '/app/email-marketing', icon: Mail, locked: true },
      { name: 'Meetings', href: '/app/meetings', icon: Calendar },
      { name: 'Forms', href: '/app/forms', icon: FileText },
      { name: 'Workflows', href: '/app/workflows', icon: Workflow },
      { name: 'Funnels', href: '/app/funnels', icon: Filter, locked: true },
      { name: 'Link in Bio', href: '/app/link-in-bio', icon: LinkIcon, locked: true },
      { name: 'Content', href: '/app/content', icon: Layers, locked: true },
      { name: 'Reports', href: '/app/reports', icon: BarChart3 },
    ]
  },
  {
    name: 'Service',
    icon: Headset,
    items: [
      // Placeholder items for future service features - Locked
      { name: 'Tickets', href: '/app/tickets', icon: Activity, locked: true },
      { name: 'Knowledge Base', href: '/app/knowledge-base', icon: FileText, locked: true },
      { name: 'Customer Portal', href: '/app/customer-portal', icon: Users, locked: true },
      { name: 'Support Analytics', href: '/app/support-analytics', icon: BarChart3, locked: true },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, supabase } = useSupabase();
  const { openPopup } = useAffiliatePopup();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if current user is the parent account
  const isParentAccount = user?.email === 'axolopcrm@gmail.com';
  const [expandedCategories, setExpandedCategories] = useState({
    Sales: false,
    Teams: false,
    Marketing: false,
    Service: false,
  });
  const [expandedSubItems, setExpandedSubItems] = useState({
    Opportunities: false,
    Conversations: false,
    Reports: false,
  });

  // Placeholder data management
  const [hasPlaceholderData, setHasPlaceholderData] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showButton, setShowButton] = useState(true);

  // Check for placeholder data from Supabase (NO localStorage)
  useEffect(() => {
    const checkPlaceholderData = async () => {
      try {
        // Get auth session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // Check Supabase API for placeholder data
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/demo-data/status`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (response.data.success) {
          const hasData = response.data.has_placeholder_data;
          setHasPlaceholderData(hasData);
          setShowButton(hasData);
          console.log(`Placeholder data status: ${hasData ? 'EXISTS' : 'NOT FOUND'}`);
        }
      } catch (error) {
        console.error('Error checking placeholder data:', error);
      }
    };

    if (user && supabase) {
      checkPlaceholderData();
    }
  }, [user, supabase]);

  const handleClearPlaceholderData = async () => {
    if (isClearing || isAnimating) return;

    try {
      setIsClearing(true);
      setIsAnimating(true);

      console.log('🗑️ Clearing all placeholder data from Supabase...');

      // Get auth session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No auth token available');
        return;
      }

      // Call API to clear placeholder data from Supabase
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/demo-data/clear`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log('✅ Placeholder data cleared:', response.data);

      // Start animation sequence (4 seconds total)
      setTimeout(() => {
        setShowButton(false);
        setHasPlaceholderData(false);
        setIsAnimating(false);
        setIsClearing(false);

        // Reload page to show cleared data
        console.log('🔄 Reloading page...');
        window.location.reload();
      }, 4000);

    } catch (error) {
      console.error('❌ Error clearing placeholder data:', error);
      setIsClearing(false);
      setIsAnimating(false);
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const toggleSubItem = (itemName) => {
    setExpandedSubItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleLogout = async () => {
    // Clear the beta access session to ensure user sees login page after logout
    sessionStorage.removeItem('betaAccess');

    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Navigate to the sign in page
      navigate('/signin');
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutDialog(false);
  };

  return (
    <div
      className="h-screen w-64 bg-transparent flex flex-col shadow-2xl border-r border-white/10"
    >
      {/* Header section with logo and text */}
      <div className="h-16 bg-transparent flex items-center px-4 rounded-br-2xl">
        <div className="flex items-center gap-2">
          <img
            src="/axolop-logo.png"
            alt="Axolop"
            className="h-8 w-8 object-contain"
          />
          <span className="text-white font-bold text-lg">Axolop CRM</span>
        </div>
      </div>

      {/* Content - only show when not collapsed */}
      <div className="w-full h-full flex flex-col">
        {/* Top Section - Main Categories with Home as a category */}
        <div className="px-3 py-4 border-b border-gray-800/30 bg-gradient-to-b from-black/20 to-transparent">
          {/* Home as a main category - No dropdown */}
          <Link
            key="Home"
            to="/app/home"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/app/home'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* My Tasks button - Same visual styling as Home button */}
          <Link
            key="My Tasks"
            to="/app/todos"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/app/todos'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span>My Tasks</span>
          </Link>

          {/* More button - Same visual styling as Home button */}
          <Link
            key="More"
            to="/app/more"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              location.pathname.startsWith('/app/more')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </Link>

          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-visible py-2 px-3 scrollbar-thin">
            {mainCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories[category.name];

              return (
                <div key={category.name}>
                  {/* Category Header - Glassmorphic */}
                  <div
                    className={`flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200 ease-out overflow-hidden transform-gpu ${
                      isExpanded
                        ? (category.name === 'Marketing'
                            ? 'backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-[hsl(var(--crm-sidebar-hover))]/20 shadow-lg border-l-4 border-primary-blue'
                            : 'backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-[hsl(var(--crm-sidebar-hover))]/20 shadow-lg border-l-4 border-primary-yellow')
                        : 'hover:backdrop-blur-sm hover:bg-gray-500/30 hover:shadow-sm'
                    }`}
                    onClick={() => toggleCategory(category.name)}
                  >
                    {isExpanded && <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-black/10 pointer-events-none" />}
                    <div className="flex items-center flex-1">
                      <div className={`p-2 rounded-lg mr-3 transition-colors duration-200 ease-out ${
                        isExpanded
                          ? (category.name === 'Marketing'
                              ? 'bg-primary-blue/20 text-primary-blue shadow-inner'
                              : 'bg-primary-yellow/20 text-primary-yellow shadow-inner')
                          : 'text-gray-400 hover:text-white'
                      }`}>
                        <Icon className="h-5 w-5 transition-transform duration-200 ease-out" />
                      </div>
                      <span className={`font-semibold transition-colors duration-200 ease-out ${
                        isExpanded
                          ? 'text-white'
                          : 'text-gray-300'
                      }`}>{category.name}</span>
                    </div>
                    <div className={`transition-all duration-200 ease-out transform ${
                      isExpanded ? 'rotate-0' : '-rotate-90'
                    } will-change-transform`}>
                      {isExpanded ?
                        <ChevronDown className="h-4 w-4 text-gray-400" /> :
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="ml-3 space-y-1 mt-1 pl-2 border-l-2 border-[hsl(var(--crm-sidebar-hover))]/40 pb-2">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = location.pathname === item.href;
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isSubExpanded = expandedSubItems[item.name];

                        if (hasSubItems) {
                          return (
                            <div key={item.name}>
                              {/* Parent Item with Sub-dropdown */}
                              <div
                                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ml-2 ${
                                  isSubExpanded
                                    ? 'text-white bg-[hsl(var(--crm-sidebar-hover))]/30'
                                    : 'text-gray-400 hover:bg-gray-500/30 hover:text-white'
                                }`}
                              >
                                <div
                                  className="flex items-center flex-1 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // First, check if there's a 'List', 'Pipeline', 'Overview', or 'History' sub-item and navigate to it
                                    const defaultSubItem = item.subItems.find(sub =>
                                      sub.name.toLowerCase().includes('list') ||
                                      sub.name.toLowerCase() === 'pipeline' ||
                                      sub.name.toLowerCase() === 'overview' ||
                                      sub.name.toLowerCase() === 'history'
                                    );
                                    if (defaultSubItem && defaultSubItem.href) {
                                      navigate(defaultSubItem.href);
                                    }
                                  }}
                                >
                                  <ItemIcon className="h-4 w-4 mr-3" />
                                  <span className="text-sm">{item.name}</span>
                                </div>

                                <div
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubItem(item.name);
                                  }}
                                >
                                  {isSubExpanded ?
                                    <ChevronDown className="h-3 w-3 text-gray-400" /> :
                                    <ChevronRight className="h-3 w-3 text-gray-400" />
                                  }
                                </div>
                              </div>

                              {/* Sub Items */}
                              {isSubExpanded && (
                                <div className="ml-6 mt-1 space-y-1">
                                  {item.subItems.map((subItem) => {
                                    const SubItemIcon = subItem.icon;
                                    const isSubActive = location.pathname === subItem.href;

                                    return subItem.locked ? (
                                      <div key={subItem.name} className="relative group ml-2">
                                        <div
                                          className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 cursor-not-allowed ${
                                            'text-gray-500 bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm'
                                          }`}
                                        >
                                          <div className="flex items-center">
                                            <SubItemIcon className="h-3.5 w-3.5 mr-3 text-gray-500" />
                                            <span className="text-xs text-gray-500">{subItem.name}</span>
                                          </div>
                                          {/* Lock Overlay */}
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-lg">
                                            <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-1 border border-gray-600/40">
                                              <Lock className="h-3 w-3 text-gray-300" />
                                            </div>
                                          </div>
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                          <div className="backdrop-blur-xl bg-gray-900/80 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-600/40">
                                            Coming in V1.1
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <Link
                                        key={subItem.name}
                                        to={subItem.href}
                                        className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                                          isSubActive
                                            ? 'bg-gradient-to-r from-primary-green/15 via-primary-green/10 to-transparent text-primary-green border-r-2 border-primary-green shadow-inner backdrop-blur-sm'
                                            : 'text-gray-400 hover:bg-gray-500/30 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm'
                                        }`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <SubItemIcon className="h-3.5 w-3.5 mr-3" />
                                        <span className="text-xs">{subItem.name}</span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular Item without sub-items
                        return item.locked ? (
                          <div key={item.name} className="relative group ml-2">
                            <div
                              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 cursor-not-allowed ${
                                'text-gray-500 bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm'
                              }`}
                            >
                              <div className="flex items-center">
                                <ItemIcon className="h-4 w-4 mr-3 text-gray-500" />
                                <span className="text-sm text-gray-500">{item.name}</span>
                              </div>
                              {/* Lock Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-lg">
                                <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-1 border border-gray-600/40">
                                  <Lock className="h-3 w-3 text-gray-300" />
                                </div>
                              </div>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                              <div className="backdrop-blur-xl bg-gray-900/80 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-600/40">
                                Coming in V1.1
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ml-2 ${
                              isActive
                                ? 'bg-gradient-to-r from-primary-green/15 via-primary-green/10 to-transparent text-primary-green border-r-2 border-primary-green shadow-inner backdrop-blur-sm'
                                : 'text-gray-400 hover:bg-gray-500/30 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm'
                            }`}
                          >
                            <div className="flex items-center">
                              <ItemIcon className="h-4 w-4 mr-3" />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            {item.badge && (
                              <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-green text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Agencies selector - Where the commission section was */}
          <div className="px-3 py-3 border-t border-gray-800/50">
            <AgenciesSelector />
          </div>

          {/* User Profile Dropdown */}
          <div className="h-16 border-t border-gray-800/50 px-3 flex items-center bg-black/30 backdrop-blur-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full hover:bg-gray-500/30 rounded-lg p-2 transition-all duration-200">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary-accent))] to-red-900 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-[hsl(var(--primary-accent))]/30">
                    {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || 'No email'}</p>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-400 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/profile" className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                {/* Exit Demo Mode - Shows when in biztester demo mode */}
                {isDemoMode && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-orange-400 focus:text-orange-400 cursor-pointer"
                      onSelect={() => {
                        disableDemoMode();
                        window.location.reload(); // Refresh to exit demo mode completely
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-semibold">Exit Demo Mode</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                  onSelect={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log out</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}