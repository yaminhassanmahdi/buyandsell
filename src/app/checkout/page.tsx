
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { AddressForm } from '@/components/address-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ShippingAddress, Order } from '@/lib/types';
import { MOCK_ORDERS } from '@/lib/mock-data'; 
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const { currentUser, isAuthenticated, loading: authLoading, updateCurrentUserData } = useAuth();
  const { cartItems, getCartTotal, clearCart, itemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
    if (!authLoading && itemCount === 0) {
      router.push('/cart'); 
    }
  }, [isAuthenticated, authLoading, router, itemCount]);

  // Effect to set initial shipping address from profile or keep it null
  useEffect(() => {
    if (currentUser?.defaultShippingAddress) {
      setShippingAddress(currentUser.defaultShippingAddress);
    }
  }, [currentUser?.defaultShippingAddress]);


  const initialAddressFormData = (): Partial<ShippingAddress> => {
    if (currentUser?.defaultShippingAddress) {
      return currentUser.defaultShippingAddress;
    }
    return {};
  };


  const handleAddressSubmit = (data: ShippingAddress) => {
    setShippingAddress(data); // For the current order
    if (currentUser) {
      updateCurrentUserData({ defaultShippingAddress: data }); // Update user's default
    }
    toast({ title: "Address Confirmed", description: "Shipping address for this order has been confirmed." });
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !currentUser) {
        toast({
            title: "Shipping Address Required",
            description: "Please provide a shipping address to place your order.",
            variant: "destructive",
        });
        return;
    }
    setIsPlacingOrder(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newOrder: Order = {
      id: `order${MOCK_ORDERS.length + 1}`,
      userId: currentUser.id,
      items: cartItems.map(item => ({ ...item })), 
      totalAmount: getCartTotal(),
      shippingAddress: shippingAddress, 
      status: 'pending', 
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_ORDERS.push(newOrder); 
    
    clearCart();
    toast({
      title: "Order Placed Successfully!",
      description: `Your order #${newOrder.id} has been placed.`,
      variant: "default", 
    });
    router.push(`/account/orders?orderId=${newOrder.id}`);
    setIsPlacingOrder(false);
  };

  if (authLoading || (!authLoading && !isAuthenticated) || itemCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Shipping Address</CardTitle>
            <CardDescription>
              {shippingAddress ? "Confirm or update your shipping address." : "Enter your shipping details for Bangladesh."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressForm 
              onSubmit={handleAddressSubmit} 
              initialData={initialAddressFormData()} 
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Information</CardTitle>
            <CardDescription>This is a mock payment step.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/50 rounded-md text-center">
              <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="font-semibold">Mock Payment Gateway</p>
              <p className="text-sm text-muted-foreground">
                No actual payment will be processed. Click "Place Order" to simulate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded" data-ai-hint="product item" />
                  <div>
                    <p className="text-sm font-medium">{item.name} (x{item.quantity})</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between mt-4 pt-4 border-t">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handlePlaceOrder} 
              className="w-full" 
              size="lg"
              disabled={isPlacingOrder || cartItems.length === 0} // shippingAddress check is handled by handlePlaceOrder
            >
              {isPlacingOrder ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Place Order
            </Button>
          </CardFooter>
        </Card>
        {!shippingAddress && cartItems.length > 0 && (
          <p className="text-xs text-destructive text-center mt-2">Please complete your shipping address to proceed.</p>
        )}
      </div>
    </div>
  );
}
