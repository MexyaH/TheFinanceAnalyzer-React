import React from 'react';

export const LanguageContext = React.createContext({
  languageSelected: false,
  setLanguageSelected: (_: boolean) => {},
});