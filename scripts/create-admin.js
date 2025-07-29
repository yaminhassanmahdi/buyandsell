const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell'
};

async function createAdminUser() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Admin user details
    const adminEmail = 'admin@2ndhandbajar.com';
    const adminPassword = 'yamin123';
    const adminName = 'Admin User';
    const adminPhone = '01999999999';
    const adminId = 'admin_main';

    // Check if admin already exists by email or phone
    const [existingByEmail] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );
    
    const [existingByPhone] = await connection.execute(
      'SELECT id, email FROM users WHERE phone_number = ?',
      [adminPhone]
    );

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingByEmail.length > 0) {
      console.log('Admin user with this email already exists, updating...');
      
      // Update existing admin by email
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_admin = true, name = ?, phone_number = ? WHERE email = ?',
        [hashedPassword, adminName, adminPhone, adminEmail]
      );
      
      console.log('Admin user updated successfully!');
    } else if (existingByPhone.length > 0) {
      console.log('User with this phone number exists, converting to admin...');
      
      // Update existing user to admin
      await connection.execute(
        'UPDATE users SET password_hash = ?, is_admin = true, name = ?, email = ? WHERE phone_number = ?',
        [hashedPassword, adminName, adminEmail, adminPhone]
      );
      
      console.log('User converted to admin successfully!');
    } else {
      console.log('Creating new admin user...');
      
      // Insert new admin user
      await connection.execute(
        'INSERT INTO users (id, name, email, phone_number, password_hash, is_admin) VALUES (?, ?, ?, ?, ?, true)',
        [adminId, adminName, adminEmail, adminPhone, hashedPassword]
      );
      
      console.log('Admin user created successfully!');
    }

    console.log('Admin Login Details:');
    console.log('Email: admin@2ndhandbajar.com');
    console.log('Password: yamin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser(); 