
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';

// In a real application, you would fetch this from your database.
// For this example, we're using a modified version of MOCK_PRODUCTS
// or a static list to show it's coming from the API.
const API_MOCK_PRODUCTS: Product[] = [
  {
    id: 'api-prod1',
    name: 'API: Smartwatch Series X',
    description: 'A smart and stylish watch, fetched from the API.',
    price: 199.99,
    stock: 15,
    imageUrl: 'https://placehold.co/600x400/3498db/ffffff.png?text=API+Watch',
    imageHint: 'smartwatch api',
    categoryId: 'electronics',
    subCategoryId: 'sc_smartphones', // Assuming smartphones can include watches for mock
    sellerId: 'user2',
    sellerName: 'APISeller Ltd.',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    selectedAttributes: [{ attributeTypeId: 'attr_color', attributeValueId: 'val_color_black' }],
  },
  {
    id: 'api-prod2',
    name: 'API: Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly, from the API.',
    price: 29.99,
    stock: 50,
    imageUrl: 'https://placehold.co/600x400/2ecc71/ffffff.png?text=API+Shirt',
    imageHint: 'cotton t-shirt api',
    categoryId: 'fashion',
    subCategoryId: 'sc_mens_apparel',
    sellerId: 'user1',
    sellerName: 'EcoThreads API',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    selectedAttributes: [{ attributeTypeId: 'attr_material', attributeValueId: 'val_material_cotton' }],
  },
  {
    id: 'api-prod3',
    name: 'API: Classic Novel Set',
    description: 'A collection of timeless classics, provided by API.',
    price: 45.50,
    stock: 5,
    imageUrl: 'https://placehold.co/600x400/e74c3c/ffffff.png?text=API+Books',
    imageHint: 'books set api',
    categoryId: 'books',
    subCategoryId: 'sc_novels',
    sellerId: 'user2',
    sellerName: 'APISeller Ltd.',
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    selectedAttributes: [{ attributeTypeId: 'attr_author', attributeValueId: 'val_author_tagore' }],
  },
];

export async function GET(request: Request) {
  // In a real application, this is where you would:
  // 1. Connect to your PostgreSQL database.
  // 2. Query the database for products.
  // 3. Handle any errors.
  // 4. Return the products.

  // For now, we simulate a delay and return our mock API products.
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter for approved and in-stock products, just like the frontend mock logic
  const approvedAndInStock = API_MOCK_PRODUCTS.filter(p => p.status === 'approved' && p.stock > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(approvedAndInStock);
}

// You would also add POST, PUT, DELETE handlers here for full CRUD
// e.g., export async function POST(request: Request) { /* ... */ }
