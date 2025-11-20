import { Search, Plus, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from './ThemeToggle';

export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-crm-border flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search leads, contacts, deals..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <Button variant="default" size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New</span>
        </Button>

        {/* Notifications */}
        <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Help */}
        <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <HelpCircle className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
