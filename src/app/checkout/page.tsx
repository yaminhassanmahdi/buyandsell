
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { AddressForm } from '@/components/address-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ShippingAddress, Order, DeliveryChargeSettings, Product as ProductType, User as UserType } from '@/lib/types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data'; 
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, ShieldCheck, Edit3, Home, Truck } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { DELIVERY_CHARGES_STORAGE_KEY, DEFAULT_DELIVERY_CHARGES } from '@/lib/constants';

export default function CheckoutPage() {
  const { currentUser, isAuthenticated, loading: authLoading, updateCurrentUserData } = useAuth();
  const { cartItems, getCartTotal, clearCart, itemCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  
  const [orderShippingAddress, setOrderShippingAddress] = useState<ShippingAddress | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);

  const [deliverySettings] = useLocalStorage<DeliveryChargeSettings>(
    DELIVERY_CHARGES_STORAGE_KEY,
    DEFAULT_DELIVERY_CHARGES
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (!authLoading && itemCount === 0) {
      router.push('/cart'); 
      return;
    }

    if (currentUser) {
      if (currentUser.defaultShippingAddress) {
        setOrderShippingAddress(currentUser.defaultShippingAddress);
        setIsEditingAddress(false);
      } else {
        setIsEditingAddress(true);
      }
    }
  }, [isAuthenticated, authLoading, router, itemCount, currentUser]);

  useEffect(() => {
    if (!orderShippingAddress || cartItems.length === 0 || !deliverySettings) {
      setDeliveryCharge(0); // Default to 0 if no address, no items, or no settings
      return;
    }

    const firstItem = cartItems[0];
    const product = MOCK_PRODUCTS.find(p => p.id === firstItem.id);
    if (!product || !product.sellerId) {
      setDeliveryCharge(deliverySettings.interDistrict); // Fallback if seller not found
      return;
    }

    const seller = MOCK_USERS.find(u => u.id === product.sellerId);
    if (!seller || !seller.defaultShippingAddress) {
      setDeliveryCharge(deliverySettings.interDistrict); // Fallback if seller or address not found
      return;
    }

    const buyerAddr = orderShippingAddress;
    const sellerAddr = seller.defaultShippingAddress;

    if (buyerAddr.thana === sellerAddr.thana && buyerAddr.district === sellerAddr.district) {
      setDeliveryCharge(deliverySettings.intraThana);
    } else if (buyerAddr.district === sellerAddr.district) {
      setDeliveryCharge(deliverySettings.intraDistrict);
    } else {
      setDeliveryCharge(deliverySettings.interDistrict);
    }
  }, [cartItems, orderShippingAddress, deliverySettings]);


  const initialAddressFormData = (): Partial<ShippingAddress> => {
    if (currentUser?.defaultShippingAddress) {
      return currentUser.defaultShippingAddress;
    }
    return {};
  };

  const handleAddressSubmit = (data: ShippingAddress) => {
    setOrderShippingAddress(data);
    if (currentUser) {
      updateCurrentUserData({ defaultShippingAddress: data });
    }
    toast({ title: "Address Confirmed", description: "Shipping address for this order has been updated." });
    setIsEditingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!orderShippingAddress || !currentUser) {
        toast({
            title: "Shipping Address Required",
            description: "Please provide and confirm a shipping address to place your order.",
            variant: "destructive",
        });
        return;
    }
    setIsPlacingOrder(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const itemsSubtotal = getCartTotal();
    const finalTotalAmount = itemsSubtotal + deliveryCharge;

    const newOrder: Order = {
      id: `order${MOCK_ORDERS.length + 1}`,
      userId: currentUser.id,
      items: cartItems.map(item => ({ ...item })), 
      totalAmount: finalTotalAmount,
      deliveryChargeAmount: deliveryCharge,
      shippingAddress: orderShippingAddress, 
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

  if (authLoading || (!authLoading && !isAuthenticated) || (itemCount === 0 && !isPlacingOrder)) { // Allow viewing page briefly during order placement
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const itemsSubtotal = getCartTotal();
  const finalTotalAmount = itemsSubtotal + deliveryCharge;

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Shipping Address</CardTitle>
             {!isEditingAddress && orderShippingAddress && (
                <CardDescription>
                    Your order will be shipped to the address below.
                </CardDescription>
             )}
             {isEditingAddress && (
                <CardDescription>
                 {orderShippingAddress ? "Update your shipping address." : "Enter your shipping details for Bangladesh."}
                </CardDescription>
             )}
          </CardHeader>
          <CardContent>
            {isEditingAddress ? (
              <AddressForm 
                onSubmit={handleAddressSubmit} 
                initialData={initialAddressFormData()} 
              />
            ) : orderShippingAddress ? (
              <div className="space-y-3">
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-semibold flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> {orderShippingAddress.fullName}</p>
                    <address className="text-sm text-muted-foreground not-italic pl-7 space-y-0.5">
                        <p>{orderShippingAddress.houseAddress}{orderShippingAddress.roadNumber ? `, ${orderShippingAddress.roadNumber}` : ''}</p>
                        <p>{orderShippingAddress.thana}, {orderShippingAddress.district}</p>
                        <p>{orderShippingAddress.division}, {orderShippingAddress.country}</p>
                        {orderShippingAddress.phoneNumber && <p>Phone: {orderShippingAddress.phoneNumber}</p>}
                    </address>
                </div>
                <Button variant="outline" onClick={() => setIsEditingAddress(true)} className="w-full sm:w-auto">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Address
                </Button>
              </div>
            ) : (
                 <p className="text-muted-foreground">Please add a shipping address.</p>
            )}
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
            <div className="mt-4 pt-4 border-t space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-muted-foreground"/>Shipping</span>
                    <span>
                        {deliveryCharge > 0 ? `$${deliveryCharge.toFixed(2)}` : (cartItems.length > 0 ? 'Calculating...' : 'N/A')}
                    </span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>${finalTotalAmount.toFixed(2)}</span>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handlePlaceOrder} 
              className="w-full" 
              size="lg"
              disabled={isPlacingOrder || cartItems.length === 0 || !orderShippingAddress}
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
        {!orderShippingAddress && cartItems.length > 0 && (
          <p className="text-xs text-destructive text-center mt-2">Please complete and confirm your shipping address to proceed.</p>
        )}
      </div>
    </div>
  );
}
