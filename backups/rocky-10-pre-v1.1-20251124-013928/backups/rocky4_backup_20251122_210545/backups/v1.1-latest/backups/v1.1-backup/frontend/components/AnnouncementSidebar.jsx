import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function AnnouncementSidebar({ isOpen, onClose }) {
  const announcements = [
    {
      id: 1,
      title: "Axolop CRM V1.0 Now Available!",
      date: "November 19, 2025",
      content: "V1.0 includes core CRM functionality: leads management with import/export, contact database, sales pipeline tracking, Typeform-style form builder with lead scoring, automation workflows, and dashboard analytics.",
      read: false
    },
    {
      id: 2,
      title: "New Feature: Advanced Analytics",
      date: "November 1, 2025",
      content: "Introducing our new advanced analytics dashboard with custom reporting capabilities and real-time data visualization.",
      read: true
    },
    {
      id: 3,
      title: "Integration Update",
      date: "October 15, 2025",
      content: "We've added new integrations with popular email marketing platforms and e-commerce systems.",
      read: true
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-[#1a1d24] shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Announcements</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id}
                className={`p-4 rounded-lg border ${
                  announcement.read 
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{announcement.title}</h3>
                      {!announcement.read && (
                        <span className="h-2 w-2 bg-[#7b1c14] rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{announcement.date}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{announcement.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}