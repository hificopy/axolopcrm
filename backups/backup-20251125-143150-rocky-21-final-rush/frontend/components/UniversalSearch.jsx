import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { searchApi } from "../lib/api";

// Enhanced search result item component
const SearchResultItem = ({ item, onSelect, query }) => {
  const getIcon = (type, category) => {
    const IconComponent = getEntityIcon(type, category);
    const colorClass =
      {
        leads: "text-blue-600",
        contacts: "text-green-600",
        forms: "text-purple-600",
        calendar_events: "text-orange-600",
        email_campaigns: "text-red-600",
        workflows: "text-indigo-600",
        opportunities: "text-yellow-600",
        activities: "text-teal-600",
        companies: "text-cyan-600",
        deals: "text-emerald-600",
        tasks: "text-lime-600",
        inbox: "text-rose-600",
        call_logs: "text-violet-600",
        conversations: "text-fuchsia-600",
        form_submissions: "text-pink-600",
        email_templates: "text-sky-600",
        workflow_templates: "text-slate-600",
        workflow_executions: "text-zinc-600",
        automation_triggers: "text-stone-600",
        nodes: "text-amber-600",
        maps: "text-orange-600",
        notes: "text-yellow-600",
        folders: "text-lime-600",
        saved_reports: "text-emerald-600",
        custom_fields: "text-teal-600",
        tags: "text-cyan-600",
        products: "text-indigo-600",
        quotes: "text-green-600",
        team_members: "text-blue-600",
        pipeline_stages: "text-purple-600",
        documents: "text-gray-600",
        navigation: "text-slate-600",
      }[type] || "text-gray-600";

    return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
  };

  const getTypeLabel = (type, category) => {
    return getEntityLabel(type, category);
  };

  const getStatusBadge = (item) => {
    if (!item.status) return null;

    return (
      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
        {item.status}
      </Badge>
    );
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  const getSubtitle = (item) => {
    // Handle different subtitle patterns based on entity type
    switch (item.type) {
      // Core CRM
      case "leads":
      case "contacts":
        return item.email || item.phone || "";
      case "opportunities":
        return item.value ? `$${item.value}` : item.company || "";
      case "activities":
        return item.type
          ? `${item.type} • ${item.date || ""}`
          : item.date || "";
      case "companies":
        return item.industry || item.website || "";
      case "deals":
        return item.value ? `$${item.value}` : item.stage || "";
      case "tasks":
        return item.due_date || item.assignee || "";

      // Communication
      case "email_campaigns":
        return item.status
          ? `${item.status} • ${item.sent || 0} sent`
          : `${item.sent || 0} sent`;
      case "inbox":
        return item.from || item.subject || "";
      case "call_logs":
        return item.duration
          ? `${item.duration} • ${item.date || ""}`
          : item.date || "";
      case "conversations":
        return item.participant || item.last_message || "";

      // Marketing & Forms
      case "forms":
        return item.responses
          ? `${item.responses} responses`
          : item.status || "No responses";
      case "form_submissions":
        return item.submitted_at || item.email || "";
      case "email_templates":
        return item.category || item.subject || "";

      // Workflows & Automation
      case "workflows":
        return item.status
          ? `${item.status} • ${item.executions || 0} runs`
          : `${item.executions || 0} runs`;
      case "workflow_templates":
        return item.category || item.description || "";
      case "workflow_executions":
        return item.status || item.started_at || "";
      case "automation_triggers":
        return item.event_type || item.description || "";

      // Second Brain (Knowledge Management)
      case "nodes":
      case "notes":
        return item.folder || item.created_at || "";
      case "maps":
        return item.nodes ? `${item.nodes} nodes` : item.created_at || "";
      case "folders":
        return item.items ? `${item.items} items` : item.created_at || "";

      // Calendar & Events
      case "calendar_events":
        return item.date && item.time
          ? `${item.date} at ${item.time}`
          : item.date || item.time || "";
      case "important_dates":
        return item.date || item.description || "";
      case "recurring_events":
        return item.frequency || item.next_date || "";

      // Reports & Analytics
      case "saved_reports":
        return item.type || item.created_at || "";

      // Settings & Configuration
      case "custom_fields":
        return item.entity_type || item.field_type || "";
      case "tags":
        return item.usage_count ? `${item.usage_count} uses` : item.color || "";

      // Extended Entities
      case "products":
        return item.price ? `$${item.price}` : item.category || "";
      case "quotes":
        return item.total ? `$${item.total}` : item.status || "";
      case "team_members":
        return item.role || item.email || "";
      case "pipeline_stages":
        return item.deals_count
          ? `${item.deals_count} deals`
          : item.probability || "";
      case "documents":
        return item.file_type || item.size || "";

      // Navigation
      case "navigation":
        return item.description || item.path || "";

      default:
        return item.description || item.subtitle || "";
    }
  };

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(item.type, item.category)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {highlightText(
                item.name || item.title || item.label || "",
                query,
              )}
            </span>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(item.type, item.category)}
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Search result cache for better UX
  const searchCache = useRef(new Map());

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("axolop-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
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
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const allResults = getAllResults();
            return prev < allResults.length - 1 ? prev + 1 : prev;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            const allResults = getAllResults();
            const selectedItem = allResults[selectedIndex];
            if (selectedItem) {
              handleSelectItem(selectedItem);
            }
          } else if (query.trim()) {
            handleSearch(query);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Get all results for navigation - dynamically handle all categories
  const getAllResults = () => {
    const allResults = [];

    // Process all result categories dynamically
    Object.keys(results).forEach((category) => {
      const items = results[category];
      if (Array.isArray(items)) {
        allResults.push(
          ...items.map((item) => ({
            ...item,
            category: category, // Keep track of original category
          })),
        );
      }
    });

    return allResults;
  };

  // Perform search using real API with caching
  const handleSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || !searchQuery.trim()) {
        setResults({});
        return;
      }

      const trimmedQuery = searchQuery.trim();

      // Check cache first for instant results
      const cacheKey = `${trimmedQuery}_${8}`; // Include limit in cache key
      if (searchCache.current.has(cacheKey)) {
        const cachedResults = searchCache.current.get(cacheKey);
        setResults(cachedResults);
        return;
      }

      setLoading(true);
      try {
        // Use comprehensive search API
        const response = await searchApi.search(trimmedQuery, {
          limit: 8, // Limit results per category for better UX
        });

        if (response.data?.success) {
          const searchResults = response.data.data || {};

          // Transform results to match expected format
          const transformedResults = {};

          // Process each category and ensure proper structure
          Object.keys(searchResults).forEach((category) => {
            const items = searchResults[category];
            if (Array.isArray(items) && items.length > 0) {
              // Ensure each item has required fields
              transformedResults[category] = items.map((item) => ({
                ...item,
                type: category, // Ensure type is set for display
                name: item.name || item.title || item.label || "",
                title: item.title || item.name || item.label || "",
              }));
            }
          });

          // Cache the results for future use (cache for 5 minutes)
          searchCache.current.set(cacheKey, transformedResults);
          setTimeout(
            () => {
              searchCache.current.delete(cacheKey);
            },
            5 * 60 * 1000,
          ); // Clear cache after 5 minutes

          setResults(transformedResults);

          // Save to recent searches using functional update to avoid stale closure
          setRecentSearches((prevSearches) => {
            const newRecentSearches = [
              trimmedQuery,
              ...prevSearches.filter((s) => s !== trimmedQuery),
            ].slice(0, 5);
            localStorage.setItem(
              "axolop-recent-searches",
              JSON.stringify(newRecentSearches),
            );
            return newRecentSearches;
          });
        } else {
          // Handle API error response
          throw new Error(response.data?.message || "Search failed");
        }
      } catch (error) {
        console.error("Search error:", error);
        toast({
          title: "Search Error",
          description:
            error.response?.data?.error ||
            error.message ||
            "Failed to perform search. Please try again.",
          variant: "destructive",
        });
        // Clear results on error
        setResults({});
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Handle item selection with comprehensive navigation
  const handleSelectItem = (item) => {
    const entityType = item.type || item.category;

    // Navigate to appropriate page based on entity type
    switch (entityType) {
      // Core CRM
      case "leads":
        navigate(`/app/leads${item.id ? `/${item.id}` : ""}`);
        break;
      case "contacts":
        navigate(`/app/contacts${item.id ? `/${item.id}` : ""}`);
        break;
      case "opportunities":
        navigate(`/app/opportunities${item.id ? `/${item.id}` : ""}`);
        break;
      case "activities":
        navigate(`/app/activities${item.id ? `/${item.id}` : ""}`);
        break;
      case "companies":
        navigate(`/app/companies${item.id ? `/${item.id}` : ""}`);
        break;
      case "deals":
        navigate(`/app/deals${item.id ? `/${item.id}` : ""}`);
        break;
      case "tasks":
        navigate(`/app/tasks${item.id ? `/${item.id}` : ""}`);
        break;

      // Communication
      case "email_campaigns":
        navigate(`/app/email-campaigns${item.id ? `/${item.id}` : ""}`);
        break;
      case "inbox":
        navigate(`/app/inbox${item.id ? `/${item.id}` : ""}`);
        break;
      case "call_logs":
        navigate(`/app/call-logs${item.id ? `/${item.id}` : ""}`);
        break;
      case "conversations":
        navigate(`/app/conversations${item.id ? `/${item.id}` : ""}`);
        break;

      // Marketing & Forms
      case "forms":
        navigate(`/app/forms/builder${item.id ? `/${item.id}` : ""}`);
        break;
      case "form_submissions":
        navigate(`/app/forms/submissions${item.id ? `/${item.id}` : ""}`);
        break;
      case "email_templates":
        navigate(`/app/email/templates${item.id ? `/${item.id}` : ""}`);
        break;

      // Workflows & Automation
      case "workflows":
        navigate(`/app/workflows${item.id ? `/${item.id}` : ""}`);
        break;
      case "workflow_templates":
        navigate(`/app/workflows/templates${item.id ? `/${item.id}` : ""}`);
        break;
      case "workflow_executions":
        navigate(`/app/workflows/executions${item.id ? `/${item.id}` : ""}`);
        break;
      case "automation_triggers":
        navigate(`/app/workflows/triggers${item.id ? `/${item.id}` : ""}`);
        break;

      // Second Brain (Knowledge Management)
      case "nodes":
      case "notes":
        navigate(`/app/second-brain/notes${item.id ? `/${item.id}` : ""}`);
        break;
      case "maps":
        navigate(`/app/second-brain/maps${item.id ? `/${item.id}` : ""}`);
        break;
      case "folders":
        navigate(`/app/second-brain/folders${item.id ? `/${item.id}` : ""}`);
        break;

      // Calendar & Events
      case "calendar_events":
      case "events":
        navigate(`/app/calendar${item.id ? `/${item.id}` : ""}`);
        break;
      case "important_dates":
        navigate(`/app/calendar/important${item.id ? `/${item.id}` : ""}`);
        break;
      case "recurring_events":
        navigate(`/app/calendar/recurring${item.id ? `/${item.id}` : ""}`);
        break;

      // Reports & Analytics
      case "saved_reports":
        navigate(`/app/reports${item.id ? `/${item.id}` : ""}`);
        break;

      // Settings & Configuration
      case "custom_fields":
        navigate(`/app/settings/custom-fields${item.id ? `/${item.id}` : ""}`);
        break;
      case "tags":
        navigate(`/app/settings/tags${item.id ? `/${item.id}` : ""}`);
        break;

      // Extended Entities
      case "products":
        navigate(`/app/products${item.id ? `/${item.id}` : ""}`);
        break;
      case "quotes":
        navigate(`/app/quotes${item.id ? `/${item.id}` : ""}`);
        break;
      case "team_members":
        navigate(`/app/team${item.id ? `/${item.id}` : ""}`);
        break;
      case "pipeline_stages":
        navigate(`/app/pipeline${item.id ? `/${item.id}` : ""}`);
        break;
      case "documents":
        navigate(`/app/documents${item.id ? `/${item.id}` : ""}`);
        break;

      // Navigation - use the path if available
      case "navigation":
        if (item.path) {
          navigate(item.path);
        } else {
          // Fallback to dashboard for navigation items without path
          navigate("/app/dashboard");
        }
        break;

      default:
        // Fallback - try to navigate based on common patterns
        if (item.id) {
          navigate(`/app/${entityType}/${item.id}`);
        } else {
          navigate(`/app/${entityType}`);
        }
        break;
    }

    onClose();
    setQuery("");
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
    localStorage.removeItem("axolop-recent-searches");
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
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
              placeholder="Search anything in your CRM..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                ⌘K
              </kbd>
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
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-600 font-medium">Searching your CRM...</p>
              <p className="text-gray-400 text-sm mt-1">
                Checking leads, contacts, forms, and more
              </p>
            </div>
          )}

          {!loading && !query && recentSearches.length > 0 && (
            <RecentSearches
              searches={recentSearches}
              onSelect={handleRecentSearch}
              onClear={clearRecentSearches}
            />
          )}

          {!loading && !query && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <div className="relative mb-4">
                <Search className="h-12 w-12 text-gray-300 mx-auto" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">?</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start searching
              </h3>
              <p className="text-gray-600 mb-4">
                Search for leads, contacts, forms, campaigns, and more
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Try searching for:</p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {["Leads", "Contacts", "Forms", "Campaigns", "Meetings"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          handleSearch(term);
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                      >
                        {term}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="p-8 text-center">
              <div className="relative mb-4">
                <Search className="h-12 w-12 text-gray-300 mx-auto" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <X className="h-2 w-2 text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-4">
                No results for "<span className="font-medium">{query}</span>"
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Suggestions:</p>
                <ul className="text-left space-y-1">
                  <li>• Check spelling and try different keywords</li>
                  <li>• Use more general terms</li>
                  <li>• Try searching by email, phone, or company name</li>
                </ul>
              </div>
            </div>
          )}

          {!loading && hasResults && (
            <div>
              {/* Dynamic Results Rendering */}
              {Object.keys(results).map((category) => {
                const items = results[category];
                if (!Array.isArray(items) || items.length === 0) return null;

                const IconComponent = getEntityIcon(category);
                const categoryLabel = getEntityLabel(category);

                return (
                  <div key={category}>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {categoryLabel} ({items.length})
                      </h3>
                    </div>
                    {items.map((item, index) => (
                      <SearchResultItem
                        key={`${category}-${item.id || index}`}
                        item={item}
                        query={query}
                        onSelect={handleSelectItem}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
              ↑
            </kbd>{" "}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
              ↓
            </kbd>{" "}
            to navigate,{" "}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
              Enter
            </kbd>{" "}
            to select,{" "}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
              Esc
            </kbd>{" "}
            to close
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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    openSearch,
    closeSearch,
  };
};

export default UniversalSearch;
