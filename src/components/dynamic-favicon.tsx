"use client";

import { useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import type { BusinessSettings } from '@/lib/types';

export function DynamicFavicon() {
  const [storedSettings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );

  useEffect(() => {
    const faviconUrl = storedSettings?.faviconUrl;
    
    if (faviconUrl && faviconUrl !== DEFAULT_BUSINESS_SETTINGS.faviconUrl) {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());
      
      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      link.type = 'image/x-icon';
      document.head.appendChild(link);
    } else {
      // Reset to default favicon
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());
      
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = '/favicon.ico';
      link.type = 'image/x-icon';
      document.head.appendChild(link);
    }
  }, [storedSettings?.faviconUrl]);

  return null; // This component doesn't render anything
} 