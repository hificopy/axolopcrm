import { useEffect, useRef } from "react";

/**
 * Performance monitoring hook for animations
 * Tracks FPS, memory usage, and animation performance
 */
export const useAnimationPerformance = (animationName) => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef([]);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!window.PerformanceObserver) return;

    // Monitor animation frames
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime.current;

      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        fpsHistory.current.push(fps);

        // Keep only last 10 measurements
        if (fpsHistory.current.length > 10) {
          fpsHistory.current.shift();
        }

        // Log performance warnings
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected in ${animationName}: ${fps}fps`);
        }

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    // Monitor layout shifts - check browser support first
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.value > 0.1) {
            console.warn(
              `⚠️ Layout shift detected in ${animationName}: ${entry.value}`,
            );
          }
        }
      });

      // Check if layout-shift is supported before observing
      if (
        PerformanceObserver.supportedEntryTypes &&
        PerformanceObserver.supportedEntryTypes.includes("layout-shift")
      ) {
        observer.observe({ entryTypes: ["layout-shift"] });
        observerRef.current = observer;
      } else {
        console.warn(
          `⚠️ Layout shift API not supported in this browser for ${animationName}`,
        );
      }
    } catch (error) {
      console.warn(
        `⚠️ PerformanceObserver not available for layout-shift monitoring: ${error.message}`,
      );
    }

    // Start FPS monitoring
    requestAnimationFrame(measureFPS);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [animationName]);

  const getAverageFPS = () => {
    if (fpsHistory.current.length === 0) return 0;
    return Math.round(
      fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length,
    );
  };

  return {
    getAverageFPS,
    fpsHistory: fpsHistory.current,
  };
};

/**
 * Cleanup hook for animations
 * Ensures proper cleanup of animations, timers, and event listeners
 */
export const useAnimationCleanup = () => {
  const timersRef = useRef(new Set());
  const listenersRef = useRef(new Set());
  const animationsRef = useRef(new Set());

  const addTimer = (timerId) => {
    timersRef.current.add(timerId);
    return timerId;
  };

  const addListener = (element, event, handler, options) => {
    element.addEventListener(event, handler, options);
    const cleanup = () => element.removeEventListener(event, handler, options);
    listenersRef.current.add(cleanup);
    return cleanup;
  };

  const addAnimation = (animation) => {
    animationsRef.current.add(animation);
    return animation;
  };

  useEffect(() => {
    return () => {
      // Clear all timers
      timersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });

      // Remove all event listeners
      listenersRef.current.forEach((cleanup) => cleanup());

      // Stop all animations
      animationsRef.current.forEach((animation) => {
        if (animation && typeof animation.stop === "function") {
          animation.stop();
        }
      });

      // Clear all sets
      timersRef.current.clear();
      listenersRef.current.clear();
      animationsRef.current.clear();
    };
  }, []);

  return {
    addTimer,
    addListener,
    addAnimation,
  };
};

/**
 * Optimized intersection observer hook
 * Uses a single observer instance for multiple elements
 */
export const useOptimizedIntersection = (options = {}) => {
  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());

  const observe = (element, callback) => {
    if (!element) return;

    // Create observer if it doesn't exist
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callback = elementsRef.current.get(entry.target);
            if (callback) {
              callback(entry);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "-50px",
          ...options,
        },
      );
    }

    // Store callback and observe element
    elementsRef.current.set(element, callback);
    observerRef.current.observe(element);

    // Return cleanup function
    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
        elementsRef.current.delete(element);
      }
    };
  };

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      elementsRef.current.clear();
    };
  }, []);

  return { observe };
};

/**
 * Debounced resize observer hook
 * Prevents layout thrashing during resize events
 */
export const useDebouncedResize = (callback, delay = 100) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delay);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
};

/**
 * Memory leak prevention hook
 * Monitors memory usage and warns about potential leaks
 */
export const useMemoryLeakPrevention = (componentName) => {
  const initialMemory = useRef(null);

  useEffect(() => {
    if (performance.memory) {
      initialMemory.current = performance.memory.usedJSHeapSize;
    }

    const interval = setInterval(() => {
      if (performance.memory && initialMemory.current) {
        const currentMemory = performance.memory.usedJSHeapSize;
        const increase = currentMemory - initialMemory.current;
        const increaseMB = increase / (1024 * 1024);

        // Warn if memory increased by more than 50MB
        if (increaseMB > 50) {
          console.warn(
            `⚠️ High memory usage in ${componentName}: +${increaseMB.toFixed(2)}MB`,
          );
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [componentName]);
};

/**
 * Optimized animation hook
 * Combines all performance optimizations for animations
 */
export const useOptimizedAnimation = (animationName, options = {}) => {
  const performance = useAnimationPerformance(animationName);
  const cleanup = useAnimationCleanup();
  const intersection = useOptimizedIntersection(options.intersection);
  const memory = useMemoryLeakPrevention(animationName);

  return {
    ...performance,
    ...cleanup,
    ...intersection,
    memory,
  };
};
