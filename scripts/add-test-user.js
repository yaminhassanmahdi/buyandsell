const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell',
  multipleStatements: true
};

async function addTestUser() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 12);

    // Add a test user with shipping address in same upazilla as seller
    const testUser = {
      id: 'testuser1',
      name: 'Test Buyer',
      email: 'testbuyer@example.com',
      phone_number: '01700000000',
      password_hash: passwordHash,
      is_admin: false,
      google_email: null
    };

    // Insert user
    await connection.execute(
      'INSERT IGNORE INTO users (id, name, email, phone_number, password_hash, is_admin, google_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [testUser.id, testUser.name, testUser.email, testUser.phone_number, testUser.password_hash, testUser.is_admin, testUser.google_email]
    );

    // Add shipping address for test user (same upazilla as seller)
    const shippingAddress = {
      user_id: testUser.id,
      is_default: true,
      full_name: 'Test Buyer',
      phone_number: '01700000000',
      country: 'Bangladesh',
      division: 'Dhaka',
      district: 'Dhaka',
      upazilla: 'Dhanmondi', // Same as seller
      house_address: '456 Test Street, Apartment 2A',
      road_number: 'Road 28'
    };

    await connection.execute(
      'INSERT IGNORE INTO shipping_addresses (user_id, is_default, full_name, phone_number, country, division, district, upazilla, house_address, road_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [shippingAddress.user_id, shippingAddress.is_default, shippingAddress.full_name, shippingAddress.phone_number, shippingAddress.country, shippingAddress.division, shippingAddress.district, shippingAddress.upazilla, shippingAddress.house_address, shippingAddress.road_number]
    );

    console.log('Test user added successfully');
    console.log('User ID: testuser1');
    console.log('Email: testbuyer@example.com');
    console.log('Phone: 01700000000');
    console.log('Password: password123');
    console.log('Shipping Address: Dhanmondi, Dhaka (same as seller)');

  } catch (error) {
    console.error('Error adding test user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addTestUser(); 