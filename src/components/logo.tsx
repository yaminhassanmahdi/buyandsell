
"use client";
import Link from 'next/link';
import { Handshake } from 'lucide-react'; // Example icon
import { APP_NAME, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import type { BusinessSettings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Logo() {
  const [storedSettings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const appName = isClient ? storedSettings.appName || APP_NAME : APP_NAME;
  const logoUrl = isClient ? storedSettings.logoUrl : null;

  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors">
      {isClient && logoUrl && logoUrl !== DEFAULT_BUSINESS_SETTINGS.logoUrl ? (
        <Image src={logoUrl} alt={`${appName} logo`} width={32} height={32} className="h-7 w-7 object-contain" />
      ) : (
        <Handshake className="h-7 w-7" />
      )}
      <span>{appName}</span>
    </Link>
  );
}
