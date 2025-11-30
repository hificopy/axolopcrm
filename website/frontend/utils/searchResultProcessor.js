/**
 * Search Result Processor
 * Handles deduplication, filtering, and processing of search results
 */

import {
  getSearchResultUrl,
  getCategoryDisplayConfig,
} from "../config/searchUrlMappings.js";
import {
  canAccessSection,
  canAccessFeature,
} from "../utils/subscription-tiers.js";

/**
 * Deduplicate search results
 * @param {Array} results - Raw search results
 * @returns {Array} - Deduplicated results
 */
export function deduplicateResults(results) {
  if (!Array.isArray(results)) return [];

  const seen = new Set();
  const deduplicated = [];

  for (const result of results) {
    // Create unique key based on category and ID, or title if no ID
    const key = result.id
      ? `${result.category}-${result.id}`
      : `${result.category}-${result.title?.toLowerCase()}`;

    if (seen.has(key)) continue;

    seen.add(key);
    deduplicated.push(result);
  }

  return deduplicated;
}

/**
 * Filter results based on user's subscription tier
 * @param {Array} results - Search results
 * @param {string} userTier - User's subscription tier
 * @returns {Array} - Filtered results
 */
export function filterResultsByTier(results, userTier = "sales") {
  if (!Array.isArray(results)) return [];

  return results.filter((result) => {
    const category = result.category;
    const type = result.type;

    // Check section access
    if (!canAccessSection(userTier, category)) {
      // Mark as locked instead of filtering out
      result.locked = true;
      result.lockReason = `This feature requires a higher subscription tier`;
      return true; // Keep but mark as locked
    }

    // Check feature access for specific types
    if (
      type &&
      !canAccessFeature(userTier, type.toLowerCase().replace(/\s+/g, "_"))
    ) {
      result.locked = true;
      result.lockReason = `This feature requires a higher subscription tier`;
      return true; // Keep but mark as locked
    }

    result.locked = false;
    result.lockReason = null;
    return true;
  });
}

/**
 * Process and enhance search results
 * @param {Object|Array} rawResults - Raw search results (object with results array, or array directly)
 * @param {Object} options - Processing options
 * @returns {Array} - Processed results
 */
export function processSearchResults(rawResults, options = {}) {
  const { userTier = "sales", query = "", limit = 50 } = options;

  // Handle both object format { results: [...] } and direct array format
  let results;
  if (Array.isArray(rawResults)) {
    results = rawResults;
  } else if (rawResults && Array.isArray(rawResults.results)) {
    results = rawResults.results;
  } else {
    return [];
  }

  // Step 1: Deduplicate
  let processed = deduplicateResults(results);

  // Step 2: Filter by tier (removed undefined userPermissions parameter)
  processed = filterResultsByTier(processed, userTier);

  // Step 3: Enhance each result
  processed = processed.map((result) => enhanceResult(result, query, userTier));

  // Step 4: Sort by relevance
  processed = sortByRelevance(processed, query);

  // Step 5: Apply limit
  if (limit > 0) {
    processed = processed.slice(0, limit);
  }

  return processed;
}

/**
 * Enhance individual search result
 * @param {Object} result - Raw result
 * @param {string} query - Search query
 * @param {string} userTier - User's subscription tier
 * @returns {Object} - Enhanced result
 */
export function enhanceResult(result, query = "", userTier = "sales") {
  const enhanced = { ...result };

  // Add search query to result for context
  enhanced.searchQuery = query;

  // Fix URL generation
  enhanced.url = getSearchResultUrl(
    result.category,
    result.type,
    "list", // Default to list view
    result.id,
  );

  // Add display configuration
  const displayConfig = getCategoryDisplayConfig(result.category);
  enhanced.displayConfig = displayConfig;

  // Standardize type and category labels
  enhanced.typeLabel = result.type || displayConfig.label;
  enhanced.categoryLabel = displayConfig.label;

  // Add visual indicators
  enhanced.icon = result.icon || displayConfig.icon;
  enhanced.color = result.color || displayConfig.color;

  // Add action buttons based on category and user permissions
  enhanced.actions = getAvailableActions(result, userTier);

  // Add metadata for better display
  enhanced.metadata = {
    ...result.metadata,
    displayType: enhanced.typeLabel,
    category: enhanced.categoryLabel,
    isLocked: enhanced.locked || false,
    lockReason: enhanced.lockReason || null,
  };

  return enhanced;
}

/**
 * Get available actions for a result
 * @param {Object} result - Search result
 * @param {string} userTier - User's subscription tier
 * @returns {Array} - Available actions
 */
export function getAvailableActions(result, userTier = "sales") {
  const category = result.category;
  const actions = [];

  // Common actions
  actions.push({
    id: "view",
    label: "View",
    icon: "Eye",
    action: "view",
    primary: true,
  });

  // Category-specific actions
  switch (category) {
    case "leads":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        {
          id: "convert",
          label: "Convert to Contact",
          icon: "Users",
          action: "convert",
        },
      );
      break;

    case "contacts":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        { id: "email", label: "Send Email", icon: "Mail", action: "email" },
      );
      break;

    case "opportunities":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        {
          id: "update-stage",
          label: "Update Stage",
          icon: "TrendingUp",
          action: "update-stage",
        },
      );
      break;

    case "activities":
    case "tasks":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        {
          id: "complete",
          label: "Mark Complete",
          icon: "CheckSquare",
          action: "complete",
        },
      );
      break;

    case "forms":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        {
          id: "analytics",
          label: "View Analytics",
          icon: "BarChart3",
          action: "analytics",
        },
        { id: "preview", label: "Preview", icon: "Eye", action: "preview" },
      );
      break;

    case "email_campaigns":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: "Copy",
          action: "duplicate",
        },
        {
          id: "analytics",
          label: "View Analytics",
          icon: "BarChart3",
          action: "analytics",
        },
      );
      break;

    case "workflows":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        { id: "execute", label: "Run Now", icon: "Play", action: "execute" },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: "Copy",
          action: "duplicate",
        },
      );
      break;

    case "calendar_events":
      actions.push(
        { id: "edit", label: "Edit", icon: "Edit", action: "edit" },
        {
          id: "reschedule",
          label: "Reschedule",
          icon: "Calendar",
          action: "reschedule",
        },
      );
      break;
  }

  // Filter actions based on user tier
  return actions.filter((action) => {
    if (action.requiredTier) {
      return canAccessSection(userTier, action.requiredTier);
    }
    return true;
  });
}

/**
 * Sort results by relevance
 * @param {Array} results - Search results
 * @param {string} query - Search query
 * @returns {Array} - Sorted results
 */
export function sortByRelevance(results, query = "") {
  if (!query || query.length < 2) return results;

  const lowerQuery = query.toLowerCase();

  return results.sort((a, b) => {
    const aTitle = (a.title || "").toLowerCase();
    const bTitle = (b.title || "").toLowerCase();

    // Priority 1: Exact title match
    const aExact = aTitle === lowerQuery ? 1 : 0;
    const bExact = bTitle === lowerQuery ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    // Priority 2: Title starts with query
    const aStarts = aTitle.startsWith(lowerQuery) ? 1 : 0;
    const bStarts = bTitle.startsWith(lowerQuery) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    // Priority 3: Title contains query
    const aContains = aTitle.includes(lowerQuery) ? 1 : 0;
    const bContains = bTitle.includes(lowerQuery) ? 1 : 0;
    if (aContains !== bContains) return bContains - aContains;

    // Priority 4: Subtitle/description match
    const aSubtitle = (a.subtitle || "").toLowerCase();
    const bSubtitle = (b.subtitle || "").toLowerCase();

    const aSubtitleContains = aSubtitle.includes(lowerQuery) ? 1 : 0;
    const bSubtitleContains = bSubtitle.includes(lowerQuery) ? 1 : 0;
    if (aSubtitleContains !== bSubtitleContains)
      return bSubtitleContains - aSubtitleContains;

    // Priority 5: Category relevance (certain categories are more important)
    const categoryPriority = {
      leads: 5,
      contacts: 5,
      opportunities: 4,
      activities: 3,
      forms: 3,
      email_campaigns: 3,
      workflows: 2,
      second_brain: 2,
      calendar: 2,
      reports: 1,
      settings: 1,
      navigation: 0,
    };

    const aCategoryPriority = categoryPriority[a.category] || 0;
    const bCategoryPriority = categoryPriority[b.category] || 0;

    if (aCategoryPriority !== bCategoryPriority) {
      return bCategoryPriority - aCategoryPriority;
    }

    // Priority 6: Alphabetical
    return aTitle.localeCompare(bTitle);
  });
}

/**
 * Group results by category
 * @param {Array} results - Search results
 * @returns {Object} - Grouped results
 */
export function groupResultsByCategory(results) {
  if (!Array.isArray(results)) return {};

  return results.reduce((groups, result) => {
    const category = result.category || "other";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(result);
    return groups;
  }, {});
}

/**
 * Get search suggestions based on query
 * @param {string} query - Search query
 * @param {Array} recentSearches - Recent searches
 * @returns {Array} - Suggestions
 */
export function getSearchSuggestions(query, recentSearches = []) {
  const suggestions = [];
  const lowerQuery = query.toLowerCase();

  // Add recent searches that match
  recentSearches
    .filter((search) => search.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .forEach((search) => {
      suggestions.push({
        type: "recent",
        text: search,
        icon: "Clock",
      });
    });

  // Add popular searches if query is short
  if (query.length < 3) {
    const popularSearches = [
      "leads",
      "contacts",
      "opportunities",
      "activities",
      "forms",
      "workflows",
      "calendar",
      "reports",
    ];

    popularSearches
      .filter((search) => search.includes(lowerQuery))
      .slice(0, 5)
      .forEach((search) => {
        suggestions.push({
          type: "popular",
          text: search,
          icon: "TrendingUp",
        });
      });
  }

  return suggestions;
}

/**
 * Validate search result before navigation
 * @param {Object} result - Search result
 * @param {string} userTier - User's subscription tier
 * @returns {Object} - Validation result
 */
export function validateSearchResult(result) {
  const validation = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if result has required fields
  if (!result.title) {
    validation.valid = false;
    validation.errors.push("Result missing title");
  }

  if (!result.category) {
    validation.valid = false;
    validation.errors.push("Result missing category");
  }

  if (!result.url) {
    validation.valid = false;
    validation.errors.push("Result missing URL");
  }

  // Check if user can access this result
  if (result.locked) {
    validation.warnings.push(
      "This feature requires a higher subscription tier",
    );
  }

  // Check if URL is valid
  try {
    new URL(result.url, window.location.origin);
  } catch (error) {
    validation.valid = false;
    validation.errors.push("Invalid URL format");
  }

  return validation;
}

export default {
  deduplicateResults,
  filterResultsByTier,
  processSearchResults,
  enhanceResult,
  getAvailableActions,
  sortByRelevance,
  groupResultsByCategory,
  getSearchSuggestions,
  validateSearchResult,
};
