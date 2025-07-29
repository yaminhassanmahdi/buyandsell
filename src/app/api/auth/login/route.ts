import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuerySingle, executeQuery } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be email or phone

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 });
    }

    // Find user by email or phone number
    let query = 'SELECT * FROM users WHERE email = ? OR phone_number = ?';
    const user = await executeQuerySingle(query, [identifier, identifier]);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get user's shipping addresses
    const addressesQuery = `
      SELECT * FROM shipping_addresses 
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;
    const addresses = await executeQuery(addressesQuery, [user.id]);

    // Get user's withdrawal methods
    const methodsQuery = `
      SELECT * FROM withdrawal_methods 
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `;
    const withdrawalMethods = await executeQuery(methodsQuery, [user.id]);

    // Parse withdrawal method details
    const parsedWithdrawalMethods = withdrawalMethods.map((method: any) => ({
      id: method.id,
      type: method.method_type,
      details: JSON.parse(method.details),
      isDefault: method.is_default === 1,
      createdAt: method.created_at
    }));

    // Find default shipping address
    const defaultShippingAddress = addresses.find((addr: any) => addr.is_default) || addresses[0] || null;

    // Map shipping address fields to frontend format
    const mappedDefaultShippingAddress = defaultShippingAddress ? {
      id: defaultShippingAddress.id,
      userId: defaultShippingAddress.user_id,
      isDefault: defaultShippingAddress.is_default,
      fullName: defaultShippingAddress.full_name,
      phoneNumber: defaultShippingAddress.phone_number,
      country: defaultShippingAddress.country,
      division: defaultShippingAddress.division,
      district: defaultShippingAddress.district,
      upazilla: defaultShippingAddress.upazilla,
      houseAddress: defaultShippingAddress.house_address,
      roadNumber: defaultShippingAddress.road_number,
      createdAt: defaultShippingAddress.created_at
    } : null;

    // Convert user data to component format
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      isAdmin: user.is_admin,
      googleEmail: user.google_email,
      defaultShippingAddress: mappedDefaultShippingAddress,
      withdrawalMethods: parsedWithdrawalMethods || []
    };

    // Return user data (excluding password hash)
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 