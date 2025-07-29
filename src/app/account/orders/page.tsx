"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Order } from '@/lib/types';
import { OrderListItem } from '@/components/order-list-item';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, ListOrdered, ShoppingBag, Store, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

function AccountOrdersPageInner() {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [myOrders, setMyOrders] = useState<Order[]>([]); // Orders placed by the user
  const [mySales, setMySales] = useState<Order[]>([]); // Orders received by the user as seller
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-orders");

  const fetchOrdersData = async () => {
    if (!currentUser) return;
    setPageLoading(true);
    try {
      // Fetch orders placed by the user (as buyer) and orders where user is seller
      const [ordersPlacedByUser, ordersReceivedBySeller] = await Promise.all([
        apiClient.getOrders({ userId: currentUser.id }),
        apiClient.getOrders({ sellerId: currentUser.id })
      ]);
      
      setMyOrders(ordersPlacedByUser.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setMySales(ordersReceivedBySeller.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/account/orders');
        return;
      }
      if (currentUser) {
        fetchOrdersData();
      }
    }
  }, [isAuthenticated, authLoading, router, currentUser]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ListOrdered className="h-8 w-8 text-primary"/>
          My Orders
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ordered by Me ({myOrders.length})
          </TabsTrigger>
          <TabsTrigger value="my-sales" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            My Sales ({mySales.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders I Placed
              </CardTitle>
              <CardDescription>
                Track your purchases and order status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myOrders.length === 0 ? (
                <Alert>
                  <ShoppingBag className="h-5 w-5" />
                  <AlertTitle>No Orders Yet!</AlertTitle>
                  <AlertDescription>
                    You haven&apos;t placed any orders yet. Start shopping to see your orders here.
                    <Button asChild className="mt-4 block w-max">
                      <Link href="/">Browse Products</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {myOrders.map(order => (
                    <OrderListItem key={order.id} order={order} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Orders from Customers
              </CardTitle>
              <CardDescription>
                Manage orders for your products and track sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mySales.length === 0 ? (
                <Alert>
                  <Store className="h-5 w-5" />
                  <AlertTitle>No Sales Yet!</AlertTitle>
                  <AlertDescription>
                    You haven&apos;t received any orders for your products yet. 
                    <Button asChild className="mt-4 block w-max">
                      <Link href="/sell">List Your Products</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  {mySales.map(order => (
                    <div key={order.id} className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          You&apos;re the seller
                        </span>
                      </div>
                      <OrderListItem order={order} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountOrdersPageInner />
    </Suspense>
  );
}
