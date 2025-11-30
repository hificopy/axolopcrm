// ========================================
// USER EXPERIENCE IMPROVEMENTS
// ========================================
// Frontend UX enhancements for Axolop CRM

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

// ========================================
// LOADING STATES MANAGEMENT
// ========================================

export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback((message = "") => {
    setIsLoading(true);
    setLoadingMessage(message);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("");
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  return {
    isLoading,
    loadingMessage,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
  };
};

// Loading overlay component
export const LoadingOverlay = ({ isLoading, message, progress }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          {message && <p className="text-gray-700 text-center">{message}</p>}
          {progress > 0 && (
            <div className="w-full">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center mt-1">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================
// OPTIMISTIC UPDATES
// ========================================

export const useOptimisticUpdate = (updateFn, rollbackFn) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState([]);

  const executeUpdate = useCallback(
    async (id, newData) => {
      setIsUpdating(true);

      // Add to pending updates
      const updateId = Date.now().toString();
      setPendingUpdates((prev) => [
        ...prev,
        { id: updateId, itemId: id, data: newData },
      ]);

      try {
        const result = await updateFn(id, newData);

        // Remove from pending updates
        setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));

        toast.success("Update successful");
        return result;
      } catch (error) {
        // Rollback on error
        if (rollbackFn) {
          await rollbackFn(id);
        }

        // Remove from pending updates
        setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));

        toast.error("Update failed. Changes have been reverted.");
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateFn, rollbackFn],
  );

  return {
    executeUpdate,
    isUpdating,
    pendingUpdates,
  };
};

// ========================================
// OFFLINE SUPPORT
// ========================================

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error(
        "You are offline. Changes will be synced when you reconnect.",
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addToOfflineQueue = useCallback((action) => {
    setOfflineQueue((prev) => [
      ...prev,
      {
        ...action,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      },
    ]);

    toast("Action queued for sync when online", {
      icon: "📤",
    });
  }, []);

  const syncOfflineActions = useCallback(async () => {
    if (offlineQueue.length === 0 || syncInProgress) return;

    setSyncInProgress(true);

    try {
      const actions = [...offlineQueue];
      setOfflineQueue([]);

      for (const action of actions) {
        try {
          await action.execute();
        } catch (error) {
          console.error("Failed to sync action:", error);
          // Re-add to queue if failed
          setOfflineQueue((prev) => [...prev, action]);
        }
      }

      toast.success("All offline actions synced successfully");
    } catch (error) {
      toast.error("Some actions failed to sync");
    } finally {
      setSyncInProgress(false);
    }
  }, [offlineQueue, syncInProgress]);

  return {
    isOnline,
    offlineQueue,
    syncInProgress,
    addToOfflineQueue,
    syncOfflineActions,
  };
};

// ========================================
// MOBILE RESPONSIVENESS HELPERS
// ========================================

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024,
  );
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
  };
};

// Responsive component wrapper
export const Responsive = ({ children, mobile, tablet, desktop }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobile) return mobile;
  if (isTablet && tablet) return tablet;
  if (isDesktop && desktop) return desktop;

  return children;
};

// ========================================
// INFINITE SCROLL
// ========================================

export const useInfiniteScroll = (fetchMore, hasMore) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          try {
            await fetchMore();
          } finally {
            setIsLoading(false);
          }
        }
      },
      {
        threshold: 1.0,
        rootMargin: "100px",
      },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchMore, hasMore, isLoading]);

  return {
    observerRef,
    isLoading,
  };
};

// ========================================
// VIRTUAL SCROLLING
// ========================================

export const useVirtualScroll = (
  items,
  itemHeight = 50,
  containerHeight = 400,
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex,
  };
};

// ========================================
// DEBOUNCED SEARCH
// ========================================

export const useDebounce = (value, delay) => {
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

export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      searchFn(debouncedSearchTerm)
        .then(setResults)
        .finally(() => setIsSearching(false));
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm, searchFn]);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    results,
  };
};

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = [
        e.ctrlKey && "ctrl",
        e.metaKey && "meta",
        e.shiftKey && "shift",
        e.altKey && "alt",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      const shortcut = shortcuts[key];
      if (shortcut) {
        e.preventDefault();
        shortcut(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};

// ========================================
// TOAST NOTIFICATIONS
// ========================================

export const useToast = () => {
  const success = useCallback((message, options = {}) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
      ...options,
    });
  }, []);

  const error = useCallback((message, options = {}) => {
    toast.error(message, {
      duration: 6000,
      position: "top-right",
      ...options,
    });
  }, []);

  const loading = useCallback((message, options = {}) => {
    return toast.loading(message, {
      position: "top-right",
      ...options,
    });
  }, []);

  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  return {
    success,
    error,
    loading,
    dismiss,
  };
};

// ========================================
// ERROR BOUNDARY WITH RECOVERY
// ========================================

export class ErrorBoundaryWithRecovery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < (this.props.maxRetries || 3)) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        retry: this.handleRetry,
        retryCount: this.state.retryCount,
        maxRetries: this.props.maxRetries || 3,
      });
    }

    return this.props.children;
  }
}

// ========================================
// PERFORMANCE MONITORING
// ========================================

export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current++;

    return () => {
      const renderTime = performance.now() - renderStartTime.current;

      if (renderTime > 100) {
        // Log slow renders
        console.warn(
          `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`,
        );
      }

      // Send to analytics
      if (window.gtag) {
        window.gtag("event", "component_render", {
          component_name: componentName,
          render_time: Math.round(renderTime),
          render_count: renderCount.current,
        });
      }
    };
  });

  const measureOperation = useCallback(async (operationName, operation) => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      // Log slow operations
      if (duration > 1000) {
        console.warn(
          `Slow operation: ${operationName} took ${duration.toFixed(2)}ms`,
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `Operation failed: ${operationName} after ${duration.toFixed(2)}ms`,
        error,
      );
      throw error;
    }
  }, []);

  return { measureOperation };
};

// ========================================
// ACCESSIBILITY HELPERS
// ========================================

export const useAccessibility = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    setHighContrast(contrastQuery.matches);

    // Simple screen reader detection
    setScreenReader(window.speechSynthesis !== undefined);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    const handleContrastChange = (e) => setHighContrast(e.matches);

    motionQuery.addEventListener("change", handleMotionChange);
    contrastQuery.addEventListener("change", handleContrastChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      contrastQuery.removeEventListener("change", handleContrastChange);
    };
  }, []);

  return {
    highContrast,
    reducedMotion,
    screenReader,
  };
};

// ========================================
// FORM ENHANCEMENTS
// ========================================

export const useFormEnhancements = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error when field is updated
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors],
  );

  const setError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name, touched = true) => {
    setTouched((prev) => ({ ...prev, [name]: touched }));
  }, []);

  const validateField = useCallback(
    (name, value) => {
      if (!validationSchema) return "";

      try {
        validationSchema.parseAt(name, value);
        return "";
      } catch (error) {
        return error.message;
      }
    },
    [validationSchema],
  );

  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.errors.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [validationSchema, values]);

  const handleSubmit = useCallback(
    async (onSubmit) => {
      setIsSubmitting(true);

      try {
        const isValid = validateForm();
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }

        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    setFieldTouched: setTouched,
    validateField,
    validateForm,
    handleSubmit,
  };
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example 1: Loading states
function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  
  const handleClick = async () => {
    startLoading('Processing...');
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };
  
  return (
    <>
      <button onClick={handleClick}>Process</button>
      <LoadingOverlay isLoading={isLoading} message="Processing..." />
    </>
  );
}

// Example 2: Optimistic updates
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const { executeUpdate } = useOptimisticUpdate(
    async (id, data) => {
      // API call
      return await updateTodo(id, data);
    },
    async (id) => {
      // Rollback
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    }
  );
  
  const toggleTodo = async (id) => {
    // Optimistic update
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    
    // Execute actual update
    await executeUpdate(id, { completed: !todo.completed });
  };
  
  return (
    // Render todos...
  );
}

// Example 3: Keyboard shortcuts
function App() {
  useKeyboardShortcuts({
    'ctrl+k': () => console.log('Search'),
    'ctrl+s': () => console.log('Save'),
    'escape': () => console.log('Cancel'),
  });
  
  return <div>App content</div>;
}

// Example 4: Error boundary
function App() {
  return (
    <ErrorBoundaryWithRecovery
      maxRetries={3}
      onError={(error, errorInfo) => {
        console.error('Component error:', error, errorInfo);
      }}
      fallback={({ error, retry, retryCount, maxRetries }) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          {retryCount < maxRetries && (
            <button onClick={retry}>Retry ({retryCount}/{maxRetries})</button>
          )}
        </div>
      )}
    >
      <MyComponent />
    </ErrorBoundaryWithRecovery>
  );
}
*/
