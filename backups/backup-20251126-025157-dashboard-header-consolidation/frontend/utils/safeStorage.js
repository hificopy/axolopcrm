/**
 * Safe Storage Utility
 * Wraps localStorage and sessionStorage with try-catch to handle private browsing mode
 * where storage APIs throw errors.
 */

/**
 * Safely get an item from storage
 * @param {Storage} storage - localStorage or sessionStorage
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - Default value if not found or error occurs
 * @returns {*} The stored value or defaultValue
 */
const safeGetItem = (storage, key, defaultValue = null) => {
  try {
    const item = storage.getItem(key);
    return item !== null ? item : defaultValue;
  } catch (error) {
    console.warn(`Storage access failed for key "${key}":`, error.message);
    return defaultValue;
  }
};

/**
 * Safely set an item in storage
 * @param {Storage} storage - localStorage or sessionStorage
 * @param {string} key - The key to set
 * @param {string} value - The value to store
 * @returns {boolean} True if successful, false otherwise
 */
const safeSetItem = (storage, key, value) => {
  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Storage write failed for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Safely remove an item from storage
 * @param {Storage} storage - localStorage or sessionStorage
 * @param {string} key - The key to remove
 * @returns {boolean} True if successful, false otherwise
 */
const safeRemoveItem = (storage, key) => {
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Storage remove failed for key "${key}":`, error.message);
    return false;
  }
};

/**
 * Safely parse JSON from storage
 * @param {Storage} storage - localStorage or sessionStorage
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - Default value if not found, error occurs, or invalid JSON
 * @returns {*} The parsed value or defaultValue
 */
const safeGetJSON = (storage, key, defaultValue = null) => {
  try {
    const item = storage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Storage JSON parse failed for key "${key}":`, error.message);
    return defaultValue;
  }
};

/**
 * Safely stringify and store JSON in storage
 * @param {Storage} storage - localStorage or sessionStorage
 * @param {string} key - The key to set
 * @param {*} value - The value to stringify and store
 * @returns {boolean} True if successful, false otherwise
 */
const safeSetJSON = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Storage JSON write failed for key "${key}":`, error.message);
    return false;
  }
};

// localStorage wrappers
export const localStorageGet = (key, defaultValue = null) =>
  safeGetItem(localStorage, key, defaultValue);

export const localStorageSet = (key, value) =>
  safeSetItem(localStorage, key, value);

export const localStorageRemove = (key) =>
  safeRemoveItem(localStorage, key);

export const localStorageGetJSON = (key, defaultValue = null) =>
  safeGetJSON(localStorage, key, defaultValue);

export const localStorageSetJSON = (key, value) =>
  safeSetJSON(localStorage, key, value);

// sessionStorage wrappers
export const sessionStorageGet = (key, defaultValue = null) =>
  safeGetItem(sessionStorage, key, defaultValue);

export const sessionStorageSet = (key, value) =>
  safeSetItem(sessionStorage, key, value);

export const sessionStorageRemove = (key) =>
  safeRemoveItem(sessionStorage, key);

export const sessionStorageGetJSON = (key, defaultValue = null) =>
  safeGetJSON(sessionStorage, key, defaultValue);

export const sessionStorageSetJSON = (key, value) =>
  safeSetJSON(sessionStorage, key, value);

// Check if storage is available
export const isStorageAvailable = (type = 'localStorage') => {
  try {
    const storage = type === 'localStorage' ? localStorage : sessionStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  localStorageGet,
  localStorageSet,
  localStorageRemove,
  localStorageGetJSON,
  localStorageSetJSON,
  sessionStorageGet,
  sessionStorageSet,
  sessionStorageRemove,
  sessionStorageGetJSON,
  sessionStorageSetJSON,
  isStorageAvailable,
};
