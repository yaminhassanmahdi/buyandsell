import { NextResponse } from 'next/server';
import { executeQuery, executeQuerySingle } from '@/lib/db';
import type { ShippingAddress } from '@/lib/types';

// PUT /api/users/[id]/shipping-address - Update user's default shipping address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const shippingAddress: ShippingAddress = await request.json();

    // Validate required fields
    if (!shippingAddress.fullName || !shippingAddress.division || !shippingAddress.district || !shippingAddress.houseAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, division, district, houseAddress' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userQuery = 'SELECT id FROM users WHERE id = ?';
    const user = await executeQuerySingle(userQuery, [id]);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a default shipping address
    const existingAddressQuery = 'SELECT id FROM shipping_addresses WHERE user_id = ? AND is_default = 1';
    const existingAddress = await executeQuerySingle(existingAddressQuery, [id]);

    if (existingAddress) {
      // Update existing default address
      const updateQuery = `
        UPDATE shipping_addresses 
        SET full_name = ?, phone_number = ?, country = ?, division = ?, district = ?, upazilla = ?, 
            house_address = ?, road_number = ?
        WHERE user_id = ? AND is_default = 1
      `;
      
      await executeQuery(updateQuery, [
        shippingAddress.fullName,
        shippingAddress.phoneNumber || null,
        shippingAddress.country,
        shippingAddress.division,
        shippingAddress.district,
        shippingAddress.upazilla || null, // Use upazilla directly
        shippingAddress.houseAddress,
        shippingAddress.roadNumber || null,
        id
      ]);
    } else {
      // Insert new default address
      const insertQuery = `
        INSERT INTO shipping_addresses 
        (user_id, full_name, phone_number, country, division, district, upazilla, house_address, road_number, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
      `;
      
      await executeQuery(insertQuery, [
        id,
        shippingAddress.fullName,
        shippingAddress.phoneNumber || null,
        shippingAddress.country,
        shippingAddress.division,
        shippingAddress.district,
        shippingAddress.upazilla || null, // Use upazilla directly
        shippingAddress.houseAddress,
        shippingAddress.roadNumber || null
      ]);
    }

    // Return the updated address with proper field mapping
    const updatedAddressQuery = 'SELECT * FROM shipping_addresses WHERE user_id = ? AND is_default = 1';
    const updatedAddress = await executeQuerySingle(updatedAddressQuery, [id]);

    // Map database fields back to frontend format
    const mappedAddress = updatedAddress ? {
      id: updatedAddress.id,
      userId: updatedAddress.user_id,
      isDefault: updatedAddress.is_default,
      fullName: updatedAddress.full_name,
      phoneNumber: updatedAddress.phone_number,
      country: updatedAddress.country,
      division: updatedAddress.division,
      district: updatedAddress.district,
      upazilla: updatedAddress.upazilla, // Use upazilla directly
      houseAddress: updatedAddress.house_address,
      roadNumber: updatedAddress.road_number,
      createdAt: updatedAddress.created_at
    } : null;

    return NextResponse.json({
      success: true,
      address: mappedAddress
    });

  } catch (error) {
    console.error('Error updating shipping address:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping address' },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/shipping-address - Get user's default shipping address
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

    // Get default shipping address
    const addressQuery = 'SELECT * FROM shipping_addresses WHERE user_id = ? AND is_default = 1';
    const address = await executeQuerySingle(addressQuery, [id]);

    // Map database fields back to frontend format
    const mappedAddress = address ? {
      id: address.id,
      userId: address.user_id,
      isDefault: address.is_default,
      fullName: address.full_name,
      phoneNumber: address.phone_number,
      country: address.country,
      division: address.division,
      district: address.district,
      upazilla: address.upazilla, // Use upazilla directly
      houseAddress: address.house_address,
      roadNumber: address.road_number,
      createdAt: address.created_at
    } : null;

    return NextResponse.json({
      address: mappedAddress
    });

  } catch (error) {
    console.error('Error fetching shipping address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping address' },
      { status: 500 }
    );
  }
} 