
import type { Category, Brand, OrderStatus, StaticDivision, StaticDistrict, StaticThana } from './types';
import { Smartphone, Laptop, Shirt, Armchair, BookOpen, Tag, Package, PackageCheck, PackageX, Truck, CheckCircle2, Hourglass, Handshake, LayoutDashboard, CheckSquare, ShoppingCart } from 'lucide-react';

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

// --- Static Address Data for Bangladesh ---
export const DIVISIONS_BD: StaticDivision[] = [
  { id: 'dhaka_div', name: 'Dhaka' },
  { id: 'chittagong_div', name: 'Chittagong' },
  { id: 'sylhet_div', name: 'Sylhet' },
  { id: 'rajshahi_div', name: 'Rajshahi' },
];

export const DISTRICTS_BD: StaticDistrict[] = [
  { id: 'dhaka_dist', name: 'Dhaka', divisionId: 'dhaka_div' },
  { id: 'gazipur_dist', name: 'Gazipur', divisionId: 'dhaka_div' },
  { id: 'narayanganj_dist', name: 'Narayanganj', divisionId: 'dhaka_div' },
  { id: 'chittagong_dist', name: 'Chittagong', divisionId: 'chittagong_div' },
  { id: 'coxsbazar_dist', name: 'Cox\'s Bazar', divisionId: 'chittagong_div' },
  { id: 'sylhet_sadar_dist', name: 'Sylhet Sadar', divisionId: 'sylhet_div' },
  { id: 'rajshahi_sadar_dist', name: 'Rajshahi Sadar', divisionId: 'rajshahi_div' },
];

export const THANAS_BD: StaticThana[] = [
  // Dhaka Division > Dhaka District
  { id: 'dhanmondi_thana', name: 'Dhanmondi', districtId: 'dhaka_dist' },
  { id: 'gulshan_thana', name: 'Gulshan', districtId: 'dhaka_dist' },
  { id: 'mirpur_thana', name: 'Mirpur', districtId: 'dhaka_dist' },
  // Dhaka Division > Gazipur District
  { id: 'gazipur_sadar_thana', name: 'Gazipur Sadar', districtId: 'gazipur_dist' },
  { id: 'kaliakair_thana', name: 'Kaliakair', districtId: 'gazipur_dist' },
  // Chittagong Division > Chittagong District
  { id: 'kotwali_ctg_thana', name: 'Kotwali (Chittagong)', districtId: 'chittagong_dist' },
  { id: 'pahartali_thana', name: 'Pahartali', districtId: 'chittagong_dist' },
  // Sylhet Division > Sylhet Sadar District
  { id: 'sylhet_sadar_thana', name: 'Sylhet Sadar Upazila', districtId: 'sylhet_sadar_dist' },
  // Rajshahi Division > Rajshahi Sadar District
  { id: 'boalia_thana', name: 'Boalia', districtId: 'rajshahi_sadar_dist' },
];
