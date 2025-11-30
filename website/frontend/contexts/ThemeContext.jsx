/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { localStorageGet, localStorageSet } from '../utils/safeStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Function to apply theme to document
  const applyTheme = useCallback((themeValue) => {
    const root = document.documentElement;
    
    if (themeValue === 'auto') {
      // Apply theme based on system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.remove('light', 'dark');
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
      localStorageSet('theme', 'auto');
    } else {
      // Apply specific theme
      root.classList.remove('light', 'dark');
      root.classList.add(themeValue);
      localStorageSet('theme', themeValue);
    }
  }, []);

  // Effect to handle initial theme and system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (theme === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      }
    };

    // Apply initial theme
    const savedTheme = localStorageGet('theme', 'light');
    setTheme(savedTheme);

    // Apply the theme immediately to the DOM based on the current theme state
    if (savedTheme === 'auto') {
      const systemPrefersDark = mediaQuery.matches;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemPrefersDark ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
    }

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Apply theme when 'theme' state changes (for programmatic changes)
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'auto') return 'light'; // If current is auto, switch to light
      return prev === 'light' ? 'dark' : 'light';
    });
  };

  // Function to set theme to auto mode
  const setAutoTheme = () => {
    setTheme('auto');
  };

  const value = {
    theme,
    setTheme,
    setAutoTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};