"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { Order, Product, User, BusinessSettings } from '@/lib/types';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { format } from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingProducts: number;
  approvedProducts: number;
  totalCommission: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard stats from API
        const dashboardResponse = await fetch('/api/admin/dashboard');
        const dashboardData = await dashboardResponse.json();
        setStats(dashboardData);

        // Fetch recent data
        const [ordersData, productsData, usersData] = await Promise.all([
          apiClient.getOrders({ limit: 10 }),
          apiClient.getProducts({ limit: 10 }),
          apiClient.getUsers({ limit: 10 })
        ]);

        setRecentOrders(ordersData);
        setRecentProducts(productsData);
        setRecentUsers(usersData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Error Loading Dashboard</h1>
        <p className="text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Last updated: {format(new Date(), 'PPp')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {stats.deliveredOrders} delivered
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1 text-yellow-500" />
              {stats.pendingProducts} pending approval
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Commission: {currencySymbol}{stats.totalCommission.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            <Button asChild className="mt-4 w-full">
              <Link href="/admin/orders/manage">View Pending Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pending Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.pendingProducts}</div>
            <Button asChild className="mt-4 w-full">
              <Link href="/admin/products">Approve Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Cash in Hand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {currencySymbol}{stats.totalCommission.toFixed(2)}
            </div>
            <Button asChild className="mt-4 w-full">
              <Link href="/admin/financials/cash-in-hand">View Financials</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Recent Products</TabsTrigger>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Orders</CardTitle>
              <CardDescription>Most recent order activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress?.fullName} • {currencySymbol}{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'PPp')}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Products</CardTitle>
              <CardDescription>Recently submitted products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sellerName} • {currencySymbol}{product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(product.createdAt), 'PPp')}
                      </p>
                    </div>
                    <Badge variant={
                      product.status === 'approved' ? 'default' : 
                      product.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Users</CardTitle>
              <CardDescription>Recently registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Phone: {user.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                    <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
