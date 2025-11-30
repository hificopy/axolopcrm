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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const categoryConfig = {
  leads: { icon: UserPlus, label: 'Leads', color: 'from-blue-500 to-cyan-500' },
  contacts: { icon: Users, label: 'Contacts', color: 'from-green-500 to-emerald-500' },
  campaigns: { icon: Mail, label: 'Campaigns', color: 'from-purple-500 to-pink-500' },
  secondBrain: { icon: Brain, label: 'Second Brain', color: 'from-indigo-500 to-blue-500' },
  opportunities: { icon: TrendingUp, label: 'Opportunities', color: 'from-orange-500 to-red-500' },
  activities: { icon: Activity, label: 'Activities', color: 'from-yellow-500 to-orange-500' },
  forms: { icon: FileInput, label: 'Forms', color: 'from-teal-500 to-green-500' },
};

const subCategoryIcons = {
  nodes: Brain,
  maps: Map,
  notes: FileText,
};

export default function MasterSearch({ isOpen, onClose }) {
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
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`, {
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
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Search Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-[#1a1d24] border-2 border-gray-700'
              : 'bg-white border-2 border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="relative">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-700 dark:border-gray-600">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search leads, contacts, campaigns, notes..."
                className={`flex-1 bg-transparent border-none outline-none text-lg ${
                  theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
              {loading && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
              {query && !loading && (
                <button
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setCategories({});
                  }}
                  className="p-1 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className={`max-h-[60vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-[#0d0f12]' : 'bg-gray-50'
            }`}
          >
            {results.length === 0 && !loading && query.length >= 2 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-gray-700/50 dark:bg-gray-800/50 p-4 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-lg">No results found</p>
                <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {results.length === 0 && !loading && query.length < 2 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 mb-4">
                  <Command className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-lg font-medium">Start typing to search</p>
                <p className="text-gray-500 dark:text-gray-600 text-sm mt-2">
                  Search across leads, contacts, campaigns, notes, and more
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {Object.entries(categoryConfig).map(([key, { label, color }]) => (
                    <span
                      key={key}
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${color} text-white`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(groupedResults).map(([category, items]) => {
              const config = categoryConfig[category];
              const Icon = config?.icon || Search;

              return (
                <div key={category} className="py-2">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 px-4 py-2 mb-1">
                    <div
                      className={`p-1.5 rounded-lg bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'}`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {config?.label || category}
                    </span>
                    <span className="text-xs text-gray-500">({items.length})</span>
                  </div>

                  {/* Results */}
                  {items.map((result, idx) => {
                    const globalIndex = results.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;
                    const SubIcon = result.subCategory
                      ? subCategoryIcons[result.subCategory]
                      : Icon;

                    return (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => handleSelectResult(result)}
                        className={`w-full flex items-start gap-3 px-4 py-3 transition-all ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-blue-500/10 border-l-4 border-blue-500'
                              : 'bg-blue-50 border-l-4 border-blue-500'
                            : 'border-l-4 border-transparent hover:bg-gray-700/50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            isSelected
                              ? 'bg-blue-500/20'
                              : theme === 'dark'
                              ? 'bg-gray-700/50'
                              : 'bg-gray-200/50'
                          }`}
                        >
                          <SubIcon className={`h-4 w-4 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <p
                            className={`font-medium truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 truncate">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-600 truncate mt-1">
                              {result.description}
                            </p>
                          )}
                        </div>

                        <ArrowRight
                          className={`h-4 w-4 flex-shrink-0 transition-transform ${
                            isSelected ? 'text-blue-400 translate-x-1' : 'text-gray-500'
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div
              className={`flex items-center justify-between px-4 py-3 border-t ${
                theme === 'dark'
                  ? 'border-gray-700 bg-[#1a1d24]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-600">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-400 font-mono">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-400 font-mono">
                    Enter
                  </kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-400 font-mono">
                    Esc
                  </kbd>
                  <span>Close</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
