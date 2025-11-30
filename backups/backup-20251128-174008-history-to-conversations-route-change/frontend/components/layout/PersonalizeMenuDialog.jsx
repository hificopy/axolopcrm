import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Zap,
  MessageSquare,
  BarChart3,
  Database,
  Puzzle,
  Settings,
  Brain,
  FileText,
  Users,
  CreditCard,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export default function PersonalizeMenuDialog({
  isOpen,
  onClose,
  availableItems,
  activeButtons,
  onUpdate
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    core: true,
    communication: true,
    analytics: false,
    data: false,
    development: false,
    customization: false,
    ai: false,
    resources: false,
    team: false,
    account: false,
    help: false
  });
  const MAX_BUTTONS = 12;

  // Category icons and labels
  const categoryInfo = {
    core: { icon: Zap, label: 'Core Actions', color: 'green' },
    communication: { icon: MessageSquare, label: 'Communication', color: 'blue' },
    analytics: { icon: BarChart3, label: 'Analytics & Reports', color: 'purple' },
    data: { icon: Database, label: 'Data Management', color: 'orange' },
    development: { icon: Puzzle, label: 'Development & API', color: 'red' },
    customization: { icon: Settings, label: 'Customization', color: 'yellow' },
    ai: { icon: Brain, label: 'AI Features', color: 'pink' },
    resources: { icon: FileText, label: 'Templates & Resources', color: 'indigo' },
    team: { icon: Users, label: 'Team Management', color: 'teal' },
    account: { icon: CreditCard, label: 'Account & Billing', color: 'gray' },
    help: { icon: HelpCircle, label: 'Help & Support', color: 'cyan' }
  };

  // Group items by category
  const groupedItems = availableItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Filter items based on search
  const filteredGroupedItems = Object.keys(groupedItems).reduce((acc, category) => {
    const filteredItems = groupedItems[category].filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedButtons([...activeButtons]);
    }
  }, [isOpen, activeButtons]);

  const handleToggleButton = (buttonId) => {
    setSelectedButtons(prev => {
      const isSelected = prev.includes(buttonId);

      if (isSelected) {
        // Remove button
        return prev.filter(id => id !== buttonId);
      } else {
        // Add button (if not at max)
        if (prev.length < MAX_BUTTONS) {
          return [...prev, buttonId];
        }
        // Could show toast for max reached
        return prev;
      }
    });
  };

  const handleSave = async () => {
    // Validate at least one button is selected
    if (selectedButtons.length === 0) {
      // Could show toast here
      return;
    }
    
    setIsSaving(true);
    
    try {
      await onUpdate(selectedButtons);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Could show error toast here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedButtons([...activeButtons]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Personalize Menu
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose up to {MAX_BUTTONS} buttons to display in your More menu.
            You can pin up to 4 buttons to the header.
            Click on the buttons below to toggle them on or off.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Selection Counter */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              Selected: {selectedButtons.length} / {MAX_BUTTONS}
            </p>
            {selectedButtons.length === MAX_BUTTONS && (
              <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">
                Max reached
              </Badge>
            )}
          </div>

          {/* Categorized Items */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(filteredGroupedItems).map(([category, items]) => {
              const CategoryIcon = categoryInfo[category]?.icon || Settings;
              const categoryLabel = categoryInfo[category]?.label || category;
              const isExpanded = expandedCategories[category];
              
              return (
                <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">
                        {categoryLabel}
                      </span>
                      <Badge variant="outline" className="text-xs text-gray-500 border-gray-600">
                        {items.length}
                      </Badge>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="border-t border-gray-700">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedButtons.includes(item.id);
                        const canSelect = selectedButtons.length < MAX_BUTTONS || isSelected;

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleToggleButton(item.id)}
                            disabled={!canSelect}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 border-b border-gray-700 last:border-b-0 transition-all
                              ${isSelected
                                ? 'bg-primary-green/20 text-white'
                                : canSelect
                                  ? 'bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                                  : 'bg-gray-900/30 text-gray-500 cursor-not-allowed'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1 text-left text-sm">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.locked && (
                                <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/50">
                                  {item.version || 'Soon'}
                                </Badge>
                              )}
                              {item.shortcut && (
                                <span className="text-xs text-gray-500">
                                  {item.shortcut}
                                </span>
                              )}
                              {isSelected && (
                                <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary-green">
                                  <svg
                                    className="h-2.5 w-2.5 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-[#3F0D28]">
              <strong>Note:</strong> These settings are personal to you and won't affect other users in your agency. You can select up to 12 buttons for the More menu, but only 4 can be pinned to the header at once.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedButtons.length === 0}
            className="bg-primary-green hover:bg-primary-green/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
