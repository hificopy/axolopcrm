import { Search, Plus, Bell, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from './ThemeToggle';

export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 gap-6 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search leads, contacts, deals..."
            className="pl-10 bg-gray-50 border-gray-200 hover:bg-white focus-visible:bg-white"
          />
        </div>
      </div>

      {/* Actions - Premium Hierarchy */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Quick Add - Accent Red (Most Important Action) */}
        <Button variant="accent" size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New</span>
        </Button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200 relative group"
        >
          <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
          <motion.span
            className="absolute top-2 right-2 h-2.5 w-2.5 bg-[#7b1c14] rounded-full shadow-lg shadow-red-500/50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            No new notifications
          </div>
        </motion.button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Help */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200 group relative"
        >
          <HelpCircle className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />

          {/* Tooltip */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Help & Support
          </div>
        </motion.button>
      </div>
    </div>
  );
}
