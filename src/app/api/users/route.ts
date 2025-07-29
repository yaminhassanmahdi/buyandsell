import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';

// GET /api/users - Get all users (with filtering)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAddresses = searchParams.get('includeAddresses') === 'true';
    const includeWithdrawalMethods = searchParams.get('includeWithdrawalMethods') === 'true';
    const isAdmin = searchParams.get('isAdmin');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM users WHERE 1=1';
    const queryParams: any[] = [];

    if (isAdmin !== null) {
      query += ' AND is_admin = ?';
      queryParams.push(isAdmin === 'true');
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const users = await executeQuery(query, queryParams);

    // Add related data if requested
    for (const user of users) {
      if (includeAddresses) {
        const addressesQuery = `
          SELECT * FROM shipping_addresses 
          WHERE user_id = ?
          ORDER BY is_default DESC, created_at DESC
        `;
        const addresses = await executeQuery(addressesQuery, [user.id]);
        
        // Map database fields to frontend format
        user.shippingAddresses = addresses.map((addr: any) => ({
          id: addr.id,
          userId: addr.user_id,
          isDefault: addr.is_default,
          fullName: addr.full_name,
          phoneNumber: addr.phone_number,
          country: addr.country,
          division: addr.division,
          district: addr.district,
          upazilla: addr.upazilla, // Use upazilla directly
          houseAddress: addr.house_address,
          roadNumber: addr.road_number,
          createdAt: addr.created_at
        }));
        
        user.defaultShippingAddress = user.shippingAddresses.find((addr: any) => addr.isDefault) || null;
      }

      if (includeWithdrawalMethods) {
        const methodsQuery = `
          SELECT * FROM withdrawal_methods 
          WHERE user_id = ?
          ORDER BY is_default DESC, created_at DESC
        `;
        const methods = await executeQuery(methodsQuery, [user.id]);
        
        // Map withdrawal methods
        user.withdrawalMethods = methods.map((method: any) => ({
          id: method.id,
          type: method.method_type,
          details: JSON.parse(method.details),
          isDefault: method.is_default === 1,
          createdAt: method.created_at
        }));
      }
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      email,
      phoneNumber,
      passwordHash,
      isAdmin = false,
      googleEmail
    } = body;

    const query = `
      INSERT INTO users (id, name, email, phone_number, password_hash, is_admin, google_email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(query, [
      id, name, email, phoneNumber, passwordHash, isAdmin, googleEmail
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 