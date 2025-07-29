"use client";
import type { Order, BusinessSettings } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { OrderStatusBadge } from './order-status-badge';
import { CreditCard, CalendarDays, Package } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS } from '@/lib/constants';

interface OrderListItemProps {
  order: Order;
}

export function OrderListItem({ order }: OrderListItemProps) {
  const [settings] = useLocalStorage<BusinessSettings>(BUSINESS_SETTINGS_STORAGE_KEY, DEFAULT_BUSINESS_SETTINGS);
  const activeCurrency = settings?.availableCurrencies?.find(c => c.code === settings?.defaultCurrencyCode) || 
    settings?.availableCurrencies?.[0] || 
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' };
  const currencySymbol = activeCurrency.symbol;

  return (
    <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Order #{order.id}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
             <CalendarDays className="mr-1.5 h-4 w-4" /> Placed on: {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : 'Date not available'}
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {order.items.slice(0, 3).map(item => ( 
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={60}
                height={60}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="product item"
              />
              <div className="flex-grow">
                <p className="font-medium text-sm">{item.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity || 0}</p>
                  <p className="text-sm font-semibold">{currencySymbol}{(item.price || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-muted/30">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">+ {order.items.length - 3} more item(s)</p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">Shipping to: {order.shippingAddress.fullName}</p>
            <p className="text-xs text-muted-foreground">{order.shippingAddress.displayAddress}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Order Status: <span className="font-medium text-foreground">{order.status}</span>
        </div>
        <div className="flex items-center font-semibold text-lg">
            <CreditCard className="mr-2 h-5 w-5 text-primary" /> Total: {currencySymbol}{(order.totalAmount || 0).toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
}
