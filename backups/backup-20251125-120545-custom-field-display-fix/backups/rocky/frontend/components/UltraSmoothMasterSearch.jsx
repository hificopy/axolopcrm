import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Star,
  Copy,
  Plus,
  Bot,
  Building,
  CheckSquare,
  File,
  Layers,
  Package,
  Send,
  RefreshCw,
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
    actions: ['Open Profile', 'Edit', 'Convert to Contact'],
  },
  contacts: {
    icon: Users,
    label: 'Contacts',
    color: 'from-[#7b1c14] via-[#8b2419] to-[#9b2c1e]',
    glow: 'shadow-[0_0_20px_rgba(123,28,20,0.4)]',
    actions: ['Open Profile', 'Edit', 'Send Email'],
  },
  opportunities: {
    icon: TrendingUp,
    label: 'Opportunities',
    color: 'from-orange-600 via-orange-700 to-red-700',
    glow: 'shadow-[0_0_20px_rgba(234,88,12,0.4)]',
    actions: ['Open', 'Edit', 'Update Stage'],
  },
  activities: {
    icon: Activity,
    label: 'Activities',
    color: 'from-amber-600 via-amber-700 to-orange-700',
    glow: 'shadow-[0_0_20px_rgba(217,119,6,0.4)]',
    actions: ['Open', 'Mark Complete', 'Reschedule'],
  },
  marketing: {
    icon: Mail,
    label: 'Marketing',
    color: 'from-purple-600 via-purple-700 to-pink-700',
    glow: 'shadow-[0_0_20px_rgba(147,51,234,0.4)]',
    actions: ['View Campaign', 'Edit', 'View Analytics'],
  },
  communication: {
    icon: MessageSquare,
    label: 'Communication',
    color: 'from-blue-600 via-blue-700 to-indigo-700',
    glow: 'shadow-[0_0_20px_rgba(37,99,235,0.4)]',
    actions: ['Open', 'Reply', 'Archive'],
  },
  automation: {
    icon: Workflow,
    label: 'Automation',
    color: 'from-indigo-600 via-indigo-700 to-purple-700',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    actions: ['Open', 'Edit', 'View Executions'],
  },
  secondBrain: {
    icon: Brain,
    label: 'Second Brain',
    color: 'from-violet-600 via-violet-700 to-purple-700',
    glow: 'shadow-[0_0_20px_rgba(124,58,237,0.4)]',
    actions: ['Open', 'Edit', 'Share'],
  },
  calendar: {
    icon: Calendar,
    label: 'Calendar',
    color: 'from-green-600 via-green-700 to-emerald-700',
    glow: 'shadow-[0_0_20px_rgba(22,163,74,0.4)]',
    actions: ['Open', 'Edit Event', 'Add to Calendar'],
  },
  reports: {
    icon: BarChart3,
    label: 'Reports',
    color: 'from-cyan-600 via-cyan-700 to-blue-700',
    glow: 'shadow-[0_0_20px_rgba(8,145,178,0.4)]',
    actions: ['View Report', 'Export', 'Schedule'],
  },
  settings: {
    icon: Settings,
    label: 'Settings',
    color: 'from-gray-600 via-gray-700 to-slate-700',
    glow: 'shadow-[0_0_20px_rgba(75,85,99,0.4)]',
    actions: ['Open Settings', 'Edit'],
  },
  navigation: {
    icon: Navigation,
    label: 'Pages',
    color: 'from-[#7b1c14] via-[#8b2419] to-[#9b2c1e]',
    glow: 'shadow-[0_0_20px_rgba(123,28,20,0.4)]',
    actions: ['Go to Page', 'Open in New Tab'],
  },
  ai: {
    icon: Bot,
    label: 'AI Assistant',
    color: 'from-fuchsia-600 via-fuchsia-700 to-purple-700',
    glow: 'shadow-[0_0_20px_rgba(192,38,211,0.4)]',
    actions: ['Ask AI', 'Get Insights'],
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
  Bot,
  Building,
  CheckSquare,
  File,
  Layers,
  Package,
  Send,
  RefreshCw,
};

export default function UltraSmoothMasterSearch({ isOpen, onClose }) {
  // Persistent state (preserved when reopened)
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories, setCategories] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const debounceTimer = useRef(null);
  const abortController = useRef(null);

  // Test fetch on component mount
  useEffect(() => {
    console.log('[SEARCH] Component mounted, testing API...');
    fetch('/api/search?q=test&limit=5')
      .then(res => {
        console.log('[SEARCH] Test fetch response status:', res.status);
        return res.json();
      })
      .then(data => console.log('[SEARCH] Test fetch data:', data))
      .catch(err => console.error('[SEARCH] Test fetch error:', err));
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);

      // Restore scroll position
      if (resultsRef.current && scrollPosition > 0) {
        resultsRef.current.scrollTop = scrollPosition;
      }
    }
  }, [isOpen, scrollPosition]);

  // Save scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (resultsRef.current) {
        setScrollPosition(resultsRef.current.scrollTop);
      }
    };

    const ref = resultsRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => ref?.removeEventListener('scroll', handleScroll);
  }, []);

  // Optimized debounced search with abort controller
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setCategories({});
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`;
      console.log('[SEARCH] Fetching:', url);
      console.log('[SEARCH] Query:', searchQuery);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.current.signal,
      });

      console.log('[SEARCH] Response status:', response.status);
      console.log('[SEARCH] Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SEARCH] Data received:', data);
      console.log('[SEARCH] Results count:', data.results?.length || 0);

      if (data.success) {
        console.log('[SEARCH] Setting', data.results?.length || 0, 'results');
        setResults(data.results || []);
        setCategories(data.categories || {});
        setSelectedIndex(0);
        setError(null);
      } else {
        console.error('[SEARCH] Search failed:', data.message);
        setError(data.message || 'Search failed');
        setResults([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[SEARCH] Error:', error);
        setError(`Search error: ${error.message}`);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with optimized debouncing (reduced to 150ms)
  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('[SEARCH] Input changed:', value);
    setQuery(value);
    setError(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length < 2) {
      console.log('[SEARCH] Query too short, clearing results');
      setResults([]);
      setCategories({});
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('[SEARCH] Debouncing search for:', value);
    debounceTimer.current = setTimeout(() => {
      console.log('[SEARCH] Debounce complete, performing search');
      performSearch(value);
    }, 150); // Reduced from 300ms for faster feel
  };

  // Query AI assistant
  const queryAI = useCallback(async (question) => {
    try {
      setAiLoading(true);
      setAiResponse(null);
      console.log('[AI] Querying AI with:', question);

      const response = await fetch(`/api/ai-assistant/query?q=${encodeURIComponent(question)}`);
      const data = await response.json();

      console.log('[AI] Response:', data);

      if (data.success) {
        setAiResponse(data);
      } else {
        setError('AI query failed');
      }
    } catch (error) {
      console.error('[AI] Error:', error);
      setError(`AI error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Handle result selection - preserve state and close
  const handleSelectResult = useCallback((result) => {
    console.log('Selecting result:', result);
    navigate(result.url);
    onClose();
    // Don't clear query - preserve it for next open
  }, [navigate, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        console.log('Enter pressed, selected index:', selectedIndex, 'result:', results[selectedIndex]);
        handleSelectResult(results[selectedIndex]);
      } else if (query.length >= 2) {
        // No results found, ask AI directly in the search modal
        console.log('No results found, asking AI about:', query);
        queryAI(query);
      } else {
        console.log('No result selected, results length:', results.length, 'selectedIndex:', selectedIndex);
      }
    } else if (e.key === 'Escape') {
      // Clear AI response on Esc
      if (aiResponse) {
        setAiResponse(null);
      } else {
        onClose();
      }
    }
  }, [results, selectedIndex, onClose, handleSelectResult, query, queryAI, aiResponse]);

  // Handle quick actions
  const handleQuickAction = useCallback((result, action) => {
    console.log('Quick action:', action, 'on', result);

    // Execute action based on type
    switch (action) {
      case 'Open Profile':
      case 'Open':
      case 'View':
      case 'View Campaign':
      case 'View Report':
      case 'View Executions':
      case 'Go to Page':
        handleSelectResult(result);
        break;

      case 'Open in New Tab':
        window.open(result.url, '_blank');
        onClose();
        break;

      case 'Edit': {
        // Navigate to edit page for the item
        const editUrl = result.url.includes('?')
          ? `${result.url}&mode=edit`
          : `${result.url}?mode=edit`;
        navigate(editUrl);
        onClose();
        break;
      }

      case 'Send Email':
        // Open email composer with contact pre-filled
        navigate(`/inbox?compose=true&to=${result.metadata?.email || result.title}`);
        onClose();
        break;

      case 'Convert to Contact':
        // Navigate to lead with conversion dialog
        navigate(`${result.url}&convert=true`);
        onClose();
        break;

      case 'Update Stage':
        // Navigate to opportunity with stage update dialog
        navigate(`${result.url}&updateStage=true`);
        onClose();
        break;

      case 'Mark Complete':
        // TODO: Make API call to mark as complete
        console.log('Marking complete:', result.title);
        // Could show a toast notification here
        break;

      case 'Reschedule':
        // Navigate to activity with reschedule dialog
        navigate(`${result.url}&reschedule=true`);
        onClose();
        break;

      case 'Reply':
        // Open reply composer
        navigate(`/inbox?reply=${result.id}`);
        onClose();
        break;

      case 'Archive':
        // TODO: Make API call to archive
        console.log('Archiving:', result.title);
        break;

      case 'Share':
        // Open share dialog
        navigate(`${result.url}&share=true`);
        onClose();
        break;

      case 'View Analytics':
        // Navigate to analytics for the item
        navigate(`${result.url}&view=analytics`);
        onClose();
        break;

      case 'Export':
        // Trigger export action
        console.log('Exporting:', result.title);
        // TODO: Implement export functionality
        break;

      case 'Schedule':
        // Open scheduling dialog
        navigate(`${result.url}&schedule=true`);
        onClose();
        break;

      case 'Open Settings':
        // Navigate directly to settings
        handleSelectResult(result);
        break;

      case 'Add to Calendar':
        // Open calendar with event pre-filled
        navigate(`/calendar?add=${result.id}`);
        onClose();
        break;

      case 'Edit Event':
        // Navigate to calendar event editor
        navigate(`${result.url}&edit=true`);
        onClose();
        break;

      case 'Ask AI':
        // Navigate to AI chat with context about this item
        navigate(`/ai-assistant?context=${result.category}&id=${result.id}&query=${encodeURIComponent(result.title)}`);
        onClose();
        break;

      case 'Get Insights':
        // Navigate to AI insights for this item
        navigate(`/ai-assistant?insights=${result.category}&id=${result.id}`);
        onClose();
        break;

      default:
        console.log('Action not implemented:', action);
    }
  }, [handleSelectResult, navigate, onClose]);

  // Scroll selected item into view (optimized)
  useEffect(() => {
    if (resultsRef.current && results.length > 0 && selectedIndex >= 0) {
      const container = resultsRef.current;
      const selectedElement = container.children[0]?.children[selectedIndex];

      if (selectedElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();

        if (elementRect.bottom > containerRect.bottom) {
          selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else if (elementRect.top < containerRect.top) {
          selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }, [selectedIndex, results]);

  // Group results by category (memoized)
  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      const category = result.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(result);
      return acc;
    }, {});
  }, [results]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4"
        onClick={onClose}
      >
        {/* Premium Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-[#7b1c14]/15 to-black/85 backdrop-blur-xl" />

        {/* Ambient Glow Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-[#7b1c14]/20 rounded-full blur-[120px]"
          />
        </div>

        {/* Search Modal - Ultra Smooth */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 29, 36, 0.97) 0%, rgba(13, 15, 18, 0.99) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(123, 28, 20, 0.3)',
            boxShadow: '0 0 60px rgba(123, 28, 20, 0.25), 0 25px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Glassmorphic overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />

          {/* Premium gradient accent */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#7b1c14] to-transparent" />

          {/* Header */}
          <div className="relative">
            <div className="flex items-center gap-4 p-5 border-b border-white/10" style={{ backdropFilter: 'blur(20px)' }}>
              <motion.div
                className="relative"
                animate={loading ? { rotate: 360 } : {}}
                transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
              >
                <Search className={`h-6 w-6 transition-colors duration-200 ${loading ? 'text-[#7b1c14]/60' : 'text-[#7b1c14]'}`} />
                {!loading && <div className="absolute inset-0 bg-[#7b1c14]/20 blur-xl" />}
              </motion.div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search anything... (leads, contacts, pages, AI help)"
                className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-gray-400 font-light"
                style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.1)' }}
              />
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setCategories({});
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all duration-150 group"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Results - Ultra Smooth */}
          <div
            ref={resultsRef}
            className="max-h-[65vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, rgba(13, 15, 18, 0.8) 0%, rgba(10, 12, 15, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(123, 28, 20, 0.6);
                border-radius: 3px;
                transition: background 0.2s;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(123, 28, 20, 0.8);
              }
            `}</style>

            {/* Empty States */}
            <AnimatePresence mode="wait">
              {results.length === 0 && !loading && query.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-16 px-6 text-center"
                >
                  <div className="relative mb-6">
                    <div className="rounded-full bg-gradient-to-br from-[#7b1c14]/30 to-[#7b1c14]/10 p-6 backdrop-blur-xl border border-[#7b1c14]/30">
                      <Search className="h-12 w-12 text-[#7b1c14]" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-[#7b1c14]/20 blur-2xl rounded-full"
                    />
                  </div>
                  <p className="text-white text-xl font-light mb-2">No results found</p>
                  <p className="text-gray-400 text-sm mb-4">Try different keywords or ask our AI assistant</p>

                  {/* Press Enter to Ask AI hint */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/30 backdrop-blur-sm"
                  >
                    <Bot className="h-4 w-4 text-fuchsia-400" />
                    <span className="text-sm text-gray-300">
                      Press <kbd className="px-2 py-0.5 mx-1 rounded bg-white/10 text-xs font-mono border border-white/20">Enter</kbd> to ask AI
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {results.length === 0 && !loading && query.length < 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-16 px-6 text-center"
                >
                  <div className="relative mb-6">
                    <div className="rounded-full bg-gradient-to-br from-[#7b1c14]/30 to-[#7b1c14]/10 p-6 backdrop-blur-xl border border-[#7b1c14]/30">
                      <Sparkles className="h-12 w-12 text-[#7b1c14]" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-[#7b1c14]/20 blur-2xl rounded-full"
                    />
                  </div>
                  <p className="text-white text-xl font-light mb-3">Search anything in your CRM</p>
                  <p className="text-gray-400 text-sm mb-8 max-w-md">
                    Leads, contacts, campaigns, workflows, calendar events, notes, pages, and more
                  </p>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {Object.entries(categoryConfig).slice(0, 9).map(([key, { label, color, glow }]) => (
                      <motion.span
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * Object.keys(categoryConfig).indexOf(key) }}
                        className={`px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r ${color} text-white backdrop-blur-sm ${glow} cursor-default`}
                        style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                      >
                        {label}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Response */}
            <AnimatePresence mode="wait">
              {aiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-16 px-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <Bot className="h-12 w-12 text-fuchsia-500" />
                  </motion.div>
                  <p className="text-white text-lg font-light">AI is thinking...</p>
                </motion.div>
              )}

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6"
                >
                  {/* AI Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-600/30 to-purple-600/30 border border-fuchsia-500/30">
                      <Bot className="h-6 w-6 text-fuchsia-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
                      <p className="text-gray-400 text-sm">Here's what I found</p>
                    </div>
                  </div>

                  {/* AI Message */}
                  <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-xl p-6 mb-4 border border-white/10">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {aiResponse.response?.message}
                    </p>
                  </div>

                  {/* Suggested Actions */}
                  {aiResponse.response?.actions && aiResponse.response.actions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-3">Suggested actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.response.actions.map((action, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 hover:from-fuchsia-600/30 hover:to-purple-600/30 border border-fuchsia-500/30 text-white text-sm transition-all"
                          >
                            {action}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Suggestions */}
                  {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-3">You might also ask:</p>
                      <div className="space-y-2">
                        {aiResponse.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setQuery(suggestion);
                              queryAI(suggestion);
                            }}
                            className="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-fuchsia-500/30 text-gray-300 text-sm transition-all"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Back to search hint */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-xs">
                      Press <kbd className="px-2 py-0.5 mx-1 rounded bg-white/10 text-xs font-mono border border-white/20">Esc</kbd> to go back to search
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results by Category */}
            <AnimatePresence mode="wait">
              {Object.entries(groupedResults).map(([category, items], catIndex) => {
                const config = categoryConfig[category] || categoryConfig.navigation;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: catIndex * 0.05 }}
                    className="py-3"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-3 px-5 py-3 mb-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`p-2 rounded-xl bg-gradient-to-br ${config.color} ${config.glow} backdrop-blur-sm`}
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </motion.div>
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
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.2 }}
                          className="relative group"
                        >
                          <button
                            onClick={() => handleSelectResult(result)}
                            className={`w-full flex items-start gap-4 px-5 py-4 transition-all duration-150 ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#7b1c14]/20 to-transparent border-l-2 border-[#7b1c14]'
                                : 'hover:bg-white/5 border-l-2 border-transparent'
                            }`}
                            style={isSelected ? { backdropFilter: 'blur(10px)' } : {}}
                          >
                            {/* Icon */}
                            <motion.div
                              whileHover={{ scale: 1.05, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                              className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-150 ${
                                isSelected
                                  ? `bg-gradient-to-br ${config.color} ${config.glow}`
                                  : 'bg-white/5 group-hover:bg-white/10'
                              }`}
                              style={isSelected ? { border: '1px solid rgba(255, 255, 255, 0.2)' } : {}}
                            >
                              <ResultIcon
                                className={`h-5 w-5 transition-colors duration-150 ${
                                  isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                }`}
                              />
                            </motion.div>

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
                              className={`h-5 w-5 flex-shrink-0 transition-all duration-150 ${
                                isSelected
                                  ? 'text-[#7b1c14] translate-x-1'
                                  : 'text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1'
                              }`}
                            />
                          </button>

                          {/* Quick Actions - Show on hover */}
                          {config.actions && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={isSelected ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
                              className="absolute right-5 top-full mt-1 flex gap-1 z-10"
                            >
                              {config.actions.slice(0, 3).map((action) => (
                                <motion.button
                                  key={action}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAction(result, action);
                                  }}
                                  className="px-3 py-1 text-xs bg-white/10 hover:bg-[#7b1c14]/30 text-white rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
                                >
                                  {action}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
                  {Object.keys(categories).length} categor{Object.keys(categories).length !== 1 ? 'ies' : 'y'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Bottom Glow */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7b1c14]/50 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
