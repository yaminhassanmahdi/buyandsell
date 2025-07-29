"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Star, Package, ShoppingBag, TrendingUp, Calendar, MapPin, User as UserIcon, Store, History } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Product, User, Order, BusinessSettings } from '@/lib/types';
import { format } from 'date-fns';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';
import { ProductCard } from '@/components/product-card';
import { OrderListItem } from '@/components/order-list-item';

interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  memberSince: string;
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.sellerId as string;

  const [user, setUser] = useState<User | null>(null);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [buyingHistory, setBuyingHistory] = useState<Order[]>([]);
  const [sellingHistory, setSellingHistory] = useState<Order[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerLocation, setSellerLocation] = useState<string>('');

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch seller details
        const sellerData = await apiClient.getUser(sellerId);
        setUser(sellerData);

        // Set seller location (Division, District, Upazilla only)
        if (sellerData.defaultShippingAddress) {
          const { division, district, upazilla } = sellerData.defaultShippingAddress;
          setSellerLocation(`${upazilla}, ${district}, ${division}`);
        }

        // Fetch seller's products
        const productsData = await apiClient.getProducts({ sellerId });
        const allProducts = productsData as Product[];
        
        // Only show active products (not sold out)
        const active = allProducts.filter(p => p.status === 'approved' && p.stock > 0);
        
        setActiveProducts(active);

        // Fetch user's buying history (orders they placed)
        const buyingHistoryData = await apiClient.getOrders({ 
          userId: sellerId,
          limit: 20 
        });
        setBuyingHistory(buyingHistoryData);

        // Fetch user's selling history (orders for their products)
        const sellingHistoryData = await apiClient.getOrders({ 
          sellerId: sellerId,
          limit: 20 
        });
        setSellingHistory(sellingHistoryData);

        // Calculate stats
        const deliveredOrders = sellingHistoryData.filter(order => order.status === 'delivered' && order.paymentStatus === 'paid');
        const totalSales = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const soldProducts = allProducts.filter(p => p.stock === 0).length;
        
        const statsData: SellerStats = {
          totalProducts: allProducts.length,
          activeProducts: active.length,
          soldProducts: soldProducts,
          totalSales,
          averageRating: 4.5, // Mock data - you can implement real rating system
          totalReviews: 12, // Mock data
          memberSince: sellerData.createdAt || new Date().toISOString()
        };
        
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Seller Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">We couldn't find the seller you're looking for.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalSales = sellingHistory
    .filter(order => order.status === 'delivered' && order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const totalPurchases = buyingHistory
    .filter(order => order.status === 'delivered' && order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* User Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{sellerLocation || 'Location not available'}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {format(new Date(user.createdAt || new Date()), 'MMMM yyyy')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeProducts.length}</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.soldProducts || 0}</div>
              <div className="text-sm text-muted-foreground">Items Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currencySymbol}{totalSales.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currencySymbol}{totalPurchases.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Purchases</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="active-listings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active-listings" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Active Listings
          </TabsTrigger>
          <TabsTrigger value="buying-history" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="selling-history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Sales History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active-listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Product Listings</CardTitle>
              <CardDescription>Products currently available for sale</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active listings</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeProducts.map(product => (
                    <div key={product.id} className="w-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buying-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Orders placed as a buyer</CardDescription>
            </CardHeader>
            <CardContent>
              {buyingHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No purchase history</p>
              ) : (
                <div className="space-y-4">
                  {buyingHistory.map(order => (
                    <OrderListItem key={order.id} order={order} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selling-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>Orders received for your products</CardDescription>
            </CardHeader>
            <CardContent>
              {sellingHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sales history</p>
              ) : (
                <div className="space-y-4">
                  {sellingHistory.map(order => (
                    <div key={order.id} className="relative">
                      <OrderListItem order={order} />
                      <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                        Sale
                      </Badge>
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
