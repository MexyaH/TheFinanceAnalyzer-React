import React, { useState, ReactNode } from 'react';
import { LanguageContext } from './LanguageContext';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [languageSelected, setLanguageSelected] = useState(false);

  return (
    <LanguageContext.Provider value={{ languageSelected, setLanguageSelected }}>
      {children}
    </LanguageContext.Provider>
  );
};