
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

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminRoute && <SiteHeader />}
        <main className={`flex-grow ${isAdminRoute ? '' : 'py-6 lg:py-8 container'}`}>
          {children}
        </main>
        {!isAdminRoute && <SiteFooter />}
      </CartProvider>
    </AuthProvider>
  );
}
