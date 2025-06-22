import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface AppContextType {
  triggerPaywall: () => void;
}

// Create a default context with empty function
const defaultAppContext: AppContextType = {
  triggerPaywall: () => {
    console.warn('No triggerPaywall function set');
  },
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = (): AppContextType => {
  const { t } = useTranslation();
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(t('context.appContext.useOutsideProvider'));
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const triggerPaywall = () => {
    console.log(t('context.appContext.triggeringPaywall'));
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
