
import type { Product, User, Order, ShippingAddress, Category, SubCategory, WithdrawalRequest, CategoryAttributeType, CategoryAttributeValue } from './types';
import { INITIAL_CATEGORIES, MOCK_CUSTOM_PAGES as DEFAULT_PAGES_FROM_CONSTANTS } from './constants';

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
  { id: 'sc_smartphones', name: 'Smartphones', parentCategoryId: 'electronics', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'smartphones mobile' },
  { id: 'sc_laptops', name: 'Laptops', parentCategoryId: 'electronics', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'laptops computer' },
  { id: 'sc_mens_apparel', name: 'Mens Apparel', parentCategoryId: 'fashion', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'mens clothing' },
  { id: 'sc_womens_apparel', name: 'Womens Apparel', parentCategoryId: 'fashion', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'womens clothing' },
  { id: 'sc_living_room', name: 'Living Room Furniture', parentCategoryId: 'home-garden', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'furniture living room' },
  { id: 'sc_admission_books', name: 'Admission Prep', parentCategoryId: 'books', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'study books' },
  { id: 'sc_novels', name: 'Novels', parentCategoryId: 'books', imageUrl: 'https://placehold.co/80x80.png', imageHint: 'fiction books' },
];

export let MOCK_CATEGORY_ATTRIBUTE_TYPES: CategoryAttributeType[] = [
  { id: 'attr_author', categoryId: 'books', name: 'Author' },
  { id: 'attr_publication', categoryId: 'books', name: 'Publication' },
  { id: 'attr_color', categoryId: 'fashion', name: 'Color' },
  { id: 'attr_material', categoryId: 'fashion', name: 'Material' },
  { id: 'attr_storage', categoryId: 'electronics', name: 'Storage Size' },
  { id: 'attr_ram', categoryId: 'electronics', name: 'RAM' },
];

export let MOCK_CATEGORY_ATTRIBUTE_VALUES: CategoryAttributeValue[] = [
  { id: 'val_author_rahim', attributeTypeId: 'attr_author', value: 'Mr. Rahim' },
  { id: 'val_author_tagore', attributeTypeId: 'attr_author', value: 'Rabindranath Tagore' },
  { id: 'val_author_humayun', attributeTypeId: 'attr_author', value: 'Humayun Ahmed' },
  { id: 'val_pub_prothom', attributeTypeId: 'attr_publication', value: 'Prothom Alo Prokashona' },
  { id: 'val_pub_anyaprokash', attributeTypeId: 'attr_publication', value: 'Anyaprokash' },
  { id: 'val_color_red', attributeTypeId: 'attr_color', value: 'Red' },
  { id: 'val_color_blue', attributeTypeId: 'attr_color', value: 'Blue' },
  { id: 'val_color_black', attributeTypeId: 'attr_color', value: 'Black' },
  { id: 'val_material_cotton', attributeTypeId: 'attr_material', value: 'Cotton' },
  { id: 'val_material_leather', attributeTypeId: 'attr_material', value: 'Leather' },
  { id: 'val_storage_64gb', attributeTypeId: 'attr_storage', value: '64GB' },
  { id: 'val_storage_128gb', attributeTypeId: 'attr_storage', value: '128GB' },
  { id: 'val_storage_256gb', attributeTypeId: 'attr_storage', value: '256GB' },
  { id: 'val_ram_4gb', attributeTypeId: 'attr_ram', value: '4GB' },
  { id: 'val_ram_8gb', attributeTypeId: 'attr_ram', value: '8GB' },
  { id: 'val_ram_16gb', attributeTypeId: 'attr_ram', value: '16GB' },
];

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
      thana: 'Dhaka City', // Consolidated
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
      thana: 'Pahartali', // Example, assuming Pahartali is an Upazila in Chittagong
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
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Dhaka City', // Consolidated
      houseAddress: 'Admin Building, HQ',
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
    stock: 5,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'leather jacket',
    categoryId: 'fashion',
    subCategoryId: 'sc_mens_apparel',
    selectedAttributes: [
      { attributeTypeId: 'attr_color', attributeValueId: 'val_color_black' },
      { attributeTypeId: 'attr_material', attributeValueId: 'val_material_leather' },
    ],
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
    stock: 3,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'smartphone electronics',
    categoryId: 'electronics',
    subCategoryId: 'sc_smartphones',
    selectedAttributes: [
        { attributeTypeId: 'attr_storage', attributeValueId: 'val_storage_64gb' },
        { attributeTypeId: 'attr_ram', attributeValueId: 'val_ram_4gb' }
    ],
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
    stock: 0,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'bookshelf furniture',
    categoryId: 'home-garden',
    subCategoryId: 'sc_living_room',
    selectedAttributes: [],
    sellerId: 'user1',
    sellerName: 'John Doe',
    status: 'pending',
    createdAt: createPastDate(2),
  },
  {
    id: 'prod4',
    name: 'Gitanjali by Tagore',
    description: 'Collection of poems by Rabindranath Tagore.',
    price: 300,
    stock: 10,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'book poetry',
    categoryId: 'books',
    subCategoryId: 'sc_novels',
    selectedAttributes: [
        { attributeTypeId: 'attr_author', attributeValueId: 'val_author_tagore' },
        { attributeTypeId: 'attr_publication', attributeValueId: 'val_pub_anyaprokash' }
    ],
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    status: 'sold',
    createdAt: createPastDate(15),
  },
  {
    id: 'prod5',
    name: 'Red Cotton T-Shirt',
    description: 'Comfortable red cotton t-shirt, size L.',
    price: 40,
    stock: 20,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'red t-shirt',
    categoryId: 'fashion',
    subCategoryId: 'sc_mens_apparel',
    selectedAttributes: [
        { attributeTypeId: 'attr_color', attributeValueId: 'val_color_red' },
        { attributeTypeId: 'attr_material', attributeValueId: 'val_material_cotton' }
    ],
    sellerId: 'user1',
    sellerName: 'John Doe',
    status: 'approved',
    createdAt: createPastDate(20),
  },
  {
    id: 'prod6',
    name: 'Admission Guide - Physics',
    description: 'Comprehensive physics admission test preparation guide.',
    price: 20,
    stock: 0,
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'physics guide book',
    categoryId: 'books',
    subCategoryId: 'sc_admission_books',
     selectedAttributes: [
        { attributeTypeId: 'attr_publication', attributeValueId: 'val_pub_prothom' }
    ],
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
  thana: 'Dhaka City', // Consolidated
  houseAddress: 'House 123',
  roadNumber: 'Road 7A',
};

export let MOCK_ORDERS: Order[] = [
  {
    id: 'order1',
    userId: 'user1',
    items: [
      { id: 'prod1', name: 'Vintage Leather Jacket', price: 75, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user2', stock: 5 },
    ],
    totalAmount: 75 + 70,
    deliveryChargeAmount: 70,
    shippingAddress: MOCK_USERS.find(u => u.id === 'user1')?.defaultShippingAddress || MOCK_SHIPPING_ADDRESS_BANGLADESH,
    status: 'delivered',
    paymentStatus: 'paid',
    platformCommission: 7.5,
    createdAt: createPastDate(7),
    updatedAt: createPastDate(3),
    selectedShippingMethodId: 'standard-delivery',
    shippingMethodName: 'Standard Delivery',
  },
  {
    id: 'order2',
    userId: 'user1',
    items: [
      { id: 'prod2', name: 'Used iPhone X', price: 250, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user2', stock: 3 },
      { id: 'prod5', name: 'Red Cotton T-Shirt', price: 40, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user1', stock: 20 },
    ],
    totalAmount: 290 + 130,
    deliveryChargeAmount: 130,
    shippingAddress: { 
      ...(MOCK_USERS.find(u => u.id === 'user1')?.defaultShippingAddress || MOCK_SHIPPING_ADDRESS_BANGLADESH), 
      fullName: 'John Doe Updated', 
      district: 'Gazipur', 
      thana: 'Gazipur Sadar Upazila' 
    },
    status: 'delivered',
    paymentStatus: 'unpaid',
    platformCommission: 0,
    createdAt: createPastDate(3),
    updatedAt: createPastDate(1),
    selectedShippingMethodId: 'express-delivery',
    shippingMethodName: 'Express Delivery (Next Day)',
  },
  {
    id: 'order3',
    userId: 'user2',
    items: [
      { id: 'prod4', name: 'Gitanjali by Tagore', price: 300, imageUrl: 'https://placehold.co/100x100.png', quantity: 1, sellerId: 'user2', stock: 10 },
    ],
    totalAmount: 300 + 110,
    deliveryChargeAmount: 110,
    shippingAddress: { 
      ...MOCK_SHIPPING_ADDRESS_BANGLADESH, 
      fullName: 'Jane Smith BD', 
      division: 'Chittagong', 
      district: 'Chittagong', 
      thana: 'Chittagong Sadar Upazila' 
    },
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

export let MOCK_CUSTOM_PAGES = [...DEFAULT_PAGES_FROM_CONSTANTS];

    