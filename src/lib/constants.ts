
import type { OrderStatus, Division, District, Thana, Category, CommissionSetting, AdminNavItem, BusinessSettings, HeroBannerSlide, CustomPage, ShippingMethod, Currency } from './types';
import {
  Smartphone, Laptop, Shirt, Armchair, BookOpen, Tag,
  Package as PackageIcon,
  PackageCheck, PackageX, Truck, CheckCircle2, Hourglass,
  Handshake as HandshakeIcon,
  LayoutDashboard, CheckSquare, ShoppingCart, Users,
  ListChecks, FolderTree, Tags as TagsIcon, Settings2 as SettingsIcon,
  Globe, Library, MapPin, Home, DollarSign, Briefcase, Edit, Trash2, CreditCard, PieChart, FileText, TrendingUp, Percent, ImageIcon, FileType, Ship, Landmark, ListFilter, Banknote
} from 'lucide-react';

export let APP_NAME = '2ndhandbajar.com';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'electronics gadget' },
  { id: 'fashion', name: 'Fashion', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'fashion clothing' },
  { id: 'home-garden', name: 'Home & Garden', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'home decor' },
  { id: 'books', name: 'Books', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'books literature' },
  { id: 'others', name: 'Others', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'various items' },
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
  { name: 'My Orders', href: '/account/orders', icon: ShoppingCart },
  { name: 'My Products', href: '/account/my-products', icon: Briefcase },
  { name: 'My Earnings', href: '/account/my-earnings', icon: TrendingUp },
  { name: 'Account Settings', href: '/account/settings', icon: SettingsIcon },
];

export const DEFAULT_DIVISIONS: Division[] = [
  { id: 'barisal', name: 'Barisal' },
  { id: 'chittagong', name: 'Chittagong' },
  { id: 'dhaka', name: 'Dhaka' },
  { id: 'khulna', name: 'Khulna' },
  { id: 'mymensingh', name: 'Mymensingh' },
  { id: 'rajshahi', name: 'Rajshahi' },
  { id: 'rangpur', name: 'Rangpur' },
  { id: 'sylhet', name: 'Sylhet' },
];

export const DEFAULT_DISTRICTS: District[] = [
  // Dhaka Division
  { id: 'dhaka_dist', name: 'Dhaka', divisionId: 'dhaka' },
  { id: 'faridpur', name: 'Faridpur', divisionId: 'dhaka' },
  { id: 'gazipur', name: 'Gazipur', divisionId: 'dhaka' },
  { id: 'gopalganj', name: 'Gopalganj', divisionId: 'dhaka' },
  { id: 'kishoreganj', name: 'Kishoreganj', divisionId: 'dhaka' },
  { id: 'madaripur', name: 'Madaripur', divisionId: 'dhaka' },
  { id: 'manikganj', name: 'Manikganj', divisionId: 'dhaka' },
  { id: 'munshiganj', name: 'Munshiganj', divisionId: 'dhaka' },
  { id: 'narayanganj', name: 'Narayanganj', divisionId: 'dhaka' },
  { id: 'narsingdi', name: 'Narsingdi', divisionId: 'dhaka' },
  { id: 'rajbari', name: 'Rajbari', divisionId: 'dhaka' },
  { id: 'shariatpur', name: 'Shariatpur', divisionId: 'dhaka' },
  { id: 'tangail', name: 'Tangail', divisionId: 'dhaka' },
  // Chittagong Division
  { id: 'bandarban', name: 'Bandarban', divisionId: 'chittagong' },
  { id: 'brahmanbaria', name: 'Brahmanbaria', divisionId: 'chittagong' },
  { id: 'chandpur', name: 'Chandpur', divisionId: 'chittagong' },
  { id: 'chittagong_dist', name: 'Chittagong', divisionId: 'chittagong' },
  { id: 'comilla', name: 'Comilla', divisionId: 'chittagong' },
  { id: 'coxs_bazar', name: 'Cox\'s Bazar', divisionId: 'chittagong' },
  { id: 'feni', name: 'Feni', divisionId: 'chittagong' },
  { id: 'khagrachhari', name: 'Khagrachhari', divisionId: 'chittagong' },
  { id: 'lakshmipur', name: 'Lakshmipur', divisionId: 'chittagong' },
  { id: 'noakhali', name: 'Noakhali', divisionId: 'chittagong' },
  { id: 'rangamati', name: 'Rangamati', divisionId: 'chittagong' },
  // Rajshahi Division
  { id: 'bogra', name: 'Bogra', divisionId: 'rajshahi' },
  { id: 'joypurhat', name: 'Joypurhat', divisionId: 'rajshahi' },
  { id: 'naogaon', name: 'Naogaon', divisionId: 'rajshahi' },
  { id: 'natore', name: 'Natore', divisionId: 'rajshahi' },
  { id: 'nawabganj_raj', name: 'Nawabganj', divisionId: 'rajshahi' },
  { id: 'pabna', name: 'Pabna', divisionId: 'rajshahi' },
  { id: 'rajshahi_dist', name: 'Rajshahi', divisionId: 'rajshahi' },
  { id: 'sirajganj', name: 'Sirajganj', divisionId: 'rajshahi' },
  // Khulna Division
  { id: 'bagerhat', name: 'Bagerhat', divisionId: 'khulna' },
  { id: 'chuadanga', name: 'Chuadanga', divisionId: 'khulna' },
  { id: 'jessore', name: 'Jessore', divisionId: 'khulna' },
  { id: 'jhenaidah', name: 'Jhenaidah', divisionId: 'khulna' },
  { id: 'khulna_dist', name: 'Khulna', divisionId: 'khulna' },
  { id: 'kushtia', name: 'Kushtia', divisionId: 'khulna' },
  { id: 'magura', name: 'Magura', divisionId: 'khulna' },
  { id: 'meherpur', name: 'Meherpur', divisionId: 'khulna' },
  { id: 'narail', name: 'Narail', divisionId: 'khulna' },
  { id: 'satkhira', name: 'Satkhira', divisionId: 'khulna' },
  // Barisal Division
  { id: 'barguna', name: 'Barguna', divisionId: 'barisal' },
  { id: 'barisal_dist', name: 'Barisal', divisionId: 'barisal' },
  { id: 'bhola', name: 'Bhola', divisionId: 'barisal' },
  { id: 'jhalokati', name: 'Jhalokati', divisionId: 'barisal' },
  { id: 'patuakhali', name: 'Patuakhali', divisionId: 'barisal' },
  { id: 'pirojpur', name: 'Pirojpur', divisionId: 'barisal' },
  // Sylhet Division
  { id: 'habiganj', name: 'Habiganj', divisionId: 'sylhet' },
  { id: 'moulvibazar', name: 'Moulvibazar', divisionId: 'sylhet' },
  { id: 'sunamganj', name: 'Sunamganj', divisionId: 'sylhet' },
  { id: 'sylhet_dist', name: 'Sylhet', divisionId: 'sylhet' },
  // Rangpur Division
  { id: 'dinajpur', name: 'Dinajpur', divisionId: 'rangpur' },
  { id: 'gaibandha', name: 'Gaibandha', divisionId: 'rangpur' },
  { id: 'kurigram', name: 'Kurigram', divisionId: 'rangpur' },
  { id: 'lalmonirhat', name: 'Lalmonirhat', divisionId: 'rangpur' },
  { id: 'nilphamari', name: 'Nilphamari', divisionId: 'rangpur' },
  { id: 'panchagarh', name: 'Panchagarh', divisionId: 'rangpur' },
  { id: 'rangpur_dist', name: 'Rangpur', divisionId: 'rangpur' },
  { id: 'thakurgaon', name: 'Thakurgaon', divisionId: 'rangpur' },
  // Mymensingh Division
  { id: 'jamalpur', name: 'Jamalpur', divisionId: 'mymensingh' },
  { id: 'mymensingh_dist', name: 'Mymensingh', divisionId: 'mymensingh' },
  { id: 'netrokona', name: 'Netrokona', divisionId: 'mymensingh' },
  { id: 'sherpur', name: 'Sherpur', divisionId: 'mymensingh' },
];

export const DEFAULT_UPAZILLAS: Thana[] = [ // Renaming to UPAZILLAS for clarity, type is Thana
  // Dhaka District Upazillas
  { id: 'dhaka_city_north_upazilla', name: 'Dhaka City Corporation (North)', districtId: 'dhaka_dist' },
  { id: 'dhaka_city_south_upazilla', name: 'Dhaka City Corporation (South)', districtId: 'dhaka_dist' },
  { id: 'savar_upazilla', name: 'Savar Upazila', districtId: 'dhaka_dist' },
  { id: 'keraniganj_upazilla', name: 'Keraniganj Upazila', districtId: 'dhaka_dist' },
  { id: 'dhamrai_upazilla', name: 'Dhamrai Upazila', districtId: 'dhaka_dist' },
  { id: 'dohar_upazilla', name: 'Dohar Upazila', districtId: 'dhaka_dist' },
  { id: 'nawabganj_dhaka_upazilla', name: 'Nawabganj Upazila (Dhaka)', districtId: 'dhaka_dist' },
  // Gazipur District Upazillas
  { id: 'gazipur_sadar_upazilla', name: 'Gazipur Sadar Upazila', districtId: 'gazipur' },
  { id: 'kaliakair_upazilla', name: 'Kaliakair Upazila', districtId: 'gazipur' },
  { id: 'kapasia_upazilla', name: 'Kapasia Upazila', districtId: 'gazipur' },
  { id: 'sreepur_upazilla', name: 'Sreepur Upazila', districtId: 'gazipur' },
  { id: 'kaliganj_gazipur_upazilla', name: 'Kaliganj Upazila (Gazipur)', districtId: 'gazipur' },
  // Chittagong District Upazillas
  { id: 'chittagong_sadar_upazilla', name: 'Chittagong Sadar Upazila', districtId: 'chittagong_dist' }, // Example, actual may vary
  { id: 'sitakunda_upazilla', name: 'Sitakunda Upazila', districtId: 'chittagong_dist' },
  { id: 'mirsharai_upazilla', name: 'Mirsharai Upazila', districtId: 'chittagong_dist' },
  { id: 'patiya_upazilla', name: 'Patiya Upazila', districtId: 'chittagong_dist' },
  // Add more representative upazillas for other districts as needed for demonstration
  { id: 'sylhet_sadar_upazilla', name: 'Sylhet Sadar Upazila', districtId: 'sylhet_dist' },
  { id: 'rajshahi_sadar_upazilla', name: 'Rajshahi Sadar Upazila (Boalia)', districtId: 'rajshahi_dist' },
  { id: 'khulna_sadar_upazilla', name: 'Khulna Sadar Upazila', districtId: 'khulna_dist' },
  { id: 'barisal_sadar_upazilla', name: 'Barisal Sadar Upazila', districtId: 'barisal_dist' },
  { id: 'rangpur_sadar_upazilla', name: 'Rangpur Sadar Upazila', districtId: 'rangpur_dist' },
  { id: 'mymensingh_sadar_upazilla', name: 'Mymensingh Sadar Upazila', districtId: 'mymensingh_dist' },
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
      { name: 'Manage Attribute Types', href: '/admin/products/attributes', icon: ListFilter },
      { name: 'Manage Attribute Values', href: '/admin/products/attribute-values', icon: TagsIcon },
      { name: 'Manage Brands (Legacy)', href: '/admin/products/brands', icon: TagsIcon },
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
      { name: 'Upazillas', href: '/admin/locations/upazillas', icon: Home }, // Renamed
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
      { name: 'Cash in Hand', href: '/admin/financials/cash-in-hand', icon: Banknote },
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
  { name: 'Manage Users', href: '/admin/users', icon: Users },
];


export const getStatusIcon = (status: OrderStatus) => {
  const statusObj = ORDER_STATUSES.find(s => s.value === status);
  return statusObj?.icon;
};

// Storage Keys
export const DELIVERY_CHARGES_STORAGE_KEY = 'deliveryChargeSettings';
export const COMMISSION_SETTINGS_STORAGE_KEY = 'commissionSettings';
export const BUSINESS_SETTINGS_STORAGE_KEY = 'businessSettings';
export const HERO_BANNERS_STORAGE_KEY = 'heroBannerSlides';
export const CUSTOM_PAGES_STORAGE_KEY = 'customPages';
export const SHIPPING_METHODS_STORAGE_KEY = 'shippingMethods';
export const CATEGORY_ATTRIBUTES_TYPES_STORAGE_KEY = 'categoryAttributeTypes';
export const CATEGORY_ATTRIBUTE_VALUES_STORAGE_KEY = 'categoryAttributeValues';
// Removed DIVISIONS_STORAGE_KEY, DISTRICTS_STORAGE_KEY, THANAS_STORAGE_KEY


// Default Values for Settings
export const DEFAULT_DELIVERY_CHARGES: DeliveryChargeSettings = {
  intraThana: 70, // Intra Upazilla
  intraDistrict: 110,
  interDistrict: 130,
};

export const DEFAULT_COMMISSION_SETTINGS: CommissionSetting[] = [];

export const DEFAULT_CURRENCIES: Currency[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  appName: '2ndhandbajar.com',
  logoUrl: '/logo-placeholder.png',
  primaryColor: '47 92% 52%', // Example: Tailwind orange-500
  secondaryColor: '77 30% 60%', // Example: A complementary green
  faviconUrl: '/favicon.ico',
  availableCurrencies: DEFAULT_CURRENCIES,
  defaultCurrencyCode: 'BDT',
};

export const DEFAULT_HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    id: 'slide1',
    imageUrl: 'https://placehold.co/1200x400.png',
    imageHint: 'promotional banner electronics',
    title: 'Latest Gadgets on Sale!',
    description: 'Discover amazing deals on smartphones, laptops, and more.',
    buttonText: 'Shop Electronics',
    buttonLink: '/category/electronics',
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
    buttonLink: '/category/fashion',
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
    buttonLink: '/category/home-garden',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    isActive: false,
  },
];

export const MOCK_CUSTOM_PAGES: CustomPage[] = [
  {
    id: 'page-privacy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '## Our Privacy Policy\n\nThis is a placeholder for the privacy policy content. Please replace this with your actual policy.\n\nWe collect information to provide better services to all our users.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'page-terms',
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    content: '## Terms and Conditions\n\nWelcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use...',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

export const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard-delivery', name: 'Standard Delivery' },
  { id: 'express-delivery', name: 'Express Delivery (Next Day)' },
];
