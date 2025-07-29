import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({ products: [] });
    }

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        pi.image_url as imageUrl,
        pi.image_hint as imageHint,
        p.category_id as categoryId,
        p.sub_category_id as subCategoryId,
        p.seller_id as sellerId,
        p.status,
        p.created_at as createdAt,
        p.stock,
        c.name as categoryName,
        sc.name as subCategoryName,
        u.name as sellerName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.status = 'approved'
        AND p.stock > 0
        AND (
          p.name LIKE ? 
          OR p.description LIKE ? 
          OR c.name LIKE ? 
          OR sc.name LIKE ?
          OR u.name LIKE ?
        )
    `;

    const searchTerm = `%${query}%`;
    const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

    // Add category filter if specified
    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ?';
    params.push(limit);

    const products = await executeQuery(sql, params);

    // Transform the results to match the expected format
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      imageUrl: product.imageUrl || '',
      imageHint: product.imageHint,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      status: product.status,
      createdAt: new Date(product.createdAt),
      stock: product.stock,
      categoryName: product.categoryName,
      subCategoryName: product.subCategoryName
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
