
export type Category = {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
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
  category: Category;
  brand: Brand;
  sellerId: string;
  sellerName?: string; // Added for convenience
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Date;
};

export type CartItem = {
  id: string; // This will be product.id
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  phoneNumber?: string;
  country: string; // Will be fixed to "Bangladesh"
  division: string; // e.g., "Dhaka"
  district: string; // e.g., "Dhaka City"
  thana: string;    // e.g., "Gulshan"
  houseAddress: string;
  roadNumber?: string;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'accepted' | 'handed_over' | 'in_shipping';

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type WithdrawalMethodType = 'bkash' | 'bank';

export type BKashDetails = {
  accountNumber: string; // 11 digits
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
  // Other profile info can be added here
};

export type FilterValues = {
  category?: string;
  brand?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'date_newest' | 'date_oldest';
};

// Simplified types for static address data
export type StaticDivision = {
  id: string;
  name: string;
};

export type StaticDistrict = {
  id: string;
  name: string;
  divisionId: string; // To link to a StaticDivision
};

export type StaticThana = {
  id: string;
  name: string;
  districtId: string; // To link to a StaticDistrict
};

// API response types for Bangladeshi address components (no longer used in form, kept for reference if needed elsewhere)
export type Division = {
  _id: string;
  name: string;
};

export type District = {
  _id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
};

export type Upazilla = {
  _id: string;
  district_id: string;
  name: string;
  bn_name: string;
};

export type Union = {
  _id: string;
  upazilla_id: string; // Note: API might use 'upazila_id' (with one l)
  name: string;
  bn_name: string;
};
