import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../context/SupabaseContext';
import {
  Inbox,
  Users,
  UserPlus,
  Target,
  TrendingUp,
  Activity,
  Workflow,
  History,
  Phone,
  BarChart3,
  Mail,
  FileText,
  Settings,
  User,
  CreditCard,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Send,
  Headset,
  LayoutDashboard,
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
    name: 'Sales',
    icon: DollarSign,
    expanded: true,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Leads', href: '/leads', icon: UserPlus },
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Pipeline', href: '/pipeline', icon: Target },
      { name: 'Opportunities', href: '/opportunities', icon: TrendingUp },
      { name: 'Activities', href: '/activities', icon: Activity },
      { name: 'History', href: '/history', icon: History },
      { name: 'Live Calls', href: '/live-calls', icon: Phone },
      { name: 'Inbox', href: '/inbox', icon: Inbox },
    ]
  },
  {
    name: 'Marketing',
    icon: Send,
    expanded: true,
    items: [
      { name: 'Email Marketing', href: '/email-marketing', icon: Mail },
      { name: 'Forms', href: '/forms', icon: FileText },
      { name: 'Workflows', href: '/workflows', icon: Workflow },
      { name: 'Reports', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    name: 'Service',
    icon: Headset,
    expanded: true,
    items: [
      // Placeholder items for future service features
      { name: 'Tickets', href: '/tickets', icon: Activity },
      { name: 'Knowledge Base', href: '/knowledge-base', icon: FileText },
      { name: 'Customer Portal', href: '/customer-portal', icon: Users },
      { name: 'Support Analytics', href: '/support-analytics', icon: BarChart3 },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useSupabase();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    Sales: true,
    Marketing: true,
    Service: true,
  });

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
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
      // Navigate to the beta login page
      navigate('/password');
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutDialog(false);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-br from-[hsl(var(--crm-sidebar-gradient-start))] via-[hsl(var(--crm-sidebar-gradient-mid))] to-[hsl(var(--crm-sidebar-gradient-end))] border-r border-gray-800/50 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="h-24 flex items-center justify-center px-6 border-b border-gray-800/30 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-md">
        <div className="relative group">
          {/* Subtle Accent Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#7b1c14]/0 via-[#7b1c14]/10 to-[#7b1c14]/0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Logo */}
          <img
            src="/axolop-logo.png"
            alt="Axolop"
            className="h-[4.5rem] w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-4">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.name];

            return (
              <div key={category.name}>
                {/* Category Header */}
                <div
                  className={`flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-300 ${
                    isExpanded
                      ? (category.name === 'Sales'
                          ? 'bg-gradient-to-r from-gray-700/40 via-gray-800/50 to-[hsl(var(--crm-sidebar-hover))]/30 shadow-lg border-l-4 border-primary-blue backdrop-blur-sm'
                          : category.name === 'Marketing'
                            ? 'bg-gradient-to-r from-gray-700/40 via-gray-800/50 to-[hsl(var(--crm-sidebar-hover))]/30 shadow-lg border-l-4 border-primary-green backdrop-blur-sm'
                            : 'bg-gradient-to-r from-gray-700/40 via-gray-800/50 to-[hsl(var(--crm-sidebar-hover))]/30 shadow-lg border-l-4 border-primary-yellow backdrop-blur-sm')
                      : 'hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:shadow-sm hover:backdrop-blur-sm'
                  }`}
                  onClick={() => toggleCategory(category.name)}
                >
                  <div className="flex items-center flex-1">
                    <div className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                      isExpanded 
                        ? (category.name === 'Sales' 
                            ? 'bg-primary-blue/20 text-primary-blue shadow-inner' 
                            : category.name === 'Marketing' 
                              ? 'bg-primary-green/20 text-primary-green shadow-inner' 
                              : 'bg-primary-yellow/20 text-primary-yellow shadow-inner') 
                        : 'text-gray-400 hover:text-white'
                    }`}>
                      <Icon className="h-5 w-5 transition-transform duration-300" />
                    </div>
                    <span className={`font-semibold transition-colors duration-300 ${
                      isExpanded 
                        ? 'text-white' 
                        : 'text-gray-300'
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

                {/* Category Items */}
                {isExpanded && (
                  <div className="ml-3 space-y-1 mt-1 pl-2 border-l-2 border-[hsl(var(--crm-sidebar-hover))]/40 pb-2">
                    {category.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.href;

                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ml-2 ${
                            isActive
                              ? (category.name === 'Sales'
                                  ? 'bg-gradient-to-r from-primary-blue/15 via-primary-blue/10 to-transparent text-primary-blue border-r-2 border-primary-blue shadow-inner backdrop-blur-sm'
                                  : category.name === 'Marketing'
                                    ? 'bg-gradient-to-r from-primary-green/15 via-primary-green/10 to-transparent text-primary-green border-r-2 border-primary-green shadow-inner backdrop-blur-sm'
                                    : 'bg-gradient-to-r from-primary-yellow/15 via-primary-yellow/10 to-transparent text-primary-yellow border-r-2 border-primary-yellow shadow-inner backdrop-blur-sm')
                              : 'text-gray-400 hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm'
                          }`}
                        >
                          <ItemIcon className="h-4 w-4 mr-3" />
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 relative">
          <div className="border-t border-gray-800/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--primary-accent))]/20 to-transparent blur-sm"></div>
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className={`sidebar-item ${
            location.pathname === '/settings' ? 'sidebar-item-active' : ''
          } flex items-center hover:bg-[hsl(var(--crm-sidebar-hover))]/50 hover:text-white`}
        >
          <Settings className="h-5 w-5 mr-3" />
          <span>Settings</span>
        </Link>
      </nav>

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
              <Link to="/profile" className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 w-full">
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
  );
}
