import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ApplicationSettings = {
  dailyGoals: {
    caloriesIn: number;
    caloriesOut: number;
  };
};

type ApplicationSettingsContextType = {
  settings: ApplicationSettings;
  updateSettings: (newSettings: ApplicationSettings) => void;
};

const defaultSettings: ApplicationSettings = {
  dailyGoals: {
    caloriesIn: 2500,
    caloriesOut: 500,
  }
};

const defaultContext: ApplicationSettingsContextType = {
  settings: defaultSettings, // This will be used as the initial state
  updateSettings: () => {},
};

export const ApplicationSettingsContext = createContext<ApplicationSettingsContextType>(defaultContext);

type ApplicationSettingsProviderProps = {
  children: ReactNode;
};

export const ApplicationSettingsProvider: React.FC<ApplicationSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<ApplicationSettings>(defaultContext.settings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('settings');
        if (jsonValue != null) {
          setSettings(JSON.parse(jsonValue) as ApplicationSettings);
        }
      } catch (e) {
        console.error('Error reading application settings:', e);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: ApplicationSettings) => {
    try {
      const jsonValue = JSON.stringify(newSettings);
      await AsyncStorage.setItem('settings', jsonValue);
      setSettings(newSettings);
    } catch (e) {
      console.error('Error saving application settings:', e);
    }
  };

  return (
    <ApplicationSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ApplicationSettingsContext.Provider>
  );
};

export const useApplicationSettings = () => useContext(ApplicationSettingsContext);
