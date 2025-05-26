
export type Category = {
  id: string;
  name: string;
  // icon field removed for dynamic management simplicity
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
  categoryId: string; // ID of the parent category
  subCategoryId?: string; // Optional ID of the sub-category
  brandId: string; // ID of the brand
  sellerId: string;
  sellerName?: string;
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

// Simplified types for static address data (used in constants.ts for address form)
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
