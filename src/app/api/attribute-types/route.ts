import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/attribute-types - Get all attribute types
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    let query = `
      SELECT 
        cat.id,
        cat.category_id,
        cat.name,
        cat.is_button_featured,
        cat.is_featured_section,
        c.name as category_name
      FROM category_attribute_types cat
      JOIN categories c ON cat.category_id = c.id
    `;
    
    const params = [];
    if (categoryId) {
      query += ' WHERE cat.category_id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY c.name ASC, cat.name ASC';
    
    const attributeTypes = await executeQuery(query, params);
    
    // Convert to camelCase
    const convertedAttributeTypes = attributeTypes.map((attr: any) => ({
      id: attr.id,
      categoryId: attr.category_id,
      name: attr.name,
      isButtonFeatured: !!attr.is_button_featured,
      isFeaturedSection: !!attr.is_featured_section,
      categoryName: attr.category_name
    }));

    return NextResponse.json(convertedAttributeTypes);
  } catch (error) {
    console.error('Error fetching attribute types:', error);
    return NextResponse.json({ error: 'Failed to fetch attribute types' }, { status: 500 });
  }
}

// POST /api/attribute-types - Create a new attribute type
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, categoryId, name, isButtonFeatured = false, isFeaturedSection = false } = body;

    if (!id || !categoryId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const query = `
      INSERT INTO category_attribute_types (id, category_id, name, is_button_featured, is_featured_section)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [id, categoryId, name, isButtonFeatured, isFeaturedSection]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating attribute type:', error);
    return NextResponse.json({ error: 'Failed to create attribute type' }, { status: 500 });
  }
}

// PUT /api/attribute-types - Update an existing attribute type
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, categoryId, name, isButtonFeatured = false, isFeaturedSection = false } = body;

    if (!id) {
      return NextResponse.json({ error: 'Attribute type ID is required' }, { status: 400 });
    }

    const query = `
      UPDATE category_attribute_types 
      SET category_id = ?, name = ?, is_button_featured = ?, is_featured_section = ?
      WHERE id = ?
    `;
    
    await executeQuery(query, [categoryId, name, isButtonFeatured, isFeaturedSection, id]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error updating attribute type:', error);
    return NextResponse.json({ error: 'Failed to update attribute type' }, { status: 500 });
  }
}

// DELETE /api/attribute-types - Delete an attribute type
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Attribute type ID is required' }, { status: 400 });
    }

    // Check if attribute type has values
    const valuesQuery = `
      SELECT COUNT(*) as count FROM category_attribute_values WHERE attribute_type_id = ?
    `;
    const valuesResult = await executeQuerySingle(valuesQuery, [id]);
    
    if (valuesResult.count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete attribute type that has values. Please delete values first.' 
      }, { status: 400 });
    }

    // Delete the attribute type
    const deleteQuery = `DELETE FROM category_attribute_types WHERE id = ?`;
    await executeQuery(deleteQuery, [id]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting attribute type:', error);
    return NextResponse.json({ error: 'Failed to delete attribute type' }, { status: 500 });
  }
}
