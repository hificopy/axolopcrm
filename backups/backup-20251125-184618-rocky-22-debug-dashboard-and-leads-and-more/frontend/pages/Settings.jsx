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
import { isFeatureLocked, getFeatureVersion } from '@/config/features';

const settingsNavigation = [
  {
    name: 'Account',
    icon: User,
    sections: [
      { name: 'Profile', href: '/app/settings/account', icon: User },
      { name: 'Appearance', href: '/app/settings/account?tab=appearance', icon: LayoutDashboard, locked: true, featureCategory: 'account', featureKey: 'appearance' },
      { name: 'Memberships', href: '/app/settings/account?tab=membership', icon: Key },
    ]
  },
  {
    name: 'Organization',
    icon: Building,
    sections: [
      { name: 'General', href: '/app/settings/organization/general', icon: Building },
      { name: 'Team Management', href: '/app/settings/organization/team', icon: Users },
      { name: 'Roles & Permissions', href: '/app/settings/organization/permissions', icon: Shield },
    ]
  },
  {
    name: 'Customization',
    icon: LayoutDashboard,
    sections: [
      { name: 'Custom Fields', href: '/app/settings/custom-fields', icon: LayoutDashboard },
      { name: 'Integration Links', href: '/app/settings/customization/links', icon: Zap },
      { name: 'Scheduling Links', href: '/app/settings/customization/scheduling', icon: Clock },
      { name: 'Statuses & Pipelines', href: '/app/settings/customization/statuses', icon: Zap },
      { name: 'AI Knowledge Sources', href: '/app/settings/customization/ai', icon: Code, locked: true, featureCategory: 'customization', featureKey: 'aiKnowledge' },
    ]
  },
  {
    name: 'Communication',
    icon: Mail,
    sections: [
      { name: 'Phone & Voicemail', href: '/app/settings/communication/phone', icon: Phone, locked: true, featureCategory: 'communication', featureKey: 'phone' },
      { name: 'Dialer', href: '/app/settings/communication/dialer', icon: Phone, locked: true, featureCategory: 'communication', featureKey: 'dialer' },
      { name: 'Outcomes', href: '/app/settings/communication/outcomes', icon: Zap, locked: true, featureCategory: 'communication', featureKey: 'outcomes' },
      { name: 'Notetaker BETA', href: '/app/settings/communication/notetaker', icon: Bell, locked: true, featureCategory: 'communication', featureKey: 'notetaker' },
      { name: 'Email', href: '/app/settings/communication/email', icon: Mail, locked: true, featureCategory: 'communication', featureKey: 'email' },
      { name: 'Templates & Snippets', href: '/app/settings/communication/templates', icon: Mail, locked: true, featureCategory: 'communication', featureKey: 'templates' },
      { name: 'Send As', href: '/app/settings/communication/sendas', icon: Mail, locked: true, featureCategory: 'communication', featureKey: 'sendAs' },
    ]
  },
  {
    name: 'Connect',
    icon: Plug,
    sections: [
      { name: 'Integrations', href: '/app/settings/integrations/integrations', icon: Plug },
      { name: 'Accounts & Apps', href: '/app/settings/integrations/accounts', icon: SettingsIcon },
      { name: 'Developer', href: '/app/settings/integrations/developer', icon: Code },
    ]
  },
  {
    name: 'Billing',
    icon: CreditCard,
    sections: [
      { name: 'Billing', href: '/app/settings/billing', icon: CreditCard },
      { name: 'Usage', href: '/app/settings/billing/usage', icon: BarChart3, locked: true, featureCategory: 'billing', featureKey: 'usage' },
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
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                          const version = section.featureCategory && section.featureKey
                            ? getFeatureVersion(section.featureCategory, section.featureKey)
                            : 'V1.1';
                          return (
                            <div key={section.href} className="relative group overflow-visible">
                              <div
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30"
                              >
                                <SectionIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">{section.name}</span>
                                <Lock className="h-3 w-3 ml-auto text-gray-400" />
                              </div>
                              {/* Tooltip - positioned above to avoid being cut off */}
                              <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                                  Coming in {version || 'a future update'}
                                  <Link
                                    to="/roadmap"
                                    className="ml-1 text-[#d4463c] hover:text-[#e85a50] pointer-events-auto underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View roadmap
                                  </Link>
                                  {/* Arrow pointing down */}
                                  <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
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
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-crm-text-secondary'
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
            <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}