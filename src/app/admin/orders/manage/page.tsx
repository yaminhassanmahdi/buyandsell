"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Order, OrderStatus, User, PaymentStatus, BusinessSettings } from '@/lib/types'; 
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Settings2, Loader2, SearchX, Filter, Edit, Trash2, MoreHorizontal, Eye, CreditCard } from 'lucide-react'; 
import { format } from 'date-fns';
import { ORDER_STATUSES, PAYMENT_STATUSES, BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants'; 
import { Badge } from '@/components/ui/badge'; 
import useLocalStorage from '@/hooks/use-local-storage';
import { apiClient } from '@/lib/api-client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditOrderData {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingMethodName?: string;
  adminNote?: string;
}

export default function AdminManageOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all'); 

  // Edit order dialog state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState<EditOrderData>({
    status: 'pending',
    paymentStatus: 'unpaid',
    shippingMethodName: '',
    adminNote: ''
  });

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await apiClient.getOrders();
      const sortedOrders = orders.sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let tempOrders = [...allOrders];
    if (searchTerm) {
      tempOrders = tempOrders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      tempOrders = tempOrders.filter(order => order.status === statusFilter);
    }
    if (paymentStatusFilter !== 'all') { 
      tempOrders = tempOrders.filter(order => order.paymentStatus === paymentStatusFilter);
    }
    setFilteredOrders(tempOrders);
  }, [searchTerm, statusFilter, paymentStatusFilter, allOrders]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    try {
      await apiClient.updateOrder(orderId, { status: newStatus });
      setAllOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        )
      );
      toast({ title: "Order Status Updated", description: `Order #${orderId} status changed to ${newStatus}.` });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOrderId(null);
    }
  };
  
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setProcessingOrderId(orderId);
    try {
      await apiClient.updateOrder(orderId, { paymentStatus: newPaymentStatus });
      setAllOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, paymentStatus: newPaymentStatus, updatedAt: new Date() } : order
        )
      );
      toast({ title: "Payment Status Updated", description: `Order #${orderId} payment status changed to ${newPaymentStatus}.` });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditFormData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingMethodName: order.shippingMethodName || '',
      adminNote: ''
    });
  };

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return;
    
    setProcessingOrderId(editingOrder.id);
    try {
      await apiClient.updateOrder(editingOrder.id, editFormData);
      setAllOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === editingOrder.id ? { 
            ...order, 
            ...editFormData,
            updatedAt: new Date() 
          } : order
        )
      );
      toast({ 
        title: "Order Updated", 
        description: `Order #${editingOrder.id} has been updated successfully.` 
      });
      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteOrder(orderId);
      setAllOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
      toast({ 
        title: "Order Deleted", 
        description: `Order #${orderId} has been deleted successfully.`, 
        variant: "destructive" 
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive"
      });
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary"/>
          Manage All Orders
        </h1>
      </div>

      <div className="p-4 border rounded-lg bg-card shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="flex-grow md:col-span-1">
          <Input
            placeholder="Search by Order ID, User ID, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Filter by order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Statuses</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <Select value={paymentStatusFilter} onValueChange={(value) => setPaymentStatusFilter(value as PaymentStatus | 'all')}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Filter by payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              {PAYMENT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Alert>
          <SearchX className="h-5 w-5" />
          <AlertTitle>No Orders Found</AlertTitle>
          <AlertDescription>
            There are no orders matching your current filters, or no orders have been placed yet.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => {
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                        {order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'Date not available'}</TableCell>
                    <TableCell>{order.shippingAddress.fullName}</TableCell>
                    <TableCell>{currencySymbol}{(parseFloat(order.totalAmount) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleUpdateOrderStatus(order.id, newStatus as OrderStatus)}
                        disabled={processingOrderId === order.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[130px]">
                           <SelectValue placeholder="Order Status" />
                        </SelectTrigger>
                        <SelectContent>
                           {ORDER_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                       <Select
                        value={order.paymentStatus}
                        onValueChange={(newPaymentStatus) => handleUpdatePaymentStatus(order.id, newPaymentStatus as PaymentStatus)}
                        disabled={processingOrderId === order.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[110px]">
                           <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                           {PAYMENT_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={processingOrderId === order.id}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Order Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogTitle className="sr-only">Order Dialog</DialogTitle>
          <DialogHeader>
            <DialogTitle>Edit Order #{editingOrder?.id}</DialogTitle>
            <DialogDescription>
              Update order details and status. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-status" className="text-right">
                Order Status
              </Label>
              <Select 
                value={editFormData.status}
                onValueChange={(value: OrderStatus) => setEditFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-status" className="text-right">
                Payment Status
              </Label>
              <Select 
                value={editFormData.paymentStatus}
                onValueChange={(value: PaymentStatus) => setEditFormData(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shipping-method" className="text-right">
                Shipping Method
              </Label>
              <Input
                id="shipping-method"
                value={editFormData.shippingMethodName || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, shippingMethodName: e.target.value }))}
                className="col-span-3"
                placeholder="Enter shipping method..."
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="admin-note" className="text-right pt-2">
                Admin Note
              </Label>
              <Textarea
                id="admin-note"
                value={editFormData.adminNote || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, adminNote: e.target.value }))}
                className="col-span-3"
                placeholder="Add any admin notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrderEdit} disabled={processingOrderId === editingOrder?.id}>
              {processingOrderId === editingOrder?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
