import { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Bot,
  Settings2,
  ChevronRight,
  HelpCircle,
  Bell,
  Pin,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSupabase } from '@/context/SupabaseContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PersonalizeMenuDialog from './PersonalizeMenuDialog';

// Available menu items
export const AVAILABLE_MENU_ITEMS = [
  {
    id: 'quick-search',
    label: 'Quick search',
    icon: Search,
    shortcut: '⌘+K',
    action: 'quick-search'
  },
  {
    id: 'template-center',
    label: 'Template center',
    icon: FileText,
    action: 'navigate',
    path: '/app/templates'
  },
  {
    id: 'autopilot-hub',
    label: 'Autopilot hub',
    icon: Bot,
    action: 'navigate',
    path: '/app/autopilot'
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    action: 'help'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'notifications'
  }
];

export default function SidebarMoreMenu({ pinnedButtons, onPinnedChange }) {
  const { user, supabase } = useSupabase();
  const navigate = useNavigate();
  const [activeButtons, setActiveButtons] = useState(['quick-search', 'help']);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load user's menu preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user || !supabase) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/me/sidebar-menu`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (response.data.success) {
          setActiveButtons(response.data.data);
        }
      } catch (error) {
        console.error('Error loading sidebar menu preferences:', error);
      }
    };

    loadPreferences();
  }, [user, supabase]);

  const handleMenuItemClick = (item) => {
    setIsOpen(false);

    switch (item.action) {
      case 'quick-search':
        // Trigger quick search (you can implement this with a keyboard shortcut listener)
        console.log('Quick search triggered');
        // TODO: Implement quick search modal
        break;
      case 'navigate':
        navigate(item.path);
        break;
      case 'help':
        // Open help modal or navigate to help page
        console.log('Help triggered');
        // TODO: Implement help modal
        break;
      case 'notifications':
        // Open notifications panel
        console.log('Notifications triggered');
        // TODO: Implement notifications panel
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
    setActiveButtons(newButtons);

    // Save to backend
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/me/sidebar-menu`,
        { buttons: newButtons },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
    } catch (error) {
      console.error('Error saving sidebar menu preferences:', error);
    }
  };

  // Filter to show only active buttons
  const visibleItems = AVAILABLE_MENU_ITEMS.filter(item =>
    activeButtons.includes(item.id)
  );

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

          <DropdownMenuItem
            onClick={handlePersonalizeClick}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/10 focus:bg-white/10 text-gray-300 hover:text-white"
          >
            <Settings2 className="h-4 w-4" />
            <span>Personalize menu</span>
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
    </>
  );
}
