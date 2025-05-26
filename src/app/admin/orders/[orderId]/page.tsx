
"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import type { Order, Product as ProductType, User as UserType, ShippingAddress, CartItem, OrderStatus, WithdrawalMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/order-status-badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowLeft, UserCircle, MapPin, CalendarDays, ShoppingBag, Briefcase, Home, Loader2, CreditCard, Smartphone, Banknote, Save, Truck } from 'lucide-react';
import { ORDER_STATUSES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [order, setOrder] = useState<EnrichedOrder | null | undefined>(undefined); 
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);

  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      setTimeout(() => {
        const foundOrder = MOCK_ORDERS.find(o => o.id === orderId);
        if (foundOrder) {
          const enrichedItems = foundOrder.items.map(item => {
            const productDetails = MOCK_PRODUCTS.find(p => p.id === item.id);
            const sellerDetails = productDetails ? MOCK_USERS.find(u => u.id === productDetails.sellerId) : undefined;
            return { ...item, productDetails, sellerDetails };
          });
          setOrder({ ...foundOrder, items: enrichedItems });
          setSelectedStatus(foundOrder.status);
        } else {
          setOrder(null); 
        }
        setIsLoading(false);
      }, 500);
    }
  }, [orderId]);

  const uniqueSellers = useMemo(() => {
    if (!order) return [];
    const sellerMap = new Map<string, UserType>();
    order.items.forEach(item => {
      if (item.sellerDetails && !sellerMap.has(item.sellerDetails.id)) {
        sellerMap.set(item.sellerDetails.id, item.sellerDetails);
      }
    });
    return Array.from(sellerMap.values());
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setIsUpdatingStatus(true);
    await new Promise(resolve => setTimeout(resolve, 700)); 

    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].status = selectedStatus;
      MOCK_ORDERS[orderIndex].updatedAt = new Date();
    }

    setOrder(prevOrder => prevOrder ? { ...prevOrder, status: selectedStatus!, updatedAt: new Date() } : null);
    toast({ title: "Order Status Updated", description: `Order #${orderId} status changed to ${selectedStatus}.` });
    setIsUpdatingStatus(false);
  };


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
  const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Details: #{order.id}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-6 w-6 text-primary" /> Order Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <span className="text-muted-foreground mr-2">Current Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 flex-grow">
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-10">
                 <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                 {ORDER_STATUSES.map(statusOpt => (
                  <SelectItem key={statusOpt.value} value={statusOpt.value}>{statusOpt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={isUpdatingStatus || selectedStatus === order.status}
            >
              {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Status
            </Button>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <Separator className="my-3"/>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Subtotal:</span>
                <span className="font-medium">${itemsSubtotal.toFixed(2)}</span>
              </div>
              {order.deliveryChargeAmount !== undefined && order.deliveryChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Truck className="h-4 w-4"/>Delivery Charge:</span>
                  <span className="font-medium">${order.deliveryChargeAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Order Total:</span>
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
      </div>

      {uniqueSellers.map(seller => (
        <Card key={seller.id}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" /> Seller: {seller.name}</CardTitle>
                <CardDescription>ID: {seller.id} &bull; Email: {seller.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium flex items-center gap-1 mb-1"><Home className="h-4 w-4 text-muted-foreground"/> Shipping Address:</h4>
                    <address className="text-sm text-muted-foreground not-italic pl-5">
                        {formatFullAddress(seller.defaultShippingAddress)}
                    </address>
                </div>
                <div>
                    <h4 className="font-medium flex items-center gap-1 mb-2"><CreditCard className="h-4 w-4 text-muted-foreground"/> Withdrawal Methods:</h4>
                    {seller.withdrawalMethods && seller.withdrawalMethods.length > 0 ? (
                        <div className="space-y-3 pl-5">
                        {seller.withdrawalMethods.map((method: WithdrawalMethod) => (
                            <div key={method.id} className="p-3 border rounded-md bg-muted/50 text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    {method.type === 'bkash' ? <Smartphone className="h-5 w-5 text-pink-500" /> : <Banknote className="h-5 w-5 text-blue-500" />}
                                    <span className="font-semibold capitalize">{method.type}</span>
                                    {method.isDefault && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Default</span>}
                                </div>
                                {method.type === 'bkash' && (
                                    <p>Account Number: {method.details.accountNumber}</p>
                                )}
                                {method.type === 'bank' && (
                                    <>
                                    <p>Bank: {method.details.bankName}</p>
                                    <p>Holder: {method.details.accountHolderName}</p>
                                    <p>Account No: {method.details.accountNumber}</p>
                                    {method.details.routingNumber && <p>Routing: {method.details.routingNumber}</p>}
                                    {method.details.branchName && <p>Branch: {method.details.branchName}</p>}
                                    </>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">Added: {format(new Date(method.createdAt), 'PP')}</p>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground pl-5">No withdrawal methods on file for this seller.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      ))}


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
                  <p className="font-medium text-sm">Seller: {item.sellerDetails.name} (ID: {item.sellerDetails.id})</p>
                </div>
              )}
               {!item.sellerDetails && item.productDetails?.sellerId && (
                 <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">Seller ID: {item.productDetails.sellerId} (Basic details not found)</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

