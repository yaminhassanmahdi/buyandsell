// This file is marked for deletion

import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';
import { generateProductId } from '@/lib/utils';

// GET /api/products - Get all products with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'date_desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true';

    let query = `
      SELECT 
        p.*,
        u.name as seller_name,
        c.name as category_name,
        sc.name as sub_category_name,
        pi.image_url,
        pi.image_hint
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    // Only filter by approved status for general listings (unless explicitly requesting a specific status)
    if (!sellerId && !status) {
      query += ' AND p.status = ?';
      queryParams.push('approved');
    }

    // Filter out sold-out products for general browsing (unless viewing seller's own products or including out of stock)
    if (!includeOutOfStock && !sellerId) {
      query += ' AND p.stock > 0';
    }

    // If requesting a specific status, filter by it
    if (status) {
      query += ' AND p.status = ?';
      queryParams.push(status);
    }

    if (categoryId) {
      query += ' AND p.category_id = ?';
      queryParams.push(categoryId);
    }

    if (subCategoryId) {
      query += ' AND p.sub_category_id = ?';
      queryParams.push(subCategoryId);
    }

    if (sellerId) {
      query += ' AND p.seller_id = ?';
      queryParams.push(sellerId);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    switch (sortBy) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'name_asc':
        query += ' ORDER BY p.name ASC';
        break;
      case 'name_desc':
        query += ' ORDER BY p.name DESC';
        break;
      case 'date_asc':
        query += ' ORDER BY p.created_at ASC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const products = await executeQuery(query, queryParams);

    // Get all product IDs to fetch attributes in batch
    const productIds = products.map((p: any) => p.id);
    
    // Fetch all attributes for all products in one query
    let attributesMap: { [productId: string]: any[] } = {};
    if (productIds.length > 0) {
      const attributesQuery = `
        SELECT 
          psa.product_id,
          psa.attribute_type_id,
          psa.attribute_value_id,
          cat.name as attribute_type_name,
          cav.value as attribute_value_name
        FROM product_selected_attributes psa
        JOIN category_attribute_types cat ON psa.attribute_type_id = cat.id
        JOIN category_attribute_values cav ON psa.attribute_value_id = cav.id
        WHERE psa.product_id IN (${productIds.map(() => '?').join(',')})
      `;
      const allAttributes = await executeQuery(attributesQuery, productIds);
      
      // Group attributes by product ID
      attributesMap = allAttributes.reduce((acc: any, attr: any) => {
        if (!acc[attr.product_id]) {
          acc[attr.product_id] = [];
        }
        acc[attr.product_id].push({
          attributeTypeId: attr.attribute_type_id,
          attributeValueId: attr.attribute_value_id,
          attributeTypeName: attr.attribute_type_name,
          attributeValueName: attr.attribute_value_name
        });
        return acc;
      }, {});
    }

    // Format products for frontend
    const formattedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0,
      status: product.stock === 0 ? 'SOLD' : product.status, // Show SOLD for out of stock items
      sellerId: product.seller_id,
      sellerName: product.seller_name,
      categoryId: product.category_id,
      categoryName: product.category_name,
      subCategoryId: product.sub_category_id,
      subCategoryName: product.sub_category_name,
      imageUrl: product.image_url || '',
      imageHint: product.image_hint,
      createdAt: product.created_at,
      // Include additional product fields
      purchaseDate: product.purchase_date,
      weightKg: product.weight_kg ? parseFloat(product.weight_kg) : null,
      purchasePrice: product.purchase_price ? parseFloat(product.purchase_price) : null,
      expectedSellingPrice: product.expected_selling_price ? parseFloat(product.expected_selling_price) : null,
      quantityParameter: product.quantity_parameter,
      commissionPercentage: product.commission_percentage ? parseFloat(product.commission_percentage) : null,
      selectedAttributes: attributesMap[product.id] || []
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      price,
      stock = 1,
      sellerId,
      categoryId,
      subCategoryId,
      imageUrl,
      imageHint,
      purchaseDate,
      weightKg,
      purchasePrice,
      expectedSellingPrice,
      quantityParameter,
      selectedAttributes = []
    } = body;

    // Validate required fields
    if (!name || !description || !price || !sellerId || !categoryId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['name', 'description', 'price', 'sellerId', 'categoryId']
      }, { status: 400 });
    }

    // Generate user-friendly product ID based on product name
    let productId = generateProductId(name);
    let counter = 1;
    
    // Ensure the ID is unique
    while (true) {
      const existingProduct = await executeQuerySingle(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );
      
      if (!existingProduct) {
        break; // ID is unique
      }
      
      // Try with a number suffix
      const baseId = generateProductId(name);
      productId = `${baseId}${counter}`;
      counter++;
    }

    // Get commission percentage for this category
    const commissionQuery = 'SELECT percentage FROM commissions WHERE category_id = ?';
    const commissionResult = await executeQuerySingle(commissionQuery, [categoryId]);
    const commissionPercentage = commissionResult ? commissionResult.percentage : 5; // Default to 5%

    // Convert undefined to null for database compatibility
    const cleanedSubCategoryId = subCategoryId || null;
    const cleanedPurchaseDate = purchaseDate || null;
    const cleanedWeightKg = weightKg !== undefined ? weightKg : null;
    const cleanedPurchasePrice = purchasePrice !== undefined ? purchasePrice : null;
    const cleanedExpectedSellingPrice = expectedSellingPrice !== undefined ? expectedSellingPrice : null;
    const cleanedQuantityParameter = quantityParameter || null;

    // Insert product
    const productQuery = `
      INSERT INTO products (
        id, name, description, price, stock, seller_id, category_id, sub_category_id,
        status, purchase_date, weight_kg, purchase_price, expected_selling_price,
        quantity_parameter, commission_percentage, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await executeQuery(productQuery, [
      productId, name, description, price, stock, sellerId, categoryId, cleanedSubCategoryId,
      cleanedPurchaseDate, cleanedWeightKg, cleanedPurchasePrice, cleanedExpectedSellingPrice, cleanedQuantityParameter,
      commissionPercentage
    ]);

    // Insert product image if provided
    if (imageUrl) {
      const imageQuery = `
        INSERT INTO product_images (id, product_id, image_url, image_hint, is_primary, created_at)
        VALUES (?, ?, ?, ?, true, NOW())
      `;
      const imageId = `img-${productId}-${Date.now()}`;
      await executeQuery(imageQuery, [imageId, productId, imageUrl, imageHint || null]);
    }

    // Insert selected attributes if provided
    if (selectedAttributes && selectedAttributes.length > 0) {
      for (const attr of selectedAttributes) {
        if (attr.attributeTypeId && attr.attributeValueId) {
          const attrQuery = `
            INSERT INTO product_selected_attributes (product_id, attribute_type_id, attribute_value_id)
            VALUES (?, ?, ?)
          `;
          await executeQuery(attrQuery, [productId, attr.attributeTypeId, attr.attributeValueId]);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      productId,
      message: 'Product created successfully. It will be reviewed before appearing on the site.'
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: 'Failed to create product', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
