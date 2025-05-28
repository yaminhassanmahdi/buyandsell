
export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  imageHint?: string;
};

export type SubCategory = {
  id:string;
  name: string;
  parentCategoryId: string;
  imageUrl?: string;
  imageHint?: string;
};

export type CategoryAttributeType = {
  id: string;
  categoryId: string; // Links to parent Category.id
  name: string; // e.g., "Author", "Color", "Material"
};

export type CategoryAttributeValue = {
  id: string;
  attributeTypeId: string; // Links to CategoryAttributeType.id
  value: string; // e.g., "Mr. Rahim", "Red", "Cotton"
  imageUrl?: string;
  imageHint?: string;
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
  selectedAttributes?: Array<{
    attributeTypeId: string;
    attributeValueId: string;
  }>;
  sellerId: string;
  sellerName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Date;
  stock: number;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sellerId?: string; // To identify the seller of the item in cart
  stock?: number; // To check against available stock when adding to cart
};

export type Division = {
  id: string;
  name: string;
};

export type District = {
  id: string;
  name: string;
  divisionId: string;
};

export type Thana = { // Also used as Upazilla
  id: string;
  name: string;
  districtId: string;
};

export type ShippingAddress = {
  fullName: string;
  phoneNumber?: string;
  country: string; // Will default to "Bangladesh"
  division: string; // Name of the division
  district: string; // Name of the district
  thana: string;    // Name of the thana/upazilla
  houseAddress: string;
  roadNumber?: string;
};

export type SortByType =
  | 'date_desc'
  | 'date_asc'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc';

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

export type AdminNavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: AdminNavItem[];
};

export type Currency = {
  code: string; // e.g., BDT, USD
  symbol: string; // e.g., ৳, $
  name: string; // e.g., Bangladeshi Taka, US Dollar
};

export type BusinessSettings = {
  logoUrl?: string;
  primaryColor?: string; // HSL format e.g., "217 91% 60%" or HEX e.g., "#FFFFFF"
  secondaryColor?: string; // HSL format e.g., "216 34% 90%" or HEX
  faviconUrl?: string;
  appName?: string;
  availableCurrencies: Currency[];
  defaultCurrencyCode: string; // Code of the default currency
};

export type HeroBannerSlide = {
  id: string;
  imageUrl: string;
  imageHint: string; // For AI image search if needed
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string; // Tailwind background class e.g. bg-blue-600
  textColor?: string; // Tailwind text color class e.g. text-white
  isActive: boolean;
};

export type CustomPage = {
  id: string;
  slug: string;
  title: string;
  content: string; // Could be Markdown or HTML
  createdAt: Date;
  updatedAt: Date;
};


export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected';

export type WithdrawalRequest = {
  id: string;
  userId: string;
  userName: string; // Seller's name
  amount: number;
  withdrawalMethodId: string;
  withdrawalMethodType: WithdrawalMethodType;
  withdrawalMethodDetails: string; // Summary like "bKash: ****1234" or Bank Name + Acc ****5678
  status: WithdrawalRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  adminNote?: string;
};


export type DeliveryChargeSettings = {
  intraThana: number;    // Seller and buyer in same Thana/Upazilla
  intraDistrict: number; // Seller and buyer in same District, different Thana/Upazilla
  interDistrict: number; // Seller and buyer in different Districts
};
