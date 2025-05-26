
"use client";

import React from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { usePathname } from 'next/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isHomePage = pathname === '/';

  // Determine container class based on route
  // Homepage will manage its own container for full-width sections
  // Admin routes have their own layout structure
  // Other routes get the default container
  let mainContainerClass = 'container';
  if (isHomePage || isAdminRoute) {
    mainContainerClass = ''; 
  }


  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminRoute && <SiteHeader />}
        <main className={`flex-grow ${isAdminRoute ? '' : `py-0 md:py-0 ${mainContainerClass}`}`}> {/* Adjusted padding for homepage */}
          {children}
        </main>
        {!isAdminRoute && <SiteFooter />}
      </CartProvider>
    </AuthProvider>
  );
}
