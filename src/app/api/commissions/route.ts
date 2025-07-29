import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/commissions - Get all commission settings
export async function GET() {
  try {
    const query = `
      SELECT 
        c.category_id,
        c.percentage,
        cat.name as category_name
      FROM commissions c
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY cat.name ASC
    `;
    
    const commissions = await executeQuery(query);
    
    // Convert to the expected format
    const formattedCommissions = commissions.map((commission: any) => ({
      categoryId: commission.category_id,
      percentage: parseFloat(commission.percentage),
      categoryName: commission.category_name
    }));

    return NextResponse.json(formattedCommissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json({ error: 'Failed to fetch commission settings' }, { status: 500 });
  }
}

// PUT /api/commissions - Update commission settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { commissions } = body; // Array of { categoryId, percentage }

    if (!commissions || !Array.isArray(commissions)) {
      return NextResponse.json({ error: 'Invalid commission data' }, { status: 400 });
    }

    // Clear existing commissions
    await executeQuery('DELETE FROM commissions');

    // Insert new commission settings
    for (const commission of commissions) {
      if (commission.categoryId && commission.percentage !== undefined) {
        const insertQuery = `
          INSERT INTO commissions (category_id, percentage)
          VALUES (?, ?)
        `;
        await executeQuery(insertQuery, [commission.categoryId, commission.percentage]);
      }
    }

    return NextResponse.json({ success: true, message: 'Commission settings updated successfully' });
  } catch (error) {
    console.error('Error updating commissions:', error);
    return NextResponse.json({ error: 'Failed to update commission settings' }, { status: 500 });
  }
} 