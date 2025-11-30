import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Clock,
  ArrowRight,
  X,
  Zap,
  Plus,
  Navigation,
  Settings,
  HelpCircle,
  Command,
  Users,
  Building2,
  FileText,
  Calendar,
  Mail,
  Target,
  CheckCircle,
  BarChart3,
  Layout,
  User,
  CreditCard,
  Moon,
  Download,
  Upload,
  Activity,
  Play,
  Code,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { searchApi } from "../lib/api";
import {
  processSearchResults,
  validateSearchResult,
} from "../utils/searchResultProcessor.js";
import { useAgency } from "../context/AgencyContext";
import { localStorageGetJSON, localStorageSetJSON, localStorageRemove } from "../utils/safeStorage";

// ============================================
// COMMAND PALETTE COMPONENTS
// ============================================

// Quick Action Item Component
const QuickActionItem = ({ item, query, onSelect, isHighlighted = false }) => {
  const getIcon = (iconName) => {
    const iconMap = {
      Users: Users,
      Building2: Building2,
      FileText: FileText,
      Calendar: Calendar,
      Mail: Mail,
      Target: Target,
      CheckCircle: CheckCircle,
      BarChart3: BarChart3,
      Layout: Layout,
      User: User,
      CreditCard: CreditCard,
      Moon: Moon,
      Download: Download,
      Upload: Upload,
      Activity: Activity,
      Play: Play,
      Code: Code,
      Zap: Zap,
      Navigation: Navigation,
      Settings: Settings,
      HelpCircle: HelpCircle,
      Command: Command,
      Plus: Plus,
    };
    return iconMap[iconName] || Search;
  };

  const IconComponent = getIcon(item.icon);

  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full text-left p-3 transition-all border-b border-gray-100 last:border-b-0 group ${
        isHighlighted ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent
            className={`h-4 w-4 ${
              item.action_type === "create"
                ? "text-green-600"
                : item.action_type === "navigate"
                  ? "text-blue-600"
                  : item.action_type === "settings"
                    ? "text-purple-600"
                    : item.action_type === "help"
                      ? "text-orange-600"
                      : item.action_type === "system"
                        ? "text-gray-600"
                        : "text-gray-600"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {highlightText(item.title, query)}
            </span>
            <Badge
              className={`text-xs ${
                item.action_type === "create"
                  ? "bg-green-100 text-green-700"
                  : item.action_type === "navigate"
                    ? "bg-blue-100 text-blue-700"
                    : item.action_type === "settings"
                      ? "bg-purple-100 text-purple-700"
                      : item.action_type === "help"
                        ? "bg-orange-100 text-orange-700"
                        : item.action_type === "system"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.action_type === "create"
                ? "Create"
                : item.action_type === "navigate"
                  ? "Go to"
                  : item.action_type === "settings"
                    ? "Settings"
                    : item.action_type === "help"
                      ? "Help"
                      : item.action_type === "system"
                        ? "System"
                        : "Action"}
            </Badge>
          </div>

          {item.description && (
            <div className="text-sm text-gray-500 truncate">
              {highlightText(item.description, query)}
            </div>
          )}

          {item.keyboard_shortcut && (
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>
                {item.keyboard_shortcut
                  .replace("cmd", "⌘")
                  .replace("shift", "⇧")}
              </span>
            </div>
          )}
        </div>

        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5" />
      </div>
    </button>
  );
};

// Command Input Component
const CommandInput = ({
  query,
  onChange,
  onKeyDown,
  placeholder,
  commandMode = false,
  inputRef,
}) => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="relative">
        <Search className="h-5 w-5 text-gray-400" />
        {commandMode && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{">"}</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`flex-1 text-lg outline-none placeholder-gray-400 ${
          commandMode ? "text-green-600" : ""
        }`}
        autoFocus
      />
      <div className="flex items-center gap-2">
        {commandMode && (
          <Badge className="text-xs bg-green-100 text-green-700">
            Command Mode
          </Badge>
        )}
        <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
          ⌘K
        </kbd>
        <button
          onClick={() => onChange("")}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

// Recent Commands Component
const RecentCommands = ({ commands, onSelect, onClear }) => {
  if (commands.length === 0) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Commands
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {commands.map((cmd, index) => (
          <button
            key={index}
            onClick={() => onSelect(cmd)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
          >
            <Command className="h-3 w-3" />
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

// Text highlighting utility
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

// ============================================
// MAIN COMMAND PALETTE COMPONENT
// ============================================

export const UniversalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentCommands, setRecentCommands] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [commandMode, setCommandMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const inputRef = useRef(null);
  const searchCache = useRef(new Map());

  const navigate = useNavigate();
  const { toast } = useToast();

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorageGetJSON("axolop_recent_commands", []);
    if (saved.length > 0) {
      setRecentCommands(saved);
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

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Command mode detection
      if (e.key === ">" && !commandMode && query === "") {
        e.preventDefault();
        setCommandMode(true);
        return;
      }

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
          if (commandMode) {
            setCommandMode(false);
            setQuery("");
          } else {
            onClose();
          }
          break;
        case "Backspace":
          if (commandMode && query === "") {
            e.preventDefault();
            setCommandMode(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query, commandMode]);

  // Get all results for navigation
  const getAllResults = () => {
    const allResults = [];

    // Process all result categories dynamically
    Object.keys(results).forEach((category) => {
      const items = results[category];
      if (Array.isArray(items)) {
        allResults.push(
          ...items.map((item) => ({
            ...item,
            category: category,
          })),
        );
      }
    });

    return allResults;
  };

  // Enhanced search with command palette support
  const handleSearch = useCallback(
    async (searchQuery) => {
      const trimmedQuery = searchQuery.trim();

      // Check for commands
      if (trimmedQuery.startsWith(">")) {
        const command = trimmedQuery.substring(1);
        return handleCommand(command);
      }

      // Normal search
      setCommandMode(false);

      if (!trimmedQuery) {
        setResults({});
        setShowQuickActions(true);
        return;
      }

      // Check cache first
      const cacheKey = `${trimmedQuery}_8`;
      if (searchCache.current.has(cacheKey)) {
        const cachedResults = searchCache.current.get(cacheKey);
        setResults(cachedResults);
        setShowQuickActions(false);
        return;
      }

      setLoading(true);
      setShowQuickActions(false);

      try {
        const response = await searchApi.search(trimmedQuery, {
          limit: 8,
        });

        if (response.data?.success) {
          const rawResults = response.data.data || {};

          // Get user tier for filtering
          const { getCurrentTier } = useAgency();
          const userTier = getCurrentTier();

          // Process results with deduplication, filtering, and enhancement
          const processedResults = processSearchResults(rawResults, {
            userTier,
            query: trimmedQuery,
            limit: 50,
          });

          // Cache results
          searchCache.current.set(cacheKey, processedResults);
          setTimeout(
            () => {
              searchCache.current.delete(cacheKey);
            },
            5 * 60 * 1000,
          );

          setResults(processedResults);
        } else {
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
        setResults({});
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Command handler
  const handleCommand = useCallback(
    async (command) => {
      const parts = command.split(" ");
      const action = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      // Log command execution
      try {
        const startTime = Date.now();

        switch (action) {
          case "create":
            return handleCreateCommand(args);
          case "navigate":
          case "go":
            return handleNavigateCommand(args);
          case "settings":
            return handleSettingsCommand(args);
          case "help":
            return handleHelpCommand(args);
          case "toggle":
            return handleToggleCommand(args);
          case "export":
            return handleExportCommand(args);
          case "import":
            return handleImportCommand(args);
          default:
            toast({
              title: "Unknown Command",
              description: `Command "${action}" not recognized. Try: create, navigate, settings, help, toggle, export, import`,
              variant: "destructive",
            });
            return;
        }
      } finally {
        // Save to recent commands
        setRecentCommands((prev) => {
          const newCommands = [
            `>${command}`,
            ...prev.filter((cmd) => cmd !== `>${command}`),
          ].slice(0, 10);
          localStorageSetJSON("axolop_recent_commands", newCommands);
          return newCommands;
        });
      }
    },
    [toast],
  );

  // Create command handler
  const handleCreateCommand = useCallback(
    (entityType) => {
      const entityMap = {
        lead: () => navigate("/app/leads/new"),
        leads: () => navigate("/app/leads/new"),
        contact: () => navigate("/app/contacts/new"),
        contacts: () => navigate("/app/contacts/new"),
        form: () => navigate("/app/forms/builder/new"),
        forms: () => navigate("/app/forms/builder/new"),
        campaign: () => navigate("/app/email-campaigns/new"),
        campaigns: () => navigate("/app/email-campaigns/new"),
        meeting: () => navigate("/app/calendar/new"),
        meetings: () => navigate("/app/calendar/new"),
        deal: () => navigate("/app/deals/new"),
        deals: () => navigate("/app/deals/new"),
        task: () => navigate("/app/tasks/new"),
        tasks: () => navigate("/app/tasks/new"),
        note: () => navigate("/app/second-brain/notes/new"),
        notes: () => navigate("/app/second-brain/notes/new"),
        workflow: () => navigate("/app/workflows/new"),
        workflows: () => navigate("/app/workflows/new"),
        opportunity: () => navigate("/app/opportunities/new"),
        opportunities: () => navigate("/app/opportunities/new"),
      };

      const createFn = entityMap[entityType.toLowerCase()];
      if (createFn) {
        createFn();
        toast({
          title: `Creating New ${entityType}`,
          description: `Opening ${entityType} creation form...`,
        });
        onClose();
      } else {
        toast({
          title: "Unknown Entity",
          description: `Cannot create "${entityType}". Try: lead, contact, form, campaign, meeting, deal, task, note, workflow, opportunity`,
          variant: "destructive",
        });
      }
    },
    [navigate, toast, onClose],
  );

  // Navigate command handler
  const handleNavigateCommand = useCallback(
    (destination) => {
      const routeMap = {
        dashboard: "/app/dashboard",
        home: "/app/dashboard",
        leads: "/app/leads",
        contacts: "/app/contacts",
        forms: "/app/forms",
        campaigns: "/app/email-campaigns",
        calendar: "/app/calendar",
        workflows: "/app/workflows",
        reports: "/app/reports",
        settings: "/app/settings",
        help: "/app/help",
        profile: "/app/profile",
        team: "/app/team",
        billing: "/app/billing",
        integrations: "/app/integrations",
      };

      const route = routeMap[destination.toLowerCase()];
      if (route) {
        navigate(route);
        onClose();
      } else {
        toast({
          title: "Unknown Destination",
          description: `Cannot navigate to "${destination}". Try: dashboard, leads, contacts, forms, campaigns, calendar, workflows, reports, settings, help`,
          variant: "destructive",
        });
      }
    },
    [navigate, toast, onClose],
  );

  // Settings command handler
  const handleSettingsCommand = useCallback(
    (setting) => {
      const settingsMap = {
        profile: "/app/profile",
        user: "/app/profile",
        agency: "/app/agency/settings",
        team: "/app/team",
        security: "/app/settings/security",
        notifications: "/app/settings/notifications",
        integrations: "/app/integrations",
        billing: "/app/billing",
        plans: "/app/billing",
      };

      const route = settingsMap[setting.toLowerCase()];
      if (route) {
        navigate(route);
        onClose();
      } else {
        toast({
          title: "Unknown Setting",
          description: `Cannot open "${setting}" settings. Try: profile, agency, team, security, notifications, integrations, billing`,
          variant: "destructive",
        });
      }
    },
    [navigate, toast, onClose],
  );

  // Help command handler
  const handleHelpCommand = useCallback(
    (topic) => {
      const helpMap = {
        shortcuts: "/app/shortcuts",
        commands: "/app/help/commands",
        search: "/app/help/search",
        api: "/app/docs/api",
        tutorials: "/app/tutorials",
        videos: "/app/tutorials",
        docs: "/app/docs",
      };

      const route = helpMap[topic.toLowerCase()];
      if (route) {
        navigate(route);
        onClose();
      } else {
        toast({
          title: "Unknown Help Topic",
          description: `Cannot find help for "${topic}". Try: shortcuts, commands, search, api, tutorials, videos, docs`,
          variant: "destructive",
        });
      }
    },
    [navigate, toast, onClose],
  );

  // Toggle command handler
  const handleToggleCommand = useCallback(
    (feature) => {
      const toggleMap = {
        dark: () => {
          document.documentElement.classList.toggle("dark");
          toast({
            title: "Theme Toggled",
            description:
              "Switched to " +
              (document.documentElement.classList.contains("dark")
                ? "dark"
                : "light") +
              " mode",
          });
        },
        sidebar: () => {
          // This would need to be implemented in the layout
          toast({
            title: "Sidebar Toggled",
            description: "Sidebar visibility toggled",
          });
        },
      };

      const toggleFn = toggleMap[feature.toLowerCase()];
      if (toggleFn) {
        toggleFn();
        onClose();
      } else {
        toast({
          title: "Unknown Feature",
          description: `Cannot toggle "${feature}". Try: dark, sidebar`,
          variant: "destructive",
        });
      }
    },
    [toast, onClose],
  );

  // Export command handler
  const handleExportCommand = useCallback(
    (dataType) => {
      toast({
        title: "Export Started",
        description: `Exporting ${dataType || "data"}...`,
      });
      // This would trigger export functionality
      onClose();
    },
    [toast, onClose],
  );

  // Import command handler
  const handleImportCommand = useCallback(
    (dataType) => {
      toast({
        title: "Import Started",
        description: `Importing ${dataType || "data"}...`,
      });
      // This would trigger import functionality
      onClose();
    },
    [toast, onClose],
  );

  // Handle item selection
  const handleSelectItem = useCallback(
    (item) => {
      // Validate search result before navigation
      const validation = validateSearchResult(item);
      if (!validation.valid) {
        console.error("Invalid search result:", validation.errors);
        toast({
          title: "Navigation Error",
          description: "This search result is invalid and cannot be opened.",
          variant: "destructive",
        });
        return;
      }

      // Handle quick actions differently
      if (item.action_type) {
        if (item.action_type === "navigate" && item.target_route) {
          navigate(item.target_route);
        } else if (item.action_type === "create" && item.target_route) {
          navigate(item.target_route);
        } else if (item.action_type === "toggle") {
          // Handle toggle actions
          if (item.title.includes("Dark Mode")) {
            document.documentElement.classList.toggle("dark");
          }
        } else if (item.action_type === "export") {
          handleExportCommand("");
        } else if (item.action_type === "import") {
          handleImportCommand("");
        }
      } else {
        // Normal entity navigation - use the URL from search result
        if (item.url) {
          navigate(item.url, {
            state: {
              fromSearch: true,
              searchQuery: item.searchQuery,
              entityType: item.category,
              entityId: item.id,
              entityData: item,
            },
          });
        } else {
          console.error("No URL available for search result:", item);
          toast({
            title: "Navigation Error",
            description: "This item cannot be opened.",
            variant: "destructive",
          });
        }
      }

      onClose();
      setQuery("");
      setResults({});
    },
    [navigate, onClose, toast],
  );

  // Clear recent commands
  const clearRecentCommands = () => {
    setRecentCommands([]);
    localStorageRemove("axolop_recent_commands");
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults({});
        setShowQuickActions(true);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  const allResults = getAllResults();
  const hasResults = Object.keys(results).length > 0 && allResults.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Command Header */}
        <CommandInput
          query={query}
          onChange={setQuery}
          onKeyDown={() => {}}
          placeholder={
            commandMode
              ? "Enter command..."
              : "Search anything or type > for commands..."
          }
          commandMode={commandMode}
          inputRef={inputRef}
        />

        {/* Content Area */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-600 font-medium">
                {commandMode ? "Executing command..." : "Searching your CRM..."}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {commandMode
                  ? "Processing your request..."
                  : "Checking all entities and actions..."}
              </p>
            </div>
          )}

          {!loading && !query && recentCommands.length > 0 && (
            <RecentCommands
              commands={recentCommands}
              onSelect={(cmd) => {
                setQuery(cmd);
                handleSearch(cmd);
              }}
              onClear={clearRecentCommands}
            />
          )}

          {!loading &&
            !query &&
            recentCommands.length === 0 &&
            showQuickActions && (
              <div className="p-8 text-center">
                <div className="relative mb-4">
                  <Zap className="h-12 w-12 text-blue-500 mx-auto" />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Command Palette Active
                </h3>
                <p className="text-gray-600 mb-4">
                  Type to search or use commands with {">"}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Try these commands:</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {[
                      ">create lead",
                      ">navigate dashboard",
                      ">settings profile",
                      ">help shortcuts",
                    ].map((cmd) => (
                      <button
                        key={cmd}
                        onClick={() => {
                          setQuery(cmd);
                          handleSearch(cmd);
                        }}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700 transition-colors font-mono text-xs"
                      >
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {!loading && query && !hasResults && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-4">
                No results for "<span className="font-medium">{query}</span>"
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Suggestions:</p>
                <ul className="text-left space-y-1">
                  <li>• Try different keywords</li>
                  <li>• Use commands with {">"} prefix</li>
                  <li>• Check spelling</li>
                  <li>• Try searching by entity type</li>
                </ul>
              </div>
            </div>
          )}

          {!loading && hasResults && (
            <div>
              {/* Quick Actions Section */}
              {results.quick_actions && results.quick_actions.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </h3>
                  </div>
                  {results.quick_actions.map((item, index) => (
                    <QuickActionItem
                      key={item.id}
                      item={item}
                      query={query}
                      onSelect={handleSelectItem}
                      isHighlighted={selectedIndex === index}
                    />
                  ))}
                </div>
              )}

              {/* All other sections */}
              {Object.keys(results)
                .filter((category) => category !== "quick_actions")
                .map((category) => {
                  const items = results[category];
                  if (!Array.isArray(items) || items.length === 0) return null;

                  const getSectionIcon = (cat) => {
                    const iconMap = {
                      leads: Users,
                      contacts: Building2,
                      forms: FileText,
                      calendar_events: Calendar,
                      email_campaigns: Mail,
                      opportunities: Target,
                      activities: CheckCircle,
                      workflows: Zap,
                      help_articles: HelpCircle,
                      user_preferences: Settings,
                      app_settings: Settings,
                      audit_logs: Activity,
                      notifications: Activity,
                      api_integrations: Zap,
                    };
                    return iconMap[cat] || Search;
                  };

                  const IconComponent = getSectionIcon(category);
                  const categoryLabel = category
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase());

                  return (
                    <div key={category}>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {categoryLabel} ({items.length})
                        </h3>
                      </div>
                      {items.map((item, index) => (
                        <QuickActionItem
                          key={`${category}-${item.id || index}`}
                          item={item}
                          query={query}
                          onSelect={handleSelectItem}
                          isHighlighted={
                            selectedIndex ===
                            getAllResults().findIndex((r) => r === item)
                          }
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
            to close,{" "}
            <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
              {">"}
            </kbd>{" "}
            for commands
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
    setIsOpen,
    openSearch,
    closeSearch,
  };
};

export default UniversalSearch;
