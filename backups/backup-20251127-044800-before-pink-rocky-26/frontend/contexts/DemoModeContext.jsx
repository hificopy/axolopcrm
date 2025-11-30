import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoModeContext = createContext();

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

export const DemoModeProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load demo mode state from sessionStorage (clears on browser close)
  // CRITICAL: Using sessionStorage instead of localStorage to prevent
  // demo mode from persisting and potentially overriding real user data
  useEffect(() => {
    try {
      const savedDemoMode = sessionStorage.getItem('axolop_demo_mode');
      if (savedDemoMode === 'true') {
        setIsDemoMode(true);
      }
    } catch (error) {
      // sessionStorage not available (private browsing mode)
      console.warn('sessionStorage not available:', error);
    }
  }, []);

  // Save demo mode state to sessionStorage
  useEffect(() => {
    try {
      if (isDemoMode) {
        sessionStorage.setItem('axolop_demo_mode', 'true');
      } else {
        // Remove the key entirely when demo mode is off to prevent any stale state
        sessionStorage.removeItem('axolop_demo_mode');
      }
    } catch (error) {
      // sessionStorage not available (private browsing mode)
      console.warn('sessionStorage not available:', error);
    }
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
  };

  // Demo user configuration
  const demoUser = {
    email: 'biztester@demo.axolop.com',
    name: 'Biz Tester',
    role: 'Business User',
    plan: 'professional',
    onboardingCompleted: true,
    isDemo: true,
  };

  const value = {
    isDemoMode,
    toggleDemoMode,
    enableDemoMode,
    disableDemoMode,
    demoUser,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};
