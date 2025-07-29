import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery, executeQuerySingle } from '@/lib/db';
import { generateUserId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phoneNumber, password } = body;

    if (!name || !phoneNumber || !password) {
      return NextResponse.json({ error: 'Name, phone number, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await executeQuerySingle(
      'SELECT id FROM users WHERE email = ? OR phone_number = ?',
      [email || '', phoneNumber]
    );

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email or phone number' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user-friendly user ID based on name
    let userId = generateUserId(name);
    let counter = 1;
    
    // Ensure the ID is unique
    while (true) {
      const existingUserId = await executeQuerySingle(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );
      
      if (!existingUserId) {
        break; // ID is unique
      }
      
      // Try with a number suffix
      const baseId = generateUserId(name);
      userId = `${baseId}${counter}`;
      counter++;
    }

    // Insert new user
    const insertQuery = `
      INSERT INTO users (id, name, email, phone_number, password_hash, is_admin)
      VALUES (?, ?, ?, ?, ?, false)
    `;
    
    await executeQuery(insertQuery, [userId, name, email || null, phoneNumber, hashedPassword]);

    // Return user data (excluding password hash)
    const userData = {
      id: userId,
      name,
      email: email || null,
      phoneNumber,
      isAdmin: false,
      googleEmail: null,
      defaultShippingAddress: null,
      withdrawalMethods: []
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 