import React, { createContext, useContext, useState } from 'react';

const AffiliatePopupContext = createContext();

export const useAffiliatePopup = () => {
  const context = useContext(AffiliatePopupContext);
  if (!context) {
    throw new Error('useAffiliatePopup must be used within AffiliatePopupProvider');
  }
  return context;
};

export const AffiliatePopupProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <AffiliatePopupContext.Provider value={{ isOpen, openPopup, closePopup }}>
      {children}
    </AffiliatePopupContext.Provider>
  );
};
