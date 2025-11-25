import { useState } from 'react';
import {
  User,
  Building,
  Users,
  Shield,
  Settings as SettingsIcon,
  Zap,
  Mail,
  Phone,
  Plug,
  CreditCard,
  Bell,
  LayoutDashboard,
  Code,
  Key,
  Clock,
  BarChart3,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, Outlet, useLocation } from 'react-router-dom';

const settingsNavigation = [
  {
    name: 'Account',
    icon: User,
    sections: [
      { name: 'Profile', href: '/settings/account', icon: User },
      { name: 'Appearance', href: '/settings/account?tab=appearance', icon: LayoutDashboard, locked: true },
      { name: 'Memberships', href: '/settings/account?tab=membership', icon: Key },
    ]
  },
  {
    name: 'Organization',
    icon: Building,
    sections: [
      { name: 'General', href: '/settings/organization/general', icon: Building },
      { name: 'Team Management', href: '/settings/organization/team', icon: Users },
      { name: 'Roles & Permissions', href: '/settings/organization/permissions', icon: Shield },
    ]
  },
  {
    name: 'Customization',
    icon: LayoutDashboard,
    sections: [
      { name: 'Custom Fields', href: '/app/settings/custom-fields', icon: LayoutDashboard },
      { name: 'Integration Links', href: '/settings/customization/links', icon: Zap },
      { name: 'Scheduling Links', href: '/settings/customization/scheduling', icon: Clock },
      { name: 'Statuses & Pipelines', href: '/settings/customization/statuses', icon: Zap },
      { name: 'AI Knowledge Sources', href: '/settings/customization/ai', icon: Code, locked: true },
    ]
  },
  {
    name: 'Communication',
    icon: Mail,
    sections: [
      { name: 'Phone & Voicemail', href: '/settings/communication/phone', icon: Phone, locked: true },
      { name: 'Dialer', href: '/settings/communication/dialer', icon: Phone, locked: true },
      { name: 'Outcomes', href: '/settings/communication/outcomes', icon: Zap, locked: true },
      { name: 'Notetaker BETA', href: '/settings/communication/notetaker', icon: Bell, locked: true },
      { name: 'Email', href: '/settings/communication/email', icon: Mail, locked: true },
      { name: 'Templates & Snippets', href: '/settings/communication/templates', icon: Mail, locked: true },
      { name: 'Send As', href: '/settings/communication/sendas', icon: Mail, locked: true },
    ]
  },
  {
    name: 'Connect',
    icon: Plug,
    sections: [
      { name: 'Integrations', href: '/settings/integrations/integrations', icon: Plug },
      { name: 'Accounts & Apps', href: '/settings/integrations/accounts', icon: SettingsIcon },
      { name: 'Developer', href: '/settings/integrations/developer', icon: Code },
    ]
  },
  {
    name: 'Billing',
    icon: CreditCard,
    sections: [
      { name: 'Billing', href: '/settings/billing', icon: CreditCard },
      { name: 'Usage', href: '/settings/billing/usage', icon: BarChart3 },
    ]
  }
];

export default function Settings() {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Get the current section from the URL
  const currentPath = location.pathname;
  
  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Settings</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage your account and organization settings
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-[#1a1d24] border-r border-crm-border p-4 overflow-y-auto">
          <nav className="space-y-2">
            {settingsNavigation.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedSections[category.name] ?? true; // Default to expanded
              
              return (
                <div key={category.name} className="mb-4">
                  <button
                    onClick={() => toggleSection(category.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-crm-text-primary">{category.name}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 text-crm-text-secondary transform transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1 pl-6">
                      {category.sections.map((section) => {
                        const SectionIcon = section.icon;
                        const isActive = currentPath === section.href;

                        // Render locked items
                        if (section.locked) {
                          return (
                            <div key={section.href} className="relative group">
                              <div
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30"
                              >
                                <SectionIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">{section.name}</span>
                                <Lock className="h-3 w-3 ml-auto text-gray-400" />
                              </div>
                              {/* Tooltip */}
                              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                  Coming in V1.1
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Render unlocked items
                        return (
                          <Link
                            key={section.href}
                            to={section.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-primary text-white'
                                : 'hover:bg-gray-100 text-crm-text-secondary'
                            }`}
                          >
                            <SectionIcon className="h-4 w-4" />
                            <span>{section.name}</span>
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

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg border border-crm-border">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}