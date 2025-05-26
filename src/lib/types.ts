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
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
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
