import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const query = `
      SELECT 
        p.*,
        u.name as seller_name,
        pi.image_url,
        pi.image_hint
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.id = ?
    `;
    
    const product = await executeQuerySingle(query, [id]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Convert product fields to camelCase and format for frontend
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0,
      status: product.status,
      sellerId: product.seller_id,
      sellerName: product.seller_name,
      categoryId: product.category_id,
      subCategoryId: product.sub_category_id,
      imageUrl: product.image_url || '',
      imageHint: product.image_hint,
      createdAt: product.created_at,
      // New product fields
      purchaseDate: product.purchase_date,
      weightKg: product.weight_kg ? parseFloat(product.weight_kg) : null,
      purchasePrice: product.purchase_price ? parseFloat(product.purchase_price) : null,
      expectedSellingPrice: product.expected_selling_price ? parseFloat(product.expected_selling_price) : null,
      quantityParameter: product.quantity_parameter,
      commissionPercentage: product.commission_percentage ? parseFloat(product.commission_percentage) : null
    };

    // Get selected attributes for this product
    const attributesQuery = `
      SELECT 
        psa.*,
        cat.name as attribute_type_name,
        cav.value as attribute_value_name
      FROM product_selected_attributes psa
      JOIN category_attribute_types cat ON psa.attribute_type_id = cat.id
      JOIN category_attribute_values cav ON psa.attribute_value_id = cav.id
      WHERE psa.product_id = ?
    `;
    const attributes = await executeQuery(attributesQuery, [id]);
    formattedProduct.selectedAttributes = attributes.map((attr: any) => ({
      attributeTypeId: attr.attribute_type_id,
      attributeValueId: attr.attribute_value_id,
      attributeTypeName: attr.attribute_type_name,
      attributeValueName: attr.attribute_value_name
    }));

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      subCategoryId,
      imageUrl,
      imageHint,
      status,
      selectedAttributes,
      // New fields for comprehensive updates
      purchaseDate,
      weightKg,
      purchasePrice,
      expectedSellingPrice,
      quantityParameter
    } = body;

    // Check if product exists
    const existingProduct = await executeQuerySingle('SELECT id FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (stock !== undefined) {
      updateFields.push('stock = ?');
      updateValues.push(stock);
      console.log(`Stock updated for product ${id}: ${stock}`);
      // When stock is restored from 0, product becomes available again automatically
      if (stock > 0) {
        console.log(`Product ${id} is now available again with stock: ${stock}`);
      }
    }
    if (categoryId !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(categoryId);
    }
    if (subCategoryId !== undefined) {
      updateFields.push('sub_category_id = ?');
      updateValues.push(subCategoryId || null);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    // Add new field updates
    if (purchaseDate !== undefined) {
      updateFields.push('purchase_date = ?');
      updateValues.push(purchaseDate || null);
    }
    if (weightKg !== undefined) {
      updateFields.push('weight_kg = ?');
      updateValues.push(weightKg || null);
    }
    if (purchasePrice !== undefined) {
      updateFields.push('purchase_price = ?');
      updateValues.push(purchasePrice || null);
    }
    if (expectedSellingPrice !== undefined) {
      updateFields.push('expected_selling_price = ?');
      updateValues.push(expectedSellingPrice || null);
    }
    if (quantityParameter !== undefined) {
      updateFields.push('quantity_parameter = ?');
      updateValues.push(quantityParameter || 'PC');
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
      updateValues.push(id);
      await executeQuery(updateQuery, updateValues);
    }

    // Update product image if provided
    if (imageUrl !== undefined) {
      // Delete existing primary image
      await executeQuery('DELETE FROM product_images WHERE product_id = ? AND is_primary = true', [id]);
      
      // Insert new primary image if URL provided
      if (imageUrl) {
        const imageQuery = `
          INSERT INTO product_images (product_id, image_url, image_hint, is_primary)
          VALUES (?, ?, ?, true)
        `;
        await executeQuery(imageQuery, [id, imageUrl, imageHint || '']);
      }
    }

    // Update selected attributes if provided
    if (selectedAttributes !== undefined) {
      // Delete existing attributes
      await executeQuery('DELETE FROM product_selected_attributes WHERE product_id = ?', [id]);
      
      // Insert new attributes
      if (selectedAttributes.length > 0) {
        for (const attr of selectedAttributes) {
          const attrQuery = `
            INSERT INTO product_selected_attributes (product_id, attribute_type_id, attribute_value_id)
            VALUES (?, ?, ?)
          `;
          await executeQuery(attrQuery, [id, attr.attributeTypeId, attr.attributeValueId]);
        }
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: 'Failed to update product', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if product exists
    const existingProduct = await executeQuerySingle('SELECT id FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete related data first (foreign key constraints)
    await executeQuery('DELETE FROM product_selected_attributes WHERE product_id = ?', [id]);
    await executeQuery('DELETE FROM product_images WHERE product_id = ?', [id]);
    
    // Delete the product
    await executeQuery('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 