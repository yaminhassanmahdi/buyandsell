const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'trustbuysell'
};

async function testOrderDebug() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking recent orders and order items...');
    
    // Check recent orders
    const ordersQuery = `
      SELECT id, user_id, total_amount, status, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    const orders = await connection.execute(ordersQuery);
    console.log('📋 Recent Orders:');
    console.table(orders[0]);
    
    // Check order items for each order
    for (const order of orders[0]) {
      console.log(`\n📦 Order Items for Order ${order.id}:`);
      const itemsQuery = `
        SELECT oi.*, p.name as product_name, u.name as seller_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN users u ON oi.seller_id = u.id
        WHERE oi.order_id = ?
      `;
      const items = await connection.execute(itemsQuery, [order.id]);
      console.table(items[0]);
    }
    
    // Check if there are any products available
    console.log('\n🛍️ Available Products:');
    const productsQuery = `
      SELECT id, name, price, seller_id, status 
      FROM products 
      WHERE status = 'approved' 
      LIMIT 5
    `;
    const products = await connection.execute(productsQuery);
    console.table(products[0]);
    
    // Check users
    console.log('\n👥 Users:');
    const usersQuery = `
      SELECT id, name, email, phone_number 
      FROM users 
      LIMIT 5
    `;
    const users = await connection.execute(usersQuery);
    console.table(users[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testOrderDebug();
