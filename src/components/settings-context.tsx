"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { BusinessSettings } from '@/lib/types';
import { DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

interface SettingsContextType {
  settings: BusinessSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const apiSettings = await apiClient.getSettings('business');
      const mergedSettings = {
        ...DEFAULT_BUSINESS_SETTINGS,
        ...apiSettings,
        availableCurrencies: apiSettings?.availableCurrencies && Array.isArray(apiSettings.availableCurrencies) 
                             ? apiSettings.availableCurrencies 
                             : DEFAULT_BUSINESS_SETTINGS.availableCurrencies,
      };
      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use defaults if API fails
      setSettings(DEFAULT_BUSINESS_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 