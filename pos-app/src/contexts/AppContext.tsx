import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  businessMode: 'supermarket' | 'installment_sales' | 'warehouse';
  language: 'en' | 'ar';
  currency: string;
  theme: 'light' | 'dark';
  printerType: 'a4' | 'thermal';
  logo: string;
  firstRun: boolean;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
}

const defaultSettings: AppSettings = {
  businessMode: 'supermarket',
  language: 'en',
  currency: 'EGP',
  theme: 'light',
  printerType: 'a4',
  logo: '',
  firstRun: true
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  useEffect(() => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply language direction
    if (settings.language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [settings.theme, settings.language]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('appSettings', JSON.stringify(updated));
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
