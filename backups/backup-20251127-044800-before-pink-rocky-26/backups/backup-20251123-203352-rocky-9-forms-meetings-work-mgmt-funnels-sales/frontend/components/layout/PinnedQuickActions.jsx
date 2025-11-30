import { AVAILABLE_MENU_ITEMS } from './SidebarMoreMenu';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '../ui/tooltip';

export default function PinnedQuickActions({ pinnedButtons }) {
  const navigate = useNavigate();

  const handleAction = (item) => {
    switch (item.action) {
      case 'quick-search':
        // Trigger quick search modal
        // You can dispatch a custom event or use a global state
        window.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
          ctrlKey: true
        }));
        break;
      case 'navigate':
        navigate(item.path);
        break;
      case 'help':
        // Open help modal
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

  // Filter to show only pinned buttons
  const pinnedItems = AVAILABLE_MENU_ITEMS.filter(item =>
    pinnedButtons.includes(item.id)
  );

  if (pinnedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      {pinnedItems.map((item) => {
        const Icon = item.icon;
        return (
          <Tooltip key={item.id} content={item.label} position="bottom" delay={500}>
            <button
              onClick={() => handleAction(item)}
              className="hover:opacity-80 transition-opacity"
            >
              <Icon className="h-5 w-5" color="white" strokeWidth={2} />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
