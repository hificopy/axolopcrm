import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Command, Users, FileText, Calendar, TrendingUp, Mail, Phone, Building2, Clock, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useSupabase } from '../context/SupabaseContext';
import { useToast } from './components/ui/use-toast';

// Search service mock - replace with actual API calls
const searchService = {
  async searchLeads(query) {
    // Mock API call - replace with real implementation
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', type: 'lead', status: 'NEW' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'lead', status: 'CONTACTED' },
    ].filter(lead => 
      lead.name.toLowerCase().includes(query.toLowerCase()) ||
      lead.email.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  async searchContacts(query) {
    return [
      { id: 1, name: 'Acme Corp', email: 'contact@acme.com', type: 'contact', phone: '+1-555-0123' },
      { id: 2, name: 'Tech Solutions', email: 'info@techsolutions.com', type: 'contact', phone: '+1-555-0456' },
    ].filter(contact => 
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.email.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  async searchForms(query) {
    return [
      { id: 1, title: 'Contact Form', responses: 45, type: 'form', status: 'active' },
      { id: 2, title: 'Survey 2024', responses: 120, type: 'form', status: 'active' },
    ].filter(form => 
      form.title.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  async searchCalendar(query) {
    return [
      { id: 1, title: 'Sales Meeting', date: '2024-01-15', type: 'event', time: '10:00 AM' },
      { id: 2, title: 'Client Call', date: '2024-01-16', type: 'event', time: '2:00 PM' },
    ].filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Search result item component
const SearchResultItem = ({ item, onSelect, query }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'lead':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'contact':
        return <Building2 className="h-4 w-4 text-green-600" />;
      case 'form':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getTypeLabel = (type) => {
    switch (type) {
      case 'lead':
        return 'Lead';
      case 'contact':
        return 'Contact';
      case 'form':
        return 'Form';
      case 'event':
        return 'Event';
      default:
        return 'Item';
    }
  };
  
  const getStatusBadge = (item) => {
    if (!item.status) return null;
    
    const statusColors = {
      'NEW': 'bg-blue-100 text-blue-700',
      'CONTACTED': 'bg-yellow-100 text-yellow-700',
      'QUALIFIED': 'bg-green-100 text-green-700',
      'CONVERTED': 'bg-purple-100 text-purple-700',
      'LOST': 'bg-red-100 text-red-700',
      'active': 'bg-green-100 text-green-700',
      'inactive': 'bg-gray-100 text-gray-700',
    };
    
    return (
      <Badge className={`text-xs ${statusColors[item.status] || 'bg-gray-100 text-gray-700'}`}>
        {item.status}
      </Badge>
    );
  };
  
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };
  
  const getSubtitle = (item) => {
    switch (item.type) {
      case 'lead':
      case 'contact':
        return item.email;
      case 'form':
        return `${item.responses} responses`;
      case 'event':
        return `${item.date} at ${item.time}`;
      default:
        return '';
    }
  };
  
  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(item.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {highlightText(item.name || item.title, query)}
            </span>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(item.type)}
            </Badge>
            {getStatusBadge(item)}
          </div>
          
          {getSubtitle(item) && (
            <div className="text-sm text-gray-500 truncate">
              {getSubtitle(item)}
            </div>
          )}
        </div>
        
        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5" />
      </div>
    </button>
  );
};

// Recent searches component
const RecentSearches = ({ searches, onSelect, onClear }) => {
  if (searches.length === 0) return null;
  
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear all
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSelect(search)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            <Clock className="h-3 w-3" />
            {search}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main universal search component
export const UniversalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('axolop-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const allResults = getAllResults();
            return prev < allResults.length - 1 ? prev + 1 : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            const allResults = getAllResults();
            const selectedItem = allResults[selectedIndex];
            if (selectedItem) {
              handleSelectItem(selectedItem);
            }
          } else if (query.trim()) {
            handleSearch();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);
  
  // Get all results for navigation
  const getAllResults = () => {
    return [
      ...(results.leads || []),
      ...(results.contacts || []),
      ...(results.forms || []),
      ...(results.events || [])
    ];
  };
  
  // Perform search
  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      setResults({});
      return;
    }
    
    setLoading(true);
    try {
      const [leads, contacts, forms, events] = await Promise.all([
        searchService.searchLeads(searchQuery),
        searchService.searchContacts(searchQuery),
        searchService.searchForms(searchQuery),
        searchService.searchCalendar(searchQuery)
      ]);
      
      setResults({ leads, contacts, forms, events });
      
      // Save to recent searches
      const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('axolop-recent-searches', JSON.stringify(newRecentSearches));
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [query, recentSearches, toast]);
  
  // Handle item selection
  const handleSelectItem = (item) => {
    // Navigate to appropriate page
    switch (item.type) {
      case 'lead':
        navigate(`/app/leads`);
        break;
      case 'contact':
        navigate(`/app/contacts`);
        break;
      case 'form':
        navigate(`/app/forms/builder/${item.id}`);
        break;
      case 'event':
        navigate(`/app/calendar`);
        break;
      default:
        break;
    }
    
    onClose();
    setQuery('');
    setResults({});
  };
  
  // Handle recent search selection
  const handleRecentSearch = (searchQuery) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };
  
  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('axolop-recent-searches');
  };
  
  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults({});
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);
  
  const allResults = getAllResults();
  const hasResults = Object.keys(results).length > 0 && allResults.length > 0;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, contacts, forms, events..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">⌘K</kbd>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Searching...</p>
            </div>
          )}
          
          {!loading && !query && recentSearches.length > 0 && (
            <RecentSearches
              searches={recentSearches}
              onSelect={handleRecentSearch}
              onClear={clearRecentSearches}
            />
          )}
          
          {!loading && query && !hasResults && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                No results for "{query}". Try different keywords or check spelling.
              </p>
            </div>
          )}
          
          {!loading && hasResults && (
            <div>
              {/* Leads Section */}
              {results.leads && results.leads.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Leads ({results.leads.length})
                    </h3>
                  </div>
                  {results.leads.map((item, index) => (
                    <SearchResultItem
                      key={`lead-${item.id}`}
                      item={item}
                      query={query}
                      onSelect={handleSelectItem}
                    />
                  ))}
                </div>
              )}
              
              {/* Contacts Section */}
              {results.contacts && results.contacts.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Contacts ({results.contacts.length})
                    </h3>
                  </div>
                  {results.contacts.map((item, index) => (
                    <SearchResultItem
                      key={`contact-${item.id}`}
                      item={item}
                      query={query}
                      onSelect={handleSelectItem}
                    />
                  ))}
                </div>
              )}
              
              {/* Forms Section */}
              {results.forms && results.forms.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Forms ({results.forms.length})
                    </h3>
                  </div>
                  {results.forms.map((item, index) => (
                    <SearchResultItem
                      key={`form-${item.id}`}
                      item={item}
                      query={query}
                      onSelect={handleSelectItem}
                    />
                  ))}
                </div>
              )}
              
              {/* Events Section */}
              {results.events && results.events.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Events ({results.events.length})
                    </h3>
                  </div>
                  {results.events.map((item, index) => (
                    <SearchResultItem
                      key={`event-${item.id}`}
                      item={item}
                      query={query}
                      onSelect={handleSelectItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">↑</kbd>{' '}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">↓</kbd> to navigate,{' '}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd> to select,{' '}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook for universal search
export const useUniversalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);
  
  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return {
    isOpen,
    openSearch,
    closeSearch
  };
};

export default UniversalSearch;