/**
 * Restricted Navigation Component
 *
 * Blocks navigation for unpaid accounts
 */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  FileText,
  Mail,
  BarChart3,
  Settings,
  CreditCard,
  Phone,
  Target,
  Zap,
} from "lucide-react";
import { useAccountStatus } from "../../hooks/useAccountStatus";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "../../lib/utils";

const menuItems = [
  {
    path: "/app/dashboard",
    label: "Dashboard",
    icon: Home,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/leads",
    label: "Leads",
    icon: Target,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/contacts",
    label: "Contacts",
    icon: Users,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/opportunities",
    label: "Opportunities",
    icon: TrendingUp,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/calendar",
    label: "Calendar",
    icon: Calendar,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/forms",
    label: "Forms",
    icon: FileText,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/email-campaigns",
    label: "Email Campaigns",
    icon: Mail,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/calls",
    label: "Calls",
    icon: Phone,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/automations",
    label: "Automations",
    icon: Zap,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/reports",
    label: "Reports",
    icon: BarChart3,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/settings",
    label: "Settings",
    icon: Settings,
    allowedInPaymentWall: false,
  },
  {
    path: "/app/settings/billing",
    label: "Billing",
    icon: CreditCard,
    allowedInPaymentWall: true,
  },
];

export default function RestrictedNavigation({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { needsPaymentWall } = useAccountStatus();
  const { toast } = useToast();
  const handleNavigation = (path, allowedInPaymentWall) => {
    if (needsPaymentWall() && !allowedInPaymentWall) {
      toast({
        title: "Payment Required",
        description: "Please update your payment method to access this feature",
        variant: "destructive",
      });
      return;
    }
    navigate(path);
  };

  const toggleExpanded = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-900 h-screen flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <img
            src="/axolop-logo.png"
            alt="Axolop CRM"
            className="w-8 h-8 rounded"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0YwRDAyOCIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTE2IDI0SDI0VjE2SDE2VjI0Wk04IDI0SDE2VjE2SDhWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
            }}
          />
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            const isBlocked = needsPaymentWall() && !item.allowedInPaymentWall;

            return (
              <button
                key={item.path}
                onClick={() =>
                  handleNavigation(item.path, item.allowedInPaymentWall)
                }
                disabled={isBlocked}
                className={cn(
                  "w-full p-3 flex items-center justify-center relative group",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                  isBlocked && "opacity-50 cursor-not-allowed",
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-900 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img
            src="/axolop-logo.png"
            alt="Axolop CRM"
            className="w-8 h-8 rounded"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0YwRDAyOCIvPgo8cGF0aCBkPSJNOCAxNkgxNlY4SDhWMTZaTTE2IDE2SDI0VjhIMTZWMTZaTTE2IDI0SDI0VjE2SDE2VjI0Wk04IDI0SDE2VjE2SDhWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
            }}
          />
          <span className="text-white font-bold text-lg">Axolop CRM</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            const isBlocked = needsPaymentWall() && !item.allowedInPaymentWall;

            return (
              <button
                key={item.path}
                onClick={() =>
                  handleNavigation(item.path, item.allowedInPaymentWall)
                }
                disabled={isBlocked}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800",
                  isBlocked && "opacity-50 cursor-not-allowed",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>

                {/* Blocked indicator */}
                {isBlocked && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mobile navigation component
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { needsPaymentWall } = useAccountStatus();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-64 bg-gray-900 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <RestrictedNavigation collapsed={false} />
          </div>
        </div>
      )}
    </>
  );
}
