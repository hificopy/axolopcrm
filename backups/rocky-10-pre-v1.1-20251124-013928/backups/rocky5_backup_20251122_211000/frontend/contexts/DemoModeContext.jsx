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

  // Load demo mode state from localStorage
  useEffect(() => {
    const savedDemoMode = localStorage.getItem('axolop-demo-mode');
    if (savedDemoMode === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  // Save demo mode state to localStorage
  useEffect(() => {
    localStorage.setItem('axolop-demo-mode', isDemoMode.toString());
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
