// ========================================
// FRONTEND PERFORMANCE UTILITIES
// ========================================
// Lazy loading and code splitting utilities for Axolop CRM

import React, { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// ========================================
// LOADING COMPONENTS
// ========================================

// Full page loader
export const FullPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Component loader with fallback
export const ComponentLoader = ({ size = "default" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
    </div>
  );
};

// Table loader
export const TableLoader = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// ========================================
// LAZY LOADED COMPONENTS
// ========================================

// Heavy pages - lazy load for better performance
export const LazyDashboard = lazy(() => import("../pages/Dashboard"));
export const LazyContacts = lazy(() => import("../pages/Contacts"));
export const LazyLeads = lazy(() => import("../pages/Leads"));
export const LazyOpportunities = lazy(() => import("../pages/Opportunities"));
export const LazyEmailMarketing = lazy(() => import("../pages/EmailMarketing"));
export const LazyCalendar = lazy(() => import("../pages/Calendar"));
export const LazyForms = lazy(() => import("../pages/Forms"));
export const LazyWorkflows = lazy(() => import("../pages/WorkflowsPage"));
export const LazyReports = lazy(() => import("../pages/Reports"));
export const LazySettings = lazy(() => import("../pages/Settings"));

// Heavy components - lazy load
export const LazyFormBuilder = lazy(() => import("../pages/FormBuilder"));
export const LazyWorkflowBuilder = lazy(
  () => import("../pages/WorkflowBuilder"),
);

// Modal components - lazy load
export const LazyLeadModal = lazy(
  () => import("../components/CreateLeadModal"),
);
export const LazyEventModal = lazy(
  () => import("../components/calendar/CreateEventModal"),
);

// ========================================
// HIGHER-ORDER COMPONENTS
// ========================================

// Wrap lazy components with Suspense
export const withSuspense = (Component, fallback = <ComponentLoader />) => {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

// Wrap with full page loader
export const withFullPageSuspense = (Component) => {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Component />
    </Suspense>
  );
};

// ========================================
// PRELOADING UTILITIES
// ========================================

// Preload components based on user behavior
export const preloadComponent = (componentImport) => {
  const componentLoader = componentImport();
  componentLoader.catch(() => {
    // Handle preload errors silently
  });
  return componentLoader;
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard components
  setTimeout(() => {
    preloadComponent(() => import("../pages/Dashboard"));
    // DataGrid component not found, removed preload
  }, 2000);

  // Preload common modals
  setTimeout(() => {
    // ContactModal component not found, removed preload
    preloadComponent(() => import("../components/CreateLeadModal"));
  }, 3000);
};

// Preload on hover
export const createHoverPreloader = (componentImport) => {
  let preloaded = false;

  return () => {
    if (!preloaded) {
      preloadComponent(componentImport);
      preloaded = true;
    }
  };
};

// ========================================
// INTERSECTION OBSERVER LAZY LOADING
// ========================================

// Hook for intersection observer
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// Lazy load component when it comes into view
export const LazyOnIntersection = ({
  children,
  fallback = <ComponentLoader />,
  ...props
}) => {
  const ref = React.useRef();
  const isIntersecting = useIntersectionObserver(ref);

  return (
    <div ref={ref} {...props}>
      {isIntersecting ? children : fallback}
    </div>
  );
};

// ========================================
// ROUTE-BASED CODE SPLITTING
// ========================================

// Create lazy route wrapper
export const createLazyRoute = (
  componentImport,
  fallback = <FullPageLoader />,
) => {
  const LazyComponent = lazy(componentImport);

  return () => (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

// Route definitions with lazy loading
export const lazyRoutes = {
  dashboard: createLazyRoute(() => import("../pages/Dashboard")),
  contacts: createLazyRoute(() => import("../pages/Contacts")),
  leads: createLazyRoute(() => import("../pages/Leads")),
  opportunities: createLazyRoute(() => import("../pages/Opportunities")),
  "email-marketing": createLazyRoute(() => import("../pages/EmailMarketing")),
  calendar: createLazyRoute(() => import("../pages/Calendar")),
  forms: createLazyRoute(() => import("../pages/Forms")),
  workflows: createLazyRoute(() => import("../pages/WorkflowsPage")),
  reports: createLazyRoute(() => import("../pages/Reports")),
  settings: createLazyRoute(() => import("../pages/Settings")),
};

// ========================================
// PERFORMANCE MONITORING
// ========================================

// Measure component load time
export const measureLoadTime = (componentName, loadFunction) => {
  const startTime = performance.now();

  return loadFunction().then((module) => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // console.log(`[Performance] ${componentName} loaded in ${loadTime}ms`);

    // Send to analytics in production
    if (process.env.NODE_ENV === "production") {
      // Send to your analytics service
      if (window.gtag) {
        window.gtag("event", "component_load_time", {
          component_name: componentName,
          load_time: Math.round(loadTime),
        });
      }
    }

    return module;
  });
};

// Enhanced lazy loading with performance tracking
export const lazyWithTracking = (componentImport, componentName) => {
  return lazy(() => measureLoadTime(componentName, componentImport));
};

// ========================================
// CACHE MANAGEMENT
// ========================================

// Service worker registration for caching
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      // console.log("Service Worker registered:", registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

// Cache API responses
export const cacheApiResponse = async (url, data, ttl = 300000) => {
  // 5 minutes default
  if ("caches" in window) {
    try {
      const cache = await caches.open("api-cache");
      const response = new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${ttl / 1000}`,
          "X-Cache-Timestamp": Date.now().toString(),
        },
      });
      await cache.put(url, response);
    } catch (error) {
      console.error("Failed to cache API response:", error);
    }
  }
};

// Get cached API response
export const getCachedApiResponse = async (url) => {
  if ("caches" in window) {
    try {
      const cache = await caches.open("api-cache");
      const response = await cache.match(url);

      if (response) {
        const cacheTimestamp = response.headers.get("X-Cache-Timestamp");
        const now = Date.now();
        const ttl =
          parseInt(
            response.headers
              .get("Cache-Control")
              ?.match(/max-age=(\d+)/)?.[1] || "0",
          ) * 1000;

        if (now - parseInt(cacheTimestamp) < ttl) {
          return response.json();
        } else {
          // Cache expired, remove it
          await cache.delete(url);
        }
      }
    } catch (error) {
      console.error("Failed to get cached API response:", error);
    }
  }

  return null;
};

// ========================================
// BUNDLE SIZE OPTIMIZATION
// ========================================

// Dynamic imports for large libraries
export const loadChartLibrary = () => import("recharts");
export const loadEmailEditor = () => import("@react-email/components");
export const loadCalendarLibrary = () => import("@fullcalendar/react");
export const loadDndLibrary = () => import("@dnd-kit/core");

// Tree shaking for icons
export const loadIcon = (iconName) => {
  return import("lucide-react").then((module) => module[iconName]);
};

// ========================================
// ERROR BOUNDARY FOR LAZY COMPONENTS
// ========================================

export class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lazy component error:", error, errorInfo);

    // Send to error tracking
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              Failed to load this component. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example 1: Basic lazy loading
const LazyDashboard = lazy(() => import('../pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LazyDashboard />
    </Suspense>
  );
}

// Example 2: With performance tracking
const LazyContacts = lazyWithTracking(
  () => import('../pages/Contacts'),
  'ContactsPage'
);

// Example 3: Intersection observer lazy loading
function LazyComponent() {
  const [Component, setComponent] = useState(null);
  const ref = useRef();
  const isIntersecting = useIntersectionObserver(ref);

  useEffect(() => {
    if (isIntersecting && !Component) {
      import('../components/HeavyComponent').then(module => {
        setComponent(() => module.default);
      });
    }
  }, [isIntersecting, Component]);

  return (
    <div ref={ref}>
      {Component ? <Component /> : <ComponentLoader />}
    </div>
  );
}

// Example 4: Route-based lazy loading
const routes = [
  {
    path: '/dashboard',
    component: lazyRoutes.dashboard
  },
  {
    path: '/contacts',
    component: lazyRoutes.contacts
  }
];

// Example 5: Preload on hover
const preloadContacts = createHoverPreloader(() => import('../pages/Contacts'));

function Navigation() {
  return (
    <nav>
      <Link to="/app/home">Dashboard</Link>
      <Link
        to="/app/contacts"
        onMouseEnter={preloadContacts}
      >
        Contacts
      </Link>
    </nav>
  );
}
*/
