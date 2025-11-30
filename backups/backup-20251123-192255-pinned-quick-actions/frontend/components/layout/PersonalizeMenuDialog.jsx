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

export default function PersonalizeMenuDialog({
  isOpen,
  onClose,
  availableItems,
  activeButtons,
  onUpdate
}) {
  const [selectedButtons, setSelectedButtons] = useState([]);
  const MAX_BUTTONS = 4;

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
        return prev;
      }
    });
  };

  const handleSave = () => {
    onUpdate(selectedButtons);
    onClose();
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
            Click on the buttons below to toggle them on or off.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
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

          <div className="grid grid-cols-1 gap-2">
            {availableItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedButtons.includes(item.id);
              const canSelect = selectedButtons.length < MAX_BUTTONS || isSelected;

              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleButton(item.id)}
                  disabled={!canSelect}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
                    ${isSelected
                      ? 'bg-primary-green/20 border-primary-green text-white'
                      : canSelect
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                        : 'bg-gray-800/30 border-gray-700/50 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left font-medium">
                    {item.label}
                  </span>
                  {item.shortcut && (
                    <span className="text-xs text-gray-500">
                      {item.shortcut}
                    </span>
                  )}
                  {isSelected && (
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary-green">
                      <svg
                        className="h-3 w-3 text-white"
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
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> These settings are personal to you and won't affect other users in your agency.
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
            className="bg-primary-green hover:bg-primary-green/90 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
