import type { Product, User, Order, ShippingAddress } from './types';
import { CATEGORIES, BRANDS } from './constants';

const today = new Date();

export const MOCK_USERS: User[] = [
  { id: 'user1', email: 'buyer@example.com', name: 'John Doe' },
  { id: 'user2', email: 'seller@example.com', name: 'Jane Smith' },
  { id: 'admin1', email: 'admin@example.com', name: 'Admin User', isAdmin: true },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Vintage Leather Jacket',
    description: 'A stylish vintage leather jacket, barely used. Size M.',
    price: 75,
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'leather jacket',
    category: CATEGORIES.find(c => c.id === 'fashion')!,
    brand: BRANDS.find(b => b.id === 'generic')!,
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'approved',
    createdAt: new Date(today.setDate(today.getDate() - 5)),
  },
  {
    id: 'prod2',
    name: 'Used iPhone X',
    description: 'Good condition iPhone X, 64GB, unlocked. Minor scratches on the back.',
    price: 250,
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'smartphone electronics',
    category: CATEGORIES.find(c => c.id === 'electronics')!,
    brand: BRANDS.find(b => b.id === 'apple')!,
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'approved',
    createdAt: new Date(today.setDate(today.getDate() - 10)),
  },
  {
    id: 'prod3',
    name: 'Bookshelf, Wooden',
    description: 'Solid wood bookshelf, 5 shelves. Excellent condition.',
    price: 50,
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'bookshelf furniture',
    category: CATEGORIES.find(c => c.id === 'home-garden')!,
    brand: BRANDS.find(b => b.id === 'ikea')!,
    sellerId: 'user1',
    sellerName: 'John Doe',
    status: 'pending',
    createdAt: new Date(today.setDate(today.getDate() - 2)),
  },
  {
    id: 'prod4',
    name: 'Samsung Galaxy S20',
    description: 'Used Samsung Galaxy S20, 128GB. Works perfectly.',
    price: 300,
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'android smartphone',
    category: CATEGORIES.find(c => c.id === 'electronics')!,
    brand: BRANDS.find(b => b.id === 'samsung')!,
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'approved',
    createdAt: new Date(today.setDate(today.getDate() - 15)),
  },
  {
    id: 'prod5',
    name: 'Running Shoes Size 9',
    description: 'Nike running shoes, size 9. Worn a few times.',
    price: 40,
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'running shoes',
    category: CATEGORIES.find(c => c.id === 'fashion')!,
    brand: BRANDS.find(b => b.id === 'nike')!,
    sellerId: 'user1',
    sellerName: 'John Doe',
    status: 'approved',
    createdAt: new Date(today.setDate(today.getDate() - 20)),
  },
  {
    id: 'prod6',
    name: 'Classic Novels Collection',
    description: 'Set of 5 classic novels. Paperback editions.',
    price: 20,
    imageUrl: 'https://placehold.co/300x200.png',
    imageHint: 'books literature',
    category: CATEGORIES.find(c => c.id === 'books')!,
    brand: BRANDS.find(b => b.id === 'generic')!,
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'rejected',
    createdAt: new Date(today.setDate(today.getDate() - 1)),
  },
];

const MOCK_SHIPPING_ADDRESS: ShippingAddress = {
  fullName: 'John Doe',
  addressLine1: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  postalCode: '90210',
  country: 'USA',
  phoneNumber: '555-1234'
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order1',
    userId: 'user1',
    items: [
      { id: 'prod1', name: 'Vintage Leather Jacket', price: 75, imageUrl: 'https://placehold.co/100x100.png', quantity: 1 },
    ],
    totalAmount: 75,
    shippingAddress: MOCK_SHIPPING_ADDRESS,
    status: 'delivered',
    createdAt: new Date(today.setDate(today.getDate() - 7)),
    updatedAt: new Date(today.setDate(today.getDate() - 3)),
  },
  {
    id: 'order2',
    userId: 'user1',
    items: [
      { id: 'prod2', name: 'Used iPhone X', price: 250, imageUrl: 'https://placehold.co/100x100.png', quantity: 1 },
      { id: 'prod5', name: 'Running Shoes Size 9', price: 40, imageUrl: 'https://placehold.co/100x100.png', quantity: 1 },
    ],
    totalAmount: 290,
    shippingAddress: MOCK_SHIPPING_ADDRESS,
    status: 'shipped',
    createdAt: new Date(today.setDate(today.getDate() - 3)),
    updatedAt: new Date(today.setDate(today.getDate() - 1)),
  },
  {
    id: 'order3',
    userId: 'user2', // Order for another user
    items: [
      { id: 'prod4', name: 'Samsung Galaxy S20', price: 300, imageUrl: 'https://placehold.co/100x100.png', quantity: 1 },
    ],
    totalAmount: 300,
    shippingAddress: { ...MOCK_SHIPPING_ADDRESS, fullName: 'Jane Smith'},
    status: 'processing',
    createdAt: new Date(today.setDate(today.getDate() - 1)),
    updatedAt: new Date(today.setDate(today.getDate() - 0)),
  },
];
