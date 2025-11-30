import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useSupabase } from "@/context/SupabaseContext";
import axios from "axios";
import {
  Home,
  DollarSign,
  Users,
  Send,
  Headset,
  Inbox,
  UserPlus,
  Target,
  TrendingUp,
  Workflow,
  Activity,
  Mail,
  Layers,
  Lock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Calendar,
  FileText,
  BarChart3,
  MessageSquare,
  CheckSquare,
  Shield,
  CreditCard,
  Eye,
  Phone,
  History,
  Settings,
  User,
  Sparkles,
  Link as LinkIcon,
  Filter,
  Hash,
  Square,
  Folder,
  MoreHorizontal,
  ChevronLeft,
  Search,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AgenciesSelector from "./AgenciesSelector";
import AffiliateSidebarButton from "./AffiliateSidebarButton";
import SidebarMoreMenu from "./SidebarMoreMenu";

// Top-level navigation items
const topLevelItems = [{ name: "Home", href: "/app/home", icon: Home }];

const mainCategories = [
  {
    name: "Sales",
    icon: DollarSign,
    items: [
      {
        name: "Inbox",
        href: "/app/inbox",
        icon: Inbox,
        badge: 48,
        locked: true,
        version: "V1.3",
      },
      { name: "Leads", href: "/app/leads", icon: UserPlus },
      { name: "Contacts", href: "/app/contacts", icon: Users },
      { name: "Opportunities", href: "/app/pipeline", icon: TrendingUp },
      {
        name: "Workflows",
        href: "/app/workflows",
        icon: Workflow,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Conversations",
        href: "/app/conversations",
        icon: MessageSquare,
      },
      { name: "Activities", href: "/app/activities", icon: Activity },
    ],
  },
  {
    name: "Teams",
    icon: Users,
    items: [
      {
        name: "Chat",
        icon: MessageSquare,
        locked: true,
        version: "V1.1",
        subItems: [
          {
            name: "Team Chat",
            href: "/app/team-chat",
            icon: MessageSquare,
            locked: true,
            version: "V1.1",
          },
          {
            name: "Direct Messages",
            href: "/app/direct-messages",
            icon: MessageSquare,
            locked: true,
            version: "V1.1",
          },
        ],
      },
      {
        name: "Projects",
        icon: Folder,
        locked: true,
        version: "V1.2",
        subItems: [
          {
            name: "Project Management",
            href: "/app/projects",
            icon: Folder,
            locked: true,
            version: "V1.2",
          },
          {
            name: "Task Lists",
            href: "/app/task-lists",
            icon: CheckSquare,
            locked: true,
            version: "V1.2",
          },
          {
            name: "Boards",
            href: "/app/boards",
            icon: Square,
            locked: true,
            version: "V1.1",
          },
        ],
      },
    ],
  },
  {
    name: "Marketing",
    icon: Send,
    items: [
      {
        name: "Email Marketing",
        href: "/app/email-marketing",
        icon: Mail,
        locked: true,
        version: "V1.3",
      },
      { name: "Meetings", href: "/app/meetings", icon: Calendar },
      { name: "Forms", href: "/app/forms", icon: FileText },
      {
        name: "Workflows",
        href: "/app/workflows",
        icon: Workflow,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Funnels",
        href: "/app/funnels",
        icon: Filter,
        betaOnly: true,
        badge: "BETA",
      },
      {
        name: "Link in Bio",
        href: "/app/link-in-bio",
        icon: LinkIcon,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Content",
        href: "/app/content",
        icon: Layers,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Reports",
        href: "/app/reports",
        icon: BarChart3,
        locked: true,
        version: "V1.1",
      },
    ],
  },
  {
    name: "Service",
    icon: Headset,
    items: [
      // Placeholder items for future service features - Locked
      {
        name: "Tickets",
        href: "/app/tickets",
        icon: Activity,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Knowledge Base",
        href: "/app/knowledge-base",
        icon: FileText,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Customer Portal",
        href: "/app/customer-portal",
        icon: Users,
        locked: true,
        version: "V1.1",
      },
      {
        name: "Support Analytics",
        href: "/app/support-analytics",
        icon: BarChart3,
        locked: true,
        version: "V1.1",
      },
    ],
  },
];

export default function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  pinnedButtons,
  onPinnedChange,
  currentTheme,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, supabase } = useSupabase();
  const { openPopup } = useAffiliatePopup();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const [isHovered, setIsHovered] = useState(false);
  const [hasBetaAccess, setHasBetaAccess] = useState(false);

  // Check if current user is the parent account
  const isParentAccount = user?.email === "axolopcrm@gmail.com";
  const [expandedCategories, setExpandedCategories] = useState({
    Sales: false,
    Teams: false,
    Marketing: false,
    Service: false,
  });
  const [expandedSubItems, setExpandedSubItems] = useState({});

  // Placeholder data management
  const [hasPlaceholderData, setHasPlaceholderData] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showButton, setShowButton] = useState(true);

  // Check for beta access
  useEffect(() => {
    const checkBetaAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/beta-access`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        if (response.data.success) {
          setHasBetaAccess(response.data.data.hasBetaAccess);
        }
      } catch (error) {
        console.error("Error checking beta access:", error);
      }
    };

    if (user && supabase) {
      checkBetaAccess();
    }
  }, [user, supabase]);

  // Check for placeholder data from Supabase (NO localStorage)
  useEffect(() => {
    const checkPlaceholderData = async () => {
      try {
        // Get auth session from Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // Check Supabase API for placeholder data
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/demo-data/status`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        if (response.data.success) {
          const hasData = response.data.has_placeholder_data;
          setHasPlaceholderData(hasData);
          setShowButton(hasData);
          console.log(
            `Placeholder data status: ${hasData ? "EXISTS" : "NOT FOUND"}`,
          );
        }
      } catch (error) {
        console.error("Error checking placeholder data:", error);
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

      console.log("🗑️ Clearing all placeholder data from Supabase...");

      // Get auth session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("No auth token available");
        return;
      }

      // Call API to clear placeholder data from Supabase
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/demo-data/clear`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      console.log("✅ Placeholder data cleared:", response.data);

      // Start animation sequence (4 seconds total)
      setTimeout(() => {
        setShowButton(false);
        setHasPlaceholderData(false);
        setIsAnimating(false);
        setIsClearing(false);

        // Reload page to show cleared data
        console.log("🔄 Reloading page...");
        window.location.reload();
      }, 4000);
    } catch (error) {
      console.error("❌ Error clearing placeholder data:", error);
      setIsClearing(false);
      setIsAnimating(false);
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const toggleSubItem = (itemName) => {
    setExpandedSubItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  return (
    <div className="h-screen w-52 flex flex-col shadow-2xl relative" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header section with logo and text */}
      <div className="h-20 flex items-center px-6 rounded-br-2xl flex-shrink-0" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] rounded-xl flex items-center justify-center shadow-lg">
            <img
              src="/axolop-logo.png"
              alt="Axolop"
              className="h-6 w-6 object-contain filter brightness-0 invert"
            />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Axolop
          </span>
        </div>
      </div>

      {/* Content - scrollable area with padding for fixed bottom */}
      <div className="w-full flex-1 flex flex-col pb-[180px] overflow-hidden">
        {/* Top Section - Main Categories with Home as a category */}
        <div className="px-4 py-6 flex-shrink-0">
          {/* Home as a main category - No dropdown */}
          <Link
            key="Home"
            to="/app/home"
            className={`sidebar-item ${
              location.pathname === "/app/home"
                ? "sidebar-item-active text-white bg-[#3F0D28]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>

          {/* My Tasks button - Accessible but marked as V1.2 */}
          <Link
            key="My Tasks"
            to="/app/todos"
            className={`sidebar-item ${
              location.pathname === "/app/todos"
                ? "sidebar-item-active text-white bg-[#3F0D28]"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span className="font-medium">My Tasks</span>
          </Link>

          {/* More button with dropdown - User-specific menu */}
          <SidebarMoreMenu
            pinnedButtons={pinnedButtons || []}
            onPinnedChange={onPinnedChange}
          />
        </div>

        {/* Navigation - Fixed height with internal scrolling */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 min-h-0">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.name];

            return (
              <div key={category.name}>
                {/* Category Header - Glassmorphic */}
                <div
                  className={`flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200 ease-out overflow-hidden transform-gpu ${
                    isExpanded
                      ? "backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-[hsl(var(--crm-sidebar-hover))]/20 shadow-lg border-l-4 border-white"
                      : "hover:backdrop-blur-sm hover:bg-gray-500/30 hover:shadow-sm"
                  }`}
                  onClick={() => toggleCategory(category.name)}
                >
                  {isExpanded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-black/10 pointer-events-none" />
                  )}
                  <div className="flex items-center flex-1">
                    <div
                      className={`p-2 rounded-lg mr-3 transition-colors duration-200 ease-out ${
                        isExpanded
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5 transition-transform duration-200 ease-out" />
                    </div>
                    <span
                      className={`font-semibold transition-colors duration-200 ease-out ${
                        isExpanded ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {category.name}
                    </span>
                  </div>
                  <div className="transition-all duration-200 ease-out">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Category Items */}
                {isExpanded && (
                  <div className="ml-3 space-y-1 mt-1 pl-2 border-l-2 border-gray-700/30 pb-2">
                    {category.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location.pathname === item.href;
                      const hasSubItems =
                        item.subItems && item.subItems.length > 0;
                      const isSubExpanded = expandedSubItems[item.name];

                      if (hasSubItems) {
                        // Check if parent item is locked
                        if (item.locked) {
                          return (
                            <div
                              key={item.name}
                              className="relative group ml-2"
                            >
                              <div className="flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 cursor-not-allowed text-gray-500 bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm">
                                <div className="flex items-center">
                                  <ItemIcon className="h-4 w-4 mr-3 text-gray-500" />
                                  <span className="text-sm text-gray-500">
                                    {item.name}
                                  </span>
                                </div>
                                {/* Lock Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-lg">
                                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-1 border border-gray-600/40">
                                    <Lock className="h-3 w-3 text-gray-300" />
                                  </div>
                                </div>
                              </div>
                              {/* Tooltip */}
                              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                                <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                                  Coming in {item.version || "V1.1"}
                                  <a
                                    href="/roadmap"
                                    className="ml-1 text-[#EBB207] hover:text-[#3F0D28] pointer-events-auto underline"
                                  >
                                    View roadmap
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Check if any sub-item is active
                        const hasActiveSubItem = item.subItems.some(
                          (subItem) => location.pathname === subItem.href,
                        );

                        return (
                          <div key={item.name}>
                            {/* Parent Item with Sub-dropdown */}
                            <div
                              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ml-2 ${
                                hasActiveSubItem
                                  ? "text-white bg-gradient-to-r from-white/15 via-white/10 to-transparent border-r-2 border-white shadow-inner backdrop-blur-sm"
                                  : "text-gray-400 hover:bg-gray-500/30 hover:text-white"
                              }`}
                            >
                              <div
                                className="flex items-center flex-1 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // First, check if there's a 'List', 'Pipeline', 'Overview', or 'History' sub-item and navigate to it
                                  const defaultSubItem = item.subItems.find(
                                    (sub) =>
                                      sub.name.toLowerCase().includes("list") ||
                                      sub.name.toLowerCase() === "pipeline" ||
                                      sub.name.toLowerCase() === "overview" ||
                                      sub.name.toLowerCase() ===
                                        "conversations",
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
                                {isSubExpanded ? (
                                  <ChevronDown className="h-3 w-3 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Sub Items */}
                            {isSubExpanded && (
                              <div className="ml-6 mt-1 space-y-1">
                                {item.subItems.map((subItem) => {
                                  const SubItemIcon = subItem.icon;
                                  const isSubActive =
                                    location.pathname === subItem.href;

                                  return subItem.locked ? (
                                    <div
                                      key={subItem.name}
                                      className="relative group ml-2"
                                    >
                                      <div
                                        className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 cursor-not-allowed ${"text-gray-500 bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm"}`}
                                      >
                                        <div className="flex items-center">
                                          <SubItemIcon className="h-3.5 w-3.5 mr-3 text-gray-500" />
                                          <span className="text-xs text-gray-500">
                                            {subItem.name}
                                          </span>
                                        </div>
                                        {/* Lock Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-lg">
                                          <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-1 border border-gray-600/40">
                                            <Lock className="h-3 w-3 text-gray-300" />
                                          </div>
                                        </div>
                                      </div>
                                      {/* Tooltip */}
                                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                                        <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                                          Coming in {subItem.version || "V1.1"}
                                          <a
                                            href="/roadmap"
                                            className="ml-1 text-[#EBB207] hover:text-[#3F0D28] pointer-events-auto underline"
                                          >
                                            View roadmap
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <Link
                                      key={subItem.name}
                                      to={subItem.href}
                                      className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                                        isSubActive
                                          ? "bg-gradient-to-r from-white/15 via-white/10 to-transparent text-white border-r-2 border-white shadow-inner backdrop-blur-sm"
                                          : "text-gray-400 hover:bg-gray-500/30 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm"
                                      }`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <SubItemIcon className="h-3.5 w-3.5 mr-3" />
                                      <span className="text-xs">
                                        {subItem.name}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Regular Item without sub-items

                      // Beta-only items
                      if (item.betaOnly) {
                        const hasAccess = hasBetaAccess;

                        if (!hasAccess) {
                          // User doesn't have beta access - show locked with tooltip
                          return (
                            <div
                              key={item.name}
                              className="relative group ml-2 cursor-pointer"
                              onClick={() => navigate("/app/beta-access")}
                            >
                              <div className="flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 text-gray-400 bg-gray-800/30 border border-yellow-500/40 backdrop-blur-sm hover:border-yellow-500/60">
                                <div className="flex items-center gap-2">
                                  <ItemIcon className="h-4 w-4 text-yellow-500/70" />
                                  <span className="text-sm text-gray-300">
                                    {item.name}
                                  </span>
                                  <Badge className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0 border border-yellow-500/40">
                                    BETA
                                  </Badge>
                                </div>
                                <Lock className="h-3.5 w-3.5 text-yellow-500/70" />
                              </div>
                              {/* Tooltip */}
                              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-yellow-400/40">
                                  Click to unlock early weekly access
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // User has beta access - show unlocked with BETA badge
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ml-2 ${
                                isActive
                                  ? "bg-gradient-to-r from-white/15 via-white/10 to-transparent text-white border-r-2 border-white shadow-inner backdrop-blur-sm"
                                  : "text-gray-400 hover:bg-gray-500/30 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ItemIcon className="h-4 w-4" />
                                <span className="text-sm">{item.name}</span>
                                <Badge className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0 border border-yellow-500/40">
                                  BETA
                                </Badge>
                              </div>
                            </Link>
                          );
                        }
                      }

                      // Regular locked items
                      return item.locked ? (
                        <div key={item.name} className="relative group ml-2">
                          <div
                            className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 cursor-not-allowed ${"text-gray-500 bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm"}`}
                          >
                            <div className="flex items-center">
                              <ItemIcon className="h-4 w-4 mr-3 text-gray-500" />
                              <span className="text-sm text-gray-500">
                                {item.name}
                              </span>
                            </div>
                            {/* Lock Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-10 rounded-lg">
                              <div className="bg-gray-900/60 backdrop-blur-sm rounded-full p-1 border border-gray-600/40">
                                <Lock className="h-3 w-3 text-gray-300" />
                              </div>
                            </div>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[99999]">
                            <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-2xl whitespace-nowrap border border-white/20">
                              Coming in {item.version || "V1.1"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 ml-2 ${
                            isActive
                              ? "bg-gradient-to-r from-white/15 via-white/10 to-transparent text-white border-r-2 border-white shadow-inner backdrop-blur-sm"
                              : "text-gray-400 hover:bg-gray-500/30 hover:text-white hover:translate-x-1 hover:backdrop-blur-sm"
                          }`}
                        >
                          <div className="flex items-center">
                            <ItemIcon className="h-4 w-4 mr-3" />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          {item.badge && (
                            <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black text-xs">
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
      </div>

      {/* Bottom section - Absolutely positioned at bottom, never moves */}
      <div className="absolute bottom-0 left-0 right-0" style={{ backgroundColor: '#0A0A0A' }}>
        {/* Agencies selector */}
        <div className="px-3 py-2">
          <AgenciesSelector />
        </div>

        {/* Affiliate Program Button */}
        <div>
          <AffiliateSidebarButton />
        </div>
      </div>
    </div>
  );
}
