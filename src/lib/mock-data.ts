
import type { Product, User, Order, ShippingAddress, Category, SubCategory, Brand, WithdrawalRequest, PaymentStatus, HeroBannerSlide, CustomPage } from './types';
import { INITIAL_CATEGORIES, INITIAL_BRANDS, MOCK_CUSTOM_PAGES as DEFAULT_CUSTOM_PAGES } from './constants';

const createPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export let MOCK_CATEGORIES: Category[] = INITIAL_CATEGORIES.map(cat => ({
  id: cat.id,
  name: cat.name,
  imageUrl: cat.imageUrl,
  imageHint: cat.imageHint,
}));

export let MOCK_SUBCATEGORIES: SubCategory[] = [
  { id: 'sc1', name: 'Smartphones', parentCategoryId: 'electronics', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'smartphones mobile' },
  { id: 'sc2', name: 'Laptops', parentCategoryId: 'electronics', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'laptops computer' },
  { id: 'sc3', name: 'Mens Apparel', parentCategoryId: 'fashion', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'mens clothing' },
  { id: 'sc4', name: 'Womens Apparel', parentCategoryId: 'fashion', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'womens clothing' },
  { id: 'sc5', name: 'Living Room Furniture', parentCategoryId: 'home-garden', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'furniture living room' },
];

export let MOCK_BRANDS: Brand[] = INITIAL_BRANDS.map(brand => ({ ...brand }));

export const MOCK_USERS: User[] = [
  {
    id: 'user1',
    email: 'buyer@example.com',
    name: 'John Doe',
    defaultShippingAddress: {
      fullName: 'John Doe',
      phoneNumber: '01711111111',
      country: 'Bangladesh',
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Gulshan',
      houseAddress: '123 Gulshan Ave',
      roadNumber: 'Road 10',
    },
    withdrawalMethods: [
       {
        id: 'wm_user1_bkash',
        type: 'bkash',
        details: { accountNumber: '01711223344' },
        isDefault: true,
        createdAt: createPastDate(5),
      }
    ],
  },
  {
    id: 'user2',
    email: 'seller@example.com',
    name: 'Jane Smith',
    defaultShippingAddress: {
      fullName: 'Jane Smith',
      phoneNumber: '01822222222',
      country: 'Bangladesh',
      division: 'Chittagong',
      district: 'Chittagong',
      thana: 'Pahartali',
      houseAddress: 'Apt 2B, Hill View Road',
      roadNumber: 'Road 5',
    },
    withdrawalMethods: [
      {
        id: 'wm1_user2',
        type: 'bkash',
        details: { accountNumber: '01812345678' },
        isDefault: true,
        createdAt: createPastDate(10),
      },
      {
        id: 'wm2_user2',
        type: 'bank',
        details: {
          bankName: 'City Bank',
          accountHolderName: 'Jane Smith',
          accountNumber: '1234567890123',
          routingNumber: '112233445',
          branchName: 'Agrabad Branch'
        },
        isDefault: false,
        createdAt: createPastDate(20),
      }
    ],
  },
  {
    id: 'admin1',
    email: 'admin@example.com',
    name: 'Admin User',
    isAdmin: true,
    defaultShippingAddress: {
      fullName: 'Admin B. Admin',
      phoneNumber: '01999999999',
      country: 'Bangladesh',
      division: 'Chittagong',
      district: 'Chittagong',
      thana: 'Kotwali (Chittagong)',
      houseAddress: 'Admin Building, CTG',
      roadNumber: 'Main St',
    },
    withdrawalMethods: [],
  },
];

export let MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Vintage Leather Jacket',
    description: 'A stylish vintage leather jacket, barely used. Size M.',
    price: 75,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'leather jacket',
    categoryId: 'fashion',
    subCategoryId: 'sc3',
    brandId: 'generic',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'approved',
    createdAt: createPastDate(5),
  },
  {
    id: 'prod2',
    name: 'Used iPhone X',
    description: 'Good condition iPhone X, 64GB, unlocked. Minor scratches on the back.',
    price: 250,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'smartphone electronics',
    categoryId: 'electronics',
    subCategoryId: 'sc1',
    brandId: 'apple',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'approved',
    createdAt: createPastDate(10),
  },
  {
    id: 'prod3',
    name: 'Bookshelf, Wooden',
    description: 'Solid wood bookshelf, 5 shelves. Excellent condition.',
    price: 50,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'bookshelf furniture',
    categoryId: 'home-garden',
    subCategoryId: 'sc5',
    brandId: 'ikea',
    sellerId: 'user1',
    sellerName: 'John Doe',
    status: 'pending',
    createdAt: createPastDate(2),
  },
  {
    id: 'prod4',
    name: 'Samsung Galaxy S20',
    description: 'Used Samsung Galaxy S20, 128GB. Works perfectly.',
    price: 300,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'android smartphone',
    categoryId: 'electronics',
    subCategoryId: 'sc1',
    brandId: 'samsung',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'sold',
    createdAt: createPastDate(15),
  },
  {
    id: 'prod5',
    name: 'Running Shoes Size 9',
    description: 'Nike running shoes, size 9. Worn a few times.',
    price: 40,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'running shoes',
    categoryId: 'fashion',
    brandId: 'nike',
    sellerId: 'user1',
    sellerName: 'John Doe',
    status: 'approved',
    createdAt: createPastDate(20),
  },
  {
    id: 'prod6',
    name: 'Classic Novels Collection',
    description: 'Set of 5 classic novels. Paperback editions.',
    price: 20,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'books literature',
    categoryId: 'books',
    brandId: 'generic',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'rejected',
    createdAt: createPastDate(1),
  },
];

const MOCK_SHIPPING_ADDRESS_BANGLADESH: ShippingAddress = {
  fullName: 'Kazi Nazrul Islam',
  phoneNumber: '01700000000',
  country: 'Bangladesh',
  division: 'Dhaka',
  district: 'Dhaka',
  thana: 'Dhanmondi',
  houseAddress: 'House 123',
  roadNumber: 'Road 7A',
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order1',
    userId: 'user1',
    items: [
      { id: 'prod1', name: 'Vintage Leather Jacket', price: 75, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user2' },
    ],
    totalAmount: 75 + 70, // item price + delivery
    deliveryChargeAmount: 70,
    shippingAddress: MOCK_USERS.find(u => u.id === 'user1')?.defaultShippingAddress || MOCK_SHIPPING_ADDRESS_BANGLADESH,
    status: 'delivered',
    paymentStatus: 'paid',
    platformCommission: 7.5, // Assuming 10% commission on fashion for this example
    createdAt: createPastDate(7),
    updatedAt: createPastDate(3),
    selectedShippingMethodId: 'standard-delivery',
    shippingMethodName: 'Standard Delivery',
  },
  {
    id: 'order2',
    userId: 'user1',
    items: [
      { id: 'prod2', name: 'Used iPhone X', price: 250, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user2' },
      { id: 'prod5', name: 'Running Shoes Size 9', price: 40, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user1' },
    ],
    totalAmount: 290 + 130, // item prices + delivery
    deliveryChargeAmount: 130,
    shippingAddress: { ...(MOCK_USERS.find(u => u.id === 'user1')?.defaultShippingAddress || MOCK_SHIPPING_ADDRESS_BANGLADESH), fullName: 'John Doe Updated', district: 'Gazipur', thana: 'Gazipur Sadar' },
    status: 'delivered',
    paymentStatus: 'unpaid',
    platformCommission: 0, // Not paid yet
    createdAt: createPastDate(3),
    updatedAt: createPastDate(1),
    selectedShippingMethodId: 'express-delivery',
    shippingMethodName: 'Express Delivery (Next Day)',
  },
  {
    id: 'order3',
    userId: 'user2',
    items: [
      { id: 'prod4', name: 'Samsung Galaxy S20', price: 300, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user2' },
    ],
    totalAmount: 300 + 110, // item price + delivery
    deliveryChargeAmount: 110,
    shippingAddress: { ...MOCK_SHIPPING_ADDRESS_BANGLADESH, fullName: 'Jane Smith BD', division: 'Chittagong', district: 'Chittagong', thana: 'Kotwali (Chittagong)' },
    status: 'processing',
    paymentStatus: 'unpaid',
    platformCommission: 0,
    createdAt: createPastDate(1),
    updatedAt: createPastDate(0),
    selectedShippingMethodId: 'standard-delivery',
    shippingMethodName: 'Standard Delivery',
  },
];

export let MOCK_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'wr1',
    userId: 'user2',
    userName: 'Jane Smith',
    amount: 50,
    withdrawalMethodId: 'wm1_user2',
    withdrawalMethodType: 'bkash',
    withdrawalMethodDetails: 'bKash: ****5678',
    status: 'pending',
    requestedAt: createPastDate(2),
  }
];

export let MOCK_CUSTOM_PAGES: CustomPage[] = [...DEFAULT_CUSTOM_PAGES];
