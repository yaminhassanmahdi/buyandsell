
"use client";
import { useCart } from '@/contexts/cart-context';
import { CartItem } from '@/components/cart-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cartItems, getCartTotal, clearCart, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart /> Your Shopping Cart ({itemCount} item{itemCount > 1 ? 's' : ''})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
         {cartItems.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
              Clear Cart
            </Button>
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <Card className="shadow-lg sticky top-24"> {/* Sticky for summary */}
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span> {/* Placeholder */}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
