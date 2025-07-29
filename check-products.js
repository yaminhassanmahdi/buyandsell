const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell'
};

async function checkProducts() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking all products...');
    
    // Check all products
    const productsQuery = `
      SELECT id, name, price, seller_id, status, created_at 
      FROM products 
      ORDER BY created_at DESC
    `;
    const products = await connection.execute(productsQuery);
    console.log('📋 All Products:');
    console.table(products[0]);
    
    // Check product count by status
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM products 
      GROUP BY status
    `;
    const statusCounts = await connection.execute(statusQuery);
    console.log('\n📊 Products by Status:');
    console.table(statusCounts[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkProducts();
