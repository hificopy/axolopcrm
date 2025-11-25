import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  UserPlus,
  Users,
  Mail,
  Brain,
  Map,
  FileText,
  TrendingUp,
  Activity,
  FileInput,
  Command,
  Loader2,
  ArrowRight,
  Inbox,
  Phone,
  MessageSquare,
  Workflow,
  Zap,
  Calendar,
  CalendarClock,
  CalendarRange,
  BarChart3,
  Settings,
  Tag,
  Navigation,
  Folder,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

// Comprehensive category configuration with brand colors
const categoryConfig = {
  leads: {
    icon: UserPlus,
    label: 'Leads',
    color: 'from-[#7b1c14] via-[#8b2419] to-[#9b2c1e]',
    glow: 'shadow-[0_0_20px_rgba(123,28,20,0.4)]',
  },
  contacts: {
    icon: Users,
    label: 'Contacts',
    color: 'from-[#7b1c14] via-[#8b2419] to-[#9b2c1e]',
    glow: 'shadow-[0_0_20px_rgba(123,28,20,0.4)]',
  },
  opportunities: {
    icon: TrendingUp,
    label: 'Opportunities',
    color: 'from-orange-600 via-orange-700 to-red-700',
    glow: 'shadow-[0_0_20px_rgba(234,88,12,0.4)]',
  },
  activities: {
    icon: Activity,
    label: 'Activities',
    color: 'from-amber-600 via-amber-700 to-orange-700',
    glow: 'shadow-[0_0_20px_rgba(217,119,6,0.4)]',
  },
  marketing: {
    icon: Mail,
    label: 'Marketing',
    color: 'from-purple-600 via-purple-700 to-pink-700',
    glow: 'shadow-[0_0_20px_rgba(147,51,234,0.4)]',
  },
  communication: {
    icon: MessageSquare,
    label: 'Communication',
    color: 'from-blue-600 via-blue-700 to-indigo-700',
    glow: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]',
  },
  automation: {
    icon: Workflow,
    label: 'Automation',
    color: 'from-indigo-600 via-indigo-700 to-purple-700',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
  },
  secondBrain: {
    icon: Brain,
    label: 'Second Brain',
    color: 'from-violet-600 via-violet-700 to-purple-700',
    glow: 'shadow-[0_0_20px_rgba(124,58,237,0.4)]',
  },
  calendar: {
    icon: Calendar,
    label: 'Calendar',
    color: 'from-green-600 via-green-700 to-emerald-700',
    glow: 'shadow-[0_0_20px_rgba(22,163,74,0.4)]',
  },
  reports: {
    icon: BarChart3,
    label: 'Reports',
    color: 'from-cyan-600 via-cyan-700 to-blue-700',
    glow: 'shadow-[0_0_20px_rgba(8,145,178,0.4)]',
  },
  settings: {
    icon: Settings,
    label: 'Settings',
    color: 'from-gray-600 via-gray-700 to-slate-700',
    glow: 'shadow-[0_0_20px_rgba(75,85,99,0.4)]',
  },
  navigation: {
    icon: Navigation,
    label: 'Pages',
    color: 'from-[#7b1c14] via-[#8b2419] to-[#9b2c1e]',
    glow: 'shadow-[0_0_20px_rgba(123,28,20,0.4)]',
  },
};

const iconMap = {
  UserPlus,
  Users,
  TrendingUp,
  Activity,
  Mail,
  FileInput,
  FileText,
  Brain,
  Map,
  Folder,
  Inbox,
  Phone,
  MessageSquare,
  Workflow,
  Zap,
  Calendar,
  CalendarClock,
  CalendarRange,
  BarChart3,
  Settings,
  Tag,
  Navigation,
};

export default function PremiumMasterSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories, setCategories] = useState({});
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const debounceTimer = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setCategories({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setCategories(data.categories || {});
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length < 2) {
      setResults([]);
      setCategories({});
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle result selection
  const handleSelectResult = (result) => {
    navigate(result.url);
    onClose();
    setQuery('');
    setResults([]);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex, results]);

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    const category = result.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4"
        onClick={onClose}
      >
        {/* Premium Backdrop - Glassy with brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[#7b1c14]/20 to-black/80 backdrop-blur-xl" />

        {/* Ambient Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7b1c14]/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7b1c14]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>

        {/* Search Modal - Premium Glassmorphic */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 29, 36, 0.95) 0%, rgba(13, 15, 18, 0.98) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(123, 28, 20, 0.3)',
            boxShadow: '0 0 60px rgba(123, 28, 20, 0.2), 0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />

          {/* Premium gradient accent */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#7b1c14] to-transparent opacity-80" />

          {/* Header - Glassy */}
          <div className="relative">
            {/* Search Input */}
            <div className="flex items-center gap-4 p-5 border-b border-white/10" style={{ backdropFilter: 'blur(20px)' }}>
              <div className="relative">
                <Search className="h-6 w-6 text-[#7b1c14]" />
                <div className="absolute inset-0 bg-[#7b1c14]/20 blur-xl" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search everything in your CRM..."
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-gray-400 font-light"
                style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.1)' }}
              />
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="h-5 w-5 text-[#7b1c14]" />
                </motion.div>
              )}
              {query && !loading && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setCategories({});
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Results - Glassy scrollable area */}
          <div
            ref={resultsRef}
            className="max-h-[65vh] overflow-y-auto relative"
            style={{
              background: 'linear-gradient(180deg, rgba(13, 15, 18, 0.8) 0%, rgba(10, 12, 15, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Custom Scrollbar Styles */}
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(123, 28, 20, 0.5);
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(123, 28, 20, 0.7);
              }
            `}</style>

            {results.length === 0 && !loading && query.length >= 2 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="relative mb-6">
                  <div className="rounded-full bg-gradient-to-br from-[#7b1c14]/30 to-[#7b1c14]/10 p-6 backdrop-blur-xl border border-[#7b1c14]/30">
                    <Search className="h-12 w-12 text-[#7b1c14]" />
                  </div>
                  <div className="absolute inset-0 bg-[#7b1c14]/20 blur-2xl rounded-full" />
                </div>
                <p className="text-white text-xl font-light mb-2">No results found</p>
                <p className="text-gray-400 text-sm">
                  Try different keywords or browse through your CRM
                </p>
              </div>
            )}

            {results.length === 0 && !loading && query.length < 2 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="relative mb-6">
                  <div className="rounded-full bg-gradient-to-br from-[#7b1c14]/30 to-[#7b1c14]/10 p-6 backdrop-blur-xl border border-[#7b1c14]/30">
                    <Sparkles className="h-12 w-12 text-[#7b1c14]" />
                  </div>
                  <div className="absolute inset-0 bg-[#7b1c14]/20 blur-2xl rounded-full animate-pulse" />
                </div>
                <p className="text-white text-xl font-light mb-3">Search anything</p>
                <p className="text-gray-400 text-sm mb-8 max-w-md">
                  Leads, contacts, campaigns, workflows, calendar events, notes, pages, and more
                </p>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                  {Object.entries(categoryConfig).slice(0, 8).map(([key, { label, color, glow }]) => (
                    <span
                      key={key}
                      className={`px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r ${color} text-white backdrop-blur-sm ${glow}`}
                      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(groupedResults).map(([category, items]) => {
              const config = categoryConfig[category] || categoryConfig.leads;
              const Icon = config.icon;

              return (
                <div key={category} className="py-3">
                  {/* Category Header - Premium */}
                  <div className="flex items-center gap-3 px-5 py-3 mb-2">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-br ${config.color} ${config.glow} backdrop-blur-sm`}
                      style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-white tracking-wide">
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">({items.length})</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Results */}
                  {items.map((result, idx) => {
                    const globalIndex = results.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;
                    const ResultIcon = iconMap[result.icon] || Icon;

                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                        onClick={() => handleSelectResult(result)}
                        className={`w-full flex items-start gap-4 px-5 py-4 transition-all duration-200 group relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#7b1c14]/20 to-transparent border-l-2 border-[#7b1c14]'
                            : 'hover:bg-white/5 border-l-2 border-transparent'
                        }`}
                        style={isSelected ? { backdropFilter: 'blur(10px)' } : {}}
                      >
                        {/* Icon */}
                        <div
                          className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-200 ${
                            isSelected
                              ? `bg-gradient-to-br ${config.color} ${config.glow}`
                              : 'bg-white/5 group-hover:bg-white/10'
                          }`}
                          style={isSelected ? { border: '1px solid rgba(255, 255, 255, 0.2)' } : {}}
                        >
                          <ResultIcon
                            className={`h-5 w-5 transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                            }`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white truncate group-hover:text-white transition-colors">
                              {result.title}
                            </p>
                            {result.type && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-medium">
                                {result.type}
                              </span>
                            )}
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-gray-400 truncate mb-1">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 truncate">
                              {result.description}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ArrowRight
                          className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                            isSelected
                              ? 'text-[#7b1c14] translate-x-1'
                              : 'text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1'
                          }`}
                        />

                        {/* Selection Glow */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#7b1c14]/10 to-transparent pointer-events-none" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer - Premium */}
          {results.length > 0 && (
            <div
              className="flex items-center justify-between px-5 py-4 border-t border-white/10"
              style={{
                background: 'linear-gradient(180deg, rgba(13, 15, 18, 0.95) 0%, rgba(10, 12, 15, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-400 font-mono border border-white/10">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-400 font-mono border border-white/10">
                    Enter
                  </kbd>
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-400 font-mono border border-white/10">
                    Esc
                  </kbd>
                  <span>Close</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-xs text-gray-500">
                  {Object.keys(categories).length} categories
                </span>
              </div>
            </div>
          )}

          {/* Bottom Glow */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7b1c14]/50 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
