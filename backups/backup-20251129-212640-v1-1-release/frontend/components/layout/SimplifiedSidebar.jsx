import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAffiliatePopup } from "@/contexts/AffiliatePopupContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useSupabase } from "@/context/SupabaseContext";
import { useAgency } from "@/hooks/useAgency";
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
  Menu,
  X,
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

// Core navigation items - always visible
const coreNavigation = [
  { name: "Home", href: "/app/home", icon: Home, primary: true },
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
  pinnedButtons,
  onPinnedChange,
  currentTheme,
  onMouseEnter,
  onMouseLeave,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, supabase } = useSupabase();
  const { openPopup } = useAffiliatePopup();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const { currentAgency, getCurrentTier, isGodMode, isFeatureEnabled } =
    useAgency();

  // ALL HOOKS MUST BE CALLED AT THE TOP BEFORE ANY OTHER CODE
  const [isHovered, setIsHovered] = useState(false);
  const [hasBetaAccess, setHasBetaAccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    Sales: false,
    Teams: false,
    Marketing: false,
    Service: false,
  });
  const [expandedSubItems, setExpandedSubItems] = useState({});

  // Check if current user is the parent account
  const isParentAccount = user?.email === "axolopcrm@gmail.com";

  // Get current subscription tier for feature gating
  const currentTier = getCurrentTier?.() || "sales";

  // Check if a section/feature is accessible based on tier and agency settings
  const isSectionAccessible = (sectionKey) => {
    // God mode users have access to everything
    if (isGodMode?.()) return true;

    // Check agency settings for section toggles
    const sectionsEnabled = currentAgency?.settings?.sections_enabled || {};
    if (sectionsEnabled[sectionKey] === false) return false;

    // Check tier-based access
    const tierFeatures = {
      sales: [
        "home",
        "leads",
        "contacts",
        "calendar",
        "tasks",
        "pipeline",
        "opportunities",
        "activities",
        "conversations",
        "calls",
        "inbox",
      ],
      build: [
        "home",
        "leads",
        "contacts",
        "calendar",
        "tasks",
        "pipeline",
        "opportunities",
        "activities",
        "conversations",
        "calls",
        "inbox",
        "forms",
        "email_marketing",
        "automation",
        "reports",
        "second_brain",
      ],
      scale: [
        "home",
        "leads",
        "contacts",
        "calendar",
        "tasks",
        "pipeline",
        "opportunities",
        "activities",
        "conversations",
        "calls",
        "inbox",
        "forms",
        "email_marketing",
        "automation",
        "reports",
        "second_brain",
        "white_label",
        "api",
        "mind_maps",
      ],
    };

    const allowedFeatures = tierFeatures[currentTier] || tierFeatures.sales;
    return allowedFeatures.includes(sectionKey);
  };

  // Check if a feature is tier-locked (for showing lock icon)
  const isTierLocked = (featureKey) => {
    if (isGodMode?.()) return false;

    const tierFeatures = {
      sales: [
        "home",
        "leads",
        "contacts",
        "calendar",
        "tasks",
        "pipeline",
        "opportunities",
        "activities",
        "conversations",
        "calls",
        "inbox",
      ],
      build: [
        "home",
        "leads",
        "contacts",
        "calendar",
        "tasks",
        "pipeline",
        "opportunities",
        "activities",
        "conversations",
        "calls",
        "inbox",
        "forms",
        "email_marketing",
        "automation",
        "reports",
        "second_brain",
      ],
      scale: [
        "home",
        "leads",
        "contacts",
        "calendar",
        "tasks",
        "pipeline",
        "opportunities",
        "activities",
        "conversations",
        "calls",
        "inbox",
        "forms",
        "email_marketing",
        "automation",
        "reports",
        "second_brain",
        "white_label",
        "api",
        "mind_maps",
      ],
    };

    const allowedFeatures = tierFeatures[currentTier] || tierFeatures.sales;
    return !allowedFeatures.includes(featureKey);
  };

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

  const toggleSubItem = (itemName) => {
    setExpandedSubItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
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
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative h-screen backdrop-blur-xl
          flex flex-col shadow-2xl z-50
          ${isSidebarCollapsed ? "w-10" : "w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background:
            "linear-gradient(180deg, #0a0a0a 0%, #1a0812 30%, #3F0D28 50%, #1a0812 70%, #0a0a0a 100%)",
          transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Header - Logo and text - always visible */}
        <div className="h-16 bg-transparent flex items-center px-4 rounded-br-2xl -mt-[14px] flex-shrink-0 overflow-visible">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <img
              src="/axolop-logo.png"
              alt="Axolop"
              className="h-8 w-8 object-contain flex-shrink-0"
            />
            <span className="text-white font-bold text-lg">Axolop</span>
          </div>
        </div>

        {/* Content wrapper - fades out when collapsed */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            opacity: isSidebarCollapsed ? 0 : 1,
            pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
            transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Core Navigation */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Core
            </h3>
            <div className="space-y-1">
              {coreNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const featureKey = item.name.toLowerCase().replace(" ", "_");
                const isLocked = isTierLocked(featureKey);

                // Show locked items with lock icon, but still render them
                return (
                  <Link
                    key={item.name}
                    to={isLocked ? "#" : item.href}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                        // Could open TierUpsellModal here
                        navigate("/app/settings/billing");
                      } else {
                        handleMobileNavigation();
                      }
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isLocked
                          ? "text-gray-500 cursor-not-allowed opacity-60"
                          : isActive
                            ? "bg-white/10 text-white shadow-lg"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                    {isLocked && (
                      <Lock className="ml-auto h-3.5 w-3.5 text-gray-500" />
                    )}
                    {isActive && !isLocked && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full" />
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
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
            >
              <span>Advanced</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              />
            </button>

            {showAdvanced && (
              <div className="space-y-1">
                {advancedCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategories[category.name];

                  return (
                    <div key={category.name}>
                      {/* Category Header */}
                      <div
                        className={`
                          flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200
                          ${
                            isExpanded
                              ? "backdrop-blur-xl bg-gradient-to-r from-gray-700/30 via-gray-800/40 to-gray-700/30 shadow-lg border-l-4 border-white"
                              : "hover:backdrop-blur-sm hover:bg-gray-500/30"
                          }
                        `}
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div className="flex items-center flex-1 px-3 py-2">
                          <div
                            className={`p-2 rounded-lg mr-3 transition-colors ${
                              isExpanded
                                ? "bg-white/20 text-white"
                                : "text-gray-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={`font-semibold text-sm ${
                              isExpanded ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {category.name}
                          </span>
                        </div>
                        <div className="px-3">
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
                              // Handle sub-items
                              if (item.locked) {
                                return (
                                  <div
                                    key={item.name}
                                    className="relative group ml-2"
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
                                    className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer ml-2 ${
                                      isActive
                                        ? "text-white bg-white/10"
                                        : "text-gray-400 hover:bg-gray-500/30"
                                    }`}
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
                                            className="relative group ml-2"
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
                                            className={`flex items-center py-2 px-3 rounded-lg transition-all ${
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
                                    className="relative group ml-2 cursor-pointer"
                                    onClick={() => navigate("/app/beta-access")}
                                  >
                                    <div className="flex items-center justify-between py-2 px-3 rounded-lg text-gray-400 bg-gray-800/30 border border-yellow-500/40 hover:border-yellow-500/60">
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
                              <div
                                key={item.name}
                                className="relative group ml-2"
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
                            ) : (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={handleMobileNavigation}
                                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all ml-2 ${
                                  isActive
                                    ? "bg-white/10 text-white"
                                    : "text-gray-400 hover:bg-gray-500/30"
                                }`}
                              >
                                <div className="flex items-center">
                                  <ItemIcon className="h-4 w-4 mr-3" />
                                  <span className="text-sm">{item.name}</span>
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

          {/* More Menu */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <SidebarMoreMenu
              pinnedButtons={pinnedButtons || []}
              onPinnedChange={onPinnedChange}
            />
          </div>
        </div>

        {/* Bottom Section */}
          <div className="border-t border-gray-800/50">
            <div className="px-3 py-2">
              <AgenciesSelector />
            </div>
            <div className="border-t border-gray-800/50">
              <AffiliateSidebarButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
