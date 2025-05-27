
"use client";
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Button } from './ui/button';
import Link from 'next/link';
import { PlusCircle, Search, Menu, Handshake } from 'lucide-react'; // Added Handshake
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import React, { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Added Image
import useLocalStorage from '@/hooks/use-local-storage'; // Added useLocalStorage
import type { BusinessSettings } from '@/lib/types'; // Added BusinessSettings
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS, APP_NAME } from '@/lib/constants'; // Added constants

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const [storedSettings] = useLocalStorage<BusinessSettings>(
    BUSINESS_SETTINGS_STORAGE_KEY,
    DEFAULT_BUSINESS_SETTINGS
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const appNameToUse = isClient ? storedSettings.appName || APP_NAME : APP_NAME;
  const faviconUrl = isClient ? storedSettings.faviconUrl : null;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Mobile Menu */}
        <div className="md:hidden mr-2 sm:mr-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 sm:w-1/2">
              <div className="py-6">
                <div className="px-4 mb-6">
                  {/* Display full logo in mobile sheet header for branding */}
                  <Logo />
                </div>
                <nav className="grid gap-2 px-4">
                  <Link href="/" className="py-2 text-lg font-medium hover:text-primary">Home</Link>
                  {isAuthenticated && (
                    <Link href="/sell" className="py-2 text-lg font-medium hover:text-primary">Sell Your Item</Link>
                  )}
                  <div className="pt-4">
                    <h3 className="mb-2 px-0 text-lg font-semibold tracking-tight">Categories</h3>
                    {MOCK_CATEGORIES.map((category) => (
                       <Link key={category.id} href={`/category/${category.id}`} className="block py-2 text-muted-foreground hover:text-primary">
                        {category.name}
                      </Link>
                    ))}
                  </div>
                   {isAuthenticated && (
                     <>
                      <div className="pt-4 mt-4 border-t">
                        <h3 className="mb-2 px-0 text-lg font-semibold tracking-tight">My Account</h3>
                        {USER_NAVIGATION.map(item => (
                           <Link href={item.href} key={item.name} passHref>
                             <div className="block py-2 text-muted-foreground hover:text-primary cursor-pointer">{item.name}</div>
                           </Link>
                        ))}
                      </div>
                     </>
                   )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Logo / Favicon Section */}
        <Link href="/" className="flex items-center flex-shrink-0 text-primary hover:text-primary/90 transition-colors mr-2 sm:mr-4">
          {/* Desktop: Render the full Logo component */}
          <div className="hidden md:block">
            <Logo />
          </div>
          {/* Mobile: Render Favicon */}
          <div className="block md:hidden h-8 w-8 flex items-center justify-center">
            {isClient && faviconUrl ? (
              <Image
                src={faviconUrl}
                alt={`${appNameToUse} Favicon`}
                width={28}
                height={28}
                className="object-contain"
              />
            ) : (
              <Handshake className="h-7 w-7" /> // Fallback icon
            )}
          </div>
        </Link>

        {/* Search Bar Wrapper - Takes available space and centers the form */}
        <div className="flex-1 flex justify-center items-center mx-1 sm:mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full rounded-lg bg-muted pl-10 pr-4 py-2 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {/* Right side actions - common container */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
            {/* Sell Now Button */}
            <Link href="/sell" passHref>
                <Button
                    variant="default"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-2 sm:px-3 h-10"
                >
                    <PlusCircle className="h-5 w-5 sm:mr-1" />
                    <span className="hidden sm:inline">Sell Now</span>
                </Button>
            </Link>

            {/* User Navigation (includes Cart and Login/UserMenu) */}
            <UserNav />
        </div>
      </div>
    </header>
  );
}
