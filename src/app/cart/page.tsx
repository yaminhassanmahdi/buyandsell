
"use client";
import { useCart } from '@/contexts/cart-context';
import { CartItem } from '@/components/cart-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, Truck, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import useLocalStorage from '@/hooks/use-local-storage';
import type { DeliveryChargeSettings, ShippingAddress } from '@/lib/types';
import { DELIVERY_CHARGES_STORAGE_KEY, DEFAULT_DELIVERY_CHARGES } from '@/lib/constants';
import { MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CartPage() {
  const { cartItems, getCartTotal, clearCart, itemCount } = useCart();
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const [deliverySettings] = useLocalStorage<DeliveryChargeSettings>(
    DELIVERY_CHARGES_STORAGE_KEY,
    DEFAULT_DELIVERY_CHARGES
  );
  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null); // null for "calculating" or "not available"
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>("Calculating shipping...");

  useEffect(() => {
    if (authLoading) {
      setDeliveryMessage("Calculating shipping...");
      setDeliveryCharge(null);
      return;
    }

    if (!isAuthenticated) {
      setDeliveryMessage("Login to see shipping cost.");
      setDeliveryCharge(null);
      return;
    }

    if (!currentUser?.defaultShippingAddress) {
      setDeliveryMessage("Add shipping address in settings to see shipping cost.");
      setDeliveryCharge(null);
      return;
    }

    if (itemCount === 0) {
      setDeliveryMessage("Shipping calculated at checkout.");
      setDeliveryCharge(0);
      return;
    }

    // Calculate delivery charge
    const buyerAddress = currentUser.defaultShippingAddress;
    const firstCartItem = cartItems[0];
    const productDetails = MOCK_PRODUCTS.find(p => p.id === firstCartItem.id);

    if (!productDetails?.sellerId) {
      setDeliveryCharge(deliverySettings.interDistrict); // Fallback
      setDeliveryMessage(null); // Clear message as charge is set
      return;
    }

    const seller = MOCK_USERS.find(u => u.id === productDetails.sellerId);
    if (!seller?.defaultShippingAddress) {
      setDeliveryCharge(deliverySettings.interDistrict); // Fallback
      setDeliveryMessage(null);
      return;
    }
    
    const sellerAddress = seller.defaultShippingAddress;

    if (buyerAddress.thana === sellerAddress.thana && buyerAddress.district === sellerAddress.district) {
      setDeliveryCharge(deliverySettings.intraThana);
    } else if (buyerAddress.district === sellerAddress.district) {
      setDeliveryCharge(deliverySettings.intraDistrict);
    } else {
      setDeliveryCharge(deliverySettings.interDistrict);
    }
    setDeliveryMessage(null); // Clear message as charge is calculated

  }, [cartItems, currentUser, isAuthenticated, authLoading, deliverySettings, itemCount]);

  if (itemCount === 0 && !authLoading) { // Ensure not to show this while auth is still loading
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

  const subTotal = getCartTotal();
  const totalAmount = deliveryCharge !== null ? subTotal + deliveryCharge : subTotal;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <ShoppingCart /> Your Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
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
        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-muted-foreground"/>Shipping</span>
              {deliveryCharge !== null ? (
                <span>${deliveryCharge.toFixed(2)}</span>
              ) : (
                <span className="text-xs text-muted-foreground">{deliveryMessage || "Calculating..."}</span>
              )}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg" disabled={itemCount === 0 || deliveryCharge === null}>
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardFooter>
           {deliveryCharge === null && itemCount > 0 && (
             <p className="text-xs text-muted-foreground text-center pt-2">{deliveryMessage}</p>
           )}
        </Card>
      </div>
    </div>
  );
}
