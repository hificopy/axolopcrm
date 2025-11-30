import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useSupabase } from "../../context/SupabaseContext";
import axios from "axios";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Send,
  Headset,
  UserPlus,
  Target,
  TrendingUp,
  Workflow,
  Activity,
  Mail,
  Lock,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText,
  BarChart3,
  MessageSquare,
  CheckSquare,
  Filter,
  Square,
  Folder,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@components/ui/badge";
import AgenciesSelector from "./AgenciesSelector";
import AffiliateSidebarButton from "./AffiliateSidebarButton";

// Core navigation items - always visible
const coreNavigation = [
  {
    name: "Dashboard",
    href: "/app/home",
    icon: LayoutDashboard,
    primary: true,
  },
  { name: "Leads", href: "/app/leads", icon: UserPlus, primary: true },
  { name: "Contacts", href: "/app/contacts", icon: Users, primary: true },
  { name: "Forms", href: "/app/forms", icon: FileText, primary: true },
  { name: "Calendar", href: "/app/calendar", icon: Calendar, primary: true },
  { name: "Tasks", href: "/app/todos", icon: CheckSquare, primary: true },
];

// Advanced features - in collapsible section
const advancedCategories = [
  {
    name: "Sales",
    icon: DollarSign,
    items: [
      { name: "Pipeline", href: "/app/pipeline", icon: TrendingUp },
      { name: "Opportunities", href: "/app/opportunities", icon: Target },
      { name: "Activities", href: "/app/activities", icon: Activity },
      { name: "Conversations", href: "/app/history", icon: MessageSquare },
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
      { name: "Reports", href: "/app/reports", icon: BarChart3 },
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
    name: "Service",
    icon: Headset,
    items: [
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

export default function SimplifiedSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, supabase } = useSupabase();
  const [hasBetaAccess, setHasBetaAccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapseHovered, setIsCollapseHovered] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    Sales: false,
    Teams: false,
    Marketing: false,
    Service: false,
  });
  const [expandedSubItems, setExpandedSubItems] = useState({});

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

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Mobile menu handler
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when navigating
  const handleMobileNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle sidebar toggle with animation
  const handleSidebarToggle = () => {
    setIsAnimating(true);
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setTimeout(() => setIsAnimating(false), 500); // Match animation duration
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
          onClick={handleMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative h-screen bg-gradient-to-b from-black/95 via-gray-900/90 to-black/95 backdrop-blur-xl 
          flex flex-col shadow-2xl border-r border-white/5 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isSidebarCollapsed ? "w-16" : "w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header - Always visible logo and text */}
        <div className="h-16 bg-transparent flex items-center justify-center px-4 rounded-br-2xl -mt-[7px] flex-shrink-0 relative">
          {/* Logo and text - always visible */}
          <div className="flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
            <div
              className={`
              w-10 h-10 bg-gradient-to-br from-[#761B14] to-[#8a2220] rounded-xl flex items-center justify-center shadow-lg transition-all duration-500
              ${isSidebarCollapsed ? "scale-90" : "scale-100"}
            `}
            >
              <img
                src="/axolop-logo.png"
                alt="Axolop"
                className="h-6 w-6 object-contain filter brightness-0 invert transition-all duration-500"
              />
            </div>
            <span
              className={`
                text-white font-bold text-xl tracking-tight transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform origin-left
                ${isSidebarCollapsed ? "opacity-0 scale-95 -translate-x-4 absolute" : "opacity-100 scale-100 translate-x-0"}
              `}
            >
              Axolop
            </span>
          </div>
        </div>

        {/* Enhanced Collapse Button */}
        <div
          className={`
          absolute right-0 top-1/2 -translate-y-1/2 z-20 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isSidebarCollapsed ? "right-2" : "-right-3"}
        `}
        >
          <button
            onClick={handleSidebarToggle}
            onMouseEnter={() => setIsCollapseHovered(true)}
            onMouseLeave={() => setIsCollapseHovered(false)}
            onFocus={() => setIsCollapseHovered(true)}
            onBlur={() => setIsCollapseHovered(false)}
            className={`
              relative group transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent
              ${isCollapseHovered ? "scale-110" : "scale-100"}
            `}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {/* Button background with glow */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                backdrop-blur-sm border shadow-lg
                ${
                  isSidebarCollapsed
                    ? "bg-white/10 border-white/20 hover:bg-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/15"
                }
                ${isCollapseHovered ? "shadow-xl ring-2 ring-white/30" : ""}
              `}
            >
              <ChevronLeft
                className={`
                  h-4 w-4 text-white/80 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${isSidebarCollapsed ? "rotate-180" : "rotate-0"}
                  ${isCollapseHovered ? "text-white scale-110" : "text-white/80"}
                `}
              />
            </div>

            {/* Animated glow effect */}
            <div
              className={`
                absolute inset-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isCollapseHovered ? "bg-white/20 scale-150 opacity-60" : "bg-transparent scale-100 opacity-0"}
              `}
            />
          </button>
        </div>

        {/* Navigation - Hide all buttons when collapsed */}
        <div
          className={`
            flex-1 overflow-y-auto py-4 px-3 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isSidebarCollapsed ? "opacity-0 pointer-events-none -translate-x-4" : "opacity-100 pointer-events-auto translate-x-0"}
          `}
        >
          {/* Core Navigation */}
          <div className="mb-6">
            <h3
              className={`
              text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isSidebarCollapsed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"}
            `}
            >
              Core
            </h3>
            <div className="space-y-2">
              {coreNavigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleMobileNavigation}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium 
                      transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      transform hover:scale-105 hover:translate-x-1
                      focus:outline-none focus:ring-2 focus:ring-white/20
                      ${
                        isActive
                          ? "bg-gradient-to-r from-white/15 via-white/10 to-transparent text-white shadow-lg border-r-2 border-white/50"
                          : "text-gray-400 hover:bg-white/5 hover:text-white hover:shadow-md"
                      }
                    `}
                    style={{
                      transitionDelay: isSidebarCollapsed
                        ? "0ms"
                        : `${index * 50}ms`,
                    }}
                  >
                    <div
                      className={`
                      flex items-center justify-center w-5 h-5 transition-all duration-300
                      ${isActive ? "scale-110" : "scale-100"}
                    `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <span className="transition-all duration-300 font-medium">
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Advanced Features */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`
                group flex items-center justify-between w-full px-3 py-2 text-xs font-semibold 
                text-gray-400 uppercase tracking-wider hover:text-white 
                transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                transform hover:scale-105 hover:translate-x-1
                focus:outline-none focus:ring-2 focus:ring-white/20 rounded-lg
              `}
            >
              <span className="font-medium">Advanced</span>
              <ChevronDown
                className={`
                  h-3 w-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${showAdvanced ? "rotate-180" : "rotate-0"}
                `}
              />
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-1">
                {advancedCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategories[category.name];

                  return (
                    <div key={category.name} className="animate-spring-slide">
                      {/* Category Header */}
                      <div
                        className={`
                          flex items-center justify-between cursor-pointer rounded-xl mb-2 p-3
                          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                          transform hover:scale-102 hover:translate-x-1
                          focus:outline-none focus:ring-2 focus:ring-white/20
                          ${
                            isExpanded
                              ? "backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-gray-700/30 shadow-lg border-l-4 border-white/50"
                              : "hover:backdrop-blur-sm hover:bg-gray-500/30 hover:shadow-md"
                          }
                        `}
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div className="flex items-center flex-1">
                          <div
                            className={`
                              p-2 rounded-lg mr-3 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                              ${
                                isExpanded
                                  ? "bg-white/20 text-white shadow-inner transform scale-110"
                                  : "text-gray-400 hover:text-white"
                              }
                            `}
                          >
                            <Icon className="h-4 w-4 transition-all duration-300" />
                          </div>
                          <span
                            className={`
                              font-semibold text-sm transition-all duration-300
                              ${
                                isExpanded
                                  ? "text-white transform translate-x-1"
                                  : "text-gray-300"
                              }
                            `}
                          >
                            {category.name}
                          </span>
                        </div>
                        <div className="px-2">
                          <ChevronDown
                            className={`
                              h-4 w-4 text-gray-400 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                              ${isExpanded ? "rotate-180" : "rotate-0"}
                            `}
                          />
                        </div>
                      </div>

                      {/* Category Items */}
                      {isExpanded && (
                        <div className="ml-4 space-y-1 mt-2 pl-3 border-l-2 border-gray-700/30 pb-2 animate-spring-bounce">
                          {category.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = location.pathname === item.href;
                            const hasSubItems =
                              item.subItems && item.subItems.length > 0;
                            const isSubExpanded = expandedSubItems[item.name];

                            if (hasSubItems) {
                              // Handle sub-items
                              if (item.locked) {
                                return (
                                  <div
                                    key={item.name}
                                    className="relative group"
                                  >
                                    <div className="flex items-center justify-between py-2 px-3 rounded-lg cursor-not-allowed text-gray-500 bg-gray-800/30 border border-gray-700/40">
                                      <div className="flex items-center">
                                        <ItemIcon className="h-4 w-4 mr-3 text-gray-500" />
                                        <span className="text-sm text-gray-500">
                                          {item.name}
                                        </span>
                                      </div>
                                      <Lock className="h-3 w-3 text-gray-500" />
                                    </div>
                                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                      <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-xl whitespace-nowrap border border-white/20">
                                        Coming in {item.version || "V1.1"}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={item.name}>
                                  <div
                                    className={`
                                      flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer ml-2 transition-all duration-300
                                      ${isActive ? "text-white bg-white/10" : "text-gray-400 hover:bg-gray-500/30"}
                                    `}
                                    onClick={() => {
                                      const defaultSubItem = item.subItems.find(
                                        (sub) =>
                                          sub.name
                                            .toLowerCase()
                                            .includes("list") ||
                                          sub.name.toLowerCase() ===
                                            "pipeline" ||
                                          sub.name.toLowerCase() === "overview",
                                      );
                                      if (
                                        defaultSubItem &&
                                        defaultSubItem.href
                                      ) {
                                        navigate(defaultSubItem.href);
                                        handleMobileNavigation();
                                      }
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <ItemIcon className="h-4 w-4 mr-3" />
                                      <span className="text-sm">
                                        {item.name}
                                      </span>
                                    </div>
                                    <ChevronRight
                                      className={`h-3 w-3 transition-transform ${isSubExpanded ? "rotate-90" : ""}`}
                                    />
                                  </div>

                                  {isSubExpanded && (
                                    <div className="ml-6 mt-1 space-y-1">
                                      {item.subItems.map((subItem) => {
                                        const SubItemIcon = subItem.icon;
                                        const isSubActive =
                                          location.pathname === subItem.href;

                                        return subItem.locked ? (
                                          <div
                                            key={subItem.name}
                                            className="relative group"
                                          >
                                            <div className="flex items-center py-2 px-3 rounded-lg cursor-not-allowed text-gray-500 bg-gray-800/30">
                                              <SubItemIcon className="h-3.5 w-3.5 mr-3 text-gray-500" />
                                              <span className="text-xs text-gray-500">
                                                {subItem.name}
                                              </span>
                                              <Lock className="h-3 w-3 text-gray-500 ml-auto" />
                                            </div>
                                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                              <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-xl whitespace-nowrap border border-white/20">
                                                Coming in{" "}
                                                {subItem.version || "V1.1"}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <Link
                                            key={subItem.name}
                                            to={subItem.href}
                                            onClick={handleMobileNavigation}
                                            className={`flex items-center py-2 px-3 rounded-lg transition-all duration-300 ${
                                              isSubActive
                                                ? "bg-white/10 text-white"
                                                : "text-gray-400 hover:bg-gray-500/30"
                                            }`}
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

                            // Handle beta-only items
                            if (item.betaOnly) {
                              const hasAccess = hasBetaAccess;

                              if (!hasAccess) {
                                return (
                                  <div
                                    key={item.name}
                                    className="relative group cursor-pointer"
                                    onClick={() => navigate("/app/beta-access")}
                                  >
                                    <div className="flex items-center justify-between py-2 px-3 rounded-lg text-gray-400 bg-gray-800/30 border border-yellow-500/40 hover:border-yellow-500/60 transition-all duration-300">
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
                                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs px-3 py-2 rounded-md shadow-xl whitespace-nowrap border border-yellow-400/40">
                                        Click to unlock early weekly access
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            }

                            // Regular locked items
                            return item.locked ? (
                              <div key={item.name} className="relative group">
                                <div className="flex items-center justify-between py-2 px-3 rounded-lg cursor-not-allowed text-gray-500 bg-gray-800/30 border border-gray-700/40 transition-all duration-300">
                                  <div className="flex items-center">
                                    <ItemIcon className="h-4 w-4 mr-3 text-gray-500" />
                                    <span className="text-sm text-gray-500">
                                      {item.name}
                                    </span>
                                  </div>
                                  <Lock className="h-3 w-3 text-gray-500" />
                                </div>
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  <div className="bg-black text-white text-xs px-3 py-2 rounded-md shadow-xl whitespace-nowrap border border-white/20">
                                    Coming in {item.version || "V1.1"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={handleMobileNavigation}
                                className={`
                                  flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 ml-2
                                  transform hover:scale-105 hover:translate-x-1
                                  focus:outline-none focus:ring-2 focus:ring-white/20
                                  ${
                                    isActive
                                      ? "bg-gradient-to-r from-white/15 via-white/10 to-transparent text-white shadow-lg border-r-2 border-white/50"
                                      : "text-gray-400 hover:bg-gray-500/30 hover:text-white hover:shadow-md"
                                  }
                                `}
                              >
                                <div className="flex items-center">
                                  <ItemIcon className="h-4 w-4 mr-3 transition-transform duration-300" />
                                  <span className="text-sm font-medium">
                                    {item.name}
                                  </span>
                                </div>
                                {item.badge && (
                                  <Badge className="ml-auto bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0 border border-yellow-500/40">
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
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Hide when collapsed */}
        <div
          className={`
            border-t border-gray-800/50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${isSidebarCollapsed ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 pointer-events-auto translate-y-0"}
          `}
        >
          <div className="px-3 py-2">
            <AgenciesSelector />
          </div>
          <div className="border-t border-gray-800/50">
            <AffiliateSidebarButton />
          </div>
        </div>
      </div>
    </>
  );
}
