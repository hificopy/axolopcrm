import { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Bot,
  Settings2,
  HelpCircle,
  Bell,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Key,
  Upload,
  Download,
  Puzzle,
  Database,
  Workflow,
  Brain,
  Zap,
  Users,
  MessageSquare,
  Link,
  Target,
  TrendingUp,
  Activity,
  FilePlus,
  Lock,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabase } from '../context/SupabaseContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PersonalizeMenuDialog from './PersonalizeMenuDialog';
import InviteMemberModal from '../InviteMemberModal';
import QuickLeadModal from '../modals/QuickLeadModal';

// Available menu items
export const AVAILABLE_MENU_ITEMS = [
  // Core Quick Actions
  {
    id: 'quick-search',
    label: 'Quick search',
    icon: Search,
    shortcut: '⌘+K',
    action: 'quick-search',
    category: 'core'
  },
  {
    id: 'quick-lead',
    label: 'Quick lead',
    icon: UserPlus,
    shortcut: '⌘+L',
    action: 'quick-lead',
    category: 'core'
  },
  {
    id: 'call-dialer',
    label: 'Call dialer',
    icon: Phone,
    shortcut: '⌘+D',
    action: 'navigate',
    path: '/app/calls',
    category: 'core'
  },
  
  // Communication
  {
    id: 'email-templates',
    label: 'Email templates',
    icon: Mail,
    action: 'navigate',
    path: '/app/email-templates',
    category: 'communication'
  },
  {
    id: 'meeting-scheduler',
    label: 'Meeting scheduler',
    icon: Calendar,
    action: 'navigate',
    path: '/app/meetings',
    category: 'communication'
  },
  {
    id: 'team-chat',
    label: 'Team chat',
    icon: MessageSquare,
    action: 'navigate',
    path: '/app/team-chat',
    locked: true,
    version: 'V1.1',
    category: 'communication'
  },
  
  // Analytics & Reports
  {
    id: 'reports-dashboard',
    label: 'Reports dashboard',
    icon: BarChart3,
    action: 'navigate',
    path: '/app/reports',
    category: 'analytics'
  },
  {
    id: 'activity-feed',
    label: 'Activity feed',
    icon: Activity,
    action: 'navigate',
    path: '/app/activities',
    category: 'analytics'
  },
  {
    id: 'sales-analytics',
    label: 'Sales analytics',
    icon: TrendingUp,
    action: 'navigate',
    path: '/app/analytics/sales',
    category: 'analytics'
  },
  
  // Data Management
  {
    id: 'import-data',
    label: 'Import data',
    icon: Upload,
    action: 'navigate',
    path: '/app/import',
    category: 'data'
  },
  {
    id: 'export-data',
    label: 'Export data',
    icon: Download,
    action: 'navigate',
    path: '/app/export',
    category: 'data'
  },
  {
    id: 'backup-restore',
    label: 'Backup & restore',
    icon: Shield,
    action: 'navigate',
    path: '/app/backup',
    category: 'data'
  },
  
  // Development & Integration
  {
    id: 'api-keys',
    label: 'API keys',
    icon: Key,
    action: 'navigate',
    path: '/app/api-keys',
    category: 'development'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Puzzle,
    action: 'navigate',
    path: '/app/integrations',
    category: 'development'
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    icon: Link,
    action: 'navigate',
    path: '/app/webhooks',
    category: 'development'
  },
  
  // Customization
  {
    id: 'custom-fields',
    label: 'Custom fields',
    icon: Database,
    action: 'navigate',
    path: '/app/custom-fields',
    category: 'customization'
  },
  {
    id: 'workflow-builder',
    label: 'Workflow builder',
    icon: Workflow,
    action: 'navigate',
    path: '/app/workflows',
    category: 'customization'
  },
  {
    id: 'automation-rules',
    label: 'Automation rules',
    icon: Zap,
    action: 'navigate',
    path: '/app/automation',
    category: 'customization'
  },
  
  // AI Features
  {
    id: 'second-brain',
    label: 'Second brain',
    icon: Brain,
    action: 'navigate',
    path: '/app/second-brain',
    category: 'ai'
  },
  {
    id: 'ai-assistant',
    label: 'AI assistant',
    icon: Bot,
    action: 'navigate',
    path: '/app/ai-assistant',
    category: 'ai'
  },
  
  // Templates & Resources
  {
    id: 'template-center',
    label: 'Template center',
    icon: FileText,
    action: 'navigate',
    path: '/app/templates',
    category: 'resources'
  },
  {
    id: 'form-templates',
    label: 'Form templates',
    icon: FilePlus,
    action: 'navigate',
    path: '/app/form-templates',
    category: 'resources'
  },
  {
    id: 'campaign-templates',
    label: 'Campaign templates',
    icon: Target,
    action: 'navigate',
    path: '/app/campaign-templates',
    category: 'resources'
  },
  
  // Team Management
  {
    id: 'invite-member',
    label: 'Invite team member',
    icon: UserPlus,
    action: 'invite-member',
    requiresAdmin: true,
    category: 'team'
  },
  {
    id: 'team-settings',
    label: 'Team settings',
    icon: Users,
    action: 'navigate',
    path: '/app/team-settings',
    requiresAdmin: true,
    category: 'team'
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: Lock,
    action: 'navigate',
    path: '/app/permissions',
    requiresAdmin: true,
    category: 'team'
  },
  
  // Billing & Account
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    action: 'navigate',
    path: '/app/billing',
    category: 'account'
  },
  {
    id: 'usage-stats',
    label: 'Usage stats',
    icon: BarChart3,
    action: 'navigate',
    path: '/app/usage',
    category: 'account'
  },
  
  // Help & Support
  {
    id: 'help',
    label: 'Help center',
    icon: HelpCircle,
    action: 'help',
    category: 'help'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'notifications',
    category: 'help'
  },
  {
    id: 'changelog',
    label: 'What\'s new',
    icon: Info,
    action: 'navigate',
    path: '/app/changelog',
    category: 'help'
  },
  {
    id: 'system-status',
    label: 'System status',
    icon: CheckCircle,
    action: 'navigate',
    path: '/app/status',
    category: 'help'
  }
];

export default function SidebarMoreMenu({ pinnedButtons, onPinnedChange }) {
  const { user, supabase } = useSupabase();
  const navigate = useNavigate();
  const [activeButtons, setActiveButtons] = useState(['quick-search', 'help']);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQuickLeadModal, setShowQuickLeadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load user's menu preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me/sidebar-menu`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (response.data.success) {
          setActiveButtons(response.data.data || ['quick-search', 'help']);
        } else {
          console.error('API returned error:', response.data);
          setActiveButtons(['quick-search', 'help']);
        }
      } catch (error) {
        console.error('Error loading sidebar menu preferences:', error);
        // Set default buttons on error
        setActiveButtons(['quick-search', 'help']);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user, supabase]);

  const handleMenuItemClick = (item) => {
    setIsOpen(false);

    switch (item.action) {
      case 'quick-search':
        // Trigger quick search with keyboard shortcut
        const event = new KeyboardEvent('keydown', { 
          key: 'k', 
          metaKey: true, 
          ctrlKey: true 
        });
        document.dispatchEvent(event);
        break;
        
      case 'quick-lead':
        // Open quick lead creation modal
        setShowQuickLeadModal(true);
        break;
        
      case 'invite-member':
        setShowInviteModal(true);
        break;
        
      case 'navigate':
        // Check if item is locked and handle appropriately
        if (item.locked) {
          // Show coming soon tooltip or navigate to beta access
          console.log(`Feature ${item.label} coming in ${item.version}`);
          // Could show a toast notification here
        } else {
          navigate(item.path);
        }
        break;
        
      case 'help':
        // Open help center in new tab or modal
        window.open('/docs', '_blank');
        break;
        
      case 'notifications':
        // Toggle notifications panel
        // TODO: Implement notifications panel
        console.log('Notifications panel - coming soon');
        break;
        
      default:
        console.log('Unknown action:', item.action);
    }
  };

  const handleTogglePin = async (itemId) => {
    const isPinned = pinnedButtons.includes(itemId);
    let newPinned;

    if (isPinned) {
      // Unpin
      newPinned = pinnedButtons.filter(id => id !== itemId);
    } else {
      // Pin (if not at max)
      if (pinnedButtons.length >= 4) {
        return; // Already at max
      }
      newPinned = [...pinnedButtons, itemId];
    }

    // Update parent component
    onPinnedChange(newPinned);
  };

  const handlePersonalizeClick = () => {
    setIsOpen(false);
    setIsPersonalizeOpen(true);
  };

  const handlePreferencesUpdate = async (newButtons) => {
    setIsSaving(true);
    setSaveError(null);
    
    // Optimistic update
    setActiveButtons(newButtons);
    
    // Save to backend
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/me/sidebar-menu`,
        { buttons: newButtons },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save preferences');
      }
      
      // Success - could show toast notification here
      console.log('Preferences saved successfully');
      
    } catch (error) {
      console.error('Error saving sidebar menu preferences:', error);
      setSaveError(error.message || 'Failed to save preferences');
      
      // Revert on error
      setActiveButtons(prev => prev);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter to show only active buttons
  const visibleItems = AVAILABLE_MENU_ITEMS.filter(item =>
    activeButtons.includes(item.id)
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-gray-400">
        <Settings2 className="h-5 w-5 animate-pulse" />
        <span className="flex-1 text-left">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <Settings2 className="h-5 w-5" />
            <span className="flex-1 text-left">More</span>
            <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          className="w-64 bg-gray-900/95 backdrop-blur-xl border-gray-700/50"
        >
          <DropdownMenuLabel className="text-gray-300 font-semibold">
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700/50" />

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isPinned = pinnedButtons.includes(item.id);
            const canPin = pinnedButtons.length < 4 || isPinned;

            return (
              <DropdownMenuItem
                key={item.id}
                onSelect={(e) => e.preventDefault()}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/10 focus:bg-white/10 text-gray-300 hover:text-white"
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => handleMenuItemClick(item)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-gray-500">{item.shortcut}</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePin(item.id);
                  }}
                  disabled={!canPin}
                  className={`p-1 rounded hover:bg-white/20 transition-colors ${
                    isPinned
                      ? 'text-primary-green'
                      : canPin
                        ? 'text-gray-500 hover:text-gray-300'
                        : 'text-gray-700 cursor-not-allowed'
                  }`}
                  title={isPinned ? 'Unpin from header' : canPin ? 'Pin to header' : 'Max 4 pins reached'}
                >
                  {isPinned ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    <Pin className="h-3.5 w-3.5" />
                  )}
                </button>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="bg-gray-700/50" />

          {saveError && (
            <div className="px-3 py-2 text-xs text-red-400 bg-red-500/10 border-b border-gray-700/50">
              {saveError}
            </div>
          )}

          <DropdownMenuItem
            onClick={handlePersonalizeClick}
            disabled={isSaving}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/10 focus:bg-white/10 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings2 className="h-4 w-4" />
            <span className="flex-1">Personalize menu</span>
            {isSaving && (
              <div className="h-3 w-3 border-2 border-primary-green border-t-transparent animate-spin rounded-full" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PersonalizeMenuDialog
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        availableItems={AVAILABLE_MENU_ITEMS}
        activeButtons={activeButtons}
        onUpdate={handlePreferencesUpdate}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          console.log('Member invited successfully from More menu');
        }}
      />

      <QuickLeadModal
        isOpen={showQuickLeadModal}
        onClose={() => setShowQuickLeadModal(false)}
        onSuccess={() => {
          console.log('Lead created successfully from More menu');
        }}
      />
    </>
  );
}
