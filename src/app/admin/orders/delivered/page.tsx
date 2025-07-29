"use client";
import { useEffect, useState } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { OrderManagementCard } from '@/components/admin/order-management-card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PackageCheck, Loader2, SearchX } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function AdminDeliveredOrdersPage() {
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      setIsLoading(true);
      try {
        const orders = await apiClient.getOrders({ status: 'delivered' });
        setDeliveredOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error('Error fetching delivered orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch delivered orders.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveredOrders();
  }, [toast]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    try {
      await apiClient.updateOrder(orderId, { status: newStatus });
      
      // Update local state
      setDeliveredOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        ).filter(order => newStatus === 'delivered' ? true : order.id !== orderId)
      );

      toast({ title: "Order Status Updated", description: `Order #${orderId} status changed to ${newStatus}.` });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <PackageCheck className="h-8 w-8 text-primary"/>
        Delivered Orders
      </h1>

      {deliveredOrders.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>No Delivered Orders</AlertTitle>
          <AlertDescription>
            There are currently no orders in "delivered" status.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deliveredOrders.map(order => (
            <OrderManagementCard 
              key={order.id} 
              order={order} 
              onUpdateStatus={handleUpdateStatus}
              isProcessing={processingOrderId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
