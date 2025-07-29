import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/lib/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const };
      case 'processing':
        return { label: 'Processing', variant: 'default' as const };
      case 'shipped':
        return { label: 'Shipped', variant: 'default' as const };
      case 'delivered':
        return { label: 'Delivered', variant: 'default' as const };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'destructive' as const };
      case 'refunded':
        return { label: 'Refunded', variant: 'destructive' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
