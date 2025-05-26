import type { Category, Brand, OrderStatus } from './types';
import { Smartphone, Laptop, Shirt, Armchair, BookOpen, Tag, Package, PackageCheck, PackageX, Truck, CheckCircle2, Hourglass, Handshake } from 'lucide-react';

export const APP_NAME = '2ndhandbajar.com';

export const CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'home-garden', name: 'Home & Garden', icon: Armchair },
  { id: 'books', name: 'Books', icon: BookOpen },
  { id: 'others', name: 'Others', icon: Tag },
];

export const BRANDS: Brand[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'nike', name: 'Nike' },
  { id: 'ikea', name: 'IKEA' },
  { id: 'generic', name: 'Generic' },
];

export const ORDER_STATUSES: { value: OrderStatus; label: string, icon?: React.ComponentType<{className?: string}> }[] = [
  { value: 'pending', label: 'Pending', icon: Hourglass },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { value: 'handed_over', label: 'Handed Over', icon: Handshake },
  { value: 'in_shipping', label: 'In Shipping', icon: Truck },
  { value: 'processing', label: 'Processing', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: PackageCheck },
  { value: 'cancelled', label: 'Cancelled', icon: PackageX },
];

export const SITE_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Sell Product', href: '/sell', authRequired: true },
];

export const USER_NAVIGATION = [
  { name: 'My Orders', href: '/account/orders' },
  { name: 'Account Settings', href: '/account/settings' }, // Example, not implemented
];

export const ADMIN_NAVIGATION = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Approve Products', href: '/admin/products', icon: CheckSquare },
  { name: 'Manage Orders', href: '/admin/orders', icon: ShoppingCart },
];

// Helper function to get an icon for a status
export const getStatusIcon = (status: OrderStatus) => {
  const statusObj = ORDER_STATUSES.find(s => s.value === status);
  return statusObj?.icon;
};

// Icons for admin navigation (import if not already imported)
import { LayoutDashboard, CheckSquare, ShoppingCart } from 'lucide-react';
