import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import { useAffiliatePopup } from '../contexts/AffiliatePopupContext';
import {
  Brain,
  Network,
  FileText,
  Database,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Lock,
  MessageSquare,
  CheckSquare,
  Workflow,
  BookOpen,
  FolderTree,
  Calculator,
  FileCode,
  FileStack,
  GitBranch,
  Users,
  TrendingUp,
  Map,
  Layers,
  Share2,
  StickyNote,
  Search,
  Lightbulb,
  FolderOpen,
  ClipboardList,
  Archive,
  ListTodo,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const mainCategories = [
  {
    name: 'Logic',
    icon: Database,
    href: '/second-brain/logic',
    expanded: false,
    color: 'red', // Like Sales - red/green
    items: []
  },
  {
    name: 'Maps',
    icon: Network,
    expanded: true,
    color: 'blue', // Like Marketing - blue
    items: [
      { name: 'New Board', href: '/second-brain/maps?new=true', icon: Network, action: 'new' }
    ]
  },
  {
    name: 'Notes',
    icon: FileText,
    expanded: true,
    color: 'yellow', // Like Service - yellow
    items: [
      { name: 'New Note', href: '/second-brain/notes?new=true', icon: FileText, action: 'new' }
    ]
  }
];

const SecondBrainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useSupabase();
  const { openPopup } = useAffiliatePopup();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    'Logic': false,
    'Maps': true,
    'Notes': true,
  });

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('betaAccess');

    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      navigate('/signin');
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - EXACT copy of CRM sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border-r border-gray-800/50 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="h-24 flex items-center justify-center px-6 border-b border-gray-800/30 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-md">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7b1c14]/0 via-[#7b1c14]/10 to-[#7b1c14]/0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src="/axolop-logo.png"
              alt="Axolop"
              className="h-[4.5rem] w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Top Section Icons - CRM, Chat, Tasks */}
        <div className="px-3 py-4 border-b border-gray-800/30 bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* CRM Icon - Inactive */}
            <div className="relative group">
              <button
                onClick={() => navigate('/app/home')}
                className="relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-700/20 via-gray-800/30 to-gray-900/40 border-2 border-gray-700/40 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                <BarChart3 className="h-6 w-6 text-gray-300 relative z-10 mb-1" />
                <span className="text-[10px] font-bold text-gray-300 relative z-10 tracking-wide">CRM</span>
              </button>
            </div>

            {/* Chat Icon - Locked */}
            <div className="relative group">
              <button
                disabled
                className="relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-700/20 via-gray-800/30 to-gray-900/40 border-2 border-gray-700/40 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                <MessageSquare className="h-6 w-6 text-gray-400 relative z-10 mb-1" />
                <span className="text-[10px] font-bold text-gray-400 relative z-10 tracking-wide">CHAT</span>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-2 border border-gray-600/40">
                    <Lock className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </button>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="backdrop-blur-xl bg-gray-900/80 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-600/40">
                  Coming in V1.1
                </div>
              </div>
            </div>

            {/* Tasks Icon - Locked */}
            <div className="relative group">
              <button
                disabled
                className="relative flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-700/20 via-gray-800/30 to-gray-900/40 border-2 border-gray-700/40 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
                <CheckSquare className="h-6 w-6 text-gray-400 relative z-10 mb-1" />
                <span className="text-[10px] font-bold text-gray-400 relative z-10 tracking-wide">TASKS</span>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-2 border border-gray-600/40">
                    <Lock className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </button>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="backdrop-blur-xl bg-gray-900/80 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-600/40">
                  Coming in V1.1
                </div>
              </div>
            </div>
          </div>

          {/* Second Brain Button - Full Width - ACTIVE */}
          <button
            onClick={() => navigate('/app/second-brain/logic')}
            className="w-full mt-3 flex items-center justify-center py-2.5 px-3 rounded-lg transition-all duration-300 backdrop-blur-xl bg-gradient-to-r from-[#7b1c14]/40 via-[#7b1c14]/30 to-[#7b1c14]/20 border-2 border-[#7b1c14]/60 shadow-lg overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
            <Brain className="h-5 w-5 text-white relative z-10 mr-2 drop-shadow-lg" />
            <span className="text-sm font-bold text-white relative z-10 tracking-wide drop-shadow-lg">Second Brain</span>
          </button>

          {/* Dashboard & Calendar - Split Row */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link
              to="/app/home"
              className={`flex items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/home'
                  ? 'bg-gradient-to-r from-[#7b1c14]/30 via-[#7b1c14]/20 to-transparent text-white border border-[#7b1c14] shadow-md'
                  : 'text-gray-300 hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white border border-gray-800/30'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              to="/app/calendar"
              className={`flex items-center justify-center py-2 px-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/calendar'
                  ? 'bg-gradient-to-r from-[#7b1c14]/30 via-[#7b1c14]/20 to-transparent text-white border border-[#7b1c14] shadow-md'
                  : 'text-gray-300 hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white border border-gray-800/30'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">Calendar</span>
            </Link>
          </div>
          {/* My Tasks Button */}
          <div className="mt-3">
            <Link
              to="/app/todos"
              className={`flex items-center justify-center w-full py-2.5 px-3 rounded-lg transition-all duration-300 ${
                location.pathname === '/app/todos'
                  ? 'bg-gradient-to-r from-[#7b1c14]/40 via-[#7b1c14]/30 to-[#7b1c14]/20 text-white border-2 border-[#7b1c14]/60 shadow-lg'
                  : 'bg-transparent text-gray-300 hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white border border-gray-800/30'
              }`}
            >
              <ListTodo className="h-5 w-5 mr-3" />
              <span className="text-sm font-bold tracking-wide">My Tasks</span>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <div className="space-y-4">
            {mainCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories[category.name];
              const isActive = location.pathname === category.href;
              const hasItems = category.items && category.items.length > 0;

              // Logic is a direct link, Maps and Notes are expandable
              const isDirectLink = category.name === 'Logic';

              return (
                <div key={category.name}>
                  {/* Category Header - Glassmorphic */}
                  {isDirectLink ? (
                    // Logic - Direct Link
                    <Link
                      to={category.href}
                      className={`flex items-center justify-between rounded-lg mb-1 transition-all duration-300 overflow-hidden ${
                        isActive
                          ? 'backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-[hsl(var(--crm-sidebar-hover))]/20 shadow-lg border-l-4 border-primary-green'
                          : 'hover:backdrop-blur-sm hover:bg-[hsl(var(--crm-sidebar-hover))]/40 hover:shadow-sm'
                      }`}
                    >
                      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-black/10 pointer-events-none" />}
                      <div className="flex items-center flex-1">
                        <div className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                          isActive
                            ? 'bg-primary-green/20 text-primary-green shadow-inner'
                            : 'text-gray-400 hover:text-white'
                        }`}>
                          <Icon className="h-5 w-5 transition-transform duration-300" />
                        </div>
                        <span className={`font-semibold transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-300'
                        }`}>{category.name}</span>
                      </div>
                    </Link>
                  ) : (
                    // Maps and Notes - Expandable
                    <div
                      className={`flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? (category.name === 'Maps'
                              ? 'backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-[hsl(var(--crm-sidebar-hover))]/20 shadow-lg border-l-4 border-primary-blue'
                              : 'backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-[hsl(var(--crm-sidebar-hover))]/20 shadow-lg border-l-4 border-primary-yellow')
                          : 'hover:backdrop-blur-sm hover:bg-[hsl(var(--crm-sidebar-hover))]/40 hover:shadow-sm'
                      }`}
                      onClick={() => toggleCategory(category.name)}
                    >
                      {isExpanded && <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-black/10 pointer-events-none" />}
                      <div className="flex items-center flex-1">
                        <div className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                          isExpanded
                            ? (category.name === 'Maps'
                                ? 'bg-primary-blue/20 text-primary-blue shadow-inner'
                                : 'bg-primary-yellow/20 text-primary-yellow shadow-inner')
                            : 'text-gray-400 hover:text-white'
                        }`}>
                          <Icon className="h-5 w-5 transition-transform duration-300" />
                        </div>
                        <span className={`font-semibold transition-colors duration-300 ${
                          isExpanded ? 'text-white' : 'text-gray-300'
                        }`}>{category.name}</span>
                      </div>
                      <div className={`transition-all duration-300 transform ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}>
                        {isExpanded ?
                          <ChevronDown className="h-4 w-4 text-gray-400" /> :
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  )}

                  {/* Category Items - Only for Maps and Notes */}
                  {!isDirectLink && isExpanded && hasItems && (
                    <div className="ml-3 space-y-1 mt-1 pl-2 border-l-2 border-[hsl(var(--crm-sidebar-hover))]/40 pb-2">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;

                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ml-2 text-gray-400 hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm"
                          >
                            <div className="flex items-center">
                              <ItemIcon className="h-4 w-4 mr-3" />
                              <span className="text-sm">{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Affiliate Referral Card - Above Settings - Glassmorphic */}
        <div className="px-3 py-3 border-t border-gray-800/50">
          <div onClick={openPopup} className="group relative rounded-xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[#7b1c14]/20 via-[#5a1610]/30 to-[#3a0e0a]/40 p-4 border border-[#7b1c14]/40 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#7b1c14]/0 via-[#7b1c14]/20 to-[#7b1c14]/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <h3 className="text-white font-bold text-sm mb-1 drop-shadow-lg">Earn 40% Recurring Commission</h3>
              <p className="text-gray-300 text-xs mb-3 drop-shadow">Refer clients and earn lifetime commissions</p>
              <div className="w-full relative overflow-hidden bg-gradient-to-r from-[#6b1a12]/90 to-[#7b1c14]/90 hover:from-[#7b1c14] hover:to-[#8b1f16] backdrop-blur-sm text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <svg className="h-3.5 w-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="relative z-10">Share now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings - Sticky at bottom above profile */}
        <div className="px-3 py-3 bg-black/30 backdrop-blur-sm">
          <Link
            to="/app/settings"
            className={`flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 ${
              location.pathname.includes('/settings')
                ? 'bg-gradient-to-r from-[#7b1c14]/30 via-[#7b1c14]/20 to-transparent text-white border-r-4 border-[#7b1c14] shadow-lg backdrop-blur-sm font-semibold'
                : 'text-gray-300 hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span className="text-sm">Settings</span>
          </Link>
        </div>

        {/* User Profile Dropdown */}
        <div className="h-16 border-t border-gray-800/50 px-3 flex items-center bg-black/30 backdrop-blur-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full hover:bg-[hsl(var(--crm-sidebar-hover))] rounded-lg p-2 transition-all duration-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary-accent))] to-red-900 flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-[hsl(var(--primary-accent))]/30">
                  JD
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">Juan D. Romero</p>
                  <p className="text-xs text-gray-400 truncate">juan@axolop.com</p>
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 -ml-[14px] flex flex-col min-w-0 h-screen w-[calc(100%+20px)]">
        {/* Page Content - Full Height */}
        <main className="flex-1 w-full h-full overflow-hidden p-0 m-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SecondBrainLayout;
