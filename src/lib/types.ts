
export type Category = {
  id: string;
  name: string;
};

export type SubCategory = {
  id: string;
  name: string;
  parentCategoryId: string;
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
  status: 'pending' | 'approved' | 'rejected' | 'sold'; // 'sold' implies delivered for earnings
  createdAt: Date;
};

export type CartItem = {
  id: string; 
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  // For per-seller delivery charge calculation
  sellerId?: string; 
};

export type ShippingAddress = {
  fullName: string;
  phoneNumber?: string;
  country: string; 
  division: string; 
  district: string; 
  thana: string;    
  houseAddress: string;
  roadNumber?: string;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'accepted' | 'handed_over' | 'in_shipping';

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number; 
  deliveryChargeAmount?: number; 
  shippingAddress: ShippingAddress;
  status: OrderStatus;
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

// New types for Withdrawal Requests
export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected';

export type WithdrawalRequest = {
  id: string;
  userId: string; 
  userName: string; 
  amount: number;
  withdrawalMethodId: string; 
  withdrawalMethodType: WithdrawalMethodType; 
  withdrawalMethodDetails: string; // e.g., "bKash: ****1234" or "Bank ABC: ****5678"
  status: WithdrawalRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  adminNote?: string;
};
