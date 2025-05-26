
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet'; // SheetClose for the X button
import { useCart } from '@/contexts/cart-context';
import { CartItem as CartItemComponent } from './cart-item'; // Renamed import to avoid conflict
import { ShoppingCart, X as CloseIcon } from 'lucide-react';
import React from 'react';

interface CartSidebarProps {
  onClose: () => void; // Callback to close the sidebar, passed from UserNav
}

export function CartSidebar({ onClose }: CartSidebarProps) {
  const { cartItems, getCartTotal, itemCount } = useCart();
  const subTotal = getCartTotal();

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Shopping Cart
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cart sidebar">
              <CloseIcon className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>

      {itemCount === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mb-4">Looks like you haven't added anything yet.</p>
          <SheetClose asChild>
            <Button asChild onClick={onClose}>
              <Link href="/">Start Shopping</Link>
            </Button>
          </SheetClose>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {cartItems.map(item => (
                // Assuming CartItemComponent handles its own border/separator if needed
                // Or we can add <Separator /> between items here if CartItemComponent doesn't.
                // For now, relying on CartItemComponent's internal structure.
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t bg-background">
            <div className="w-full space-y-3">
              <div className="flex justify-between text-md font-medium">
                <span>Subtotal</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <SheetClose asChild>
                <Button asChild size="lg" className="w-full" onClick={onClose}>
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </>
      )}
    </>
  );
}
