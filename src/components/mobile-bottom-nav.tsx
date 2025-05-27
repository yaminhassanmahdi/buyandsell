
"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, LayoutGrid, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'; // Import useState
import { MobileCategorySheet } from './mobile-category-sheet'; // New import
import { CURRENCY_SYMBOL } from '@/lib/constants';

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth(); 
  const [isClient, setIsClient] = React.useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false); 

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Define all navigation items, including "Sell"
  const navItems = [
    { href: '/', label: 'Home', icon: Home, id: 'home' },
    { href: '#', label: 'Categories', icon: LayoutGrid, id: 'categories' }, 
    { href: '/sell', label: 'Sell', icon: PlusCircle, id: 'sell' },
  ];

  const hiddenOnRoutes = ['/admin', '/login', '/register', '/checkout'];
  if (hiddenOnRoutes.some(routePrefix => pathname.startsWith(routePrefix))) {
    return null;
  }

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background shadow-t-lg print:hidden">
        <div className="container mx-auto flex h-16 items-center px-2 gap-1 sm:gap-2">
          {itemCount > 0 && isClient && (
            <div className="w-3/5 flex items-center">
              <Button asChild variant="default" className="w-full h-12 p-0 overflow-hidden shadow-md rounded-lg">
                <Link href="/checkout" className="flex items-stretch w-full h-full">
                  <span className="flex items-center justify-center flex-grow px-2 text-sm font-medium text-primary-foreground whitespace-nowrap">
                    Checkout
                  </span>
                  <span className="flex items-center justify-center px-2 sm:px-2.5 py-1 bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm rounded-r-lg whitespace-nowrap">
                    {CURRENCY_SYMBOL}{getCartTotal().toFixed(2)}
                  </span>
                </Link>
              </Button>
            </div>
          )}

          <nav className={cn(
            "flex justify-around items-center h-full",
            (itemCount > 0 && isClient) ? "w-2/5" : "w-full"
          )}>
            {navItems.map((item) => { 
              let isActive = false;
              if (item.id === 'home') {
                isActive = pathname === '/' && !searchParams.has('category') && !searchParams.has('subcategory');
              } else if (item.id === 'categories') {
                isActive = pathname === '/' && (searchParams.has('category') || searchParams.has('subcategory'));
              } else {
                isActive = pathname === item.href;
              }

              if (item.id === 'categories') {
                return (
                  <button
                    key={item.id}
                    onClick={() => setIsCategorySheetOpen(true)}
                    className={cn(
                      'flex flex-col items-center justify-center text-center p-1 rounded-md flex-1 min-w-0',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                    )}
                    aria-label="Open categories browser"
                  >
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[10px] sm:text-xs mt-0.5 whitespace-nowrap truncate w-full">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center text-center p-1 rounded-md flex-1 min-w-0',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                  )}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] sm:text-xs mt-0.5 whitespace-nowrap truncate w-full">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <MobileCategorySheet isOpen={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen} />
    </>
  );
}

    