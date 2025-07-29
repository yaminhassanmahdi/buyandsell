import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user basic info
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    const user = await executeQuerySingle(userQuery, [id]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's shipping addresses
    const addressesQuery = `
      SELECT * FROM shipping_addresses 
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;
    const addresses = await executeQuery(addressesQuery, [id]);
    
    // Map database fields to frontend format
    const shippingAddresses = addresses.map((addr: any) => ({
      id: addr.id,
      userId: addr.user_id,
      isDefault: addr.is_default,
      fullName: addr.full_name,
      phoneNumber: addr.phone_number,
      country: addr.country,
      division: addr.division,
      district: addr.district,
      upazilla: addr.upazilla,
      houseAddress: addr.house_address,
      roadNumber: addr.road_number,
      createdAt: addr.created_at
    }));

    // Get user's withdrawal methods
    const methodsQuery = `
      SELECT * FROM withdrawal_methods 
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;
    const methods = await executeQuery(methodsQuery, [id]);
    
    // Map withdrawal methods
    const withdrawalMethods = methods.map((method: any) => ({
      id: method.id,
      type: method.method_type,
      details: JSON.parse(method.details),
      isDefault: method.is_default === 1,
      createdAt: method.created_at
    }));

    // Find default shipping address
    const defaultShippingAddress = shippingAddresses.find(addr => addr.isDefault) || null;

    // Format user response
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      isAdmin: user.is_admin === 1,
      googleEmail: user.google_email,
      createdAt: user.created_at,
      shippingAddresses,
      defaultShippingAddress,
      withdrawalMethods
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if user exists
    const userQuery = 'SELECT id FROM users WHERE id = ?';
    const user = await executeQuerySingle(userQuery, [id]);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update fields
    const updates = [];
    const values = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      values.push(body.name);
    }
    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email);
    }
    if (body.phoneNumber !== undefined) {
      updates.push('phone_number = ?');
      values.push(body.phoneNumber);
    }
    if (body.isAdmin !== undefined) {
      updates.push('is_admin = ?');
      values.push(body.isAdmin);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(updateQuery, values);

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
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

    // Delete user (this will cascade to related records if foreign keys are set up properly)
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    await executeQuery(deleteQuery, [id]);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}