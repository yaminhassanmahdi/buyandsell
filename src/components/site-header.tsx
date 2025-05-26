
"use client";
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { Button } from './ui/button';
import Link from 'next/link';
import { PlusCircle, Search, Menu } from 'lucide-react';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MainNav } from './main-nav'; // Keep for mobile drawer
import { CATEGORIES } from '@/lib/constants'; // For mobile drawer categories
import { useAuth } from '@/contexts/auth-context'; // For mobile drawer sell link

export function SiteHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Mobile Menu */}
        <div className="md:hidden mr-4">
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
                  <Logo />
                </div>
                <nav className="grid gap-2 px-4">
                  <Link href="/" className="py-2 text-lg font-medium hover:text-primary">Home</Link>
                  {isAuthenticated && (
                    <Link href="/sell" className="py-2 text-lg font-medium hover:text-primary">Sell Your Item</Link>
                  )}
                  <div className="pt-4">
                    <h3 className="mb-2 px-0 text-lg font-semibold tracking-tight">Categories</h3>
                    {CATEGORIES.map((category) => (
                       <Link key={category.id} href={`/?category=${category.id}`} className="block py-2 text-muted-foreground hover:text-primary">
                        {category.name}
                      </Link>
                    ))}
                  </div>
                   {isAuthenticated && (
                     <>
                      <div className="pt-4 mt-4 border-t">
                        <h3 className="mb-2 px-0 text-lg font-semibold tracking-tight">My Account</h3>
                        <Link href="/account/orders" className="block py-2 text-muted-foreground hover:text-primary">My Orders</Link>
                        <Link href="/account/settings" className="block py-2 text-muted-foreground hover:text-primary">Account Settings</Link>
                      </div>
                     </>
                   )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden md:flex">
          <Logo />
        </div>

        <div className="flex-1 mx-4 md:mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for Products, Brands and More"
              className="w-full rounded-lg bg-muted pl-10 pr-4 py-2 h-10"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <UserNav />
        </div>
         {/* Cart icon for mobile, UserNav handles its own cart icon on desktop */}
        <div className="md:hidden">
           <UserNav />
        </div>
      </div>
    </header>
  );
}
