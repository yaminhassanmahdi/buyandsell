
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
import { useAuth } from '@/contexts/auth-context';
import { USER_NAVIGATION, ADMIN_NAVIGATION } from '@/lib/constants';
import { ShoppingCart, UserCircle, LogIn, LogOut, UserPlus, CreditCard } from 'lucide-react'; // Added CreditCard for sell
import { useCart } from '@/contexts/cart-context';

export function UserNav() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/cart" passHref>
          <Button variant="ghost" size="icon" aria-label="Shopping Cart">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {itemCount}
              </span>
            )}
          </Button>
        </Link>
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
                    {item.name === "My Orders" && <ShoppingCart className="mr-2 h-4 w-4" />}
                     {item.name === "Account Settings" && <UserCircle className="mr-2 h-4 w-4" />}
                    <span>{item.name}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
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
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
       <Link href="/cart" passHref>
          <Button variant="ghost" size="icon" aria-label="Shopping Cart">
            <ShoppingCart className="h-5 w-5" />
             {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {itemCount}
              </span>
            )}
          </Button>
        </Link>
      <Link href="/login" passHref>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Button>
      </Link>
      <Link href="/register" passHref>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Register
        </Button>
      </Link>
    </div>
  );
}
