
export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  imageHint?: string;
};

export type SubCategory = {
  id: string;
  name: string;
  parentCategoryId: string;
  imageUrl?: string;
  imageHint?: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint?: string;
  categoryId: string;
  subCategoryId?: string;
  brandId: string;
  sellerId: string;
  sellerName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Date;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sellerId?: string;
};

export type ShippingAddress = {
  fullName: string;
  phoneNumber?: string;
  country: string; // Default to Bangladesh
  division: string;
  district: string;
  thana: string;
  houseAddress: string;
  roadNumber?: string;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'accepted' | 'handed_over' | 'in_shipping';
export type PaymentStatus = 'paid' | 'unpaid';

export type ShippingMethod = {
  id: string;
  name: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryChargeAmount?: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  platformCommission?: number;
  selectedShippingMethodId?: string;
  shippingMethodName?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WithdrawalMethodType = 'bkash' | 'bank';

export type BKashDetails = {
  accountNumber: string;
};

export type BankDetails = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  branchName?: string;
};

export type WithdrawalMethod = {
  id: string;
  type: WithdrawalMethodType;
  details: BKashDetails | BankDetails;
  isDefault?: boolean;
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  defaultShippingAddress?: ShippingAddress | null;
  withdrawalMethods?: WithdrawalMethod[];
};

export type FilterValues = {
  category?: string;
  brand?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'date_newest' | 'date_oldest';
};

export type StaticDivision = {
  id: string;
  name: string;
};

export type StaticDistrict = {
  id: string;
  name: string;
  divisionId: string;
};

export type StaticThana = {
  id: string;
  name: string;
  districtId: string;
};

export interface DeliveryChargeSettings {
  intraThana: number;
  intraDistrict: number;
  interDistrict: number;
}

export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected';

export type WithdrawalRequest = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  withdrawalMethodId: string;
  withdrawalMethodType: WithdrawalMethodType;
  withdrawalMethodDetails: string;
  status: WithdrawalRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  adminNote?: string;
};

export type CommissionSetting = {
  categoryId: string;
  percentage: number;
};

export type AdminNavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: AdminNavItem[];
};

export type Currency = {
  code: string; // e.g., "BDT", "USD"
  symbol: string; // e.g., "৳", "$"
  name: string; // e.g., "Bangladeshi Taka", "US Dollar"
};

export type BusinessSettings = {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  faviconUrl?: string;
  appName?: string;
  availableCurrencies: Currency[];
  defaultCurrencyCode: string;
};

export type HeroBannerSlide = {
  id: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string;
  textColor?: string;
  isActive: boolean;
};

export type CustomPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};
