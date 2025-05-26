
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
  divisionId: string;
  divisionName: string;
  districtId: string;
  districtName: string;
  upazillaId: string;
  upazillaName: string;
  unionId: string;
  unionName: string;
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

export type User = {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
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

// API response types for Bangladeshi address components
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
