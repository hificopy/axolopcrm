import { useState, useEffect, useRef, useCallback } from "react";

// ========================================
// PERFORMANCE OPTIMIZATION HOOKS
// ========================================

// Cache for API responses and component data
const responseCache = new Map();
const preloadCache = new Map();

// Simple LRU cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Global caches
const apiCache = new LRUCache(50);
const componentCache = new LRUCache(30);

// Hook for optimized API calls with caching
export const useOptimizedApi = () => {
  const [loading, setLoading] = useState(false);
  const pendingRequests = useRef(new Map());

  const makeRequest = useCallback(async (key, apiCall, options = {}) => {
    const {
      cache = true,
      cacheTime = 5 * 60 * 1000, // 5 minutes default
      optimistic = false,
      optimisticData = null,
    } = options;

    // Check cache first
    if (cache && apiCache.has(key)) {
      const cached = apiCache.get(key);
      if (Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }
    }

    // Check if request is already pending
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }

    // Return optimistic data immediately if available
    if (optimistic && optimisticData) {
      return optimisticData;
    }

    setLoading(true);
    const requestPromise = apiCall()
      .then((data) => {
        // Cache the response
        if (cache) {
          apiCache.set(key, {
            data,
            timestamp: Date.now(),
          });
        }
        return data;
      })
      .finally(() => {
        setLoading(false);
        pendingRequests.current.delete(key);
      });

    pendingRequests.current.set(key, requestPromise);
    return requestPromise;
  }, []);

  const invalidateCache = useCallback((keyPattern) => {
    if (typeof keyPattern === "string") {
      apiCache.cache.delete(keyPattern);
    } else if (keyPattern instanceof RegExp) {
      for (const key of apiCache.cache.keys()) {
        if (keyPattern.test(key)) {
          apiCache.cache.delete(key);
        }
      }
    } else {
      apiCache.clear();
    }
  }, []);

  return {
    makeRequest,
    invalidateCache,
    loading,
    cacheSize: apiCache.cache.size,
  };
};

// Hook for component state caching
export const useComponentCache = (componentKey) => {
  const [state, setState] = useState(() => {
    // Restore from cache if available
    const cached = componentCache.get(componentKey);
    return cached || null;
  });

  const setCachedState = useCallback(
    (newState) => {
      setState(newState);
      componentCache.set(componentKey, newState);
    },
    [componentKey],
  );

  const clearCache = useCallback(() => {
    componentCache.delete(componentKey);
    setState(null);
  }, [componentKey]);

  return [state, setCachedState, clearCache];
};

// Hook for preloading data on hover/delay
export const usePreload = (preloadFn, dependencies = []) => {
  const timeoutRef = useRef(null);
  const preloadedRef = useRef(false);

  const startPreload = useCallback(
    (delay = 200) => {
      if (preloadedRef.current) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        preloadFn();
        preloadedRef.current = true;
      }, delay);
    },
    [preloadFn],
  );

  const cancelPreload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const immediatePreload = useCallback(() => {
    if (!preloadedRef.current) {
      preloadFn();
      preloadedRef.current = true;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [preloadFn]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    startPreload,
    cancelPreload,
    immediatePreload,
    isPreloaded: preloadedRef.current,
  };
};

// Hook for optimistic UI updates
export const useOptimisticUI = (initialState) => {
  const [state, setState] = useState(initialState);
  const [optimisticState, setOptimisticState] = useState(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const updateOptimistically = useCallback(
    (optimisticUpdate, actualUpdate) => {
      // Apply optimistic update immediately
      setOptimisticState(optimisticUpdate(state));
      setIsOptimistic(true);

      // Apply actual update (usually async)
      return Promise.resolve(actualUpdate(state))
        .then((newState) => {
          setState(newState);
          setOptimisticState(null);
          setIsOptimistic(false);
          return newState;
        })
        .catch((error) => {
          // Revert optimistic update on error
          setOptimisticState(null);
          setIsOptimistic(false);
          throw error;
        });
    },
    [state],
  );

  const currentState = isOptimistic ? optimisticState : state;

  return [currentState, setState, updateOptimistically, isOptimistic];
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Performance] ${componentName} render #${renderCount.current}: ${renderTime}ms`,
      );
    }

    // Log slow renders
    if (renderTime > 100) {
      console.warn(
        `[Performance] Slow render detected in ${componentName}: ${renderTime}ms`,
      );
    }
  });

  const measureOperation = useCallback(
    (operationName, operation) => {
      const start = Date.now();
      return Promise.resolve(operation()).then((result) => {
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Performance] ${componentName}.${operationName}: ${duration}ms`,
          );
        }
        return result;
      });
    },
    [componentName],
  );

  return { measureOperation };
};

// Debounced value hook for search/filter optimization
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized component wrapper for expensive renders
export const useMemoizedComponent = (componentFactory, dependencies) => {
  const memoizedComponent = useCallback(componentFactory, dependencies);
  return memoizedComponent;
};

// Clear all caches (useful for logout)
export const clearAllCaches = () => {
  apiCache.clear();
  componentCache.clear();
  responseCache.clear();
  preloadCache.clear();
};

// Get cache statistics
export const getCacheStats = () => ({
  apiCache: {
    size: apiCache.cache.size,
    maxSize: apiCache.maxSize,
  },
  componentCache: {
    size: componentCache.cache.size,
    maxSize: componentCache.maxSize,
  },
});
