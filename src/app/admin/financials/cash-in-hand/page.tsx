"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { BusinessSettings } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

interface CashInHandData {
  totalCommissionEarned: number;
  totalWithdrawalsPaid: number;
  currentCashInHand: number;
  deliveredOrdersCount: number;
  totalOrderValue: number;
}

export default function AdminCashInHandPage() {
  const [cashData, setCashData] = useState<CashInHandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  useEffect(() => {
    const fetchCashInHandData = async () => {
      setIsLoading(true);
      try {
        // Get all delivered and paid orders
        const deliveredOrders = await apiClient.getOrders({ 
          status: 'delivered',
          paymentStatus: 'paid',
          limit: 1000 
        });

        let totalCommissionEarned = 0;
        let totalOrderValue = 0;

        // Calculate total commission from all delivered orders
        for (const order of deliveredOrders) {
          totalOrderValue += order.totalAmount;
          
          for (const item of order.items) {
            const itemTotal = item.price * item.quantity;
            // Use commission percentage from product or default to 5%
            const commissionPercentage = 5; // This should come from the product data
            const commissionAmount = itemTotal * (commissionPercentage / 100);
            totalCommissionEarned += commissionAmount;
          }
        }

        // Get total approved withdrawals
        const withdrawalResponse = await fetch('/api/withdrawal-requests?status=approved');
        let totalWithdrawalsPaid = 0;
        
        if (withdrawalResponse.ok) {
          const withdrawals = await withdrawalResponse.json();
          totalWithdrawalsPaid = withdrawals.reduce((sum: number, withdrawal: any) => 
            sum + parseFloat(withdrawal.amount), 0
          );
        }

        // Calculate current cash in hand
        const currentCashInHand = totalCommissionEarned - totalWithdrawalsPaid;

        setCashData({
          totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
          totalWithdrawalsPaid: parseFloat(totalWithdrawalsPaid.toFixed(2)),
          currentCashInHand: parseFloat(currentCashInHand.toFixed(2)),
          deliveredOrdersCount: deliveredOrders.length,
          totalOrderValue: parseFloat(totalOrderValue.toFixed(2))
        });

      } catch (error) {
        console.error('Error fetching cash in hand data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashInHandData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!cashData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold">Error Loading Data</h1>
        <p className="text-muted-foreground">Unable to load cash in hand information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-primary"/>
        Cash in Hand
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Cash in Hand</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currencySymbol}{cashData.currentCashInHand.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available platform funds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{cashData.totalCommissionEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {cashData.deliveredOrdersCount} delivered orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals Paid</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currencySymbol}{cashData.totalWithdrawalsPaid.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Paid to sellers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{cashData.totalOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gross sales processed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Summary</CardTitle>
          <CardDescription>Platform financial overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Commission Rate:</span>
            <span className="font-medium">5% (average)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Commission Efficiency:</span>
            <span className="font-medium">
              {cashData.totalOrderValue > 0 
                ? ((cashData.totalCommissionEarned / cashData.totalOrderValue) * 100).toFixed(2)
                : 0}%
            </span>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-muted-foreground">Net Platform Earnings:</span>
            <span className="font-bold text-lg text-green-600">
              {currencySymbol}{cashData.currentCashInHand.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
