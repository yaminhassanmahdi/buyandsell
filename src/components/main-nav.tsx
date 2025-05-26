
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SITE_NAVIGATION } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react';

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {SITE_NAVIGATION.map((item) => {
        if (item.authRequired) {
          if (!isClient || !isAuthenticated) {
            return null; // Don't render auth-required links on server or if not authenticated on client
          }
        }
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-foreground/80"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
