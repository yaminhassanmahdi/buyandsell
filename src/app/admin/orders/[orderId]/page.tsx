
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import type { Order, Product as ProductType, User as UserType, ShippingAddress, CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/order-status-badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowLeft, UserCircle, MapPin, CalendarDays, ShoppingBag, Briefcase, Home, Loader2 } from 'lucide-react';

interface EnrichedOrderItem extends CartItem {
  productDetails?: ProductType;
  sellerDetails?: UserType;
}

interface EnrichedOrder extends Omit<Order, 'items'> {
  items: EnrichedOrderItem[];
}

const formatFullAddress = (address: ShippingAddress | null | undefined): string => {
  if (!address) return "No address on file.";
  return `${address.houseAddress}${address.roadNumber ? `, ${address.roadNumber}` : ''}, ${address.thana}, ${address.district}, ${address.division}, ${address.country}${address.phoneNumber ? ` (Phone: ${address.phoneNumber})` : ''}`;
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<EnrichedOrder | null | undefined>(undefined); // undefined for loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
        if (foundOrder) {
          const enrichedItems = foundOrder.items.map(item => {
            const productDetails = MOCK_PRODUCTS.find(p => p.id === item.id);
            const sellerDetails = productDetails ? MOCK_USERS.find(u => u.id === productDetails.sellerId) : undefined;
            return { ...item, productDetails, sellerDetails };
          });
          setOrder({ ...foundOrder, items: enrichedItems });
        } else {
          setOrder(null); // Not found
        }
        setIsLoading(false);
      }, 500);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Order Not Found</h1>
        <p className="text-muted-foreground">The order with ID "{orderId}" could not be found.</p>
        <Button onClick={() => router.push('/admin/orders/manage')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manage Orders
        </Button>
      </div>
    );
  }

  const buyer = MOCK_USERS.find(u => u.id === order.userId);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Details: #{order.id}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Order Info & Buyer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date Placed:</span>
                <span className="font-medium">{format(new Date(order.createdAt), 'PPpp')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">{format(new Date(order.updatedAt), 'PPpp')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Amount:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary" /> Buyer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
              {buyer && <p><strong>Email:</strong> {buyer.email}</p>}
              <p><strong>User ID:</strong> {order.userId}</p>
              <div className="pt-2">
                <p className="font-medium flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground"/> Shipping Address:</p>
                <address className="text-sm text-muted-foreground not-italic pl-5">
                  {formatFullAddress(order.shippingAddress)}
                </address>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Item Details could go here if layout needs sidebar style, or keep all in one flow */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Items in Order ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.items.map((item, index) => (
            <div key={item.id + index} className="rounded-lg border p-4 hover:shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-md aspect-square object-cover sm:w-24 sm:h-24"
                  data-ai-hint={item.productDetails?.imageHint || "product photo"}
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Product ID: {item.id}</p>
                  <p className="text-sm">Quantity: {item.quantity}</p>
                  <p className="text-sm">Price per item: ${item.price.toFixed(2)}</p>
                  <p className="text-md font-semibold">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
              {item.sellerDetails && (
                <div className="mt-3 pt-3 border-t">
                  <p className="font-medium text-sm flex items-center gap-1 mb-1"><Briefcase className="h-4 w-4 text-muted-foreground"/> Seller: {item.sellerDetails.name} (ID: {item.sellerDetails.id})</p>
                  {item.sellerDetails.defaultShippingAddress ? (
                    <address className="text-xs text-muted-foreground not-italic pl-5 flex items-start gap-1">
                     <Home className="h-3 w-3 mt-0.5 shrink-0"/> {formatFullAddress(item.sellerDetails.defaultShippingAddress)}
                    </address>
                  ) : (
                    <p className="text-xs text-muted-foreground pl-5">Seller address not on file.</p>
                  )}
                </div>
              )}
              {!item.sellerDetails && item.productDetails?.sellerId && (
                 <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">Seller ID: {item.productDetails.sellerId} (Details not found)</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
