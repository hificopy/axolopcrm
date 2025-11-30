import { useState, useEffect } from 'react';

/**
 * Custom hook for persistent state that survives page navigation
 * but clears on logout
 *
 * @param {string} key - Unique key for localStorage
 * @param {any} initialValue - Default value if no stored value exists
 * @returns {[any, Function]} - State value and setter function
 */
export function usePersistentState(key, initialValue) {
  // Create a prefixed key to namespace our persistent state
  const prefixedKey = `axolop_persistent_${key}`;

  // Initialize state from localStorage or use initial value
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(prefixedKey);
      return storedValue !== null ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${prefixedKey}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "${prefixedKey}":`, error);
    }
  }, [prefixedKey, state]);

  return [state, setState];
}

/**
 * Clear all persistent state (call on logout)
 */
export function clearPersistentState() {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);

    // Remove all keys that start with our prefix
    keys.forEach(key => {
      if (key.startsWith('axolop_persistent_')) {
        localStorage.removeItem(key);
      }
    });

    console.log('[PersistentState] Cleared all persistent state');
  } catch (error) {
    console.warn('Error clearing persistent state:', error);
  }
}

/**
 * Clear a specific persistent state key
 */
export function clearPersistentStateKey(key) {
  try {
    const prefixedKey = `axolop_persistent_${key}`;
    localStorage.removeItem(prefixedKey);
    console.log(`[PersistentState] Cleared key: ${key}`);
  } catch (error) {
    console.warn(`Error clearing persistent state key "${key}":`, error);
  }
}
