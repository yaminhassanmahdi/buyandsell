import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/shipping-methods - Get all shipping methods
export async function GET() {
  try {
    const query = 'SELECT * FROM shipping_methods ORDER BY name ASC';
    const methods = await executeQuery(query);
    return NextResponse.json(methods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 });
  }
}

// POST /api/shipping-methods - Create a new shipping method
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    const query = 'INSERT INTO shipping_methods (id, name) VALUES (?, ?)';
    await executeQuery(query, [id, name]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating shipping method:', error);
    return NextResponse.json({ error: 'Failed to create shipping method' }, { status: 500 });
  }
}

// DELETE /api/shipping-methods - Delete a shipping method
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Method ID is required' }, { status: 400 });
    }

    const query = 'DELETE FROM shipping_methods WHERE id = ?';
    await executeQuery(query, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    return NextResponse.json({ error: 'Failed to delete shipping method' }, { status: 500 });
  }
} 