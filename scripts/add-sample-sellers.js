const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleSellers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trustbuysell'
  });

  try {
    console.log('Adding sample sellers...');

    const sellers = [
      {
        id: 'seller-1',
        name: 'Ahmed Electronics',
        email: 'ahmed@electronics.com',
        phoneNumber: '+8801712345678',
        isAdmin: false
      },
      {
        id: 'seller-2', 
        name: 'Fatima Fashion',
        email: 'fatima@fashion.com',
        phoneNumber: '+8801812345678',
        isAdmin: false
      },
      {
        id: 'seller-3',
        name: 'Karim Books',
        email: 'karim@books.com', 
        phoneNumber: '+8801912345678',
        isAdmin: false
      },
      {
        id: 'seller-4',
        name: 'Nadia Home & Garden',
        email: 'nadia@home.com',
        phoneNumber: '+8801612345678',
        isAdmin: false
      },
      {
        id: 'seller-5',
        name: 'Rahim Sports',
        email: 'rahim@sports.com',
        phoneNumber: '+8801512345678',
        isAdmin: false
      }
    ];

    for (const seller of sellers) {
      // Check if seller already exists
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [seller.id]
      );

      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO users (id, name, email, phone_number, is_admin, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [seller.id, seller.name, seller.email, seller.phoneNumber, seller.isAdmin]
        );
        console.log(`Added seller: ${seller.name}`);
      } else {
        console.log(`Seller already exists: ${seller.name}`);
      }
    }

    // Update existing products to assign them to sellers
    const [products] = await connection.execute('SELECT id FROM products LIMIT 20');
    
    for (let i = 0; i < products.length; i++) {
      const sellerIndex = i % sellers.length;
      const sellerId = sellers[sellerIndex].id;
      
      await connection.execute(
        'UPDATE products SET seller_id = ? WHERE id = ?',
        [sellerId, products[i].id]
      );
    }

    console.log('Updated products with seller assignments');

    console.log('Sample sellers added successfully!');
  } catch (error) {
    console.error('Error adding sample sellers:', error);
  } finally {
    await connection.end();
  }
}

addSampleSellers();
