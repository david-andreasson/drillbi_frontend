import React, { createContext, useContext, ReactNode } from 'react';

export interface AppContextType {
  triggerPaywall: () => void;
}

// Skapa en default kontext med tom funktion
const defaultAppContext: AppContextType = {
  triggerPaywall: () => {
    console.warn('Ingen triggerPaywall funktion satt');
  },
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext måste användas inom en AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const triggerPaywall = () => {
    // Här kan du lägga till logik för att hantera paywall
    console.log('Trigger paywall');
  };

  const value = {
    triggerPaywall,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
