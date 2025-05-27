
"use client";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from '@/contexts/auth-context';
import { USER_NAVIGATION, ADMIN_NAVIGATION } from '@/lib/constants';
import { ShoppingCart, UserCircle, LogIn, LogOut, Settings2, Briefcase, TrendingUp, DollarSign } from 'lucide-react'; // Removed UserPlus, CreditCard, LayoutDashboard as they might not be directly used or are part of item.icon
import { useCart } from '@/contexts/cart-context';
import React, { useState, useEffect } from 'react';
import { CartSidebar } from './cart-sidebar';

export function UserNav() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a consistent, minimal placeholder for SSR and initial client render
    return (
      <div className="flex items-center gap-2"> {/* Base class, won't change based on auth status here */}
        <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative" disabled style={{ visibility: 'hidden' }}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled style={{ visibility: 'hidden' }}>
          <UserCircle className="h-7 w-7" />
        </Button>
      </div>
    );
  }

  // If isClient is true, render the actual dynamic UI
  const mainDivClassName = currentUser ? "flex items-center gap-2 md:gap-4" : "flex items-center gap-2";

  if (currentUser) {
    return (
      <div className={mainDivClassName}>
        <Sheet open={isCartSidebarOpen} onOpenChange={setIsCartSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[350px] sm:w-[400px] p-0 flex flex-col" side="right">
            <CartSidebar onClose={() => setIsCartSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {USER_NAVIGATION.map(item => (
                <Link href={item.href} key={item.name} passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    {item.icon ? <item.icon className="mr-2 h-4 w-4" /> : 
                     item.name === "My Orders" ? <ShoppingCart className="mr-2 h-4 w-4" /> :
                     item.name === "Account Settings" ? <Settings2 className="mr-2 h-4 w-4" /> :
                     item.name === "My Products" ? <Briefcase className="mr-2 h-4 w-4" /> :
                     item.name === "My Earnings" ? <TrendingUp className="mr-2 h-4 w-4" /> :
                     null
                    }
                    <span>{item.name}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
               <Link href="/sell" passHref>
                  <DropdownMenuItem className="cursor-pointer">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Sell Your Item</span>
                  </DropdownMenuItem>
                </Link>
            </DropdownMenuGroup>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Admin</DropdownMenuLabel>
                <DropdownMenuGroup>
                   <Link href={ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')?.href || '/admin/dashboard'} passHref>
                     <DropdownMenuItem className="cursor-pointer">
                        {ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')?.icon && React.createElement(ADMIN_NAVIGATION.find(nav => nav.name === 'Dashboard')!.icon!, {className: "mr-2 h-4 w-4"})}
                        <span>Dashboard</span>
                     </DropdownMenuItem>
                   </Link>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 hover:!text-red-600 focus:!text-red-600 focus:!bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Unauthenticated user view (when isClient is true)
  return (
    <div className={mainDivClassName}> {/* mainDivClassName will be "flex items-center gap-2" */}
      <Sheet open={isCartSidebarOpen} onOpenChange={setIsCartSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {itemCount}
            </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[350px] sm:w-[400px] p-0 flex flex-col" side="right">
          <CartSidebar onClose={() => setIsCartSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      
      <Link href="/login" passHref className="hidden md:inline-flex">
        <Button variant="ghost" type="button">
          <UserCircle className="mr-2 h-4 w-4" /> Login
        </Button>
      </Link>
      <Link href="/sell" passHref className="hidden md:inline-flex">
        <Button variant="outline" type="button">
          <DollarSign className="mr-2 h-4 w-4" /> Sell Your Item
        </Button>
      </Link>
      <Link href="/login" passHref className="md:hidden">
        <Button variant="ghost" size="icon" type="button">
            <UserCircle className="h-5 w-5" />
            <span className="sr-only">Login</span>
        </Button>
     </Link>
    </div>
  );
}
