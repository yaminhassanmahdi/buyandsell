
"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_USERS } from '@/lib/mock-data';
import type { Order, OrderStatus, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Settings2, Loader2, SearchX, Filter, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ORDER_STATUSES } from '@/lib/constants';

export default function AdminManageOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const sortedOrders = [...MOCK_ORDERS].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      setIsLoading(false);
    }, 500);
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
    setFilteredOrders(tempOrders);
  }, [searchTerm, statusFilter, allOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrderId(orderId);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
    
    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      MOCK_ORDERS[orderIndex].status = newStatus;
      MOCK_ORDERS[orderIndex].updatedAt = new Date();
    }

    setAllOrders(prevOrders => 
        prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        )
    );
    toast({ title: "Order Status Updated", description: `Order #${orderId} status changed to ${newStatus}.` });
    setProcessingOrderId(null);
  };

  const handleEditOrder = (orderId: string) => {
    // Placeholder for edit functionality
    toast({ title: "Edit Action", description: `Edit order #${orderId} (Not implemented).` });
    console.log("Edit order:", orderId);
  };

  const handleDeleteOrder = (orderId: string) => {
    // Placeholder for delete functionality - in a real app, show confirmation
    // MOCK_ORDERS = MOCK_ORDERS.filter(o => o.id !== orderId); // This would mutate import
    setAllOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
    toast({ title: "Order Deleted", description: `Order #${orderId} has been removed (mock).`, variant: "destructive" });
    console.log("Delete order:", orderId);
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
        <Button onClick={() => toast({ title: "Add New Order", description: "Functionality not implemented yet."})}>
          Add New Order
        </Button>
      </div>

      <div className="p-4 border rounded-lg bg-card shadow space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-grow">
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
            <SelectTrigger className="w-full md:w-[180px] h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map(status => (
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
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => {
                const buyer = MOCK_USERS.find(u => u.id === order.userId);
                const firstItem = order.items[0];
                const itemsSummary = firstItem 
                  ? `${firstItem.quantity} x ${firstItem.name}${order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ''}`
                  : `${order.items.length} items`;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                        {order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{buyer?.name || order.shippingAddress.fullName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{itemsSummary}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select 
                        value={order.status} 
                        onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as OrderStatus)}
                        disabled={processingOrderId === order.id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[130px]">
                           <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                           {ORDER_STATUSES.map(status => (
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
                          <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
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
    </div>
  );
}
