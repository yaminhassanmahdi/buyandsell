import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';
import type { WithdrawalMethod } from '@/lib/types';

// PUT /api/users/[id]/withdrawal-methods - Update user's withdrawal methods
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const withdrawalMethods: WithdrawalMethod[] = await request.json();

    // Validate required fields
    if (!Array.isArray(withdrawalMethods)) {
      return NextResponse.json(
        { error: 'Withdrawal methods must be an array' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userQuery = 'SELECT id FROM users WHERE id = ?';
    const user = await executeQuerySingle(userQuery, [id]);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete existing withdrawal methods for this user
    await executeQuery('DELETE FROM withdrawal_methods WHERE user_id = ?', [id]);

    // Insert new withdrawal methods
    for (const method of withdrawalMethods) {
      const insertQuery = `
        INSERT INTO withdrawal_methods 
        (id, user_id, method_type, details, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      const details = JSON.stringify(method.details);
      await executeQuery(insertQuery, [
        method.id,
        id,
        method.type,
        details,
        method.isDefault ? 1 : 0
      ]);
    }

    // Return the updated methods
    const updatedMethodsQuery = 'SELECT * FROM withdrawal_methods WHERE user_id = ? ORDER BY is_default DESC, created_at ASC';
    const updatedMethods = await executeQuery(updatedMethodsQuery, [id]);

    // Parse the details JSON for each method
    const parsedMethods = updatedMethods.map((method: any) => ({
      id: method.id,
      type: method.method_type,
      details: JSON.parse(method.details),
      isDefault: method.is_default === 1,
      createdAt: method.created_at
    }));

    return NextResponse.json({
      success: true,
      methods: parsedMethods
    });

  } catch (error) {
    console.error('Error updating withdrawal methods:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal methods' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/withdrawal-methods - Get user's withdrawal methods
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if user exists
    const userQuery = 'SELECT id FROM users WHERE id = ?';
    const user = await executeQuerySingle(userQuery, [id]);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get withdrawal methods
    const methodsQuery = 'SELECT * FROM withdrawal_methods WHERE user_id = ? ORDER BY is_default DESC, created_at ASC';
    const methods = await executeQuery(methodsQuery, [id]);

    // Parse the details JSON for each method
    const parsedMethods = methods.map((method: any) => ({
      id: method.id,
      type: method.method_type,
      details: JSON.parse(method.details),
      isDefault: method.is_default === 1,
      createdAt: method.created_at
    }));

    return NextResponse.json({
      methods: parsedMethods
    });

  } catch (error) {
    console.error('Error fetching withdrawal methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal methods' },
      { status: 500 }
    );
  }
} 