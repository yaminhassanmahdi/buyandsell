
import type { OrderStatus, StaticDivision, StaticDistrict, StaticThana, Category, Brand, DeliveryChargeSettings, CommissionSetting, AdminNavItem, BusinessSettings, HeroBannerSlide, CustomPage, ShippingMethod } from './types';
import {
  Smartphone, Laptop, Shirt, Armchair, BookOpen, Tag,
  Package as PackageIcon,
  PackageCheck, PackageX, Truck, CheckCircle2, Hourglass,
  Handshake as HandshakeIcon,
  LayoutDashboard, CheckSquare, ShoppingCart, Users as UsersIcon,
  ListChecks, FolderTree, Tags as TagsIcon, Settings2 as SettingsIcon, // Renamed Settings2 to SettingsIcon for clarity
  Globe, Library, MapPin, Home, DollarSign, Briefcase, Edit, Trash2, CreditCard, PieChart, FileText, TrendingUp, Percent, Image as ImageIcon, FileType, Ship
} from 'lucide-react';

export let APP_NAME = '2ndhandbajar.com'; // Made it mutable

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home-garden', name: 'Home & Garden' },
  { id: 'books', name: 'Books' },
  { id: 'others', name: 'Others' },
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'nike', name: 'Nike' },
  { id: 'ikea', name: 'IKEA' },
  { id: 'generic', name: 'Generic' },
];

export const ORDER_STATUSES: { value: OrderStatus; label: string, icon?: React.ComponentType<{className?: string}> }[] = [
  { value: 'pending', label: 'Pending', icon: Hourglass },
  { value: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { value: 'handed_over', label: 'Handed Over', icon: HandshakeIcon },
  { value: 'in_shipping', label: 'In Shipping', icon: Truck },
  { value: 'processing', label: 'Processing', icon: PackageIcon },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: PackageCheck },
  { value: 'cancelled', label: 'Cancelled', icon: PackageX },
];

export const PAYMENT_STATUSES: {value: 'paid' | 'unpaid', label: string}[] = [
    {value: 'paid', label: 'Paid'},
    {value: 'unpaid', label: 'Unpaid'},
];

export const SITE_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Sell Product', href: '/sell', authRequired: true },
];

export const USER_NAVIGATION = [
  { name: 'My Orders', href: '/account/orders' },
  { name: 'My Products', href: '/account/my-products', icon: Briefcase },
  { name: 'My Earnings', href: '/account/my-earnings', icon: TrendingUp },
  { name: 'Account Settings', href: '/account/settings', icon: SettingsIcon },
];

export const ADMIN_NAVIGATION: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Approve Products', href: '/admin/products', icon: CheckSquare },
  {
    name: 'Products',
    href: '/admin/products/manage',
    icon: PackageIcon,
    subItems: [
      { name: 'Manage Products', href: '/admin/products/manage', icon: ListChecks },
      { name: 'Manage Categories', href: '/admin/products/categories', icon: FolderTree },
      { name: 'Manage Sub-Categories', href: '/admin/products/sub-categories', icon: FolderTree },
      { name: 'Manage Brands', href: '/admin/products/brands', icon: TagsIcon },
    ]
  },
  {
    name: 'Orders',
    href: '/admin/orders/manage',
    icon: ShoppingCart,
    subItems: [
      { name: 'Manage Orders', href: '/admin/orders/manage', icon: SettingsIcon },
      { name: 'Processing Orders', href: '/admin/orders/processing', icon: PackageIcon },
      { name: 'Delivered Orders', href: '/admin/orders/delivered', icon: PackageCheck },
      { name: 'Cancelled Orders', href: '/admin/orders/cancelled', icon: PackageX },
    ]
  },
  {
    name: 'Location',
    href: '/admin/locations/countries',
    icon: MapPin,
    subItems: [
      { name: 'Countries', href: '/admin/locations/countries', icon: Globe },
      { name: 'Divisions', href: '/admin/locations/divisions', icon: Library },
      { name: 'Districts', href: '/admin/locations/districts', icon: MapPin },
      { name: 'Thanas/Upazillas', href: '/admin/locations/thanas', icon: Home },
      { name: 'Delivery Charges', href: '/admin/locations/delivery-charges', icon: DollarSign },
      { name: 'Shipping Methods', href: '/admin/locations/shipping-methods', icon: Ship },
    ]
  },
  {
    name: 'Financials',
    href: '/admin/financials/withdrawal-requests',
    icon: PieChart,
    subItems: [
      { name: 'Withdrawal Requests', href: '/admin/financials/withdrawal-requests', icon: CreditCard },
      { name: 'Commissions', href: '/admin/financials/commissions', icon: Percent },
    ]
  },
  {
    name: 'General Settings',
    href: '/admin/settings/business',
    icon: SettingsIcon,
    subItems: [
      { name: 'Business Settings', href: '/admin/settings/business', icon: Briefcase },
      { name: 'Banners (Sliders)', href: '/admin/settings/banners', icon: ImageIcon },
      { name: 'Custom Pages', href: '/admin/settings/custom-pages', icon: FileType },
    ]
  },
  { name: 'Manage Users', href: '/admin/users', icon: UsersIcon },
];


export const getStatusIcon = (status: OrderStatus) => {
  const statusObj = ORDER_STATUSES.find(s => s.value === status);
  return statusObj?.icon;
};

export const DIVISIONS_BD: StaticDivision[] = [
  { id: 'dhaka_div', name: 'Dhaka' },
  { id: 'chittagong_div', name: 'Chittagong' },
  { id: 'sylhet_div', name: 'Sylhet' },
  { id: 'rajshahi_div', name: 'Rajshahi' },
  { id: 'khulna_div', name: 'Khulna' },
  { id: 'barisal_div', name: 'Barisal' },
  { id: 'rangpur_div', name: 'Rangpur' },
  { id: 'mymensingh_div', name: 'Mymensingh' },
];

export const DISTRICTS_BD: StaticDistrict[] = [
  { id: 'dhaka_dist', name: 'Dhaka', divisionId: 'dhaka_div' },
  { id: 'gazipur_dist', name: 'Gazipur', divisionId: 'dhaka_div' },
  { id: 'narayanganj_dist', name: 'Narayanganj', divisionId: 'dhaka_div' },
  { id: 'tangail_dist', name: 'Tangail', divisionId: 'dhaka_div' },
  { id: 'kishoreganj_dist', name: 'Kishoreganj', divisionId: 'dhaka_div' },
  { id: 'chittagong_dist', name: 'Chittagong', divisionId: 'chittagong_div' },
  { id: 'coxsbazar_dist', name: 'Cox\'s Bazar', divisionId: 'chittagong_div' },
  { id: 'comilla_dist', name: 'Comilla', divisionId: 'chittagong_div' },
  { id: 'feni_dist', name: 'Feni', divisionId: 'chittagong_div' },
  { id: 'sylhet_sadar_dist', name: 'Sylhet Sadar', divisionId: 'sylhet_div' },
  { id: 'moulvibazar_dist', name: 'Moulvibazar', divisionId: 'sylhet_div' },
  { id: 'habiganj_dist', name: 'Habiganj', divisionId: 'sylhet_div' },
  { id: 'rajshahi_sadar_dist', name: 'Rajshahi Sadar', divisionId: 'rajshahi_div' },
  { id: 'bogra_dist', name: 'Bogra', divisionId: 'rajshahi_div' },
  { id: 'pabna_dist', name: 'Pabna', divisionId: 'rajshahi_div' },
];

export const THANAS_BD: StaticThana[] = [
  { id: 'dhanmondi_thana', name: 'Dhanmondi', districtId: 'dhaka_dist' },
  { id: 'gulshan_thana', name: 'Gulshan', districtId: 'dhaka_dist' },
  { id: 'mirpur_thana', name: 'Mirpur', districtId: 'dhaka_dist' },
  { id: 'mohammadpur_thana', name: 'Mohammadpur', districtId: 'dhaka_dist' },
  { id: 'uttara_thana', name: 'Uttara', districtId: 'dhaka_dist' },
  { id: 'gazipur_sadar_thana', name: 'Gazipur Sadar', districtId: 'gazipur_dist' },
  { id: 'kaliakair_thana', name: 'Kaliakair', districtId: 'gazipur_dist' },
  { id: 'kapasia_thana', name: 'Kapasia', districtId: 'gazipur_dist' },
  { id: 'kotwali_ctg_thana', name: 'Kotwali (Chittagong)', districtId: 'chittagong_dist' },
  { id: 'pahartali_thana', name: 'Pahartali', districtId: 'chittagong_dist' },
  { id: 'panchlaish_thana', name: 'Panchlaish', districtId: 'chittagong_dist' },
  { id: 'sylhet_sadar_thana', name: 'Sylhet Sadar Upazila', districtId: 'sylhet_sadar_dist' },
  { id: 'south_surma_thana', name: 'South Surma', districtId: 'sylhet_sadar_dist' },
  { id: 'boalia_thana', name: 'Boalia', districtId: 'rajshahi_sadar_dist' },
  { id: 'motihar_thana', name: 'Motihar', districtId: 'rajshahi_sadar_dist' },
];

export const DEFAULT_DELIVERY_CHARGES: DeliveryChargeSettings = {
  intraThana: 70,
  intraDistrict: 110,
  interDistrict: 130,
};
export const DELIVERY_CHARGES_STORAGE_KEY = 'deliveryChargeSettings';

export const COMMISSION_SETTINGS_STORAGE_KEY = 'commissionSettings';
export const DEFAULT_COMMISSION_SETTINGS: CommissionSetting[] = [];

// New constants for General Settings
export const BUSINESS_SETTINGS_STORAGE_KEY = 'businessSettings';
export const HERO_BANNERS_STORAGE_KEY = 'heroBannerSlides';
export const CUSTOM_PAGES_STORAGE_KEY = 'customPages';
export const SHIPPING_METHODS_STORAGE_KEY = 'shippingMethods';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  appName: '2ndhandbajar.com',
  logoUrl: '/logo-placeholder.png', // Default path to a placeholder logo
  primaryColor: '217 91% 60%', // HSL for --primary
  secondaryColor: '216 34% 90%', // HSL for --secondary
  faviconUrl: '/favicon.ico',
};

export const DEFAULT_HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    id: 'slide1',
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'promotional banner electronics',
    title: 'Latest Gadgets on Sale!',
    description: 'Discover amazing deals on smartphones, laptops, and more.',
    buttonText: 'Shop Electronics',
    buttonLink: '/?category=electronics',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'slide2',
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'fashion sale banner',
    title: 'Trendy Fashion Finds',
    description: 'Upgrade your wardrobe with the latest styles.',
    buttonText: 'Explore Fashion',
    buttonLink: '/?category=fashion',
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    isActive: true,
  },
  {
    id: 'slide3',
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'home decor banner',
    title: 'Home Decor Specials',
    description: 'Beautify your space with unique second-hand treasures.',
    buttonText: 'View Home Goods',
    buttonLink: '/?category=home-garden',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    isActive: false, // Example of an inactive slide
  },
];

export const MOCK_CUSTOM_PAGES: CustomPage[] = [ // Added MOCK_CUSTOM_PAGES export for consistency, though it's also used in mock-data.ts
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '## Our Privacy Policy\n\nThis is a placeholder for the privacy policy content. Please replace this with your actual policy.\n\nWe collect information to provide better services to all our users.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Approx 30 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),  // Approx 5 days ago
  },
  {
    id: 'page-terms',
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    content: '## Terms and Conditions\n\nWelcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use...',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Approx 30 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Approx 10 days ago
  },
];

export const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard-delivery', name: 'Standard Delivery' },
  { id: 'express-delivery', name: 'Express Delivery (Next Day)' },
];
